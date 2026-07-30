import { supabase, isSupabaseConfigured } from './supabase';

export interface MarketPrice {
  id: string;
  commodity_name: string;
  market_name: string;
  district: string;
  state: string;
  min_price: number; // In Rs per kg
  max_price: number; // In Rs per kg
  modal_price: number; // In Rs per kg
  updated_at: string;
  trend?: 'up' | 'down' | 'stable';
  demand?: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation?: string;
}

// Seed data based on actual Indian Mandi prices (in Rs/kg)
export const fallbackMarketPrices: MarketPrice[] = [
  {
    id: 'mp_1',
    commodity_name: 'Tomato',
    market_name: 'Madurai East Mandi',
    district: 'Madurai',
    state: 'Tamil Nadu',
    min_price: 26,
    max_price: 36,
    modal_price: 32,
    updated_at: new Date().toISOString(),
    trend: 'up',
    demand: 'HIGH',
    recommendation: 'Tomato demand is spiking due to monsoon logistics disruption. Harvest and sell directly to Koyambedu or Madurai wholesale buyers today for maximum returns.'
  },
  {
    id: 'mp_2',
    commodity_name: 'Onion',
    market_name: 'Nashik Mandi (Lasalgaon)',
    district: 'Nashik',
    state: 'Maharashtra',
    min_price: 22,
    max_price: 32,
    modal_price: 28,
    updated_at: new Date().toISOString(),
    trend: 'down',
    demand: 'MEDIUM',
    recommendation: 'Onion arrivals have increased in Nashik. Prices are dropping slightly. We recommend sorting and storing high-quality onions in dry storage to sell in 2-3 weeks.'
  },
  {
    id: 'mp_3',
    commodity_name: 'Potato',
    market_name: 'Pune Market Yard',
    district: 'Pune',
    state: 'Maharashtra',
    min_price: 18,
    max_price: 25,
    modal_price: 22,
    updated_at: new Date().toISOString(),
    trend: 'stable',
    demand: 'MEDIUM',
    recommendation: 'Potato demand and prices are stable. Sell standard grades to retail shops, and sort premium grades for hotel contracts.'
  },
  {
    id: 'mp_4',
    commodity_name: 'Brinjal',
    market_name: 'Koyambedu Wholesale Market',
    district: 'Chennai',
    state: 'Tamil Nadu',
    min_price: 28,
    max_price: 38,
    modal_price: 34,
    updated_at: new Date().toISOString(),
    trend: 'up',
    demand: 'MEDIUM',
    recommendation: 'Brinjal price is up by 15% in Koyambedu. Recommend packing in crates and shipping via V-LINK logistics.'
  },
  {
    id: 'mp_5',
    commodity_name: 'Chilli',
    market_name: 'Guntur Vegetable Market',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    min_price: 140,
    max_price: 180,
    modal_price: 160,
    updated_at: new Date().toISOString(),
    trend: 'up',
    demand: 'HIGH',
    recommendation: 'Green Chilli modal price is very high at ₹160/kg. Harvest crop immediately.'
  },
  {
    id: 'mp_6',
    commodity_name: 'Carrot',
    market_name: 'Ooty Central Market',
    district: 'The Nilgiris',
    state: 'Tamil Nadu',
    min_price: 45,
    max_price: 60,
    modal_price: 52,
    updated_at: new Date().toISOString(),
    trend: 'down',
    demand: 'LOW',
    recommendation: 'Ooty carrot supply is high, dragging prices down. Group bulk-sell to marriage banquets to avoid middleman commission.'
  },
  {
    id: 'mp_7',
    commodity_name: 'Cabbage',
    market_name: 'Shimoga Mandi',
    district: 'Shimoga',
    state: 'Karnataka',
    min_price: 12,
    max_price: 18,
    modal_price: 15,
    updated_at: new Date().toISOString(),
    trend: 'stable',
    demand: 'MEDIUM',
    recommendation: 'Cabbage prices are stable. Coordinate with local cooperatives to share transport costs.'
  },
  {
    id: 'mp_8',
    commodity_name: 'Beans',
    market_name: 'Madurai Central Market',
    district: 'Madurai',
    state: 'Tamil Nadu',
    min_price: 55,
    max_price: 75,
    modal_price: 68,
    updated_at: new Date().toISOString(),
    trend: 'up',
    demand: 'HIGH',
    recommendation: 'Beans supply is tight, forcing modal prices to ₹68/kg. Premium grade beans are highly sought after by local hotels.'
  },
  {
    id: 'mp_9',
    commodity_name: 'Drumstick',
    market_name: 'Ottanchatram Market',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    min_price: 60,
    max_price: 90,
    modal_price: 75,
    updated_at: new Date().toISOString(),
    trend: 'up',
    demand: 'HIGH',
    recommendation: 'Ottanchatram drumstick rates are soaring. Sell to B2B channels to secure cash settlements.'
  }
];

