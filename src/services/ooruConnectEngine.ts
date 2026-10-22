// OoruConnect Core Engine: Tamil/Tanglish/English Understanding & Provider Matching
import {
  ParsedHelpRequest,
  RequestCategory,
  ServiceProvider,
  ProviderMatchResult,
  FollowUpQuestion,
  VillageInfo,
  LocationCoords
} from '@/types/ooruConnect';

// ── 1. KNOWN VILLAGES & PRECISE LOCAL CLUSTERS ──────────────────────────────
export const KNOWN_VILLAGES: Record<string, VillageInfo> = {
  melur: {
    name: 'Melur Village',
    nameTa: 'மேலூர் கிராமம்',
    district: 'Madurai',
    coords: { lat: 10.0333, lng: 78.3333 }
  },
  vadipatti: {
    name: 'Vadipatti',
    nameTa: 'வாடிப்பட்டி',
    district: 'Madurai',
    coords: { lat: 10.0500, lng: 77.9667 }
  },
  alanganallur: {
    name: 'Alanganallur',
    nameTa: 'அலங்காநல்லூர்',
    district: 'Madurai',
    coords: { lat: 10.0528, lng: 78.0833 }
  },
  usilampatti: {
    name: 'Usilampatti',
    nameTa: 'உசிலம்பட்டி',
    district: 'Madurai',
    coords: { lat: 9.9667, lng: 77.7833 }
  },
  thirumangalam: {
    name: 'Thirumangalam',
    nameTa: 'திருமங்கலம்',
    district: 'Madurai',
    coords: { lat: 9.8167, lng: 77.9833 }
  },
  kinathukadavu: {
    name: 'Kinathukadavu',
    nameTa: 'கிணத்துக்கடவு',
    district: 'Coimbatore',
    coords: { lat: 10.8200, lng: 77.0200 }
  },
  pollachi: {
    name: 'Pollachi Rural',
    nameTa: 'பொள்ளாச்சி கிராமப்புறம்',
    district: 'Coimbatore',
    coords: { lat: 10.6600, lng: 77.0100 }
  },
  sulur: {
    name: 'Sulur',
    nameTa: 'சூலூர்',
    district: 'Coimbatore',
    coords: { lat: 11.0280, lng: 77.1260 }
  },
  dharapuram: {
    name: 'Dharapuram',
    nameTa: 'தாராபுரம்',
    district: 'Tiruppur',
    coords: { lat: 10.7300, lng: 77.5200 }
  }
};

