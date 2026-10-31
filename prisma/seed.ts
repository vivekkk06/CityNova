import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ponda = await prisma.city.upsert({
    where: { normalizedKey: 'ponda,goa,india' },
    update: { name: 'Ponda', state: 'Goa', centerLat: 15.4026, centerLng: 74.0151 },
    create: { name: 'Ponda', state: 'Goa', normalizedKey: 'ponda,goa,india', centerLat: 15.4026, centerLng: 74.0151 },
  });

  await prisma.ticket.deleteMany({});
  const now = new Date();
  const year = now.getFullYear();
  const sampleReports = [
    {
      caseId: `CTN-${year}-100101`, title: 'Water pipeline leak near Curti Junction',
      description: 'Water is leaking from a damaged roadside pipe near Curti Junction.', category: 'Water Leakage / Pipe Burst',
      urgency: 'HIGH', status: 'IN_PROGRESS', latitude: 15.414, longitude: 74.024,
      addressDescription: 'Near Curti Junction, Ponda', citizenName: 'Sample Resident', citizenPhone: '+919800000001',
      initialPhotoUrl: null,
    },
    {
      caseId: `CTN-${year}-100102`, title: 'Streetlight outage near the hospital road',
      description: 'Several streetlights are not working along the road near the hospital.', category: 'Streetlight Outage',
      urgency: 'MEDIUM', status: 'OPEN', latitude: 15.408, longitude: 74.018,
      addressDescription: 'Hospital access road, Ponda', citizenName: 'Sample Resident', citizenPhone: '+919800000002',
      initialPhotoUrl: null,
    },
    {
      caseId: `CTN-${year}-100103`, title: 'Road surface damage near the old bus stand',
      description: 'A pothole has formed in the road near the old bus stand.', category: 'Pothole & Road Damage',
      urgency: 'HIGH', status: 'RESOLVED', latitude: 15.4025, longitude: 74.0135,
      addressDescription: 'Near the old bus stand, Ponda', citizenName: 'Sample Resident', citizenPhone: '+919800000003',
      initialPhotoUrl: null,
    },
    {
      caseId: `CTN-${year}-100104`, title: 'Waste left beside the market entrance',
      description: 'Household and packaging waste has accumulated beside the market entrance.', category: 'Garbage & Waste Accumulation',
      urgency: 'MEDIUM', status: 'OPEN', latitude: 15.401, longitude: 74.014,
      addressDescription: 'Near the market entrance, Ponda', citizenName: 'Sample Resident', citizenPhone: '+919800000004',
      initialPhotoUrl: null,
    },
  ];

  for (const [index, report] of sampleReports.entries()) {
    const createdAt = new Date(now.getTime() - index * 60 * 60 * 1000);
    await prisma.ticket.create({
      data: {
        ...report,
        cityId: ponda.id,
        description: report.description,
        plainLanguageRights: 'Status updates are provided by the CityNova reporting workflow.',
        publicCommitmentDate: createdAt,
        slaDeadline: new Date(createdAt.getTime() + (report.urgency === 'HIGH' ? 24 : 72) * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seeded sample Ponda reports without ward or officer data.');
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
