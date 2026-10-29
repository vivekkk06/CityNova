import { NextRequest, NextResponse } from 'next/server';
import { getCityInfo, getAllCitiesSummary } from '@/data/cities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityParam = searchParams.get('city');

    if (!cityParam) {
      // Return list of supported cities
      const availableCities = getAllCitiesSummary();
      return NextResponse.json({
        success: true,
        availableCities,
      });
    }

    const cityData = getCityInfo(cityParam);

    if (!cityData) {
      return NextResponse.json(
        {
          success: false,
          error: `City '${cityParam}' is not found or not yet registered in CityNova.`,
          availableCities: getAllCitiesSummary(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      city: cityData,
    });
  } catch (error: any) {
    console.error('Error fetching city info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve city information.',
      },
      { status: 500 }
    );
  }
}