// ── 2. SEED REALISTIC SERVICE PROVIDER RECORDS (DEMO DATASET) ────────────────
export const SAMPLE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov_raman_squad',
    name: 'Raman Squad (ராமன் மேஸ்திரி)',
    service_category: 'labor',
    roleTa: 'அறுவடை மேஸ்திரி & 12 தொழிலாளர்கள் குழு',
    roleEn: 'Harvesting Labour Captain • 12 Workers Squad',
    skills: ['Harvesting', 'Paddy Cutting', 'Transplantation', 'Bag Loading', 'அறுவடை', 'நடவு'],
    village: 'Melur Village',
    district: 'Madurai',
    coords: { lat: 10.0400, lng: 78.3400 },
    capacity_number: 12,
    capacity_unit: 'workers',
    capacity_descriptionTa: '12 அனுபவமிக்க விவசாய தொழிலாளர்கள் குழு',
    capacity_descriptionEn: 'Experienced team of 12 agricultural workers',
    availability_status: 'confirmed',
    availability_date: 'today',
    availability_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'trusted',
    rating: 4.9,
    completed_jobs: 48,
    verified_price_rate: '₹550 / worker / day',
    phone: '+91 98421 11201',
    is_synthetic_demo: true,
    bioTa: '15 வருட அனுபவமுள்ள அறுவடை குழு மேஸ்திரி. நெல், கரும்பு அறுவடைக்கு சிறப்பு பெற்றவர்.',
    bioEn: '15+ years experienced harvesting lead. Specializes in paddy cutting and post-harvest bagging.'
  },
  {
    id: 'prov_murugan_labor',
    name: 'Murugan Labour Force (முருகன் படை)',
    service_category: 'labor',
    roleTa: 'விவசாய ஆட்கள் குழு தலைவர் (16 பேர்)',
    roleEn: 'Agricultural Squad Lead • 16 Workers',
    skills: ['Harvesting', 'Weeding', 'Transplantation', 'De-weeding', 'களை எடுத்தல்', 'நடவு'],
    village: 'Vadipatti',
    district: 'Madurai',
    coords: { lat: 10.0520, lng: 77.9690 },
    capacity_number: 16,
    capacity_unit: 'workers',
    capacity_descriptionTa: '16 நபர்கள் கொண்ட விரைவு அறுவடை மற்றும் களை எடுக்கும் குழு',
    capacity_descriptionEn: 'Fast-moving team of 16 for weeding and harvesting',
    availability_status: 'confirmed',
    availability_date: 'tomorrow',
    availability_updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'fpo_certified',
    rating: 4.8,
    completed_jobs: 35,
    verified_price_rate: '₹500 / worker / day',
    phone: '+91 98421 11202',
    is_synthetic_demo: true,
    bioTa: 'வாடிப்பட்டி FPO சான்றளிக்கப்பட்ட தொழிலாளர் படை. குறித்த நேரத்தில் வேலை முடிப்பவர்.',
    bioEn: 'Vadipatti FPO certified labor squad. Punctual and highly reliable.'
  },
  {
    id: 'prov_kannan_equipment',
    name: 'Kannan Equipment (கண்ணன் டிராக்டர்ஸ்)',
    service_category: 'equipment',
    roleTa: '55HP டிராக்டர் & ரோட்டவேட்டர் உரிமையாளர்',
    roleEn: '55HP Tractor Provider • Rotavator Specialist',
    skills: ['Rotavator', 'Ploughing', 'Tractor', 'Cultivator', 'உழவு', 'ரோட்டவேட்டர்'],
    village: 'Vadipatti',
    district: 'Madurai',
    coords: { lat: 10.0480, lng: 77.9620 },
    capacity_number: 10,
    capacity_unit: 'acres/day',
    capacity_descriptionTa: '55HP மஹிந்திரா டிராக்டர் + 7 அடி ரோட்டவேட்டர்',
    capacity_descriptionEn: '55HP Mahindra Tractor with 7ft Rotavator Attachment',
    availability_status: 'confirmed',
    availability_date: 'today',
    availability_updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'trusted',
    rating: 4.9,
    completed_jobs: 62,
    verified_price_rate: '₹1,200 / acre (diesel included)',
    phone: '+91 98421 11203',
    is_synthetic_demo: true,
    bioTa: 'ஈர நிலம் மற்றும் உலர் நில உழவு பணிகளுக்கு ரோட்டவேட்டர் வாடகை.',
    bioEn: 'Heavy duty rotavator suitable for both wetland paddy preparation and dry field tilling.'
  },
  {
    id: 'prov_velu_machinery',
    name: 'Velu Agri Machinery (வேலு மெஷினரி)',
    service_category: 'equipment',
    roleTa: 'டிராக்டர் & தானியங்கி அறுவடை இயந்திரம்',
    roleEn: '45HP Tractor & Mini Combine Harvester',
    skills: ['Tractor', 'Harvester Machine', 'Ploughing', 'இயந்திர அறுவடை'],
    village: 'Melur Village',
    district: 'Madurai',
    coords: { lat: 10.0380, lng: 78.3310 },
    capacity_number: 8,
    capacity_unit: 'acres/day',
    capacity_descriptionTa: '45HP சோனாலிகா டிராக்டர் & மினி அறுவடை எந்திரம்',
    capacity_descriptionEn: '45HP Sonalika Tractor and mini combined harvester',
    availability_status: 'unconfirmed',
    availability_date: 'tomorrow',
    availability_updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'community_vouched',
    rating: 4.6,
    completed_jobs: 28,
    verified_price_rate: '₹1,150 / acre',
    phone: '+91 98421 11204',
    is_synthetic_demo: true,
    bioTa: 'மேலூர் பகுதியில் உழவு மற்றும் அறுவடை இயந்திர சேவை.',
    bioEn: 'Providing dependable farm machinery support throughout Melur taluk.'
  },
  {
    id: 'prov_senthil_kumar',
    name: 'Senthil Kumar (செந்தில் குமார்)',
    service_category: 'technician',
    roleTa: 'சான்றளிக்கப்பட்ட சொட்டு நீர் பாசன தொழில்நுட்ப வல்லுநர்',
    roleEn: 'Certified Irrigation Technician • Drip & Sprinkler Expert',
    skills: ['Drip Irrigation', 'Sprinkler', 'Filter Flush', 'Venturi Repair', 'சொட்டு நீர்', 'பழுதுநீக்கம்'],
    village: 'Melur Village',
    district: 'Madurai',
    coords: { lat: 10.0360, lng: 78.3350 },
    capacity_number: 4,
    capacity_unit: 'farms/day',
    capacity_descriptionTa: 'சொட்டு நீர் பைப்புகள், வெஞ்சுரி மற்றும் வால்வ் பழுதுபார்க்கும் உபகரணங்கள்',
    capacity_descriptionEn: 'Full drip diagnostic toolkit, pressure gauges, pipe joiners & spares',
    availability_status: 'confirmed',
    availability_date: 'today',
    availability_updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'trusted',
    rating: 5.0,
    completed_jobs: 54,
    verified_price_rate: '₹400 / service visit + parts',
    phone: '+91 98421 11205',
    is_synthetic_demo: true,
    bioTa: 'TNAU சான்றிதழ் பெற்ற நுண்ணீர்ப் பாசன நிபுணர். கசிவு அடைப்பு மற்றும் மோட்டார் பிரஷர் சரிசெய்தல்.',
    bioEn: 'TNAU certified micro-irrigation specialist. Fixes clogging, line pressure drop, and solenoid valves.'
  },
  {
    id: 'prov_marimuthu_electric',
    name: 'Marimuthu Electricals (மாரிமுத்து மெக்கானிக்)',
    service_category: 'technician',
    roleTa: 'மோட்டார் & சப்மர்சிபிள் பம்ப் எலக்ட்ரீஷியன்',
    roleEn: 'Submersible Motor & Starter Box Technician',
    skills: ['Motor Repair', 'Pump Repair', 'Starter Box', 'Rewinding', 'மோட்டார்', 'எலக்ட்ரிக்கல்'],
    village: 'Alanganallur',
    district: 'Madurai',
    coords: { lat: 10.0540, lng: 78.0860 },
    capacity_number: 3,
    capacity_unit: 'motors/day',
    capacity_descriptionTa: 'போர்வெல் மற்றும் கிணற்று மோட்டார் பழுது நீக்கும் நடமாடும் வாகனம்',
    capacity_descriptionEn: 'Mobile service kit for borewell motor, capacitor & single phase issues',
    availability_status: 'confirmed',
    availability_date: 'today',
    availability_updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'trusted',
    rating: 4.8,
    completed_jobs: 41,
    verified_price_rate: '₹350 / visit',
    phone: '+91 98421 11206',
    is_synthetic_demo: true,
    bioTa: 'கிணற்று மோட்டார் ஓடவில்லை, ஸ்டார்ட்டர் பிரச்சனை போன்றவற்றை உடனே சரிசெய்வார்.',
    bioEn: 'Quick on-field response for pump tripping, starter burnout, and phase imbalances.'
  },
  {
    id: 'prov_raja_transport',
    name: 'Raja Pickup (ராஜா மினி லாரி)',
    service_category: 'transport',
    roleTa: '1.5 டன் விவசாய சரக்கு வாகனம்',
    roleEn: '1.5 Ton Agri Mini-Truck • Mandi Freight',
    skills: ['Transport', 'Mandi Delivery', 'Crates', 'சரக்கு', 'வண்டி'],
    village: 'Vadipatti',
    district: 'Madurai',
    coords: { lat: 10.0510, lng: 77.9640 },
    capacity_number: 1500,
    capacity_unit: 'kg',
    capacity_descriptionTa: '1.5 டன் வரை காய்கறிகள், நெல் மூட்டைகள் சந்தைக்கு கொண்டு செல்லலாம்',
    capacity_descriptionEn: 'Clean cargo bed for up to 1.5 tons of vegetables or bagged paddy',
    availability_status: 'confirmed',
    availability_date: 'today',
    availability_updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    is_verified: true,
    verification_badge: 'community_vouched',
    rating: 4.7,
    completed_jobs: 39,
    verified_price_rate: '₹25 / km or ₹800 / local trip',
    phone: '+91 98421 11207',
    is_synthetic_demo: true,
    bioTa: 'பண்ணையிலிருந்து நேரடியாக மதுரை உழவர் சந்தை அல்லது வாடிப்பட்டி மார்க்கெட் கொண்டு செல்லலாம்.',
    bioEn: 'Direct farm-to-mandi transportation with careful handling of fragile produce.'
  }
];

