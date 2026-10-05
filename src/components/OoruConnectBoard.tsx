'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import SwipeToConnect from '@/components/SwipeToConnect';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';
import {
  Users,
  Wrench,
  Tractor,
  Store,
  Truck,
  FileText,
  UserCheck,
  Mic,
  MapPin,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Phone,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ActiveMatch {
  id: string;
  serviceName: string;
  requirement: string;
  matchedPersonName: string;
  matchedPersonRole: string;
  distanceKm: number;
  phone: string;
  village: string;
  rating: number;
  vouchedCount: number;
  serviceType: string;
  targetTab: string;
}

export default function OoruConnectBoard() {
  const { language } = useApp();
  const isTamil = language === 'ta';
  const router = useRouter();

  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [activeVoiceSummary, setActiveVoiceSummary] = useState<{
    service: string;
    requirement: string;
    count: number;
    date: string;
    location: string;
    targetTab: string;
  } | null>(null);

  // Active Real Matches derived from active user needs & requests
  const activeMatches: ActiveMatch[] = [
    {
      id: 'MATCH-101',
      serviceName: isTamil ? 'அறுவடை வேலையாட்கள்' : 'Harvesting Labour Squad',
      requirement: '5 People for paddy harvesting',
      matchedPersonName: 'Raman Squad',
      matchedPersonRole: 'Harvesting Labour Captain',
      distanceKm: 2.4,
      phone: '+91 98765 43210',
      village: 'Melur Village',
      rating: 4.9,
      vouchedCount: 6,
      serviceType: 'labor',
      targetTab: 'labor'
    },
    {
      id: 'MATCH-102',
      serviceName: isTamil ? 'ட்ராக்டர் வாடகை' : 'Tractor & Rotavator',
      requirement: 'Rotavator for 3 acres tilling',
      matchedPersonName: 'Kannan Equipment',
      matchedPersonRole: '55HP Tractor Provider',
      distanceKm: 4.8,
      phone: '+91 98765 43211',
      village: 'Vadipatti',
      rating: 4.8,
      vouchedCount: 8,
      serviceType: 'equipment',
      targetTab: 'rentals'
    },
    {
      id: 'MATCH-103',
      serviceName: isTamil ? 'மோட்டார் பழுதுபார்ப்பு' : 'Motor & Drip Repair',
      requirement: 'Drip irrigation line check',
      matchedPersonName: 'Senthil Kumar',
      matchedPersonRole: 'Certified Irrigation Technician',
      distanceKm: 6.2,
      phone: '+91 98765 43212',
      village: 'Melur Village',
      rating: 4.7,
      vouchedCount: 4,
      serviceType: 'technician',
      targetTab: 'labor'
    }
  ];

  // Navigate directly to existing Uzhavan360 feature page
  const navigateToFeature = (targetTab: string, sub?: string) => {
    let url = `/dashboard?tab=${targetTab}&from=ooruconnect`;
    if (sub) url += `&sub=${sub}`;
    router.push(url);
  };

  // Handle voice intent confirmation
  const handleVoiceIntent = (intentText: string) => {
    setActiveVoiceSummary({
      service: isTamil ? 'வேலையாட்கள்' : 'Labour Squad',
      requirement: intentText || (isTamil ? '5 நபர்கள் அறுவடை தேவை' : '5 people needed for harvesting'),
      count: 5,
      date: isTamil ? 'நாளை' : 'Tomorrow',
      location: 'Melur Village (Current Location)',
      targetTab: 'labor'
    });
  };

  const handleConfirmVoiceRequest = () => {
    if (!activeVoiceSummary) return;
    setActiveVoiceSummary(null);
    navigateToFeature(activeVoiceSummary.targetTab);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* 1. OoruConnect Header */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-900 via-primary-900 to-earth-950 p-6 sm:p-8 text-white shadow-xl border border-primary-800/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 backdrop-blur-md text-primary-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OoruConnect Dispatch Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span>🤝 OoruConnect</span>
            </h1>
            <h2 className="text-lg font-bold text-emerald-200">
              {isTamil ? 'சரியான நபருடன் நேரடியாக இணைக' : 'Connect directly with the right relevant person'}
            </h2>
            <p className="text-xs text-earth-200 font-semibold leading-relaxed">
              {isTamil 
                ? 'உங்களின் தேவைகளுக்கேற்ப கண்டறியப்பட்ட நபருடன் ஒரே ஸ்வைப்பில் தொடர்புகொள்ளுங்கள்.' 
                : 'Match with verified local service providers and swipe to connect instantly.'}
            </p>
          </div>

          {/* Voice Action */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 shrink-0 sm:min-w-[220px]">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              {isTamil ? 'குரல் மூலம் கோரிக்கை' : 'Voice Request'}
            </span>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border-0 active:scale-95"
            >
              <Mic className="w-4 h-4 animate-bounce" />
              <span>🎙️ {isTamil ? 'பேசுங்கள்' : 'Speak Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Voice Request Summary Modal Confirmation */}
      {activeVoiceSummary && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-foreground space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-black text-foreground">
                {isTamil ? 'இந்த தேவையை பதிவு செய்யவா?' : 'Confirm creating this request?'}
              </h3>
              <p className="text-xs text-earth-450 mt-1">
                {isTamil ? 'குரல் மூலம் பெறப்பட்ட விவரங்கள் கீழே சரிபார்க்கப்பட்டது:' : 'Extracted request details from voice:'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#111714] p-4 rounded-xl border border-earth-200 dark:border-earth-850 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-earth-400 block">Service</span>
              <span className="font-bold text-foreground">{activeVoiceSummary.service}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-earth-400 block">Requirement</span>
              <span className="font-bold text-foreground">{activeVoiceSummary.requirement}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-earth-400 block">Date</span>
              <span className="font-bold text-foreground">{activeVoiceSummary.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-earth-400 block">Location</span>
              <span className="font-bold text-foreground">{activeVoiceSummary.location}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setActiveVoiceSummary(null)}
              className="py-2.5 px-4 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-700 text-xs font-bold cursor-pointer border-0"
            >
              {isTamil ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirmVoiceRequest}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer border-0 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTamil ? 'உறுதி செய் (Confirm & Open Service)' : 'Confirm & Open Service'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Section: 🤝 உங்கள் Matches (Your Active Matches) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-earth-150/40 dark:border-earth-900/10 pb-4">
          <div>
            <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-emerald-500" />
              <span>{isTamil ? '🤝 உங்கள் Matches' : '🤝 Your Active Matches'}</span>
            </h3>
            <p className="text-xs text-earth-450 mt-0.5">
              {isTamil ? 'உங்களின் தேவைகளுக்கேற்ப பொருத்தப்பட்ட நபர்கள் — ஸ்வைப் செய்து அழைக்கலாம்' : 'Relevant matched contacts for your current needs — swipe to call'}
            </p>
          </div>

          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-mono font-bold text-xs">
            {activeMatches.length} {isTamil ? 'பொருத்தங்கள்' : 'Active Matches'}
          </span>
        </div>

        <div className="space-y-5">
          {activeMatches.map((match) => (
            <div 
              key={match.id} 
              className="p-5 rounded-2xl bg-earth-50/50 dark:bg-earth-950/30 border border-earth-200/50 dark:border-earth-900/20 space-y-4 hover:border-primary-500/30 transition-all"
            >
              {/* Match Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-500">{match.id}</span>
                    <h4 className="text-sm font-black text-foreground">{match.serviceName}</h4>
                  </div>
                  <p className="text-xs text-earth-450 font-semibold mt-0.5">{match.requirement}</p>
                </div>

                <button
                  onClick={() => navigateToFeature(match.targetTab)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline border-0 bg-transparent self-start sm:self-auto cursor-pointer"
                >
                  <span>{isTamil ? 'சேவையை காண்க' : 'View Service'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Matched Person Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-base shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-black text-foreground">{match.matchedPersonName}</h5>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                        📍 {match.distanceKm} km
                      </span>
                    </div>
                    <p className="text-[11px] text-earth-500 font-semibold">{match.matchedPersonRole} • {match.village}</p>
                    <div className="flex items-center gap-3 text-[10px] text-earth-400 font-bold mt-1">
                      <span className="text-amber-600">⭐ {match.rating} Rating</span>
                      <span className="text-emerald-600">✓ {match.vouchedCount} {isTamil ? 'நபர்கள் சான்றளித்துள்ளனர்' : 'people vouched'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swipe to Connect Component */}
              <div className="pt-2 border-t border-earth-150/40 dark:border-earth-900/10">
                <SwipeToConnect
                  currentScreen="OoruConnectBoard"
                  currentFeature={match.serviceName}
                  requestId={match.id}
                  serviceType={match.serviceType}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Trusted Connections & Village Verification */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-earth-150/40 dark:border-earth-900/10">
          <div>
            <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{isTamil ? '⭐ சான்றளிக்கப்பட்டவர்கள் (Trusted Connections)' : '⭐ Trusted Connections'}</span>
            </h3>
            <p className="text-xs text-earth-450 mt-0.5">
              {isTamil ? 'ஊராரால் உறுதி செய்யப்பட்ட சேவை நபர்கள்' : 'Community verified & vouched by village members'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activeMatches.map(p => (
            <div key={p.id} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <h4 className="text-xs font-black text-foreground">{p.matchedPersonName}</h4>
                </div>
                <p className="text-[11px] text-earth-500 font-semibold">{p.matchedPersonRole}</p>
                <div className="flex items-center gap-3 text-[10px] text-earth-400 font-bold">
                  <span className="text-amber-600">⭐ {p.rating} Rating</span>
                  <span className="text-emerald-600">✓ {p.vouchedCount} {isTamil ? 'நபர்கள் சான்றளித்துள்ளனர்' : 'people vouched'}</span>
                </div>
              </div>

              <button
                onClick={() => window.location.href = `tel:${p.phone}`}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isTamil ? 'அழைக்க' : 'Call'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onIntentExtracted={handleVoiceIntent}
      />

    </div>
  );
}
