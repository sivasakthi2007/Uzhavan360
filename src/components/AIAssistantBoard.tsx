'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  Bot,
  User,
  Leaf,
  Bug,
  TrendingUp,
  BookOpen,
  Sprout,
  CloudSun,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Mic
} from 'lucide-react';

// ─── Knowledge Base ─────────────────────────────────────────────────
interface QAPair {
  id: string;
  category: 'disease' | 'market' | 'scheme' | 'practice' | 'weather' | 'general';
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
  keywords: string[];
}

const KNOWLEDGE_BASE: QAPair[] = [
  // Disease Guidance
  {
    id: 'q1', category: 'disease',
    questionEn: 'How to treat tomato late blight?',
    questionTa: 'தக்காளி லேட் பிளைட் நோயை எப்படி குணப்படுத்துவது?',
    answerEn: '🍅 **Tomato Late Blight Treatment:**\n\n1. **Immediate:** Remove and destroy infected leaves. Do NOT compost them.\n2. **Chemical:** Spray copper-based fungicide (Bordeaux mixture) immediately.\n3. **Organic:** Apply bio-fungicide with Bacillus subtilis.\n4. **Prevention:** Use drip irrigation to keep leaves dry. Space plants 60cm apart for airflow.\n5. **Crop rotation:** Don\'t plant tomatoes near potatoes next season.',
    answerTa: '🍅 **தக்காளி லேட் பிளைட் சிகிச்சை:**\n\n1. **உடனடி நடவடிக்கை:** பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும். உரமாக்காதீர்கள்.\n2. **இரசாயன:** செப்பு அடிப்படையிலான பூஞ்சை மருந்து (போர்டோ கலவை) உடனடியாகத் தெளிக்கவும்.\n3. **இயற்கை:** பேசில்லஸ் சப்டிலிஸ் கொண்ட உயிர் பூஞ்சை மருந்தை பயன்படுத்தவும்.\n4. **தடுப்பு:** இலைகள் உலர்வாக இருக்க சொட்டுநீர் பாசனம் பயன்படுத்தவும். செடிகளுக்கு இடையே 60 செ.மீ. இடைவெளி.\n5. **பயிர் சுழற்சி:** அடுத்த பருவத்தில் உருளைக்கிழங்கு அருகில் தக்காளி நடாதீர்கள்.',
    keywords: ['blight', 'tomato', 'fungus', 'copper', 'disease', 'தக்காளி', 'நோய்'],
  },
  {
    id: 'q2', category: 'disease',
    questionEn: 'My chilli leaves are curling. What should I do?',
    questionTa: 'எனது மிளகாய் இலைகள் சுருண்டு விடுகின்றன. என்ன செய்ய வேண்டும்?',
    answerEn: '🌶️ **Chilli Leaf Curl Treatment:**\n\nThis is likely **Chilli Leaf Curl Virus (ChiLCV)** spread by whiteflies.\n\n1. **Control whiteflies:** Spray neem oil (5ml/litre) every 5 days.\n2. **Yellow sticky traps:** Place 10-15 traps per acre to catch whiteflies.\n3. **Remove infected plants:** Uproot severely infected plants and burn them.\n4. **Resistant varieties:** Next season, use virus-resistant chilli varieties.\n5. **Companion planting:** Grow marigold around chilli plot to repel pests.',
    answerTa: '🌶️ **மிளகாய் இலை சுருட்டு சிகிச்சை:**\n\nஇது வெள்ளை ஈக்களால் பரவும் **மிளகாய் இலை சுருட்டு வைரஸ் (ChiLCV)** ஆக இருக்கலாம்.\n\n1. **வெள்ளை ஈ கட்டுப்பாடு:** வேப்ப எண்ணெய் (5மிலி/லிட்டர்) 5 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.\n2. **மஞ்சள் ஒட்டும் பொறி:** ஏக்கருக்கு 10-15 பொறிகள் வைக்கவும்.\n3. **பாதிக்கப்பட்ட செடிகளை அகற்றுதல்:** கடுமையாக பாதிக்கப்பட்ட செடிகளை பிடுங்கி எரிக்கவும்.\n4. **எதிர்ப்பு ரகங்கள்:** அடுத்த பருவத்தில் வைரஸ் எதிர்ப்பு மிளகாய் ரகங்களைப் பயன்படுத்தவும்.\n5. **இணைப் பயிர்:** மிளகாய் தோட்டத்தைச் சுற்றி செண்டு மல்லி நடுங்கள்.',
    keywords: ['chilli', 'curl', 'leaf', 'virus', 'whitefly', 'மிளகாய்', 'இலை', 'சுருட்டு'],
  },
  {
    id: 'q3', category: 'disease',
    questionEn: 'How to prevent paddy blast disease?',
    questionTa: 'நெல் கருகல் நோயை எப்படி தடுப்பது?',
    answerEn: '🌾 **Paddy Blast Prevention:**\n\n1. **Seed treatment:** Treat seeds with Tricyclazole (6g/kg) before sowing.\n2. **Avoid excess nitrogen:** Use balanced fertilizer (N:P:K = 4:2:1).\n3. **Water management:** Maintain 2-5cm water level, avoid drought stress.\n4. **Spray schedule:** Apply Carbendazim at tillering stage if symptoms appear.\n5. **Resistant varieties:** ADT 43, CO 51 are blast-resistant paddy varieties for Tamil Nadu.',
    answerTa: '🌾 **நெல் கருகல் நோய் தடுப்பு:**\n\n1. **விதை நேர்த்தி:** விதைகளை டிரைசைக்ளாசோல் (6 கிராம்/கிலோ) கொண்டு பதப்படுத்தவும்.\n2. **அதிக தழை உரத்தைத் தவிர்க்கவும்:** சமச்சீர் உரம் (N:P:K = 4:2:1) பயன்படுத்தவும்.\n3. **நீர் மேலாண்மை:** 2-5 செ.மீ. நீர் மட்டம் பராமரிக்கவும், வறட்சி தவிர்க்கவும்.\n4. **தெளிப்பு அட்டவணை:** அறிகுறிகள் தென்பட்டால் பிடிப்பு நிலையில் கார்பெண்டாசிம் தெளிக்கவும்.\n5. **எதிர்ப்பு ரகங்கள்:** ADT 43, CO 51 தமிழ்நாட்டிற்கான கருகல் எதிர்ப்பு நெல் ரகங்கள்.',
    keywords: ['paddy', 'blast', 'rice', 'நெல்', 'கருகல்'],
  },

  // Market Queries
  {
    id: 'q4', category: 'market',
    questionEn: 'What is the current tomato price in Madurai?',
    questionTa: 'மதுரையில் தற்போதைய தக்காளி விலை என்ன?',
    answerEn: '📊 **Current Tomato Price — Madurai:**\n\n• Government Mandi Rate: ₹24-28/kg\n• V-LINK Direct Price: ₹32/kg\n• **You save ₹4-8/kg** by selling directly through V-LINK!\n\n💡 **Tip:** Tomato prices are expected to rise next week due to reduced supply from monsoon damage. Hold 30% of your stock if storage is available.',
    answerTa: '📊 **தற்போதைய தக்காளி விலை — மதுரை:**\n\n• அரசு மண்டி விலை: ₹24-28/கிலோ\n• V-LINK நேரடி விலை: ₹32/கிலோ\n• V-LINK மூலம் நேரடியாக விற்று **₹4-8/கிலோ சேமிக்கலாம்**!\n\n💡 **குறிப்பு:** பருவமழை சேதத்தால் வரும் வாரம் தக்காளி விலை உயர எதிர்பார்க்கப்படுகிறது. சேமிப்பு வசதி இருந்தால் 30% பங்கை வைத்திருங்கள்.',
    keywords: ['tomato', 'price', 'madurai', 'market', 'rate', 'தக்காளி', 'விலை', 'மதுரை'],
  },
  {
    id: 'q5', category: 'market',
    questionEn: 'When is the best time to sell onions?',
    questionTa: 'வெங்காயம் விற்க சிறந்த நேரம் எப்போது?',
    answerEn: '🧅 **Best Time to Sell Onions:**\n\n• **Peak prices:** April-June (summer) and November-December (wedding season)\n• **Low prices:** August-September (new harvest arrives)\n\n**Strategy:**\n1. Store onions in well-ventilated sheds after drying for 10-15 days.\n2. Grade by size — A-grade (5cm+) fetches 30% premium.\n3. Use V-LINK to pre-book bulk orders from hotels and caterers during peak season.\n4. Current Dindigul rate: ₹28/kg — prices trending UP 📈',
    answerTa: '🧅 **வெங்காயம் விற்க சிறந்த நேரம்:**\n\n• **அதிக விலை:** ஏப்ரல்-ஜூன் (கோடை) மற்றும் நவம்பர்-டிசம்பர் (திருமண சீசன்)\n• **குறைந்த விலை:** ஆகஸ்ட்-செப்டம்பர் (புதிய அறுவடை வரும்)\n\n**உத்தி:**\n1. 10-15 நாட்கள் காயவைத்த பிறகு காற்றோட்டமான கொட்டகையில் சேமிக்கவும்.\n2. அளவின்படி வரிசைப்படுத்தவும் — A-தரம் (5செ.மீ.+) 30% அதிக விலை.\n3. V-LINK மூலம் ஹோட்டல்கள் மற்றும் கேட்டரிங் நிறுவனங்களிடம் முன்பதிவு செய்யுங்கள்.\n4. தற்போதைய திண்டுக்கல் விலை: ₹28/கிலோ — விலை உயர்வு 📈',
    keywords: ['onion', 'sell', 'time', 'price', 'season', 'வெங்காயம்', 'விற்க', 'நேரம்'],
  },

  // Government Schemes
  {
    id: 'q6', category: 'scheme',
    questionEn: 'How to apply for PM-KISAN scheme?',
    questionTa: 'PM-KISAN திட்டத்திற்கு எப்படி விண்ணப்பிப்பது?',
    answerEn: '🏛️ **PM-KISAN Application Guide:**\n\n**Eligibility:** All farmer families with cultivable land.\n**Benefit:** ₹6,000/year (₹2,000 every 4 months)\n\n**Steps to Apply:**\n1. Visit **pmkisan.gov.in** or your nearest CSC center.\n2. Required documents: Aadhaar card, land ownership proof, bank passbook.\n3. Fill the registration form with correct details.\n4. Your application will be verified by State/District officials.\n5. Once approved, money is directly transferred to your bank account.\n\n📱 **V-LINK Shortcut:** Go to Gov Schemes tab → Click "Apply via V-Link" on PM-KISAN.',
    answerTa: '🏛️ **PM-KISAN விண்ணப்ப வழிகாட்டி:**\n\n**தகுதி:** விவசாய நிலம் உள்ள அனைத்து விவசாய குடும்பங்கள்.\n**பயன்:** ₹6,000/ஆண்டு (4 மாதங்களுக்கு ஒருமுறை ₹2,000)\n\n**விண்ணப்பிக்கும் படிகள்:**\n1. **pmkisan.gov.in** அல்லது அருகிலுள்ள CSC மையத்திற்கு செல்லவும்.\n2. தேவையான ஆவணங்கள்: ஆதார் அட்டை, நில உரிமைச் சான்று, வங்கி பாஸ்புக்.\n3. சரியான விவரங்களுடன் பதிவு படிவத்தை நிரப்பவும்.\n4. மாநில/மாவட்ட அதிகாரிகள் சரிபார்ப்பார்கள்.\n5. அனுமதி கிடைத்தவுடன் பணம் நேரடியாக வங்கிக் கணக்கில் வரும்.\n\n📱 **V-LINK குறுக்குவழி:** அரசு திட்டங்கள் → PM-KISAN → "V-Link வழியாக விண்ணப்பிக்க" கிளிக் செய்யவும்.',
    keywords: ['pm-kisan', 'kisan', 'scheme', 'apply', 'government', 'திட்டம்', 'அரசு', 'விண்ணப்பம்'],
  },
  {
    id: 'q7', category: 'scheme',
    questionEn: 'What crop insurance schemes are available?',
    questionTa: 'என்னென்ன பயிர் காப்பீட்டு திட்டங்கள் உள்ளன?',
    answerEn: '🛡️ **Crop Insurance Schemes:**\n\n**1. PMFBY (Pradhan Mantri Fasal Bima Yojana)**\n• Premium: 1.5% (Rabi), 2% (Kharif), 5% (Cash crops)\n• Covers: Natural calamities, pests, diseases, post-harvest losses\n• Apply: Through bank, CSC, or crop insurance portal\n\n**2. RWBCIS (Weather-Based Crop Insurance)**\n• Uses weather data to determine crop loss automatically\n• No need for field inspection\n• Faster claim settlement\n\n**3. Tamil Nadu State Crop Insurance**\n• Additional state-level coverage for specific crops\n• Contact your district agriculture office\n\n📅 Last date for Kharif enrollment: July 31',
    answerTa: '🛡️ **பயிர் காப்பீட்டு திட்டங்கள்:**\n\n**1. PMFBY (பிரதான் மந்திரி பசல் பீமா யோஜனா)**\n• பிரீமியம்: 1.5% (ராபி), 2% (கரீப்), 5% (பணப்பயிர்கள்)\n• உள்ளடக்கம்: இயற்கை பேரிடர், பூச்சிகள், நோய்கள், அறுவடைக்கு பின் இழப்பு\n• விண்ணப்பம்: வங்கி, CSC, அல்லது பயிர் காப்பீட்டு இணையதளம் வழியாக\n\n**2. RWBCIS (வானிலை அடிப்படையிலான பயிர் காப்பீடு)**\n• வானிலை தரவுகளைப் பயன்படுத்தி பயிர் இழப்பை தானாகவே கணிக்கும்\n• வயல் ஆய்வு தேவையில்லை\n• விரைவான க்ளெய்ம் தீர்வு\n\n**3. தமிழ்நாடு மாநில பயிர் காப்பீடு**\n• குறிப்பிட்ட பயிர்களுக்கு கூடுதல் மாநில மட்ட பாதுகாப்பு\n• மாவட்ட வேளாண் அலுவலகத்தை தொடர்பு கொள்ளவும்\n\n📅 கரீப் பதிவு கடைசி தேதி: ஜூலை 31',
    keywords: ['insurance', 'crop', 'pmfby', 'காப்பீடு', 'பயிர்'],
  },

  // Farming Best Practices
  {
    id: 'q8', category: 'practice',
    questionEn: 'How to improve soil fertility naturally?',
    questionTa: 'இயற்கையாக மண் வளத்தை எப்படி மேம்படுத்துவது?',
    answerEn: '🌱 **Natural Soil Fertility Tips:**\n\n1. **Green Manure:** Grow Dhaincha/Sunhemp, plough into soil before flowering (adds nitrogen).\n2. **Vermicompost:** Apply 2-3 tonnes/acre — best organic fertilizer.\n3. **Crop Rotation:** Alternate cereals with legumes (legumes fix nitrogen).\n4. **Mulching:** Spread dried leaves/straw around plants to retain moisture.\n5. **Panchagavya:** Prepare from 5 cow products. Spray 3% solution monthly.\n6. **Azolla:** Grow in paddy fields — natural nitrogen fixer, fish feed too.\n7. **Avoid burning:** Never burn crop residue — it destroys beneficial microorganisms.',
    answerTa: '🌱 **இயற்கை மண் வளம் மேம்பாடு:**\n\n1. **பசுந்தாள் உரம்:** தைஞ்சா/சணப்பு வளர்த்து பூக்கும் முன் மண்ணில் உழவும் (நைட்ரஜன் சேர்க்கும்).\n2. **மண்புழு உரம்:** ஏக்கருக்கு 2-3 டன் இடவும் — சிறந்த இயற்கை உரம்.\n3. **பயிர் சுழற்சி:** தானியங்களுக்கு பதிலாக பயறு வகைகள் (நைட்ரஜன் நிலைநிறுத்தும்).\n4. **மல்ச்சிங்:** செடிகளைச் சுற்றி காய்ந்த இலைகள்/வைக்கோல் பரப்பி ஈரப்பதம் தக்கவைக்கவும்.\n5. **பஞ்சகவ்யா:** 5 பசு பொருட்களிலிருந்து தயாரிக்கவும். 3% கரைசல் மாதாந்திரம் தெளிக்கவும்.\n6. **அசோலா:** நெல் வயல்களில் வளர்க்கவும் — இயற்கை நைட்ரஜன் நிலைநிறுத்தி.\n7. **எரிக்காதீர்கள்:** பயிர் எச்சங்களை ஒருபோதும் எரிக்காதீர்கள் — நன்மை செய்யும் நுண்ணுயிர்களை அழிக்கும்.',
    keywords: ['soil', 'fertility', 'organic', 'natural', 'compost', 'மண்', 'வளம்', 'இயற்கை'],
  },
  {
    id: 'q9', category: 'practice',
    questionEn: 'What is drip irrigation and how to set it up?',
    questionTa: 'சொட்டுநீர் பாசனம் என்றால் என்ன? எப்படி அமைப்பது?',
    answerEn: '💧 **Drip Irrigation Guide:**\n\n**What:** Water delivered directly to plant roots through pipes with emitters. Saves 30-50% water.\n\n**Setup Steps:**\n1. **Main line:** PVC pipe from water source to field edge.\n2. **Sub-main:** Branch pipes along field rows.\n3. **Lateral lines:** PE tubes (12-16mm) with drippers every 30-60cm.\n4. **Filter:** Install mesh/disc filter to prevent clogging.\n5. **Pressure regulator:** Maintain 1-1.5 kg/cm² for even distribution.\n\n**Cost:** ₹15,000-25,000/acre\n**Subsidy:** 55-90% under PMKSY (Micro Irrigation scheme) — apply at agriculture office.\n\n✅ Best for: Tomato, Chilli, Sugarcane, Banana, Coconut.',
    answerTa: '💧 **சொட்டுநீர் பாசன வழிகாட்டி:**\n\n**என்ன:** குழாய்கள் வழியாக நேரடியாக வேர்களுக்கு நீர் வழங்கும் முறை. 30-50% நீர் சேமிக்கும்.\n\n**அமைப்பு படிகள்:**\n1. **முதன்மை குழாய்:** நீர் மூலத்திலிருந்து வயல் ஓரம் வரை PVC குழாய்.\n2. **உபகுழாய்:** வரிசைகள் வழியாக கிளை குழாய்கள்.\n3. **பக்கக் குழாய்கள்:** ஒவ்வொரு 30-60 செ.மீ.க்கும் சொட்டிகள் கொண்ட PE குழாய்கள் (12-16மிமீ).\n4. **வடிகட்டி:** அடைப்பு தடுக்க மெஷ்/டிஸ்க் வடிகட்டி நிறுவவும்.\n5. **அழுத்தக் கட்டுப்படுத்தி:** சீரான பகிர்வுக்கு 1-1.5 கிலோ/செ.மீ.² பராமரிக்கவும்.\n\n**செலவு:** ₹15,000-25,000/ஏக்கர்\n**மானியம்:** PMKSY (நுண் பாசனத் திட்டம்) கீழ் 55-90% — வேளாண் அலுவலகத்தில் விண்ணப்பிக்கவும்.\n\n✅ சிறந்தது: தக்காளி, மிளகாய், கரும்பு, வாழை, தென்னை.',
    keywords: ['drip', 'irrigation', 'water', 'setup', 'சொட்டுநீர்', 'பாசனம்', 'நீர்'],
  },
  {
    id: 'q10', category: 'practice',
    questionEn: 'How to reduce pest attacks without chemicals?',
    questionTa: 'இரசாயனம் இல்லாமல் பூச்சி தாக்குதலை எப்படி குறைப்பது?',
    answerEn: '🐛 **Organic Pest Control Methods:**\n\n1. **Neem Oil Spray:** 5ml neem oil + 1ml soap per litre. Spray every 7 days.\n2. **Yellow Sticky Traps:** 10-12 per acre for whitefly, aphids.\n3. **Pheromone Traps:** For fruit borer, stem borer — 4-5 per acre.\n4. **Companion Planting:** Marigold repels nematodes. Basil repels flies.\n5. **Trichogramma Cards:** Release parasitic wasps — controls caterpillars.\n6. **Light Traps:** Solar-powered light traps for moths — 1 per acre.\n7. **Pseudomonas Spray:** Bio-control agent for bacterial diseases.\n\n💰 **Savings:** Organic pest management costs 40-60% less than chemical pesticides.',
    answerTa: '🐛 **இயற்கை பூச்சிக் கட்டுப்பாட்டு முறைகள்:**\n\n1. **வேப்ப எண்ணெய் தெளிப்பு:** 5மிலி வேப்ப எண்ணெய் + 1மிலி சோப்பு/லிட்டர். 7 நாட்களுக்கு ஒருமுறை.\n2. **மஞ்சள் ஒட்டும் பொறிகள்:** ஏக்கருக்கு 10-12 — வெள்ளை ஈ, அசுவினிக்கு.\n3. **ஃபெரமோன் பொறிகள்:** காய்ப்புழு, தண்டு துளைப்பான் — ஏக்கருக்கு 4-5.\n4. **இணைப் பயிர்:** செண்டுமல்லி நூற்புழுவை விரட்டும். துளசி ஈக்களை விரட்டும்.\n5. **டிரைக்கோகிராம்மா அட்டைகள்:** ஒட்டுண்ணி குளவிகள் — கம்பளிப்பூச்சிகளைக் கட்டுப்படுத்தும்.\n6. **ஒளிப் பொறிகள்:** சூரிய ஒளி பொறிகள் — ஏக்கருக்கு 1.\n7. **சூடோமோனாஸ் தெளிப்பு:** பாக்டீரிய நோய்களுக்கு உயிர் கட்டுப்பாட்டு முகவர்.\n\n💰 **சேமிப்பு:** இரசாயன பூச்சிக்கொல்லிகளை விட 40-60% குறைவான செலவு.',
    keywords: ['pest', 'organic', 'neem', 'control', 'insect', 'பூச்சி', 'இயற்கை', 'வேப்ப'],
  },

  // Weather
  {
    id: 'q11', category: 'weather',
    questionEn: 'What should I do during heavy rain for my crops?',
    questionTa: 'கனமழை நேரத்தில் என் பயிர்களுக்கு என்ன செய்ய வேண்டும்?',
    answerEn: '🌧️ **Heavy Rain Crop Protection:**\n\n**Immediate Actions:**\n1. Clear drainage channels in ALL fields.\n2. Open bund holes to let excess water flow out.\n3. Do NOT enter waterlogged fields — wait 24 hours after rain stops.\n\n**Crop-Specific:**\n• **Tomato:** Harvest any ripe fruits now. Wet tomatoes crack.\n• **Chilli:** Spray copper fungicide after rain stops to prevent die-back.\n• **Paddy:** Close inlet if water level exceeds 15cm.\n• **Turmeric:** Check for rhizome rot after 3 days.\n\n**Post-Rain:**\n• Apply 1% Bordeaux mixture to prevent fungal diseases.\n• Side-dress with potash fertilizer for root strength.',
    answerTa: '🌧️ **கனமழை பயிர் பாதுகாப்பு:**\n\n**உடனடி நடவடிக்கைகள்:**\n1. அனைத்து வயல்களிலும் வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.\n2. அதிகப்படியான நீர் வெளியேற வரப்பு துளைகளை திறக்கவும்.\n3. நீர் தேங்கிய வயல்களுக்குள் நுழையாதீர்கள் — மழை நின்ற 24 மணி நேரம் காத்திருக்கவும்.\n\n**பயிர்வாரியாக:**\n• **தக்காளி:** பழுத்த பழங்களை இப்போதே அறுவடை செய்யவும். ஈரமான தக்காளி வெடிக்கும்.\n• **மிளகாய்:** மழை நின்ற பிறகு செப்பு பூஞ்சை மருந்து தெளிக்கவும்.\n• **நெல்:** நீர் மட்டம் 15 செ.மீ.க்கு மேல் சென்றால் வரத்தை மூடவும்.\n• **மஞ்சள்:** 3 நாட்கள் கழித்து கிழங்கு அழுகலை சரிபார்க்கவும்.\n\n**மழைக்குப் பிறகு:**\n• பூஞ்சை நோய்களைத் தடுக்க 1% போர்டோ கலவை தெளிக்கவும்.\n• வேர் வலிமைக்கு பொட்டாஷ் உரம் இடவும்.',
    keywords: ['rain', 'heavy', 'flood', 'water', 'drainage', 'மழை', 'கனமழை', 'வடிகால்'],
  },

  // General
  {
    id: 'q12', category: 'general',
    questionEn: 'How to use V-LINK to sell my crops?',
    questionTa: 'V-LINK-ல் என் பயிர்களை எப்படி விற்பது?',
    answerEn: '📱 **Selling Crops on V-LINK:**\n\n1. Go to **Market** tab from the sidebar.\n2. Click **"List Crop Produce"** button (green + icon).\n3. Fill in: Crop name, Category, Price/kg, Stock weight, Location.\n4. Click **"Publish Listing"** — your crop appears in the marketplace!\n5. Buyers (hotels, shops, customers) will see and order directly.\n6. Money goes to your **V-LINK Wallet** through smart escrow.\n\n✅ **Benefits:** No middleman commission, direct buyer contact, escrow-protected payments.\n\n💡 **Pro Tip:** Add high-quality photos and list in multiple categories to get more buyers.',
    answerTa: '📱 **V-LINK-ல் பயிர்களை விற்பது:**\n\n1. பக்கப்பட்டியிலிருந்து **சந்தை** தாவலுக்கு செல்லவும்.\n2. **"விளைச்சல் பதிவு செய்"** பொத்தானை (பச்சை + ஐகான்) கிளிக் செய்யவும்.\n3. நிரப்பவும்: பயிர் பெயர், வகை, விலை/கிலோ, கையிருப்பு, இடம்.\n4. **"பதிவிடு"** கிளிக் செய்யவும் — உங்கள் பயிர் சந்தையில் தோன்றும்!\n5. வாங்குபவர்கள் (ஹோட்டல்கள், கடைகள்) நேரடியாக ஆர்டர் செய்வார்கள்.\n6. பணம் **V-LINK வாலட்**-க்கு எஸ்க்ரோ வழியாக வரும்.\n\n✅ **நன்மைகள்:** தரகர் கமிஷன் இல்லை, நேரடி வாங்குபவர் தொடர்பு, எஸ்க்ரோ பாதுகாப்பான பணம்.',
    keywords: ['sell', 'crop', 'how', 'vlink', 'marketplace', 'விற்க', 'எப்படி', 'சந்தை'],
  },
  {
    id: 'q13', category: 'general',
    questionEn: 'How to rent equipment on V-LINK?',
    questionTa: 'V-LINK-ல் உபகரணங்களை எப்படி வாடகைக்கு எடுப்பது?',
    answerEn: '🚜 **Renting Equipment on V-LINK:**\n\n1. Go to **Rentals** tab in the sidebar.\n2. Browse available tractors, harvesters, tillers, pumps.\n3. Use filters by district, equipment type, or price range.\n4. Click **"View Details & Book"** on any equipment.\n5. Select your rental dates on the calendar.\n6. Click **"Lease Equipment Now"** — rental fee deducted from wallet.\n\n💡 Equipment includes operator (for large machinery like harvesters).\n\n**Tip:** Book 2-3 days in advance for peak season availability.',
    answerTa: '🚜 **V-LINK-ல் உபகரண வாடகை:**\n\n1. பக்கப்பட்டியில் **வாடகை** தாவலுக்கு செல்லவும்.\n2. கிடைக்கும் டிராக்டர்கள், அறுவடை இயந்திரங்கள், டில்லர்கள், பம்புகளை பாருங்கள்.\n3. மாவட்டம், உபகரண வகை, விலை வரம்பு மூலம் வடிகட்டவும்.\n4. **"விவரங்கள் & முன்பதிவு"** கிளிக் செய்யவும்.\n5. நாட்காட்டியில் வாடகை தேதிகளைத் தேர்ந்தெடுக்கவும்.\n6. **"இப்போதே வாடகைக்கு எடு"** — வாடகை கட்டணம் வாலட்-லிருந்து கழிக்கப்படும்.\n\n💡 பெரிய இயந்திரங்களுக்கு ஆபரேட்டர் உட்பட.\n\n**குறிப்பு:** அதிக தேவை காலத்தில் 2-3 நாட்கள் முன்பாக முன்பதிவு செய்யுங்கள்.',
    keywords: ['rent', 'equipment', 'tractor', 'how', 'வாடகை', 'உபகரணம்', 'டிராக்டர்'],
  },
  {
    id: 'q14', category: 'scheme',
    questionEn: 'What is the subsidy for solar pump?',
    questionTa: 'சோலார் பம்புக்கு மானியம் என்ன?',
    answerEn: '☀️ **Solar Pump Subsidy (PM-KUSUM):**\n\n**Scheme:** Pradhan Mantri Kisan Urja Suraksha evam Utthan Mahabhiyan\n\n**Subsidy Breakdown:**\n• Central Government: 30%\n• State Government: 30%\n• Farmer contribution: 40% (bank loan available)\n\n**Eligible pumps:** 2HP to 10HP solar pumps\n**For:** Irrigation in areas with no/unreliable grid power\n\n**How to Apply:**\n1. Register on **mnre.gov.in** (PM-KUSUM portal)\n2. Submit: Land documents, Aadhaar, Bank details\n3. District office verifies and approves\n4. Empanelled vendor installs the pump\n\n💡 A 5HP solar pump can irrigate 3-5 acres easily.',
    answerTa: '☀️ **சோலார் பம்ப் மானியம் (PM-KUSUM):**\n\n**திட்டம்:** பிரதான் மந்திரி கிசான் ஊர்ஜா சுரக்ஷா\n\n**மானிய விவரம்:**\n• மத்திய அரசு: 30%\n• மாநில அரசு: 30%\n• விவசாயி பங்கு: 40% (வங்கிக் கடன் கிடைக்கும்)\n\n**தகுதியான பம்புகள்:** 2HP முதல் 10HP சோலார் பம்புகள்\n**யாருக்கு:** மின்சாரம் இல்லாத/நம்பகமற்ற பகுதிகளில் பாசனத்திற்கு\n\n**விண்ணப்பிக்கும் முறை:**\n1. **mnre.gov.in** (PM-KUSUM போர்ட்டல்) இல் பதிவு செய்யவும்\n2. சமர்ப்பிக்க: நில ஆவணங்கள், ஆதார், வங்கி விவரங்கள்\n3. மாவட்ட அலுவலகம் சரிபார்த்து அனுமதிக்கும்\n4. அங்கீகரிக்கப்பட்ட விற்பனையாளர் பம்பை நிறுவுவார்\n\n💡 5HP சோலார் பம்ப் 3-5 ஏக்கர் எளிதாகப் பாசனம் செய்யும்.',
    keywords: ['solar', 'pump', 'subsidy', 'kusum', 'சோலார்', 'பம்ப்', 'மானியம்'],
  },
  {
    id: 'q15', category: 'practice',
    questionEn: 'When should I sow tomato seeds in Tamil Nadu?',
    questionTa: 'தமிழ்நாட்டில் தக்காளி விதை எப்போது விதைக்க வேண்டும்?',
    answerEn: '🍅 **Tomato Sowing Guide — Tamil Nadu:**\n\n**Best Seasons:**\n• **Main season:** June-July (Kharif) — harvest Sept-Oct\n• **Second season:** Sept-Oct (Rabi) — harvest Dec-Jan\n• **Summer crop:** Jan-Feb — harvest April-May\n\n**Steps:**\n1. Raise seedlings in pro-trays for 25-30 days.\n2. Transplant when seedlings have 4-5 true leaves.\n3. Spacing: 60cm × 45cm for hybrid varieties.\n4. Apply 25 tonnes FYM/acre before transplanting.\n5. First irrigation immediately after transplanting.\n\n**Recommended varieties for TN:** PKM-1, CO-3, Arka Rakshak, Arka Samrat',
    answerTa: '🍅 **தக்காளி விதைப்பு வழிகாட்டி — தமிழ்நாடு:**\n\n**சிறந்த பருவங்கள்:**\n• **முக்கிய பருவம்:** ஜூன்-ஜூலை (கரீப்) — அறுவடை செப்-அக்.\n• **இரண்டாம் பருவம்:** செப்-அக் (ராபி) — அறுவடை டிச-ஜன.\n• **கோடை பயிர்:** ஜன-பிப் — அறுவடை ஏப்-மே\n\n**படிகள்:**\n1. 25-30 நாட்கள் புரோ-ட்ரேயில் நாற்றுகள் வளர்க்கவும்.\n2. 4-5 உண்மையான இலைகள் வந்தவுடன் நடவு செய்யவும்.\n3. இடைவெளி: ஹைபிரிட் ரகங்களுக்கு 60செ.மீ. × 45செ.மீ.\n4. நடவுக்கு முன் ஏக்கருக்கு 25 டன் தொழு உரம் இடவும்.\n5. நடவு செய்த உடனேயே முதல் பாசனம்.\n\n**தமிழ்நாட்டிற்கு பரிந்துரைக்கப்படும் ரகங்கள்:** PKM-1, CO-3, அர்கா ரக்ஷக், அர்கா சம்ராட்',
    keywords: ['tomato', 'sow', 'seed', 'season', 'when', 'தக்காளி', 'விதை', 'எப்போது'],
  },
];

