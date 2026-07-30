import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  CloudRain, 
  ShieldAlert, 
  ShoppingBag, 
  Users, 
  Settings, 
  Navigation, 
  Database, 
  TrendingUp, 
  User, 
  Wallet, 
  Play, 
  X, 
  Headphones, 
  Volume2, 
  Camera, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Calculator, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  Search, 
  Globe, 
  Smartphone, 
  FileText, 
  Info, 
  HelpCircle, 
  Layers, 
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
type TabType = 'home' | 'farm' | 'market' | 'more';
type LanguageType = 'en' | 'ta' | 'hi';

// Translations Dictionary
const tDict = {
  en: {
    app_title: "AgriGravity",
    app_subtitle: "Farmer-First Operating System",
    home: "Home",
    farm: "My Farm",
    market: "Market",
    more: "More",
    lang_btn: "தமிழ் / Eng / हिंदी",
    weather_alert: "Heavy rain expected in 24 hours. Stagger harvesting.",
    ai_assistant: "AgriGravity AI Assistant",
    ai_desc: "Ask me anything about soil, weather, or seeds.",
    disease_title: "AI Crop Disease Scan",
    disease_desc: "Point camera at leaves to detect diseases.",
    market_title: "Live Mandi Rate Guide",
    market_desc: "Direct buyers, no agent commissions.",
    suggested_crops: "Recommended Crops For You",
    mandi_price: "Mandi Price",
    soil_health: "Soil Health Index",
    moisture: "Soil Moisture",
    temp: "Temperature",
    active_leases: "Active Equipment Leases",
    direct_buyer: "Direct B2B Buyer Sourcing",
    calculator: "Valuation Estimator",
    wallet_balance: "Ecosystem Wallet Balance",
    escrow: "Smart Escrow Agreements",
    visual_mode: "Simplification Mode",
    visual_desc: "Icon-driven layouts for low-literacy users.",
    scan_leaf: "Scan Crop Leaf",
    chat_placeholder: "Type crop question in English or தமிழ்...",
    camera_btn: "Open Camera Scanner"
  },
  ta: {
    app_title: "அக்ரிகிராவிட்டி",
    app_subtitle: "விவசாயி முதல் சூப்பர் ஆப்",
    home: "முகப்பு",
    farm: "என் பண்ணை",
    market: "சந்தை",
    more: "மேலும்",
    lang_btn: "ஆங்கிலம் / தமிழ் / हिंदी",
    weather_alert: "24 மணிநேரத்தில் கனமழை பெய்யும். அறுவடையைத் தள்ளிப்போடுங்கள்.",
    ai_assistant: "அக்ரிகிராவிட்டி AI உதவியாளர்",
    ai_desc: "மண், வானிலை அல்லது விதைகள் பற்றி என்னிடம் கேளுங்கள்.",
    disease_title: "AI பயிர் நோய் கண்டறிதல்",
    disease_desc: "நோய்களைக் கண்டறிய கேமராவை இலைகளை நோக்கி வைக்கவும்.",
    market_title: "நேரடி அரசு மண்டி விலை",
    market_desc: "இடைத்தரகர் இல்லாத நேரடி விவசாய சந்தை.",
    suggested_crops: "உங்களுக்கான பரிந்துரைக்கப்பட்ட பயிர்கள்",
    mandi_price: "சந்தை விலை",
    soil_health: "மண் ஆரோக்கிய அட்டவணை",
    moisture: "மண் ஈரப்பதம்",
    temp: "வெப்பநிலை",
    active_leases: "வாடகை குத்தகை ஒப்பந்தங்கள்",
    direct_buyer: "நேரடி B2B வாங்குபவர்கள்",
    calculator: "விளைச்சல் மதிப்பு மதிப்பீட்டாளர்",
    wallet_balance: "விவசாயி பணப்பை இருப்பு",
    escrow: "கூட்டுறவு எஸ்க்ரோ ஒப்பந்தங்கள்",
    visual_mode: "படம் முறை (எளிய வடிவம்)",
    visual_desc: "படிக்கத் தெரியாதவர்களுக்கான ஐகான் அடிப்படையிலான மெனுக்கள்.",
    scan_leaf: "இலையை ஸ்கேன் செய்க",
    chat_placeholder: "பயிர் கேள்விகளை தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்க...",
    camera_btn: "கேமரா ஸ்கேனரைத் திறக்கவும்"
  },
  hi: {
    app_title: "एग्रीग्रेविटी",
    app_subtitle: "किसान-प्रथम सुपर ऐप",
    home: "होम",
    farm: "मेरा खेत",
    market: "मंडी बाजार",
    more: "अधिक",
    lang_btn: "தமிழ் / Eng / हिंदी",
    weather_alert: "24 घंटे में भारी बारिश की चेतावनी। कटाई रोकें।",
    ai_assistant: "एग्रीग्रेविटी AI सहायक",
    ai_desc: "मिट्टी, मौसम या बीजों के बारे में कुछ भी पूछें।",
    disease_title: "AI फसल रोग स्कैनर",
    disease_desc: "रोगों का पता लगाने के लिए कैमरा पत्तियों पर रखें।",
    market_title: "लाइव सरकारी मंडी दरें",
    market_desc: "सीधी बिक्री, एजेंटों का कोई कमीशन नहीं।",
    suggested_crops: "आपके लिए अनुशंसित फसलें",
    mandi_price: "मंडी मूल्य",
    soil_health: "मृदा स्वास्थ्य सूचकांक",
    moisture: "मृदा नमी",
    temp: "तापमान",
    active_leases: "सक्रिय मशीनरी पट्टे",
    direct_buyer: "सीधी B2B खरीदार सोर्सिंग",
    calculator: "फसल मूल्यांकन गणक",
    wallet_balance: "किसान वॉलेट बैलेंस",
    escrow: "स्मार्ट एस्क्रो अनुबंध",
    visual_mode: "चित्र मोड (सरल रूप)",
    visual_desc: "कम पढ़े-लिखे उपयोगकर्ताओं के लिए सरल चित्र लेआउट।",
    scan_leaf: "पत्ती को स्कैन करें",
    chat_placeholder: "फसल संबंधी सवाल हिंदी या Eng में लिखें...",
    camera_btn: "कैमरा स्कैनर खोलें"
  }
};

