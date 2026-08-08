'use client';
import { prioritizeProducts } from '@/services/priorityService';
import ProductCard from '@/components/ProductCard';
import OrderModal from '@/components/OrderModal';
import MyFarmBoard from '@/components/MyFarmBoard';
import Link from 'next/link';

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
  AlertCircle,
  Package,
  Users,
  CloudSun,
  Bot,
  ClipboardList,
  Wallet,
  Headset,
  Truck,
  Languages,
  User,
  Phone,
  ShieldAlert,
  Snowflake
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
import TranslatorBoard from '@/components/TranslatorBoard';
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
    setActiveRole,
    applyForScheme,
    schemeApplications,
    orders,
    confirmOrder,
    completeOrder,
    cancelOrder,
    wallets,
    walletTransactions,
    user,
    language,
    buyerRequirements,
    matchBuyerRequirement
  } = useApp();

  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';

  // Sub-tab state for Buy/Sell workflow
  const [buySellTab, setBuySellTab] = useState<'crops' | 'requirements' | 'prebookings' | 'orders'>('crops');

  const subParam = searchParams.get('sub');
  useEffect(() => {
    if (activeTab === 'market') setBuySellTab('crops');
    else if (activeTab === 'prebookings') setBuySellTab('prebookings');
    else if (activeTab === 'orders') setBuySellTab('orders');

    if (subParam === 'crops') setBuySellTab('crops');
    else if (subParam === 'requirements') setBuySellTab('requirements');
    else if (subParam === 'prebooking') setBuySellTab('prebookings');
  }, [activeTab, subParam]);

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
            {/* 1. FARMER HOME TAB */}
            {/* ========================================================================= */}
            {activeTab === 'home' && (
              <div className="space-y-5 animate-fade-in text-foreground">

                {/* Greeting + Connectivity */}
                <div className="p-5 rounded-3xl border border-primary-500/10 bg-gradient-to-br from-primary-500/8 to-primary-600/3 dark:from-primary-950/20 dark:to-primary-900/5 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black tracking-tight">
                      {language === 'ta' ? `வணக்கம், ${userName || 'விவசாயி'} 👋` : `Welcome, ${userName || 'Farmer Partner'} 👋`}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-earth-500 dark:text-earth-400">
                      <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                      <span>Madurai District, Tamil Nadu</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider font-mono ${
                      isOffline
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-primary-500 animate-ping'}`} />
                      {isOffline
                        ? (language === 'ta' ? 'உள்ளூர்' : 'Offline')
                        : (language === 'ta' ? 'இணைக்கப்பட்டது' : 'Live')}
                    </div>
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="h-8 w-8 rounded-xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 flex items-center justify-center cursor-pointer hover:bg-earth-50 transition-all shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-primary-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Quick Navigation Strip */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { href: '/dashboard?tab=myfarm', icon: Leaf, label: language === 'ta' ? 'என் பண்ணை' : 'My Farm', color: 'text-primary-500 bg-primary-500/10' },
                    { href: '/dashboard?tab=market', icon: ShoppingBag, label: language === 'ta' ? 'சந்தை' : 'Market', color: 'text-emerald-500 bg-emerald-500/10' },
                    { href: '/dashboard?tab=buysell', icon: Package, label: language === 'ta' ? 'முன்பதிவு' : 'Pre-Book', color: 'text-indigo-500 bg-indigo-500/10' },
                    { href: '/dashboard?tab=assistant', icon: Bot, label: language === 'ta' ? 'AI' : 'AI Chat', color: 'text-purple-500 bg-purple-500/10' },
                    { href: '/dashboard?tab=more', icon: Users, label: language === 'ta' ? 'இதர' : 'More', color: 'text-amber-500 bg-amber-500/10' },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/30 hover:border-primary-500/20 hover:shadow-xs transition-all no-underline cursor-pointer group"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black text-foreground text-center leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>

                {/* Mandi Price + Weather strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mandi Price Row */}
                  <Link
                    href="/dashboard?tab=market"
                    className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/30 hover:border-primary-500/20 transition-all no-underline flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-earth-450 block">
                        {language === 'ta' ? 'இன்றைய சந்தை விலை' : "Today's Mandi Price"}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {marketPrices.slice(0, 2).map((p, i) => (
                          <span key={i} className="text-xs font-black text-foreground">
                            {p.cropName} <span className="text-primary-600 dark:text-primary-400 font-mono">₹{p.modalPrice}/kg</span>
                          </span>
                        ))}
                        {marketPrices.length === 0 && (
                          <span className="text-xs text-earth-400 font-semibold">
                            {language === 'ta' ? 'விலை கிடைக்கவில்லை' : 'Tap to view live prices'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-primary-500 shrink-0">→</span>
                  </Link>

                  {/* Weather Strip */}
                  <Link
                    href="/dashboard?tab=weather"
                    className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-amber-500/20 hover:border-amber-500/40 transition-all no-underline flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CloudSun className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                        {language === 'ta' ? 'வானிலை' : 'Weather'}
                      </span>
                      <p className="text-xs text-earth-500 dark:text-earth-400 mt-0.5 font-semibold leading-tight">
                        {language === 'ta'
                          ? 'இன்று லேசான மழை சாத்தியம்.'
                          : 'Light showers expected today.'}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-amber-500 shrink-0">→</span>
                  </Link>
                </div>

                {/* Call Support (always visible, tap-to-call) */}
                <a
                  href="tel:18001801551"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/20 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all no-underline group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black text-foreground block">
                      {language === 'ta' ? 'உதவிக்கு அழைக்க — 1800-180-1551' : 'Call Support — 1800-180-1551 (Toll-Free)'}
                    </span>
                    <span className="text-[10px] text-earth-400 font-semibold">
                      {language === 'ta' ? 'கட்டணமில்லாத கிசான் உதவி மையம்' : 'Kisan Help Centre, free 24×7'}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-primary-500 shrink-0">
                    {language === 'ta' ? 'அழை →' : 'Call →'}
                  </span>
                </a>

                {/* Context-Aware Next Action CTA */}
                {(() => {
                  const pendingOrders = orders.filter(o => o.status === 'pending');
                  if (pendingOrders.length > 0) {
                    return (
                      <Link
                        href="/dashboard?tab=prebookings"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 hover:bg-amber-500/10 transition-all no-underline group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-black text-foreground block">
                            {language === 'ta'
                              ? `${pendingOrders.length} booking நிலுவையில் உள்ளது — நடவடிக்கை தேவை`
                              : `${pendingOrders.length} booking${pendingOrders.length > 1 ? 's' : ''} pending — action needed`}
                          </span>
                          <span className="text-[10px] text-earth-400 font-semibold">
                            {language === 'ta' ? 'இப்போது confirm அல்லது reject செய்யுங்கள்.' : 'Accept or reject incoming pre-booking requests.'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-amber-500 shrink-0">→</span>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      href="/dashboard?tab=buysell&sub=prebooking"
                      className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 hover:bg-indigo-500/8 transition-all no-underline group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-black text-foreground block">
                          {language === 'ta'
                            ? 'அறுவடைக்கு முன்னாடி Pre-booking offer உருவாக்குங்கள்'
                            : 'Create a Pre-Booking offer for your upcoming harvest'}
                        </span>
                        <span className="text-[10px] text-earth-400 font-semibold">
                          {language === 'ta' ? 'Price lock + 10% advance இப்போதே பெறுங்கள்.' : 'Lock your price early and secure a 10% advance.'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-indigo-500 shrink-0">→</span>
                    </Link>
                  );
                })()}

                {/* Nearby Harvests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-foreground">
                        {language === 'ta' ? 'அருகிலுள்ள அறுவடைகள்' : 'Nearby Upcoming Harvests'}
                      </h2>
                      <p className="text-[10px] text-earth-400 mt-0.5">
                        {language === 'ta' ? 'உங்களுக்கு அருகில் பதிவு செய்யப்பட்ட பயிர்கள்' : 'Discover upcoming crop listings from local farms.'}
                      </p>
                    </div>
                    <Link href="/dashboard?tab=market" className="text-[11px] font-black text-primary-500 hover:underline shrink-0">
                      {language === 'ta' ? 'அனைத்தையும் பார்' : 'View Market →'}
                    </Link>
                  </div>

                  {products.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-[#111714] rounded-2xl border border-earth-150 text-earth-450 text-xs font-semibold">
                      {language === 'ta' ? 'பயிர்கள் எதுவும் கிடைக்கவில்லை.' : 'No crop listings found.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/30 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                {prod.category}
                              </span>
                              <span className="text-[10px] text-earth-400 font-bold font-mono">
                                {prod.village || 'Madurai East'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-foreground">{prod.name}</h4>
                              <p className="text-[10px] text-earth-400 mt-0.5">
                                {language === 'ta' ? 'விவசாயி' : 'Farmer'}: {prod.farmerName || 'Ramanathan'}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Available</span>
                                <span className="font-bold text-foreground">{prod.stockKg} {t('kg_unit')}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Harvest ETA</span>
                                <span className="font-bold text-foreground">10-Aug-2026</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3 border-t border-earth-100 dark:border-earth-900/20 flex items-center justify-between">
                            <span className="text-sm font-black text-primary-600 dark:text-primary-400 font-mono">
                              ₹{prod.pricePerKg} <span className="text-[10px] text-earth-400 font-normal">/kg</span>
                            </span>
                            <button
                              onClick={() => {
                                setSelectedProdForOrder(prod);
                                setIsOrderModalOpen(true);
                              }}
                              className="h-7 px-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-bold text-[10px] shrink-0 cursor-pointer shadow-xs border-0"
                            >
                              {language === 'ta' ? 'முன்பதிவு' : 'Pre-book'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

            {/* ========================================================================= */}
            {/* 4. PRE-BOOKINGS TAB */}
            {/* ========================================================================= */}
            {activeTab === 'prebookings' && (
              <div className="space-y-6 animate-fade-in text-foreground">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{language === 'ta' ? 'என் முன்பதிவுகள் & பேமெண்ட்' : 'My Bookings & Payments'}</h1>
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                    {language === 'ta'
                      ? 'உங்கள் booking ஒப்பந்தங்கள் மற்றும் secure payment நிலவரம் — வாங்குபவர் delivery confirm செய்யும் வரை payment பாதுகாப்பாக hold ஆகும்.'
                      : 'Track your crop booking contracts and secure payment status — payment is safely held until the agreed delivery is confirmed.'}
                  </p>
                </div>

                {(() => {
                  const filtered = orders.filter(
                    o => activeRole === 'farmer' ? o.farmerId === user?.id : o.buyerId === user?.id
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] text-earth-450 text-xs font-bold">
                        {language === 'ta' ? 'முன்பதிவுகள் எதுவும் இல்லை.' : 'No pre-booking contracts found.'}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filtered.map((ord) => {
                        const escrowAmt = Math.round(ord.totalPrice * 0.1);
                        return (
                          <div
                            key={ord.id}
                            className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] shadow-xs flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-earth-400 uppercase tracking-widest">
                                {ord.id}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                ord.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : ord.status === 'accepted'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : ord.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                {ord.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-base font-black text-foreground">{ord.productName}</h4>
                              <p className="text-xs text-earth-500 dark:text-earth-400">
                                {activeRole === 'farmer' ? `Buyer: ${ord.buyerName}` : `Farmer Partner`}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-earth-100 dark:border-earth-900/10">
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Quantity</span>
                                <span className="font-bold text-foreground">{ord.quantity} kg</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Advance Secured (10%)</span>
                                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">₹{escrowAmt}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Total Value</span>
                                <span className="font-mono font-bold text-foreground">₹{ord.totalPrice}</span>
                              </div>
                            </div>

                            {activeRole === 'farmer' && (
                              <div className="flex items-center gap-2 pt-2">
                                {ord.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => confirmOrder(ord.id)}
                                      className="flex-1 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-xs"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => cancelOrder(ord.id)}
                                      className="flex-1 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-xs cursor-pointer border-0"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {ord.status === 'accepted' && (
                                  <>
                                    <button
                                      onClick={() => completeOrder(ord.id)}
                                      className="flex-1 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer border-0 shadow-xs"
                                    >
                                      Handover & Complete
                                    </button>
                                    <button
                                      onClick={() => cancelOrder(ord.id)}
                                      className="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-xs cursor-pointer border-0"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {activeRole === 'buyer' && ord.status === 'pending' && (
                              <button
                                onClick={() => cancelOrder(ord.id)}
                                className="w-full h-9 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-xs cursor-pointer border-0"
                              >
                                Cancel Pre-booking
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. ORDERS TAB */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in text-foreground">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{language === 'ta' ? 'ஆர்டர்கள் & கண்காணிப்பு' : 'Purchase Orders & Tracking'}</h1>
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                    {language === 'ta' ? 'அறுவடைக்கு பிந்தைய விநியோகக் கண்காணிப்பு.' : 'Post-harvest dispatch tracking and logistics status updates.'}
                  </p>
                </div>

                {(() => {
                  const filtered = orders.filter(
                    o => activeRole === 'farmer' ? o.farmerId === user?.id : o.buyerId === user?.id
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] text-earth-450 text-xs font-bold">
                        {language === 'ta' ? 'ஆர்டர்கள் எதுவும் இல்லை.' : 'No orders in tracking list.'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filtered.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-5 rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-earth-400 block">{ord.id} • {ord.createdAt.slice(0,10)}</span>
                            <h4 className="text-base font-black text-foreground">{ord.productName}</h4>
                            <p className="text-xs text-earth-500 dark:text-earth-400">
                              Quantity: <span className="font-bold">{ord.quantity} kg</span> | Price: <span className="font-bold">₹{ord.totalPrice}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Simple tracking step visualizer */}
                            <div className="flex items-center gap-2 text-xs font-semibold">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                ord.status !== 'cancelled' ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'
                              }`}>1</span>
                              <span className="text-earth-500">Ordered</span>
                              <span className="w-4 border-t border-earth-200"></span>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                ord.status === 'accepted' || ord.status === 'completed' ? 'bg-primary-500 text-white' : 'bg-earth-200 text-earth-400'
                              }`}>2</span>
                              <span className={ord.status === 'accepted' || ord.status === 'completed' ? 'text-foreground' : 'text-earth-400'}>Dispatched</span>
                              <span className="w-4 border-t border-earth-200"></span>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                ord.status === 'completed' ? 'bg-primary-500 text-white' : 'bg-earth-200 text-earth-400'
                              }`}>3</span>
                              <span className={ord.status === 'completed' ? 'text-foreground' : 'text-earth-400'}>Delivered</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. WALLET TAB */}
            {/* ========================================================================= */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-fade-in text-foreground">
                <div className="p-6 rounded-3xl border border-primary-500/10 bg-gradient-to-br from-primary-500/10 to-primary-600/5 dark:from-primary-950/20 dark:to-primary-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest block">Account Balance</span>
                    <h2 className="text-3xl font-black text-foreground font-mono">₹{(wallets[activeRole] || 0).toLocaleString()}</h2>
                    <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">Ecosystem clearing account active for role: <span className="font-bold capitalize">{activeRole}</span></p>
                  </div>
                  <button className="h-10 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-xs">
                    Withdraw to Bank
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Transaction History</h3>
                  {walletTransactions.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-[#111714] rounded-3xl border border-earth-150 text-earth-450 text-xs font-semibold">
                      No transaction records found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {walletTransactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="p-4 rounded-2xl border border-earth-100 dark:border-earth-900/20 bg-white dark:bg-[#111714] flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-earth-400 block text-[9px]">{txn.id} • {txn.created_at.slice(0, 10)}</span>
                            <span className="font-bold text-foreground capitalize">{txn.transaction_type} Clearing</span>
                          </div>
                          <span className={`font-mono font-black text-sm ${txn.transaction_type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {txn.transaction_type === 'credit' ? '+' : '-'} ₹{txn.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. PROFILE TAB */}
            {/* ========================================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in text-foreground">
                <div className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-headline font-black text-2xl shrink-0">
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground">{userName || 'V-LINK Partner'}</h3>
                    <p className="text-xs text-earth-500 dark:text-earth-400">Account status: <span className="font-bold text-emerald-500">Verified Partner</span></p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] space-y-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Active Role Selector</h3>
                  <p className="text-xs text-earth-500 dark:text-earth-400">Swap workspaces instantly. RLS permissions and dashboards update in real-time.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['farmer', 'buyer', 'labor', 'vendor'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-0 cursor-pointer ${
                          activeRole === role
                            ? 'bg-primary-500 text-white shadow-md font-black'
                            : 'bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100 text-earth-500 hover:text-foreground'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
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

            {activeTab === 'translator' && (
              <TranslatorBoard />
            )}

            {['buysell', 'market', 'prebookings', 'orders'].includes(activeTab) && (
              <div className="space-y-6 animate-fade-in text-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{language === 'ta' ? 'வாங்கு / விற்று (Buy/Sell)' : 'Buy & Sell Services'}</h1>
                    <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                      {language === 'ta' ? 'விவசாய வர்த்தக சேவைகள் மற்றும் சந்தை தளம்.' : 'Grouped agricultural marketplace and trading services.'}
                    </p>
                  </div>
                </div>

                {/* Inline Sub-Tab Navigation Bar */}
                <div className="flex border-b border-earth-200 dark:border-earth-850 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
                  {[
                    { id: 'crops', label: language === 'ta' ? 'பயிர்கள் (Crops)' : 'Crops Available' },
                    { id: 'requirements', label: language === 'ta' ? 'கொள்முதல் தேவைகள்' : 'Buyer Requirements' },
                    { id: 'prebookings', label: language === 'ta' ? 'முன்பதிவுகள்' : 'Pre-Bookings' },
                    { id: 'orders', label: language === 'ta' ? 'ஆர்டர்கள்' : 'Orders & Tracking' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBuySellTab(tab.id as any)}
                      className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer bg-transparent border-0 ${
                        buySellTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-black'
                          : 'border-transparent text-earth-450 hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-Tab 1: Crops Marketplace */}
                {buySellTab === 'crops' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-base font-black text-foreground">{language === 'ta' ? 'விளைபொருட்கள் சந்தை' : 'Agri-Marketplace'}</h2>
                        <p className="text-xs text-earth-450 mt-0.5">{t('agri_marketplace_desc')}</p>
                      </div>
                      <div className="flex items-center gap-3">
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
                          className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs border-0"
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

                    {/* Products Grid */}
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

                {/* Sub-Tab 2: Buyer Requirements */}
                {buySellTab === 'requirements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-black text-foreground">{language === 'ta' ? 'வாங்குபவர் தேவைகள்' : 'Buyer Requirements'}</h2>
                      <p className="text-xs text-earth-450 mt-0.5">
                        {language === 'ta'
                          ? 'நிறுவன மற்றும் மொத்த கொள்முதல் செய்யும் கார்ப்பரேட் வாங்குபவர்களின் தேவைகள்.'
                          : 'Browse active crop purchase requirements posted by verified commercial buyers.'}
                      </p>
                    </div>

                    {buyerRequirements.length === 0 ? (
                      <div className="p-12 text-center rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
                        {language === 'ta' ? 'தேவைகள் எதுவும் இல்லை.' : 'No active buyer requirements found.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {buyerRequirements.map((req) => (
                          <div
                            key={req.id}
                            className="p-5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {req.status === 'open' ? 'Open Demand' : 'Matched'}
                              </span>
                              <span className="text-[10px] text-earth-400 font-bold font-mono">
                                {req.location}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-black text-foreground">{req.crop}</h4>
                              <p className="text-xs text-earth-450 mt-0.5">Posted by: <span className="font-bold text-foreground">{req.buyerName}</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-earth-100 dark:border-earth-900/10">
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Required Volume</span>
                                <span className="font-bold text-foreground">{req.quantity} kg</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-earth-400 uppercase block">Required Date</span>
                                <span className="font-bold text-foreground">{req.requiredDate}</span>
                              </div>
                            </div>

                            {req.status === 'open' ? (
                              <button
                                onClick={() => matchBuyerRequirement(req.id)}
                                className="w-full h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-xs transition-all"
                              >
                                {language === 'ta' ? 'ஒப்பந்தம் செய்' : 'Supply Crop / Match Demand'}
                              </button>
                            ) : (
                              <div className="h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-black">
                                Match Completed ✅
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 3: Pre-Bookings */}
                {buySellTab === 'prebookings' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-black text-foreground">{language === 'ta' ? 'அறுவடைக்கு முந்தைய முன்பதிவுகள்' : 'My Bookings & Payments'}</h2>
                      <p className="text-xs text-earth-450 mt-0.5">
                        {language === 'ta'
                          ? 'உங்கள் முன்பதிவு ஒப்பந்தங்கள் மற்றும் பாதுகாப்பான பேமெண்ட் நிலவரம்.'
                          : 'Track active crop booking contracts and secure payments.'}
                      </p>
                    </div>

                    {/* Reuse the prebookings content block */}
                    {(() => {
                      const filtered = orders.filter(
                        o => activeRole === 'farmer' ? o.farmerId === user?.id : o.buyerId === user?.id
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] text-earth-450 text-xs font-bold">
                            {language === 'ta' ? 'முன்பதிவுகள் எதுவும் இல்லை.' : 'No pre-booking contracts found.'}
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filtered.map((ord) => {
                            const escrowAmt = Math.round(ord.totalPrice * 0.1);
                            return (
                              <div
                                key={ord.id}
                                className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] shadow-xs flex flex-col justify-between space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-earth-400 uppercase tracking-widest">
                                    {ord.id}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    ord.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      : ord.status === 'accepted'
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                      : ord.status === 'completed'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-sm font-black text-foreground">{ord.productName}</h4>
                                  <p className="text-xs text-earth-500 dark:text-earth-400">
                                    {activeRole === 'farmer' ? `Buyer: ${ord.buyerName}` : `Farmer Partner`}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-earth-100 dark:border-earth-900/10">
                                  <div>
                                    <span className="text-[9px] font-bold text-earth-400 uppercase block">Quantity</span>
                                    <span className="font-bold text-foreground">{ord.quantity} kg</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-bold text-earth-400 uppercase block">Advance Secured (10%)</span>
                                    <span className="font-mono font-black text-primary-600 dark:text-primary-400">₹{escrowAmt}</span>
                                  </div>
                                </div>

                                {activeRole === 'farmer' && ord.status === 'pending' && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => confirmOrder(ord.id)}
                                      className="flex-1 h-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-[11px] cursor-pointer border-0 shadow-xs"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => cancelOrder(ord.id)}
                                      className="flex-1 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 font-bold text-[11px] cursor-pointer border-0"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Sub-Tab 4: Orders */}
                {buySellTab === 'orders' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="text-base font-black text-foreground">{language === 'ta' ? 'ஆர்டர்கள் கண்காணிப்பு' : 'Purchase Orders & Tracking'}</h2>
                      <p className="text-xs text-earth-450 mt-0.5">
                        {language === 'ta'
                          ? 'அறுவடைக்கு பிந்தைய விநியோகக் கண்காணிப்பு மற்றும் லாஜிஸ்டிக்ஸ்.'
                          : 'Track post-harvest dispatch status, packaging, and logistics progress.'}
                      </p>
                    </div>

                    {(() => {
                      const filtered = orders.filter(
                        o => activeRole === 'farmer' ? o.farmerId === user?.id : o.buyerId === user?.id
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] text-earth-450 text-xs font-bold">
                            {language === 'ta' ? 'ஆர்டர்கள் எதுவும் இல்லை.' : 'No orders in tracking list.'}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {filtered.map((ord) => (
                            <div
                              key={ord.id}
                              className="p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold text-earth-400 block">{ord.id} • {ord.createdAt.slice(0,10)}</span>
                                <h4 className="text-sm font-black text-foreground">{ord.productName}</h4>
                                <p className="text-xs text-earth-500 dark:text-earth-400">
                                  Quantity: <span className="font-bold">{ord.quantity} kg</span> | Price: <span className="font-bold">₹{ord.totalPrice}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Compact Other Agriculture Services links row */}
                <div className="pt-4 border-t border-earth-200 dark:border-earth-850">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-earth-450 mb-3">
                    {language === 'ta' ? 'விவசாய துணைச் சேவைகள்' : 'Other Agriculture Services'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/dashboard?tab=rentals"
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/30 hover:border-primary-500/30 hover:shadow-xs transition-all flex items-center justify-between no-underline group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{language === 'ta' ? 'இயந்திர வாடகை' : 'Equipment Rental'}</span>
                      </div>
                      <span className="text-xs text-earth-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=labor"
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/30 hover:border-primary-500/30 hover:shadow-xs transition-all flex items-center justify-between no-underline group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{language === 'ta' ? 'வேலைவாய்ப்பு' : 'Labour Exchange'}</span>
                      </div>
                      <span className="text-xs text-earth-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* More Services Mobile & Desktop Dashboard */}
            {activeTab === 'more' && (
              <div className="space-y-8 animate-fade-in text-foreground">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{language === 'ta' ? 'இதர சேவைகள் (Other Services)' : 'Other Services'}</h1>
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                    {language === 'ta' ? 'கூடுதல் விவரங்கள் மற்றும் உதவிக்கான சேவைகள்.' : 'Access support, government schemes, weather details, and wallet.'}
                  </p>
                </div>

                {/* 1. Market & Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-earth-450">
                    {language === 'ta' ? 'சந்தை & வானிலை தகவல்' : 'Market & Information'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard?tab=market"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'மண்டி விலைகள்' : 'Mandi Prices'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'அரசு அக்மார்க்நெட் விலைகள்' : 'Agmarknet wholesale market rates'}</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard?tab=weather"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'வானிலை' : 'Weather'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'வானிலை முன்னறிவிப்பு' : 'Live weather forecasts'}</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 2. Agriculture Services */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-earth-450">
                    {language === 'ta' ? 'விவசாய சேவைகள்' : 'Agriculture Services'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard?tab=labor"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'வேலைவாய்ப்பு' : 'Labour Exchange'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'விவசாய வேலை வாய்ப்புகள்' : 'Seasonal workforce exchange'}</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard?tab=rentals"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'இயந்திர வாடகை' : 'Equipment Rental'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'விவசாயக் குத்தகைகள்' : 'Rent tractors & farm equipment'}</p>
                      </div>
                    </Link>

                    {/* Cold Storage Placeholder */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 opacity-85 flex items-center gap-4 text-foreground">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Snowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{t('cold_storage_title')}</h4>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-bold">{t('cold_storage_status')}</p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard?tab=schemes"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'அரசு திட்டங்கள்' : 'Gov Schemes'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'மானியங்கள் & உதவித்தொகை' : 'Check active subsidies & apply'}</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 3. Orders & Payments */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-earth-450">
                    {language === 'ta' ? 'ஆர்டர்கள் & கொடுப்பனவுகள்' : 'Orders & Payments'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard?tab=orders"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'ஆர்டர்கள்' : 'Orders'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'விற்பனை & கண்காணிப்பு' : 'Post-harvest dispatch tracking'}</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard?tab=prebookings"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'என் ஒப்பந்தங்கள் & எஸ்க்ரோ' : 'My Pre-Bookings & Escrow'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'முன்பதிவு ஒப்பந்தங்கள் மற்றும் எஸ்க்ரோ' : 'Track contracts & escrow balance'}</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard?tab=wallet"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'பணப்பை' : 'Wallet'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'நிலுவைத்தொகை & பரிவர்த்தனை' : 'Manage bank payouts & balance'}</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 4. Support & Account */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-earth-450">
                    {language === 'ta' ? 'ஆதரவு & கணக்கு' : 'Support & Account'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard?tab=support"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Headset className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'உதவி மையம்' : 'Support'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'அழைப்பு & உதவி' : 'Speak with rural advisors'}</p>
                      </div>
                    </Link>

                    {/* Quick Call Action under More */}
                    <a
                      href="tel:18001801551"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'உதவிக்கு அழைக்க' : 'Call Support'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">1800-180-1551 (Toll-Free)</p>
                      </div>
                    </a>

                    <Link
                      href="/dashboard?tab=profile"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'சுயவிவரம்' : 'Profile'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'கணக்கு அமைப்புகள்' : 'Operator credentials & roles'}</p>
                      </div>
                    </Link>

                    {/* Admin Console (Visible only to admins) */}
                    {activeRole === 'admin' && (
                      <Link
                        href="/dashboard?tab=admin"
                        className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black">{t('admin_tab') || 'Admin Console'}</h4>
                          <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'அட்மின் கட்டுப்பாட்டு பணியகம்' : 'Admin Operations Console'}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>

                {/* 5. Tools */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-earth-450">
                    {language === 'ta' ? 'கருவிகள்' : 'Tools'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard?tab=translator"
                      className="p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 hover:border-primary-500/40 hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex items-center gap-4 text-foreground group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Languages className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{language === 'ta' ? 'AI மொழிபெயர்ப்பு' : 'AI Translator'}</h4>
                        <p className="text-[10px] text-earth-550 dark:text-earth-400 mt-0.5">{language === 'ta' ? 'அகில உலக மொழிபெயர்ப்பாளர்' : 'Universal real-time translator'}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
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
        <BottomNav />
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