const DEFAULT_WELCOME_EN = "👋 Hello! I'm your **V-LINK AI Farming Assistant**. Ask me anything about:\n\n🐛 Crop diseases & treatment\n📊 Market prices & selling tips\n🏛️ Government schemes & subsidies\n🌱 Farming best practices\n🌦️ Weather & crop protection\n\nType your question below or tap a topic to get started!";
const DEFAULT_WELCOME_TA = "👋 வணக்கம்! நான் உங்கள் **V-LINK AI விவசாய உதவியாளர்**. கீழ்க்கண்டவை பற்றி என்னிடம் கேளுங்கள்:\n\n🐛 பயிர் நோய்கள் & சிகிச்சை\n📊 சந்தை விலைகள் & விற்பனை குறிப்புகள்\n🏛️ அரசு திட்டங்கள் & மானியங்கள்\n🌱 விவசாய சிறந்த நடைமுறைகள்\n🌦️ வானிலை & பயிர் பாதுகாப்பு\n\nகீழே உங்கள் கேள்வியை தட்டச்சு செய்யவும் அல்லது ஒரு தலைப்பைத் தட்டவும்!";

const FALLBACK_EN = "🤔 I don't have a specific answer for that yet, but here are some suggestions:\n\n1. Try rephrasing your question with specific crop or topic names.\n2. Check the **Crop Diagnosis** tab for disease-related scanning.\n3. Visit **Gov Schemes** tab for scheme details.\n4. Check **Market Prices** tab for current rates.\n\nOr contact our support team at the **Customer Care** tab for personalized help!";
const FALLBACK_TA = "🤔 இதற்கு எனக்கு குறிப்பிட்ட பதில் இல்லை, ஆனால் சில பரிந்துரைகள்:\n\n1. குறிப்பிட்ட பயிர் அல்லது தலைப்பு பெயர்களுடன் கேள்வியை மாற்றி கேளுங்கள்.\n2. நோய் தொடர்பான ஸ்கேன் செய்ய **பயிர் நோயறிதல்** பாருங்கள்.\n3. திட்ட விவரங்களுக்கு **அரசு திட்டங்கள்** பாருங்கள்.\n4. தற்போதைய விலைகளுக்கு **சந்தை விலைகள்** பாருங்கள்.\n\nஅல்லது தனிப்பயனாக்கப்பட்ட உதவிக்கு **வாடிக்கையாளர் சேவை** தொடர்பு கொள்ளுங்கள்!";

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
}

