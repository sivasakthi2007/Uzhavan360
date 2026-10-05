'use client';

import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, UserCheck, X } from 'lucide-react';
import { ooruConnectBackend, ServiceContact } from '../services/ooruConnectService';

interface SwipeToConnectProps {
  currentScreen: string;
  currentFeature?: string;
  requestId?: string;
  serviceType?: string;
  onCallInitiated?: (contact: ServiceContact) => void;
}

export const SwipeToConnect: React.FC<SwipeToConnectProps> = ({
  currentScreen,
  currentFeature,
  requestId,
  serviceType,
  onCallInitiated,
}) => {
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Automatically resolve contact based on current screen context
  const resolvedContact: ServiceContact = ooruConnectBackend.resolveRelevantContact({
    currentScreen,
    currentFeature,
    requestId,
    serviceType,
  });

  const handleDrag = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // Simple drag threshold calculation
    setSwipeProgress((prev) => Math.min(100, prev + 15));
    if (swipeProgress >= 80 && !showConfirmation) {
      setShowConfirmation(true);
      setIsSwiping(false);
      setSwipeProgress(0);
    }
  };

  const handleConfirmCall = () => {
    setShowConfirmation(false);
    if (onCallInitiated) onCallInitiated(resolvedContact);
    window.location.href = `tel:${resolvedContact.phone}`;
  };

  return (
    <div className="w-full max-w-md mx-auto my-3">
      {/* Swipe / Tap Bar Container */}
      <div 
        className="relative bg-gradient-to-r from-emerald-700 to-green-600 rounded-2xl p-2.5 shadow-md border border-emerald-500/30 text-white overflow-hidden select-none touch-none cursor-pointer"
        onMouseDown={() => setIsSwiping(true)}
        onMouseMove={handleDrag}
        onMouseUp={() => setIsSwiping(false)}
        onTouchStart={() => setIsSwiping(true)}
        onTouchMove={handleDrag}
        onTouchEnd={() => setIsSwiping(false)}
        onClick={() => setShowConfirmation(true)}
      >
        {/* Fill animation */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-emerald-400/40 transition-all duration-75"
          style={{ width: `${swipeProgress}%` }}
        />

        <div className="flex items-center justify-between relative z-10 px-3 py-1">
          {/* Handle icon */}
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow font-bold shrink-0">
            <Phone className="w-5 h-5 animate-pulse" />
          </div>

          {/* Label */}
          <div className="text-center flex-1 px-3">
            <p className="text-sm font-black text-white flex items-center justify-center gap-1.5">
              <span>👉 தொடர்பு கொள்ள</span>
              <ArrowRight className="w-4 h-4" />
            </p>
            <p className="text-[11px] font-semibold text-emerald-100">
              {resolvedContact.name} ({resolvedContact.phone})
            </p>
          </div>

          <span className="text-[10px] bg-emerald-950/60 text-emerald-200 px-2.5 py-1 rounded-full font-medium">
            Swipe / Tap
          </span>
        </div>
      </div>

      {/* Safe Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161d19] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in duration-150 border border-emerald-500/20">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-black text-base">இந்த நபரை தொடர்பு கொள்ள வேண்டுமா?</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowConfirmation(false); }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#111714] p-4 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{resolvedContact.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{resolvedContact.role}</p>
                </div>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl mt-2">
                📍 {resolvedContact.village} • {resolvedContact.contextDescription}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirmation(false); }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleConfirmCall(); }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeToConnect;

