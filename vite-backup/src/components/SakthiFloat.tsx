import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Volume2, VolumeX, X, Play, Headphones } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';

export default function SakthiFloat() {
  const { language, t } = useApp();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTab = searchParams.get('tab') || 'advisory';

  // Dynamic voice transcripts based on current route/tab and active language
  const getVoiceAlerts = () => {
    const briefs: Record<'en' | 'ta' | 'hi', { title: string; speech: string }> = {
      en: { title: "Sakthi voice Guide", speech: "Hello! Welcome to V-LINK. Let me help you navigate this screen." },
      ta: { title: "சக்தி குரல் உதவி", speech: "வணக்கம்! V-LINK-க்கு உங்களை வரவேற்கிறோம். இந்த பக்கத்தைப் பயன்படுத்த நான் உங்களுக்கு உதவுகிறேன்." },
      hi: { title: "शक्ति आवाज सहायक", speech: "नमस्ते! V-LINK में आपका स्वागत है। इस स्क्रीन को समझने में मैं आपकी मदद करूँगी।" }
    };

    if (pathname === '/dashboard') {
      if (activeTab === 'advisory') {
        briefs.en = {
          title: "Advisory Voice Briefing",
          speech: "Market Alert. Today's Organic Tomato price is ₹32 per kg, which is ₹8 higher than the government mandi rate. Warning: Heavy rain is expected in 24 hours. Please clear water drainage in your fields immediately."
        };
        briefs.ta = {
          title: "விவசாய அறிவுரை குரல்ஒலி",
          speech: "சந்தைத் தகவல். இன்று தக்காளி விலை கிலோவிற்கு ₹32 ஆகும். இது அரசு விலையை விட ₹8 அதிகமாகும். எச்சரிக்கை: அடுத்த 24 மணி நேரத்தில் பலத்த மழை பெய்யும். உங்கள் வயல்களில் வடிகால் வசதியைச் சரிசெய்யவும்."
        };
        briefs.hi = {
          title: "कृषि मौसम सलाह ब्रिफिंग",
          speech: "मंडी अलर्ट। आज टमाटर का दाम ₹32 प्रति किलो है, जो सरकारी दर से ₹8 अधिक है। चेतावनी: अगले 24 घंटों में भारी बारिश की आशंका है। अपने खेतों में जल निकासी तुरंत ठीक करें।"
        };
      } else if (activeTab === 'sales') {
        briefs.en = {
          title: "Direct Sales Assistance",
          speech: "To sell your crop directly, tap the green List Crop Produce button. Fill in the weight, price, and select whether you want to sell to retail shops, hotels, marriage halls, or customers."
        };
        briefs.ta = {
          title: "நேரடி விற்பனை குரல் உதவி",
          speech: "உங்கள் பயிர்களை நேரடியாக விற்க, பச்சை நிற 'விளைச்சல் பதிவு செய்' பொத்தானைத் தட்டவும். எடை, விலை மற்றும் யாருக்கு விற்க வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்."
        };
        briefs.hi = {
          title: "सीधी बिक्री सहायता गाइड",
          speech: "अपनी फसल सीधे बेचने के लिए, हरे रंग के 'फसल दर्ज करें' बटन को दबाएं। फसल का वजन, मूल्य और किस माध्यम से बेचना है, यह चुनें।"
        };
      } else if (activeTab === 'rentals') {
        briefs.en = {
          title: "Rent Machinery Guide",
          speech: "Here you can rent John Deere tractors or tools. Tap the Rent Machinery button. It will deduct the rental fee from your wallet and secure the equipment for your farm."
        };
        briefs.ta = {
          title: "வாடகை எந்திரங்கள் குரல் உதவி",
          speech: "இங்கு நீங்கள் டிராக்டர்கள் மற்றும் வாடகை கருவிகளைப் பதிவு செய்யலாம். 'வாடகைக்கு எடு' பொத்தானைத் தட்டவும். வாடகைத் தொகை உங்களது பணப்பையில் இருந்து கழிக்கப்படும்."
        };
        briefs.hi = {
          title: "मशीनरी किराया सहायता गाइड",
          speech: "यहाँ आप जॉन डीरे ट्रैक्टर या उपकरण किराए पर ले सकते हैं। 'किराए पर लें' बटन को दबाएं, किराया राशि आपके वॉलेट से कट जाएगी।"
        };
      } else if (activeTab === 'labor') {
        briefs.en = {
          title: "Labor Booking Guide",
          speech: "Post sowing or harvesting tasks here to find local workers. Tap the Post Labor Booking button to list your daily wage offer. Hired worker wages will be escrowed safely."
        };
        briefs.ta = {
          title: "வேலைக்கு ஆட்கள் சேர்க்கை உதவி",
          speech: "அறுவடை வேலைகளுக்கு ஆட்களை நியமிக்க, 'வேலை விளம்பரம் செய்' பொத்தானைத் தட்டவும். தினசரி கூலி விபரங்களை உள்ளிட்டு ஆட்களை உடனடியாக முன்பதிவு செய்யவும்."
        };
        briefs.hi = {
          title: "मजदूर बुकिंग सहायता गाइड",
          speech: "मजदूरों को काम पर रखने के लिए 'काम दर्ज करें' बटन दबाएं। दैनिक मजदूरी दर दर्ज करें। काम पूरा होने पर सुरक्षित भुगतान किया जाएगा।"
        };
      } else if (activeTab === 'sakthi') {
        briefs.en = {
          title: "Sakthi Literacy Guide",
          speech: "Tap on any of the play buttons below. Sakthi will translate crop market prices and cooperative subsidy schemes into clear voice read-outs to help you use the app."
        };
        briefs.ta = {
          title: "சக்தி குரல் வழிகாட்டி",
          speech: "கீழே உள்ள பிளே பொத்தான்களைத் தட்டவும். சக்தி உதவியாளர் சந்தை விலை விவரங்கள் மற்றும் கூட்டுறவு மானியத் திட்டங்களை குரல் ஒலியாக வாசித்து உங்களுக்கு விளக்கும்."
        };
        briefs.hi = {
          title: "शक्ति डिजिटल साक्षरता गाइड",
          speech: "नीचे दिए गए प्ले बटनों को दबाएं। शक्ति सहायक सरकारी योजनाओं और फसल मूल्यों को हिंदी आवाज में सुनाकर ऐप का उपयोग करने में मदद करेगा।"
        };
      }
    } else if (pathname === '/dashboard/marketplace') {
      briefs.en = {
        title: "Wholesale Marketplace Guide",
        speech: "Welcome to direct crop marketplace. Browse available organic crops directly from farms. Tap Place Purchase Order on any card, enter quantity and drop destination to clear contract."
      };
      briefs.ta = {
        title: "மொத்த காய்கறி சந்தை வழிகாட்டி",
        speech: "நேரடி காய்கறி சந்தைக்கு வரவேற்கிறோம். விவசாயிகளிடம் இருந்து காய்கறி வகைகளைத் தேர்ந்தெடுக்கவும். கொள்முதல் செய்ய 'ஆர்டர் செய்' பொத்தானைத் தட்டி அளவை உள்ளீடு செய்யவும்."
      };
      briefs.hi = {
        title: "थोक सब्जी बाजार गाइड",
        speech: "सब्जी मंडी में आपका स्वागत है। खेतों की ताजी फसलें देखें। खरीदने के लिए 'आर्डर करें' बटन दबाएं, मात्रा दर्ज करें और आर्डर कन्फर्म करें।"
      };
    } else if (pathname === '/dashboard/orders') {
      briefs.en = {
        title: "Escrow Ledger Guide",
        speech: "Here you can track your active supply contracts. Funds are securely locked in V-LINK smart escrow and will automatically clear to the farmer once delivery is verified."
      };
      briefs.ta = {
        title: "கொள்முதல் ஒப்பந்தங்கள் வழிகாட்டி",
        speech: "இங்கு நீங்கள் உங்கள் ஒப்பந்தங்களைக் கண்காணிக்கலாம். கொள்முதல் பணம் V-LINK எஸ்க்ரோவில் பாதுகாப்பாக வைக்கப்பட்டுள்ளது. டெலிவரி முடிந்தவுடன் பணம் விவசாயிக்கு மாற்றப்படும்."
      };
      briefs.hi = {
        title: "अनुबंध ट्रैकिंग गाइड",
        speech: "यहाँ आप अपने सक्रीय अनुबंध देख सकते हैं। खरीदार का भुगतान सरकारी एस्क्रो में सुरक्षित जमा है। डिलीवरी पूरी होने पर भुगतान किसान को ट्रांसफर कर दिया जाएगा।"
      };
    } else if (pathname === '/dashboard/delivery') {
      briefs.en = {
        title: "Logistics Dispatch Board",
        speech: "Delivery partner board. Browse available pickup routes matching regional farms. Tap Accept Route, pick up crops, and click Complete Delivery to receive your logistics wage."
      };
      briefs.ta = {
        title: "டெலிவரி வழிகள் வழிகாட்டி",
        speech: "டெலிவரி முகப்பு பலகை. காய்கறிகளை ஏற்றிச்செல்ல வழிகளைத் தேர்ந்தெடுக்கவும். 'வழியை ஏற்றுக்கொள்' பொத்தானைத் தட்டி, டெலிவரி முடிந்ததும் 'விநியோகம் முடிந்தது' எனப் பதிவு செய்யவும்."
      };
      briefs.hi = {
        title: "डिलीवरी रूट गाइड",
        speech: "लॉजिस्टिक्स बोर्ड। खेतों से सब्जी उठाकर दुकानों तक पहुंचाने के मार्ग चुनें। काम स्वीकार करें और पूरा होने पर 'डिलीवरी पूरी हुई' दबाएं।"
      };
    } else if (pathname === '/dashboard/labor') {
      briefs.en = {
        title: "Farm jobs registry",
        speech: "Workforce jobs board. Browse planting and harvesting jobs near your district. Apply to secure daily wages directly to your workspace wallet."
      };
      briefs.ta = {
        title: "விவசாய வேலைவாய்ப்பு வழிகாட்டி",
        speech: "வேலை தேடும் பலகை. உங்கள் மாவட்டத்திற்கு அருகில் உள்ள நடவு மற்றும் அறுவடை வேலைகளைக் கண்டறியவும். விண்ணப்பித்து தினசரி கூலியைப் பாதுகாப்பாகப் பெறவும்."
      };
      briefs.hi = {
        title: "कृषि रोजगार गाइड",
        speech: "कामगार बोर्ड। अपने जिले के पास रोपण और कटाई के काम खोजें। आवेदन करें और अपनी दैनिक मजदूरी सुरक्षित रूप से कमाएं।"
      };
    }

    return briefs[language] || briefs['en'];
  };

  const currentBrief = getVoiceAlerts();

  // Stop playback when tab, page, or language changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [pathname, activeTab, language]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop any current speech synthesis
        const utterance = new SpeechSynthesisUtterance(currentBrief.speech);
        
        // Find best match voice for the selected language
        const voices = window.speechSynthesis.getVoices();
        let matchedVoice = null;
        if (language === 'ta') {
          matchedVoice = voices.find(v => v.lang.toLowerCase().includes('ta'));
        } else if (language === 'hi') {
          matchedVoice = voices.find(v => v.lang.toLowerCase().includes('hi'));
        } else {
          matchedVoice = voices.find(v => v.lang.toLowerCase().includes('en'));
        }
        
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        
        utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = (e) => {
          console.error("Speech synthesis error:", e);
          setIsPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback timeout if SpeechSynthesis is not supported
        setTimeout(() => {
          setIsPlaying((curr) => (curr ? false : curr));
        }, 6000);
      }
    }
  };

  return (
    <>
      {/* Floating Circular Assist Button */}
      <div className="fixed bottom-20 right-4 z-50 animate-bounce-subtle">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsPlaying(false);
          }}
          className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-xl ring-4 ring-primary-500/20 cursor-pointer border-0"
          title="Sakthi Voice Guide"
        >
          <Headphones className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Expanded Voice Drawer overlay at the bottom */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 bg-white/95 dark:bg-[#141816]/95 backdrop-blur-md border-t border-[#e6eae7] dark:border-[#232a26] z-50 p-5 rounded-t-3xl shadow-2xl animate-slide-up max-w-lg mx-auto pb-8 md:pb-6">
          <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-primary-500 text-white shrink-0">
                <Volume2 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                  {currentBrief.title}
                </h4>
                <p className="text-[9px] text-primary-600 font-bold uppercase tracking-wider -mt-0.5">
                  🎙️ Sakthi Voice Assist (Tamil/Hindi/English)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPlaying(false);
              }}
              className="p-1.5 rounded-lg text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900/40 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Audio visualizer bar graph */}
            {isPlaying ? (
              <div className="py-2.5 flex items-center justify-center gap-1 bg-red-500/10 rounded-xl border border-red-500/20">
                <span className="w-1.5 h-6 bg-red-500 rounded animate-bounce shrink-0" />
                <span className="w-1.5 h-10 bg-red-500 rounded animate-bounce delay-75 shrink-0" />
                <span className="w-1.5 h-4 bg-red-500 rounded animate-bounce delay-150 shrink-0" />
                <span className="w-1.5 h-8 bg-red-500 rounded animate-bounce delay-100 shrink-0" />
                <span className="w-1.5 h-12 bg-red-500 rounded animate-bounce delay-200 shrink-0" />
                <span className="w-1.5 h-6 bg-red-500 rounded animate-bounce delay-75 shrink-0" />
                <span className="text-[10px] text-red-500 font-bold ml-2 font-mono">
                  {t('sakthi_playing')}
                </span>
              </div>
            ) : (
              <div className="py-2 px-3 bg-earth-50 dark:bg-earth-950/20 text-center rounded-xl text-[10px] font-mono text-earth-400 border border-earth-200 dark:border-earth-800">
                {t('sakthi_tip')}
              </div>
            )}

            {/* Vocal Transcript */}
            <div className="p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20">
              <p className="text-sm font-extrabold text-primary-800 dark:text-primary-300 leading-relaxed text-center">
                &ldquo;{currentBrief.speech}&rdquo;
              </p>
            </div>

            {/* CTA action button */}
            <button
              onClick={togglePlayback}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm border-0 ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current pl-0.5" />}
              <span>{isPlaying ? t('sakthi_stop') : t('sakthi_play')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
