'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Languages, 
  ArrowLeftRight, 
  Copy, 
  Trash2, 
  Loader2, 
  Check, 
  AlertTriangle,
  Volume2,
  Mic
} from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const indianLanguages: LanguageOption[] = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

const globalLanguages: LanguageOption[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
];

const allLanguages = [...indianLanguages, ...globalLanguages];

export default function TranslatorBoard() {
  const { language } = useApp();
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('ta');
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError(language === 'ta' ? 'தயவுசெய்து மொழிபெயர்க்க வேண்டிய உரையை உள்ளிடவும்' : 'Please enter text to translate');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation request failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      
      if (data.detectedLanguage) {
        setDetectedLang(data.detectedLanguage);
      } else {
        setDetectedLang(null);
      }
    } catch (err: any) {
      console.error('[Translator] Request error:', err);
      setError(
        language === 'ta' 
          ? `பிழை: ${err.message || 'நெட்வொர்க் இணைப்பைச் சரிபார்க்கவும்'}` 
          : `Error: ${err.message || 'Please check your internet connection'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const originalSourceText = sourceText;
    const originalTranslatedText = translatedText;

    // Decide new source language
    let newSourceLang = targetLang;
    
    // If source language was auto-detected, try to use the detected lang, else default to English/Tamil
    let newTargetLang = sourceLang === 'auto' ? (detectedLang || 'en') : sourceLang;

    // Prevent source and target from being identical
    if (newSourceLang === newTargetLang) {
      newTargetLang = newSourceLang === 'ta' ? 'en' : 'ta';
    }

    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setSourceText(originalTranslatedText);
    setTranslatedText(originalSourceText);
    setDetectedLang(null);
    setError(null);
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[Translator] Copy failed:', err);
    }
  };

  const getLanguageName = (code: string) => {
    const lang = allLanguages.find(l => l.code === code);
    if (!lang) return code;
    return `${lang.nativeName} (${lang.name})`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <div className="p-2 bg-primary-500/10 rounded-xl text-primary-500">
            <Languages className="w-6 h-6" />
          </div>
          <span>{language === 'ta' ? 'அகில உலக AI மொழிபெயர்ப்பாளர்' : 'Universal AI Translator'}</span>
        </h1>
        <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
          {language === 'ta' 
            ? 'கூகுள் கிளவுட் ஏபிஐ மூலம் பாதுகாப்பான மற்றும் துல்லியமான நிகழ்நேர மொழிபெயர்ப்பு' 
            : 'Secure, high-fidelity real-time translation powered by Google Cloud Translation API'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Source Text Input Card */}
        <div className="vlink-glass vlink-card p-5 rounded-[24px] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Source Header Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-primary-500 uppercase tracking-wider block">From:</span>
                <select
                  value={sourceLang}
                  onChange={(e) => {
                    setSourceLang(e.target.value);
                    setDetectedLang(null);
                  }}
                  className="h-9 px-3 rounded-xl text-xs font-bold bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="auto">🔍 {language === 'ta' ? 'தானியங்கி கண்டறிதல்' : 'Detect Language'}</option>
                  <optgroup label={language === 'ta' ? 'இந்திய மொழிகள்' : 'Indian Languages'}>
                    {indianLanguages.map((l) => (
                      <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                    ))}
                  </optgroup>
                  <optgroup label={language === 'ta' ? 'உலக மொழிகள்' : 'Global Languages'}>
                    {globalLanguages.map((l) => (
                      <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Detected Language Indicator */}
              {detectedLang && sourceLang === 'auto' && (
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-black bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  {language === 'ta' ? 'கண்டறியப்பட்டது:' : 'Detected:'} {getLanguageName(detectedLang)}
                </span>
              )}

              {/* Speech Input Mock Button (Future Voice Support) */}
              <button 
                disabled 
                title="Voice input coming soon" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-earth-200 dark:border-primary-950/20 bg-earth-50/50 dark:bg-earth-900/10 text-earth-400 cursor-not-allowed"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Input Textarea */}
            <textarea
              rows={6}
              value={sourceText}
              onChange={(e) => {
                setSourceText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={language === 'ta' ? 'உரையை இங்கே தட்டச்சு செய்யவும் அல்லது ஒட்டவும்...' : 'Enter or paste text to translate...'}
              className="w-full p-4 bg-white/40 dark:bg-[#111714]/40 border border-earth-200 dark:border-primary-950/25 rounded-2xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-[#111714] transition-all resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              disabled={!sourceText}
              className="h-10 px-4 rounded-xl border border-earth-200 dark:border-primary-950/20 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-transparent"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அழி' : 'Clear'}</span>
            </button>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="h-11 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed border-0 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ta' ? 'மொழிபெயர்க்கிறது...' : 'Translating...'}</span>
                </>
              ) : (
                <span>{language === 'ta' ? 'மொழிபெயர்' : 'Translate'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Target Text Output Card */}
        <div className="vlink-glass vlink-card p-5 rounded-[24px] flex flex-col justify-between space-y-4 relative">
          
          {/* Swapping Controller Overlay for Mobile Devices (Centered) */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 lg:hidden">
            <button
              onClick={handleSwap}
              title="Swap languages"
              className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Target Header Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-primary-500 uppercase tracking-wider block">To:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="h-9 px-3 rounded-xl text-xs font-bold bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <optgroup label={language === 'ta' ? 'இந்திய மொழிகள்' : 'Indian Languages'}>
                    {indianLanguages.map((l) => (
                      <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                    ))}
                  </optgroup>
                  <optgroup label={language === 'ta' ? 'உலக மொழிகள்' : 'Global Languages'}>
                    {globalLanguages.map((l) => (
                      <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Desktop Swap Button */}
              <button
                onClick={handleSwap}
                title="Swap languages"
                className="hidden lg:flex w-8 h-8 rounded-xl border border-earth-200 dark:border-primary-950/20 hover:border-primary-500 bg-white dark:bg-[#111714] text-earth-500 hover:text-primary-500 items-center justify-center cursor-pointer transition-all"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Text-to-Speech Mock Button (Future Voice Support) */}
              <button 
                disabled 
                title="Voice output coming soon" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-earth-200 dark:border-primary-950/20 bg-earth-50/50 dark:bg-earth-900/10 text-earth-400 cursor-not-allowed"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Output Display Container */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-[#111714]/40 backdrop-blur-xs flex items-center justify-center rounded-2xl z-10">
                  <div className="flex flex-col items-center gap-2 text-primary-500 font-mono text-[10px] font-bold">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>FETCHING TRANSLATION...</span>
                  </div>
                </div>
              )}
              <textarea
                rows={6}
                readOnly
                value={translatedText}
                placeholder={language === 'ta' ? 'மொழிபெயர்ப்பு இங்கே தோன்றும்...' : 'Translation appears here...'}
                className="w-full p-4 bg-[#f8faf8] dark:bg-[#0e1311] border border-earth-200 dark:border-primary-950/20 rounded-2xl text-sm font-semibold text-foreground focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleCopy}
              disabled={!translatedText}
              className={`h-10 px-4 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                copied
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'border-earth-200 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:bg-earth-50 text-earth-500 hover:text-primary-500'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'மொழிபெயர்ப்பை நகலெடு' : 'Copy Translation'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 flex items-center gap-3 text-xs font-semibold animate-scale-up">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="flex-1">{error}</p>
        </div>
      )}
    </div>
  );
}
