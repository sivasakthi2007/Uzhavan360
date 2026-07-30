export interface MarketPrice {
  id: string;
  cropName: string;
  state: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface GovScheme {
  id: string;
  name: string;
  benefits: string;
  eligibility: string;
  link: string;
  category: 'Subsidy' | 'Loan' | 'Insurance' | 'Welfare';
}

export interface MarketProduct {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  stockKg: number;
  location: string;
  farmerName: string;
  farmerId: string;
  image: string;
  targetChannel: 'b2c' | 'hotel' | 'retail' | 'marriage';
}

// ─── Raw data.gov.in API Response (Agmarknet + myScheme Formats) ──────
// Realistic government dataset structures with typical casing inconsistencies,
// trailing spaces, varied date formats, and prices in Rupees/Quintal.

export const RAW_MARKET_API_RESPONSE = {
  index_name: "daily_market_commodity_prices_benchmark_v2",
  title: "Daily Market Commodity Prices Benchmark",
  desc: "Benchmark market rates from Agmarknet portal, Ministry of Agriculture.",
  org_type: "Central",
  org: [
    "Ministry of Agriculture and Farmers Welfare ",
    "Department of Agriculture, Cooperation and Farmers Welfare"
  ],
  sector: ["Agriculture"],
  field: [
    { id: "id", name: "Record ID", type: "double" },
    { id: "state", name: "State Name", type: "keyword" },
    { id: "district", name: "District", type: "keyword" },
    { id: "market", name: "Market name", type: "keyword" },
    { id: "commodity", name: "Commodity", type: "keyword" },
    { id: "variety", name: "Variety", type: "keyword" },
    { id: "arrival_date", name: "Arrival Date", type: "keyword" },
    { id: "min_price", name: "Minimum Price (Rs/Quintal)", type: "double" },
    { id: "max_price", name: "Maximum Price (Rs/Quintal)", type: "double" },
    { id: "modal_price", name: "Modal Price (Rs/Quintal)", type: "double" },
    { id: "trend_signal", name: "Market Trend Indicator", type: "keyword" }
  ],
  records: [
    {
      id: "1",
      state: "TAMIL NADU",
      district: "Dindigul",
      market: "Ottanchatram  ", // Trailing spaces typical of legacy database migrations
      commodity: "Tomato",
      variety: "Local",
      arrival_date: "01/07/2026", // Legacy date format
      min_price: "2000", // Reported per quintal (100 kg)
      max_price: "3500",
      modal_price: "2800",
      trend_signal: "up"
    },
    {
      id: "2",
      state: "Maharashtra",
      district: "Nashik",
      market: "Lasalgaon",
      commodity: "Onion",
      variety: "Red",
      arrival_date: "2026-07-01", // Inconsistent date formatting in database records
      min_price: "1800",
      max_price: "2600",
      modal_price: "2200",
      trend_signal: "stable"
    },
    {
      id: "3",
      state: "Tamil Nadu",
      district: "Erode",
      market: " Erode", // Leading spaces
      commodity: "Turmeric",
      variety: "Finger",
      arrival_date: "01/07/2026",
      min_price: "9000",
      max_price: "11000",
      modal_price: "10000",
      trend_signal: "up"
    },
    {
      id: "4",
      state: "Punjab",
      district: "Ludhiana",
      market: "Khanna",
      commodity: "Paddy (Rice)",
      variety: "Basmati",
      arrival_date: "30-06-2026", // Varied date format
      min_price: "4500",
      max_price: "6000",
      modal_price: "5200",
      trend_signal: "down"
    },
    {
      id: "5",
      state: "KARNATAKA",
      district: "Chikballapur",
      market: "Chikballapur",
      commodity: "Chilli",
      variety: "Green Chilli",
      arrival_date: "01/07/2026",
      min_price: "3000",
      max_price: "4800",
      modal_price: "4000",
      trend_signal: "up"
    }
  ],
  total: 5,
  count: 5,
  limit: "10",
  offset: "0"
};

export const RAW_SCHEMES_API_RESPONSE = {
  index_name: "national_agri_schemes_loans_registry",
  title: "National Agriculture Welfare Schemes registry",
  desc: "Central Government welfare schemes query registry.",
  org_type: "Central",
  org: [
    "Ministry of Agriculture and Farmers Welfare",
    "Department of Agriculture, Cooperation and Farmers Welfare"
  ],
  sector: ["Agriculture", "Rural Welfare"],
  field: [
    { id: "id", name: "ID", type: "double" },
    { id: "scheme_title", name: "Scheme Title", type: "keyword" },
    { id: "benefits_text", name: "Benefits Details", type: "text" },
    { id: "eligibility_text", name: "Eligibility Criteria", type: "text" },
    { id: "portal_url", name: "Portal URL", type: "text" },
    { id: "scheme_category", name: "Scheme Category", type: "keyword" }
  ],
  records: [
    {
      id: "s1",
      scheme_title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      benefits_text: "Direct income support of <b>₹6,000 per year</b>, paid in three equal installments of ₹2,000 directly into the bank accounts of farmers. <br/>100% funding by Central Gov.",
      eligibility_text: "All landholding farmer families across the country are eligible, subject to certain exclusion criteria (such as institutional landholders, professionals, and taxpayers).",
      portal_url: "https://pmkisan.gov.in/",
      scheme_category: "Welfare"
    },
    {
      id: "s2",
      scheme_title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      benefits_text: "Comprehensive crop insurance against non-preventable natural risks (weather, pests, diseases). Low uniform premium rates of 1.5% for Rabi crops, 2.0% for Kharif crops, and 5% for commercial/horticultural crops.",
      eligibility_text: "All farmers, including sharecroppers and tenant farmers growing the notified crops in the notified areas, are eligible.",
      portal_url: "https://pmfby.gov.in/",
      scheme_category: "Insurance"
    },
    {
      id: "s3",
      scheme_title: "Kisan Credit Card (KCC) Scheme",
      benefits_text: "Provides clean short-term credit loans up to ₹3 Lakh for crop cultivation and post-harvest expenses at concessionary interest rates of 4% (after prompt repayment subsidy).",
      eligibility_text: "All owner-cultivators, tenant farmers, oral lessees, sharecroppers, and self-help groups (SHGs) of farmers.",
      portal_url: "https://www.rbi.org.in/",
      scheme_category: "Loan"
    },
    {
      id: "s4",
      scheme_title: "Soil Health Card Scheme",
      benefits_text: "Provides soil health cards describing soil nutrient status and recommended dosages of fertilizers/amendments for 12 parameters to optimize yield and reduce input costs.",
      eligibility_text: "All operational agricultural landholders across India are eligible to receive soil health cards biennially.",
      portal_url: "https://soilhealth.dac.gov.in/",
      scheme_category: "Subsidy"
    },
    {
      id: "s5",
      scheme_title: "Agriculture Infrastructure Fund (AIF)",
      benefits_text: "Interest subvention of 3% per annum on loans up to ₹2 Crore for building post-harvest management infrastructures like cold storage, assaying units, and sorting lines.",
      eligibility_text: "Primary Agricultural Credit Societies (PACS), Marketing Cooperative Societies, Farmer Producer Organizations (FPOs), Agri-entrepreneurs, and Startups.",
      portal_url: "https://agriinfra.dac.gov.in/",
      scheme_category: "Loan"
    }
  ],
  total: 5,
  count: 5,
  limit: "10",
  offset: "0"
};

// ─── Parsed & Normalized Outputs for App Context ────────────────────
// These parsers strip legacy API anomalies and normalize the parameters (e.g. Rupees/Quintal to Rupees/Kg)

export const DEFAULT_MARKET_PRICES: MarketPrice[] = RAW_MARKET_API_RESPONSE.records.map(rec => {
  // Normalize date formats
  let cleanDate = rec.arrival_date;
  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    cleanDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  } else if (cleanDate.includes('-') && cleanDate.indexOf('-') === 2) {
    const parts = cleanDate.split('-');
    cleanDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return {
    id: rec.id,
    cropName: `${rec.commodity} (${rec.variety})`,
    state: rec.state.trim(),
    market: rec.market.trim(),
    minPrice: Number(rec.min_price) / 100, // Convert Rupees/Quintal to Rupees/Kg
    maxPrice: Number(rec.max_price) / 100,
    modalPrice: Number(rec.modal_price) / 100,
    date: cleanDate,
    trend: rec.trend_signal as MarketPrice['trend']
  };
});

export const DEFAULT_GOV_SCHEMES: GovScheme[] = RAW_SCHEMES_API_RESPONSE.records.map(rec => ({
  id: rec.id,
  name: rec.scheme_title,
  benefits: rec.benefits_text.replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags if displaying in simple text
  eligibility: rec.eligibility_text,
  link: rec.portal_url,
  category: rec.scheme_category as GovScheme['category']
}));

export const DEFAULT_MARKET_PRODUCTS: MarketProduct[] = [
  {
    id: 'p1',
    name: 'Fresh Country Tomatoes',
    category: 'Vegetables',
    pricePerKg: 32,
    stockKg: 850,
    location: 'Madurai East, TN',
    farmerName: 'Ramanathan Swamy',
    farmerId: 'farmer_1',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'b2c',
  },
  {
    id: 'p2',
    name: 'Lasalgaon Red Onions',
    category: 'Vegetables',
    pricePerKg: 28,
    stockKg: 1500,
    location: 'Lasalgaon, MH',
    farmerName: 'Shankar Patil',
    farmerId: 'farmer_2',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'retail',
  },
  {
    id: 'p3',
    name: 'Erode Turmeric finger',
    category: 'Spices',
    pricePerKg: 110,
    stockKg: 600,
    location: 'Erode, TN',
    farmerName: 'Kavitha Raman',
    farmerId: 'farmer_3',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'hotel',
  },
  {
    id: 'p4',
    name: 'Paddy Ponni Rice',
    category: 'Grains',
    pricePerKg: 48,
    stockKg: 2500,
    location: 'Thanjavur, TN',
    farmerName: 'Anbu Selvan',
    farmerId: 'farmer_4',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'marriage',
  },
];
