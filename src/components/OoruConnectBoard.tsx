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

interface NeedOption {
  id: string;
  nameEn: string;
  nameTa: string;
  subtextEn: string;
  subtextTa: string;
  icon: React.ElementType;
  serviceType: string;
  color: string;
  targetTab: string;
  targetSub?: string;
}

interface NearbyMatch {
  id: string;
  name: string;
  role: string;
  serviceType: string;
  distanceKm: number;
  available: boolean;
  vouchedCount: number;
  phone: string;
  village: string;
  rating: number;
  targetTab: string;
}

interface UserRequest {
  id: string;
  serviceName: string;
  requirement: string;
  date: string;
  status: 'PENDING' | 'MATCHED' | 'COMPLETED';
  matchedProviderName?: string;
  matchedProviderPhone?: string;
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

  // Simple Need Categories (No availability counts, direct Uzhavan360 routes)
  const needOptions: NeedOption[] = [
    {
      id: 'labor',
      nameEn: 'Need Labour Squad',
      nameTa: 'ஒருவர் உதவி வேண்டும் (வேலையாட்கள்)',
      subtextEn: 'Paddy harvesting, weeding & farm work',
      subtextTa: 'அறுவடை, களை எடுத்தல் & பண்ணை வேலைகள்',
      icon: Users,
      serviceType: 'labor',
      color: 'from-amber-500 to-orange-600',
      targetTab: 'labor'
    },
    {
      id: 'technician',
      nameEn: 'Need Technical Repair',
      nameTa: 'தொழில்நுட்ப உதவி வேண்டும்',
      subtextEn: 'Solar pump, motor & drip irrigation technician',
      subtextTa: 'மோட்டார், சொட்டுநீர் & சோலார் பம்ப் பழுது',
      icon: Wrench,
      serviceType: 'technician',
      color: 'from-blue-500 to-indigo-600',
      targetTab: 'labor',
      targetSub: 'technician'
    },
    {
      id: 'equipment',
      nameEn: 'Need Equipment / Machine',
      nameTa: 'கருவி அல்லது இயந்திரம் வேண்டும்',
      subtextEn: 'Tractor, rotavator, harvester rental',
      subtextTa: 'ட்ராக்டர், ரொட்டவேட்டர், ஹார்வெஸ்டர் வாடகை',
      icon: Tractor,
      serviceType: 'equipment',
      color: 'from-emerald-500 to-teal-600',
      targetTab: 'rentals'
    },
    {
      id: 'buyer',
      nameEn: 'Need Buyer or Seller',
      nameTa: 'வாங்குபவர் / விற்பவர் தேவை',
      subtextEn: 'FPO bulk trade, harvest sales & market prices',
      subtextTa: 'பயிர் விற்பனை, சந்தை விலை & FPO கொள்முதல்',
      icon: Store,
      serviceType: 'fpo',
      color: 'from-purple-500 to-violet-600',
      targetTab: 'market'
    },
    {
      id: 'transport',
      nameEn: 'Need Transport / Freight',
      nameTa: 'போக்குவரத்து வேண்டும்',
      subtextEn: 'Crop transport, mini-truck & freight booking',
      subtextTa: 'பயிர் சரக்கு லாரி & டிராக்டர் லோடு',
      icon: Truck,
      serviceType: 'transport',
      color: 'from-sky-500 to-cyan-600',
      targetTab: 'driver'
    },
    {
      id: 'government',
      nameEn: 'Need Government Assistance',
      nameTa: 'அரசு உதவி வேண்டும்',
      subtextEn: 'Subsidy schemes, VAO desk & crop insurance',
      subtextTa: 'மானிய திட்டங்கள், VAO உதவி & காப்பீடு',
      icon: FileText,
      serviceType: 'government',
      color: 'from-amber-600 to-yellow-700',
      targetTab: 'schemes'
    },
    {
      id: 'fos',
      nameEn: 'Need Field Officer (FOS)',
      nameTa: 'FOS உதவி வேண்டும்',
      subtextEn: 'Assisted access, offline support & verification',
      subtextTa: 'நேரடி உதவி & கள அலுவலர் சேவை',
      icon: UserCheck,
      serviceType: 'fos',
      color: 'from-teal-600 to-emerald-800',
      targetTab: 'support'
    },
  ];

