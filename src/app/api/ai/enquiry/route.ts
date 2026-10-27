import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    const q = query.toLowerCase();

    // Query ward or ticket data if relevant
    const wards = await prisma.ward.findMany();

    let answer = '';
    let category = 'GENERAL_ENQUIRY';
    let suggestedLinks: { label: string; href: string }[] = [];

    // 1. Potholes / Roads
    if (q.includes('pothole') || q.includes('road') || q.includes('asphalt') || q.includes('crater')) {
      category = 'PUBLIC_WORKS';
      answer = `Under the Goa Right to Public Services Act 2013 and PWD Division XIV (Ponda Roads), major potholes and hazardous asphalt craters must be barricaded within 4 hours and permanently bitumen-compacted within 48 to 72 hours. 
If work is delayed beyond the statutory SLA without a documented natural calamity reason, citizens are entitled to ₹250/day penalty compensation deducted from the designated engineer's salary.`;
      suggestedLinks = [
        { label: '+ Report Road Pothole', href: '/report' },
        { label: 'View Road Work Orders', href: '/#public-ledger' },
      ];
    }
    // 2. Water supply / pipeline leak
    else if (q.includes('water') || q.includes('pipe') || q.includes('leak') || q.includes('burst') || q.includes('khandepar')) {
      category = 'WATER_SUPPLY';
      answer = `Water pipeline repairs are handled by PWD Division III (Khandepar Water Works). Minor leaks must be repaired within 24 hours. Major pipeline ruptures require emergency containment within 8 hours. 
If supply interruption exceeds 12 hours, Ponda Municipal Council mandates free potable water tanker deployment to affected residential areas.`;
      suggestedLinks = [
        { label: '+ Report Water Leak', href: '/report' },
        { label: 'Ward 3 (Curti) Contacts', href: '/#ward-directory' },
      ];
    }
    // 3. Streetlights / Electricity
    else if (q.includes('street light') || q.includes('light') || q.includes('lamp') || q.includes('dark') || q.includes('electricity')) {
      category = 'STREET_LIGHTING';
      answer = `Streetlight luminaire failures are managed by the Goa Electricity Department (Ponda Sub-Station). Non-functional streetlights must be restored within 24 to 48 hours. Exposed live wires or short circuits require emergency isolation within 2 hours.`;
      suggestedLinks = [
        { label: '+ Report Streetlight Outage', href: '/report' },
      ];
    }
    // 4. Sanitation / Garbage
    else if (q.includes('garbage') || q.includes('waste') || q.includes('trash') || q.includes('dump') || q.includes('smell')) {
      category = 'SANITATION';
      answer = `Under the Ponda Municipal Council Solid Waste Bye-Laws & Clean Goa Mission, commercial market waste dumps and unattended residential blackspots require mandatory clearance within 24 hours of filing a complaint.`;
      suggestedLinks = [
        { label: '+ Report Garbage Dump', href: '/report' },
      ];
    }
    // 5. Citizen Rights / Compensation / Charter
    else if (q.includes('right') || q.includes('compensation') || q.includes('penalty') || q.includes('act') || q.includes('charter')) {
      category = 'CITIZEN_RIGHTS';
      answer = `As a citizen under the Goa Right to Public Services Act 2013:
1. You have the Right to Time-Bound Service Delivery within fixed SLA deadlines (24-72 hours).
2. You have the Right to Geo-tagged Photo Proof before any ticket is marked resolved.
3. You have the Right to Dispute substandard work; cases are automatically escalated to the Chief Officer.
4. You have the Right to Financial Compensation (₹250/day) if public delivery is unlawfully delayed.`;
      suggestedLinks = [
        { label: 'Read Citizen Charter', href: '/#citizens-rights' },
        { label: 'Public Audit Ledger', href: '/#public-ledger' },
      ];
    }
    // 6. Ward Officers & Contacts
    else if (q.includes('officer') || q.includes('contact') || q.includes('phone') || q.includes('ward') || q.includes('engineer')) {
      category = 'OFFICIAL_DIRECTORY';
      const wardInfo = wards.map(w => `• ${w.name} (${w.code}): Nodal Officer ${w.officerName}, Phone: ${w.officerPhone}`).join('\n');
      answer = `Here are the official Ward Nodal Officers for Ponda Municipal Council:\n${wardInfo}\n\nFor 24x7 municipal emergency dispatch, dial Toll-Free 1913.`;
      suggestedLinks = [
        { label: 'Ward Directory & Map', href: '/#ward-directory' },
      ];
    }
    // 7. Check ticket status
    else if (q.includes('status') || q.includes('track') || q.includes('ctn-') || q.includes('cvl-') || q.includes('ticket') || q.includes('case')) {
      category = 'TRACKING';
      answer = `To check the real-time status of your complaint, you can search your CityNova Case ID (e.g. CTN-2026-W01-6143) on the homepage search bar or visit the public docket directly. Every docket displays live GPS coordinates, assigned engineer name, and 'Before & After' photo proof.`;
      suggestedLinks = [
        { label: 'Search Grievance Ledger', href: '/#public-ledger' },
      ];
    }
    // 8. General fallback
    else {
      answer = `Hello! I am your CityNova AI Civic Copilot for Ponda Municipal Council (PMC), Goa. 
I can assist you with:
• Reporting potholes, water leaks, streetlights, or waste dumps.
• Knowing your legal rights under the Goa Right to Public Services Act 2013.
• Finding phone numbers and emails for your Ward Nodal Officers.
• Checking statutory time limits (SLA) for civic repairs.
How may I help your neighborhood today?`;
      suggestedLinks = [
        { label: '+ Report Civic Issue', href: '/report' },
        { label: 'View Interactive Map', href: '/#city-map' },
        { label: 'Citizen Rights & SLA Charter', href: '/#citizens-rights' },
      ];
    }

    return NextResponse.json({
      success: true,
      category,
      answer,
      suggestedLinks,
    });
  } catch (err: any) {
    console.error('AI Enquiry API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
