import { NextRequest, NextResponse } from 'next/server';

let reverseGeocodeQueue = Promise.resolve();
let nextReverseGeocodeAt = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  const lat = parseFloat(latStr || '');
  const lng = parseFloat(lngStr || '');

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Valid lat and lng query parameters are required.' }, { status: 400 });
  }

  // Rate-limiting queue to be respectful of OSM Nominatim usage policy (1 request/sec max)
  const waitMs = Math.max(0, nextReverseGeocodeAt - Date.now());
  const requestReverse = async () => {
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
    nextReverseGeocodeAt = Date.now() + 1000;

    const endpoint = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&addressdetails=1`;
    return fetch(endpoint, {
      headers: {
        'User-Agent': 'CityNovaCivic/1.0 (reverse geocoding for civic issues)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });
  };

  try {
    const queuePromise = reverseGeocodeQueue.then(requestReverse, requestReverse);
    reverseGeocodeQueue = queuePromise.then(() => undefined, () => undefined);

    const res = await queuePromise;
    if (!res.ok) {
      throw new Error(`Nominatim responded with status ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.street;
    const neighborhood = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter;
    const townCity = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    const state = addr.state || addr.province;
    const postcode = addr.postcode;

    // Build concise, readable address
    const parts = [road, neighborhood, townCity, state].filter(Boolean);
    const shortAddress = parts.length > 0 ? parts.slice(0, 3).join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || `Location [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;

    return NextResponse.json({
      success: true,
      displayName: data.display_name || shortAddress,
      shortAddress,
      road: road || '',
      neighborhood: neighborhood || '',
      city: townCity || '',
      state: state || '',
      postcode: postcode || '',
      lat,
      lng,
    });
  } catch (err) {
    // Graceful fallback if offline or OSM is unreachable
    const fallback = `Location at [${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
    return NextResponse.json({
      success: true,
      displayName: fallback,
      shortAddress: fallback,
      lat,
      lng,
      isFallback: true,
    });
  }
}

