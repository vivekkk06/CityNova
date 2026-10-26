import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real GeoJSON Polygons for Ponda Municipal Council (PMC), Goa, India
// Center approx: Lat 15.4026 N, Lng 74.0151 E
const WARD_01_UPPER_BAZAR_BOUNDARIES = JSON.stringify({
  type: "Polygon",
  coordinates: [[
    [74.0100, 15.3980],
    [74.0170, 15.3980],
    [74.0170, 15.4060],
    [74.0100, 15.4060],
    [74.0100, 15.3980]
  ]]
});

const WARD_02_TISK_KHADPABANDH_BOUNDARIES = JSON.stringify({
  type: "Polygon",
  coordinates: [[
    [74.0140, 15.4050],
    [74.0220, 15.4050],
    [74.0220, 15.4120],
    [74.0140, 15.4120],
    [74.0140, 15.4050]
  ]]
});

const WARD_03_CURTI_KHANDEPAR_BOUNDARIES = JSON.stringify({
  type: "Polygon",
  coordinates: [[
    [74.0200, 15.4100],
    [74.0300, 15.4100],
    [74.0300, 15.4200],
    [74.0200, 15.4200],
    [74.0200, 15.4100]
  ]]
});

async function main() {
  console.log("🌱 Cleaning existing database records...");
  await prisma.auditLog.deleteMany({});
  await prisma.observation.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.ward.deleteMany({});

  console.log("🏛️  Seeding Ponda Municipal Council (PMC), Goa Wards...");
  const ward1 = await prisma.ward.create({
    data: {
      code: "WARD-01",
      name: "Ward 1 - Upper Bazar & Sadar Heritage",
      zone: "Central Heritage & Market Core",
      boundariesGeoJson: WARD_01_UPPER_BAZAR_BOUNDARIES,
      centerLat: 15.4025,
      centerLng: 74.0135,
      officerName: "Er. Pradeep Naik (Chief Officer)",
      officerPhone: "+91-832-2312148",
      officerEmail: "chief.officer@pmcgoa.gov.in",
      emergencyContact: "0832-2312148",
    }
  });

  const ward2 = await prisma.ward.create({
    data: {
      code: "WARD-02",
      name: "Ward 2 - Khadpabandh & Tisk Urban Corridor",
      zone: "Commercial & Healthcare Corridor",
      boundariesGeoJson: WARD_02_TISK_KHADPABANDH_BOUNDARIES,
      centerLat: 15.4080,
      centerLng: 74.0180,
      officerName: "Er. Shruti Kamat (Executive Engineer)",
      officerPhone: "+91-94220-61234",
      officerEmail: "tisk.engineer@pmcgoa.gov.in",
      emergencyContact: "0832-2313025",
    }
  });

  const ward3 = await prisma.ward.create({
    data: {
      code: "WARD-03",
      name: "Ward 3 - Curti & Khandepar Riverfront Belt",
      zone: "Water Works & Industrial Outer Ring",
      boundariesGeoJson: WARD_03_CURTI_KHANDEPAR_BOUNDARIES,
      centerLat: 15.4140,
      centerLng: 74.0245,
      officerName: "Er. Nilesh Gaonkar (Zonal Works Officer)",
      officerPhone: "+91-94220-78901",
      officerEmail: "curti.officer@pmcgoa.gov.in",
      emergencyContact: "0832-2314567",
    }
  });

  console.log("🛠️  Seeding Goan Municipal & PWD Departments...");
  const sanitation = await prisma.department.create({
    data: {
      code: "SANITATION",
      name: "PMC Solid Waste Management Cell",
      description: "Door-to-door waste segregation, wet/dry collection, market dump cleanups, Clean Goa Mission enforcement.",
      slaHoursNormal: 24,
      slaHoursUrgent: 8,
      icon: "trash-2",
    }
  });

  const publicWorks = await prisma.department.create({
    data: {
      code: "PUBLIC_WORKS",
      name: "PWD Works Division XIV (Roads & Bridges, Ponda)",
      description: "Monsoon pothole restoration, asphalt mastic laying, stormwater drains, culvert clearing.",
      slaHoursNormal: 48,
      slaHoursUrgent: 16,
      icon: "hard-hat",
    }
  });

  const waterSupply = await prisma.department.create({
    data: {
      code: "WATER_SUPPLY",
      name: "PWD Division III (Khandepar Water Works)",
      description: "Potable feeder pipeline breaches, Khandepar raw intake pumping, tanker emergency dispatch.",
      slaHoursNormal: 24,
      slaHoursUrgent: 6,
      icon: "droplet",
    }
  });

  const streetLighting = await prisma.department.create({
    data: {
      code: "STREET_LIGHTING",
      name: "Goa Electricity Department (Sub-Station Ponda)",
      description: "Streetlight luminaire replacement, dark pedestrian zones, exposed cable hazard isolation.",
      slaHoursNormal: 36,
      slaHoursUrgent: 8,
      icon: "lightbulb",
    }
  });

  console.log("👥 Seeding Users & Field Officers...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Siddhi Naik (Chief Officer, PMC)",
      email: "chief.officer@pmcgoa.gov.in",
      phone: "+91-832-2312148",
      role: "MUNICIPAL_ADMIN",
      badgeNumber: "PMC-ADM-01"
    }
  });

  const fieldWorker1 = await prisma.user.create({
    data: {
      name: "Datta Gaonkar (PWD Rapid Response)",
      email: "datta.field@pmcgoa.gov.in",
      phone: "+91-98230-11223",
      role: "FIELD_STAFF",
      wardId: ward1.id,
      departmentId: publicWorks.id,
      badgeNumber: "FW-PMC-14"
    }
  });

  const citizenUser = await prisma.user.create({
    data: {
      name: "Rohan Borkar",
      email: "rohan.borkar@gmail.com",
      phone: "+91-98221-55667",
      role: "CITIZEN"
    }
  });

  console.log("📋 Seeding Real Ponda Civic Tickets & Promise-to-Proof Ledger...");

  // Ticket 1: Khandepar Main Feeder Pipeline Burst in Curti (Ward 3)
  const ticket1 = await prisma.ticket.create({
    data: {
      caseId: "CVL-2026-W03-0842",
      legacyGrievanceNumber: "PMC-PWD-8921",
      title: "Khandepar main feeder drinking water pipeline rupture near Curti Junction",
      description: "High-pressure 300mm potable feeder line ruptured opposite the Khandepar Water Works access road. Potable water flooding highway lane toward Curti Industrial Estate.",
      category: "Water Leakage / Pipe Burst",
      urgency: "CRITICAL",
      plainLanguageRights: "Under the Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013 & PWD Division III (Khandepar Water Works), major feeder breaches must be isolated within 2 hours and restored within 6 to 8 hours. Ponda Municipal Council mandates free water tanker dispatch if supply is interrupted for >12 hours.",
      status: "IN_PROGRESS",
      latitude: 15.4135,
      longitude: 74.0238,
      addressDescription: "Opposite PWD Khandepar Water Works Gate, Curti, Ponda (Ward 3)",
      wardId: ward3.id,
      departmentId: waterSupply.id,
      citizenName: "Rohan Borkar",
      citizenPhone: "+91-98221-55667",
      assignedOfficerId: fieldWorker1.id,
      assignedOfficerName: "Datta Gaonkar (Khandepar Maintenance Crew)",
      publicCommitmentDate: new Date(Date.now() - 2 * 3600 * 1000),
      slaDeadline: new Date(Date.now() + 6 * 3600 * 1000), // 8h SLA
      initialPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80",
      upvoteCount: 18,
    }
  });

  // Ticket 1 Audit Logs (Provenance tracking)
  await prisma.auditLog.createMany({
    data: [
      {
        ticketId: ticket1.id,
        sourceLabel: "Resident Input",
        action: "TICKET_CREATED",
        actorName: "Rohan Borkar",
        actorRole: "Citizen Resident",
        details: "Incident reported via voice note with live GPS coordinates at Curti junction.",
        timestamp: new Date(Date.now() - 2.2 * 3600 * 1000),
      },
      {
        ticketId: ticket1.id,
        sourceLabel: "AI Structured",
        action: "AI_ANALYSIS_COMPLETED",
        actorName: "CivicLens AI Vision & NLP",
        actorRole: "Automated Governance Agent",
        details: "Classified as PWD Water Supply (Khandepar) / CRITICAL urgency. Geofence polygon matched to Ward 3 (Curti-Khandepar). Goa Public Services Act 2013 statutory SLA attached.",
        timestamp: new Date(Date.now() - 2.1 * 3600 * 1000),
      },
      {
        ticketId: ticket1.id,
        sourceLabel: "Official Update",
        action: "OFFICER_ASSIGNED",
        actorName: "PMC Central Dispatch",
        actorRole: "Municipal Routing",
        details: "Assigned to Datta Gaonkar (Khandepar Maintenance Crew). Sluice valve shut-off team dispatched.",
        timestamp: new Date(Date.now() - 1.8 * 3600 * 1000),
      },
      {
        ticketId: ticket1.id,
        sourceLabel: "Official Update",
        action: "STATUS_UPDATE",
        actorName: "Datta Gaonkar",
        actorRole: "Field Staff",
        details: "Isolation valves gated. Excavator on site clearing trench around broken collar flange.",
        timestamp: new Date(Date.now() - 0.9 * 3600 * 1000),
      }
    ]
  });

  // Ticket 1 Observations
  await prisma.observation.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorName: "Gaurish Priolkar",
        authorRole: "COMMUNITY_VOLUNTEER",
        comment: "Can confirm water supply cut in Curti housing board. PWD tanker has arrived at building 2.",
        observationType: "STATUS_UPDATE",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
      {
        ticketId: ticket1.id,
        authorName: "Sneha Prabhu",
        authorRole: "NEIGHBOR",
        comment: "Traffic from Ponda bypass being diverted through inner road. Excavation in progress.",
        observationType: "ADDITIONAL_PHOTO",
        createdAt: new Date(Date.now() - 0.5 * 3600 * 1000),
      }
    ]
  });

  // Ticket 2: Streetlight Outage near Sub-District Hospital, Khadpabandh (Ward 2) - PROVISIONALLY RESOLVED
  const ticket2 = await prisma.ticket.create({
    data: {
      caseId: "CVL-2026-W02-0419",
      legacyGrievanceNumber: "PMC-ELE-1049",
      title: "High-mast streetlight and 4 pedestrian poles dark on Tisk to Sub-District Hospital road",
      description: "Series of streetlights non-functional starting from Tisk junction toward Ponda Sub-District Hospital. Very dark stretch creates hazards for ambulance arrivals and night visitors.",
      category: "Streetlight Outage",
      urgency: "HIGH",
      plainLanguageRights: "Under Goa Electricity Department Citizen Charter & Ponda Municipal Council standards, illumination on hospital access corridors carries an emergency 24-hour turnaround mandate.",
      status: "PROVISIONALLY_RESOLVED",
      latitude: 15.4078,
      longitude: 74.0182,
      addressDescription: "Tisk to Sub-District Hospital Access Road, Khadpabandh, Ponda (Ward 2)",
      wardId: ward2.id,
      departmentId: streetLighting.id,
      citizenName: "Siddhesh Shirodkar",
      citizenPhone: "+91-98223-88990",
      assignedOfficerId: fieldWorker1.id,
      assignedOfficerName: "Er. Mahesh Parab (Electricity Dept Ponda)",
      publicCommitmentDate: new Date(Date.now() - 16 * 3600 * 1000),
      slaDeadline: new Date(Date.now() + 8 * 3600 * 1000),
      initialPhotoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      resolutionPhotoUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
      resolutionGpsLat: 15.4079,
      resolutionGpsLng: 74.0183,
      resolutionTimestamp: new Date(Date.now() - 1.5 * 3600 * 1000),
      resolutionNotes: "Replaced 4 blown 120W LED fixtures and repaired faulty phase cable near hospital gate. Lux level tested at 140 Lux.",
      upvoteCount: 26,
    }
  });

  await prisma.auditLog.createMany({
    data: [
      {
        ticketId: ticket2.id,
        sourceLabel: "Resident Input",
        action: "TICKET_CREATED",
        actorName: "Siddhesh Shirodkar",
        actorRole: "Citizen Resident",
        details: "Reported darkness hazard on hospital approach road.",
        timestamp: new Date(Date.now() - 16 * 3600 * 1000),
      },
      {
        ticketId: ticket2.id,
        sourceLabel: "Proof-of-Work Submitted",
        action: "PROVISIONAL_RESOLUTION",
        actorName: "Er. Mahesh Parab",
        actorRole: "Field Staff",
        details: "After-photo uploaded with verified on-device GPS match (delta: 6.8m) and timestamp. Two-stage gate opened for citizen verification.",
        timestamp: new Date(Date.now() - 1.5 * 3600 * 1000),
      }
    ]
  });

  // Ticket 3: Pothole & Road Damage on Upper Bazar road (Ward 1) - HISTORICAL CIVIC MEMORY
  const ticket3 = await prisma.ticket.create({
    data: {
      caseId: "CVL-2026-W01-0112",
      legacyGrievanceNumber: "PMC-PWD-4421",
      title: "Deep monsoon pothole crater on Old Bus Stand to Kranti Maidan road",
      description: "Severe pothole crater near Almeida High School turning on Old Bus Stand road. Two-wheelers constantly dodging into oncoming traffic.",
      category: "Pothole & Road Damage",
      urgency: "HIGH",
      plainLanguageRights: "Under the Goa Right to Public Services Act 2013 (PWD Sec 12), arterial road potholes in municipal council limits must be repaired with hot/cold-mix bitumen within 48 hours.",
      status: "RESOLVED",
      latitude: 15.4028,
      longitude: 74.0142,
      addressDescription: "Old Bus Stand to Kranti Maidan Road, Upper Bazar, Ponda (Ward 1)",
      wardId: ward1.id,
      departmentId: publicWorks.id,
      citizenName: "Deepa Sawant",
      citizenPhone: "+91-98224-11224",
      assignedOfficerName: "Datta Gaonkar (PWD Works Div XIV)",
      publicCommitmentDate: new Date(Date.now() - 60 * 3600 * 1000),
      slaDeadline: new Date(Date.now() - 12 * 3600 * 1000),
      initialPhotoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      resolutionPhotoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      resolutionGpsLat: 15.4028,
      resolutionGpsLng: 74.0143,
      resolutionTimestamp: new Date(Date.now() - 20 * 3600 * 1000),
      resolutionNotes: "Trench milled, gravel compacted, and topped with dense mastic asphalt.",
      upvoteCount: 34,
    }
  });

  await prisma.auditLog.createMany({
    data: [
      {
        ticketId: ticket3.id,
        sourceLabel: "Proof-of-Work Submitted",
        action: "PROVISIONAL_RESOLUTION",
        actorName: "Datta Gaonkar",
        actorRole: "Field Staff",
        details: "Asphalt mastic patch laid and compacted. Geo-verified photograph submitted.",
        timestamp: new Date(Date.now() - 20 * 3600 * 1000),
      },
      {
        ticketId: ticket3.id,
        sourceLabel: "Citizen Verified",
        action: "CLOSED",
        actorName: "Deepa Sawant",
        actorRole: "Citizen Resident",
        details: "Resident citizen inspected site and signed off on repair quality. Recorded to permanent Ponda Civic Memory ledger.",
        timestamp: new Date(Date.now() - 14 * 3600 * 1000),
      }
    ]
  });

  // Ticket 4: Commercial Waste Dump behind Upper Bazar Market (Ward 1) - DISPUTED / ESCALATED TO CHIEF OFFICER
  const ticket4 = await prisma.ticket.create({
    data: {
      caseId: "CVL-2026-W01-0951",
      legacyGrievanceNumber: "PMC-SAN-7703",
      title: "Commercial fish and vegetable waste dumped behind Upper Bazar Municipal Market",
      description: "Rotting fish crates and unsegregated vegetable waste dumped in the rear lane behind the municipal market. Severe stench affecting nearby residential apartments.",
      category: "Garbage & Waste Accumulation",
      urgency: "HIGH",
      plainLanguageRights: "Under the Ponda Municipal Council Solid Waste Bye-Laws & Clean Goa Mission, commercial market dumps require complete clearance and daily lime powder disinfection within 24 hours.",
      status: "DISPUTED",
      latitude: 15.4032,
      longitude: 74.0148,
      addressDescription: "Rear Lane of Municipal Market Complex, Sadar, Ponda (Ward 1)",
      wardId: ward1.id,
      departmentId: sanitation.id,
      citizenName: "Venkatesh Shenvi",
      citizenPhone: "+91-98225-33445",
      assignedOfficerName: "Sanjay Tari (PMC Sanitation Inspector)",
      publicCommitmentDate: new Date(Date.now() - 36 * 3600 * 1000),
      slaDeadline: new Date(Date.now() - 12 * 3600 * 1000),
      initialPhotoUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      resolutionPhotoUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
      resolutionGpsLat: 15.4032,
      resolutionGpsLng: 74.0148,
      resolutionTimestamp: new Date(Date.now() - 8 * 3600 * 1000),
      resolutionNotes: "Front bins cleared into compactor truck.",
      disputeReason: "The crew only emptied the front metal bin! The entire back alleyway is still blocked with 150kg of rotting commercial fish crates and liquid leachate.",
      disputePhotoUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      escalatedToSupervisor: true,
      upvoteCount: 22,
    }
  });

  await prisma.auditLog.createMany({
    data: [
      {
        ticketId: ticket4.id,
        sourceLabel: "Proof-of-Work Submitted",
        action: "PROVISIONAL_RESOLUTION",
        actorName: "Sanjay Tari",
        actorRole: "Field Staff",
        details: "Cleaned front bins and submitted completion photo.",
        timestamp: new Date(Date.now() - 8 * 3600 * 1000),
      },
      {
        ticketId: ticket4.id,
        sourceLabel: "Citizen Disputed",
        action: "DISPUTED",
        actorName: "Venkatesh Shenvi",
        actorRole: "Citizen Resident",
        details: "Citizen rejected resolution claim: Inner alleyway remained clogged with fish crates. Escalated automatically to Chief Officer Dr. Siddhi Naik (PMC).",
        timestamp: new Date(Date.now() - 4 * 3600 * 1000),
      }
    ]
  });

  console.log("✅ Seed completed successfully! Ponda Municipal Council (PMC), Goa is live on CivicLens.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
