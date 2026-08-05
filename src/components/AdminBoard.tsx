'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, ShoppingBag, Wrench, Briefcase, TrendingUp, 
  Trash2, ShieldAlert, CheckCircle, Search, RefreshCw, 
  FileText, Download, UserMinus, ShieldCheck
} from 'lucide-react';
import StatisticsCard from './StatisticsCard';

interface UserMock {
  id: string;
  name: string;
  email: string;
  role: string;
  village: string;
  status: 'active' | 'suspended';
  joinDate: string;
}

export default function AdminBoard() {
  const { 
    products, deleteProduct, orders, cancelOrder,
    rentalItems, deleteRentalItem, rentalBookings,
    laborJobs, t, language
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'products' | 'orders' | 'rentals' | 'labor' | 'analytics'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');

  // Mock users registry
  const [usersMock, setUsersMock] = useState<UserMock[]>([
    { id: 'usr-1', name: 'Ramanathan Swamy', email: 'ramanathan@farmnet.in', role: 'Farmer', village: 'Othakadai, Madurai', status: 'active', joinDate: '2026-01-12' },
    { id: 'usr-2', name: 'Lakshmi Devi', email: 'lakshmi@farmnet.in', role: 'Farmer', village: 'Melur, Madurai', status: 'active', joinDate: '2026-02-15' },
    { id: 'usr-3', name: 'Gourmet Grand Hotel', email: 'procurement@gourmetgrand.com', role: 'Buyer', village: 'Anna Nagar, Chennai', status: 'active', joinDate: '2026-03-01' },
    { id: 'usr-4', name: 'Karuppiah Swamy', email: 'karuppiah@workers.in', role: 'Labor', village: 'Sivagangai, TN', status: 'active', joinDate: '2026-04-10' },
    { id: 'usr-5', name: 'Rajan Agri Rentals', email: 'rajan@rentals.in', role: 'Equipment Owner', village: 'Erode, TN', status: 'active', joinDate: '2026-01-20' },
    { id: 'usr-6', name: 'Murugan Vel', email: 'murugan@farmers.in', role: 'Farmer', village: 'Virudhunagar, TN', status: 'suspended', joinDate: '2026-05-02' }
  ]);

  const toggleUserStatus = (id: string) => {
    setUsersMock(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
  };

  const filteredUsers = usersMock.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.farmerName.toLowerCase().includes(prodSearch.toLowerCase())
  );

  // System Stats calculations
  const totalVolumeKg = products.reduce((sum, p) => sum + p.stockKg, 0);
  const totalValuation = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-6 h-6 text-primary-500" />
          <span>{language === 'ta' ? 'நிர்வாகக் கட்டுப்பாட்டு குழு' : 'Admin Control Panel'}</span>
        </h1>
        <p className="text-xs text-earth-500 dark:text-earth-400 mt-1 animate-fade-in">
          {language === 'ta' 
            ? 'பயனர் தரவுத்தளத்தை கண்காணிக்கவும், தயாரிப்பு பலகைகளை நிர்வகிக்கவும், எஸ்க்ரோ ஒப்பந்தங்களை ஆய்வு செய்யவும், பகுப்பாய்வுகளை பதிவிறக்கவும்.'
            : 'Monitor users database, moderate active product boards, inspect agreements escrow, and download analytics.'}
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-earth-200 dark:border-earth-900/40 gap-2 overflow-x-auto pb-0.5 scrollbar-none animate-fade-in">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'analytics'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'அமைப்பு பகுப்பாய்வு' : 'System Analytics'}
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'users'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'பயனர்கள் பதிவு' : 'User Registry'} ({usersMock.length})
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'products'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'தயாரிப்பு கட்டுப்பாடு' : 'Product Moderation'} ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'orders'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'ஆர்டர்கள் மற்றும் எஸ்க்ரோ' : 'Orders & Escrow'} ({orders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('rentals')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'rentals'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'இயந்திரங்களின் தொகுப்பு' : 'Equipment Fleet'} ({rentalItems.length})
        </button>
        <button
          onClick={() => setActiveSubTab('labor')}
          className={`px-4 py-2 text-xs font-black border-b-2 cursor-pointer transition-all border-0 bg-transparent shrink-0 ${
            activeSubTab === 'labor'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-earth-500 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'தொழிலாளர் வேலைகள்' : 'Labor Jobs'} ({laborJobs.length})
        </button>
      </div>

      {/* ========================== ANALYTICS TAB ========================== */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard
              title={language === 'ta' ? 'செயலில் உள்ள பயனர்கள்' : 'System Active Users'}
              value={usersMock.length}
              icon={Users}
              color="blue"
              description={language === 'ta' ? 'பதிவுசெய்யப்பட்ட விவசாயிகள் & வாங்குபவர்கள்' : 'Registered farmers & buyers'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'மொத்த பயிர் அளவு' : 'Ecosystem Crop Volume'}
              value={`${totalVolumeKg.toLocaleString()} kg`}
              icon={ShoppingBag}
              color="emerald"
              description={language === 'ta' ? 'செயலில் உள்ள பயிர் இருப்பு' : 'Active produce stock'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'நேரடி எஸ்க்ரோ மதிப்பு' : 'Direct Escrow Value'}
              value={`₹${totalValuation.toLocaleString()}`}
              icon={TrendingUp}
              color="amber"
              description={language === 'ta' ? 'நிறைவேற்றப்பட்ட ஆர்டர்களின் மதிப்பு' : 'Settled B2B order value'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'செயலில் உள்ள இயந்திரங்கள்' : 'Active Fleet Listings'}
              value={rentalItems.length}
              icon={Wrench}
              color="stone"
              description={language === 'ta' ? 'கூட்டுறவு டிராக்டர்கள் & கருவிகள்' : 'Cooperative tractors & tools'}
            />
          </div>

          <div className="bg-white dark:bg-[#111714] p-6 rounded-3xl border border-earth-200 dark:border-earth-900/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/10 pb-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                {language === 'ta' ? 'தளத்தின் செயல்பாட்டு அறிக்கைகள்' : 'Platform Activity Reports'}
              </h3>
              <button
                onClick={() => alert('Report download initiated.')}
                className="py-1.5 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'அறிக்கையை பதிவிறக்கு' : 'Export CSV Report'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-2xl">
                <span className="text-[10px] text-earth-455 font-bold uppercase tracking-wider block">
                  {language === 'ta' ? 'கூட்டுறவு அளவு விகிதம்' : 'Cooperative Volume Ratio'}
                </span>
                <span className="text-xl font-black text-foreground block mt-1">82% Madurai East Hub</span>
                <span className="text-[9px] text-earth-400 block mt-1">Leading districts: Madurai, Thanjavur, Erode.</span>
              </div>
              <div className="p-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-2xl">
                <span className="text-[10px] text-earth-455 font-bold uppercase tracking-wider block">
                  {language === 'ta' ? 'சராசரி விவசாய கூலி குறியீடு' : 'Average Farm Wage Index'}
                </span>
                <span className="text-xl font-black text-foreground block mt-1 font-mono">₹475 / day</span>
                <span className="text-[9px] text-earth-400 block mt-1">
                  {language === 'ta' ? 'செயலில் உள்ள களை எடுப்பு மற்றும் அறுவடை பணிகளில் இருந்து கணக்கிடப்பட்டது.' : 'Computed from active weeding & harvesting jobs.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================== USER MANAGEMENT ========================== */}
      {activeSubTab === 'users' && (
        <div className="bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-earth-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder={language === 'ta' ? 'பெயர், மின்னஞ்சல் அல்லது பாத்திரத்தின் மூலம் தேடுங்கள்...' : 'Search registered members by name, email, or role...'}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-earth-50/30 dark:bg-earth-950/10 border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 placeholder-earth-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-earth-150 text-earth-400 font-bold">
                  <th className="py-3 px-2">{language === 'ta' ? 'உறுப்பினர் ஐடி' : 'Member ID'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'முழு பெயர்' : 'Full Name'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'பயனர் பாத்திரம்' : 'Platform Role'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'கிராமத்தின் அமைவிடம்' : 'Village Location'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'இணைந்த தேதி' : 'Date joined'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'கணக்கு நிலை' : 'Account Status'}</th>
                  <th className="py-3 px-2 text-right">{language === 'ta' ? 'செயல்கள்' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50/30 dark:hover:bg-[#111714]">
                    <td className="py-3 px-2 font-mono">{u.id}</td>
                    <td className="py-3 px-2 font-bold text-foreground">{u.name}</td>
                    <td className="py-3 px-2 font-semibold text-earth-500">{u.email}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-earth-100 dark:bg-earth-900 text-earth-650 dark:text-earth-350 border border-earth-200/50">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-earth-500">{u.village}</td>
                    <td className="py-3 px-2 text-earth-400 font-mono">{u.joinDate}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`py-1 px-2.5 rounded-lg border font-bold text-[10px] cursor-pointer transition-all ${
                          u.status === 'active'
                            ? 'border-red-500/10 text-red-500 hover:bg-red-500/5'
                            : 'border-emerald-500/15 text-emerald-600 hover:bg-emerald-500/5'
                        }`}
                      >
                        {u.status === 'active' ? (language === 'ta' ? 'இடைநீக்கம்' : 'Suspend') : (language === 'ta' ? 'செயல்படுத்து' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================== PRODUCT MODERATION ========================== */}
      {activeSubTab === 'products' && (
        <div className="bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-earth-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder={language === 'ta' ? 'செயலில் உள்ள பயிர் பட்டியலைத் தேடுங்கள்...' : 'Search active produce listings...'}
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-earth-50/30 dark:bg-earth-950/10 border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 placeholder-earth-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="p-4 border border-earth-150 rounded-2xl bg-white dark:bg-[#111714] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 object-cover rounded-xl shrink-0 bg-earth-100 dark:bg-earth-900"
                  />
                  <div className="min-w-0">
                    <h4 className="font-black text-xs text-foreground truncate">{p.name}</h4>
                    <p className="text-[9px] text-earth-455 font-bold mt-1">
                      Farmer: {p.farmerName} • Stock: {p.stockKg} kg
                    </p>
                    <p className="text-[10px] text-primary-500 font-black mt-0.5">
                      ₹{p.pricePerKg}/kg
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-2 border border-red-500/10 hover:bg-red-500/5 text-red-500 rounded-xl cursor-pointer"
                  title={language === 'ta' ? 'பட்டியலை நீக்கு' : 'Remove Listing'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================== ORDERS & ESCROW ========================== */}
      {activeSubTab === 'orders' && (
        <div className="bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-earth-150 text-earth-400 font-bold">
                  <th className="py-3 px-2">{language === 'ta' ? 'ஆர்டர் ஐடி' : 'Order ID'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'பயிர் வகை' : 'Produce Item'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'வாங்குபவர் பெயர்' : 'Buyer Name'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'அளவு' : 'Quantity'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'மதிப்பு' : 'Valuation'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'நிறைவேற்ற நிலை' : 'Fulfillment Status'}</th>
                  <th className="py-3 px-2 text-right">{language === 'ta' ? 'செயல்கள்' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50/30 dark:hover:bg-[#111714]">
                    <td className="py-3 px-2 font-mono font-bold text-foreground">{o.id}</td>
                    <td className="py-3 px-2 font-semibold text-foreground">{o.productName}</td>
                    <td className="py-3 px-2 text-earth-500 font-semibold">{o.buyerName}</td>
                    <td className="py-3 px-2 font-mono">{o.quantity} kg</td>
                    <td className="py-3 px-2 font-mono font-bold text-foreground">₹{o.totalPrice}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        o.status === 'accepted' ? 'bg-blue-500/10 text-blue-600' :
                        o.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {o.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="py-1 px-2.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/5 font-bold text-[10px] cursor-pointer"
                        >
                          {language === 'ta' ? 'ஆர்டரை ரத்துசெய்' : 'Cancel Order'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================== EQUIPMENT FLEET ========================== */}
      {activeSubTab === 'rentals' && (
        <div className="bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentalItems.map((item) => (
              <div key={item.id} className="p-4 border border-earth-150 rounded-2xl bg-white dark:bg-[#111714] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl shrink-0 bg-earth-100 dark:bg-earth-900"
                  />
                  <div className="min-w-0">
                    <h4 className="font-black text-xs text-foreground truncate">{item.name}</h4>
                    <p className="text-[9px] text-earth-455 font-bold mt-1">
                      Owner: {item.vendorName} • {item.village}
                    </p>
                    <p className="text-[10px] text-primary-500 font-black mt-0.5">
                      ₹{item.pricePerDay}/day • status: {item.status}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteRentalItem(item.id)}
                  className="p-2 border border-red-500/10 hover:bg-red-500/5 text-red-500 rounded-xl cursor-pointer"
                  title={language === 'ta' ? 'பட்டியலை நீக்கு' : 'Remove Listing'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================== LABOR JOBS ========================== */}
      {activeSubTab === 'labor' && (
        <div className="bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 rounded-3xl p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-earth-150 text-earth-400 font-bold">
                  <th className="py-3 px-2">{language === 'ta' ? 'பணி ஐடி' : 'Job ID'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'பணி தலைப்பு' : 'Job Title'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'விவசாய முதலாளி' : 'Farmer Employer'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'கூலி விகிதம்' : 'Wages Rate'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'ஆட்கள் தேவை வரம்பு' : 'Hiring Limit'}</th>
                  <th className="py-3 px-2">{language === 'ta' ? 'நிலை' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {laborJobs.map((j) => (
                  <tr key={j.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50/30 dark:hover:bg-[#111714]">
                    <td className="py-3 px-2 font-mono font-bold text-foreground">{j.id}</td>
                    <td className="py-3 px-2 font-semibold text-foreground">{j.title}</td>
                    <td className="py-3 px-2 text-earth-500 font-semibold">{j.farmerName}</td>
                    <td className="py-3 px-2 font-mono font-bold text-primary-500">₹{j.wages}/day</td>
                    <td className="py-3 px-2">{j.workersNeeded} Workers</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        j.status === 'open' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
