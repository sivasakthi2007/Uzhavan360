'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Mic,
  MicOff,
  Search,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Star,
  ShieldCheck,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Info,
  Sliders,
  Send,
  Radio,
  Clock
} from 'lucide-react';
import {
  ParsedHelpRequest,
  ServiceProvider,
  ProviderMatchResult,
  FollowUpQuestion
} from '@/types/ooruConnect';
import {
  SAMPLE_PROVIDERS,
  KNOWN_VILLAGES,
  extractWithLinguisticEngine,
  generateFollowUpQuestions,
  matchAndRankProviders,
  resolveVillageCoords,
  getLocalDateString
} from '@/services/ooruConnectEngine';

export default function OoruConnectBoard() {
  const { language } = useApp();
  const isTa = language === 'ta';

  // Input & Speech state
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Active Request & Extraction State
  const [currentRequest, setCurrentRequest] = useState<ParsedHelpRequest | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [isLlmConfigured, setIsLlmConfigured] = useState<boolean | null>(null);
  const [skipFollowUpNotice, setSkipFollowUpNotice] = useState(false);

  // Matching Results State
  const [matches, setMatches] = useState<ProviderMatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(20);
  const [showRadiusFilter, setShowRadiusFilter] = useState(false);

  // Modal States
  const [selectedProvider, setSelectedProvider] = useState<ProviderMatchResult | null>(null);
  const [contactModalProvider, setContactModalProvider] = useState<ServiceProvider | null>(null);
  const [contactSuccessToast, setContactSuccessToast] = useState<string | null>(null);
  const [broadcastSubmitted, setBroadcastSubmitted] = useState(false);

  // Expanded score breakdowns accordion
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);

  // User location preference
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; village: string } | null>(null);

  const recognitionRef = useRef<any>(null);

  // ── Initial Mount: Display Default Available Community Providers ──────────
  useEffect(() => {
    // Show default sample community providers so user sees available services
    const initialMatches = matchAndRankProviders(
      {
        service_category: 'general',
        request_type: 'general',
        work_type: null,
        quantity: null,
        unit: null,
        required_date: null,
        village: 'Melur Village',
        location: KNOWN_VILLAGES.melur.coords,
        radius_km: 25,
        additional_requirements: null,
        missing_fields: [],
        confidence: null,
        raw_input: '',
        extraction_source: 'rule_based_fallback'
      },
      { maxDistanceKm: 25 }
    );
    setMatches(initialMatches);
  }, []);

  // ── Speech Recognition using Web Speech API (ta-IN Locale) ───────────────
  const startSpeechRecognition = async () => {
    setMicStatusMessage(null);
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicStatusMessage(
        isTa
          ? 'உங்கள் உலாவியில் குரல் அறிதல் (Speech Recognition) ஆதரிக்கப்படவில்லை. தயவுசெய்து கீழே தட்டச்சு செய்யவும்.'
          : 'Speech recognition is not supported in this browser. Please type your request.'
      );
      return;
    }

    // Request microphone permission through browser API first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release stream since SpeechRecognition handles its own input channel
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicStatusMessage(
            isTa
              ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்பில் மைக் அனுமதியை வழங்கவும்.'
              : 'Microphone permission denied. Please allow microphone access in your browser settings.'
          );
          return;
        }
      }
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ta-IN'; // Set to Tamil (India)
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMessage(
          isTa ? '🎙️ கேட்கிறது... தமிழில் பேசுங்கள் (Listening... Speak now)' : '🎙️ Listening... Speak now'
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimText(interim);
        }

        if (finalStr) {
          // Insert recognized text into input. DO NOT auto-submit; allow user to edit!
          setInputText((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
          setInterimText('');
          setMicStatusMessage(
            isTa
              ? '✓ குரல் பதிவு செய்யப்பட்டது. தேவைப்பட்டால் திருத்தி "உதவியை தேடுங்கள்" அழுத்தவும்.'
              : '✓ Speech captured. You can edit the text and click "Find Help".'
          );
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimText('');
        if (event.error === 'not-allowed') {
          setMicStatusMessage(
            isTa
              ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உலாவியில் மைக் அனுமதியை வழங்கவும்.'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else if (event.error === 'no-speech') {
          setMicStatusMessage(
            isTa
              ? 'எந்தக் குரலும் கேட்கவில்லை. மீண்டும் "பேசுங்கள்" பொத்தானை அழுத்திப் பேசவும்.'
              : 'No speech was detected. Please tap "Speak Now" again and speak.'
          );
        } else if (event.error === 'network') {
          setMicStatusMessage(
            isTa
              ? 'குரல் அறிதலில் நெட்வொர்க் பிழை ஏற்பட்டது. இணைய இணைப்பை சரிபார்க்கவும்.'
              : 'Network error occurred during speech recognition. Check internet connection.'
          );
        } else if (event.error !== 'aborted') {
          setMicStatusMessage(
            isTa ? `குரல் அறிதல் பிழை: ${event.error}` : `Speech recognition error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setMicStatusMessage(err?.message || 'Failed to start speech recognition');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText('');
  };

  // ── Handle Request Submission ───────────────────────────────────────────
  const handleProcessRequest = async (overrideText?: string) => {
    const textToProcess = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!textToProcess) {
      setMicStatusMessage(isTa ? 'தயவுசெய்து உங்கள் தேவையை உள்ளிடவும்.' : 'Please enter what help you need.');
      return;
    }

    setIsExtracting(true);
    setMicStatusMessage(null);
    setBroadcastSubmitted(false);
    setSkipFollowUpNotice(false);

    try {
      const res = await fetch('/api/ooruconnect/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          userLocation: userLocation || undefined
        })
      });

      let extracted: ParsedHelpRequest;

      if (res.ok) {
        const json = await res.json();
        extracted = json.data;
        setIsLlmConfigured(Boolean(extracted.is_llm_configured));
      } else {
        extracted = extractWithLinguisticEngine(textToProcess, userLocation || undefined);
        setIsLlmConfigured(false);
      }

      setCurrentRequest(extracted);
      setHasSearched(true);

      // Check Missing Essential Fields (Dynamic follow-up questions)
      if (extracted.missing_fields && extracted.missing_fields.length > 0) {
        const questions = generateFollowUpQuestions(extracted.missing_fields, extracted);
        setFollowUpQuestions(questions);
        // Show tentative matches for category, but prompt for missing details
        executeProviderMatching(extracted, searchRadius);
      } else {
        setFollowUpQuestions([]);
        executeProviderMatching(extracted, searchRadius);
      }
    } catch (err) {
      console.warn('Extraction fallback to client linguistic engine:', err);
      const fallbackExtracted = extractWithLinguisticEngine(textToProcess, userLocation || undefined);
      setCurrentRequest(fallbackExtracted);
      setIsLlmConfigured(false);
      setHasSearched(true);

      if (fallbackExtracted.missing_fields.length > 0) {
        setFollowUpQuestions(generateFollowUpQuestions(fallbackExtracted.missing_fields, fallbackExtracted));
      } else {
        setFollowUpQuestions([]);
      }
      executeProviderMatching(fallbackExtracted, searchRadius);
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Execute Provider Matching (Hard filter + 40/25/20/10/5 Weighted Rank) ─
  const executeProviderMatching = (request: ParsedHelpRequest, radius: number) => {
    const matchedList = matchAndRankProviders(request, {
      maxDistanceKm: radius,
      providers: SAMPLE_PROVIDERS
    });
    setMatches(matchedList);
  };

  // ── Handle Answering Follow-up Questions Interactively ─────────────────
  const handleSelectAnswer = (field: string, value: string) => {
    if (!currentRequest) return;

    const updatedRequest: ParsedHelpRequest = { ...currentRequest };

    if (field === 'work_type') {
      updatedRequest.work_type = value;
    } else if (field === 'village') {
      updatedRequest.village = value;
      updatedRequest.location = resolveVillageCoords(value);
    } else if (field === 'required_date') {
      updatedRequest.required_date = value;
    }

    const newMissing = updatedRequest.missing_fields.filter((f) => f !== field);
    updatedRequest.missing_fields = newMissing;
    setCurrentRequest(updatedRequest);

    if (newMissing.length === 0) {
      setFollowUpQuestions([]);
      executeProviderMatching(updatedRequest, searchRadius);
    } else {
      setFollowUpQuestions(generateFollowUpQuestions(newMissing, updatedRequest));
      executeProviderMatching(updatedRequest, searchRadius);
    }
  };

  // ── Request GPS Location ────────────────────────────────────────────────
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMicStatusMessage(isTa ? 'உங்கள் உலாவியில் GPS வசதி இல்லை.' : 'Geolocation not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation({
          lat: coords.lat,
          lng: coords.lng,
          village: 'Current Device Location'
        });
        if (currentRequest) {
          const updated: ParsedHelpRequest = {
            ...currentRequest,
            location: coords,
            village: 'Current GPS Location',
            missing_fields: currentRequest.missing_fields.filter((f) => f !== 'village')
          };
          setCurrentRequest(updated);
          if (updated.missing_fields.length === 0) {
            setFollowUpQuestions([]);
          } else {
            setFollowUpQuestions(generateFollowUpQuestions(updated.missing_fields, updated));
          }
          executeProviderMatching(updated, searchRadius);
        }
      },
      () => {
        setMicStatusMessage(
          isTa
            ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. தயவுசெய்து மேலேயுள்ள ஊர்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்.'
            : 'Location access denied. Please select a village from the options.'
        );
      }
    );
  };

  // ── Contact Provider Action Handler ─────────────────────────────────────
  const handleInitiateContact = (provider: ServiceProvider, actionType: 'call' | 'sms' | 'request') => {
    if (actionType === 'call') {
      window.location.href = `tel:${provider.phone.replace(/\s+/g, '')}`;
    } else if (actionType === 'sms') {
      const msg = encodeURIComponent(
        isTa
          ? `வணக்கம் ${provider.name}, UZHAVAN360 OoruConnect மூலம் உதவி தேவை: ${currentRequest?.work_type || 'விவசாய உதவி'}.`
          : `Hello ${provider.name}, need assistance via UZHAVAN360 OoruConnect: ${currentRequest?.work_type || 'Agri assistance'}.`
      );
      window.location.href = `sms:${provider.phone.replace(/\s+/g, '')}?body=${msg}`;
    } else {
      setContactSuccessToast(
        isTa
          ? `${provider.name} அவர்களுக்கு உங்கள் கோரிக்கை அனுப்பப்பட்டது! அவர் விரைவில் அழைப்பார்.`
          : `Request sent to ${provider.name}! They will call you shortly.`
      );
      setTimeout(() => setContactSuccessToast(null), 4000);
      setContactModalProvider(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 px-2 sm:px-4">
      {/* ── 1. MAIN HERO HEADER & BRANDING ──────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider text-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>OoruConnect • Local Help Matching</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2">
              <span>🤝 OoruConnect</span>
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-emerald-200 mt-1">
              {isTa ? 'உதவி வேண்டுமா? சரியான நபரை கண்டுபிடிக்கிறோம்.' : 'Need help? We find the right person for you.'}
            </h2>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-300" />
            <span>{isTa ? 'டெமோ முறை (Demo Mode)' : 'Demo Mode Active'}</span>
          </div>
        </div>

        {/* ── 2. REQUEST INPUT & VOICE RECOGNITION ──────────────────────── */}
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <label htmlFor="ooru-request-input" className="block text-xs sm:text-sm font-bold text-emerald-100">
              {isTa ? 'உங்களுக்கு என்ன உதவி வேண்டும் என்று சொல்லுங்கள்' : 'Tell us what help you need'}
            </label>
            <p className="text-xs text-emerald-200/80 italic">
              {isTa
                ? 'உதாரணம்: "நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்" அல்லது "3 acre-ku rotavator tractor venum"'
                : 'Example: "Need 5 workers for harvesting tomorrow" or "3 acre rotavator tractor needed"'}
            </p>
          </div>

          {/* Input Bar with Mic & Find Button */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                id="ooru-request-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleProcessRequest();
                  }
                }}
                placeholder={
                  isListening
                    ? isTa
                      ? 'கேட்கிறது... பேசவும்...'
                      : 'Listening... Speak now...'
                    : isTa
                    ? 'தமிழில் அல்லது ஆங்கிலத்தில் கேட்கலாம்...'
                    : 'Type in Tamil, Tanglish or English...'
                }
                className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white dark:bg-[#111714] text-foreground text-sm font-semibold placeholder:text-earth-400 border border-earth-200 dark:border-earth-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Microphone Button (Web Speech API ta-IN) */}
            <button
              type="button"
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              className={`py-3.5 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer border-0 transition-all shadow-md active:scale-95 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-bounce" />
                  <span>{isTa ? 'நிறுத்து' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>🎙️ {isTa ? 'பேசுங்கள்' : 'Speak Now'}</span>
                </>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => handleProcessRequest()}
              disabled={isExtracting || !inputText.trim()}
              className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer border-0 transition-all active:scale-95 shrink-0"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isTa ? 'ஆராய்கிறது...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{isTa ? 'உதவியை தேடுங்கள்' : 'Find Help'}</span>
                </>
              )}
            </button>
          </div>

          {/* Interim speech recognition preview */}
          {interimText && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>{isTa ? `கேட்டுக் கொண்டிருக்கிறது: "${interimText}"` : `Hearing: "${interimText}"`}</span>
            </div>
          )}

          {/* Quick Voice & Typing Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-emerald-200 font-bold text-[11px]">
              {isTa ? 'மாதிரி தேவைகள்:' : 'Try Samples:'}
            </span>
            <button
              type="button"
              onClick={() => {
                const s = 'Naalaikku harvesting-ku 5 workers venum';
                setInputText(s);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              "Naalaikku harvesting-ku 5 workers venum"
            </button>
            <button
              type="button"
              onClick={() => {
                const s = '3 acre-ku rotavator tractor venum';
                setInputText(s);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              "3 acre-ku rotavator tractor venum"
            </button>
            <button
              type="button"
              onClick={() => {
                const s = 'En drip irrigation repair pannanum';
                setInputText(s);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              "En drip irrigation repair pannanum"
            </button>
            <button
              type="button"
              onClick={() => {
                const s = 'நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்';
                setInputText(s);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              "நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்"
            </button>
          </div>
        </div>

        {/* Microphone Status Alert / Error Banner */}
        {micStatusMessage && (
          <div className="p-3.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{micStatusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicStatusMessage(null)}
              className="p-1 text-white/70 hover:text-white border-0 bg-transparent cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── 3. AI EXTRACTION REVIEW BANNER (SECTION 5 CONFIDENCE FIX) ─────── */}
      {currentRequest && hasSearched && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/80 dark:border-earth-850 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-foreground">
                    {isTa ? 'விவரங்கள் புரிந்துகொள்ளப்பட்டன' : 'Request Details Understood'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {currentRequest.extraction_source === 'gemini'
                      ? 'Gemini AI Model'
                      : 'Rule-Based Tamil Engine'}
                  </span>
                  <span className="text-[10px] font-semibold text-earth-500">
                    ({isTa ? 'கீழே உள்ள விவரங்களை சரிபார்க்கவும்' : 'Review extracted details below'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRadiusFilter(!showRadiusFilter)}
                className="py-1 px-3 rounded-lg border border-earth-200 dark:border-earth-800 text-xs font-bold text-earth-600 dark:text-earth-300 hover:bg-earth-100/50 flex items-center gap-1.5 cursor-pointer bg-transparent"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isTa ? `ஆரம்: ${searchRadius} km` : `Radius: ${searchRadius} km`}</span>
              </button>
            </div>
          </div>

          {/* Structured Fields Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-earth-50 dark:bg-earth-950 border border-earth-150 dark:border-earth-900">
              <span className="text-[10px] font-bold text-earth-400 block uppercase">
                {isTa ? 'பணி வகை (Work)' : 'Work Type'}
              </span>
              <span className="font-bold text-foreground truncate block">
                {currentRequest.work_type || (isTa ? '⚠️ தேவைப்படுகிறது' : '⚠️ Missing')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-earth-50 dark:bg-earth-950 border border-earth-150 dark:border-earth-900">
              <span className="text-[10px] font-bold text-earth-400 block uppercase">
                {isTa ? 'அளவு (Quantity)' : 'Quantity'}
              </span>
              <span className="font-bold text-foreground truncate block">
                {currentRequest.quantity
                  ? `${currentRequest.quantity} ${currentRequest.unit}`
                  : (isTa ? 'குறிப்பிடப்படவில்லை' : 'Not specified')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-earth-50 dark:bg-earth-950 border border-earth-150 dark:border-earth-900">
              <span className="text-[10px] font-bold text-earth-400 block uppercase">
                {isTa ? 'தேவைப்படும் தேதி (Date)' : 'Required Date'}
              </span>
              <span className="font-bold text-foreground truncate block">
                {currentRequest.required_date || (isTa ? '⚠️ தேவைப்படுகிறது' : '⚠️ Missing')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-earth-50 dark:bg-earth-950 border border-earth-150 dark:border-earth-900">
              <span className="text-[10px] font-bold text-earth-400 block uppercase">
                {isTa ? 'கிராமம் (Village)' : 'Village'}
              </span>
              <span className="font-bold text-foreground truncate block">
                {currentRequest.village || (isTa ? '⚠️ தேவைப்படுகிறது' : '⚠️ Missing')}
              </span>
            </div>
          </div>

          {/* Configuration status notice when API key is missing */}
          {isLlmConfigured === false && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                {isTa
                  ? 'AI API Key (GEMINI_API_KEY) இணைக்கப்படவில்லை. தமிழ் மொழி விதிமுறை அடிப்படையிலான பாகுபடுத்தி வெற்றிகரமாக இயங்குகிறது.'
                  : 'AI API Key not configured. Running on high-accuracy Tamil linguistic rule-based fallback.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Radius Slider Accordion */}
      {showRadiusFilter && (
        <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-earth-200/60 dark:border-earth-900 space-y-2 animate-fade-in">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-foreground">{isTa ? 'தேடல் வரம்பு ஆரம்' : 'Search Distance Radius'}:</span>
            <span className="text-emerald-600 font-mono font-black">{searchRadius} km</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={searchRadius}
            onChange={(e) => {
              const r = Number(e.target.value);
              setSearchRadius(r);
              if (currentRequest) {
                executeProviderMatching(currentRequest, r);
              }
            }}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-earth-450 font-bold">
            <span>5 km (உள்ளூர்)</span>
            <span>25 km (வட்டம் / Taluk)</span>
            <span>50 km (மாவட்டம்)</span>
          </div>
        </div>
      )}

      {/* ── 4. DYNAMIC MISSING DETAILS & FOLLOW-UP QUESTIONS (FEATURE B) ──── */}
      {followUpQuestions.length > 0 && currentRequest && !skipFollowUpNotice && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-foreground">
                {isTa
                  ? 'துல்லியமான நபரை கண்டுபிடிக்க சில விவரங்கள் தேவை'
                  : 'A few details needed for exact matching'}
              </h3>
              <p className="text-xs text-earth-500 font-semibold mt-0.5">
                {isTa
                  ? 'தேவையான விவரங்களை மட்டும் தேர்ந்தெடுத்து பொருத்தமான நபர்களைப் பெறுங்கள்:'
                  : 'Please select only the missing details needed to rank confirmed providers:'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {followUpQuestions.map((q) => (
              <div
                key={q.field}
                className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-amber-500/20 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h4 className="text-xs sm:text-sm font-black text-foreground">
                    {isTa ? q.questionTa : q.questionEn}
                  </h4>
                </div>
                <p className="text-[11px] text-earth-450 font-semibold">
                  {isTa ? q.helperTextTa : q.helperTextEn}
                </p>

                {/* 1-Tap Option Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {q.suggestions.map((sug) => (
                    <button
                      key={sug.value}
                      type="button"
                      onClick={() => handleSelectAnswer(q.field, sug.value)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-earth-50 dark:bg-earth-900 text-foreground border border-earth-200 dark:border-earth-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-all cursor-pointer"
                    >
                      {isTa ? sug.labelTa : sug.labelEn}
                    </button>
                  ))}
                  {q.field === 'village' && (
                    <button
                      type="button"
                      onClick={requestCurrentLocation}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isTa ? 'என் GPS இருப்பிடம்' : 'Use Current GPS'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setSkipFollowUpNotice(true);
                executeProviderMatching(currentRequest, searchRadius);
              }}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer border-0 bg-transparent"
            >
              {isTa ? 'விவரங்களை பிறகு சேர்க்கிறேன், இப்போதே தேடு →' : 'Search with available details anyway →'}
            </button>
          </div>
        </div>
      )}

      {/* Notice when user skipped follow-up details */}
      {skipFollowUpNotice && currentRequest && currentRequest.missing_fields.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-earth-100/60 dark:bg-earth-900/40 border border-earth-200 dark:border-earth-800 text-xs text-earth-600 dark:text-earth-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-earth-500 shrink-0" />
          <span>
            {isTa
              ? `குறிப்பிடப்படாத விவரங்கள்: ${currentRequest.missing_fields.join(', ')}. கிடைக்கக்கூடிய விவரங்களின் அடிப்படையில் பொருத்தங்கள் காண்பிக்கப்படுகின்றன.`
              : `Unspecified fields: ${currentRequest.missing_fields.join(', ')}. Showing matches based on available details.`}
          </span>
        </div>
      )}

      {/* ── 5. RESULTS SECTION: "PEOPLE MATCHED FOR YOU" ─────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-earth-200/60 dark:border-earth-850 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-foreground font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{isTa ? '👥 உங்களுக்கு கிடைத்தவர்கள்' : '👥 People Matched For You'}</span>
            </h2>
            <p className="text-xs text-earth-450 font-semibold mt-0.5">
              {isTa
                ? 'உங்கள் தேவைக்கு பொருந்தியவர்கள் (உண்மை இருப்பு & தூர அடிப்படையில் வரிசைப்படுத்தப்பட்டது)'
                : 'Relevant contacts based on your need (ranked by skill, real distance & availability)'}
            </p>
          </div>

          {matches.length > 0 && (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-mono">
              {matches.length} {isTa ? 'பொருத்தங்கள்' : 'Matches Found'}
            </span>
          )}
        </div>

        {/* ── 6. PROVIDER RESULT CARDS ────────────────────────────────────── */}
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((item) => {
              const { provider, match_score, distance_km, score_breakdown, match_reasonsTa, match_reasonsEn } = item;
              const isScoreExpanded = expandedScoreId === provider.id;

              return (
                <div
                  key={provider.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/80 dark:border-earth-850 shadow-xs space-y-4 hover:border-emerald-500/40 transition-all"
                >
                  {/* Top Bar: Request Summary & Match Score */}
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-earth-100 dark:border-earth-900 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">
                        {provider.service_category === 'labor'
                          ? '👷'
                          : provider.service_category === 'equipment'
                          ? '🚜'
                          : provider.service_category === 'technician'
                          ? '🔧'
                          : '🚚'}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-earth-100 dark:bg-earth-900 text-foreground">
                        {isTa
                          ? `நீங்கள் கேட்டது: ${currentRequest?.work_type || 'விவசாய உதவி'}${
                              currentRequest?.quantity ? ` (${currentRequest.quantity} ${currentRequest.unit})` : ''
                            }`
                          : `You requested: ${currentRequest?.work_type || 'Agri assistance'}${
                              currentRequest?.quantity ? ` (${currentRequest.quantity} ${currentRequest.unit})` : ''
                            }`}
                      </span>
                    </div>

                    {/* Match Score Meter */}
                    <button
                      type="button"
                      onClick={() => setExpandedScoreId(isScoreExpanded ? null : provider.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-black cursor-pointer border-0 hover:bg-emerald-500/20 transition-colors"
                    >
                      <span>{match_score}% {isTa ? 'பொருத்தம்' : 'Match'}</span>
                      {isScoreExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Provider Card Content */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0 mt-0.5">
                        {provider.service_category === 'labor' ? '👷' : provider.service_category === 'equipment' ? '🚜' : '🔧'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-foreground">{provider.name}</h3>
                          {provider.is_verified && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{isTa ? 'நம்பகமானவர்' : 'Trusted'}</span>
                            </span>
                          )}
                          {provider.verification_badge === 'fpo_certified' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-blue-500" />
                              <span>{isTa ? 'FPO சான்றளித்தது' : 'FPO Certified'}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-earth-500 dark:text-earth-400 font-semibold">
                          {isTa ? provider.roleTa : provider.roleEn}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-earth-450 font-medium flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 font-bold text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span>📍 {distance_km} km ({provider.village})</span>
                          </span>

                          {/* Availability status badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                              provider.availability_status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : provider.availability_status === 'unconfirmed'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                provider.availability_status === 'confirmed'
                                  ? 'bg-emerald-500'
                                  : provider.availability_status === 'unconfirmed'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {provider.availability_status === 'confirmed'
                              ? isTa ? 'உறுதிப்படுத்தப்பட்ட இருப்பு' : 'Confirmed Available'
                              : provider.availability_status === 'unconfirmed'
                              ? isTa ? 'அழைத்து உறுதி செய்ய வேண்டும்' : 'Unconfirmed'
                              : isTa ? 'இருப்பு இல்லை' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verified Price Rate */}
                    {provider.verified_price_rate && (
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-bold text-earth-400 block uppercase tracking-wider">
                          {isTa ? 'சரிபார்க்கப்பட்ட கட்டணம்' : 'Verified Rate'}
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {provider.verified_price_rate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {provider.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-earth-50 dark:bg-earth-900 text-earth-600 dark:text-earth-300 border border-earth-150 dark:border-earth-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Transparent Score Breakdown Accordion */}
                  {isScoreExpanded && (
                    <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-earth-200/60 dark:border-earth-900 space-y-3 text-xs animate-fade-in">
                      <div className="flex items-center justify-between border-b border-earth-200 dark:border-earth-850 pb-2">
                        <span className="font-bold text-foreground">
                          {isTa ? 'வெளிப்படையான பொருத்தம் கணக்கீடு (Match Score Algorithm):' : 'Transparent Match Score Breakdown:'}
                        </span>
                        <span className="font-mono font-black text-emerald-600">{match_score} / 100</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-800">
                          <span className="text-earth-450 block">{isTa ? 'திறன் பொருத்தம்' : 'Skill Match'}</span>
                          <span className="font-mono font-black text-foreground">{score_breakdown.skill_match} / 40</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-800">
                          <span className="text-earth-450 block">{isTa ? 'தூர மதிப்பீடு' : 'Distance'}</span>
                          <span className="font-mono font-black text-foreground">{score_breakdown.distance_score} / 25</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-800">
                          <span className="text-earth-450 block">{isTa ? 'இருப்பு நிலை' : 'Availability'}</span>
                          <span className="font-mono font-black text-foreground">{score_breakdown.availability_score} / 20</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-800">
                          <span className="text-earth-450 block">{isTa ? 'கொள்ளளவு' : 'Capacity'}</span>
                          <span className="font-mono font-black text-foreground">{score_breakdown.capacity_score} / 10</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-800">
                          <span className="text-earth-450 block">{isTa ? 'சரிபார்ப்பு' : 'Verification'}</span>
                          <span className="font-mono font-black text-foreground">{score_breakdown.verification_score} / 5</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="font-bold text-earth-500 block text-[11px]">
                          {isTa ? 'பொருத்தத்திற்கான காரணங்கள்:' : 'Reasons for this ranking:'}
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-earth-600 dark:text-earth-400">
                          {(isTa ? match_reasonsTa : match_reasonsEn).map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-earth-100 dark:border-earth-900">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(item)}
                      className="py-2.5 px-4 rounded-xl border border-earth-300 dark:border-earth-700 text-earth-700 dark:text-earth-200 text-xs font-bold hover:bg-earth-100 dark:hover:bg-earth-800 cursor-pointer transition-colors"
                    >
                      {isTa ? 'விவரங்களை காண்' : 'View Details'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setContactModalProvider(provider)}
                      className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer border-0 transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isTa ? 'தொடர்பு கொள்ள' : 'Contact Provider'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── 7. EMPTY STATE (WHEN NO SUITABLE PROVIDER FOUND) ─────────── */
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200/80 dark:border-earth-850 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-3xl mx-auto">
              🌾
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-black text-foreground">
                {isTa ? 'உறுதிப்படுத்தப்பட்ட பொருத்தங்கள் எதுவும் இதுவரை கிடைக்கவில்லை' : 'No confirmed matches yet'}
              </h3>
              <p className="text-xs text-earth-450 font-semibold leading-relaxed">
                {isTa
                  ? 'தேர்ந்தெடுத்த தொலைவுக்குள் அல்லது பணிக்கு தற்போது ஆட்கள் இல்லை. தேடல் தொலைவை அதிகரிக்கலாம் அல்லது கிராம தகவல் பலகையில் கோரிக்கையை வெளியிடலாம்.'
                  : 'No verified providers found within the current radius for this request. You can broaden the search distance or broadcast your request to the village noticeboard.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchRadius(45);
                  if (currentRequest) {
                    executeProviderMatching(currentRequest, 45);
                  }
                }}
                className="py-2.5 px-5 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
              >
                {isTa ? 'தேடல் தொலைவை அதிகரி (45 km வரை)' : 'Broaden Search Area (45 km)'}
              </button>

              <button
                type="button"
                onClick={() => setBroadcastSubmitted(true)}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer border-0 flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4" />
                <span>{isTa ? 'கிராம பலகையில் அறிவிக்க (Broadcast)' : 'Broadcast Request to Village'}</span>
              </button>
            </div>

            {broadcastSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold max-w-md mx-auto animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {isTa
                    ? 'உங்கள் கோரிக்கை உள்ளூர் FPO ஒருங்கிணைப்பாளர் மற்றும் கிராம பலகைக்கு வெற்றிகரமாக அனுப்பப்பட்டது!'
                    : 'Request broadcasted to local FPO coordinator and village noticeboard!'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 8. PROVIDER DETAILS MODAL ─────────────────────────────────────── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111714] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 dark:border-earth-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">{selectedProvider.provider.name}</h3>
                  {selectedProvider.provider.is_verified && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{isTa ? 'நம்பகமானவர்' : 'Trusted'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-earth-500 font-semibold">
                  {isTa ? selectedProvider.provider.roleTa : selectedProvider.provider.roleEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="p-1 rounded-full text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 dark:bg-earth-950 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-earth-450">{isTa ? 'கிராமம் & மாவட்டம்:' : 'Location:'}</span>
                <span className="font-bold text-foreground">📍 {selectedProvider.provider.village}, {selectedProvider.provider.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-450">{isTa ? 'கணக்கிடப்பட்ட தூரம்:' : 'Calculated Distance:'}</span>
                <span className="font-mono font-bold text-foreground">{selectedProvider.distance_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-450">{isTa ? 'கொள்ளளவு / திறன்:' : 'Capacity:'}</span>
                <span className="font-bold text-foreground">
                  {isTa ? selectedProvider.provider.capacity_descriptionTa : selectedProvider.provider.capacity_descriptionEn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-450">{isTa ? 'முடிந்த பணிகள்:' : 'Completed Jobs:'}</span>
                <span className="font-bold text-foreground">{selectedProvider.provider.completed_jobs} {isTa ? 'வேலைகள்' : 'jobs'} (⭐ {selectedProvider.provider.rating})</span>
              </div>
              {selectedProvider.provider.verified_price_rate && (
                <div className="flex justify-between border-t border-earth-200 dark:border-earth-850 pt-2">
                  <span className="text-earth-450 font-bold">{isTa ? 'சரிபார்க்கப்பட்ட கட்டணம்:' : 'Verified Price:'}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {selectedProvider.provider.verified_price_rate}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-foreground block">
                {isTa ? 'அனுபவம் & பயோ:' : 'About & Experience:'}
              </span>
              <p className="text-xs text-earth-500 font-semibold leading-relaxed">
                {isTa ? selectedProvider.provider.bioTa : selectedProvider.provider.bioEn}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-foreground block">
                {isTa ? 'திறன்கள்:' : 'Skills:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProvider.provider.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-earth-100 dark:border-earth-900">
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="py-2.5 px-4 rounded-xl border border-earth-200 dark:border-earth-800 text-earth-700 dark:text-earth-300 text-xs font-bold cursor-pointer"
              >
                {isTa ? 'மூடு' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactModalProvider(selectedProvider.provider);
                  setSelectedProvider(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer border-0 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isTa ? 'தொடர்பு கொள்ள' : 'Contact Provider'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. CONTACT PROVIDER MODAL ─────────────────────────────────────── */}
      {contactModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111714] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 dark:border-earth-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-foreground">
                  {isTa ? 'சேவை வழங்குநரை தொடர்பு கொள்ள' : 'Contact Service Provider'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalProvider(null)}
                className="p-1 rounded-full text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-foreground">{contactModalProvider.name}</h4>
              <p className="text-xs text-earth-500 font-semibold">
                {isTa ? contactModalProvider.roleTa : contactModalProvider.roleEn}
              </p>
              <p className="text-xs text-emerald-600 font-mono font-bold pt-1">
                📞 {contactModalProvider.phone}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleInitiateContact(contactModalProvider, 'call')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <Phone className="w-4 h-4" />
                <span>{isTa ? 'நேரடியாக அழைக்கவும் (Direct Call)' : 'Direct Phone Call'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateContact(contactModalProvider, 'sms')}
                className="w-full py-3 px-4 rounded-xl bg-earth-100 dark:bg-earth-900 hover:bg-earth-200 dark:hover:bg-earth-800 text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{isTa ? 'SMS செய்தி அனுப்பவும் (Send SMS)' : 'Send SMS Request'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateContact(contactModalProvider, 'request')}
                className="w-full py-3 px-4 rounded-xl border border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer bg-transparent"
              >
                <Send className="w-4 h-4" />
                <span>{isTa ? 'V-LINK மூலம் தொடர்பு கோரவும் (Request Callback)' : 'Request Callback via V-LINK'}</span>
              </button>
            </div>

            <p className="text-[10px] text-earth-400 text-center pt-1 font-semibold">
              {isTa
                ? 'தனிப்பட்ட தொலைபேசி எண் பாதுகாப்பானது. உங்கள் ஒப்புதலுடன் மட்டுமே பகிரப்படுகிறது.'
                : 'Phone numbers are verified. Never exposed to unauthenticated scrapers.'}
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {contactSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-700 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{contactSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