// Helper to calculate local dates
export function getLocalDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── 3. DISTANCE CALCULATION (HAVERSINE FORMULA) ─────────────────────────────
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

export function resolveVillageCoords(villageName: string | null): LocationCoords {
  if (!villageName) {
    return KNOWN_VILLAGES.melur.coords;
  }
  const clean = villageName.toLowerCase().trim();
  for (const [key, info] of Object.entries(KNOWN_VILLAGES)) {
    if (clean.includes(key) || clean.includes(info.name.toLowerCase()) || clean.includes(info.nameTa)) {
      return info.coords;
    }
  }
  return KNOWN_VILLAGES.melur.coords;
}

// ── 4. TAMIL / TANGLISH / ENGLISH LINGUISTIC PARSER (RULE-BASED FALLBACK) ───
export function extractWithLinguisticEngine(
  rawText: string,
  userLocation?: { lat: number; lng: number; village?: string }
): ParsedHelpRequest {
  const text = rawText.toLowerCase().trim();

  // 1. Determine Request Category & Work Type
  let service_category: RequestCategory = 'general';
  let work_type: string | null = null;
  let unit: string | null = null;
  let quantity: number | null = null;

  // Labor keywords
  const isLabor =
    text.includes('harvest') ||
    text.includes('அறுவடை') ||
    text.includes('worker') ||
    text.includes('ஆட்கள்') ||
    text.includes('peru') ||
    text.includes('பேர்') ||
    text.includes('வேலையாள்') ||
    text.includes('வேலையாட்கள்') ||
    text.includes('weeding') ||
    text.includes('களை') ||
    text.includes('நடவு') ||
    text.includes('transplant') ||
    text.includes('loading') ||
    text.includes('மூட்டை');

  // Equipment keywords
  const isEquipment =
    text.includes('tractor') ||
    text.includes('டிராக்டர்') ||
    text.includes('rotavator') ||
    text.includes('ரோட்டவேட்டர்') ||
    text.includes('plough') ||
    text.includes('உழவு') ||
    text.includes('cultivator') ||
    text.includes('jcb') ||
    text.includes('harvester machine') ||
    text.includes('இயந்திரம்') ||
    text.includes('sprayer') ||
    text.includes('மருந்து தெளிப்பான்');

  // Technician keywords
  const isTechnician =
    text.includes('drip') ||
    text.includes('சொட்டு நீர்') ||
    text.includes('irrigation') ||
    text.includes('பாசனம்') ||
    text.includes('motor') ||
    text.includes('மோட்டார்') ||
    text.includes('pump') ||
    text.includes('பம்ப்') ||
    text.includes('mechanic') ||
    text.includes('மெக்கானிக்') ||
    text.includes('starter') ||
    text.includes('repair') ||
    text.includes('பழுது') ||
    text.includes('சரி செய்ய') ||
    text.includes('start aagala') ||
    text.includes('wiring') ||
    text.includes('electrician') ||
    text.includes('எலக்ட்ரீஷியன்');

  // Transport keywords
  const isTransport =
    text.includes('transport') ||
    text.includes('சரக்கு') ||
    text.includes('pickup') ||
    text.includes('lorry') ||
    text.includes('வண்டி') ||
    text.includes('mini truck') ||
    text.includes('auto') ||
    text.includes('ஏற்றுமதி');

  if (isLabor) {
    service_category = 'labor';
    unit = 'workers';
    if (text.includes('harvest') || text.includes('அறுவடை')) work_type = 'Harvesting (அறுவடை)';
    else if (text.includes('weed') || text.includes('களை')) work_type = 'Weeding (களை எடுத்தல்)';
    else if (text.includes('transplant') || text.includes('நடவு')) work_type = 'Transplantation (நடவு பணி)';
    else if (text.includes('load') || text.includes('மூட்டை')) work_type = 'Bag Loading (மூட்டை ஏற்றுதல்)';
    else work_type = null; // Specific work missing
  } else if (isEquipment) {
    service_category = 'equipment';
    unit = text.includes('acre') || text.includes('ஏக்கர்') ? 'acres' : 'hours';
    if (text.includes('rotavator') || text.includes('ரோட்டவேட்டர்')) work_type = 'Rotavator Ploughing (ரோட்டவேட்டர்)';
    else if (text.includes('jcb')) work_type = 'JCB Earthmover (JCB இயந்திரம்)';
    else if (text.includes('harvester')) work_type = 'Combine Harvester (இயந்திர அறுவடை)';
    else if (text.includes('plough') || text.includes('உழவு')) work_type = 'Ploughing (உழவு பணி)';
    else work_type = null; // Specific attachment missing
  } else if (isTechnician) {
    service_category = 'technician';
    unit = 'visit';
    if (text.includes('drip') || text.includes('சொட்டு நீர்') || text.includes('irrigation') || text.includes('பாசனம்')) {
      work_type = 'Drip Irrigation Repair (சொட்டு நீர் பாசன பழுது)';
    } else if (text.includes('motor') || text.includes('மோட்டார்') || text.includes('pump') || text.includes('பம்ப்')) {
      work_type = 'Motor & Pump Mechanic (மோட்டார் & பம்ப் மெக்கானிக்)';
    } else if (text.includes('wire') || text.includes('electrician') || text.includes('எலக்ட்ரீஷியன்')) {
      work_type = 'Electrician & Wiring (எலக்ட்ரிக்கல் ஒயரிங்)';
    } else {
      work_type = 'General Repair (தொழில்நுட்ப பழுது)';
    }
  } else if (isTransport) {
    service_category = 'transport';
    unit = 'trip';
    work_type = 'Agri Freight Transport (விவசாய சரக்கு போக்குவரத்து)';
  }

  // 2. Extract Quantity
  const qtyMatch = text.match(/(\d+)\s*(peru|பேர்|workers?|ஆட்கள்|acres?|ஏக்கர்|hours?|மணி|டன்|tons?)?/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
    if (qtyMatch[2]) {
      const u = qtyMatch[2].toLowerCase();
      if (u.includes('peru') || u.includes('பேர்') || u.includes('worker') || u.includes('ஆட்கள்')) unit = 'workers';
      if (u.includes('acre') || u.includes('ஏக்கர்')) unit = 'acres';
      if (u.includes('hour') || u.includes('மணி')) unit = 'hours';
      if (u.includes('ton') || u.includes('டன்')) unit = 'tons';
    }
  }

  // 3. Extract Required Date
  let required_date: string | null = null;
  if (
    text.includes('naalaikku') ||
    text.includes('நாளை') ||
    text.includes('tomorrow') ||
    text.includes('நாளைக்கு')
  ) {
    required_date = getLocalDateString(1);
  } else if (
    text.includes('innikku') ||
    text.includes('இன்று') ||
    text.includes('today') ||
    text.includes('இன்னிக்கு')
  ) {
    required_date = getLocalDateString(0);
  } else {
    // Check for explicit YYYY-MM-DD
    const dateMatch = text.match(/\b(202\d-\d{2}-\d{2})\b/);
    if (dateMatch) {
      required_date = dateMatch[1];
    }
  }

  // 4. Extract Village / Location
  let village: string | null = userLocation?.village || null;
  let location: LocationCoords | null = userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null;

  for (const [key, vInfo] of Object.entries(KNOWN_VILLAGES)) {
    if (
      text.includes(key) ||
      text.includes(vInfo.name.toLowerCase()) ||
      text.includes(vInfo.nameTa.toLowerCase()) ||
      text.includes(vInfo.nameTa.replace(' கிராமம்', ''))
    ) {
      village = vInfo.name;
      location = vInfo.coords;
      break;
    }
  }

  // 5. Extract Radius if mentioned
  let radius_km = 20;
  const radiusMatch = text.match(/(\d+)\s*(km|கி\.மீ|radius)/i);
  if (radiusMatch) {
    radius_km = parseInt(radiusMatch[1], 10);
  }

  // 6. Detect Missing Essential Fields (Strictly based on requirements)
  const missing_fields: ('work_type' | 'village' | 'required_date')[] = [];
  if (!work_type) {
    missing_fields.push('work_type');
  }
  if (!village) {
    missing_fields.push('village');
  }
  if (!required_date) {
    missing_fields.push('required_date');
  }

  return {
    service_category,
    request_type: service_category,
    work_type,
    quantity,
    unit: unit || (service_category === 'labor' ? 'workers' : service_category === 'equipment' ? 'acres' : 'visit'),
    required_date,
    village,
    location,
    radius_km,
    additional_requirements: text.length > 50 ? text : null,
    missing_fields,
    confidence: null, // As requested in Section 5: do not present arbitrary self-reported percentage
    raw_input: rawText,
    extraction_source: 'rule_based_fallback',
    is_llm_configured: false
  };
}

