import { NextResponse } from 'next/server';

// Weather Condition Translater for Tamil
const tamilConditions: Record<string, string> = {
  'clear': 'தெளிவான வானம்',
  'sunny': 'வெயில்',
  'mostly sunny': 'பெரும்பாலும் வெயில்',
  'partly sunny': 'ஓரளவு வெயில்',
  'partly cloudy': 'ஓரளவு மேகமூட்டம்',
  'mostly cloudy': 'பெரும்பாலும் மேகமூட்டம்',
  'cloudy': 'மேகமூட்டம்',
  'overcast': 'முழு மேகமூட்டம்',
  'rain': 'மழை',
  'rainy': 'மழை',
  'heavy rain': 'கனமழை',
  'light rain': 'மிதமான மழை',
  'drizzle': 'தூறல்',
  'light drizzle': 'இலேசான தூறல்',
  'thunderstorm': 'இடியுடன் கூடிய மழை',
  'storm': 'புயல்',
  'mist': 'பனிமூட்டம்',
  'fog': 'அடர்ந்த பனிமூட்டம்',
};

function translateCondition(desc: string, isTamil: boolean): string {
  if (!isTamil) return desc;
  const clean = desc.toLowerCase().trim();
  for (const [en, ta] of Object.entries(tamilConditions)) {
    if (clean.includes(en)) return ta;
  }
  return tamilConditions[clean] || desc;
}

