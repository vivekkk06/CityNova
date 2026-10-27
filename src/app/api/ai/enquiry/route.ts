import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { query, language } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    const q = query.toLowerCase();
    const isKok = language === 'kok' || q.includes('कोंकणी') || q.includes('गोंय') || q.includes('खड्डो') || q.includes('उदक');
    const isHi = language === 'hi' || q.includes('हिंदी') || q.includes('गड्ढा') || q.includes('पानी') || q.includes('सड़क') || q.includes('अधिकारी');

    // Query ward or ticket data if relevant
    const wards = await prisma.ward.findMany();

    let answer = '';
    let category = 'GENERAL_ENQUIRY';
    let suggestedLinks: { label: string; href: string }[] = [];

    // 1. Potholes / Roads
    if (q.includes('pothole') || q.includes('road') || q.includes('asphalt') || q.includes('crater') || q.includes('गड्ढा') || q.includes('सड़क') || q.includes('खड्डो') || q.includes('रस्तो')) {
      category = 'PUBLIC_WORKS';
      if (isKok) {
        answer = `गोंय लोकसेवा हक्क कायदो २०१३ आनी पी.डब्ल्यू.डी. विभाग १४ प्रमाण रस्त्यावयले व्हड खड्डे ४ वरां भितर बंद करप आनी ४८ ते ७२ वरां भितर डांबरीकरण करून नीट करप सक्तीचें आसा. जर काम वेळेर जालें ना जाल्यार नागरीकांक दर दिसाक ₹२५० भरपाय मेळपाचो कायदेशीर हक्क आसा.`;
        suggestedLinks = [
          { label: '+ रस्त्यावयलो खड्डो नोंदवा', href: '/report' },
          { label: 'कामाची वही पळयात', href: '/#public-ledger' },
        ];
      } else if (isHi) {
        answer = `गोवा लोक सेवा अधिकार अधिनियम २०१३ एवं लोक निर्माण विभाग (PWD डिवीज़न XIV) के तहत, सड़कों के खतरनाक गड्ढे ४ घंटे के भीतर बैरिकेड किए जाने चाहिए और ४८ से ७२ घंटों में स्थायी रूप से भरे जाने अनिवार्य हैं। समय सीमा का उल्लंघन होने पर नागरिक को ₹२५० प्रति दिन का हर्ज़ाना पाने का कानूनी अधिकार है।`;
        suggestedLinks = [
          { label: '+ सड़क के गड्ढे की शिकायत करें', href: '/report' },
          { label: 'दफ्तर वही देखें', href: '/#public-ledger' },
        ];
      } else {
        answer = `Under the Goa Right to Public Services Act 2013 and PWD Division XIV (Ponda Roads), major potholes and hazardous asphalt craters must be barricaded within 4 hours and permanently bitumen-compacted within 48 to 72 hours. 
If work is delayed beyond the statutory SLA without a documented natural calamity reason, citizens are entitled to ₹250/day penalty compensation deducted from the designated engineer's salary.`;
        suggestedLinks = [
          { label: '+ Report Road Pothole', href: '/report' },
          { label: 'View Road Work Orders', href: '/#public-ledger' },
        ];
      }
    }
    // 2. Water supply / pipeline leak
    else if (q.includes('water') || q.includes('pipe') || q.includes('leak') || q.includes('burst') || q.includes('khandepar') || q.includes('पानी') || q.includes('उदक') || q.includes('पाईप')) {
      category = 'WATER_SUPPLY';
      if (isKok) {
        answer = `उदकाच्यो नळ्यो दुरुस्ती पी.डब्ल्यू.डी. विभाग ३ (खांडेपार वॉटर वर्क्स) कडसून जाता. ल्हान गळती २४ वरां भितर आनी व्हड पाईप फुटप ८ वरां भितर तात्काळ थांबोवंक जाय. उदक १२ वरां परस चड वेळ बंद आसल्यार फुकट टँकर धाडप बंधनकारक आसा.`;
        suggestedLinks = [
          { label: '+ उदकाची गळती नोंदवा', href: '/report' },
          { label: 'वॉर्ड संपर्क वळेरी', href: '/#ward-directory' },
        ];
      } else if (isHi) {
        answer = `पेयजल पाइपलाइन की मरम्मत लोक निर्माण विभाग (PWD Khandepar Water Works) द्वारा की जाती है। छोटे रिसाव २४ घंटों में और बड़े पाइप फटने पर ८ घंटों में आपातकालीन नियंत्रण अनिवार्य है। यदि आपूर्ति १२ घंटे से अधिक बाधित रहे तो निःशुल्क पानी टैंकर भेजना अनिवार्य है।`;
        suggestedLinks = [
          { label: '+ पानी पाइप रिसाव दर्ज करें', href: '/report' },
          { label: 'वार्ड संपर्क सूची', href: '/#ward-directory' },
        ];
      } else {
        answer = `Water pipeline repairs are handled by PWD Division III (Khandepar Water Works). Minor leaks must be repaired within 24 hours. Major pipeline ruptures require emergency containment within 8 hours. 
If supply interruption exceeds 12 hours, Ponda Municipal Council mandates free potable water tanker deployment to affected residential areas.`;
        suggestedLinks = [
          { label: '+ Report Water Leak', href: '/report' },
          { label: 'Ward 3 (Curti) Contacts', href: '/#ward-directory' },
        ];
      }
    }
    // 3. Streetlights / Electricity
    else if (q.includes('street light') || q.includes('light') || q.includes('lamp') || q.includes('dark') || q.includes('electricity') || q.includes('बत्ती') || q.includes('लाइट') || q.includes('दिवे')) {
      category = 'STREET_LIGHTING';
      if (isKok) {
        answer = `रस्त्यावयले बंद दिवे २४ ते ४८ वरां भितर सुरू करप कायदेशीर आसा. उकत्यो विजेच्यो वायो आसल्यार २ वरां भितर बंद करप बंधनकारक आसा.`;
        suggestedLinks = [
          { label: '+ बंद दिवो नोंदवा', href: '/report' },
        ];
      } else if (isHi) {
        answer = `स्ट्रीटलाइट की खराबी गोवा विद्युत विभाग द्वारा २४ से ४८ घंटों में ठीक की जानी चाहिए। खुले तार या शॉर्ट सर्किट की स्थिति में २ घंटे में सुरक्षा घेरा बनाना अनिवार्य है।`;
        suggestedLinks = [
          { label: '+ स्ट्रीटलाइट खराबी दर्ज करें', href: '/report' },
        ];
      } else {
        answer = `Streetlight luminaire failures are managed by the Goa Electricity Department (Ponda Sub-Station). Non-functional streetlights must be restored within 24 to 48 hours. Exposed live wires or short circuits require emergency isolation within 2 hours.`;
        suggestedLinks = [
          { label: '+ Report Streetlight Outage', href: '/report' },
        ];
      }
    }
    // 4. Sanitation / Garbage
    else if (q.includes('garbage') || q.includes('waste') || q.includes('trash') || q.includes('dump') || q.includes('smell') || q.includes('कचरा') || q.includes('घाण') || q.includes('कचरो')) {
      category = 'SANITATION';
      if (isKok) {
        answer = `पोंडा नगरपालिका मंडळ कचरो नियंत्रण नेम प्रमाण तक्रार नोंदविल्या उपरांत २४ वरां भितर कचरो उखलप सक्तीचें आसा.`;
        suggestedLinks = [
          { label: '+ कचरो नोंदवा', href: '/report' },
        ];
      } else if (isHi) {
        answer = `पोंडा नगर पालिका परिषद ठोस अपशिष्ट उपनियम एवं स्वच्छ भारत मिशन के तहत, शिकायत दर्ज होने के २४ घंटे के भीतर कचरा हटाना अनिवार्य है।`;
        suggestedLinks = [
          { label: '+ कचरे का ढेर दर्ज करें', href: '/report' },
        ];
      } else {
        answer = `Under the Ponda Municipal Council Solid Waste Bye-Laws & Clean Goa Mission, commercial market waste dumps and unattended residential blackspots require mandatory clearance within 24 hours of filing a complaint.`;
        suggestedLinks = [
          { label: '+ Report Garbage Dump', href: '/report' },
        ];
      }
    }
    // 5. Citizen Rights / Compensation / Charter
    else if (q.includes('right') || q.includes('compensation') || q.includes('penalty') || q.includes('act') || q.includes('charter') || q.includes('हक्क') || q.includes('अधिकार') || q.includes('हर्जाना')) {
      category = 'CITIZEN_RIGHTS';
      if (isKok) {
        answer = `गोंय लोकसेवा हक्क कायदो २०१३ प्रमाण नागरीकांचे हक्क:
१. निश्चित वेळेत (२४ ते ७२ वरां) कामाची हमी.
२. प्रत्यक्ष जीपीएस फोटो पुरावो पळोवपाचो हक्क.
३. कामाचेर असमाधान आसल्यार फेर-तपासणीची मागणी.
४. वेळ चुकोवपी अधिकाऱ्या कडसून दर दिसाक ₹२५० भरपाय.`;
        suggestedLinks = [
          { label: 'नागरीक हक्क सनद', href: '/#citizens-rights' },
          { label: 'दफ्तर वही', href: '/#public-ledger' },
        ];
      } else if (isHi) {
        answer = `गोवा लोक सेवा अधिकार अधिनियम २०१३ के तहत आपके अधिकार:
१. निर्धारित समय-सीमा (२४-७२ घंटे) में कार्य पूर्ण करने की कानूनी गारंटी।
२. कार्य समाप्ति से पूर्व जीपीएस फोटो प्रमाण देखने का अधिकार।
३. असंतोषजनक कार्य पर पुनः अपील करने का अधिकार।
४. विलंब होने पर ₹२५० प्रति दिन की क्षतिपूर्ति का अधिकार।`;
        suggestedLinks = [
          { label: 'नागरिक अधिकार चार्टर', href: '/#citizens-rights' },
          { label: 'सार्वजनिक लेजर', href: '/#public-ledger' },
        ];
      } else {
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
    }
    // 6. Ward Officers & Contacts
    else if (q.includes('officer') || q.includes('contact') || q.includes('phone') || q.includes('ward') || q.includes('engineer') || q.includes('अधिकारी') || q.includes('नंबर') || q.includes('फोन')) {
      category = 'OFFICIAL_DIRECTORY';
      const wardInfo = wards.map(w => `• ${w.name} (${w.code}): ${w.officerName}, Phone: ${w.officerPhone}`).join('\n');
      answer = `Here are the official Ward Nodal Officers for Ponda Municipal Council:\n${wardInfo}\n\nFor 24x7 municipal emergency dispatch, dial Toll-Free 1913.`;
      suggestedLinks = [
        { label: 'Ward Directory & Map', href: '/#ward-directory' },
      ];
    }
    // 7. Check ticket status
    else if (q.includes('status') || q.includes('track') || q.includes('ctn-') || q.includes('cvl-') || q.includes('ticket') || q.includes('case') || q.includes('स्थिति') || q.includes('तक्रार')) {
      category = 'TRACKING';
      answer = `To check the real-time status of your complaint, search your CityNova Case ID (e.g. CTN-2026-W01-6143) on the homepage search bar or visit the public docket directly. Every docket displays live GPS coordinates, assigned engineer name, and 'Before & After' photo proof.`;
      suggestedLinks = [
        { label: 'Search Grievance Ledger', href: '/#public-ledger' },
      ];
    }
    // 8. General fallback
    else {
      if (isKok) {
        answer = `नमस्कार! हांव सिटीनोव्हा एआय नागरीक सहाय्यक पोंडा नगरपालिका मंडळ, गोंय.
हांव तुमकां हे बाबतींत मदत करूंक शकतां:
• रस्त्यावयले खड्डे, उदकाची गळती, बंद दिवे वा कचरो नोंदवप.
• गोंय लोकसेवा हक्क कायदो २०१३ प्रमाण तुमचे कायदेशीर हक्क.
• वॉर्ड प्रभारी अधिकाऱ्यांचे संपर्क नंबर आनी ईमेल.
• कोणत्याही समस्येचे निराकरण तपासप.
आमी तुमकां कशी मदत करूंक शकतात?`;
        suggestedLinks = [
          { label: '+ समस्या नोंदवा', href: '/report' },
          { label: 'गूगल व जीआयएस नकाशो', href: '/#city-map' },
          { label: 'नागरीक हक्क कायदो', href: '/#citizens-rights' },
        ];
      } else if (isHi) {
        answer = `नमस्कार! मैं आपका सिटीनोवा एआई जन सहायक हूँ (पोंडा नगर पालिका परिषद, गोवा)।
मैं आपकी निम्न विषयों में सहायता कर सकता हूँ:
• सड़क के गड्ढे, पेयजल रिसाव, स्ट्रीटलाइट अथवा कचरे की शिकायत दर्ज करना।
• गोवा लोक सेवा अधिकार अधिनियम २०१३ के अंतर्गत आपके कानूनी अधिकार।
• आपके वार्ड के नोडल अधिकारियों के फोन नंबर एवं संपर्क विवरण।
• दर्ज शिकायत की स्थिति एवं समय-सीमा की जांच।
आज मैं आपकी क्या सहायता कर सकता हूँ?`;
        suggestedLinks = [
          { label: '+ नई समस्या दर्ज करें', href: '/report' },
          { label: 'मानचित्र एवं गूगल मैप्स', href: '/#city-map' },
          { label: 'नागरिक अधिकार चार्टर', href: '/#citizens-rights' },
        ];
      } else {
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
