'use client';

import React, { useState } from 'react';
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
  Leaf,
  CalendarDays,
  Bell,
  CheckCircle,
  Info
} from 'lucide-react';

// ─── Mock Weather Data ──────────────────────────────────────────────
const CURRENT_WEATHER = {
  temp: 32,
  feelsLike: 35,
  humidity: 78,
  windSpeed: 14,
  windDir: 'SW',
  condition: 'partly_cloudy' as const,
  rainProbability: 65,
  uvIndex: 7,
  visibility: 8,
  pressure: 1008,
  sunrise: '06:02',
  sunset: '18:34',
  updatedAt: new Date().toISOString(),
};

type WeatherCondition = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorm' | 'drizzle';

interface ForecastDay {
  day: string;
  dayTa: string;
  date: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  rainProb: number;
  humidity: number;
  wind: number;
}

const FORECAST_7DAY: ForecastDay[] = (() => {
  const days = [
    { day: 'Today', dayTa: 'இன்று', condition: 'partly_cloudy' as const, high: 32, low: 25, rainProb: 65, humidity: 78, wind: 14 },
    { day: 'Tomorrow', dayTa: 'நாளை', condition: 'rainy' as const, high: 29, low: 24, rainProb: 85, humidity: 88, wind: 20 },
    { day: 'Wednesday', dayTa: 'புதன்', condition: 'thunderstorm' as const, high: 28, low: 23, rainProb: 90, humidity: 92, wind: 25 },
    { day: 'Thursday', dayTa: 'வியாழன்', condition: 'rainy' as const, high: 27, low: 23, rainProb: 70, humidity: 85, wind: 18 },
    { day: 'Friday', dayTa: 'வெள்ளி', condition: 'cloudy' as const, high: 30, low: 24, rainProb: 40, humidity: 75, wind: 12 },
    { day: 'Saturday', dayTa: 'சனி', condition: 'partly_cloudy' as const, high: 33, low: 25, rainProb: 20, humidity: 65, wind: 10 },
    { day: 'Sunday', dayTa: 'ஞாயிறு', condition: 'sunny' as const, high: 35, low: 26, rainProb: 10, humidity: 58, wind: 8 },
  ];
  const today = new Date();
  return days.map((d, i) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() + i);
    return { ...d, date: dt.toISOString().split('T')[0] };
  });
})();

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'info';
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  validUntil: string;
}

const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: 'alert_1',
    type: 'warning',
    title: 'Heavy Rainfall Warning',
    titleTa: 'கடும் மழை எச்சரிக்கை',
    description: 'Heavy to very heavy rainfall expected in Madurai and surrounding districts for the next 48 hours. Ensure proper drainage in all crop fields.',
    descriptionTa: 'மதுரை மற்றும் சுற்றுப்புற மாவட்டங்களில் அடுத்த 48 மணி நேரத்திற்கு கனமழை முதல் மிக கனமழை எதிர்பார்க்கப்படுகிறது. அனைத்து பயிர் நிலங்களிலும் சரியான வடிகால் வசதியை உறுதி செய்யவும்.',
    validUntil: '2026-08-01',
  },
  {
    id: 'alert_2',
    type: 'watch',
    title: 'Thunderstorm Watch',
    titleTa: 'இடியுடன் கூடிய மழை கண்காணிப்பு',
    description: 'Thunderstorm activity likely on Wednesday afternoon. Avoid open field work between 2 PM - 6 PM. Secure equipment and livestock.',
    descriptionTa: 'புதன் பிற்பகலில் இடியுடன் கூடிய மழை வரலாம். மதியம் 2 - மாலை 6 மணி வரை திறந்த வெளிப் பணிகளைத் தவிர்க்கவும். உபகரணங்கள் மற்றும் கால்நடைகளைப் பாதுகாக்கவும்.',
    validUntil: '2026-07-31',
  },
  {
    id: 'alert_3',
    type: 'info',
    title: 'Southwest Monsoon Active',
    titleTa: 'தென்மேற்குப் பருவமழை தீவிரம்',
    description: 'Southwest monsoon is active over Tamil Nadu. Good soil moisture expected. Ideal time for sowing secondary crops in well-drained fields.',
    descriptionTa: 'தமிழ்நாடு முழுவதும் தென்மேற்குப் பருவமழை தீவிரமாக உள்ளது. மண்ணில் நல்ல ஈரப்பதம் எதிர்பார்க்கப்படுகிறது. வடிகால் வசதியுள்ள நிலங்களில் இரண்டாம் பயிர் விதைக்க ஏற்ற நேரம்.',
    validUntil: '2026-08-15',
  },
];