function mapConditionToEnum(desc: string): 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorm' | 'drizzle' {
  const clean = desc.toLowerCase().trim();
  if (clean.includes('thunderstorm') || clean.includes('storm')) return 'thunderstorm';
  if (clean.includes('drizzle') || clean.includes('mist') || clean.includes('fog')) return 'drizzle';
  if (clean.includes('rain') || clean.includes('shower')) return 'rainy';
  if (clean.includes('cloud') && (clean.includes('part') || clean.includes('scatter') || clean.includes('broken'))) return 'partly_cloudy';
  if (clean.includes('cloud') || clean.includes('overcast')) return 'cloudy';
  if (clean.includes('clear') || clean.includes('sun') || clean.includes('fair')) return 'sunny';
  return 'sunny';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const language = searchParams.get('language') || 'ta';

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Latitude and Longitude parameters are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_WEATHER_API_KEY;
    const isTamil = language === 'ta';

    // Mock Mode Fallback if API key is not configured
    if (!apiKey || apiKey === 'your_google_maps_weather_api_key_here' || apiKey === 'mock') {
      console.warn('[Weather API] GOOGLE_MAPS_WEATHER_API_KEY not configured. Generating high-fidelity mock response.');

      // Simulate API network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Deterministic generation based on lat/lng coordinates
      const seed = Math.abs(Math.sin(lat) * Math.cos(lng));
      const tempBase = Math.round(26 + seed * 10); // 26°C to 36°C
      const humidity = Math.round(55 + seed * 35); // 55% to 90%
      const rainProbability = Math.round(seed * 100);
      const windSpeed = Math.round(5 + seed * 20); // 5 to 25 km/h
      
      let conditionText = 'Clear';
      if (rainProbability > 80) conditionText = 'Thunderstorm';
      else if (rainProbability > 50) conditionText = 'Rainy';
      else if (rainProbability > 30) conditionText = 'Partly Cloudy';
      else if (rainProbability > 15) conditionText = 'Cloudy';
      else conditionText = 'Sunny';

      const condition = mapConditionToEnum(conditionText);
      const conditionTa = translateCondition(conditionText, true);

      // Generate a 7-day forecast
      const forecastDays = Array.from({ length: 7 }).map((_, index) => {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + index);
        const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayNamesTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
        const dateStr = dateObj.toISOString().split('T')[0];
        
        // Vary conditions slightly day by day
        const daySin = Math.sin(lat + index);
        const dayRainProb = Math.round(Math.abs(daySin) * 100);
        let dayCondText = 'Sunny';
        if (dayRainProb > 75) dayCondText = 'Thunderstorm';
        else if (dayRainProb > 45) dayCondText = 'Rainy';
        else if (dayRainProb > 25) dayCondText = 'Partly Cloudy';
        else dayCondText = 'Sunny';

        return {
          day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayNamesEn[dateObj.getDay()],
          dayTa: index === 0 ? 'இன்று' : index === 1 ? 'நாளை' : dayNamesTa[dateObj.getDay()],
          date: dateStr,
          high: Math.round(tempBase + 2 - (index % 3)),
          low: Math.round(tempBase - 4 - (index % 2)),
          condition: mapConditionToEnum(dayCondText),
          conditionText: translateCondition(dayCondText, isTamil),
          rainProb: dayRainProb,
          humidity: Math.round(humidity - index),
          wind: Math.round(windSpeed + (index % 3))
        };
      });

      // Simulated Alert if rain probability is very high
      const alerts = [];
      if (rainProbability > 75) {
        alerts.push({
          id: 'alert_mock_1',
          type: 'warning',
          title: isTamil ? 'கனமழை எச்சரிக்கை' : 'Heavy Rain Alert',
          description: isTamil 
            ? 'அடுத்த 24 மணி நேரத்திற்கு கனமழை பெய்யக்கூடும். வடிகால் வாய்க்கால்களைச் சீரமைக்கவும்.' 
            : 'Heavy rain warning in effect for the next 24 hours. Ensure drainage Bunds are intact.',
          validUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
        });
      }

      return NextResponse.json({
        is_mock: true,
        current: {
          temp: tempBase,
          feelsLike: tempBase + (humidity > 70 ? 3 : -1),
          condition,
          conditionText: isTamil ? conditionTa : conditionText,
          humidity,
          windSpeed,
          windDir: seed > 0.5 ? 'SW' : 'NE',
          rainProbability,
          visibility: 10 - Math.round(seed * 4),
          pressure: 1010 - Math.round(seed * 10),
          sunrise: '06:05 AM',
          sunset: '06:35 PM',
          updatedAt: new Date().toISOString()
        },
        forecast: forecastDays,
        alerts
      });
    }

    // Call Real Google Maps Weather API
    const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`;
    const forecastUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      throw new Error(`Google Weather API CurrentConditions failed: ${currentRes.statusText}`);
    }
    if (!forecastRes.ok) {
      throw new Error(`Google Weather API Forecast failed: ${forecastRes.statusText}`);
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Map current condition details
    const rawCond = currentData.weatherCondition?.description || currentData.weatherCondition?.summary || 'Sunny';
    const condition = mapConditionToEnum(rawCond);
    const conditionText = translateCondition(rawCond, isTamil);

    const temp = Math.round(currentData.temperature?.value ?? 30);
    const feelsLike = Math.round(currentData.feelsLikeTemperature?.value ?? temp);
    const humidity = currentData.relativeHumidity ?? 70;
    const windSpeed = Math.round(currentData.wind?.speed?.value ?? 10);
    const windDir = currentData.wind?.direction ?? 'W';
    const rainProbability = currentData.thunderstormProbability ?? (condition === 'rainy' ? 80 : 20);

    // Map forecast days
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

    const forecast = (forecastData.forecastDays || []).slice(0, 7).map((f: any, index: number) => {
      const start = new Date(f.interval?.startTime || Date.now());
      const dateStr = start.toISOString().split('T')[0];
      const dayNameEn = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : daysEn[start.getDay()];
      const dayNameTa = index === 0 ? 'இன்று' : index === 1 ? 'நாளை' : daysTa[start.getDay()];
      
      const dayForecast = f.daytimeForecast || {};
      const forecastCond = dayForecast.weatherCondition?.description?.text || 'Sunny';

      return {
        day: dayNameEn,
        dayTa: dayNameTa,
        date: dateStr,
        high: Math.round(dayForecast.temperature?.max ?? 32),
        low: Math.round(dayForecast.temperature?.min ?? 24),
        condition: mapConditionToEnum(forecastCond),
        conditionText: translateCondition(forecastCond, isTamil),
        rainProb: Math.round((dayForecast.precipitation?.probability ?? 0.2) * 100),
        humidity: dayForecast.humidity ?? 65,
        wind: Math.round(dayForecast.wind?.speed ?? 12)
      };
    });

    // Map alerts
    const alerts = (forecastData.weatherAlerts || []).map((alert: any) => ({
      id: alert.id || `alert_${Date.now()}`,
      type: alert.severity === 'SEVERE' ? 'warning' : 'watch',
      title: isTamil ? translateCondition(alert.title || 'Alert', true) : alert.title,
      description: isTamil ? translateCondition(alert.description || '', true) : alert.description,
      validUntil: alert.endTime ? new Date(alert.endTime).toISOString().split('T')[0] : ''
    }));

    return NextResponse.json({
      current: {
        temp,
        feelsLike,
        condition,
        conditionText,
        humidity,
        windSpeed,
        windDir,
        rainProbability,
        visibility: Math.round(currentData.visibility?.value ?? 10),
        pressure: Math.round(currentData.airPressure?.value ?? 1010),
        sunrise: '06:00 AM', // Fallbacks
        sunset: '06:30 PM',
        updatedAt: new Date().toISOString()
      },
      forecast,
      alerts
    });
  } catch (error: unknown) {
    console.error('[Weather API] Endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
