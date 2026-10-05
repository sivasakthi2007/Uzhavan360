'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SwipeToConnect from '@/components/SwipeToConnect';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';
import {
  Mic,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Star
} from 'lucide-react';

interface UserRequirementMatch {
  id: string;
  categoryIcon: string;
  categoryTitleTa: string;
  categoryTitleEn: string;
  userRequirementTa: string;
  userRequirementEn: string;
  personName: string;
  personRole: string;
  distanceKm: number;
  isTrusted: boolean;
  serviceType: string;
  village: string;
}

export default function OoruConnectBoard() {
  const { language } = useApp();
  const isTamil = language === 'ta';

  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [activeVoiceSummary, setActiveVoiceSummary] = useState<{
    service: string;
    requirement: string;
    targetTab: string;
  } | null>(null);

  // Active Real Matches derived from active user needs
  const [matchedItems, setMatchedItems] = useState<UserRequirementMatch[]>([
    {
      id: 'req_1',
      categoryIcon: '👷',
      categoryTitleTa: 'அறுவடை வேலை',
      categoryTitleEn: 'Harvesting Work',
      userRequirementTa: 'நீங்கள் கேட்டது: 5 பேர்',
      userRequirementEn: 'You requested: 5 workers',
      personName: 'Raman Squad',
      personRole: 'Harvesting Labour Captain',
      distanceKm: 2.4,
      isTrusted: true,
      serviceType: 'labor',
      village: 'Melur Village'
    },
    {
      id: 'req_2',
      categoryIcon: '🚜',
      categoryTitleTa: 'டிராக்டர் தேவை',
      categoryTitleEn: 'Tractor Required',
      userRequirementTa: 'நீங்கள் கேட்டது: 3 ஏக்கருக்கு Rotavator',
      userRequirementEn: 'You requested: Rotavator for 3 acres',
      personName: 'Kannan Equipment',
      personRole: '55HP Tractor Provider',
      distanceKm: 4.8,
      isTrusted: true,
      serviceType: 'equipment',
      village: 'Vadipatti'
    },
    {
      id: 'req_3',
      categoryIcon: '🔧',
      categoryTitleTa: 'பழுதுபார்ப்பு உதவி',
      categoryTitleEn: 'Repair Assistance',
      userRequirementTa: 'நீங்கள் கேட்டது: Drip irrigation check',
      userRequirementEn: 'You requested: Drip irrigation check',
      personName: 'Senthil Kumar',
      personRole: 'Certified Irrigation Technician',
      distanceKm: 6.2,
      isTrusted: true,
      serviceType: 'technician',
      village: 'Melur Village'
    }
  ]);

  // Handle voice intent confirmation
  const handleVoiceIntent = (intentText: string) => {
    setActiveVoiceSummary({
      service: isTamil ? 'வேலையாட்கள்' : 'Labour Squad',
      requirement: intentText || (isTamil ? '5 நபர்கள் அறுவடை தேவை' : '5 people needed for harvesting'),
      targetTab: 'labor'
    });
  };

  const handleConfirmVoiceRequest = () => {
    if (!activeVoiceSummary) return;
    
    // Add newly created request to matched list
    const newItem: UserRequirementMatch = {
      id: `req_${Date.now()}`,
      categoryIcon: '👷',
      categoryTitleTa: 'அறுவடை வேலை',
      categoryTitleEn: 'Harvesting Request',
      userRequirementTa: `நீங்கள் கேட்டது: ${activeVoiceSummary.requirement}`,
      userRequirementEn: `You requested: ${activeVoiceSummary.requirement}`,
      personName: 'Raman Squad',
      personRole: 'Harvesting Squad Lead',
      distanceKm: 1.8,
      isTrusted: true,
      serviceType: 'labor',
      village: 'Local Village'
    };

    setMatchedItems(prev => [newItem, ...prev]);
    setActiveVoiceSummary(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 px-2 sm:px-4">
      
      {/* 1. Header */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2">
            <span>🤝 OoruConnect</span>
          </h1>
          <h2 className="text-base sm:text-lg font-bold text-emerald-200 mt-1">
            {isTamil ? 'உதவி வேண்டுமா? சரியான நபரை கண்டுபிடிக்கிறோம்.' : 'Need help? We find the right person for you.'}
          </h2>
        </div>

        {/* 2. Primary Voice Action */}
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>{isTamil ? 'முதன்மை செயல்' : 'Primary Action'}</span>
            </div>
            <p className="text-sm font-bold text-white">
              {isTamil ? 'உங்களுக்கு என்ன உதவி வேண்டும் என்று சொல்லுங்கள்.' : 'Tell us what help you need.'}
            </p>
            <p className="text-xs text-emerald-200 italic">
              {isTamil ? 'உதாரணம்: "நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்."' : 'Example: "Need 5 workers for harvesting tomorrow."'}
            </p>
          </div>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border-0 active:scale-95 shrink-0"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span>🎙️ {isTamil ? 'பேசுங்கள்' : 'Speak Now'}</span>
          </button>
        </div>
      </div>

      {/* Voice Confirmation Banner if active */}
      {activeVoiceSummary && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-foreground space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-foreground">
                {isTamil ? 'இந்த உதவியை பதிவு செய்யவா?' : 'Confirm this request?'}
              </h3>
              <p className="text-xs text-earth-450 mt-0.5">
                {activeVoiceSummary.requirement}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setActiveVoiceSummary(null)}
              className="py-2 px-4 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-700 dark:text-earth-300 text-xs font-bold cursor-pointer border-0"
            >
              {isTamil ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirmVoiceRequest}
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer border-0 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTamil ? 'உறுதி செய் (Confirm)' : 'Confirm'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Matched People Section */}
      {matchedItems.length > 0 ? (
        <div className="space-y-5">
          <div className="border-b border-earth-200/60 dark:border-earth-850 pb-3">
            <h2 className="text-lg font-black text-foreground font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{isTamil ? '👥 உங்களுக்கு கிடைத்தவர்கள்' : '👥 People Matched For You'}</span>
            </h2>
            <p className="text-xs text-earth-450 mt-0.5 font-semibold">
              {isTamil ? 'உங்கள் தேவைக்கு பொருந்தியவர்கள்' : 'Relevant contacts found based on your need'}
            </p>
          </div>

          <div className="space-y-4">
            {matchedItems.map((item) => (
              <div 
                key={item.id} 
                className="p-5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/80 dark:border-earth-850 shadow-sm space-y-3 hover:border-emerald-500/40 transition-all"
              >
                {/* Need Title & Requirement */}
                <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/60 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.categoryIcon}</span>
                    <h3 className="text-base font-black text-foreground">
                      {isTamil ? item.categoryTitleTa : item.categoryTitleEn}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {isTamil ? item.userRequirementTa : item.userRequirementEn}
                  </span>
                </div>

                {/* Person details */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-base shrink-0">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-foreground">{item.personName}</h4>
                        {item.isTrusted && (
                          <span className="text-[10px] font-black px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{isTamil ? 'நம்பகமானவர்' : 'Trusted'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-earth-500 dark:text-earth-400 font-semibold mt-0.5">
                        {item.personRole} • 📍 {item.distanceKm} km ({item.village})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Swipe to Connect Widget */}
                <div className="pt-2">
                  <SwipeToConnect
                    currentScreen="OoruConnectBoard"
                    currentFeature={item.categoryTitleTa}
                    requestId={item.id}
                    serviceType={item.serviceType}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 8. Empty State */
        <div className="p-8 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/80 dark:border-earth-850 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            🤝
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground">
              {isTamil ? 'இன்னும் பொருத்தமான நபர் கிடைக்கவில்லை' : 'No matched person found yet'}
            </h3>
            <p className="text-xs text-earth-450 font-bold">
              {isTamil ? 'முதலில் உங்கள் தேவையை சொல்லுங்கள்.' : 'First tell us what help you need.'}
            </p>
          </div>
          <button
            onClick={() => setShowVoiceModal(true)}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-500/30 inline-flex items-center gap-2 cursor-pointer border-0"
          >
            <Mic className="w-4 h-4" />
            <span>🎙️ {isTamil ? 'பேசுங்கள்' : 'Speak Now'}</span>
          </button>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onIntentExtracted={handleVoiceIntent}
      />
    </div>
  );
}