interface CropImpact {
  id: string;
  crop: string;
  cropTa: string;
  suggestion: string;
  suggestionTa: string;
  priority: 'high' | 'medium' | 'low';
  icon: 'rain' | 'heat' | 'wind' | 'humidity';
}

const CROP_IMPACTS: CropImpact[] = [
  {
    id: 'ci_1', crop: 'Tomato', cropTa: 'தக்காளி',
    suggestion: 'Delay harvesting today — heavy rain expected. Wet tomatoes are prone to cracking and rot. Resume harvest Friday.',
    suggestionTa: 'இன்று அறுவடையை தள்ளிவைக்கவும் — கனமழை எதிர்பார்க்கப்படுகிறது. ஈரமான தக்காளி வெடிப்பு மற்றும் அழுகலுக்கு ஆளாகும். வெள்ளிக்கிழமை அறுவடையைத் தொடரவும்.',
    priority: 'high', icon: 'rain',
  },
  {
    id: 'ci_2', crop: 'Chilli', cropTa: 'மிளகாய்',
    suggestion: 'High humidity may cause leaf curl virus. Apply neem oil spray preventatively this evening after rain stops.',
    suggestionTa: 'அதிக ஈரப்பதம் இலை சுருட்டு வைரஸை ஏற்படுத்தலாம். மழை நின்ற பிறகு இன்று மாலை வேப்ப எண்ணெய் தெளிக்கவும்.',
    priority: 'medium', icon: 'humidity',
  },
  {
    id: 'ci_3', crop: 'Paddy', cropTa: 'நெல்',
    suggestion: 'Good rainfall expected — reduce pump irrigation for 3 days. Natural water level sufficient for current growth stage.',
    suggestionTa: 'நல்ல மழை எதிர்பார்க்கப்படுகிறது — 3 நாட்களுக்கு பம்ப் பாசனத்தைக் குறைக்கவும். தற்போதைய வளர்ச்சி நிலைக்கு இயற்கை நீர் மட்டம் போதுமானது.',
    priority: 'low', icon: 'rain',
  },
  {
    id: 'ci_4', crop: 'Turmeric', cropTa: 'மஞ்சள்',
    suggestion: 'Ensure drainage channels are clear — waterlogging causes rhizome rot in turmeric. Check field bunds before evening rain.',
    suggestionTa: 'வடிகால் வாய்க்கால்கள் சுத்தமாக உள்ளதா உறுதிசெய்யவும் — நீர் தேங்குவது மஞ்சள் கிழங்கு அழுகலை ஏற்படுத்தும். மாலை மழைக்கு முன் வரப்புகளை சரிபார்க்கவும்.',
    priority: 'high', icon: 'rain',
  },
];

interface IrrigationReminder {
  id: string;
  title: string;
  titleTa: string;
  time: string;
  status: 'pending' | 'done' | 'skip';
  note: string;
  noteTa: string;
}

const IRRIGATION_REMINDERS: IrrigationReminder[] = [
  {
    id: 'irr_1', title: 'Morning Drip — Tomato Field', titleTa: 'காலை சொட்டுநீர் — தக்காளி வயல்',
    time: '06:30 AM', status: 'done',
    note: 'Completed. 45 min drip cycle.', noteTa: 'முடிந்தது. 45 நிமிட சொட்டுநீர் சுழற்சி.',
  },
  {
    id: 'irr_2', title: 'Skip Evening Irrigation', titleTa: 'மாலை பாசனத்தைத் தவிர்க்கவும்',
    time: '05:00 PM', status: 'skip',
    note: 'Rain expected at 4 PM. Skip to save water and electricity.', noteTa: 'மதியம் 4 மணிக்கு மழை எதிர்பார்க்கப்படுகிறது. நீர் மற்றும் மின்சாரம் சேமிக்க தவிர்க்கவும்.',
  },
  {
    id: 'irr_3', title: 'Borewell Pump — Chilli Plot', titleTa: 'ஆழ்துளை பம்ப் — மிளகாய் தோட்டம்',
    time: '07:00 AM (Tomorrow)', status: 'pending',
    note: 'Run 30 min if no rain overnight. Check soil moisture first.', noteTa: 'இரவு மழை இல்லை என்றால் 30 நிமிடம் ஓட்டவும். முதலில் மண் ஈரப்பதத்தை சரிபார்க்கவும்.',
  },
];

