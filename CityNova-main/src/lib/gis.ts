import { prisma } from './prisma';

/**
 * Calculates Great-Circle distance between two coordinates in meters using Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Spatial Deduplication:
 * Checks for any existing OPEN or IN_PROGRESS tickets in the same category within 50 meters.
 */
export async function findDuplicateTicketsNearby(
  lat: number,
  lng: number,
  category: string,
  thresholdMeters: number = 50,
  cityId?: string,
) {
  const openTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      category: category,
      ...(cityId ? { cityId } : {}),
    },
  });

  const matchingTickets = [];

  for (const ticket of openTickets) {
    const distance = calculateHaversineDistanceMeters(lat, lng, ticket.latitude, ticket.longitude);
    if (distance <= thresholdMeters) {
      matchingTickets.push({
        ...ticket,
        distanceMeters: distance,
      });
    }
  }

  // Return sorted by nearest distance
  return matchingTickets.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * Civic Memory:
 * Finds historically resolved tickets within 150m of a given location to provide institutional memory.
 */
export async function findCivicMemoryNearby(lat: number, lng: number, radiusMeters: number = 150, cityId?: string) {
  const pastTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['RESOLVED', 'CLOSED'] },
      ...(cityId ? { cityId } : {}),
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const historicalMatches = [];

  for (const ticket of pastTickets) {
    const distance = calculateHaversineDistanceMeters(lat, lng, ticket.latitude, ticket.longitude);
    if (distance <= radiusMeters) {
      historicalMatches.push({
        ...ticket,
        distanceMeters: distance,
      });
    }
  }

  return historicalMatches;
}

/**
 * Generates a CityNova case ID independent of city departments.
 */
export function generateCaseId(): string {
  const year = new Date().getFullYear();
  const randomSeq = Math.floor(100000 + Math.random() * 900000);
  return `CTN-${year}-${randomSeq}`;
}

