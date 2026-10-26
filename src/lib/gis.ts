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
 * Ray-casting algorithm to test whether a coordinate is inside a polygon.
 * point: [lng, lat]
 * vs: [[lng, lat], [lng, lat], ...]
 */
export function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Automatically detects the municipal ward for a given coordinate.
 * Uses GeoJSON Point-in-Polygon check; falls back to nearest centroid if point lies outside known polygons.
 */
export async function detectWardForCoordinates(lat: number, lng: number) {
  const wards = await prisma.ward.findMany();

  for (const ward of wards) {
    try {
      const geo = JSON.parse(ward.boundariesGeoJson);
      if (geo.type === 'Polygon' && Array.isArray(geo.coordinates?.[0])) {
        // geo.coordinates[0] has [[lng, lat], ...]
        const isInside = isPointInPolygon([lng, lat], geo.coordinates[0]);
        if (isInside) {
          return ward;
        }
      }
    } catch (err) {
      console.error(`Error parsing GeoJSON for ward ${ward.code}:`, err);
    }
  }

  // Fallback: Pick nearest ward centroid
  let nearestWard = wards[0];
  let minDistance = Infinity;

  for (const ward of wards) {
    const dist = calculateHaversineDistanceMeters(lat, lng, ward.centerLat, ward.centerLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestWard = ward;
    }
  }

  return nearestWard;
}

/**
 * Spatial Deduplication:
 * Checks for any existing OPEN or IN_PROGRESS tickets in the same category within 50 meters.
 */
export async function findDuplicateTicketsNearby(
  lat: number,
  lng: number,
  category: string,
  thresholdMeters: number = 50
) {
  const openTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      category: category,
    },
    include: {
      ward: true,
      department: true,
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
export async function findCivicMemoryNearby(lat: number, lng: number, radiusMeters: number = 150) {
  const pastTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['RESOLVED', 'CLOSED'] },
    },
    include: {
      ward: true,
      department: true,
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
 * Generates an immutable CivicLens Case ID (e.g. CVL-2026-W101-0842)
 */
export function generateCaseId(wardCode: string): string {
  const year = new Date().getFullYear();
  const wardSuffix = wardCode.replace(/[^0-9]/g, '') || '101';
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return `CVL-${year}-W${wardSuffix}-${randomSeq}`;
}

/**
 * Generates a legacy Municipal Corporation Grievance Number
 */
export function generateLegacyGrievanceNumber(deptCode: string): string {
  const prefix = deptCode.slice(0, 3).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MGM-${prefix}-${num}`;
}