// ─── Helper Components ──────────────────────────────────────────────
function getWeatherIcon(condition: WeatherCondition, size = 'w-6 h-6') {
  switch (condition) {
    case 'sunny': return <Sun className={`${size} text-amber-500`} />;
    case 'partly_cloudy': return <CloudSun className={`${size} text-amber-400`} />;
    case 'cloudy': return <Cloud className={`${size} text-earth-400`} />;
    case 'rainy': return <CloudRain className={`${size} text-blue-500`} />;
    case 'thunderstorm': return <CloudLightning className={`${size} text-purple-500`} />;
    case 'drizzle': return <CloudDrizzle className={`${size} text-blue-400`} />;
    default: return <Sun className={`${size} text-amber-500`} />;
  }
}

function getConditionLabel(condition: WeatherCondition, lang: string) {
  const labels: Record<WeatherCondition, { en: string; ta: string }> = {
    sunny: { en: 'Sunny', ta: 'வெயில்' },
    partly_cloudy: { en: 'Partly Cloudy', ta: 'ஓரளவு மேகமூட்டம்' },
    cloudy: { en: 'Cloudy', ta: 'மேகமூட்டம்' },
    rainy: { en: 'Rainy', ta: 'மழை' },
    thunderstorm: { en: 'Thunderstorm', ta: 'இடியுடன் மழை' },
    drizzle: { en: 'Drizzle', ta: 'தூறல்' },
  };
  return lang === 'ta' ? labels[condition].ta : labels[condition].en;
}

