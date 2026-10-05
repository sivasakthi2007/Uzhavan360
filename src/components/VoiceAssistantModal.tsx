'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Check, X, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { ooruConnectBackend, VoiceIntentResult } from '../services/ooruConnectService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRequest?: (result: VoiceIntentResult) => void;
  onIntentExtracted?: (intentText: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSuccessRequest,
  onIntentExtracted,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [intentResult, setIntentResult] = useState<VoiceIntentResult | null>(null);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('கேட்கிறது... பேசுங்கள் (Listening...)');
    setIntentResult(null);

    // Simulate speech recognition & intent extraction (or Web Speech API if supported)
    setTimeout(() => {
      setIsListening(false);
      const simulatedSpeech = 'Naalaikku 5 peru harvesting ku venum';
      setTranscript(simulatedSpeech);
      const res = ooruConnectBackend.processVoiceIntent(simulatedSpeech);
      setIntentResult(res);
    }, 2500);
  };

  const handleConfirmAction = () => {
    if (intentResult && onSuccessRequest) {
      onSuccessRequest(intentResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-lg">குரல் மூலம் கட்டளை (Voice Assistant)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Visualizer */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={handleStartListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="text-sm font-semibold text-slate-600 mt-4">
            {isListening ? '🎙 பேசுங்கள் (Speaking...)' : 'பொத்தானை அழுத்தி பேசுங்கள் (Tap Mic to Speak)'}
          </p>

          {/* Quick Voice Sample Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span 
              onClick={() => {
                setTranscript('Naalaikku 5 peru harvesting ku venum');
                setIntentResult(ooruConnectBackend.processVoiceIntent('Naalaikku 5 peru harvesting ku venum'));
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full cursor-pointer border"
            >
              "Naalaikku 5 peru harvesting"
            </span>
            <span 
              onClick={() => {
                setTranscript('Motor start aagala, mechanic venum');
                setIntentResult(ooruConnectBackend.processVoiceIntent('Motor start aagala, mechanic venum'));
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full cursor-pointer border"
            >
              "Motor start aagala, mechanic"
            </span>
          </div>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>நீங்கள் கூறியது (Your Speech):</span>
            </div>
            <p className="text-sm font-medium text-slate-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Confirmation Block */}
        {intentResult && intentResult.detectedIntent !== 'UNKNOWN' && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 mb-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span>உறுதிப்படுத்தல் (Confirmation Required):</span>
            </div>
            <p className="text-base font-bold text-slate-900 mb-3">
              {intentResult.confirmationTextTa}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIntentResult(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-white"
              >
                இல்லை (No)
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                ஆம் (Confirm)
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-400">
          OoruConnect Voice Engine • "Same Service. Voice Interaction. One Backend."
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;

