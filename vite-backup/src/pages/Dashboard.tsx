import React, { useState, useEffect } from 'react';
import { useApp, Role, BuyerType, Product, Order, DeliveryJob, LaborJob } from '@/context/AppContext';
import { 
  Leaf, 
  CloudRain, 
  Volume2, 
  VolumeX, 
  Plus, 
  MapPin, 
  Play, 
  ClipboardCheck, 
  Briefcase, 
  Database, 
  CheckCircle, 
  IndianRupee, 
  Camera, 
  Sparkles, 
  Search, 
  Globe, 
  Smartphone, 
  Laptop, 
  ChevronRight, 
  Info, 
  Wifi, 
  Sun, 
  Moon,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  User,
  X,
  CreditCard,
  PhoneCall,
  Lock,
  Send,
  Loader2,
  Truck
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import SakthiFloat from '@/components/SakthiFloat';

export default function Dashboard() {
  const { 
    activeRole, 
    setActiveRole,
    buyerType,
    setBuyerType,
    wallets, 
    products, 
    orders, 
    deliveryJobs, 
    laborJobs,
    walletTransactions,
    addProduct,
    placeOrder,
    acceptDeliveryJob,
    completeDelivery,
    createLaborJob,
    applyForLaborJob,
    hireLaborWorker,
    language,
    setLanguage,
    isVisualMode,
    t,
    logout,
    user,
    userName
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'home';

  // Modal and state flags
  const [showAddProduce, setShowAddProduce] = useState(false);
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [orderQty, setOrderQty] = useState(100);
  const [dropAddress, setDropAddress] = useState('Vasanth Nagar, Madurai, TN');

  // Scanner simulation
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStep, setScannerStep] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [scanResult, setScanResult] = useState<string>('');

  // AI assistant chat simulation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: "Hello! Welcome to V-LINK Sakthi AI. How can I assist you with your crops or market prices today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Vegetables');
  const [newProdPrice, setNewProdPrice] = useState(30);
  const [newProdStock, setNewProdStock] = useState(500);
  const [newProdLocation, setNewProdLocation] = useState('Madurai East, TN');

  const [newLaborTitle, setNewLaborTitle] = useState('');
  const [newLaborWage, setNewLaborWage] = useState(450);
  const [newLaborLocation, setNewLaborLocation] = useState('Madurai East, TN');
  const [newLaborDesc, setNewLaborDesc] = useState('');

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Ticket support state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Handle Add Product Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdLocation) return;
    
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
      pricePerKg: newProdPrice,
      stockKg: newProdStock,
      location: newProdLocation,
      image: defaultImg,
      targetChannel: 'b2c'
    });

    setNewProdName('');
    setShowAddProduce(false);
  };

  // Handle Add Labor Job Submit
  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaborTitle || !newLaborLocation) return;

    createLaborJob({
      title: newLaborTitle,
      wages: newLaborWage,
      location: newLaborLocation,
      date: new Date().toISOString().split('T')[0],
      duration: '3 Days',
      description: newLaborDesc
    });

    setNewLaborTitle('');
    setNewLaborDesc('');
    setShowAddLabor(false);
  };

  // Trigger Scanner Simulation
  const triggerScan = () => {
    setScannerStep('scanning');
    setTimeout(() => {
      setScannerStep('result');
      const results = [
        "Early Blight detected. Recommendation: Apply copper fungicide and prune lower leaves.",
        "Late Blight detected. Recommendation: Apply chlorothalonil immediately and clear water logged areas.",
        "Healthy Crop leaf: No pathogens detected. Telemetry moisture is 42%.",
        "Leaf Spot detected: Apply organic Neem oil spray weekly."
      ];
      setScanResult(results[Math.floor(Math.random() * results.length)]);
    }, 2500);
  };

  // AI assistant chat query submission
  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let reply = "I recorded your query. Cross referencing local weather stations and mandi pricing tables...";
      const lower = userText.toLowerCase();
      if (lower.includes('weather') || lower.includes('rain') || lower.includes('மழை')) {
        reply = "Weather Alert: Heavy rain forecast in 24 hours. Ensure drainage trenches are clear of debris in crop plots.";
      } else if (lower.includes('tomato') || lower.includes('தக்காளி') || lower.includes('price')) {
        reply = "Mandi price for Organic Tomatoes today is ₹32/kg (Direct V-LINK rate). It is ₹8 higher than the local middleman mandi rate. Highly recommended to sell today.";
      } else if (lower.includes('subsidy') || lower.includes('மானியம்')) {
        reply = "Subsidized seeds are available at the Madurai East Cooperative Society. Government is providing 50% discount on paddy seeds.";
      }
      setChatMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 1200);
  };

  // Place Order Submit
  const handlePlaceOrder = () => {
    if (!selectedProduct) return;
    placeOrder(selectedProduct.id, orderQty, buyerType === 'hotel' ? 'Gourmet Grand Hotel' : 'Raza Grocers', dropAddress);
    setShowPurchaseModal(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafbfa] dark:bg-[#090b0a] text-foreground dark:text-[#f2f4f3] transition-colors duration-200">
      
      {/* 4-Tab Sidebar Layout */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Global Navbar */}
        <Navbar />

        {/* Dynamic content wrapper based on activeTab */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
          <div className="max-w-6xl mx-auto w-full animate-fade-in space-y-6">

            {/* Weather alert banner at the very top of Home tab */}
            {activeTab === 'home' && (
              <div className="p-4 rounded-3xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 text-amber-800 dark:text-amber-400 text-xs font-semibold shadow-sm animate-pulse-subtle">
                <CloudRain className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 font-black block">Agricultural Weather Advisory Alert</span>
                  <p className="mt-0.5 leading-normal">{t('weather_bulletin')}</p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. HOME TAB */}
            {/* ========================================================================= */}
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Columns (Col Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Hero Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4.5 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/10 shadow-xs">
                      <span className="text-[10px] text-earth-500 uppercase tracking-widest font-black block">Secure Wallet</span>
                      <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">₹{wallets[activeRole]?.toLocaleString('en-IN')}</h3>
                      <span className="text-[9px] text-earth-400 block mt-0.5 font-bold">Daily settlements ready</span>
                    </div>
                    <div className="p-4.5 rounded-3xl bg-blue-500/10 dark:bg-blue-950/20 border border-blue-500/10 shadow-xs">
                      <span className="text-[10px] text-earth-500 uppercase tracking-widest font-black block">Active listings</span>
                      <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{products.length} Items</h3>
                      <span className="text-[9px] text-earth-400 block mt-0.5 font-bold">Regional farms catalog</span>
                    </div>
                    <div className="p-4.5 rounded-3xl bg-stone-500/10 dark:bg-stone-950/20 border border-stone-500/10 shadow-xs col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-earth-500 uppercase tracking-widest font-black block">Contracts pending</span>
                      <h3 className="text-2xl font-black text-stone-700 dark:text-stone-300 mt-1 font-mono">{orders.filter(o => o.status !== 'delivered').length} Active</h3>
                      <span className="text-[9px] text-earth-400 block mt-0.5 font-bold">Escrow cleared on drop</span>
                    </div>
                  </div>

                  {/* Weather Widget Card */}
                  <div className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm flex flex-col sm:flex-row gap-5 justify-between">
                    <div className="flex gap-4">
                      <div className="p-4 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center shrink-0 h-fit">
                        <CloudRain className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">Meteorology Bulletin</h4>
                        <h3 className="text-base font-black text-foreground mt-0.5">{t('weather_title')}</h3>
                        <p className="text-xs text-earth-500 mt-2 leading-relaxed">
                          Rainfall probability is high. We advise farmers harvesting tomatoes or leafy vegetables to ensure rapid drainage channels are clear of blockage to avoid waterlogged root decimation.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5 border-t sm:border-t-0 sm:border-l border-earth-100 dark:border-earth-900/40 pt-4 sm:pt-0 sm:pl-5 justify-around shrink-0 text-center items-center">
                      <div>
                        <span className="text-[10px] text-earth-400 block font-bold">{t('weather_temp')}</span>
                        <span className="text-lg font-black text-foreground">29°C</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-earth-400 block font-bold">{t('weather_hum')}</span>
                        <span className="text-lg font-black text-foreground">82%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-earth-400 block font-bold">{t('weather_rain')}</span>
                        <span className="text-lg font-black text-primary-500">90%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Mandi Benchmark rate comparison */}
                  <div className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">Mandi Benchmarks</h4>
                        <h3 className="text-sm font-black text-foreground">{t('mandi_benchmarks')}</h3>
                      </div>
                      <span className="text-[9px] bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">LIVE GOVERNMENT API</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-earth-600 dark:text-earth-400">
                        <thead className="text-[10px] uppercase text-earth-400 tracking-wider border-b border-earth-150 dark:border-earth-900/40">
                          <tr>
                            <th className="py-2.5 font-bold">Crop</th>
                            <th className="py-2.5 font-bold">Gov Mandi Rate</th>
                            <th className="py-2.5 font-bold">V-LINK Direct Rate</th>
                            <th className="py-2.5 font-bold text-right">Commission Saved</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold divide-y divide-earth-100 dark:divide-earth-900/20">
                          <tr className="hover:bg-earth-50/20">
                            <td className="py-3 text-foreground font-black">Organic Tomatoes</td>
                            <td className="py-3">₹24 / kg</td>
                            <td className="py-3 text-emerald-600 dark:text-emerald-400">₹32 / kg</td>
                            <td className="py-3 text-primary-600 text-right font-black bg-primary-500/5 px-2 rounded-xl">₹8.00 saved (+33%)</td>
                          </tr>
                          <tr className="hover:bg-earth-50/20">
                            <td className="py-3 text-foreground font-black">Premium Red Onions</td>
                            <td className="py-3">₹20 / kg</td>
                            <td className="py-3 text-emerald-600 dark:text-emerald-400">₹28 / kg</td>
                            <td className="py-3 text-primary-600 text-right font-black bg-primary-500/5 px-2 rounded-xl">₹8.00 saved (+40%)</td>
                          </tr>
                          <tr className="hover:bg-earth-50/20">
                            <td className="py-3 text-foreground font-black">Fresh Turmeric Finger</td>
                            <td className="py-3">₹98 / kg</td>
                            <td className="py-3 text-emerald-600 dark:text-emerald-400">₹120 / kg</td>
                            <td className="py-3 text-primary-600 text-right font-black bg-primary-500/5 px-2 rounded-xl">₹22.00 saved (+22%)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Right Column: AI Assistant & Crop leaf scanner */}
                <div className="space-y-6">

                  {/* Market demand insight card */}
                  <div className="p-5 rounded-3xl border border-primary-500/20 bg-emerald-500/5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Market Intelligence</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-earth-100 dark:border-earth-900/30">
                        <span className="font-bold text-foreground">Tomatoes Sourcing Demand</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white animate-pulse">HIGH</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-earth-100 dark:border-earth-900/30">
                        <span className="font-bold text-foreground">Onions Sourcing Demand</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">MEDIUM</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-earth-500 font-bold mt-2">
                        Recommendation: <strong>SELL TODAY</strong>. Direct trade premiums for organic tomatoes are currently at their seasonal peak.
                      </p>
                    </div>
                  </div>

                  {/* Leaf Scan Card */}
                  <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider">AI Diagnostics</h4>
                        <h3 className="text-xs font-black text-foreground">Crop Disease Leaf Scanner</h3>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-earth-500 font-semibold">
                      Use the scanner to detect blight or rot. Point the camera at crop foliage for instant neural classification.
                    </p>

                    <button
                      onClick={() => {
                        setShowScanner(true);
                        setScannerStep('idle');
                      }}
                      className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border-0"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Crop Foliage</span>
                    </button>
                  </div>

                  {/* AI Assistant Chat Console Widget */}
                  <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-earth-100 dark:border-earth-900/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-black uppercase text-foreground">{t('sakthi_welcome')}</h4>
                      </div>
                      <span className="text-[8px] font-mono text-primary-500 font-bold uppercase">Sakthi v1.2</span>
                    </div>

                    <div className="h-44 overflow-y-auto space-y-2 p-2 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl border border-earth-150/40">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-2.5 rounded-2xl max-w-[85%] text-[10px] font-semibold leading-normal ${
                            msg.sender === 'user' 
                              ? 'bg-primary-500 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-earth-900 text-foreground rounded-tl-none border border-earth-200 dark:border-earth-800'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {aiTyping && (
                        <div className="flex justify-start">
                          <div className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-400 flex items-center gap-1 text-[10px]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sakthi is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleChatSend} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type question (e.g. Tomato price)..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        className="flex-1 h-9 px-3 bg-earth-50/30 dark:bg-earth-950/30 border border-earth-200 dark:border-earth-800 rounded-xl text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                      />
                      <button
                        type="submit"
                        className="w-9 h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer border-0 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. MARKET TAB */}
            {/* ========================================================================= */}
            {activeTab === 'market' && (
              <div className="space-y-6">
                
                {/* Search & Filter Header */}
                <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search crop yields..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center justify-end">
                    
                    {/* Category Filter */}
                    <div className="flex gap-1.5 p-1 bg-earth-50 dark:bg-[#090b0a] border border-earth-200 dark:border-earth-800 rounded-xl">
                      {['all', 'Vegetables', 'Fruits', 'Grains', 'Spices'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer border-0 uppercase ${
                            categoryFilter === cat
                              ? 'bg-primary-500 text-white'
                              : 'text-earth-500 dark:text-earth-400 hover:text-foreground bg-transparent'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Add Product Button (Farmer Mode) */}
                    {activeRole === 'farmer' && (
                      <button
                        onClick={() => setShowAddProduce(true)}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-black cursor-pointer border-0 shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>List Crop</span>
                      </button>
                    )}

                  </div>
                </div>

                {/* Crop products listing grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => {
                      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
                      return matchSearch && matchCat;
                    })
                    .map((prod) => (
                      <div key={prod.id} className="rounded-3xl border border-earth-200 dark:border-[#232a26] bg-white dark:bg-[#141816] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="h-44 relative bg-earth-100 dark:bg-earth-900/40 shrink-0 overflow-hidden">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/90 text-primary-700 rounded-full shadow-sm">
                            {prod.category}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-sm font-black text-foreground">{prod.name}</h4>
                              <span className="text-[10px] text-earth-500 font-mono font-bold">Qty: {prod.stockKg} kg</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-earth-400 mt-2 font-bold">
                              <MapPin className="w-3.5 h-3.5 text-earth-400" />
                              <span>{prod.location}</span>
                            </div>
                            <span className="text-[10px] text-earth-400 block mt-1">Supplier: {prod.farmerName}</span>
                          </div>

                          <div className="pt-4 border-t border-earth-100 dark:border-earth-900/30 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8px] text-earth-400 block uppercase font-mono">V-LINK Rate</span>
                              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{prod.pricePerKg} <span className="text-[9px] font-normal text-earth-400">/ kg</span></span>
                            </div>
                            
                            {activeRole === 'buyer' ? (
                              <button
                                onClick={() => {
                                  setSelectedProduct(prod);
                                  setOrderQty(Math.min(100, prod.stockKg));
                                  setShowPurchaseModal(true);
                                }}
                                disabled={prod.stockKg <= 0}
                                className={`py-2 px-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-[10px] font-black cursor-pointer border-0 shadow-xs flex items-center gap-1 ${
                                  prod.stockKg <= 0 ? 'bg-earth-200 text-earth-400 cursor-not-allowed' : ''
                                }`}
                              >
                                <span>Buy Crop</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[9px] bg-earth-50 dark:bg-earth-900 text-earth-500 px-2.5 py-1 rounded-full font-bold">
                                {prod.farmerId === user?.id ? 'Your Listing' : 'View Only'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Orders tracking list / B2B agreements ledger */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Escrow Agreements Ledger</h3>
                    <p className="text-xs text-earth-400 mt-0.5">V-LINK clears escrow funds to farmers & delivery drivers automatically upon delivery confirmation.</p>
                  </div>

                  <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-earth-600 dark:text-earth-400">
                        <thead className="text-[9px] uppercase text-earth-400 tracking-wider border-b border-earth-150 dark:border-earth-900/40">
                          <tr>
                            <th className="py-3 px-4 font-bold">Agreement ID</th>
                            <th className="py-3 px-4 font-bold">Crop Yield</th>
                            <th className="py-3 px-4 font-bold">Quantity</th>
                            <th className="py-3 px-4 font-bold">Valuation</th>
                            <th className="py-3 px-4 font-bold">Fulfillment Status</th>
                            <th className="py-3 px-4 font-bold text-right">Escrow Release</th>
                          </tr>
                        </thead>
                        <tbody className="font-semibold divide-y divide-earth-100 dark:divide-earth-900/20">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-earth-50/20">
                              <td className="py-3 px-4 text-foreground font-mono font-black">{ord.id}</td>
                              <td className="py-3 px-4 text-foreground font-black">{ord.productName}</td>
                              <td className="py-3 px-4">{ord.quantity} kg</td>
                              <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-black">₹{ord.totalPrice}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  ord.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  ord.status === 'accepted' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                  ord.status === 'in_transit' ? 'bg-amber-500 text-white animate-bounce' :
                                  'bg-emerald-600 text-white'
                                }`}>
                                  {ord.status === 'pending' ? 'Escrow Locked' :
                                   ord.status === 'accepted' ? 'Driver Assigned' :
                                   ord.status === 'in_transit' ? 'In Transit' :
                                   'Settled & Released'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {ord.status === 'delivered' ? (
                                  <span className="text-emerald-600 text-[10px] font-black flex items-center justify-end gap-1"><CheckCircle className="w-3.5 h-3.5" /> 100% Cleared</span>
                                ) : (
                                  <span className="text-earth-450 text-[10px] font-mono flex items-center justify-end gap-1"><Lock className="w-3 h-3" /> Locked in Vault</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. SERVICES TAB */}
            {/* ========================================================================= */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* 3a. Delivery logistics portal */}
                <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-800 to-amber-600 text-white shadow-md relative overflow-hidden flex justify-between items-center gap-4">
                    <div className="z-10">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-700/60 px-2 py-0.5 rounded">Logistics portal</span>
                      <h2 className="text-base font-black mt-1">Local Dispatch Board</h2>
                      <p className="text-[10px] text-amber-100 mt-0.5 leading-relaxed">Drivers fulfill dispatch routes to earn payouts instantly to their wallet.</p>
                    </div>
                    <Truck className="w-16 h-16 text-white/10 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Open delivery jobs dispatcher board */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Available Logistics Routes</h3>
                    
                    <div className="space-y-3">
                      {deliveryJobs.filter(j => j.status === 'available').length === 0 ? (
                        <div className="p-8 rounded-3xl border border-dashed border-earth-200 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]/30">
                          No open dispatch routes. Check back when buyers place orders.
                        </div>
                      ) : (
                        deliveryJobs.filter(j => j.status === 'available').map((job) => (
                          <div key={job.id} className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-amber-500/10 text-amber-600 rounded-full uppercase tracking-wider">Route Dispatch</span>
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Payout: ₹{job.wage}</span>
                              </div>
                              <h4 className="font-black text-xs text-foreground mt-2">Load: {job.quantity}kg of {job.productName}</h4>
                              <p className="text-[10px] text-earth-500 mt-1">Pickup: {job.pickupLocation}</p>
                              <p className="text-[10px] text-earth-500 mt-0.5">Dropoff: {job.deliveryLocation}</p>
                            </div>
                            
                            <button
                              onClick={() => acceptDeliveryJob(job.id, userName)}
                              disabled={activeRole !== 'delivery'}
                              className={`w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-[10px] font-black cursor-pointer border-0 shadow-xs ${
                                activeRole !== 'delivery' ? 'bg-earth-200 text-earth-400 cursor-not-allowed' : ''
                              }`}
                            >
                              {activeRole === 'delivery' ? 'Accept Dispatch Route' : 'Logistics Partner Mode Required'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active transits */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Your Active Transits</h3>
                    <div className="space-y-3">
                      {deliveryJobs.filter(j => j.status === 'assigned' && j.driverId === 'driver_1').length === 0 ? (
                        <div className="p-8 rounded-3xl border border-dashed border-earth-200 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]/30">
                          No active transits assigned. Accept a route to begin.
                        </div>
                      ) : (
                        deliveryJobs.filter(j => j.status === 'assigned' && j.driverId === 'driver_1').map((job) => (
                          <div key={job.id} className="p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-xs space-y-4">
                            <div className="flex justify-between items-start gap-1 border-b border-earth-100 dark:border-earth-900/30 pb-2">
                              <div>
                                <span className="px-2 py-0.5 text-[8px] font-black bg-amber-500 text-white rounded-full uppercase tracking-wider animate-pulse">In Transit</span>
                                <h4 className="font-black text-xs text-foreground mt-2">Route ID: {job.id}</h4>
                              </div>
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{job.wage}</span>
                            </div>

                            <div className="space-y-2 text-[10px] font-bold">
                              <p className="flex justify-between text-earth-500"><span className="font-normal">Cargo:</span> <span className="text-foreground">{job.quantity}kg of {job.productName}</span></p>
                              <p className="flex justify-between text-earth-500"><span className="font-normal">Pickup Hub:</span> <span className="text-foreground">{job.pickupLocation}</span></p>
                              <p className="flex justify-between text-earth-500"><span className="font-normal">Destination:</span> <span className="text-foreground">{job.deliveryLocation}</span></p>
                            </div>

                            <button
                              onClick={() => completeDelivery(job.id)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer border-0 shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Confirm Delivery & Disburse</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* 3b. Labor workforce registry */}
                <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-800 to-stone-600 text-white shadow-md relative overflow-hidden flex justify-between items-center gap-4">
                    <div className="z-10">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-700/60 px-2 py-0.5 rounded">Workforce portal</span>
                      <h2 className="text-base font-black mt-1">Farm Job Openings</h2>
                      <p className="text-[10px] text-stone-100 mt-0.5 leading-relaxed">Search seasonal sowing and harvesting jobs near your local district.</p>
                    </div>
                    <Briefcase className="w-16 h-16 text-white/10 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Available farm job postings */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Active Helper Listings</h3>
                      {activeRole === 'farmer' && (
                        <button
                          onClick={() => setShowAddLabor(true)}
                          className="px-3 py-1.5 bg-stone-800 text-white rounded-xl text-[10px] font-black border-0 cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Post Job</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {laborJobs.filter(j => j.status === 'open').length === 0 ? (
                        <div className="p-8 rounded-3xl border border-dashed border-earth-200 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]/30">
                          No open labor listings. Farmers can post jobs.
                        </div>
                      ) : (
                        laborJobs.filter(j => j.status === 'open').map((job) => (
                          <div key={job.id} className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <span className="px-2.5 py-0.5 text-[8px] font-black bg-stone-100 text-stone-800 rounded-full uppercase tracking-wider">Hiring Open</span>
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Wages: ₹{job.wages} / day</span>
                              </div>
                              <h4 className="font-black text-xs text-foreground mt-2">{job.title}</h4>
                              <p className="text-[10px] text-earth-500 mt-1">Location: {job.location} | Duration: {job.duration}</p>
                              <p className="text-[10px] text-earth-500 leading-relaxed mt-2.5 bg-earth-50 dark:bg-earth-950/20 p-2.5 rounded-xl border border-earth-150/40">
                                {job.description}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => applyForLaborJob(job.id)}
                              disabled={activeRole !== 'labor'}
                              className={`w-full py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-[10px] font-black cursor-pointer border-0 shadow-xs ${
                                activeRole !== 'labor' ? 'bg-earth-200 text-earth-400 cursor-not-allowed' : ''
                              }`}
                            >
                              {activeRole === 'labor' ? 'Apply for Position' : 'Labor Worker Mode Required'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Applied workforce log */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Your Application Submissions</h3>
                    <div className="space-y-3">
                      {laborJobs.filter(j => j.status !== 'open').map((job) => (
                        <div key={job.id} className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm space-y-4">
                          <div className="flex justify-between items-start gap-1 border-b border-earth-100 dark:border-earth-900/30 pb-2">
                            <div>
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider ${
                                job.status === 'applied' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-600 text-white'
                              }`}>{job.status === 'applied' ? 'Applied' : 'Hired / Filled'}</span>
                              <h4 className="font-black text-xs text-foreground mt-2">{job.title}</h4>
                            </div>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{job.wages}/day</span>
                          </div>

                          <p className="text-[10px] text-earth-500 leading-normal">
                            District: {job.location} | Farmer: {job.farmerName}
                          </p>

                          {activeRole === 'farmer' && job.status === 'applied' && (
                            <button
                              onClick={() => hireLaborWorker(job.id)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer border-0 shadow-sm"
                            >
                              Approve & Hire Candidate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. PROFILE TAB */}
            {/* ========================================================================= */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Profile Overview Card (Col Span 1) */}
                <div className="p-6 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm space-y-6">
                  
                  {/* Identity */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-foreground">{userName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 uppercase tracking-wider block w-fit mx-auto mt-1">
                        {activeRole} Profile
                      </span>
                    </div>
                  </div>

                  {/* Hot Swap Simulation Selector */}
                  <div className="space-y-2 border-t border-earth-100 dark:border-earth-900/40 pt-4">
                    <label className="text-[10px] font-black text-earth-500 block uppercase tracking-wider">Hot Swap Role Interface</label>
                    <select
                      value={activeRole}
                      onChange={(e) => setActiveRole(e.target.value as any)}
                      className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-black cursor-pointer text-foreground focus:outline-none"
                    >
                      <option value="farmer">Farmer Console</option>
                      <option value="buyer">Wholesale Buyer Hub</option>
                      <option value="delivery">Logistics Driver Console</option>
                      <option value="labor">Farm Worker Registry</option>
                    </select>
                    <p className="text-[10px] text-earth-400 leading-relaxed font-bold mt-1.5">
                      Hot swap your workspace role directly inside the dashboard to simulate and test different user interfaces and pipelines.
                    </p>
                  </div>

                  {/* Language switch */}
                  <div className="space-y-2 border-t border-earth-100 dark:border-earth-900/40 pt-4">
                    <label className="text-[10px] font-black text-earth-500 block uppercase tracking-wider">Ecosystem Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-black cursor-pointer text-foreground focus:outline-none"
                    >
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/auth');
                    }}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl text-xs font-black cursor-pointer transition-all border-0 flex items-center justify-center gap-1"
                  >
                    <span>Sign Out of Console</span>
                  </button>

                </div>

                {/* Ledger & Transactions (Col Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Wallet Balance Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-tr from-primary-800 to-primary-600 text-white shadow-md relative overflow-hidden flex justify-between items-center">
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                      <IndianRupee className="w-32 h-32" />
                    </div>
                    <div className="z-10">
                      <span className="text-[9px] uppercase tracking-widest text-primary-100 font-black block">Active Escrow Balance</span>
                      <h2 className="text-3xl font-black font-mono mt-1">₹{wallets[activeRole]?.toLocaleString('en-IN') || '0'}</h2>
                      <span className="text-[9px] text-primary-200 block mt-1 font-bold uppercase tracking-wider">PhonePe Ledger Synced</span>
                    </div>
                    <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-center z-10 shrink-0">
                      <span className="text-[9px] font-bold block uppercase tracking-wider">Account Tier</span>
                      <span className="text-xs font-black mt-0.5 block">Level 2 Verified</span>
                    </div>
                  </div>

                  {/* Transactions table */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Secure Audit ledger</h3>
                      <h3 className="text-sm font-black text-foreground">Wallet Audit Trail</h3>
                    </div>

                    <div className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-earth-600 dark:text-earth-400">
                          <thead className="text-[9px] uppercase text-earth-400 tracking-wider border-b border-earth-150 dark:border-earth-900/40">
                            <tr>
                              <th className="py-2.5 px-3 font-bold">Transaction ID</th>
                              <th className="py-2.5 px-3 font-bold">Timestamp</th>
                              <th className="py-2.5 px-3 font-bold">Flow Type</th>
                              <th className="py-2.5 px-3 font-bold text-right">Debit/Credit</th>
                            </tr>
                          </thead>
                          <tbody className="font-semibold divide-y divide-earth-100 dark:divide-earth-900/20">
                            {walletTransactions
                              .filter(tx => tx.user_id === user?.id || tx.user_id === activeRole + '_1')
                              .map((tx) => (
                                <tr key={tx.id} className="hover:bg-earth-50/20">
                                  <td className="py-2.5 px-3 text-foreground font-mono font-black">{tx.id}</td>
                                  <td className="py-2.5 px-3 text-earth-400 font-mono text-[10px]">{new Date(tx.created_at).toLocaleString()}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                      tx.transaction_type === 'credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                      {tx.transaction_type === 'credit' ? 'Inflow Deposit' : 'Outflow Debit'}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-black ${
                                    tx.transaction_type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                                  }`}>
                                    {tx.transaction_type === 'credit' ? '+' : '-'}₹{tx.amount}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Help & Support tickets */}
                  <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#141816] shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-earth-400 tracking-wider">Help & Support Ticket</h3>
                    
                    {supportSuccess ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span>Ticket submitted successfully! Our regional help desk will coordinate contact in 24 hours.</span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); setSupportSuccess(true); }} className="space-y-4 text-xs font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-earth-500 block mb-1">Subject</label>
                            <input
                              type="text"
                              placeholder="e.g. Escrow disbursement delay"
                              required
                              value={ticketSubject}
                              onChange={e => setTicketSubject(e.target.value)}
                              className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-earth-500 block mb-1">Regional District</label>
                            <input
                              type="text"
                              defaultValue="Madurai East, TN"
                              className="w-full h-10 px-3 bg-earth-50/30 dark:bg-earth-950/10 border border-earth-200 dark:border-earth-800 rounded-xl text-xs focus:outline-none cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-earth-500 block mb-1">Detailed Message</label>
                          <textarea
                            placeholder="Provide details about your query..."
                            required
                            value={ticketMsg}
                            onChange={e => setTicketMsg(e.target.value)}
                            className="w-full h-24 p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-stone-850 hover:bg-stone-900 text-white rounded-2xl font-black text-xs cursor-pointer border-0 shadow-sm"
                        >
                          Submit Support Ticket
                        </button>
                      </form>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        </main>

        {/* Global Bottom Navigation (for Mobile responsive views) */}
        <BottomNav />

        {/* Sakthi Floating voice helper drawer */}
        <SakthiFloat />

      </div>

      {/* ========================================================================= */}
      {/* ADD PRODUCE LISTING MODAL (FARMER MODE) */}
      {/* ========================================================================= */}
      {showAddProduce && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141816] rounded-3xl border border-earth-200 dark:border-[#232a26] p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-earth-100 dark:border-earth-900/30">
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider">{t('list_crop')}</h3>
              <button onClick={() => setShowAddProduce(false)} className="text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-bold text-foreground">
              <div>
                <label className="text-[10px] text-earth-500 block mb-1">Crop Yield Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Tomatoes"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl cursor-pointer"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">Supplier Location</label>
                  <input
                    type="text"
                    required
                    value={newProdLocation}
                    onChange={e => setNewProdLocation(e.target.value)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">Price (₹ / kg)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">Available Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={e => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs transition-all shadow-xs border-0 cursor-pointer"
              >
                Publish Crop Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD LABOR POSTING MODAL (FARMER MODE) */}
      {/* ========================================================================= */}
      {showAddLabor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141816] rounded-3xl border border-earth-200 dark:border-[#232a26] p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-earth-100 dark:border-earth-900/30">
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Post Farm Job</h3>
              <button onClick={() => setShowAddLabor(false)} className="text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLabor} className="space-y-4 text-xs font-bold text-foreground">
              <div>
                <label className="text-[10px] text-earth-500 block mb-1">Job Title / Task</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato Sorting Assistance"
                  value={newLaborTitle}
                  onChange={e => setNewLaborTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">Daily Wages (₹)</label>
                  <input
                    type="number"
                    required
                    value={newLaborWage}
                    onChange={e => setNewLaborWage(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-earth-500 block mb-1">District Location</label>
                  <input
                    type="text"
                    required
                    value={newLaborLocation}
                    onChange={e => setNewLaborLocation(e.target.value)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-earth-500 block mb-1">Detailed Description</label>
                <textarea
                  placeholder="Need experienced farm workers. Lunch provided."
                  required
                  value={newLaborDesc}
                  onChange={e => setNewLaborDesc(e.target.value)}
                  className="w-full h-20 p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs transition-all shadow-xs border-0 cursor-pointer"
              >
                Publish Job Opening
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLACE PURCHASE ORDER MODAL (BUYER MODE) */}
      {/* ========================================================================= */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#141816] rounded-3xl border border-earth-200 dark:border-[#232a26] p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-earth-100 dark:border-earth-900/30">
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider">Confirm Purchase Order</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 space-y-1 text-xs">
              <span className="text-[8px] font-black uppercase tracking-wider text-primary-600 block">Smart Escrow Vault</span>
              <h4 className="font-black text-foreground">{selectedProduct.name} Sourced Yield</h4>
              <p className="text-earth-550">District: {selectedProduct.location} | Supplier: {selectedProduct.farmerName}</p>
              <p className="text-emerald-600 font-bold font-mono">Unit Rate: ₹{selectedProduct.pricePerKg} / kg</p>
            </div>

            <div className="space-y-4 text-xs font-bold text-foreground">
              <div>
                <label className="text-[10px] text-earth-500 block mb-1">Quantity to Purchase (kg)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedProduct.stockKg}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.min(selectedProduct.stockKg, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                />
                <span className="text-[9px] text-earth-400 block mt-1">Available stock limit: {selectedProduct.stockKg} kg</span>
              </div>

              <div>
                <label className="text-[10px] text-earth-500 block mb-1">Destination Address (Logistics Dispatch)</label>
                <input
                  type="text"
                  placeholder="Provide delivery location address..."
                  value={dropAddress}
                  onChange={e => setDropAddress(e.target.value)}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl focus:outline-none"
                />
              </div>

              {/* Fee breakdown ledger */}
              <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950/20 border border-earth-150 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-earth-500">Produce Subtotal:</span>
                  <span>₹{orderQty * selectedProduct.pricePerKg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-500">Logistics Fare Payout (5% + Base):</span>
                  <span>₹{Math.round((orderQty * selectedProduct.pricePerKg) * 0.05 + 150)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-earth-200 dark:border-earth-800 pt-2 font-black">
                  <span>Total Smart Escrow Lock:</span>
                  <span className="text-emerald-600 text-sm">₹{orderQty * selectedProduct.pricePerKg + Math.round((orderQty * selectedProduct.pricePerKg) * 0.05 + 150)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs transition-all shadow-md border-0 cursor-pointer"
              >
                Authorize Escrow & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CROP SCANNER MODAL */}
      {/* ========================================================================= */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141816] rounded-3xl border border-earth-200 dark:border-[#232a26] p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-earth-100 dark:border-earth-900/30">
              <h3 className="text-sm font-black uppercase text-foreground tracking-wider">AI Leaf Diagnostic Scan</h3>
              <button onClick={() => setShowScanner(false)} className="text-earth-400 hover:text-foreground cursor-pointer border-0 bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {scannerStep === 'idle' && (
              <div className="flex flex-col items-center text-center space-y-4 p-4">
                <div className="w-24 h-24 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                  <Camera className="w-10 h-10" />
                </div>
                <p className="text-xs text-earth-500 font-bold max-w-xs leading-relaxed">
                  Upload or scan a photo of your crop foliage. The V-LINK neural model classifies leaf spots, rusts, or early blight instantly.
                </p>
                <button
                  onClick={triggerScan}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs border-0 cursor-pointer shadow-sm w-full"
                >
                  Trigger Simulated Camera Scan
                </button>
              </div>
            )}

            {scannerStep === 'scanning' && (
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <span className="text-xs font-bold text-earth-500 tracking-wider">ANALYZING LEAF TELEMETRY PATTERNS...</span>
              </div>
            )}

            {scannerStep === 'result' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl text-xs font-bold leading-relaxed flex gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p>{scanResult}</p>
                </div>
                <button
                  onClick={() => setScannerStep('idle')}
                  className="w-full py-2 bg-stone-850 hover:bg-stone-900 text-white rounded-xl text-xs font-bold border-0 cursor-pointer"
                >
                  Scan Another Leaf
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
