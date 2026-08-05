'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CloudRain,
  Sun,
  Cloud,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Sprout,
  Clock,
  CloudLightning,
  CloudDrizzle,
  Eye,
  ArrowUp,
  ArrowDown,
  Umbrella,
  Waves,
  CalendarDays,
  Bell,
  CheckCircle,
  Info,
  MapPin,
  RefreshCw,
  Search
} from 'lucide-react';

type WeatherCondition = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorm' | 'drizzle';

interface WeatherData {
  is_mock?: boolean;
  current: {
    temp: number;
    feelsLike: number;
    condition: WeatherCondition;
    conditionText: string;
    humidity: number;
    windSpeed: number;
    windDir: string;
    rainProbability: number;
    visibility: number;
    pressure: number;
    sunrise: string;
    sunset: string;
    updatedAt: string;
  };
  forecast: Array<{
    day: string;
    dayTa: string;
    date: string;
    high: number;
    low: number;
    condition: WeatherCondition;
    conditionText: string;
    rainProb: number;
    humidity: number;
    wind: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'watch' | 'info';
    title: string;
    description: string;
    validUntil: string;
  }>;
}

interface LocationPreset {
  name: string;
  nameTa: string;
  lat: number;
  lng: number;
}

const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'Madurai', nameTa: 'மதுரை', lat: 9.9252, lng: 78.1198 },
  { name: 'Melur', nameTa: 'மேலூர்', lat: 10.0460, lng: 78.3392 },
  { name: 'Thanjavur', nameTa: 'தஞ்சாவூர்', lat: 10.7870, lng: 79.1378 },
  { name: 'Erode', nameTa: 'ஈரோடு', lat: 11.3410, lng: 77.7172 },
  { name: 'Dindigul', nameTa: 'திண்டுக்கல்', lat: 10.3673, lng: 77.9803 },
  { name: 'Virudhunagar', nameTa: 'விருதுநகர்', lat: 9.5680, lng: 77.9624 },
  { name: 'Chennai', nameTa: 'சென்னை', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', lat: 11.0168, lng: 76.9558 },
];

function getWeatherIcon(condition: WeatherCondition, size = 'w-6 h-6') {
  switch (condition) {
    case 'sunny': return <Sun className={`${size} text-amber-500 animate-spin-slow`} />;
    case 'partly_cloudy': return <CloudSun className={`${size} text-amber-400`} />;
    case 'cloudy': return <Cloud className={`${size} text-earth-400`} />;
    case 'rainy': return <CloudRain className={`${size} text-blue-500`} />;
    case 'thunderstorm': return <CloudLightning className={`${size} text-purple-500`} />;
    case 'drizzle': return <CloudDrizzle className={`${size} text-blue-400`} />;
    default: return <Sun className={`${size} text-amber-500`} />;
  }
}