// ─── Main Component ─────────────────────────────────────────────────
export default function AIAssistantBoard() {
  const { t, language } = useApp();
  const isTamil = language === 'ta';
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: isTamil ? DEFAULT_WELCOME_TA : DEFAULT_WELCOME_EN,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Simple keyword matching search
  const findAnswer = (query: string): { answer: string; category: string } => {
    const q = query.toLowerCase();
    let bestMatch: QAPair | null = null;
    let bestScore = 0;

    for (const qa of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of qa.keywords) {
        if (q.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
      // Also check against the question text
      const qText = (isTamil ? qa.questionTa : qa.questionEn).toLowerCase();
      const words = q.split(/\s+/).filter(w => w.length > 2);
      for (const word of words) {
        if (qText.includes(word)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    if (bestMatch && bestScore >= 2) {
      return {
        answer: isTamil ? bestMatch.answerTa : bestMatch.answerEn,
        category: bestMatch.category,
      };
    }

    return { answer: isTamil ? FALLBACK_TA : FALLBACK_EN, category: 'general' };
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const { answer, category } = findAnswer(trimmed);
      const botMsg: ChatMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        category,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickQuestion = (qa: QAPair) => {
    const userMsg: ChatMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: isTamil ? qa.questionTa : qa.questionEn,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: isTamil ? qa.answerTa : qa.answerEn,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        category: qa.category,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  const topicChips = [
    { label: isTamil ? '🐛 பயிர் நோய்' : '🐛 Crop Disease', icon: Bug, category: 'disease' },
    { label: isTamil ? '📊 சந்தை விலை' : '📊 Market Prices', icon: TrendingUp, category: 'market' },
    { label: isTamil ? '🏛️ அரசு திட்டம்' : '🏛️ Gov Schemes', icon: BookOpen, category: 'scheme' },
    { label: isTamil ? '🌱 விவசாய குறிப்பு' : '🌱 Best Practices', icon: Sprout, category: 'practice' },
    { label: isTamil ? '🌦️ வானிலை' : '🌦️ Weather', icon: CloudSun, category: 'weather' },
  ];

  // Simple markdown bold renderer
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-primary-500" />
            {t('ai_assistant_title') || 'AI Farming Assistant'}
          </h1>
          <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
            {t('ai_assistant_desc') || 'Ask questions about crops, market, schemes & farming practices'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/15">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-[9px] font-mono font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {isTamil ? 'AI பொறி' : 'AI Engine'}
          </span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>

        {/* Topic Chips */}
        <div className="p-3 border-b border-earth-100/50 dark:border-earth-900/20 bg-earth-50/30 dark:bg-earth-950/10 flex gap-2 overflow-x-auto">
          {topicChips.map((chip) => {
            const relatedQAs = KNOWLEDGE_BASE.filter(qa => qa.category === chip.category);
            return (
              <button
                key={chip.category}
                onClick={() => {
                  if (relatedQAs.length > 0) {
                    handleQuickQuestion(relatedQAs[Math.floor(Math.random() * relatedQAs.length)]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-900/20 hover:border-primary-500/30 hover:bg-primary-500/5 cursor-pointer transition-all duration-200 shrink-0"
              >
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-earth-50/70 dark:bg-earth-950/30 border border-earth-100/50 dark:border-earth-900/20 text-foreground rounded-bl-md'
                }`}>
                  <div className={`text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'font-semibold' : 'font-medium'}`}>
                    {renderText(msg.text)}
                  </div>
                  <p className={`text-[9px] font-mono font-bold mt-2 ${
                    msg.role === 'user' ? 'text-white/60 text-right' : 'text-earth-400'
                  }`}>
                    {msg.timestamp}
                    {msg.category && msg.role === 'assistant' && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        {msg.category}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-earth-50/70 dark:bg-earth-950/30 border border-earth-100/50 dark:border-earth-900/20 rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Questions Suggestions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 border-t border-earth-100/30 dark:border-earth-900/10 pt-3">
            <p className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-wider mb-2">
              {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Popular Questions'}
            </p>
            <div className="flex flex-wrap gap-2">
              {KNOWLEDGE_BASE.slice(0, 5).map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleQuickQuestion(qa)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/15 text-primary-700 dark:text-primary-400 hover:bg-primary-500/10 cursor-pointer transition-all duration-200 text-left"
                >
                  {isTamil ? qa.questionTa : qa.questionEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-earth-100/50 dark:border-earth-900/20 bg-earth-50/30 dark:bg-earth-950/10">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isTamil ? 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' : 'Type your farming question here...'}
              className="flex-1 h-12 px-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-900/20 text-sm font-semibold text-foreground placeholder:text-earth-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:bg-earth-300 dark:disabled:bg-earth-800 text-white flex items-center justify-center cursor-pointer transition-all duration-200 border-0 shadow-md shadow-primary-500/20 disabled:shadow-none shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[9px] font-mono font-bold text-earth-400 mt-2 text-center">
            {isTamil ? '🌿 V-LINK AI — தமிழ் & ஆங்கிலத்தில் விவசாய உதவி' : '🌿 V-LINK AI — Farming assistance in Tamil & English'}
          </p>
        </div>
      </div>
    </div>
  );
}
