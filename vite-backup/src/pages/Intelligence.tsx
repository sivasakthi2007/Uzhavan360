import { useState, useEffect } from 'react';
import { 
  getAllMarketPrices, 
  syncGovernmentMarketPrices, 
  MarketPrice 
} from '@/lib/marketService';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Calculator, 
  Award, 
  Info, 
  CheckCircle,
  Database,
  ArrowUpRight,
  TrendingUp as StableIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketIntelligencePage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');

  // Calculator state
  const [selectedCrop, setSelectedCrop] = useState('');
  const [calcQty, setCalcQty] = useState(250);

  const fetchPrices = async () => {
    setLoading(true);
    const data = await getAllMarketPrices();
    setPrices(data);
    if (data.length > 0) {
      setSelectedCrop(data[0].commodity_name);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSuccessMsg('');
    try {
      const data = await syncGovernmentMarketPrices();
      setPrices(data);
      setSuccessMsg('Agmarknet daily mandi feed synced successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Compile unique lists for drop-downs
  const districts = Array.from(new Set(prices.map(p => p.district))).sort();
  const markets = Array.from(new Set(prices.map(p => p.market_name))).sort();

  // Filtered prices list
  const filteredPrices = prices.filter(p => {
    const matchesSearch = p.commodity_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict ? p.district === selectedDistrict : true;
    const matchesMarket = selectedMarket ? p.market_name === selectedMarket : true;
    return matchesSearch && matchesDistrict && matchesMarket;
  });

  // Calculate stats
  const activeInsight = prices.find(p => p.commodity_name === selectedCrop) || prices[0];
  const baseGovValuation = activeInsight ? activeInsight.modal_price * calcQty : 0;
  const premiumAdjustment = activeInsight && activeInsight.trend === 'up' ? baseGovValuation * 0.15 : 0;
  const estimatedTotalValuation = Math.round(baseGovValuation + premiumAdjustment);

  const gainerCrop = prices.find(p => p.trend === 'up' && p.demand === 'HIGH');
  const totalCoveredMarkets = Array.from(new Set(prices.map(p => p.market_name))).length;

  const getCropEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tomato')) return '🍅';
    if (n.includes('onion')) return '🧅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('brinjal')) return '🍆';
    if (n.includes('chilli')) return '🌶️';
    if (n.includes('carrot')) return '🥕';
    if (n.includes('cabbage')) return '🥬';
    if (n.includes('beans')) return '🫘';
    if (n.includes('drumstick')) return '🪵';
    return '🥦';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Market Information Service</h2>
          <p className="text-xs text-earth-400 mt-1">
            Indian Government Agmarknet & Data.gov.in price registry. Empowering farmers with transparent mandi rates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 disabled:bg-primary-600/60 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer border-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Mandis...' : 'Sync Government Price Feed'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold leading-normal text-emerald-700 animate-slide-up flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Covered Mandis */}
        <div className="rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-5 shadow-sm">
          <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest block">TELEMETRY</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{loading ? '...' : totalCoveredMarkets}</span>
            <span className="text-xs font-semibold text-earth-400">Live Indian Mandis</span>
          </div>
          <span className="text-[10px] text-primary-500 font-bold block mt-2 flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            Verified Government API records
          </span>
        </div>

        {/* Card 2: Highest Gainer */}
        <div className="rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-5 shadow-sm">
          <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest block">TOP GAINER CROP</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : gainerCrop ? `₹${gainerCrop.modal_price}/kg` : 'Tomato'}
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {gainerCrop ? gainerCrop.commodity_name : 'Tomato'}
            </span>
          </div>
          <span className="text-[10px] text-earth-400 block mt-2">
            Trending UP due to heavy monsoon arrivals shortage
          </span>
        </div>

        {/* Card 3: Best Recommendation */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest block">BEST SELLING RECOM.</span>
          <div className="mt-2">
            <span className="text-xs font-black text-[#1c201e] dark:text-[#f2f4f3] leading-snug block truncate">
              {gainerCrop ? `Sell ${gainerCrop.commodity_name} immediately` : 'Sell Tomato directly'}
            </span>
            <span className="text-[9px] text-earth-500 block mt-1.5 leading-relaxed">
              Skip brokers and list crop on V-LINK sales hub to capture maximum modal pricing margins.
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel: Filter Controls & Price Table */}
      <div className="rounded-3xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-6 shadow-sm space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search crop name (e.g. Tomato, Onion, Chilli)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-2xl text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 border border-earth-200 dark:border-earth-850 bg-earth-50/30 dark:bg-earth-950/10 rounded-2xl">
              <Filter className="w-3.5 h-3.5 text-earth-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500">Filter By:</span>
            </div>

            {/* District dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-10 px-3 pr-8 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-2xl text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Market dropdown */}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="h-10 px-3 pr-8 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-2xl text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Mandis</option>
              {markets.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Reset Filter Button */}
            {(searchQuery || selectedDistrict || selectedMarket) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDistrict('');
                  setSelectedMarket('');
                }}
                className="h-10 px-3 rounded-2xl border border-dashed border-earth-300 dark:border-earth-700 text-xs font-bold text-earth-500 hover:text-foreground cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Agmarknet Ledger Price List */}
        <div className="overflow-x-auto border border-[#e6eae7] dark:border-[#232a26] rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50/50 dark:bg-earth-950/40 border-b border-earth-100 dark:border-earth-900/40">
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500">Commodity / Crop</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500">Mandi Market</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500">District & State</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500">Min / Max Price</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500 text-right">Modal Rate (₹/kg)</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500 text-center">Trend / Demand</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-earth-500 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 dark:divide-earth-900/30">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-earth-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-500" />
                    Fetching Agmarknet Price Ledger...
                  </td>
                </tr>
              ) : filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-earth-400 italic">
                    No commodity price records match selected filters.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((item) => (
                  <tr key={item.id} className="hover:bg-earth-50/30 dark:hover:bg-earth-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0" role="img" aria-label={item.commodity_name}>
                          {getCropEmoji(item.commodity_name)}
                        </span>
                        <div>
                          <span className="font-extrabold text-xs text-foreground block">{item.commodity_name}</span>
                          <span className="text-[9px] text-earth-400 font-mono block">Variety: Local</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                        <span>{item.market_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-earth-500 dark:text-earth-400 block">{item.district} District</span>
                      <span className="text-[9px] text-earth-400 font-semibold uppercase">{item.state}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-earth-500">
                      <span>Min: ₹{item.min_price}</span>
                      <span className="mx-1 text-earth-300">|</span>
                      <span>Max: ₹{item.max_price}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{item.modal_price}</span>
                      <span className="text-[9px] text-earth-400 block -mt-1">per kg</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {item.trend === 'up' ? (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            Upward
                          </span>
                        ) : item.trend === 'down' ? (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 uppercase flex items-center gap-0.5">
                            <TrendingDown className="w-2.5 h-2.5" />
                            Downward
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-stone-100 dark:bg-stone-900/40 text-stone-600 dark:text-stone-300 uppercase flex items-center gap-0.5">
                            <StableIcon className="w-2.5 h-2.5" />
                            Stable
                          </span>
                        )}

                        {item.demand === 'HIGH' && (
                          <span className="text-[8px] text-primary-500 font-black tracking-widest uppercase mt-0.5 animate-pulse">
                            🔥 High Demand
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to="/dashboard?tab=sales"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e6f4ea] dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition-all cursor-pointer border-0 shadow-2xs"
                      >
                        <span>Sell Direct</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Date updated indicator */}
        <div className="flex items-center gap-1 text-[9px] font-mono text-earth-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last synchronized: {loading ? 'Fetching...' : prices.length > 0 ? new Date(prices[0].updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
        </div>
      </div>

      {/* Estimator & Advisory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settlement Value Estimator */}
        <div className="lg:col-span-2 rounded-3xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-primary-500" />
              <h3 className="text-base font-bold text-foreground tracking-tight">Ecosystem Settlement Estimator</h3>
            </div>
            <p className="text-xs text-earth-400 mb-5">
              Estimate B2B contract valuations and middleman commission savings based on actual government mandi price listings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-400 block mb-1.5">
                  Select Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full h-11 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  {prices.map((p) => (
                    <option key={p.id} value={p.commodity_name}>
                      {p.commodity_name} ({p.market_name.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-400 block mb-1.5">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={calcQty}
                  onChange={(e) => setCalcQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full h-11 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-bold text-foreground focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Calculator Ledger */}
          {activeInsight && (
            <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-100 dark:border-earth-900/40 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-earth-500 dark:text-earth-400">Base Government Mandate Valuation ({calcQty} kg × ₹{activeInsight.modal_price})</span>
                <span className="font-semibold text-foreground">₹{(activeInsight.modal_price * calcQty).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-earth-500 dark:text-earth-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                  Regional Demand Premium ({activeInsight.trend === 'up' ? '+15%' : '0%'})
                </span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">+₹{premiumAdjustment.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-primary-600 dark:text-primary-400 font-bold border-t border-dashed border-earth-200 dark:border-earth-800 pt-2.5">
                <span>Middleman Commission Saved (V-LINK 0% Commission)</span>
                <span>₹{Math.round(baseGovValuation * 0.12).toLocaleString('en-IN')} (12% saved)</span>
              </div>
              <div className="border-t border-earth-100 dark:border-earth-900/20 pt-2.5 flex justify-between items-baseline">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Estimated Contract Settlement</span>
                <span className="text-lg font-black text-primary-600 dark:text-primary-400">₹{estimatedTotalValuation.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Advisory */}
        <div className="rounded-3xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-500" />
              <h3 className="text-base font-bold text-foreground tracking-tight">Pricing Advisory</h3>
            </div>
            
            {activeInsight ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-primary-500/10 bg-primary-50/10 dark:bg-primary-950/5">
                  <h5 className="font-extrabold text-xs text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    Advisory for {activeInsight.commodity_name}
                  </h5>
                  <p className="text-earth-500 dark:text-earth-400 text-xs leading-relaxed mt-2 font-medium">
                    {activeInsight.recommendation}
                  </p>
                </div>

                <div className="flex gap-2.5 p-3.5 rounded-xl border border-red-500/10 bg-red-50/5 dark:bg-red-950/5 text-xs">
                  <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-foreground">Middleman Commission Penalty</h5>
                    <p className="text-earth-400 text-[10px] leading-relaxed mt-0.5">Selling via offline agents typically incurs a 10-15% commission markup and transportation deductibles. V-LINK secures 100% of Gov Mandi values.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-earth-400 italic">Select a commodity in the estimator to view price recommendations.</p>
            )}
          </div>

          <Link
            to="/dashboard?tab=sales"
            className="w-full mt-6 py-3 rounded-2xl text-xs font-bold bg-[#1d2421] hover:bg-[#28322e] border border-[#2d3a34] text-[#f2f4f3] transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5 border-0"
          >
            <span>List Crop Produce for B2B Sales</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