export default function WeatherBoard() {
  const { t, language } = useApp();
  const isTamil = language === 'ta';

  const [lat, setLat] = useState<number>(9.9252); // Default to Madurai
  const [lng, setLng] = useState<number>(78.1198);
  const [presetIndex, setPresetIndex] = useState<string>('0');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState<number>(0);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'fetching' | 'granted' | 'denied'>('prompt');

  const fetchWeather = useCallback(async (latitude: number, longitude: number) => {
    setIsLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}&language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve live weather data');
      }

      const data: WeatherData = await response.json();
      setWeather(data);
      setSelectedForecastDay(0);

      // Save to local cache
      localStorage.setItem('vlink_cached_weather', JSON.stringify({
        data,
        lat: latitude,
        lng: longitude,
        cachedAt: new Date().toISOString()
      }));
    } catch (err: any) {
      console.warn('[WeatherBoard] Fetch failed, loading from local cache:', err);
      // Attempt cache recovery
      const cached = localStorage.getItem('vlink_cached_weather');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setWeather(parsed.data);
          setLat(parsed.lat);
          setLng(parsed.lng);
          setIsCached(true);
          setSelectedForecastDay(0);
          setError(
            isTamil 
              ? `நெட்வொர்க் பிழை. சேமிக்கப்பட்ட பழைய தரவு காண்பிக்கப்படுகிறது (${new Date(parsed.cachedAt).toLocaleTimeString()})`
              : `Network connection failed. Showing cached data from ${new Date(parsed.cachedAt).toLocaleTimeString()}`
          );
        } catch (parseErr) {
          setError(isTamil ? 'வானிலை தரவை ஏற்ற முடியவில்லை' : 'Failed to load weather data');
        }
      } else {
        setError(
          isTamil 
            ? 'இணைப்பு தோல்வி மற்றும் சேமிக்கப்பட்ட தரவு எதுவும் இல்லை.' 
            : 'Connection failure and no cached weather data is available.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, isTamil]);

  // Fetch current geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);
        setPresetIndex('custom');
        setCustomLat(latitude.toFixed(4));
        setCustomLng(longitude.toFixed(4));
        setLocationStatus('granted');
        fetchWeather(latitude, longitude);
      },
      (err) => {
        console.warn('[Geolocation] Permission denied or error:', err);
        setLocationStatus('denied');
        // Fallback to active coordinates
        fetchWeather(lat, lng);
      },
      { timeout: 8000 }
    );
  };

  // Handle Preset Selector Change
  const handlePresetChange = (value: string) => {
    setPresetIndex(value);
    if (value === 'custom') {
      return;
    }
    const idx = parseInt(value, 10);
    if (!isNaN(idx) && LOCATION_PRESETS[idx]) {
      const selected = LOCATION_PRESETS[idx];
      setLat(selected.lat);
      setLng(selected.lng);
      setCustomLat('');
      setCustomLng('');
      fetchWeather(selected.lat, selected.lng);
    }
  };

  // Submit custom lat/lng coordinates
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(customLat);
    const parsedLng = parseFloat(customLng);
    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      setError(isTamil ? 'தவறான அட்சரேகை/தீர்க்கரேகை அலகுகள்' : 'Invalid coordinate values');
      return;
    }
    setLat(parsedLat);
    setLng(parsedLng);
    fetchWeather(parsedLat, parsedLng);
  };

  // Fetch on mount or when language/preset changes
  useEffect(() => {
    // Attempt automatic geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLng(longitude);
          setPresetIndex('custom');
          setCustomLat(latitude.toFixed(4));
          setCustomLng(longitude.toFixed(4));
          setLocationStatus('granted');
          fetchWeather(latitude, longitude);
        },
        () => {
          setLocationStatus('denied');
          // Load default preset (Madurai)
          fetchWeather(lat, lng);
        }
      );
    } else {
      setLocationStatus('denied');
      fetchWeather(lat, lng);
    }
    
    // Auto-refresh when internet connectivity returns
    const handleOnline = () => {
      fetchWeather(lat, lng);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const activeForecast = weather?.forecast[selectedForecastDay];

  // Dynamic Crop Advice based on weather conditions
  const getDynamicCropAdvice = (condition: WeatherCondition) => {
    if (condition === 'rainy' || condition === 'thunderstorm') {
      return [
        { crop: isTamil ? 'தக்காளி' : 'Tomato', priority: 'high', suggestion: isTamil ? 'இன்று அறுவடையை தள்ளிவைக்கவும். ஈரமான பழங்கள் அழுகிவிடும்.' : 'Delay harvest today. Wet tomatoes crack and rot easily.', icon: 'rain' },
        { crop: isTamil ? 'நெல்' : 'Paddy', priority: 'low', suggestion: isTamil ? 'மழை பெய்வதால் அடுத்த 3 நாட்களுக்கு நீர்ப்பாசனத்தைக் குறைக்கவும்.' : 'Abundant rain expected; pause pump irrigation to save power.', icon: 'rain' },
        { crop: isTamil ? 'மஞ்சள்' : 'Turmeric', priority: 'high', suggestion: isTamil ? 'வடிகால் வாய்க்கால்களைச் சீரமைத்து நீர் தேங்குவதைத் தவிர்க்கவும்.' : 'Clear drainage channels; waterlogging causes root rhizome rot.', icon: 'rain' },
      ];
    }
    if (condition === 'sunny') {
      return [
        { crop: isTamil ? 'மிளகாய்' : 'Chilli', priority: 'medium', suggestion: isTamil ? 'சூடான வானிலை; பூச்சிகள் தாக்காமல் இருக்க வேப்ப எண்ணெய் தெளிக்கவும்.' : 'Sunny conditions; spray neem oil preventatively to control whitefly.', icon: 'heat' },
        { crop: isTamil ? 'தக்காளி' : 'Tomato', priority: 'medium', suggestion: isTamil ? 'மண் காய்ந்துவிடாமல் இருக்க சொட்டுநீர் பாசனத்தை அதிகரிக்கவும்.' : 'Increase drip irrigation cycles to prevent soil drying.', icon: 'heat' },
        { crop: isTamil ? 'நெல்' : 'Paddy', priority: 'low', suggestion: isTamil ? 'மண்ணில் ஈரப்பதத்தை உறுதிப்படுத்த காலை வேளையில் பாய்ச்சவும்.' : 'Ensure adequate standing water in paddy plots during heat spikes.', icon: 'heat' },
      ];
    }
    return [
      { crop: isTamil ? 'தக்காளி' : 'Tomato', priority: 'low', suggestion: isTamil ? 'இயல்பான வளர்ச்சி நிலைகள். களக் கண்காணிப்பைத் தொடரவும்.' : 'Normal growth parameters. Continue routine field monitoring.', icon: 'humidity' },
      { crop: isTamil ? 'மிளகாய்' : 'Chilli', priority: 'medium', suggestion: isTamil ? 'மேகமூட்டமான வானிலை இலை சுருட்டலை ஏற்படுத்தலாம்; கவனித்துக் கொள்ளவும்.' : 'Overcast conditions may foster leaf curl; check foliage health.', icon: 'humidity' },
    ];
  };

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      
      {/* Location Controller Panel */}
      <div className="vlink-glass vlink-card p-5 rounded-[24px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <CloudSun className="w-7 h-7 text-amber-500" />
              <span>{isTamil ? 'விவசாய வானிலை மையம்' : 'Agricultural Weather Center'}</span>
            </h1>
            <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
              📍 Lat: <span className="font-mono font-bold text-foreground">{lat.toFixed(4)}</span> | Lng: <span className="font-mono font-bold text-foreground">{lng.toFixed(4)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Presets Select Dropdown */}
            <select
              value={presetIndex}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="h-10 px-3 pr-7 rounded-xl text-xs font-bold bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 text-foreground cursor-pointer focus:outline-none"
            >
              <optgroup label={isTamil ? 'விவசாய வட்டாரங்கள்' : 'Agricultural Hubs'}>
                {LOCATION_PRESETS.map((p, idx) => (
                  <option key={p.name} value={idx.toString()}>
                    {isTamil ? p.nameTa : p.name}
                  </option>
                ))}
              </optgroup>
              <option value="custom">⚙️ {isTamil ? 'தனிப்பயன் ஒருங்கிணைப்புகள்' : 'Custom Coordinates'}</option>
            </select>

            {/* Geolocation Button */}
            <button
              onClick={handleGetLocation}
              disabled={locationStatus === 'fetching'}
              className="h-10 px-4 rounded-xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-primary-500 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all disabled:opacity-40"
            >
              <MapPin className="w-4 h-4" />
              <span>
                {locationStatus === 'fetching' ? (isTamil ? 'பெறுகிறது...' : 'Locating...') :
                 locationStatus === 'granted' ? (isTamil ? 'உள்ளூர் இருப்பிடம்' : 'GPS Location') :
                 (isTamil ? 'இருப்பிடத்தை பெறு' : 'Get Location')}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchWeather(lat, lng)}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl border border-earth-200 dark:border-primary-950/20 bg-white dark:bg-[#111714] text-earth-500 hover:text-primary-500 flex items-center justify-center cursor-pointer transition-all"
              title="Refresh weather"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom coordinates form */}
        {presetIndex === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-earth-100 dark:border-earth-900/10 flex items-end gap-3 flex-wrap animate-scale-up">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-earth-400 block">{isTamil ? 'அட்சரேகை (Latitude)' : 'Latitude'}</label>
              <input
                type="text"
                required
                placeholder="e.g. 9.9252"
                value={customLat}
                onChange={e => setCustomLat(e.target.value)}
                className="h-9 px-3 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 w-32"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-earth-400 block">{isTamil ? 'தீர்க்கரேகை (Longitude)' : 'Longitude'}</label>
              <input
                type="text"
                required
                placeholder="e.g. 78.1198"
                value={customLng}
                onChange={e => setCustomLng(e.target.value)}
                className="h-9 px-3 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 w-32"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold border-0 cursor-pointer shadow-xs"
            >
              {isTamil ? 'தேடு' : 'Search Coordinates'}
            </button>
          </form>
        )}
      </div>

      {/* Warning/Error alert banners */}
      {error && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-scale-up ${
          isCached 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${isCached ? 'text-amber-500' : 'text-red-500'}`} />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Main Content Layout */}
      {isLoading ? (
        <div className="p-16 rounded-[24px] border border-earth-200/50 dark:border-primary-950/20 bg-white dark:bg-[#111714] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          <span className="text-xs font-semibold text-earth-550 font-mono tracking-widest uppercase">
            {isTamil ? 'வானிலை தரவைப் பெறுகிறது...' : 'ACQUIRING WEATHER TELEMETRY...'}
          </span>
        </div>
      ) : weather ? (
        <>
          {/* Current Weather Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-gradient-to-br from-blue-500/5 via-white to-amber-500/5 dark:from-blue-950/30 dark:via-[#111714] dark:to-amber-950/20 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              
              {/* Left Temperature */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 to-blue-400/20 dark:from-amber-500/10 dark:to-blue-500/10 flex items-center justify-center shrink-0">
                  {getWeatherIcon(weather.current.condition, 'w-10 h-10')}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-foreground tracking-tighter">{weather.current.temp}°</span>
                    <span className="text-lg font-bold text-earth-400">C</span>
                  </div>
                  <p className="text-sm font-black text-foreground mt-0.5">
                    {weather.current.conditionText}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-earth-450 mt-0.5">
                    {isTamil ? 'உணர்வு' : 'Feels like'} {weather.current.feelsLike}°C
                  </p>
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-2xl">
                {[
                  { icon: Droplets, label: isTamil ? 'ஈரப்பதம்' : 'Humidity', value: `${weather.current.humidity}%`, color: 'text-blue-500' },
                  { icon: Wind, label: isTamil ? 'காற்று' : 'Wind', value: `${weather.current.windSpeed} km/h ${weather.current.windDir}`, color: 'text-teal-500' },
                  { icon: Umbrella, label: isTamil ? 'மழை வாய்ப்பு' : 'Rain Chance', value: `${weather.current.rainProbability}%`, color: 'text-indigo-500' },
                  { icon: Eye, label: isTamil ? 'தெரிவுநிலை' : 'Visibility', value: `${weather.current.visibility} km`, color: 'text-earth-500' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-2xl bg-white/60 dark:bg-earth-950/30 border border-earth-100/50 dark:border-earth-900/20">
                    <stat.icon className={`w-4.5 h-4.5 ${stat.color} mb-1.5`} />
                    <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xs font-black text-foreground mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Sun Info and timestamp footer */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-earth-100/40 dark:border-earth-900/10 text-xs text-earth-500 font-bold flex-wrap">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
                <span>{isTamil ? 'சூரிய உதயம்' : 'Sunrise'}: {weather.current.sunrise}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-3.5 h-3.5 text-orange-500" />
                <span>{isTamil ? 'சூரிய அஸ்தமனம்' : 'Sunset'}: {weather.current.sunset}</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>UV: {weather.current.pressure > 1010 ? '3/11' : '6/11'}</span>
              </div>
              
              <div className="ml-auto text-[9px] font-mono font-bold text-earth-400">
                {isTamil ? 'புதுப்பிக்கப்பட்டது:' : 'Updated:'} {new Date(weather.current.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="p-6 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary-500" />
              <span>{isTamil ? '7-நாள் வானிலை முன்னறிவிப்பு' : '7-Day Outlook Forecast'}</span>
            </h3>

            <div className="flex gap-2.5 overflow-x-auto pb-2 px-1">
              {weather.forecast.map((day, idx) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedForecastDay(idx)}
                  className={`flex-shrink-0 w-[100px] p-3 rounded-2xl border text-center cursor-pointer transition-all duration-300 bg-transparent ${
                    selectedForecastDay === idx
                      ? 'bg-primary-500/10 dark:bg-primary-500/15 border-primary-500/30 scale-105 shadow-sm'
                      : 'border-earth-100/50 dark:border-earth-900/20 hover:bg-earth-50/50 dark:hover:bg-earth-950/20'
                  }`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-wider ${selectedForecastDay === idx ? 'text-primary-600 dark:text-primary-400' : 'text-earth-400'}`}>
                    {isTamil ? day.dayTa : day.day}
                  </p>
                  <div className="my-2 flex justify-center">
                    {getWeatherIcon(day.condition, 'w-7 h-7')}
                  </div>
                  <p className="text-xs font-black text-foreground">
                    {day.high}° <span className="text-earth-400 font-semibold">/ {day.low}°</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-500">{day.rainProb}%</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Day Details */}
            {activeForecast && (
              <div className="p-4 rounded-xl bg-earth-50/40 dark:bg-earth-950/20 border border-earth-100/40 dark:border-earth-900/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'அதிகபட்சம்' : 'High Temp'}</p>
                  <p className="text-base font-black text-foreground">{activeForecast.high}°C</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'குறைந்தபட்சம்' : 'Low Temp'}</p>
                  <p className="text-base font-black text-foreground">{activeForecast.low}°C</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'ஈரப்பதம்' : 'Humidity'}</p>
                  <p className="text-base font-black text-foreground">{activeForecast.humidity}%</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'காற்று' : 'Wind'}</p>
                  <p className="text-base font-black text-foreground">{activeForecast.wind} km/h</p>
                </div>
              </div>
            )}
          </div>

          {/* Active Alerts and suggestions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active alerts or weather gauge */}
            <div className="p-6 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs flex flex-col justify-between">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-red-500" />
                <span>{isTamil ? 'அவசர எச்சரிக்கைகள்' : 'Active Weather Alerts'}</span>
              </h3>

              {weather.alerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-earth-500 dark:text-earth-400">
                    {isTamil ? 'அபாய எச்சரிக்கைகள் எதுவும் இல்லை' : 'No active weather alerts for your area.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-56">
                  {weather.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        alert.type === 'warning'
                          ? 'bg-red-500/5 border-red-500/15 dark:bg-red-950/15 dark:border-red-900/15'
                          : 'bg-amber-500/5 border-amber-500/15 dark:bg-amber-950/15 dark:border-amber-900/15'
                      }`}
                    >
                      <AlertTriangle className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${alert.type === 'warning' ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <h4 className="text-xs font-black text-foreground">{alert.title}</h4>
                        <p className="text-[11px] text-earth-550 dark:text-earth-400 mt-1 leading-relaxed font-semibold">{alert.description}</p>
                        {alert.validUntil && (
                          <span className="text-[9px] font-mono text-earth-400 block mt-2">
                            {isTamil ? 'செல்லுபடியாகும்:' : 'Valid until:'} {alert.validUntil}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Agricultural Crop Impact Suggestions */}
            <div className="p-6 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs space-y-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary-500" />
                <span>{isTamil ? 'பயிர் பாதுகாப்பு பரிந்துரைகள்' : 'Crop Care Recommendations'}</span>
              </h3>
              
              <div className="space-y-3.5 overflow-y-auto max-h-56">
                {getDynamicCropAdvice(weather.current.condition).map((impact) => (
                  <div
                    key={impact.crop}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      impact.priority === 'high'
                        ? 'border-red-500/10 bg-red-500/3 dark:bg-red-950/10'
                        : 'border-primary-500/10 bg-primary-500/3 dark:bg-primary-950/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-earth-900 flex items-center justify-center shrink-0 border border-earth-100">
                      {impact.icon === 'rain' ? <CloudRain className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">{impact.crop}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          impact.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-primary-500/10 text-primary-600'
                        }`}>
                          {impact.priority === 'high' ? (isTamil ? 'அதி முக்கியம்' : 'HIGH') : (isTamil ? 'பரிந்துரை' : 'SUGGESTED')}
                        </span>
                      </div>
                      <p className="text-[11px] text-earth-550 dark:text-earth-450 mt-1 leading-normal font-semibold">{impact.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-[#111714] border rounded-[24px] text-xs font-bold text-earth-450">
          {isTamil ? 'இருப்பிடத்தைத் தேர்ந்தெடுத்து வானிலை விவரங்களைப் பெறவும்.' : 'Please select a location presets or input custom coordinates.'}
        </div>
      )}

    </div>
  );
}