  // Nearby matched providers
  const nearbyMatches: NearbyMatch[] = [
    { id: 'm1', name: 'Raman Squad', role: 'Harvesting Labour Captain', serviceType: 'labor', distanceKm: 2.4, available: true, vouchedCount: 6, phone: '+91 98765 43210', village: 'Melur', rating: 4.9, targetTab: 'labor' },
    { id: 'm2', name: 'Kannan Equipment', role: '55HP Tractor & Rotavator', serviceType: 'equipment', distanceKm: 4.8, available: true, vouchedCount: 8, phone: '+91 98765 43211', village: 'Vadipatti', rating: 4.8, targetTab: 'rentals' },
    { id: 'm3', name: 'Senthil Tech', role: 'Motor & Drip Irrigation Tech', serviceType: 'technician', distanceKm: 6.2, available: true, vouchedCount: 4, phone: '+91 98765 43212', village: 'Melur', rating: 4.7, targetTab: 'labor' },
  ];

  // User's active requests
  const [requests, setRequests] = useState<UserRequest[]>([
    {
      id: 'REQ-101',
      serviceName: isTamil ? 'அறுவடை வேலையாட்கள்' : 'Harvesting Labour',
      requirement: '5 People for paddy harvesting',
      date: isTamil ? 'நாளை' : 'Tomorrow',
      status: 'MATCHED',
      matchedProviderName: 'Raman Squad',
      matchedProviderPhone: '+91 98765 43210',
      serviceType: 'labor',
      targetTab: 'labor'
    },
    {
      id: 'REQ-102',
      serviceName: isTamil ? 'ட்ராக்டர் வாடகை' : 'Tractor Rental',
      requirement: 'Rotavator for 3 acres',
      date: isTamil ? 'இன்று' : 'Today',
      status: 'PENDING',
      serviceType: 'equipment',
      targetTab: 'rentals'
    }
  ]);