export default function AgriGravitySandbox() {
  // Mobile app state simulator
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [lang, setLang] = useState<LanguageType>('en');
  const [isVisual, setIsVisual] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannerStep, setScannerStep] = useState<'camera' | 'loading' | 'result'>('camera');
  const [walletBalance, setWalletBalance] = useState<number>(24850);
  const [isMute, setIsMute] = useState<boolean>(false);
  const [playingSpeech, setPlayingSpeech] = useState<string | null>(null);

  // AI chat simulator state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: "Hello! Welcome to AgriGravity. How can I assist you with your crops today?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Right-panel design explorer state
  const [activeSpecTab, setActiveSpecTab] = useState<'system' | 'library' | 'flows' | 'architecture'>('system');

  // Helper translations lookup
  const t = (key: string) => {
    return tDict[lang][key as keyof typeof tDict['en']] || key;
  };

  // Cancel any ongoing speech synthesis on unmount, or when muting, or when tab or language changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingSpeech(null);
  }, [isMute, lang, activeTab]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak simulation helper
  const triggerSpeak = (text: string) => {
    if (isMute) return;
    setPlayingSpeech(text);
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any active speech first
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;
      if (lang === 'ta') {
        matchedVoice = voices.find(v => v.lang.toLowerCase().includes('ta'));
      } else if (lang === 'hi') {
        matchedVoice = voices.find(v => v.lang.toLowerCase().includes('hi'));
      } else {
        matchedVoice = voices.find(v => v.lang.toLowerCase().includes('en'));
      }
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
      
      utterance.onend = () => {
        setPlayingSpeech(null);
      };
      
      utterance.onerror = () => {
        setPlayingSpeech(null);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setPlayingSpeech(null);
      }, 5500);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = "I have recorded your query. I am calculating optimization vectors using current telemetry data.";
      const query = userText.toLowerCase();
      if (query.includes('tomato') || query.includes('தக்காளி')) {
        botResponse = lang === 'ta' 
          ? "தக்காளி பயிர்களுக்கு சொட்டு நீர் பாசனம் பரிந்துரைக்கப்படுகிறது. தற்போதைய சந்தை விலை கிலோ ₹34." 
          : "For Tomato crops, drip irrigation is recommended. Today's average market rate is ₹34/kg.";
      } else if (query.includes('weather') || query.includes('மழை') || query.includes('rain')) {
        botResponse = lang === 'ta'
          ? "அடுத்த 24 மணி நேரத்திற்குள் கனமழை பெய்யக்கூடும். தக்காளி வயல்களை வடிகால் செய்ய அறிவுறுத்தப்படுகிறது."
          : "Expect rainfall within 24 hours. Ensure adequate drainage to avoid root rot in crops.";
      } else if (query.includes('disease') || query.includes('நோய்')) {
        botResponse = "Please open the AI Crop Disease Scanner from the Home tab to upload a leaf photograph for neural analysis.";
      }
      
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      triggerSpeak(botResponse);
    }, 1000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b0e0c] text-earth-100' : 'bg-earth-50 text-earth-900'} p-4 md:p-8 flex flex-col font-sans`}>
      
      {/* Upper header */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-earth-200 dark:border-earth-850 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight font-display text-emerald-800 dark:text-emerald-400">AgriGravity Workspace</h1>
              <p className="text-xs text-earth-500 dark:text-earth-400 font-medium">World-class Farmer-First Super App Sandbox & Spec Explorer</p>
            </div>
          </div>
        </div>
        
        {/* Workspace Quick Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <span>SPEC v1.0.0</span>
            <span className="opacity-40">|</span>
            <span className="text-emerald-500 animate-pulse">● SIMULATOR ONLINE</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="px-3.5 py-1.5 bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold shadow-xs hover:bg-earth-100 transition cursor-pointer"
          >
            {isDark ? '☀️ Light Specs' : '🌙 Dark Specs'}
          </button>

          <Link
            to="/"
            className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-xs transition no-underline"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
        
        {/* LEFT COLUMN: INTERACTIVE SIMULATOR (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          <span className="text-[10px] font-bold text-earth-400 dark:text-earth-500 tracking-widest uppercase mb-2">
            Interactive Mobile Simulator
          </span>

          {/* iPhone Device frame wrapper */}
          <div className="relative shrink-0 transition-transform duration-300 scale-95 xl:scale-100">
            
            {/* Phone Bezel */}
            <div className="relative w-[385px] h-[770px] rounded-[52px] border-[10px] border-[#1d2320] dark:border-[#2b332f] bg-[#0c0d0d] shadow-2xl flex flex-col overflow-hidden ring-[6px] ring-emerald-950/20 dark:ring-emerald-500/5">
              
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                <div className="w-3 h-1 bg-[#1a1a1a] rounded-full" />
                <div className="flex-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-900/40 border border-emerald-500/20" />
              </div>

              {/* Status Bar */}
              <div className="h-10 bg-white dark:bg-[#0c0e0d] px-8 flex items-end justify-between text-[10px] font-semibold select-none z-40 shrink-0 pb-1 border-b border-earth-100 dark:border-earth-900/40 text-earth-800 dark:text-earth-100">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-0.5 h-2">
                    <span className="w-0.5 h-1 bg-current" />
                    <span className="w-0.5 h-1.5 bg-current" />
                    <span className="w-0.5 h-2 bg-current" />
                    <span className="w-0.5 h-2.5 bg-current animate-pulse" />
                  </div>
                  <span>5G</span>
                  <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center relative">
                    <div className="h-full w-4/5 bg-emerald-600 rounded-2xs" />
                    <div className="absolute right-[-2.5px] top-[2px] w-[2px] h-[3px] bg-current rounded-r-xs" />
                  </div>
                </div>
              </div>

              {/* Speech Assist Popup */}
              {playingSpeech && (
                <div className="absolute top-12 left-4 right-4 bg-emerald-900 text-white rounded-2xl p-3 border border-emerald-500/30 z-50 shadow-md flex items-start gap-2.5 animate-slide-up text-xs font-semibold">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="text-[9px] uppercase text-emerald-400 block tracking-wider">Sakthi Audio Speech Assist</span>
                    <p className="mt-0.5 text-emerald-50 font-medium leading-relaxed">{playingSpeech}</p>
                  </div>
                </div>
              )}

              {/* Phone Content Screen */}
              <div className="flex-1 relative bg-white dark:bg-[#111513] flex flex-col justify-between overflow-y-auto select-none rounded-b-[42px]">
                
                {/* Brand / Simulator Header */}
                <header className="h-12 border-b border-earth-100 dark:border-earth-900/40 px-5 flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#111513]/95 backdrop-blur-xs z-30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[13px] tracking-tight text-emerald-900 dark:text-emerald-400 leading-none">{t('app_title')}</h4>
                      <span className="text-[8px] font-bold text-earth-400 uppercase tracking-widest leading-none block mt-0.5">{t('app_subtitle')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Speech assistant toggle */}
                    <button
                      onClick={() => setIsMute(!isMute)}
                      className={`p-1.5 rounded-lg border cursor-pointer border-0 bg-transparent ${isMute ? 'text-earth-400' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'}`}
                      title="Toggle Speech Guide"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {/* Language Dropdown Button */}
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as LanguageType)}
                      className="px-2 py-1 bg-earth-50 dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-lg text-[9px] font-bold cursor-pointer text-earth-800 dark:text-earth-100 focus:outline-none"
                    >
                      <option value="en">Eng</option>
                      <option value="ta">தமிழ்</option>
                      <option value="hi">हिंदी</option>
                    </select>
                  </div>
                </header>

                {/* Main Screen Body Viewport */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  
                  {/* Weather rain advisory alert */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 flex gap-2.5 items-start text-amber-800 dark:text-amber-400 text-[11px] font-bold leading-normal">
                    <CloudRain className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[8px] font-bold text-amber-500 block uppercase tracking-wider">मौसम / வானிலை ALERT</span>
                      <p className="mt-0.5 font-semibold">{t('weather_alert')}</p>
                    </div>
                  </div>

                  {/* -------------------- TAB 1: HOME -------------------- */}
                  {activeTab === 'home' && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Premium AI Disease scan Card */}
                      <div className="p-4 rounded-3xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white relative overflow-hidden shadow-md">
                        <div className="absolute right-[-15px] bottom-[-15px] opacity-10">
                          <Camera className="w-24 h-24" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-white/20 text-emerald-100 uppercase tracking-widest">Gravity AI</span>
                        <h4 className="text-base font-black mt-1 leading-tight">{t('disease_title')}</h4>
                        <p className="text-[10px] text-emerald-100 mt-1 max-w-[210px] font-medium leading-relaxed">{t('disease_desc')}</p>
                        
                        <button
                          onClick={() => {
                            setScannerStep('camera');
                            setShowScanner(true);
                          }}
                          className="mt-4.5 px-4.5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition border-0 cursor-pointer w-full justify-center"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{t('camera_btn')}</span>
                        </button>
                      </div>

                      {/* AI Assistant Chat Widget Preview */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/30 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Headphones className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[11px] font-extrabold text-foreground">{t('ai_assistant')}</span>
                          </div>
                          <span className="text-[8px] font-mono text-primary-500 font-bold uppercase">Sakthi Gravity Active</span>
                        </div>

                        {/* Messages Area */}
                        <div className="h-32 overflow-y-auto space-y-2 p-2 bg-earth-50/50 dark:bg-earth-950/20 rounded-xl border border-earth-100 dark:border-earth-900/10">
                          {chatMessages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2.5 rounded-2xl max-w-[85%] text-[10px] font-semibold leading-normal ${m.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-earth-100 dark:bg-earth-900 text-earth-800 dark:text-earth-200 rounded-tl-none border border-earth-200 dark:border-earth-800'}`}>
                                {m.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendChat} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t('chat_placeholder')}
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            className="flex-1 h-9 px-3 bg-earth-50/50 dark:bg-earth-950/30 border border-earth-200 dark:border-earth-850 rounded-xl text-[10px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="submit"
                            className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center cursor-pointer border-0 shrink-0 shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current pl-0.5" />
                          </button>
                        </form>
                      </div>

                      {/* Mandi rate highlights */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-earth-400 uppercase tracking-wider">{t('market_title')}</span>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">Live Rates</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Organic Tomatoes', rate: '₹34 / kg', trend: 'up', change: '+12% Gov Price' },
                            { name: 'Nashik Red Onion', rate: '₹28 / kg', trend: 'down', change: '-4% supply' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 rounded-2xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-2xs">
                              <span className="text-[10px] font-extrabold text-foreground block truncate">{item.name}</span>
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{item.rate}</span>
                              </div>
                              <span className={`text-[8px] font-bold block mt-1 uppercase ${item.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {item.change}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick utility buttons */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block border-b pb-1.5 border-earth-100 dark:border-earth-900/30">Quick Services</span>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Soil Testing', icon: Database, bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
                            { label: 'Weather Voice', icon: Volume2, bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
                            { label: 'Gov Subsidies', icon: Award, bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => triggerSpeak(`Launching ${item.label} service. Directing telemetry routing.`)}
                                className="p-2.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer border-0 bg-transparent hover:bg-earth-50/50 dark:hover:bg-earth-900/10"
                              >
                                <div className={`p-2.5 rounded-xl shrink-0 ${item.bg}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] font-extrabold text-foreground leading-tight">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* -------------------- TAB 2: FARM -------------------- */}
                  {activeTab === 'farm' && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Soil health card visualizer */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <div>
                          <span className="text-[8px] font-bold text-earth-400 uppercase tracking-wider block">{t('soil_health')}</span>
                          <h4 className="text-sm font-extrabold text-foreground mt-0.5">Madurai East Tomato Field</h4>
                        </div>

                        {/* Interactive Soil Metrics */}
                        <div className="grid grid-cols-3 gap-3 border-t border-b border-earth-100 dark:border-earth-900/30 py-3">
                          {[
                            { label: 'Nitrogen (N)', val: 'Optimized', color: 'text-emerald-600' },
                            { label: 'Phosphorus (P)', val: 'Low (Add D.A.P)', color: 'text-amber-500' },
                            { label: 'pH Level', val: '6.4 (Healthy)', color: 'text-emerald-600' }
                          ].map((m, idx) => (
                            <div key={idx} className="text-center">
                              <span className="text-[8px] text-earth-400 block font-semibold">{m.label}</span>
                              <span className={`text-[10px] font-extrabold block mt-1 ${m.color}`}>{m.val}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-emerald-500/5 rounded-xl text-[9px] font-bold leading-normal text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>AI Recommendation: Nitrogen replenishment levels are optimal. Consider adding organic manure to raise organic carbon by 0.5% next week.</span>
                        </div>
                      </div>

                      {/* Interactive Telemetry Mock Graph */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block">Live Sensor Telemetry</span>
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/10">GPS Active</span>
                        </div>

                        {/* Moisture Chart Simulation */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-foreground">
                            <span>{t('moisture')}</span>
                            <span className="text-emerald-600 font-mono">42% (Normal)</span>
                          </div>
                          
                          {/* SVG mock graph */}
                          <div className="h-16 bg-earth-50 dark:bg-earth-950/60 rounded-xl relative overflow-hidden border border-earth-100 dark:border-earth-900/10 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full text-emerald-500/30" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 0 50 Q 50 10 100 40 T 200 20 T 300 45 L 350 45" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M 0 50 Q 50 10 100 40 T 200 20 T 300 45 L 350 45 L 350 64 L 0 64 Z" fill="var(--color-primary-500)" className="opacity-5" />
                            </svg>
                            <span className="absolute bottom-2 left-3 text-[7px] font-bold text-earth-400">Moisture Trend (Last 24 Hours)</span>
                          </div>
                        </div>

                        {/* Temperature Chart Simulation */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-foreground">
                            <span>{t('temp')}</span>
                            <span className="text-amber-500 font-mono">29°C</span>
                          </div>
                          
                          {/* SVG mock graph */}
                          <div className="h-16 bg-earth-50 dark:bg-earth-950/60 rounded-xl relative overflow-hidden border border-earth-100 dark:border-earth-900/10 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full text-amber-500/30" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 0 20 Q 80 45 150 15 T 300 30 L 350 25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M 0 20 Q 80 45 150 15 T 300 30 L 350 25 L 350 64 L 0 64 Z" fill="var(--color-accent-500)" className="opacity-5" />
                            </svg>
                            <span className="absolute bottom-2 left-3 text-[7px] font-bold text-earth-400">Ambient Temp Trend (Last 24 Hours)</span>
                          </div>
                        </div>
                      </div>

                      {/* Crop Timeline Plan */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block">AI Crop Plan: Tomatoes</span>
                        
                        <div className="space-y-3">
                          {[
                            { stage: 'Seedling sowing', date: 'May 10', done: true },
                            { stage: 'Vegetative growth', date: 'June 05', done: true },
                            { stage: 'Flowering Stage (Active)', date: 'June 25', active: true },
                            { stage: 'Fruit development', date: 'July 15', done: false }
                          ].map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[8px] font-bold ${
                                item.done ? 'bg-emerald-600 text-white border-emerald-600' :
                                item.active ? 'bg-amber-500 text-white border-amber-500 animate-pulse' :
                                'bg-transparent border-earth-200 text-earth-400 dark:border-earth-800'
                              }`}>
                                {item.done ? <Check className="w-3 h-3" /> : (idx + 1)}
                              </div>
                              <div className="flex-1">
                                <span className={`text-[10px] font-extrabold block leading-tight ${item.active ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                  {item.stage}
                                </span>
                                <span className="text-[8px] text-earth-400 block mt-0.5">{item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* -------------------- TAB 3: MARKET -------------------- */}
                  {activeTab === 'market' && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Marketplace Sourcing channels */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-earth-400 uppercase tracking-wider block">{t('direct_buyer')}</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Hotel Taj Contracts', rate: '₹36 / kg', qty: 'Min 200kg lot', channel: 'B2B Hotel' },
                            { name: 'Raza Wholesale Grocers', rate: '₹32 / kg', qty: 'Min 500kg lot', channel: 'B2B Retail' }
                          ].map((buyer, idx) => (
                            <div key={idx} className="p-3.5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-2xs space-y-1.5 flex flex-col justify-between">
                              <div>
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider inline-block">
                                  {buyer.channel}
                                </span>
                                <h5 className="font-extrabold text-[11px] text-foreground leading-tight mt-1.5">{buyer.name}</h5>
                              </div>
                              <div className="pt-2 border-t border-earth-100 dark:border-earth-900/30 flex justify-between items-baseline">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{buyer.rate}</span>
                                <span className="text-[8px] text-earth-400 font-mono">{buyer.qty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mandi price list table */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block">Mandi Benchmark rates</span>
                          <span className="text-[8px] text-emerald-600 font-bold font-mono">Synced Agmarknet</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { name: 'Tomato (Local)', mandi: 'Madurai East Mandi', rate: '₹26 / kg', trend: 'up' },
                            { name: 'Red Onion', mandi: 'Nashik Central Mandi', rate: '₹22 / kg', trend: 'down' },
                            { name: 'Cavendish Banana', mandi: 'Ooty Wholesale Mandi', rate: '₹18 / kg', trend: 'stable' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-100 dark:border-earth-900/10 flex items-center justify-between gap-3 text-[10px] font-bold">
                              <div>
                                <span className="text-foreground block">{item.name}</span>
                                <span className="text-[8px] text-earth-400 block mt-0.5">{item.mandi}</span>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className="text-emerald-600 dark:text-emerald-400">Modal: {item.rate}</span>
                                {item.trend === 'up' ? (
                                  <span className="text-[8px] text-emerald-500 block uppercase">▲ Trending Up</span>
                                ) : item.trend === 'down' ? (
                                  <span className="text-[8px] text-red-500 block uppercase">▼ Trending Down</span>
                                ) : (
                                  <span className="text-[8px] text-stone-500 block uppercase">● Stable</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Valuation Calculator */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-emerald-600" />
                          <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block">{t('calculator')}</span>
                        </div>

                        <div className="space-y-3 font-semibold text-xs text-foreground">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-earth-400 block mb-1">Select Crop</label>
                              <select className="w-full h-8 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-lg text-[10px] focus:outline-none">
                                <option>Tomatoes (Madurai)</option>
                                <option>Onions (Nashik)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-earth-400 block mb-1">Quantity (kg)</label>
                              <input type="number" defaultValue={250} className="w-full h-8 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-lg text-[10px] font-bold focus:outline-none" />
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-earth-50 dark:bg-[#1b221e] space-y-1.5 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-earth-400">Base Mandi Rate (250kg × ₹26)</span>
                              <span>₹6,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-earth-400 flex items-center gap-0.5">Direct B2B Premium (+15%)</span>
                              <span className="text-emerald-600">+₹975</span>
                            </div>
                            <div className="flex justify-between font-extrabold border-t border-dashed border-earth-200 dark:border-earth-800 pt-1.5">
                              <span>Estimated Payout (V-LINK smart Escrow)</span>
                              <span className="text-emerald-600">₹7,475</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* -------------------- TAB 4: MORE -------------------- */}
                  {activeTab === 'more' && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Profile and Wallet overview */}
                      <div className="p-4 rounded-3xl bg-gradient-to-tr from-earth-900 to-earth-800 text-white shadow-md relative overflow-hidden">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                          <Wallet className="w-20 h-20 text-white" />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-500/20 text-white flex items-center justify-center shrink-0">
                            <span className="text-sm font-black text-white">R</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs">Ramanathan Swamy</h4>
                            <p className="text-[9px] text-earth-300 font-bold -mt-0.5">Madurai East Region, Tamil Nadu</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-white/10 flex justify-between items-baseline">
                          <div>
                            <span className="text-[9px] text-earth-300 uppercase font-semibold">{t('wallet_balance')}</span>
                            <h3 className="text-lg font-black mt-0.5 text-white">₹{walletBalance.toLocaleString('en-IN')}</h3>
                          </div>
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">PhonePe Ledger Connected</span>
                        </div>
                      </div>

                      {/* Dynamic Accessibility Toggle */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs space-y-3">
                        <span className="text-[9px] font-bold text-earth-400 uppercase tracking-widest block">{t('visual_mode')}</span>
                        
                        <button
                          onClick={() => {
                            setIsVisual(!isVisual);
                            triggerSpeak(isVisual ? "Visual simplified mode disabled. Standard text options active." : "Visual simplified mode enabled. Main crop actions are now mapped to image icons.");
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                            isVisual 
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400' 
                              : 'border-earth-200 dark:border-earth-850 bg-white dark:bg-earth-900 text-earth-500 dark:text-earth-400 hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">🖼️</span>
                            <div>
                              <span className="text-[11px] font-extrabold block leading-tight">Pictorial simplified View</span>
                              <span className="text-[8px] text-earth-400 block mt-0.5">{t('visual_desc')}</span>
                            </div>
                          </div>
                          <div className={`w-8 h-4 rounded-full p-0.5 shrink-0 flex items-center transition ${isVisual ? 'bg-emerald-500' : 'bg-earth-200 dark:bg-earth-800'}`}>
                            <span className={`w-3 h-3 rounded-full bg-white transition transform ${isVisual ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      </div>

                      {/* Settings grid options */}
                      <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141916] shadow-xs">
                        <div className="divide-y divide-earth-100 dark:divide-earth-900/30">
                          {[
                            { name: 'My Linked Escrow Contracts', icon: FileText, desc: 'Track pending and cleared payouts.' },
                            { name: 'My Machinery Rentals Board', icon: Settings, desc: 'Manage your active machinery leases.' },
                            { name: 'Call Help Center (Voice Assist)', icon: Headphones, desc: 'Call cooperative support agent.' },
                            { name: 'App Settings & Privacy', icon: Settings, desc: 'Manage passkey and biometric options.' }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => triggerSpeak(`Launching ${item.name}`)}
                                className="w-full py-3 text-left flex items-start justify-between gap-3 bg-transparent cursor-pointer border-0 hover:bg-earth-50/50 dark:hover:bg-earth-900/10 first:pt-0 last:pb-0"
                              >
                                <div className="flex gap-2.5 items-start">
                                  <div className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 dark:text-earth-400 shrink-0">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-extrabold text-foreground block">{item.name}</span>
                                    <span className="text-[8px] text-earth-400 block mt-0.5">{item.desc}</span>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-earth-400 shrink-0 mt-2.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Bottom navigation bar */}
                <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#111513]/95 backdrop-blur-xs border-t border-earth-100 dark:border-earth-900/40 flex items-center justify-around px-1.5 z-40 shrink-0 shadow-lg">
                  {[
                    { id: 'home', label: t('home'), icon: Leaf },
                    { id: 'farm', label: t('farm'), icon: Database },
                    { id: 'market', label: t('market'), icon: ShoppingBag },
                    { id: 'more', label: t('more'), icon: Users }
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as TabType);
                          triggerSpeak(`Switched tab to ${item.id}`);
                        }}
                        className={`flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition border-0 bg-transparent ${
                          isActive 
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                            : 'text-earth-400 dark:text-earth-500 hover:text-foreground'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-earth-400'}`} />
                        <span className="text-[9px] mt-1 font-semibold tracking-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

              </div>
            </div>

            {/* Simulated camera Disease scanner overlay */}
            {showScanner && (
              <div className="absolute inset-0 bg-[#070908]/95 z-50 p-6 flex flex-col justify-between rounded-[52px]">
                
                {/* Header of scanner */}
                <div className="flex justify-between items-center text-white pb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black tracking-wide">AI Disease Scanner</span>
                  </div>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="p-1.5 rounded-full bg-white/10 text-white cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Scanning Viewport */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  
                  {scannerStep === 'camera' && (
                    <div className="space-y-6 text-center w-full">
                      {/* Leaf picture container */}
                      <div className="w-56 h-56 rounded-3xl border-2 border-dashed border-emerald-500 relative mx-auto overflow-hidden flex items-center justify-center bg-emerald-500/5">
                        <img 
                          src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80" 
                          alt="tomato leaf" 
                          className="w-full h-full object-cover opacity-60" 
                        />
                        <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-3xl animate-ping" />
                        <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-500 animate-pulse shadow-sm" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-white text-xs font-black">Hold steady. Align crop leaf in grid.</h4>
                        <p className="text-[9px] text-earth-400">Keep leaf flat with good natural lighting.</p>
                      </div>

                      <button
                        onClick={() => {
                          setScannerStep('loading');
                          setTimeout(() => {
                            setScannerStep('result');
                            triggerSpeak("Late blight infestation detected on tomato foliage. We recommend spraying copper fungicide and pruning infected leaves immediately to prevent water mold spread.");
                          }, 2500);
                        }}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold w-full max-w-xs shadow-md border-0 cursor-pointer"
                      >
                        Capture & Diagnose Leaf
                      </button>
                    </div>
                  )}

                  {scannerStep === 'loading' && (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
                      <div className="space-y-1 text-white">
                        <h4 className="text-xs font-black">AI Neural Network analyzing pattern...</h4>
                        <p className="text-[9px] text-earth-400">Matching with 10,000+ agricultural leaf signatures.</p>
                      </div>
                    </div>
                  )}

                  {scannerStep === 'result' && (
                    <div className="bg-white dark:bg-earth-900 rounded-3xl p-5 w-full text-left space-y-4 border border-earth-200 dark:border-earth-800 animate-slide-up max-h-[480px] overflow-y-auto">
                      <div className="flex justify-between items-start border-b border-earth-100 dark:border-earth-800 pb-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-extrabold bg-red-100 text-red-600 uppercase tracking-wider">High Severity (88% match)</span>
                          <h4 className="text-sm font-black text-foreground mt-1.5">Tomato Late Blight (Phytophthora infestans)</h4>
                        </div>
                        <span className="text-2xl">🍂</span>
                      </div>

                      <div className="space-y-3 text-[10px] leading-relaxed">
                        <div>
                          <span className="text-earth-400 block font-bold uppercase tracking-wider text-[8px]">Description</span>
                          <p className="text-foreground font-medium mt-0.5">A fast-spreading water mold disease common in high monsoon humidity. Blights stems, leaves, and tomato skins, causing crop decay within 48 hours if left untreated.</p>
                        </div>

                        <div>
                          <span className="text-earth-400 block font-bold uppercase tracking-wider text-[8px]">Organic Remedy</span>
                          <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">Spray baking soda (sodium bicarbonate) solution or neem extract mixture. Prune infected lower foliage immediately and burn to destroy spores.</p>
                        </div>

                        <div>
                          <span className="text-earth-400 block font-bold uppercase tracking-wider text-[8px]">Chemical Treatment</span>
                          <p className="text-foreground font-medium mt-0.5">Apply copper-based fungicide or Mancozeb sprays at the first sign of weather moisture. Repeat every 7 days during monsoon season.</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-earth-100 dark:border-earth-800 flex gap-2">
                        <button
                          onClick={() => {
                            setScannerStep('camera');
                            triggerSpeak("Returning to camera mode.");
                          }}
                          className="flex-1 py-2 bg-earth-100 dark:bg-earth-800 hover:bg-earth-200 text-earth-700 dark:text-earth-300 rounded-xl text-xs font-bold cursor-pointer border-0"
                        >
                          Scan Again
                        </button>
                        <button
                          onClick={() => setShowScanner(false)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer border-0"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Smartphone details label */}
          <span className="text-[10px] font-mono font-bold tracking-widest text-earth-500 mt-2 flex items-center gap-1.5 select-none">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PORTRAIT VIEWPORT · 375 × 740 (IPHONE SIM)</span>
          </span>

        </div>

        {/* RIGHT COLUMN: DESIGN EXPLORER & SPECS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          
          <div className="mb-4 bg-white dark:bg-earth-900 border border-earth-250 dark:border-earth-850 p-1.5 rounded-2xl flex gap-1.5">
            {[
              { id: 'system', label: 'Design System', icon: Layers },
              { id: 'library', label: 'Component Library', icon: FileText },
              { id: 'flows', label: 'User Flows', icon: Navigation },
              { id: 'architecture', label: 'System Architecture', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSpecTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSpecTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition border-0 flex items-center justify-center gap-1.5 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-transparent text-earth-500 hover:text-foreground hover:bg-earth-50 dark:hover:bg-earth-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Explorer Specifications Window */}
          <div className="flex-1 bg-white dark:bg-[#121614] border border-earth-250 dark:border-earth-850 rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[710px] space-y-6">
            
            {/* TAB 1: DESIGN SYSTEM */}
            {activeSpecTab === 'system' && (
              <div className="space-y-6 animate-fade-in text-xs leading-relaxed text-earth-700 dark:text-earth-300">
                <div>
                  <h3 className="text-base font-black text-foreground font-display">Design System Specification</h3>
                  <p className="text-xs text-earth-400 mt-1">Core design tokens and branding guidelines defined for AgriGravity Super App.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">1. Color Palette (Harmonious Earth & Green)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-[#16a34a] text-white flex flex-col justify-between h-20 shadow-2xs">
                      <span className="font-extrabold">Primary Green</span>
                      <span className="font-mono text-[9px]">#16a34a (Main Forest)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#ea580c] text-white flex flex-col justify-between h-20 shadow-2xs">
                      <span className="font-extrabold">Earth Terracotta</span>
                      <span className="font-mono text-[9px]">#ea580c (Soil/Clay)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#ca8a04] text-white flex flex-col justify-between h-20 shadow-2xs">
                      <span className="font-extrabold">Sunshine Gold</span>
                      <span className="font-mono text-[9px]">#ca8a04 (Advisory)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="p-3 rounded-2xl bg-[#fcfdfc] border border-earth-200 text-earth-800 flex flex-col justify-between h-20 shadow-2xs">
                      <span className="font-extrabold text-foreground">Light Backdrop</span>
                      <span className="font-mono text-[9px]">#fcfdfc (Clean Sand)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0b0e0c] text-earth-200 flex flex-col justify-between h-20 shadow-2xs">
                      <span className="font-extrabold">Slate Dark Backdrop</span>
                      <span className="font-mono text-[9px]">#0b0e0c (Eye strain prevention)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">2. Typographic Scale</h4>
                  <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 space-y-3 font-mono text-[10px]">
                    <div>
                      <span className="text-emerald-600 font-bold block mb-1">Display Titles (Outfit font)</span>
                      <span className="text-lg font-black text-foreground">AgriGravity Super App UI</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-bold block mb-1">Subheadings (Outfit font)</span>
                      <span className="text-xs font-extrabold text-foreground">Agriculture Operating System</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-bold block mb-1">Body Text (Inter font)</span>
                      <span className="text-xs text-foreground font-sans">Highly legible multi-lingual body text rendering English, தமிழ் and हिंदी seamlessly under dense mobile matrices.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">3. Accessibility Spacing Scale</h4>
                  <p className="text-xs leading-normal">
                    Designed with an 8px grid system. Margins and touch target sizes are padded to at least **44px** to ensure farmers with soil-rough hands can tap utility options without layout fat-fingering errors.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: COMPONENT LIBRARY */}
            {activeSpecTab === 'library' && (
              <div className="space-y-6 animate-fade-in text-xs leading-relaxed text-earth-700 dark:text-earth-300">
                <div>
                  <h3 className="text-base font-black text-foreground font-display">AgriGravity Component Library</h3>
                  <p className="text-xs text-earth-400 mt-1">Reusable, high-fidelity UI components optimized for rural digit-literacy.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">1. StatCard (Dashboard KPI Indicator)</h4>
                  <div className="p-4 border border-earth-200 dark:border-earth-850 rounded-2xl bg-[#fafafa] dark:bg-[#151a17] space-y-2">
                    <span className="text-[10px] text-earth-400 block font-bold uppercase tracking-wider">Soil Moisture Indicator</span>
                    <span className="text-2xl font-black text-emerald-600">42%</span>
                    <span className="text-[9px] text-earth-500 block">Normal moisture envelope. Drip line active.</span>
                  </div>
                  <div className="p-3 bg-earth-50 dark:bg-earth-950/20 rounded-xl font-mono text-[9px] text-earth-400">
                    <span>Component Props: <code>{`{ title: string, value: string | number, subtitle: string, trend?: string }`}</code></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">2. Giant Large Touch Action Button</h4>
                  <div className="p-4 border border-earth-200 dark:border-earth-850 rounded-2xl bg-[#fafafa] dark:bg-[#151a17] flex justify-center">
                    <button className="px-6 py-4 bg-emerald-600 text-white rounded-3xl text-sm font-black flex items-center justify-center gap-2 border-0 shadow-md w-full max-w-xs cursor-not-allowed">
                      <Camera className="w-5 h-5" />
                      <span>Scan Crop Disease (48px Target)</span>
                    </button>
                  </div>
                  <div className="p-3 bg-earth-50 dark:bg-earth-950/20 rounded-xl font-mono text-[9px] text-earth-400">
                    <span>Target Size: 48px Height, fully padded rounded corners to prevent visual clutter.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">3. Multi-lingual Status Badge</h4>
                  <div className="p-4 border border-earth-200 dark:border-earth-850 rounded-2xl bg-[#fafafa] dark:bg-[#151a17] flex gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full">
                      ✓ நிறைவுற்றது (Completed)
                    </span>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-full animate-pulse">
                      ● செயலில் உள்ளது (Active)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USER FLOWS */}
            {activeSpecTab === 'flows' && (
              <div className="space-y-6 animate-fade-in text-xs leading-relaxed text-earth-700 dark:text-earth-300">
                <div>
                  <h3 className="text-base font-black text-foreground font-display">User Task Flows</h3>
                  <p className="text-xs text-earth-400 mt-1">Sequence of user interactions mapping out core app functionality.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">Flow 1: AI Disease Diagnosis & Remedy</h4>
                  
                  <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 space-y-3.5">
                    <div className="flex flex-col gap-2 font-mono text-[10px] text-foreground">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">1</span>
                        <span>Farmer clicks **AI Crop Disease Scan** button.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-emerald-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">2</span>
                        <span>Camera scanner opens; snaps leaf photo.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-emerald-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">3</span>
                        <span>AI extracts leaf features, matching with disease repository.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-emerald-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">4</span>
                        <span>Diagnosis & Remedy is read aloud in farmer's chosen language.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">Flow 2: Crop Listing & Escrow Settlement</h4>
                  
                  <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 space-y-3.5">
                    <div className="flex flex-col gap-2 font-mono text-[10px] text-foreground">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white">1</span>
                        <span>Farmer reviews Live Mandi benchmarks on **Market Screen**.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-amber-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white">2</span>
                        <span>Farmer inputs quantity into Valuation Estimator and lists yield.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-amber-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white">3</span>
                        <span>B2B buyer confirms order; funds are lock-escrowed instantly.</span>
                      </div>
                      <div className="pl-6 border-l-2 border-amber-500/20">↓</div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white">4</span>
                        <span>Logistics driver delivers crop; Smart Escrow automatically releases funds to farmer's wallet.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SYSTEM ARCHITECTURE */}
            {activeSpecTab === 'architecture' && (
              <div className="space-y-6 animate-fade-in text-xs leading-relaxed text-earth-700 dark:text-earth-300">
                <div>
                  <h3 className="text-base font-black text-foreground font-display">Information & System Architecture</h3>
                  <p className="text-xs text-earth-400 mt-1">High-level software component architecture for AgriGravity Super App.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">1. Mobile Client Stack</h4>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Presentation Layer</strong>: React / Tailwind CSS responsive client tailored for mobile viewport dimensions.</li>
                    <li><strong>State Management</strong>: Local Context API broadcasting updates (Language transitions, telemetry metrics).</li>
                    <li><strong>AI Assist Subsystem</strong>: Neural leaf feature extractor API routes connecting to classification endpoints.</li>
                    <li><strong>Smart Ledger Bridge</strong>: Unified UPI API mock integration (Google Pay/PhonePe wallet settlement clearing).</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">2. Information Architecture tree</h4>
                  <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 font-mono text-[10px] space-y-2">
                    <div>📂 AgriGravity Root</div>
                    <div className="pl-4">├── 📂 Home Tab (Weather Advisory, AI Chat Assistant, AI Leaf Scanner)</div>
                    <div className="pl-4">├── 📂 Farm Tab (Soil Health Cards, Sensor Telemetry Graphs, Crop Stage Timeline)</div>
                    <div className="pl-4">├── 📂 Market Tab (B2B Buyer Directory, Agmarknet Mandi Feeds, Valuation Calculator)</div>
                    <div className="pl-4">└── 📂 More Tab (Linked Escrow Accounts, Wallet Ledgers, Pictorial mode toggles)</div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-earth-200 dark:border-earth-850 text-center text-[10px] text-earth-400 font-mono select-none">
        AgriGravity UI/UX Architecture Spec Sandbox © 2026. Designed with Antigravity AI principles.
      </footer>

    </div>
  );
}
