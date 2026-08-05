import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DATA_GOV_IN_API_KEY || process.env.VITE_DATA_GOV_IN_API_KEY;

  if (!apiKey) {
    console.warn('[API] DATA_GOV_IN_API_KEY is not configured. Returning error as requested.');
    return NextResponse.json(
      { error: 'Market price data temporarily unavailable.' },
      { status: 503 }
    );
  }

  // Official data.gov.in Agmarknet mandi price resource ID
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=15`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Data.gov.in portal returned status code: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.records)) {
      throw new Error('Invalid response payload from data.gov.in API');
    }

    const marketPrices = data.records.map((rec: any, idx: number) => {
      // Normalize dates: converts DD/MM/YYYY to YYYY-MM-DD
      let cleanDate = rec.arrival_date || '';
      if (cleanDate.includes('/')) {
        const parts = cleanDate.split('/');
        if (parts.length === 3) {
          cleanDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Convert Rupees/Quintal (100 kg) to Rupees/Kg
      const minPrice = Number(rec.min_price || 0) / 100;
      const maxPrice = Number(rec.max_price || 0) / 100;
      const modalPrice = Number(rec.modal_price || 0) / 100;

      return {
        id: rec.id || `gov_${idx}`,
        cropName: `${rec.commodity || 'Crop'} (${rec.variety || 'Local'})`,
        state: (rec.state || 'Tamil Nadu').trim(),
        market: (rec.market || 'Cooperative').trim(),
        minPrice,
        maxPrice,
        modalPrice,
        date: cleanDate,
        trend: (rec.trend_signal || 'stable') as 'up' | 'down' | 'stable'
      };
    });

    return NextResponse.json({
      records: marketPrices,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error retrieving mandi prices:', error);
    return NextResponse.json(
      { error: 'Market price data temporarily unavailable.' },
      { status: 503 }
    );
  }
}
