'use client';

import React, { useState, useMemo } from 'react';
import { useApp, FPOMember } from '../context/AppContext';
import {
  Users, ShoppingBag, Sprout, Plus, Search, Edit3, ArrowRight,
  ShieldCheck, Truck, Wifi, WifiOff, FileText, CheckCircle2,
  ChevronRight, Activity, TrendingUp, AlertTriangle, ToggleLeft, ToggleRight
} from 'lucide-react';
import StatCard from './StatCard';
import { enableLayer2 } from '@/lib/config';

export default function FpoBoard() {
  const {
    t,
    language,
    fpoMembers,
    fpoProduce,
    fpoAggregations,
    fpoTransactions,
    simulatedOffline,
    toggleSimulatedNetwork,
    addFPOMember,
    updateFPOMember,
    toggleFPOMemberStatus,
    addFPOProduce,
    createFPOAggregationBatch,
    createFPOTransaction,
    updateFPOTransactionPrice,
    acceptFPOTransaction,
    rejectFPOTransaction,
    advanceFPOTransactionStatus,
    buyerRequirements,
    wallets,
    addToast
  } = useApp();

  // Sub-tabs inside FPO Board
  const [activeFpoTab, setActiveFpoTab] = useState<'dashboard' | 'members' | 'crops' | 'demand' | 'transactions' | 'vlink'>('dashboard');

  // Member Management Form States
  const [searchMember, setSearchMember] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberVillage, setNewMemberVillage] = useState('');
  const [newMemberDistrict, setNewMemberDistrict] = useState('Madurai');
  const [newMemberHasSmartphone, setNewMemberHasSmartphone] = useState(true);

  // Aggregation States
  const [selectedCrop, setSelectedCrop] = useState('Tomato (தக்காளி)');
  const [farmerSelections, setFarmerSelections] = useState<Record<string, number>>({});
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Transaction Logistics Picker States
  const [activeTxnIdForLogistics, setActiveTxnIdForLogistics] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('Suresh Kumar');

  // Member Edit & Detail Modal States
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<FPOMember | null>(null);
  const [selectedMemberEdit, setSelectedMemberEdit] = useState<FPOMember | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberVillage, setEditMemberVillage] = useState('');
  const [editMemberDistrict, setEditMemberDistrict] = useState('Madurai');
  const [editMemberHasSmartphone, setEditMemberHasSmartphone] = useState(true);
  const [editMemberStatus, setEditMemberStatus] = useState<'active' | 'inactive'>('active');

  // B2B Negotiation States
  const [fpoNegotiationPrices, setFpoNegotiationPrices] = useState<Record<string, number>>({});

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return fpoMembers.filter(m => {
      const matchSearch = m.fullName.toLowerCase().includes(searchMember.toLowerCase()) || 
                          m.phone.includes(searchMember) || 
                          m.village.toLowerCase().includes(searchMember.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true : m.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [fpoMembers, searchMember, filterStatus]);

  // Aggregating produce metrics
  const dashboardStats = useMemo(() => {
    const totalMembers = fpoMembers.length;
    const activeFarmers = fpoMembers.filter(m => m.status === 'active').length;
    const cropsCount = Array.from(new Set(fpoProduce.map(p => p.cropName))).length;
    const availableProduceKg = fpoProduce.reduce((sum, p) => sum + p.availableQuantity, 0);
    const expectedHarvestKg = fpoProduce.reduce((sum, p) => sum + p.expectedQuantity, 0);
    const activeDemands = buyerRequirements.filter(d => d.status === 'open').length;
    const activeOrders = fpoTransactions.filter(t => t.status !== 'COMPLETED').length;
    const pendingDeliveries = fpoTransactions.filter(t => ['ACCEPTED', 'LOGISTICS_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(t.status)).length;
    const completedTransactions = fpoTransactions.filter(t => t.status === 'COMPLETED').length;

    return {
      totalMembers,
      activeFarmers,
      cropsCount,
      availableProduceKg,
      expectedHarvestKg,
      activeDemands,
      activeOrders,
      pendingDeliveries,
      completedTransactions
    };
  }, [fpoMembers, fpoProduce, buyerRequirements, fpoTransactions]);

  // Aggregate produce crop-wise
  const cropAggregations = useMemo(() => {
    const crops: Record<string, { cropName: string; farmersCount: number; expected: number; available: number; harvestWindow: string }> = {};
    fpoProduce.forEach(p => {
      const cropKey = p.cropName;
      if (!crops[cropKey]) {
        crops[cropKey] = {
          cropName: p.cropName,
          farmersCount: 0,
          expected: 0,
          available: 0,
          harvestWindow: 'Sept 10 - 20'
        };
      }
      crops[cropKey].farmersCount += 1;
      crops[cropKey].expected += p.expectedQuantity;
      crops[cropKey].available += p.availableQuantity;
    });
    return Object.values(crops);
  }, [fpoProduce]);

  // Handle member addition
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone || !newMemberVillage) {
      alert('Please fill all required fields');
      return;
    }
    addFPOMember({
      fpoId: 'fpo_1',
      fullName: newMemberName,
      phone: newMemberPhone,
      village: newMemberVillage,
      district: newMemberDistrict,
      status: 'active',
      hasSmartphone: newMemberHasSmartphone
    });
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberVillage('');
    setNewMemberHasSmartphone(true);
    setIsAddMemberOpen(false);
  };

  const openEditMemberModal = (m: FPOMember) => {
    setSelectedMemberEdit(m);
    setEditMemberName(m.fullName);
    setEditMemberPhone(m.phone);
    setEditMemberVillage(m.village);
    setEditMemberDistrict(m.district);
    setEditMemberHasSmartphone(m.hasSmartphone);
    setEditMemberStatus(m.status);
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberEdit) return;
    updateFPOMember(selectedMemberEdit.id, {
      fullName: editMemberName,
      phone: editMemberPhone,
      village: editMemberVillage,
      district: editMemberDistrict,
      hasSmartphone: editMemberHasSmartphone,
      status: editMemberStatus
    });
    setSelectedMemberEdit(null);
  };

  // Handle Aggregation Batch Submission
  const handleCreateAggregationBatch = () => {
    // Validate quantities do not exceed available stock
    for (const [farmerId, qty] of Object.entries(farmerSelections)) {
      if (qty <= 0) continue;
      const prod = fpoProduce.find(p => p.farmerId === farmerId && p.cropName === selectedCrop);
      if (!prod) continue;
      if (qty > prod.availableQuantity) {
        alert(`Entered quantity (${qty} kg) for ${prod.farmerName} exceeds available stock (${prod.availableQuantity} kg).`);
        return;
      }
    }

    const contributions = Object.entries(farmerSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([farmerId, qty]) => ({ farmerId, quantity: qty }));

    if (contributions.length === 0) {
      alert('Please select at least one farmer contribution quantity.');
      return;
    }

    createFPOAggregationBatch(selectedCrop, contributions);
    setFarmerSelections({});
    setIsCreatingBatch(false);
  };

  return (
    <div className="space-y-6 text-foreground font-sans">
      
      {/* Title Header with V-LINK offline badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-earth-150/40 dark:border-earth-900/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>{language === 'ta' ? 'FPO கூட்டுறவு சேவைகள்' : 'FPO Coordination Console'}</span>
          </h1>
          <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
            {language === 'ta' 
              ? 'உறுப்பினர் விவசாயிகள், சந்தை தேவைகள், சேமிப்பு அடுக்கு மற்றும் எஸ்க்ரோ பரிவர்த்தனைகளை நிர்வகிக்கவும்.'
              : 'Directly manage member farmers, crop aggregation lots, buyer purchase demands, logistics, and cleared transactions.'}
          </p>
        </div>

        {/* Sync / Simulated network Status badge */}
        {enableLayer2 && (
          <div className="flex items-center gap-2 bg-earth-50 dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 px-3.5 py-2 rounded-2xl">
            <div className="text-left">
              <span className="text-[8px] font-bold text-earth-400 uppercase tracking-widest block">V-LINK Sync Gateway</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {simulatedOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-black text-amber-500">SIMULATED OFFLINE</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                    <span className="text-xs font-black text-primary-500">ONLINE</span>
                  </>
                )}
              </div>
            </div>
            <div className="h-6 w-px bg-earth-200 dark:bg-earth-900 mx-2" />
            <button
              onClick={() => setActiveFpoTab('vlink')}
              className="text-[10px] font-bold bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 dark:text-primary-400 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer"
            >
              Manage Sync
            </button>
          </div>
        )}
      </div>

      {/* Sub Tabs Menu */}
      <div className="flex border-b border-earth-200 dark:border-earth-850 overflow-x-auto whitespace-nowrap scrollbar-none gap-2 pb-0.5">
        {[
          { id: 'dashboard', label: language === 'ta' ? 'கண்காணிப்பு' : 'Dashboard' },
          { id: 'members', label: language === 'ta' ? 'உறுப்பினர்கள்' : 'Members Directory' },
          { id: 'crops', label: language === 'ta' ? 'பயிர் உற்பத்தி & சேகரிப்பு' : 'Aggregation Lots' },
          { id: 'demand', label: language === 'ta' ? 'வாங்குபவர் தேவைகள்' : 'Demand Matcher' },
          { id: 'transactions', label: language === 'ta' ? 'பரிவர்த்தனை & டிரைவர்கள்' : 'Transactions & Logistics' },
          ...(enableLayer2 ? [{ id: 'vlink', label: 'V-LINK Status' }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFpoTab(tab.id as any)}
            className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer bg-transparent border-0 ${
              activeFpoTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-earth-450 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================== DASHBOARD TAB ========================== */}
      {activeFpoTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Dashboard cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Members" value={dashboardStats.totalMembers} icon={Users} color="purple" subtitle="Cooperative members" />
            <StatCard title="Active Farmers" value={dashboardStats.activeFarmers} icon={ShieldCheck} color="emerald" subtitle="Supplying produce" />
            <StatCard title="Crops Registered" value={dashboardStats.cropsCount} icon={Sprout} color="blue" subtitle="Unique commodities" />
            <StatCard title="Available Produce" value={`${dashboardStats.availableProduceKg.toLocaleString()} kg`} icon={ShoppingBag} color="amber" subtitle="Aggregated stock" />
            <StatCard title="Expected Harvest" value={`${dashboardStats.expectedHarvestKg.toLocaleString()} kg`} icon={TrendingUp} color="stone" subtitle="Next 30 days projection" />
            <StatCard title="Active Buyer Demands" value={dashboardStats.activeDemands} icon={FileText} color="blue" subtitle="Direct B2B demands" />
            <StatCard title="Pending Deliveries" value={dashboardStats.pendingDeliveries} icon={Truck} color="indigo" subtitle="In logistics pipeline" />
            <StatCard title="Completed Txns" value={dashboardStats.completedTransactions} icon={CheckCircle2} color="emerald" subtitle="Cleared escrow transfers" />
            <div className="col-span-2 p-4 bg-purple-500/5 border border-purple-500/10 rounded-[22px] flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">FPO Escrow Wallet</span>
              <span className="text-xl font-mono font-black text-foreground mt-1">₹{(wallets.fpo || 0).toLocaleString()}</span>
              <span className="text-[9px] text-earth-455 mt-1">Ecosystem clearing account balance</span>
            </div>
          </div>

          {/* Conceptual Architecture Diagram */}
          <div className="bg-white dark:bg-[#111714] p-6 rounded-3xl border border-earth-200 dark:border-earth-900/30 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider border-b border-earth-100 dark:border-earth-900/10 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>UZHAVAN360 Ecosystem Flow</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center font-mono py-4 text-xs font-bold text-earth-600 dark:text-earth-400">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                <span className="block text-sm font-black">FARMER</span>
                <span className="text-[9px] mt-1 block">Crops & Sowing Data</span>
              </div>
              <ArrowRight className="w-5 h-5 mx-auto text-earth-300 rotate-90 md:rotate-0 animate-pulse" />
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/10">
                <span className="block text-sm font-black">FPO HUB</span>
                <span className="text-[9px] mt-1 block">Aggregation & Matching</span>
              </div>
              <ArrowRight className="w-5 h-5 mx-auto text-earth-300 rotate-90 md:rotate-0 animate-pulse" />
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/10">
                <span className="block text-sm font-black">BUYERS & TRADERS</span>
                <span className="text-[9px] mt-1 block">Purchase Orders / Escrow</span>
              </div>
            </div>

            <blockquote className="border-l-4 border-purple-500 pl-4 py-1.5 text-xs text-earth-550 dark:text-earth-400 leading-relaxed font-semibold italic bg-purple-500/5 rounded-r-xl">
              "FPO becomes the trusted organizational bridge connecting member farmers to verified B2B buyers and logistics dispatch operators through UZHAVAN360."
            </blockquote>
          </div>
        </div>
      )}

      {/* ========================== MEMBERS TAB ========================== */}
      {activeFpoTab === 'members' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search farmers name/phone/village..."
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-455" />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="h-10 px-3 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground cursor-pointer focus:outline-none"
              >
                <option value="all">All Members</option>
                <option value="active">Active Members</option>
                <option value="inactive">Inactive Members</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member Farmer</span>
            </button>
          </div>

          {/* Add member modal */}
          {isAddMemberOpen && (
            <div className="p-6 rounded-[22px] border border-earth-200 dark:border-earth-800 bg-white dark:bg-[#111714] space-y-4 shadow-lg animate-fade-in max-w-xl">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Register Farmer Profile</h3>
              <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">Farmer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    placeholder="e.g. Ramanathan Swamy"
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newMemberPhone}
                    onChange={e => setNewMemberPhone(e.target.value)}
                    placeholder="e.g. +91 94432 10987"
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">Village *</label>
                  <input
                    type="text"
                    required
                    value={newMemberVillage}
                    onChange={e => setNewMemberVillage(e.target.value)}
                    placeholder="e.g. Othakadai"
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">District</label>
                  <select
                    value={newMemberDistrict}
                    onChange={e => setNewMemberDistrict(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground cursor-pointer"
                  >
                    <option value="Madurai">Madurai</option>
                    <option value="Dindigul">Dindigul</option>
                    <option value="Virudhunagar">Virudhunagar</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Erode">Erode</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl border border-earth-150">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-foreground">Has Smartphone Device</span>
                    <p className="text-[10px] text-earth-450 leading-tight">Disable if farmer has no smartphone (exemption from digital portal dependency).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewMemberHasSmartphone(!newMemberHasSmartphone)}
                    className="p-1 rounded-full cursor-pointer hover:bg-earth-100 dark:hover:bg-earth-900 border-0 bg-transparent"
                  >
                    {newMemberHasSmartphone ? (
                      <ToggleRight className="w-9 h-9 text-purple-600" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-earth-300" />
                    )}
                  </button>
                </div>
                <div className="sm:col-span-2 flex items-center justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="h-10 px-4 rounded-xl border border-earth-200 text-earth-600 hover:bg-earth-50 text-xs font-bold cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                  >
                    Save Farmer Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-900/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-earth-50/50 dark:bg-earth-950/20 text-earth-450 border-b border-earth-150 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Farmer Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Access Status</th>
                    <th className="p-4">Membership</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-earth-900/10 text-foreground font-semibold">
                  {filteredMembers.map(m => {
                    const memberCrops = fpoProduce.filter(p => p.farmerId === m.id);
                    return (
                      <tr key={m.id} className="hover:bg-earth-50/30 dark:hover:bg-earth-950/5">
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-sm block">{m.fullName}</span>
                            <span className="text-[10px] text-earth-450 block mt-0.5">Joined: {m.joinDate}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">{m.phone}</td>
                        <td className="p-4">{m.village}, {m.district}</td>
                        <td className="p-4">
                          {m.hasSmartphone ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Smartphone User
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              No-Smartphone (Exempt)
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleFPOMemberStatus(m.id)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer border ${
                              m.status === 'active' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                          >
                            {m.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedMemberDetails(m)}
                            className="h-8 px-3 rounded-lg border border-earth-200 text-earth-650 hover:bg-earth-50 text-[10px] font-bold cursor-pointer bg-white"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openEditMemberModal(m)}
                            className="h-8 px-3 rounded-lg border border-purple-200 text-purple-650 hover:bg-purple-50/50 text-[10px] font-bold cursor-pointer bg-white"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================== CROPS & AGGREGATION TAB ========================== */}
      {activeFpoTab === 'crops' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Crop Summary visibility */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-earth-200 dark:border-earth-900/30 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Aggregated Crop supply visibility</h3>
                  <p className="text-[11px] text-earth-450 mt-0.5">Summary of recorded supply data across all registered member farmers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cropAggregations.map(c => (
                    <div key={c.cropName} className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="font-bold text-base text-foreground block">{c.cropName}</span>
                        <span className="text-[10px] text-earth-450 block mt-0.5">Supplying Farmers: <span className="font-black text-foreground">{c.farmersCount}</span></span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-earth-100 dark:border-earth-900/10">
                        <div>
                          <span className="text-[9px] font-bold text-earth-400 uppercase block">Expected Harvest</span>
                          <span className="font-black text-foreground">{c.expected.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-earth-400 uppercase block">Available Produce</span>
                          <span className="font-black text-purple-600 dark:text-purple-400">{c.available.toLocaleString()} kg</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-earth-455">
                        Estimated window: <span className="font-bold">{c.harvestWindow}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregation Batches History */}
              <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-earth-200 dark:border-earth-900/30 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Aggregation Lot Batches</h3>
                
                {fpoAggregations.length === 0 ? (
                  <div className="p-12 text-center text-earth-400 font-bold text-xs">
                    No aggregation batches created yet. Use the Aggregation Lot Builder on the right to compile bulk produce.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fpoAggregations.map(batch => (
                      <div key={batch.id} className="p-4 rounded-xl border border-earth-150 dark:border-earth-900/10 bg-earth-50/20 dark:bg-earth-950/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-purple-600">{batch.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                              {batch.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground">{batch.cropName} - {batch.totalQuantity.toLocaleString()} kg</h4>
                          <p className="text-[10px] text-earth-450">Compiled on: {batch.createdDate} • Farmers included: {batch.farmerContributions.length}</p>
                        </div>
                        <button
                          onClick={() => alert(`Farmer contributions:\n` + batch.farmerContributions.map(c => `- ${c.farmerName}: ${c.quantity}kg`).join('\n'))}
                          className="h-8 px-3 rounded-lg border border-earth-200 text-earth-600 hover:bg-earth-50 text-[10px] font-bold cursor-pointer bg-white"
                        >
                          View Contributions
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Aggregation Lot Builder */}
            <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-purple-500/20 dark:border-purple-950/20 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Aggregation Lot Builder</h3>
                <p className="text-[11px] text-earth-450 mt-0.5">Collect and aggregate quantities from individual member farmers to compile bulk B2B supply.</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-earth-455 block mb-1">Select Crop</label>
                <select
                  value={selectedCrop}
                  onChange={e => { setSelectedCrop(e.target.value); setFarmerSelections({}); }}
                  className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Tomato (தக்காளி)">Tomato (தக்காளி)</option>
                  <option value="Rice (நெல்)">Rice (நெல்)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase text-earth-450 block">Farmers Available Stock</span>
                <div className="max-h-60 overflow-y-auto border border-earth-150 dark:border-earth-900 rounded-2xl divide-y divide-earth-100 dark:divide-earth-900/10 p-2 space-y-2">
                  {fpoProduce.filter(p => p.cropName === selectedCrop).map(p => {
                    const farmer = fpoMembers.find(m => m.id === p.farmerId);
                    if (farmer?.status !== 'active') return null;
                    return (
                      <div key={p.id} className="p-2 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">{p.farmerName}</span>
                          <span className="text-[9px] text-purple-500 block">Stock: {p.availableQuantity} kg</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={p.availableQuantity}
                          placeholder="qty"
                          value={farmerSelections[p.farmerId] || ''}
                          onChange={e => setFarmerSelections(prev => ({ ...prev, [p.farmerId]: Number(e.target.value) || 0 }))}
                          className="w-20 h-8 px-2 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-800 rounded-lg text-right font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-earth-100 dark:border-earth-900/10 flex items-center justify-between text-xs">
                <span className="font-bold text-earth-550">Total Lot Quantity:</span>
                <span className="font-mono font-black text-lg text-purple-600 dark:text-purple-400">
                  {Object.values(farmerSelections).reduce((sum, val) => sum + val, 0).toLocaleString()} kg
                </span>
              </div>

              <button
                onClick={handleCreateAggregationBatch}
                className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer border-0 shadow-sm transition-all"
              >
                Create Aggregation Batch
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================== DEMAND MATCHER TAB ========================== */}
      {activeFpoTab === 'demand' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-black text-foreground">Multi-FPO Demand-Driven Marketplace</h2>
            <p className="text-xs text-earth-455 mt-0.5">Match verified buyer requirement contract demands with FPO's available produce and crop aggregation lots.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buyerRequirements.map(req => {
              const matchingCrops = fpoProduce.filter(p => p.cropName.includes(req.crop.split(' ')[0]));
              const totalAvailable = matchingCrops.reduce((sum, p) => sum + p.availableQuantity, 0);
              const gap = Math.max(0, req.quantity - totalAvailable);

              const cropPrefix = req.crop.split(' ')[0];
              const matchingBatches = fpoAggregations.filter(b => b.cropName.includes(cropPrefix) && b.status === 'completed');

              return (
                <div key={req.id} className="p-6 rounded-[22px] bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      req.status === 'open' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {req.status === 'open' ? 'Open Demand' : 'Matched'}
                    </span>
                    <span className="text-[10px] text-earth-400 font-bold font-mono">{req.location}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground">{req.crop}</h3>
                    <p className="text-xs text-earth-455 mt-0.5">Demanded by: <span className="font-bold text-foreground">{req.buyerName}</span></p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs py-3 border-t border-b border-earth-100 dark:border-earth-900/10">
                    <div>
                      <span className="text-[9px] font-bold text-earth-455 uppercase block">Demanded Qty</span>
                      <span className="font-black text-foreground">{req.quantity} kg</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-earth-455 uppercase block">FPO Stock</span>
                      <span className="font-black text-purple-600 dark:text-purple-400">{totalAvailable} kg</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-earth-455 uppercase block">Supply Gap</span>
                      <span className={`font-black ${gap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{gap} kg</span>
                    </div>
                  </div>

                  {req.status === 'open' ? (
                    <div className="space-y-3">
                      {matchingBatches.length > 0 ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-earth-450 block">Select Aggregation Batch to Link</label>
                          <div className="space-y-1.5">
                            {matchingBatches.map(batch => (
                              <button
                                key={batch.id}
                                onClick={() => createFPOTransaction(req.id, batch.id)}
                                className="w-full text-left p-3.5 rounded-xl border border-purple-500/30 hover:bg-purple-500/5 bg-transparent font-bold flex items-center justify-between text-xs cursor-pointer text-foreground font-mono"
                              >
                                <span>{batch.id} ({batch.totalQuantity} kg compiled)</span>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Link & Supply</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs p-3.5 bg-earth-50 rounded-xl border border-earth-150 text-earth-500 font-medium">
                          ⚠️ Create a completed aggregation lot for this crop type first to supply to this requirement.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-black">
                      Linked & supply matched ✅
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================== TRANSACTIONS TAB ========================== */}
      {activeFpoTab === 'transactions' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-black text-foreground">FPO Transaction & Logistics Centre</h2>
            <p className="text-xs text-earth-455 mt-0.5">Control transaction state transitions and assign logistics dispatch drivers to clear B2B escrow bookings.</p>
          </div>

          {activeTxnIdForLogistics && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111714] border border-purple-500/20 space-y-4 shadow-sm animate-fade-in max-w-lg">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Assign Driver & Logistics</h3>
              <div>
                <label className="text-[10px] font-black uppercase text-earth-455 block mb-1">Select Driver Partner</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Suresh Kumar">Suresh Kumar (Bolero Pickup - TN-59-AX-1234)</option>
                  <option value="Velu Swamy">Velu Swamy (Mini Truck - TN-49-Y-9876)</option>
                  <option value="Ravi K.">Ravi K. (Tractor Trailer - TN-67-U-3456)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTxnIdForLogistics(null)}
                  className="h-9 px-4 rounded-xl border border-earth-200 text-earth-600 text-xs font-bold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    let phone = '+91 99887 76655';
                    let vehicle = 'TN-59-AX-1234';
                    if (selectedDriver === 'Velu Swamy') {
                      phone = '+91 98765 43210';
                      vehicle = 'TN-49-Y-9876';
                    } else if (selectedDriver === 'Ravi K.') {
                      phone = '+91 91234 56789';
                      vehicle = 'TN-67-U-3456';
                    }
                    advanceFPOTransactionStatus(activeTxnIdForLogistics, {
                      name: selectedDriver,
                      phone,
                      vehicle
                    });
                    setActiveTxnIdForLogistics(null);
                  }}
                  className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                >
                  Confirm Logistics Assignment
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fpoTransactions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-earth-200 dark:border-earth-855 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
                No transactions recorded. Create a supply match in the Demand Matcher tab.
              </div>
            ) : (
              fpoTransactions.map(txn => {
                const revenue = txn.quantity * txn.pricePerKg;
                const logisticsCost = 1500;
                const otherCosts = 500;
                const netProfit = revenue - logisticsCost - otherCosts;

                return (
                  <div key={txn.id} className="p-5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-earth-100 dark:border-earth-900/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-purple-600 block">{txn.id}</span>
                          <span className="text-[10px] text-earth-450 block">v{txn.version}</span>
                        </div>
                        <h4 className="text-base font-black text-foreground mt-0.5">{txn.cropName} - {txn.quantity.toLocaleString()} kg</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {txn.status}
                        </span>
                        
                        {txn.status === 'DRAFT' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-earth-450 font-bold">{language === 'ta' ? 'ஆஃபர் விலை (₹/kg):' : 'Offer Price (₹/kg):'}</span>
                            <input
                              type="number"
                              min="1"
                              value={fpoNegotiationPrices[txn.id] ?? txn.pricePerKg}
                              onChange={e => setFpoNegotiationPrices(prev => ({ ...prev, [txn.id]: Number(e.target.value) || 0 }))}
                              className="w-16 h-8 px-2 bg-earth-50 border border-earth-200 dark:border-earth-800 rounded-lg text-center font-mono text-xs text-foreground focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const price = fpoNegotiationPrices[txn.id] || txn.pricePerKg;
                                updateFPOTransactionPrice(txn.id, price, 'MATCHED');
                              }}
                              className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs"
                            >
                              {language === 'ta' ? 'ஆஃபர் அனுப்பு' : 'Send Offer'}
                            </button>
                          </div>
                        )}

                        {txn.status === 'OFFER_RECEIVED' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-500 font-bold">Counter: ₹{txn.pricePerKg}/kg</span>
                            <button
                              onClick={() => acceptFPOTransaction(txn.id)}
                              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs"
                            >
                              Accept
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={fpoNegotiationPrices[txn.id] ?? txn.pricePerKg}
                              onChange={e => setFpoNegotiationPrices(prev => ({ ...prev, [txn.id]: Number(e.target.value) || 0 }))}
                              className="w-14 h-8 px-2 bg-earth-50 border border-earth-200 dark:border-earth-800 rounded-lg text-center font-mono text-xs text-foreground focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const price = fpoNegotiationPrices[txn.id] || txn.pricePerKg;
                                updateFPOTransactionPrice(txn.id, price, 'MATCHED');
                              }}
                              className="h-8 px-3 rounded-lg bg-purple-650 hover:bg-purple-755 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => rejectFPOTransaction(txn.id)}
                              className="h-8 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-[10px] cursor-pointer border border-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {txn.status === 'MATCHED' && (
                          <span className="text-xs text-earth-455 italic font-bold">
                            {language === 'ta' ? 'வாங்குபவர் பதிலுக்காக காத்திருக்கிறது...' : 'Waiting for Buyer response...'}
                          </span>
                        )}

                        {txn.status === 'REJECTED' && (
                          <span className="text-xs text-red-550 font-black uppercase tracking-wider">
                            Rejected ✕
                          </span>
                        )}

                        {!['DRAFT', 'MATCHED', 'OFFER_RECEIVED', 'REJECTED'].includes(txn.status) && txn.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              if (txn.status === 'ACCEPTED') {
                                setActiveTxnIdForLogistics(txn.id);
                              } else {
                                advanceFPOTransactionStatus(txn.id);
                              }
                            }}
                            className="h-8 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Advance Status</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-[9px] font-bold text-earth-400 uppercase block">Buyer Partner</span>
                        <span className="text-foreground font-black text-sm block mt-0.5">{txn.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-earth-400 uppercase block">Logistics Driver</span>
                        {txn.driverName ? (
                          <span className="text-foreground block mt-0.5">🚚 {txn.driverName} ({txn.vehicleNumber})</span>
                        ) : (
                          <span className="text-earth-400 block mt-0.5 italic">Unassigned</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-earth-400 uppercase block">Estimated Net Value</span>
                        <span className="text-emerald-500 font-mono font-black text-sm block mt-0.5">₹{netProfit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-earth-400 uppercase block">Financials Sheet</span>
                        <span className="text-earth-555 font-mono block mt-0.5">
                          Revenue: ₹{revenue.toLocaleString()} | Costs: ₹{(logisticsCost + otherCosts).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress visual steps */}
                    <div className="grid grid-cols-5 gap-2 pt-2 text-[8px] font-black uppercase text-center font-mono tracking-wider">
                      {[
                        { label: 'DRAFT', active: ['DRAFT', 'MATCHED', 'OFFER_RECEIVED', 'ACCEPTED', 'LOGISTICS_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(txn.status) },
                        { label: 'ACCEPTED', active: ['ACCEPTED', 'LOGISTICS_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(txn.status) },
                        { label: 'LOGISTICS', active: ['LOGISTICS_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(txn.status) },
                        { label: 'TRANSIT', active: ['PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(txn.status) },
                        { label: 'DELIVERED', active: ['DELIVERED', 'COMPLETED'].includes(txn.status) }
                      ].map((step, idx) => (
                        <div key={step.label} className="space-y-1">
                          <div className={`h-1.5 rounded-full ${step.active ? 'bg-purple-600' : 'bg-earth-200'}`} />
                          <span className={step.active ? 'text-purple-600' : 'text-earth-400'}>{step.label}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================== V-LINK SYNC STATUS TAB ========================== */}
      {activeFpoTab === 'vlink' && enableLayer2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#111714] p-6 rounded-3xl border border-earth-200 dark:border-earth-900/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">V-LINK Store-Carry-Forward Sync</h3>
                <p className="text-[11px] text-earth-450 mt-0.5">Control simulation settings for the future V-LINK LoRa communication gateway.</p>
              </div>
              
              <button
                onClick={toggleSimulatedNetwork}
                className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border shadow-sm transition-all ${
                  simulatedOffline 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                    : 'bg-primary-500/10 border-primary-500/30 text-primary-500 hover:bg-primary-500/20'
                }`}
              >
                {simulatedOffline ? (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Turn simulated Network ON</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 animate-pulse" />
                    <span>Turn simulated Network OFF</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-earth-450">Active Connection Status</h4>
                
                <div className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 space-y-3 font-semibold text-xs text-foreground">
                  <div className="flex justify-between">
                    <span className="text-earth-450">Sync Gateway connection:</span>
                    <span className={simulatedOffline ? 'text-amber-500 font-bold' : 'text-primary-500 font-bold'}>
                      {simulatedOffline ? 'DISCONNECTED (DEMO / SIMULATION)' : 'CONNECTED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-450">LoRa Local Buffer Queue:</span>
                    <span className="font-mono font-bold">
                      {typeof window !== 'undefined' 
                        ? (JSON.parse(localStorage.getItem('vlink_offline_queue') || '[]')).length 
                        : 0} packets pending
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-450">Last Cloud Sync:</span>
                    <span className="font-mono">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 block mb-1">Future V-LINK integration point</span>
                  <p className="text-[11px] text-earth-500 leading-normal font-semibold">
                    The software state stores transactions in local queues with cryptographic signatures, priorities, and version stamps. The V-LINK client will push these packets using LoRa Store-Carry-Forward relays to the gateway automatically when connected.
                  </p>
                </div>
              </div>

              {/* Sync packet logs console */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-earth-455">Sync Packet buffer monitor</h4>
                <div className="h-60 overflow-y-auto bg-[#070b09] text-emerald-500 p-4 rounded-2xl border border-primary-950/30 font-mono text-[10px] space-y-2 leading-relaxed">
                  <span className="text-[9px] text-earth-500 uppercase font-bold tracking-wider block border-b border-primary-950/40 pb-1">Gateway console trace:</span>
                  <div>[SYS] V-LINK sync client daemon initialized successfully.</div>
                  <div>[NET] Gateway status: {simulatedOffline ? 'OFFLINE' : 'ONLINE'}.</div>
                  <div>[SYNC] Active session token validated.</div>
                  {typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('vlink_offline_queue') || '[]')).map((act: any, idx: number) => (
                    <div key={act.id} className="text-amber-500 font-mono">
                      [QUEUE #{idx + 1}] Enqueued action: {act.actionType} | PKT_ID: {act.id} | Timestamp: {act.timestamp}
                    </div>
                  ))}
                  {!simulatedOffline && (
                    <div className="text-primary-400">[DAEMON] Queue buffer processed. All data nodes synced with Cloud.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Member */}
      {selectedMemberEdit && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-scale-up">
          <div className="bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-md rounded-[24px] p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest font-display">Edit Member Profile</h3>
              <button
                onClick={() => setSelectedMemberEdit(null)}
                className="p-1 text-earth-400 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  value={editMemberName}
                  onChange={e => setEditMemberName(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-455 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editMemberPhone}
                  onChange={e => setEditMemberPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">Village *</label>
                  <input
                    type="text"
                    required
                    value={editMemberVillage}
                    onChange={e => setEditMemberVillage(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-450 block mb-1">District</label>
                  <select
                    value={editMemberDistrict}
                    onChange={e => setEditMemberDistrict(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground cursor-pointer"
                  >
                    <option value="Madurai">Madurai</option>
                    <option value="Dindigul">Dindigul</option>
                    <option value="Virudhunagar">Virudhunagar</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Erode">Erode</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-455 block mb-1">Status</label>
                  <select
                    value={editMemberStatus}
                    onChange={e => setEditMemberStatus(e.target.value as any)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 text-foreground cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2 bg-earth-50/50 dark:bg-earth-950/20 rounded-2xl border border-earth-150 mt-1">
                  <span className="text-[10px] font-black text-foreground block">Smartphone</span>
                  <button
                    type="button"
                    onClick={() => setEditMemberHasSmartphone(!editMemberHasSmartphone)}
                    className="p-0 border-0 bg-transparent cursor-pointer"
                  >
                    {editMemberHasSmartphone ? (
                      <ToggleRight className="w-8 h-8 text-purple-650" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-earth-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedMemberEdit(null)}
                  className="h-10 px-4 rounded-xl border border-earth-200 text-earth-650 hover:bg-earth-50 text-xs font-bold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-750 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Member Details */}
      {selectedMemberDetails && (() => {
        const memberCrops = fpoProduce.filter(p => p.farmerId === selectedMemberDetails.id);
        const memberTxns = fpoTransactions.filter(t => {
          return t.fpoId === selectedMemberDetails.fpoId && t.cropName.includes(memberCrops[0]?.cropName.split(' ')[0] || 'Tomato');
        });

        return (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-scale-up">
            <div className="bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-xl rounded-[24px] p-6 shadow-2xl space-y-6 text-left max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-foreground font-display">{selectedMemberDetails.fullName}</h3>
                  <span className="text-[9px] font-mono font-bold text-earth-450 uppercase tracking-wider block mt-0.5">
                    Farmer ID: {selectedMemberDetails.id} | Joined: {selectedMemberDetails.joinDate}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMemberDetails(null)}
                  className="p-1 text-earth-400 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-earth-50/50 dark:bg-earth-950/25 rounded-xl border border-earth-100">
                  <span className="text-[9px] text-earth-450 uppercase block">Contact Details</span>
                  <span className="font-bold text-foreground block mt-1">📞 {selectedMemberDetails.phone}</span>
                </div>
                <div className="p-3 bg-earth-50/50 dark:bg-earth-950/25 rounded-xl border border-earth-100">
                  <span className="text-[9px] text-earth-450 uppercase block">Farming Location</span>
                  <span className="font-bold text-foreground block mt-1">📍 {selectedMemberDetails.village}, {selectedMemberDetails.district}</span>
                </div>
              </div>

              {/* Registered Crop Supply logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Registered FPO Crop supply</h4>
                {memberCrops.length === 0 ? (
                  <p className="text-xs text-earth-450 italic">No crops reported to FPO by this member yet.</p>
                ) : (
                  <div className="border border-earth-150 dark:border-earth-900 rounded-2xl overflow-hidden divide-y divide-earth-100 dark:divide-earth-900/10">
                    {memberCrops.map(c => (
                      <div key={c.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-earth-50/20">
                        <div>
                          <span className="font-bold text-foreground block">{c.cropName}</span>
                          <span className="text-earth-450 text-[10px]">Expected harvest: <span className="font-bold">{c.expectedHarvestDate}</span></span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground block">{c.availableQuantity} / {c.expectedQuantity} {c.unit}</span>
                          <span className="text-purple-650 font-bold text-[10px]">₹{c.pricePerKg}/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction History log */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">B2B Aggregated Transaction logs</h4>
                {memberTxns.length === 0 ? (
                  <p className="text-xs text-earth-450 italic">No bulk B2B transaction dispatches linked to this member yet.</p>
                ) : (
                  <div className="space-y-2">
                    {memberTxns.map(t => (
                      <div key={t.id} className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono text-purple-600 font-bold block">{t.id}</span>
                          <span className="text-earth-500 text-[10px] mt-0.5">{t.cropName} | Buyer: {t.buyerName}</span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-650 rounded-full font-black text-[9px] uppercase tracking-wider">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-earth-100">
                <button
                  onClick={() => setSelectedMemberDetails(null)}
                  className="h-10 px-5 rounded-xl bg-earth-100 hover:bg-earth-150 text-earth-700 text-xs font-bold cursor-pointer border-0"
                >
                  Close view
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
