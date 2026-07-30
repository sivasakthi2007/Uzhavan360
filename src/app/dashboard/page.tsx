'use client';
import { prioritizeProducts } from '@/services/priorityService';
import ProductCard from '@/components/ProductCard';
import OrderModal from '@/components/OrderModal';
import MyFarmBoard from '@/components/MyFarmBoard';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useApp, Product } from '@/context/AppContext';
import {
  Leaf,
  Search,
  ShoppingBag,
  BookOpen,
  RefreshCw,
  Check,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Plus,
  Wifi,
  WifiOff,
  MapPin,
  IndianRupee,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import RentalsBoard from '@/components/RentalsBoard';
import LaborBoard from '@/components/LaborBoard';
import AdminBoard from '@/components/AdminBoard';
import DiseaseDiagnosisBoard from '@/components/DiseaseDiagnosisBoard';
import WeatherBoard from '@/components/WeatherBoard';
import AIAssistantBoard from '@/components/AIAssistantBoard';
import CustomerCareBoard from '@/components/CustomerCareBoard';
import { useSearchParams } from 'next/navigation';

// ─── Official Schemes API Sandbox Mock ──────────────────────────────
const OFFICIAL_SCHEMES_API_MOCK = [
  {
    id: 'gov_sch_1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    eligibility: 'All landholding farmer families across the country with cultivable landholding in their names.',
    benefits: 'Financial benefit of ₹6,000 per year in three equal installments of ₹2,000 every four months directly into bank accounts.',
    lastUpdated: '2026-07-01',
    link: 'https://pmkisan.gov.in/'
  },
  {
    id: 'gov_sch_2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
    benefits: 'Comprehensive insurance cover against crop failure due to natural calamities, pests & diseases. Low premium rates (1.5% to 5%).',
    lastUpdated: '2026-06-15',
    link: 'https://pmfby.gov.in/'
  },
  {
    id: 'gov_sch_3',
    name: 'Modified Interest Subvention Scheme (MISS)',
    eligibility: 'All crop farmers availing short-term crop loans up to ₹3 lakh.',
    benefits: 'Subvented interest rate of 7% per annum on crop credit. Prompt repayment incentive reduces interest rate to 4%.',
    lastUpdated: '2026-06-20',
    link: 'https://www.myscheme.gov.in/schemes/miss'
  }
];

function DashboardContent() {
  const {
    marketPrices,
    t,
    govSchemes,
    isOffline,
    syncData,
    products,
    addProduct,
    userName,
    placeOrder,
    toasts,
    activeRole,
    applyForScheme,
    schemeApplications
  } = useApp();

  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'market';

  // State Management
  const [isSyncing, setIsSyncing] = useState(false);
  const [schemeQuery, setSchemeQuery] = useState('');
  const [marketQuery, setMarketQuery] = useState('');
  const [showAddProduce, setShowAddProduce] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortOption, setSortOption] = useState('Recommended');
  const [maxPrice, setMaxPrice] = useState(250);
  const [marketPage, setMarketPage] = useState(1);
  const [selectedProdForOrder, setSelectedProdForOrder] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Add Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Vegetables');
  const [newProdPrice, setNewProdPrice] = useState(30);
  const [newProdStock, setNewProdStock] = useState(500);
  const [newProdLocation, setNewProdLocation] = useState('Madurai East, TN');

  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    // Simulate minor delay for polished feel
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    if (!schemeQuery.trim()) return govSchemes;
    return govSchemes.filter(s =>
      s.name.toLowerCase().includes(schemeQuery.toLowerCase()) ||
      s.benefits.toLowerCase().includes(schemeQuery.toLowerCase()) ||
      s.eligibility.toLowerCase().includes(schemeQuery.toLowerCase())
    );
  }, [govSchemes, schemeQuery]);

  // Filter & sort marketplace products using priorityService
  const processedProducts = useMemo(() => {
    let results = prioritizeProducts(products, 'Madurai', 'Othakadai', sortOption, {
      category: selectedCategory,
      district: selectedDistrict,
      maxPrice: maxPrice,
      minRating: 0,
      availability: 'all'
    });

    if (marketQuery.trim()) {
      const q = marketQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.district && p.district.toLowerCase().includes(q)) ||
        (p.village && p.village.toLowerCase().includes(q))
      );
    }
    return results;
  }, [products, marketQuery, selectedCategory, selectedDistrict, sortOption, maxPrice]);

  // Handle Add Product Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdLocation.trim()) return;

    let defaultImg = 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80';
    if (newProdCategory === 'Fruits') {
      defaultImg = 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80';
    } else if (newProdCategory === 'Grains') {
      defaultImg = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80';
    } else if (newProdCategory === 'Spices') {
      defaultImg = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80';
    }

    addProduct({
      name: newProdName,
      category: newProdCategory,
      pricePerKg: Number(newProdPrice),
      stockKg: Number(newProdStock),
      location: newProdLocation,
      image: defaultImg,
      targetChannel: 'b2c'
    });

    // Reset Form
    setNewProdName('');
    setShowAddProduce(false);
  };

  return (
    <div className="flex h-screen bg-[#f7f9f6] dark:bg-[#090e0c] text-foreground transition-colors overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic content wrapper based on activeTab */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          <div className="max-w-5xl mx-auto w-full space-y-6">

            {/* Offline status and Sync Banner */}
            <div className={`p-4 rounded-[20px] border transition-all duration-300 flex items-center justify-between gap-3 text-xs font-semibold ${
              isOffline
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
                : 'bg-primary-500/10 border-primary-500/20 text-primary-850 dark:text-primary-400'
            }`}>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <Wifi className="w-5 h-5 text-primary-500 shrink-0" />
                )}
                <div>
                  <span className="font-mono font-black block uppercase text-[9px] tracking-widest">
                    {isOffline ? 'Offline Mode Active' : 'System Connected'}
                  </span>
                  <p className="mt-0.5 font-semibold text-[11px] opacity-80">
                    {isOffline
                      ? 'Displaying locally cached data. You can browse all features offline.'
                      : 'Data synchronized with live government benchmarks.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900 border border-earth-200 dark:border-primary-950/20 font-mono text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 0. MY FARM TAB */}
            {/* ========================================================================= */}
            {activeTab === 'myfarm' && (
              <MyFarmBoard />
            )}

            {/* ========================================================================= */}
            {/* 1. MANDI-SYNC TAB */}
            {/* ========================================================================= */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">{t('market_benchmarks') || 'Government Market Prices'}</h1>
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                    {t('mandi_prices_subtitle') || 'Live Agricultural Produce Prices across regional wholesale markets.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Prices Table Column */}
                  <div className="md:col-span-2 p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{t('benchmark_rates') || 'Benchmark Rates'}</h3>
                    <div className="overflow-x-auto">
                      {marketPrices.length === 0 ? (
                        <div className="text-center py-8 text-earth-400 text-xs font-semibold">
                          {t('no_price_data') || 'No market price data available. Click Sync to fetch.'}
                        </div>
                      ) : (
                        <table className="w-full text-xs text-left">
                          <thead className="text-[10px] uppercase text-earth-400 tracking-wider border-b border-earth-150 dark:border-earth-900/40">
                            <tr>
                              <th className="py-2.5 font-bold">{t('col_crop') || 'Crop'}</th>
                              <th className="py-2.5 font-bold">{t('location') || 'Location'}</th>
                              <th className="py-2.5 font-bold">{t('price_range') || 'Price Range'}</th>
                              <th className="py-2.5 font-bold text-right">{t('modal_price') || 'Modal Price'}</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold divide-y divide-earth-100 dark:divide-earth-900/20">
                            {marketPrices.map((item) => (
                              <tr key={item.id} className="hover:bg-earth-50/20">
                                <td className="py-3 text-foreground font-black flex items-center gap-1.5">
                                  <Leaf className="w-3.5 h-3.5 text-primary-500" />
                                  {item.cropName}
                                </td>
                                <td className="py-3 text-earth-500 font-semibold">
                                  {item.market}, {item.state}
                                </td>
                                <td className="py-3 text-earth-400 font-mono">
                                  ₹{item.minPrice} - ₹{item.maxPrice} /kg
                                </td>
                                <td className="py-3 text-right text-primary-600 dark:text-primary-400 font-black">
                                  ₹{item.modalPrice} /kg
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Market intelligence / Advice Column */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl border border-primary-500/20 bg-primary-500/5 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                        <TrendingUp className="w-5 h-5" />
                        <h4 className="text-xs font-black uppercase tracking-widest">{t('crop_market_insights') || 'Crop Market Insights'}</h4>
                      </div>
                      <p className="text-[11px] leading-relaxed text-earth-500 dark:text-earth-400">
                        {t('crop_market_insights_desc') || 'Sell suggestions are computed dynamically by comparing local market rates against benchmark trends.'}
                      </p>

                      <div className="space-y-3">
                        {marketPrices.map((item) => (
                          <div key={item.id} className="p-3 bg-white dark:bg-[#1a201c] border border-earth-150 dark:border-earth-900/30 rounded-2xl flex items-center justify-between text-xs">
                            <span className="font-black text-foreground">{item.cropName}</span>
                            <div className="flex items-center gap-1.5">
                              {item.trend === 'up' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white">
                                  <TrendingUp className="w-3 h-3" /> {t('trend_sell') || 'SELL'}
                                </span>
                              )}
                              {item.trend === 'stable' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500 text-white">
                                  {t('trend_hold') || 'HOLD'}
                                </span>
                              )}
                              {item.trend === 'down' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                                  <TrendingDown className="w-3 h-3" /> {t('trend_hold') || 'HOLD'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. GOV SCHEMES TAB */}
            {/* ========================================================================= */}
            {activeTab === 'schemes' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Government Schemes &amp; Loans</h1>
                    <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                      {t('gov_schemes_subheader')}
                    </p>
                  </div>

                  {/* Search bar */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder={t('search_schemes')}
                      value={schemeQuery}
                      onChange={e => setSchemeQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-500"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                  </div>
                </div>

                {/* Schemes list */}
                {filteredSchemes.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
                    {t('no_schemes_found')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredSchemes.map((scheme) => (
                      <div key={scheme.id} className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] shadow-xs hover:border-primary-500/30 transition-all flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-black text-foreground hover:text-primary-500 transition-colors">
                              {scheme.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-500/10 text-primary-600 dark:text-primary-400">
                              {scheme.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-earth-400 font-bold uppercase tracking-wider">Benefits</span>
                            <p className="text-xs text-earth-500 dark:text-earth-400 mt-0.5 leading-relaxed font-semibold">
                              {scheme.benefits}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-earth-400 font-bold uppercase tracking-wider">Eligibility</span>
                            <p className="text-xs text-earth-500 dark:text-earth-400 mt-0.5 leading-relaxed">
                              {scheme.eligibility}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-earth-100 dark:border-earth-900/30 flex items-center justify-between gap-4">
                          {(() => {
                            const isApplied = schemeApplications.some(app => app.scheme_id === scheme.id);
                            return (
                              <button
                                onClick={() => !isApplied && applyForScheme(scheme.id, scheme.name)}
                                disabled={isApplied}
                                className={`h-9 px-4 rounded-xl text-xs font-bold border-0 shadow-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                                  isApplied
                                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-black cursor-default'
                                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Applied</span>
                                  </>
                                ) : (
                                  <span>Apply via V-Link</span>
                                )}
                              </button>
                            );
                          })()}
                          <a
                            href={scheme.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-primary-500 hover:text-primary-650 no-underline"
                          >
                            <span>{t('official_portal')}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. MARKETPLACE TAB */}
            {/* ========================================================================= */}
            {activeTab === 'market' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Agri-Marketplace</h1>
                    <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                      {t('agri_marketplace_desc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search bar */}
                    <div className="relative w-full sm:w-56">
                      <input
                        type="text"
                        placeholder={t('search_crops')}
                        value={marketQuery}
                        onChange={e => { setMarketQuery(e.target.value); setMarketPage(1); }}
                        className="w-full h-10 pl-9 pr-4 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-500"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                    </div>

                    <button
                      onClick={() => setShowAddProduce(true)}
                      className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm border-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('list_crop')}</span>
                    </button>
                  </div>
                </div>

                {/* Filters and Sorting bar */}
                <div className="flex flex-wrap gap-2 items-center bg-earth-50/40 dark:bg-earth-950/15 p-4 rounded-3xl border border-earth-150/40 dark:border-earth-900/10">
                  <div className="flex flex-wrap gap-2 flex-1">
                    <select
                      value={selectedCategory}
                      onChange={e => { setSelectedCategory(e.target.value); setMarketPage(1); }}
                      className="h-9 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 text-foreground cursor-pointer focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Spices">Spices</option>
                    </select>

                    <select
                      value={selectedDistrict}
                      onChange={e => { setSelectedDistrict(e.target.value); setMarketPage(1); }}
                      className="h-9 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 text-foreground cursor-pointer focus:outline-none"
                    >
                      <option value="all">All Districts</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Dindigul">Dindigul</option>
                      <option value="Virudhunagar">Virudhunagar</option>
                      <option value="Thanjavur">Thanjavur</option>
                      <option value="Erode">Erode</option>
                      <option value="Sivagangai">Sivagangai</option>
                    </select>

                    <div className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 text-xs font-semibold text-earth-500">
                      <span>Max Price: ₹{maxPrice}</span>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={maxPrice}
                        onChange={e => { setMaxPrice(Number(e.target.value)); setMarketPage(1); }}
                        className="w-20 accent-primary-500 cursor-pointer h-1"
                      />
                    </div>
                  </div>

                  <select
                    value={sortOption}
                    onChange={e => { setSortOption(e.target.value); setMarketPage(1); }}
                    className="h-9 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 text-foreground cursor-pointer focus:outline-none ml-auto"
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Newest">Newest</option>
                    <option value="Price Low → High">Price Low → High</option>
                    <option value="Price High → Low">Price High → Low</option>
                    <option value="Nearest">Nearest</option>
                    <option value="Highest Rated">Highest Rated</option>
                    <option value="Most Popular">Most Popular</option>
                  </select>
                </div>

                {/* Products Grid with Component Reuse */}
                {processedProducts.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
                    {t('no_crop_listings_found') || 'No crop listings found.'}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {processedProducts.slice((marketPage - 1) * 4, marketPage * 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          isBuyable={true}
                          onBuyClick={(prod) => {
                            setSelectedProdForOrder(prod);
                            setIsOrderModalOpen(true);
                          }}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {processedProducts.length > 4 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-earth-100 dark:border-earth-900/30">
                        <button
                          disabled={marketPage === 1}
                          onClick={() => setMarketPage(p => Math.max(1, p - 1))}
                          className="py-1.5 px-3 rounded-lg border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="text-xs text-earth-500 font-mono">Page {marketPage} of {Math.ceil(processedProducts.length / 4)}</span>
                        <button
                          disabled={marketPage >= Math.ceil(processedProducts.length / 4)}
                          onClick={() => setMarketPage(p => p + 1)}
                          className="py-1.5 px-3 rounded-lg border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

                        {activeTab === 'diagnosis' && (
              <DiseaseDiagnosisBoard />
            )}

            {activeTab === 'rentals' && (
              <RentalsBoard />
            )}

            {activeTab === 'labor' && (
              <LaborBoard />
            )}

            {activeTab === 'admin' && (
              <AdminBoard />
            )}

            {activeTab === 'weather' && (
              <WeatherBoard />
            )}

            {activeTab === 'assistant' && (
              <AIAssistantBoard />
            )}

            {activeTab === 'support' && (
              <CustomerCareBoard />
            )}

            <OrderModal
              product={selectedProdForOrder}
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              onConfirm={(qty, address) => {
                if (selectedProdForOrder) {
                  placeOrder(selectedProdForOrder.id, qty, userName, address);
                }
              }}
            />

            {/* Toast Notification Overlay */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
              {toasts && toasts.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold pointer-events-auto animate-slide-up ${
                    t.type === 'success'
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : t.type === 'error'
                      ? 'bg-red-500/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-500/20'
                      : 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}
                >
                  <span className="text-base">
                    {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ️'}
                  </span>
                  <p className="flex-1 leading-normal">{t.message}</p>
                </div>
              ))}
            </div>


          </div>
        </main>
      </div>

      {/* Modal: List Crop Form */}
      {showAddProduce && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-md rounded-[24px] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground">List Crop for Sale</h2>
              <button
                onClick={() => setShowAddProduce(false)}
                className="p-1 text-earth-400 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  {t('product_name')}
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder={t('crop_name_placeholder')}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {t('category') || 'Category'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full h-10 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {t('price_per_kg_label')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {t('available_stock_label')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProdStock}
                    onChange={e => setNewProdStock(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {t('location') || 'Location'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdLocation}
                    onChange={e => setNewProdLocation(e.target.value)}
                    placeholder="e.g. Madurai, TN"
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all duration-200 border-0"
              >
                {t('publish_listing_btn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafbfa] dark:bg-[#111613] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Leaf className="w-8 h-8 text-primary-500 animate-bounce" />
            <span className="text-xs font-semibold text-earth-500 font-mono">LOADING AGRICULTURAL OPERATOR CONSOLE...</span>
          </div>
        </div>
      }
    >
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </Suspense>
  );
}