// Helper to add trend and demand features
export const enrichMarketPrice = (price: any): MarketPrice => {
  const modal = Number(price.modal_price);
  const min = Number(price.min_price);
  const max = Number(price.max_price);
  
  // Deterministic trend/demand based on ID/Commodity
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let demand: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let recommendation = 'Pricing is stable. Recommend direct sales.';

  const commodity = price.commodity_name.toLowerCase();
  
  if (commodity.includes('tomato') || commodity.includes('chilli') || commodity.includes('beans') || commodity.includes('drumstick')) {
    trend = 'up';
    demand = 'HIGH';
    recommendation = `${price.commodity_name} price is trending upwards. Strongly recommend direct B2B sales to hotels or retail shops to maximize your ₹${modal}/kg margin.`;
  } else if (commodity.includes('onion') || commodity.includes('carrot')) {
    trend = 'down';
    demand = 'MEDIUM';
    recommendation = `${price.commodity_name} market supply is currently high, leading to a downward trend. Consider sorting and grading to sell premium crop grades.`;
  } else {
    trend = 'stable';
    demand = 'MEDIUM';
    recommendation = `${price.commodity_name} rates are holding steady at ₹${modal}/kg. Use V-LINK logistics to minimize transport overheads.`;
  }

  return {
    id: String(price.id),
    commodity_name: price.commodity_name,
    market_name: price.market_name,
    district: price.district,
    state: price.state,
    min_price: min,
    max_price: max,
    modal_price: modal,
    updated_at: price.updated_at || price.created_at || new Date().toISOString(),
    trend,
    demand,
    recommendation
  };
};

export const getAllMarketPrices = async (): Promise<MarketPrice[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('commodity_name', { ascending: true });
        
      if (error) throw error;
      
      // If table is empty, seed it with fallback data
      if (!data || data.length === 0) {
        const seedPayload = fallbackMarketPrices.map(({ id, trend, demand, recommendation, ...rest }) => ({
          ...rest,
          min_price: Number(rest.min_price),
          max_price: Number(rest.max_price),
          modal_price: Number(rest.modal_price)
        }));
        
        const { data: insertedData, error: insertError } = await supabase
          .from('market_prices')
          .insert(seedPayload)
          .select();
          
        if (insertError) throw insertError;
        return (insertedData || []).map(enrichMarketPrice);
      }
      
      return data.map(enrichMarketPrice);
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local memory data.", err);
    }
  }

  // Fallback to local simulated database (which loads/saves in localStorage if client is active)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vlink_market_prices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Parse error, reset
      }
    }
    // Initialize localStorage
    localStorage.setItem('vlink_market_prices', JSON.stringify(fallbackMarketPrices));
  }
  
  return fallbackMarketPrices;
};

export const getCommodityPrice = async (commodity: string): Promise<MarketPrice[]> => {
  const all = await getAllMarketPrices();
  return all.filter(p => p.commodity_name.toLowerCase().includes(commodity.toLowerCase()));
};

export const getDistrictPrices = async (district: string): Promise<MarketPrice[]> => {
  const all = await getAllMarketPrices();
  return all.filter(p => p.district.toLowerCase() === district.toLowerCase());
};

export const getTopDemandProducts = async (): Promise<MarketPrice[]> => {
  const all = await getAllMarketPrices();
  return all.filter(p => p.demand === 'HIGH').sort((a, b) => b.modal_price - a.modal_price);
};

export const syncGovernmentMarketPrices = async (apiKey?: string): Promise<MarketPrice[]> => {
  const targetKey = apiKey || import.meta.env.VITE_DATA_GOV_IN_API_KEY || '';
  if (!targetKey) {
    console.log("No Data.gov.in API key found. Simulating government feed sync.");
    const all = await getAllMarketPrices();
    const updated = all.map(p => ({
      ...p,
      updated_at: new Date().toISOString(),
      // Fluctuate modal price by -2 to +3 Rs
      modal_price: Math.max(5, p.modal_price + Math.floor(Math.random() * 6) - 2)
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_market_prices', JSON.stringify(updated));
    }
    return updated;
  }

  try {
    const url = `https://api.data.gov.in/resource/9ef84281-22f4-425d-b34e-0a568d4a53ed?api-key=${targetKey}&format=json&limit=50`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Government API response not OK");
    const data = await res.json();
    
    if (data && data.records && data.records.length > 0) {
      const mapped: MarketPrice[] = data.records.map((rec: any, idx: number) => {
        const min = Math.round(Number(rec.min_price || 0) / 100);
        const max = Math.round(Number(rec.max_price || 0) / 100);
        const modal = Math.round(Number(rec.modal_price || 0) / 100);
        
        return {
          id: `gov_${idx}_${Date.now()}`,
          commodity_name: rec.commodity || 'Vegetable',
          market_name: rec.market || 'Local Mandi',
          district: rec.district || 'District',
          state: rec.state || 'State',
          min_price: min > 0 ? min : 10,
          max_price: max > 0 ? max : 20,
          modal_price: modal > 0 ? modal : 15,
          updated_at: rec.arrival_date ? new Date(rec.arrival_date.split('/').reverse().join('-')).toISOString() : new Date().toISOString()
        };
      }).map(enrichMarketPrice);

      if (isSupabaseConfigured && supabase) {
        const dbPayload = mapped.map(({ id, trend, demand, recommendation, ...rest }) => ({
          ...rest,
          min_price: Number(rest.min_price),
          max_price: Number(rest.max_price),
          modal_price: Number(rest.modal_price)
        }));
        
        await supabase.from('market_prices').upsert(dbPayload);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('vlink_market_prices', JSON.stringify(mapped));
      }

      return mapped;
    }
  } catch (err) {
    console.error("Government API sync failed:", err);
  }

  return getAllMarketPrices();
};