// ── 5. SERVER-SIDE LLM EXTRACTION WITH STRICT SCHEMA VALIDATION ─────────────
export async function extractHelpRequest(
  rawText: string,
  userLocation?: { lat: number; lng: number; village?: string }
): Promise<ParsedHelpRequest> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // If no LLM key configured on server, return rule-based fallback with is_llm_configured: false
  if (!geminiKey && !openaiKey) {
    return {
      ...extractWithLinguisticEngine(rawText, userLocation),
      is_llm_configured: false
    };
  }

  const currentDate = getLocalDateString(0);
  const tomorrowDate = getLocalDateString(1);

  const prompt = `You are a strict NLP parser for UZHAVAN360 OoruConnect (Tamil Nadu agricultural platform).
Parse the user's agricultural help request in Tamil, Tanglish, or English.

CRITICAL INSTRUCTIONS:
- DO NOT invent, hallucinate, or guess a village, date, provider, price, or availability!
- If the user did not explicitly mention a village, set "village": null.
- If the user said "naalaikku" or "நாளைக்கு" (tomorrow), set "required_date": "${tomorrowDate}".
- If the user said "innikku" or "இன்று" (today), set "required_date": "${currentDate}".
- If the user did not specify any date or relative day, set "required_date": null.
- If the user said "5 workers venum" without specifying the work (harvesting, weeding, etc.), set "work_type": null.
- Set "service_category" to one of: "labor", "equipment", "technician", "transport", "general".
- "missing_fields" must be an array containing any of ["work_type", "village", "required_date"] that are null.
- If a date is provided, "required_date" MUST NOT be in "missing_fields".

User Input: "${rawText}"

Return ONLY a valid JSON object without markdown fences matching:
{
  "service_category": "labor" | "equipment" | "technician" | "transport" | "general",
  "work_type": string or null,
  "quantity": number or null,
  "unit": string or null,
  "required_date": "YYYY-MM-DD" or null,
  "village": string or null,
  "radius_km": number,
  "additional_requirements": string or null,
  "missing_fields": string[]
}`;

  try {
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(6000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          const parsed = JSON.parse(contentText.trim());

          const missing: ('work_type' | 'village' | 'required_date')[] = [];
          if (!parsed.work_type) missing.push('work_type');
          if (!parsed.village && !userLocation?.village) missing.push('village');
          if (!parsed.required_date) missing.push('required_date');

          const finalVillage = parsed.village || userLocation?.village || null;
          const coords = resolveVillageCoords(finalVillage);

          return {
            service_category: parsed.service_category || 'general',
            request_type: parsed.service_category || 'general',
            work_type: parsed.work_type || null,
            quantity: typeof parsed.quantity === 'number' ? parsed.quantity : null,
            unit: parsed.unit || null,
            required_date: parsed.required_date || null,
            village: finalVillage,
            location: finalVillage ? coords : userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null,
            radius_km: typeof parsed.radius_km === 'number' ? parsed.radius_km : 20,
            additional_requirements: parsed.additional_requirements || null,
            missing_fields: missing,
            confidence: null,
            raw_input: rawText,
            extraction_source: 'gemini',
            is_llm_configured: true
          };
        }
      }
    }
  } catch (err) {
    console.warn('[OoruConnectEngine] LLM extraction error. Falling back to linguistic engine:', err);
  }

  // Fallback to linguistic engine
  return {
    ...extractWithLinguisticEngine(rawText, userLocation),
    is_llm_configured: Boolean(geminiKey || openaiKey)
  };
}