// ─── Main Component ─────────────────────────────────────────────────
export default function WeatherBoard() {
  const { t, language } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);
  const isTamil = language === 'ta';

  const selected = FORECAST_7DAY[selectedDay];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <CloudSun className="w-7 h-7 text-amber-500" />
          {t('weather_intelligence_title') || 'Weather Intelligence'}
        </h1>
        <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
          {t('weather_intelligence_desc') || 'Madurai East, Tamil Nadu — Real-time weather insights for your farm'}
        </p>
      </div>

      {/* ── Current Weather Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-gradient-to-br from-blue-500/5 via-white to-amber-500/5 dark:from-blue-950/30 dark:via-[#111714] dark:to-amber-950/20 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Main temp & condition */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 to-blue-400/20 dark:from-amber-500/10 dark:to-blue-500/10 flex items-center justify-center">
              {getWeatherIcon(CURRENT_WEATHER.condition, 'w-10 h-10')}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground tracking-tighter">{CURRENT_WEATHER.temp}°</span>
                <span className="text-lg font-bold text-earth-400">C</span>
              </div>
              <p className="text-sm font-bold text-earth-500 dark:text-earth-400 mt-0.5">
                {getConditionLabel(CURRENT_WEATHER.condition, language)}
              </p>
              <p className="text-[10px] font-mono font-bold text-earth-400 mt-0.5">
                {isTamil ? 'உணர்வு' : 'Feels like'} {CURRENT_WEATHER.feelsLike}°C
              </p>
            </div>
          </div>

          {/* Right: Weather stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Droplets, label: isTamil ? 'ஈரப்பதம்' : 'Humidity', value: `${CURRENT_WEATHER.humidity}%`, color: 'text-blue-500' },
              { icon: Wind, label: isTamil ? 'காற்று' : 'Wind', value: `${CURRENT_WEATHER.windSpeed} km/h ${CURRENT_WEATHER.windDir}`, color: 'text-teal-500' },
              { icon: Umbrella, label: isTamil ? 'மழை வாய்ப்பு' : 'Rain Chance', value: `${CURRENT_WEATHER.rainProbability}%`, color: 'text-indigo-500' },
              { icon: Eye, label: isTamil ? 'தெரிவுநிலை' : 'Visibility', value: `${CURRENT_WEATHER.visibility} km`, color: 'text-earth-500' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-2xl bg-white/60 dark:bg-earth-950/30 border border-earth-100/50 dark:border-earth-900/20">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-black text-foreground mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sun times */}
        <div className="flex items-center gap-6 mt-5 pt-4 border-t border-earth-100/40 dark:border-earth-900/10">
          <div className="flex items-center gap-2 text-xs font-bold text-earth-500">
            <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
            <span>{isTamil ? 'சூரிய உதயம்' : 'Sunrise'}: {CURRENT_WEATHER.sunrise}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-earth-500">
            <ArrowDown className="w-3.5 h-3.5 text-orange-500" />
            <span>{isTamil ? 'சூரிய அஸ்தமனம்' : 'Sunset'}: {CURRENT_WEATHER.sunset}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-earth-500 ml-auto">
            <Thermometer className="w-3.5 h-3.5 text-red-400" />
            <span>UV: {CURRENT_WEATHER.uvIndex}/11</span>
          </div>
        </div>
      </div>

      {/* ── 7-Day Forecast ── */}
      <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary-500" />
          {t('weather_7day_forecast') || '7-Day Forecast'}
        </h3>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {FORECAST_7DAY.map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 w-[100px] p-3 rounded-2xl border text-center cursor-pointer transition-all duration-300 bg-transparent ${
                selectedDay === idx
                  ? 'bg-primary-500/10 dark:bg-primary-500/15 border-primary-500/30 scale-105 shadow-sm'
                  : 'border-earth-100/50 dark:border-earth-900/20 hover:bg-earth-50/50 dark:hover:bg-earth-950/20'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-wider ${selectedDay === idx ? 'text-primary-600 dark:text-primary-400' : 'text-earth-400'}`}>
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

        {/* Selected day detail */}
        <div className="mt-4 p-4 rounded-2xl bg-earth-50/40 dark:bg-earth-950/20 border border-earth-100/40 dark:border-earth-900/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'அதிகபட்சம்' : 'High'}</p>
            <p className="text-lg font-black text-foreground">{selected.high}°C</p>
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'குறைந்தபட்சம்' : 'Low'}</p>
            <p className="text-lg font-black text-foreground">{selected.low}°C</p>
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'ஈரப்பதம்' : 'Humidity'}</p>
            <p className="text-lg font-black text-foreground">{selected.humidity}%</p>
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider">{isTamil ? 'காற்று' : 'Wind'}</p>
            <p className="text-lg font-black text-foreground">{selected.wind} km/h</p>
          </div>
        </div>
      </div>

      {/* ── Rain Probability Gauge + Alerts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Rain Probability */}
        <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-500" />
            {t('weather_rain_probability') || 'Rain Probability Today'}
          </h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              {/* Background arc */}
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-earth-100 dark:text-earth-900/30" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(CURRENT_WEATHER.rainProbability / 100) * 314} 314`}
                  className={`${CURRENT_WEATHER.rainProbability >= 70 ? 'text-blue-500' : CURRENT_WEATHER.rainProbability >= 40 ? 'text-amber-500' : 'text-primary-500'} transition-all duration-700`}
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground">{CURRENT_WEATHER.rainProbability}%</span>
                <span className="text-[9px] font-mono font-bold text-earth-400 uppercase">{isTamil ? 'மழை' : 'Rain'}</span>
              </div>
            </div>
          </div>
          <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 text-center mt-2">
            {CURRENT_WEATHER.rainProbability >= 70
              ? (isTamil ? '🌧️ அதிக மழை வாய்ப்பு — வெளிப்புற வேலைகளை தள்ளிவைக்கவும்' : '🌧️ High chance of rain — postpone outdoor field work')
              : CURRENT_WEATHER.rainProbability >= 40
              ? (isTamil ? '⛅ மிதமான மழை வாய்ப்பு — குடை எடுத்துச் செல்லவும்' : '⛅ Moderate rain chance — carry rain protection')
              : (isTamil ? '☀️ குறைந்த மழை வாய்ப்பு — பாசனம் தேவை' : '☀️ Low rain chance — irrigation needed')
            }
          </p>
        </div>

        {/* Weather Alerts */}
        <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            {t('weather_alerts_title') || 'Weather Alerts'}
          </h3>
          <div className="space-y-3">
            {WEATHER_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  alert.type === 'warning'
                    ? 'bg-red-500/5 border-red-500/15 dark:bg-red-950/20 dark:border-red-900/20'
                    : alert.type === 'watch'
                    ? 'bg-amber-500/5 border-amber-500/15 dark:bg-amber-950/20 dark:border-amber-900/20'
                    : 'bg-blue-500/5 border-blue-500/15 dark:bg-blue-950/20 dark:border-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : alert.type === 'watch' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground">
                      {isTamil ? alert.titleTa : alert.title}
                    </p>
                    <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 mt-1 leading-relaxed">
                      {isTamil ? alert.descriptionTa : alert.description}
                    </p>
                    <p className="text-[9px] font-mono font-bold text-earth-400 mt-2">
                      {isTamil ? 'செல்லுபடியாகும்' : 'Valid until'}: {alert.validUntil}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Crop Impact Suggestions ── */}
      <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-primary-500" />
          {t('weather_crop_impact') || 'Crop Impact Suggestions'}
        </h3>
        <p className="text-xs text-earth-500 dark:text-earth-400 mb-4">
          {t('weather_crop_impact_desc') || 'Weather-based recommendations for your active crops'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CROP_IMPACTS.map((impact) => (
            <div
              key={impact.id}
              className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-sm ${
                impact.priority === 'high'
                  ? 'border-red-500/15 bg-red-500/3 dark:bg-red-950/10 dark:border-red-900/15'
                  : impact.priority === 'medium'
                  ? 'border-amber-500/15 bg-amber-500/3 dark:bg-amber-950/10 dark:border-amber-900/15'
                  : 'border-primary-500/15 bg-primary-500/3 dark:bg-primary-950/10 dark:border-primary-900/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  impact.priority === 'high' ? 'bg-red-500/10' : impact.priority === 'medium' ? 'bg-amber-500/10' : 'bg-primary-500/10'
                }`}>
                  {impact.icon === 'rain' ? <CloudRain className="w-4.5 h-4.5 text-blue-500" /> :
                   impact.icon === 'humidity' ? <Droplets className="w-4.5 h-4.5 text-teal-500" /> :
                   impact.icon === 'wind' ? <Wind className="w-4.5 h-4.5 text-slate-500" /> :
                   <Thermometer className="w-4.5 h-4.5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-foreground">{isTamil ? impact.cropTa : impact.crop}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                      impact.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                      impact.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    }`}>
                      {impact.priority === 'high' ? (isTamil ? 'அவசரம்' : 'URGENT') :
                       impact.priority === 'medium' ? (isTamil ? 'கவனம்' : 'CAUTION') :
                       (isTamil ? 'தகவல்' : 'INFO')}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 leading-relaxed">
                    {isTamil ? impact.suggestionTa : impact.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Irrigation Reminders ── */}
      <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Waves className="w-4 h-4 text-blue-500" />
          {t('weather_irrigation_title') || 'Smart Irrigation Reminders'}
        </h3>
        <p className="text-xs text-earth-500 dark:text-earth-400 mb-4">
          {t('weather_irrigation_desc') || 'Weather-adjusted irrigation schedule for your farm'}
        </p>
        <div className="space-y-3">
          {IRRIGATION_REMINDERS.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all duration-200 ${
                rem.status === 'done'
                  ? 'border-primary-500/15 bg-primary-500/3 dark:bg-primary-950/10 dark:border-primary-900/15 opacity-70'
                  : rem.status === 'skip'
                  ? 'border-amber-500/15 bg-amber-500/3 dark:bg-amber-950/10 dark:border-amber-900/15'
                  : 'border-blue-500/15 bg-blue-500/3 dark:bg-blue-950/10 dark:border-blue-900/15'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                rem.status === 'done' ? 'bg-primary-500/10' : rem.status === 'skip' ? 'bg-amber-500/10' : 'bg-blue-500/10'
              }`}>
                {rem.status === 'done' ? <CheckCircle className="w-4.5 h-4.5 text-primary-500" /> :
                 rem.status === 'skip' ? <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> :
                 <Clock className="w-4.5 h-4.5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-foreground">{isTamil ? rem.titleTa : rem.title}</p>
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0 ${
                    rem.status === 'done' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' :
                    rem.status === 'skip' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {rem.status === 'done' ? (isTamil ? 'முடிந்தது' : 'DONE') :
                     rem.status === 'skip' ? (isTamil ? 'தவிர்' : 'SKIP') :
                     (isTamil ? 'நிலுவை' : 'PENDING')}
                  </span>
                </div>
                <p className="text-[10px] font-mono font-bold text-earth-400 mt-1">⏰ {rem.time}</p>
                <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 mt-1.5 leading-relaxed">
                  {isTamil ? rem.noteTa : rem.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
