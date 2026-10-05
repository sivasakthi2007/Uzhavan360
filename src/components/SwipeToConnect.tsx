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
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 max-w-md mx-auto">
      {/* Swipe Bar Container */}
      <div 
        className="relative bg-gradient-to-r from-emerald-800 to-green-700 rounded-2xl p-2 shadow-xl border-2 border-emerald-400/40 text-white overflow-hidden select-none touch-none"
        onMouseDown={() => setIsSwiping(true)}
        onMouseMove={handleDrag}
        onMouseUp={() => setIsSwiping(false)}
        onTouchStart={() => setIsSwiping(true)}
        onTouchMove={handleDrag}
        onTouchEnd={() => setIsSwiping(false)}
      >
        {/* Fill animation */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-emerald-500/40 transition-all duration-75"
          style={{ width: `${swipeProgress}%` }}
        />

        <div className="flex items-center justify-between relative z-10 px-3 py-1.5">
          {/* Swipe Button Handle */}
          <div className="w-12 h-12 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow-lg font-bold">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>

          {/* Label */}
          <div className="text-center flex-1 px-2">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              {resolvedContact.name}
            </p>
            <p className="text-sm font-bold text-white flex items-center justify-center gap-1">
              <span>இணைக்க ஸ்வைப் செய்யவும்</span>
              <ArrowRight className="w-4 h-4" />
            </p>
          </div>

          <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-1 rounded-full font-mono">
            Context Connect
          </span>
        </div>
      </div>

      {/* Safe Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-bold text-lg">அழைப்பு உறுதிப்படுத்தல்</span>
              </div>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{resolvedContact.name}</h4>
                  <p className="text-xs text-slate-500">{resolvedContact.role}</p>
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-xl mt-2">
                📍 {resolvedContact.village} • {resolvedContact.contextDescription}
              </p>
            </div>

            <p className="text-sm font-medium text-slate-600 mb-6 text-center">
              நீங்கள் <b>{resolvedContact.name}</b> அவர்களை தொலைபேசியில் அழைக்க விரும்புகிறீர்களா?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              >
                ரத்து (Cancel)
              </button>
              <button
                onClick={handleConfirmCall}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                அழைக்கவும் (Call)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeToConnect;