// ── 6. DYNAMIC FOLLOW-UP QUESTIONS (FEATURE B) ───────────────────────────────
export function generateFollowUpQuestions(
  missingFields: ('work_type' | 'village' | 'required_date')[],
  currentRequest: ParsedHelpRequest
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const cat = currentRequest.service_category || currentRequest.request_type;

  for (const field of missingFields) {
    if (field === 'work_type') {
      if (cat === 'labor') {
        questions.push({
          field: 'work_type',
          questionTa: 'எந்த வேலைக்கு ஆட்கள் வேண்டும்?',
          questionEn: 'What work do you need workers for?',
          helperTextTa: 'வேலையை தேர்வு செய்தால் சிறந்த தொழிலாளர் படை இணைக்கப்படும்.',
          helperTextEn: 'Choosing the exact work ensures matching the right labor squad.',
          suggestions: [
            { labelTa: '🌾 நெல் அறுவடை (Harvesting)', labelEn: '🌾 Paddy Harvesting', value: 'Harvesting (அறுவடை)' },
            { labelTa: '🌱 களை எடுத்தல் (Weeding)', labelEn: '🌱 Weeding', value: 'Weeding (களை எடுத்தல்)' },
            { labelTa: '🚜 நடவு பணி (Transplantation)', labelEn: '🚜 Transplantation', value: 'Transplantation (நடவு பணி)' },
            { labelTa: '📦 மூட்டை ஏற்றுதல் (Loading)', labelEn: '📦 Bag Loading', value: 'Bag Loading (மூட்டை ஏற்றுதல்)' }
          ]
        });
      } else if (cat === 'equipment') {
        questions.push({
          field: 'work_type',
          questionTa: 'டிராக்டருக்கு எந்த வகையான உழவு கருவி வேண்டும்?',
          questionEn: 'Which equipment attachment is required?',
          helperTextTa: 'கருவியின் வகையை குறிப்பிட்டால் சரியான உரிமையாளர் கிடைப்பார்.',
          helperTextEn: 'Specifying the attachment connects you to the right machinery owner.',
          suggestions: [
            { labelTa: '🚜 ரோட்டவேட்டர் (Rotavator)', labelEn: '🚜 Rotavator (Wet/Dry)', value: 'Rotavator Ploughing (ரோட்டவேட்டர்)' },
            { labelTa: '⚙️ 5 கொழு கலப்பை (Plough)', labelEn: '⚙️ 5-Tyne Plough', value: 'Ploughing (உழவு பணி)' },
            { labelTa: '🌾 அறுவடை இயந்திரம் (Harvester)', labelEn: '🌾 Combine Harvester', value: 'Combine Harvester (இயந்திர அறுவடை)' }
          ]
        });
      } else if (cat === 'technician') {
        questions.push({
          field: 'work_type',
          questionTa: 'எந்த வகையான தொழில்நுட்ப பழுது?',
          questionEn: 'What kind of technical repair is needed?',
          helperTextTa: 'பழுது விவரத்தை குறிப்பிட்டால் பொருத்தமான மெக்கானிக் வருவார்.',
          helperTextEn: 'Clarifying the issue ensures the technician arrives with right tools.',
          suggestions: [
            { labelTa: '💧 சொட்டு நீர் குழாய் அடைப்பு (Drip Repair)', labelEn: '💧 Drip Irrigation Issue', value: 'Drip Irrigation Repair (சொட்டு நீர் பாசன பழுது)' },
            { labelTa: '⚡ மோட்டார் ஸ்டார்ட்டர் பழுது (Motor/Starter)', labelEn: '⚡ Pump/Motor Repair', value: 'Motor & Pump Mechanic (மோட்டார் & பம்ப் மெக்கானிக்)' },
            { labelTa: '🔌 மின்சார ஒயரிங் (Electrical Wiring)', labelEn: '🔌 Farm Wiring/Phase', value: 'Electrician & Wiring (எலக்ட்ரிக்கல் ஒயரிங்)' }
          ]
        });
      } else {
        questions.push({
          field: 'work_type',
          questionTa: 'உங்களுக்கு என்ன வகையான சேவை தேவை?',
          questionEn: 'What service category do you need?',
          helperTextTa: 'உங்கள் விவசாய தேவையை தேர்ந்தெடுக்கவும்.',
          helperTextEn: 'Select the primary service needed.',
          suggestions: [
            { labelTa: '👷 விவசாய ஆட்கள் (Labour Squad)', labelEn: '👷 Harvesting/Labour', value: 'Harvesting (அறுவடை)' },
            { labelTa: '🚜 டிராக்டர் வாடகை (Tractor Rental)', labelEn: '🚜 Tractor Ploughing', value: 'Rotavator Ploughing (ரோட்டவேட்டர்)' },
            { labelTa: '🔧 மெக்கானிக் & பழுது (Technician)', labelEn: '🔧 Motor/Drip Mechanic', value: 'Drip Irrigation Repair (சொட்டு நீர் பாசன பழுது)' }
          ]
        });
      }
    } else if (field === 'village') {
      questions.push({
        field: 'village',
        questionTa: 'எந்த ஊரில் உதவி வேண்டும்?',
        questionEn: 'Which village do you need help in?',
        helperTextTa: 'உங்கள் ஊரை குறிப்பிட்டால் அருகிலுள்ள நபர்களை காண்பிப்போம்.',
        helperTextEn: 'Providing your village finds nearby providers with lowest distance.',
        suggestions: [
          { labelTa: '📍 மேலூர் (Melur)', labelEn: '📍 Melur Village', value: 'Melur Village' },
          { labelTa: '📍 வாடிப்பட்டி (Vadipatti)', labelEn: '📍 Vadipatti', value: 'Vadipatti' },
          { labelTa: '📍 அலங்காநல்லூர் (Alanganallur)', labelEn: '📍 Alanganallur', value: 'Alanganallur' },
          { labelTa: '📍 உசிலம்பட்டி (Usilampatti)', labelEn: '📍 Usilampatti', value: 'Usilampatti' },
          { labelTa: '📍 கிணத்துக்கடவு (Kinathukadavu)', labelEn: '📍 Kinathukadavu', value: 'Kinathukadavu' }
        ]
      });
    } else if (field === 'required_date') {
      const todayStr = getLocalDateString(0);
      const tomorrowStr = getLocalDateString(1);
      const in3DaysStr = getLocalDateString(3);

      questions.push({
        field: 'required_date',
        questionTa: 'எந்த தேதியில் உதவி வேண்டும்?',
        questionEn: 'For which date do you need help?',
        helperTextTa: 'தேதியை குறிப்பிட்டால் அந்த நாளில் தயாராக உள்ளவர்கள் மட்டுமே வருவார்கள்.',
        helperTextEn: 'Allows checking verified provider availability for that date.',
        suggestions: [
          { labelTa: '⚡ இன்று உடனே (Today)', labelEn: '⚡ Today (Immediate)', value: todayStr },
          { labelTa: '📅 நாளை (Tomorrow)', labelEn: '📅 Tomorrow', value: tomorrowStr },
          { labelTa: '🗓️ 3 நாட்களில் (In 3 Days)', labelEn: '🗓️ In 3 Days', value: in3DaysStr }
        ]
      });
    }
  }

  return questions;
}

