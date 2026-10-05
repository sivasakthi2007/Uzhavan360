'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SwipeToConnect from '@/components/SwipeToConnect';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';
import {
  Users,
  Wrench,
  Tractor,
  Store,
  Truck,
  Warehouse,
  Sprout,
  FileText,
  CreditCard,
  UserCheck,
  Mic,
  MapPin,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  ChevronRight,
  Filter,
  PlusCircle,
  AlertCircle,
  Phone
} from 'lucide-react';

interface NeedCategory {
  id: string;
  nameEn: string;
  nameTa: string;
  icon: React.ElementType;
  serviceType: string;
  color: string;
  count: number;
}

interface NearbyProvider {
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
}

export default function OoruConnectBoard() {
  const { language, t, userName } = useApp();
  const isTamil = language === 'ta';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [activeRequestFilter, setActiveRequestFilter] = useState<'all' | 'pending' | 'matched'>('all');
  const [activeVoiceSummary, setActiveVoiceSummary] = useState<{
    service: string;
    requirement: string;
    count: number;
    date: string;
    location: string;
  } | null>(null);

  // 10 Core Categories
  const categories: NeedCategory[] = [
    { id: 'labor', nameEn: 'Labour', nameTa: 'வேலையாட்கள்', icon: Users, serviceType: 'labor', color: 'from-amber-500 to-orange-600', count: 14 },
    { id: 'technician', nameEn: 'Technician', nameTa: 'டெக்னீசியன்', icon: Wrench, serviceType: 'technician', color: 'from-blue-500 to-indigo-600', count: 6 },
    { id: 'equipment', nameEn: 'Equipment Rental', nameTa: 'கருவிகள் வாடகை', icon: Tractor, serviceType: 'equipment', color: 'from-emerald-500 to-teal-600', count: 8 },
    { id: 'buyer', nameEn: 'Buyer / Market', nameTa: 'கொள்முதல் / சந்தை', icon: Store, serviceType: 'fpo', color: 'from-purple-500 to-violet-600', count: 12 },
    { id: 'transport', nameEn: 'Transport', nameTa: 'சரக்கு போக்குவரத்து', icon: Truck, serviceType: 'transport', color: 'from-sky-500 to-cyan-600', count: 5 },
    { id: 'storage', nameEn: 'Cold Storage', nameTa: 'குளிர்சாதன கிடங்கு', icon: Warehouse, serviceType: 'storage', color: 'from-cyan-600 to-blue-700', count: 3 },
    { id: 'agri', nameEn: 'Agri Assistance', nameTa: 'விவசாய உதவி', icon: Sprout, serviceType: 'agronomist', color: 'from-green-500 to-emerald-700', count: 9 },
    { id: 'government', nameEn: 'Govt Assistance', nameTa: 'அரசு நலத்திட்டங்கள்', icon: FileText, serviceType: 'government', color: 'from-amber-600 to-yellow-700', count: 7 },
    { id: 'payment', nameEn: 'Payment Support', nameTa: 'கட்டணம் / ஆர்டர் உதவி', icon: CreditCard, serviceType: 'office', color: 'from-pink-500 to-rose-600', count: 4 },
    { id: 'fos', nameEn: 'FOS Assistance', nameTa: 'FOS உதவி', icon: UserCheck, serviceType: 'fos', color: 'from-teal-600 to-emerald-800', count: 11 },
  ];

  // Nearby providers dataset
  const nearbyProviders: NearbyProvider[] = [
    { id: 'p1', name: 'Raman Squad', role: 'Harvesting Labour Captain', serviceType: 'labor', distanceKm: 2.4, available: true, vouchedCount: 6, phone: '+91 98765 43210', village: 'Melur', rating: 4.9 },
    { id: 'p2', name: 'Kannan Equipment', role: '55HP Tractor & Rotavator', serviceType: 'equipment', distanceKm: 4.8, available: true, vouchedCount: 8, phone: '+91 98765 43211', village: 'Vadipatti', rating: 4.8 },
    { id: 'p3', name: 'Senthil Kumar', role: 'Motor & Drip Irrigation Tech', serviceType: 'technician', distanceKm: 6.2, available: true, vouchedCount: 4, phone: '+91 98765 43212', village: 'Melur', rating: 4.7 },
    { id: 'p4', name: 'Karur Agri Cold Storage', role: 'Multi-Commodity Warehouse', serviceType: 'storage', distanceKm: 8.1, available: true, vouchedCount: 12, phone: '+91 98765 43213', village: 'Karur Industrial', rating: 4.9 },
    { id: 'p5', name: 'Murugan Transport', role: '3.5 Ton Freight Truck', serviceType: 'transport', distanceKm: 3.5, available: false, vouchedCount: 5, phone: '+91 98765 43214', village: 'Vadipatti', rating: 4.6 },
    { id: 'p6', name: 'Dr. Arumugam VAO', role: 'Government Agri Extension Officer', serviceType: 'government', distanceKm: 1.5, available: true, vouchedCount: 15, phone: '+91 98765 43215', village: 'Melur Taluk', rating: 5.0 },
  ];

  // Active requests dataset
  const [requests, setRequests] = useState<UserRequest[]>([
    {
      id: 'REQ-101',
      serviceName: isTamil ? 'அறுவடை வேலையாட்கள்' : 'Harvesting Labour',
      requirement: '5 People for paddy harvesting',
      date: isTamil ? 'நாளை' : 'Tomorrow',
      status: 'MATCHED',
      matchedProviderName: 'Raman Squad',
      matchedProviderPhone: '+91 98765 43210',
      serviceType: 'labor'
    },
    {
      id: 'REQ-102',
      serviceName: isTamil ? 'ட்ராக்டர் வாடகை' : 'Tractor Rental',
      requirement: 'Rotavator for 3 acres',
      date: isTamil ? 'இன்று' : 'Today',
      status: 'PENDING',
      serviceType: 'equipment'
    }
  ]);

  const filteredProviders = nearbyProviders.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.serviceType === selectedCategory;
  });

  const availableNowProviders = nearbyProviders.filter(p => p.available);

  // Handle voice intent confirmation
  const handleVoiceIntent = (intentText: string) => {
    // Simulated voice parsing
    setActiveVoiceSummary({
      service: isTamil ? 'வேலையாட்கள்' : 'Labour Squad',
      requirement: intentText || (isTamil ? '5 நபர்கள் அறுவடை தேவை' : '5 people needed for harvesting'),
      count: 5,
      date: isTamil ? 'நாளை' : 'Tomorrow',
      location: 'Melur Village (Current Location)'
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
      serviceType: 'labor'
    };
    setRequests([newReq, ...requests]);
    setActiveVoiceSummary(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-900 via-primary-900 to-earth-950 p-6 sm:p-8 text-white shadow-xl border border-primary-800/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 backdrop-blur-md text-primary-300 text-xs font-bold font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>OoruConnect Dispatch Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              🤝 OoruConnect
            </h1>
            <p className="text-sm text-earth-200 font-semibold leading-relaxed">
              {isTamil 
                ? 'உங்களுக்கு தேவையான சரியான நபருடன் நேரடியாக இணைக்கிறோம். தேடத் தேவையில்லை — ஸ்வைப் செய்து அழைக்கலாம்.' 
                : 'Connecting you directly with the right relevant person based on your context. No searching needed — simply swipe to connect.'}
            </p>
          </div>

          {/* Voice Command Card */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 shrink-0 sm:min-w-[240px]">
            <span className="text-xs font-bold text-earth-100">
              {isTamil ? 'குரல் மூலம் கோரிக்கை பதிவிட' : 'Post request via Voice'}
            </span>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border-0 active:scale-95"
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
              <span>{isTamil ? 'உறுதி செய் (Confirm Request)' : 'Confirm Request'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. "What Do You Need?" Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight font-display">
              {isTamil ? 'உங்களுக்கு என்ன தேவை?' : 'What do you need?'}
            </h2>
            <p className="text-xs text-earth-450 mt-0.5">
              {isTamil ? 'சேவையை தேர்வு செய்க — பொருத்தமான நபர் உடனடி பரிந்துரைக்கப்படுவார்' : 'Select a service — relevant person will be dynamically matched'}
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-primary-500 hover:underline cursor-pointer bg-transparent border-0"
            >
              {isTamil ? 'அனைத்தையும் காட்டு' : 'Reset Filter'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.serviceType;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.serviceType)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-xs'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground tracking-tight">
                    {isTamil ? cat.nameTa : cat.nameEn}
                  </h3>
                  <span className="text-[10px] font-bold text-earth-400 block mt-0.5">
                    {cat.count} {isTamil ? 'இருப்பில்' : 'available'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Request / Context-Aware Connection Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-earth-150/40 dark:border-earth-900/10 pb-4">
          <div>
            <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{isTamil ? 'என் கோரிக்கைகள் (My Requests)' : 'My Requests'}</span>
            </h3>
            <p className="text-xs text-earth-450 mt-0.5">
              {isTamil ? 'உங்களின் கோரிக்கைகள் மற்றும் நேரடி இணைப்பு' : 'Your active requests and dynamic call connections'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveRequestFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                activeRequestFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600'
              }`}
            >
              {isTamil ? 'அனைத்தும்' : 'All'}
            </button>
            <button
              onClick={() => setActiveRequestFilter('matched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                activeRequestFilter === 'matched' ? 'bg-emerald-600 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600'
              }`}
            >
              {isTamil ? 'இணைக்கப்பட்டது' : 'Matched'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/30 border border-earth-200/50 dark:border-earth-900/20 space-y-3">
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
                  {req.status === 'MATCHED' ? (isTamil ? '🟢 நபர் கிடைத்தார்' : '🟢 Provider Found') : (isTamil ? '🟡 தேடுகிறது' : '🟡 Finding Providers')}
                </span>
              </div>

              {/* Context-Aware Swipe Component inside Request */}
              <div className="pt-2 border-t border-earth-150/40 dark:border-earth-900/10">
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

      {/* 5. Nearby Services (10 km Concept) & Available Now */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nearby Services */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-earth-150/40 dark:border-earth-900/10">
            <div>
              <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{isTamil ? 'அருகிலுள்ள சேவைகள் (Nearby Services)' : 'Nearby Services (10 km)'}</span>
              </h3>
              <p className="text-xs text-earth-450 mt-0.5">
                {isTamil ? 'உங்களின் இருப்பிடத்திலிருந்து 10 கி.மீ சுற்றளவில்' : 'Verified providers within your 10 km radius'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProviders.length === 0 ? (
              <div className="p-6 text-center text-xs text-earth-450 italic bg-earth-50/30 rounded-2xl">
                {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட வகைக்கு சேவை எதுவும் அருகிலில்லை.' : 'No suitable service provider currently available within 10 km.'}
              </div>
            ) : (
              filteredProviders.map(p => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-earth-50/40 dark:bg-earth-950/20 border border-earth-200/40 dark:border-earth-900/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-foreground">{p.name}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                        📍 {p.distanceKm} km
                      </span>
                    </div>
                    <p className="text-[11px] text-earth-500 font-semibold">{p.role} • {p.village}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    p.available ? 'bg-emerald-500/10 text-emerald-600' : 'bg-earth-200 dark:bg-earth-800 text-earth-500'
                  }`}>
                    {p.available ? (isTamil ? 'இருப்பில்' : 'Available') : (isTamil ? 'பிஸியாக உள்ளார்' : 'Busy')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Now & Trusted People */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-earth-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-earth-150/40 dark:border-earth-900/10">
            <div>
              <h3 className="text-base font-black text-foreground font-display flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>{isTamil ? 'நம்பகமான நபர்கள் (Trusted People)' : 'Trusted & Vouched People'}</span>
              </h3>
              <p className="text-xs text-earth-450 mt-0.5">
                {isTamil ? 'ஊராரால் உறுதி செய்யப்பட்ட சேவை நபர்கள்' : 'Community verified & vouched by village members'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {availableNowProviders.slice(0, 3).map(p => (
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