  // Navigate directly to existing Uzhavan360 page
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
    const newReq: UserRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      serviceName: activeVoiceSummary.service,
      requirement: activeVoiceSummary.requirement,
      date: activeVoiceSummary.date,
      status: 'PENDING',
      serviceType: 'labor',
      targetTab: activeVoiceSummary.targetTab
    };
    setRequests([newReq, ...requests]);
    setActiveVoiceSummary(null);
    navigateToFeature(activeVoiceSummary.targetTab);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-900 via-primary-900 to-earth-950 p-6 sm:p-8 text-white shadow-xl border border-primary-800/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 backdrop-blur-md text-primary-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Uzhavan360 Connection Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              <span>🤝 OoruConnect</span>
            </h1>
            <h2 className="text-lg font-bold text-emerald-200">
              {isTamil ? 'உங்களுக்கு என்ன தேவை?' : 'What do you need?'}
            </h2>
            <p className="text-xs text-earth-200 font-semibold leading-relaxed">
              {isTamil 
                ? 'தேவையை சொல்லுங்கள். Uzhavan360-ல் ஏற்கனவே இருக்கும் சரியான சேவை அல்லது நபருடன் இணைக்கிறோம்.' 
                : 'Speak your requirement. OoruConnect connects you directly to the relevant existing Uzhavan360 service & verified provider.'}
            </p>
          </div>

          {/* Primary Action — Prominent Voice Button */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 shrink-0 sm:min-w-[240px]">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              {isTamil ? 'முதன்மை நடவடிக்கை' : 'Primary Action'}
            </span>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border-0 active:scale-95"
            >
              <Mic className="w-5 h-5 animate-bounce" />
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

      {/* 3. Simple Need Categories -> Click Redirects to Existing Pages */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight font-display">
            {isTamil ? 'தேவையை தேர்வு செய்யவும்' : 'Select your need option'}
          </h2>
          <p className="text-xs text-earth-450 mt-0.5">
            {isTamil ? 'தேவையான விருப்பத்தை கிளிக் செய்யவும் — உரிய உழவன்360 சேவை பக்கத்திற்கு அழைத்துச்செல்லும்' : 'Click a need — redirects directly to the corresponding existing Uzhavan360 page'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {needOptions.map((opt) => {
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                onClick={() => navigateToFeature(opt.targetTab, opt.targetSub)}
                className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 hover:border-primary-500 hover:shadow-lg hover:scale-[1.01] text-left flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group border-0"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${opt.color} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-foreground tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {isTamil ? opt.nameTa : opt.nameEn}
                    </h3>
                    <p className="text-[11px] text-earth-450 font-semibold truncate mt-0.5">
                      {isTamil ? opt.subtextTa : opt.subtextEn}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-earth-100 dark:bg-earth-900 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Requests Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-earth-150/40 dark:border-earth-900/10 pb-4">
          <div>
            <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{isTamil ? '📋 என் கோரிக்கைகள் (My Requests)' : '📋 My Requests'}</span>
            </h3>
            <p className="text-xs text-earth-450 mt-0.5">
              {isTamil ? 'உங்களின் தற்போதைய கோரிக்கைகள் மற்றும் நேரடி அழைப்பு' : 'Your current active requests & call options'}
            </p>
          </div>

          <button
            onClick={() => navigateToFeature('orders')}
            className="text-xs font-bold text-primary-500 hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-1"
          >
            <span>{isTamil ? 'அனைத்தும் காண்க' : 'View All Orders'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/30 border border-earth-200/50 dark:border-earth-900/20 space-y-3 hover:border-primary-500/30 transition-all cursor-pointer"
              onClick={() => navigateToFeature(req.targetTab)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-500">{req.id}</span>
                    <h4 className="text-sm font-black text-foreground">{req.serviceName}</h4>
                  </div>
                  <p className="text-xs text-earth-450 font-semibold mt-0.5">{req.requirement}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  req.status === 'MATCHED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  {req.status === 'MATCHED' ? (isTamil ? '🟢 Matched' : '🟢 Matched') : (isTamil ? '🟡 Finding' : '🟡 Finding')}
                </span>
              </div>

              {/* Context-Aware Swipe Component inside Request */}
              <div className="pt-2 border-t border-earth-150/40 dark:border-earth-900/10" onClick={(e) => e.stopPropagation()}>
                <SwipeToConnect
                  currentScreen="OoruConnectBoard"
                  currentFeature={req.serviceName}
                  requestId={req.id}
                  serviceType={req.serviceType}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Nearby Match & Trusted Connections Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nearby Match Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-earth-150/40 dark:border-earth-900/10">
            <div>
              <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{isTamil ? '📍 அருகிலுள்ள நபர்கள் (Nearby Match)' : '📍 Nearby Match'}</span>
              </h3>
              <p className="text-xs text-earth-450 mt-0.5">
                {isTamil ? 'உங்களின் தேவைகேற்ப 3 பொருத்தமான நபர்கள் அருகில் உள்ளனர்' : '3 suitable people found near your location'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {nearbyMatches.map(m => (
              <div 
                key={m.id} 
                onClick={() => navigateToFeature(m.targetTab)}
                className="p-3.5 rounded-2xl bg-earth-50/40 dark:bg-earth-950/20 border border-earth-200/40 dark:border-earth-900/20 flex items-center justify-between hover:border-primary-500/40 cursor-pointer transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-foreground">{m.name}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                      📍 {m.distanceKm} km
                    </span>
                  </div>
                  <p className="text-[11px] text-earth-500 font-semibold">{m.role} • {m.village}</p>
                </div>

                <button
                  className="py-1.5 px-3 rounded-xl bg-primary-500 text-white font-bold text-[11px] flex items-center gap-1 border-0"
                >
                  <span>{isTamil ? 'பார்க்க' : 'View Match'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted Connections */}
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
            {nearbyMatches.map(p => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <h4 className="text-xs font-black text-foreground">{p.name}</h4>
                  </div>
                  <p className="text-[11px] text-earth-500 font-semibold">{p.role}</p>
                  <div className="flex items-center gap-3 text-[10px] text-earth-400 font-bold">
                    <span className="text-amber-600">⭐ {p.rating} Rating</span>
                    <span className="text-emerald-600">✓ {p.vouchedCount} {isTamil ? 'நபர்கள் சான்றளித்துள்ளனர்' : 'people vouched'}</span>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = `tel:${p.phone}`}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'அழைக்க' : 'Call'}</span>
                </button>
              </div>
            ))}
          </div>
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