// ── 7. SMART PROVIDER MATCHING & WEIGHTED RANKING (FEATURE C) ───────────────
export interface MatchingOptions {
  maxDistanceKm?: number;
  availableOnly?: boolean;
  providers?: ServiceProvider[];
}

export function matchAndRankProviders(
  request: ParsedHelpRequest,
  options: MatchingOptions = {}
): ProviderMatchResult[] {
  const providerPool = options.providers || SAMPLE_PROVIDERS;
  const maxDistance = options.maxDistanceKm || request.radius_km || 30;
  const reqCategory = request.service_category || request.request_type;

  // 1. Hard category filter
  const categoryFiltered = providerPool.filter((p) => {
    if (reqCategory && reqCategory !== 'general') {
      if (p.service_category !== reqCategory) {
        return false;
      }
    }
    return true;
  });

  const reqCoords = request.location || (request.village ? resolveVillageCoords(request.village) : null);
  const results: ProviderMatchResult[] = [];

  for (const provider of categoryFiltered) {
    // 2. Distance Calculation
    let distanceKm = 0;
    if (reqCoords) {
      distanceKm = calculateHaversineDistance(
        reqCoords.lat,
        reqCoords.lng,
        provider.coords.lat,
        provider.coords.lng
      );
      if (distanceKm > maxDistance) {
        continue;
      }
    } else {
      // Village unknown: assume cluster average 5 km for initial ranking
      distanceKm = 5.0;
    }

    // 3. Weighted Scoring (40/25/20/10/5)
    // A. Skill Match (Max 40)
    let skill_match = 20;
    const reasonsTa: string[] = [];
    const reasonsEn: string[] = [];

    const reqWork = (request.work_type || '').toLowerCase();
    const matchesExactSkill = provider.skills.some((s) => {
      const skillLower = s.toLowerCase();
      return (
        (reqWork.includes('harvest') && skillLower.includes('harvest')) ||
        (reqWork.includes('அறுவடை') && (skillLower.includes('அறுவடை') || skillLower.includes('harvest'))) ||
        (reqWork.includes('rotavator') && skillLower.includes('rotavator')) ||
        (reqWork.includes('ரோட்டவேட்டர்') && (skillLower.includes('ரோட்டவேட்டர்') || skillLower.includes('rotavator'))) ||
        (reqWork.includes('drip') && skillLower.includes('drip')) ||
        (reqWork.includes('சொட்டு நீர்') && (skillLower.includes('சொட்டு நீர்') || skillLower.includes('drip'))) ||
        (reqWork.includes('motor') && skillLower.includes('motor')) ||
        (reqWork.includes('மோட்டார்') && (skillLower.includes('மோட்டார்') || skillLower.includes('motor'))) ||
        (reqWork.includes('weed') && skillLower.includes('weed')) ||
        (reqWork.includes('களை') && (skillLower.includes('களை') || skillLower.includes('weed'))) ||
        (reqWork.includes('plough') && skillLower.includes('plough')) ||
        (reqWork.includes('உழவு') && (skillLower.includes('உழவு') || skillLower.includes('plough'))) ||
        (reqWork.includes('transport') && skillLower.includes('transport')) ||
        (reqWork.includes('சரக்கு') && (skillLower.includes('சரக்கு') || skillLower.includes('transport')))
      );
    });

    if (matchesExactSkill) {
      skill_match = 40;
      reasonsTa.push('தேவையான பணிக்கு 100% நேரடி திறன் பொருத்தம்');
      reasonsEn.push('Direct skill match for required work');
    } else {
      skill_match = 25;
      reasonsTa.push('பொருத்தமான சேவை வகை');
      reasonsEn.push('Matches service category');
    }

    // B. Distance Score (Max 25)
    let distance_score = 0;
    if (!request.village) {
      distance_score = 15; // Neutral distance score when village is unspecified
      reasonsTa.push('ஊர் குறிப்பிடப்படவில்லை - தோராய தூரம்');
      reasonsEn.push('Village unspecified - estimated radius');
    } else if (distanceKm <= 3.0) {
      distance_score = 25;
      reasonsTa.push(`மிக அருகில்: ${distanceKm} கி.மீ`);
      reasonsEn.push(`Very close: ${distanceKm} km away`);
    } else if (distanceKm <= 8.0) {
      distance_score = 20;
      reasonsTa.push(`அருகில்: ${distanceKm} கி.மீ`);
      reasonsEn.push(`Nearby: ${distanceKm} km away`);
    } else if (distanceKm <= 15.0) {
      distance_score = 14;
      reasonsTa.push(`பயண தூரம்: ${distanceKm} கி.மீ`);
      reasonsEn.push(`Moderate distance: ${distanceKm} km away`);
    } else {
      distance_score = 7;
      reasonsTa.push(`நீண்ட தூரம்: ${distanceKm} கி.மீ`);
      reasonsEn.push(`Longer distance: ${distanceKm} km away`);
    }

    // C. Confirmed Availability (Max 20)
    let availability_score = 0;
    const isTomorrowReq = request.required_date === getLocalDateString(1);
    const isTodayReq = request.required_date === getLocalDateString(0);

    if (provider.availability_status === 'confirmed') {
      if (
        (isTomorrowReq && provider.availability_date === 'tomorrow') ||
        (isTodayReq && provider.availability_date === 'today') ||
        (!request.required_date)
      ) {
        availability_score = 20;
        reasonsTa.push('குறிப்பிட்ட தேதியில் உறுதிப்படுத்தப்பட்ட இருப்பு');
        reasonsEn.push('Confirmed available on requested date');
      } else {
        availability_score = 15;
        reasonsTa.push('செயலில் உள்ள இருப்பு (தேதி உறுதி தேவை)');
        reasonsEn.push('Active provider (date confirmation advised)');
      }
    } else if (provider.availability_status === 'unconfirmed') {
      availability_score = 10;
      reasonsTa.push('அழைத்து உறுதி செய்யப்பட வேண்டும்');
      reasonsEn.push('Availability pending phone confirmation');
    } else {
      availability_score = 0;
      reasonsTa.push('தற்போது முன்பதிவு செய்யப்பட்டுள்ளது');
      reasonsEn.push('Currently unavailable');
    }

    // D. Capacity Match (Max 10)
    let capacity_score = 8;
    if (request.quantity && request.quantity > 0) {
      if (provider.capacity_number >= request.quantity) {
        capacity_score = 10;
        reasonsTa.push(`முழு கொள்ளளவு பொருத்தம் (${provider.capacity_number} ${provider.capacity_unit})`);
        reasonsEn.push(`Full capacity match (${provider.capacity_number} ${provider.capacity_unit})`);
      } else {
        capacity_score = 5;
        reasonsTa.push(`பகுதி கொள்ளளவு மட்டுமே (${provider.capacity_number} ${provider.capacity_unit})`);
        reasonsEn.push(`Partial capacity (${provider.capacity_number} ${provider.capacity_unit})`);
      }
    }

    // E. Verification Score (Max 5)
    let verification_score = 2;
    if (provider.is_verified) {
      verification_score = 5;
      reasonsTa.push('சரிபார்க்கப்பட்ட நம்பகமான உறுப்பினர்');
      reasonsEn.push('Verified & trusted provider profile');
    }

    const totalScore = Math.min(
      100,
      skill_match + distance_score + availability_score + capacity_score + verification_score
    );

    results.push({
      provider,
      match_score: totalScore,
      distance_km: distanceKm,
      score_breakdown: {
        skill_match,
        distance_score,
        availability_score,
        capacity_score,
        verification_score
      },
      match_reasonsTa: reasonsTa,
      match_reasonsEn: reasonsEn
    });
  }

  // Sort descending by match score
  results.sort((a, b) => b.match_score - a.match_score);
  return results;
}
