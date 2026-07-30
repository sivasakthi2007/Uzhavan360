'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sprout, Plus, Trash2, Edit3, Navigation, Calendar, DollarSign,
  TrendingUp, AlertTriangle, CloudRain, HeartPulse, CheckCircle2,
  FileText, ShoppingBag, Wrench, Users,
  ArrowUpRight, ArrowDownLeft, X, Sparkles, RefreshCw
} from 'lucide-react';

export default function MyFarmBoard() {
  const {
    t, language, farms, farmsLoading, addFarm, updateFarm, deleteFarm,
    farmExpenses, addFarmExpense, deleteFarmExpense,
    farmIncomes, addFarmIncome, deleteFarmIncome,
    scanHistory, rentalBookings, laborJobs, schemeApplications
  } = useApp();

  // Local UI State
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [isEditFarmOpen, setIsEditFarmOpen] = useState(false);
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [isLogIncomeOpen, setIsLogIncomeOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);

  // Form States - Add/Edit Farm
  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [landSize, setLandSize] = useState<number>(2.5);
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares'>('acres');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [waterSource, setWaterSource] = useState('Borewell');
  const [primaryCrop, setPrimaryCrop] = useState('Tomato');
  const [secondaryCrop, setSecondaryCrop] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [gpsLocation, setGpsLocation] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Form States - Log Expense
  const [expCategory, setExpCategory] = useState<'seeds' | 'fertilizers' | 'pesticides' | 'rentals' | 'labour' | 'transport' | 'misc'>('seeds');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Form States - Log Income
  const [incBuyer, setIncBuyer] = useState('');
  const [incCrop, setIncCrop] = useState('');
  const [incQty, setIncQty] = useState<number>(0);
  const [incPrice, setIncPrice] = useState<number>(0);
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);

  // GPS fetch helper
  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      alert(language === 'ta' ? 'உங்கள் உலாவியில் ஜிபிஎஸ் வசதி இல்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('[GPS] Access denied/error:', err);
        setIsGpsLoading(false);
        alert(language === 'ta' ? 'ஜிபிஎஸ் அமைவிடத்தை கண்டறிய முடியவில்லை.' : 'Unable to retrieve location coordinates.');
      }
    );
  };

  // Determine active farm
  const activeFarm = useMemo(() => {
    if (farms.length === 0) return null;
    const found = farms.find(f => f.id === selectedFarmId);
    if (found) return found;
    return farms[0];
  }, [farms, selectedFarmId]);

  // Fill edit farm inputs
  const openEditFarmModal = () => {
    if (!activeFarm) return;
    setFarmName(activeFarm.name || '');
    setVillage(activeFarm.village);
    setDistrict(activeFarm.district);
    setState(activeFarm.state);
    setLandSize(activeFarm.land_size);
    setLandUnit(activeFarm.land_unit);
    setSoilType(activeFarm.soil_type);
    setWaterSource(activeFarm.water_source);
    setPrimaryCrop(activeFarm.primary_crop);
    setSecondaryCrop(activeFarm.secondary_crop || '');
    setSowingDate(activeFarm.sowing_date);
    setExpectedHarvestDate(activeFarm.expected_harvest_date);
    setGpsLocation(activeFarm.gps_location || '');
    setIsEditFarmOpen(true);
  };

  // Sowing vs harvest dates crop stage computation
  const cropStageInfo = useMemo(() => {
    if (!activeFarm) return { stage: 'N/A', percent: 0 };
    const sowing = new Date(activeFarm.sowing_date);
    const harvest = new Date(activeFarm.expected_harvest_date);
    const today = new Date();

    const totalDays = Math.max(1, (harvest.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));
    const passedDays = Math.max(0, (today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));
    
    const percent = Math.min(100, Math.round((passedDays / totalDays) * 100));
    
    let stage = language === 'ta' ? 'விதைப்பு நிலை' : 'Sowing';
    if (passedDays > 75) {
      stage = language === 'ta' ? 'அறுவடை நிலை' : 'Maturity / Harvest';
    } else if (passedDays > 45) {
      stage = language === 'ta' ? 'பூக்கும் நிலை' : 'Flowering & Fruiting';
    } else if (passedDays > 15) {
      stage = language === 'ta' ? 'வளர்ச்சி நிலை' : 'Vegetative Growth';
    }

    return { stage, percent };
  }, [activeFarm, language]);

  // Expenses filter
  const currentExpenses = useMemo(() => {
    if (!activeFarm) return [];
    return farmExpenses.filter(e => e.farm_id === activeFarm.id);
  }, [farmExpenses, activeFarm]);

  // Income filter
  const currentIncomes = useMemo(() => {
    if (!activeFarm) return [];
    return farmIncomes.filter(i => i.farm_id === activeFarm.id);
  }, [farmIncomes, activeFarm]);

  // Calculations
  const calculations = useMemo(() => {
    const totalExpenses = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalIncome = currentIncomes.reduce((sum, i) => sum + Number(i.total_income), 0);
    const netProfit = totalIncome - totalExpenses;
    return { totalExpenses, totalIncome, netProfit };
  }, [currentExpenses, currentIncomes]);

  // Actions handlers
  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village || !district || !state || !primaryCrop) return;
    
    await addFarm({
      name: farmName || undefined,
      village,
      district,
      state,
      gps_location: gpsLocation || undefined,
      land_size: landSize,
      land_unit: landUnit,
      soil_type: soilType,
      water_source: waterSource,
      primary_crop: primaryCrop,
      secondary_crop: secondaryCrop || undefined,
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate
    });

    setIsAddFarmOpen(false);
    setFarmName('');
    setVillage('');
    setDistrict('');
    setGpsLocation('');
  };

  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;

    await updateFarm(activeFarm.id, {
      name: farmName || undefined,
      village,
      district,
      state,
      gps_location: gpsLocation || undefined,
      land_size: landSize,
      land_unit: landUnit,
      soil_type: soilType,
      water_source: waterSource,
      primary_crop: primaryCrop,
      secondary_crop: secondaryCrop || undefined,
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate
    });

    setIsEditFarmOpen(false);
  };

  const handleDeleteFarm = async () => {
    if (!activeFarm) return;
    if (confirm(language === 'ta' ? 'இந்த பண்ணையை நிச்சயமாக நீக்க வேண்டுமா?' : 'Are you sure you want to delete this farm?')) {
      await deleteFarm(activeFarm.id);
      setSelectedFarmId('');
      setIsEditFarmOpen(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm || expAmount <= 0) return;

    await addFarmExpense({
      farm_id: activeFarm.id,
      category: expCategory,
      amount: expAmount,
      description: expDesc || undefined,
      date: expDate
    });

    setIsLogExpenseOpen(false);
    setExpAmount(0);
    setExpDesc('');
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm || incQty <= 0 || incPrice <= 0) return;

    const total = incQty * incPrice;
    await addFarmIncome({
      farm_id: activeFarm.id,
      buyer_name: incBuyer || undefined,
      crop_sold: incCrop || activeFarm.primary_crop,
      quantity: incQty,
      price_per_unit: incPrice,
      total_income: total,
      date: incDate
    });

    setIsLogIncomeOpen(false);
    setIncBuyer('');
    setIncCrop('');
    setIncQty(0);
    setIncPrice(0);
  };

  // Helper: dynamic timeline list
  const timelineEvents = useMemo(() => {
    if (!activeFarm) return [];
    
    const events = [
      {
        title: language === 'ta' ? 'விதைப்பு' : 'Sowing Completed',
        description: `${activeFarm.primary_crop} ${language === 'ta' ? 'விதைக்கப்பட்டது' : 'sown'}`,
        date: activeFarm.sowing_date,
        icon: Sprout,
        color: 'text-emerald-500 bg-emerald-500/10'
      },
      {
        title: language === 'ta' ? 'பாசனம்' : 'Irrigation Done',
        description: language === 'ta' ? 'முதல் நீர் பாய்ச்சல் செய்யப்பட்டது' : 'First dose irrigation executed',
        date: new Date(new Date(activeFarm.sowing_date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        icon: CloudRain,
        color: 'text-blue-500 bg-blue-500/10'
      },
      {
        title: language === 'ta' ? 'உரமிடல்' : 'Fertilization Applied',
        description: language === 'ta' ? 'NPK இயற்கை உரம் இடப்பட்டது' : 'Organic compost applied',
        date: new Date(new Date(activeFarm.sowing_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        icon: Sparkles,
        color: 'text-amber-500 bg-amber-500/10'
      }
    ];

    // Filter disease scans matching user scans
    scanHistory.forEach(scan => {
      const sowingTime = new Date(activeFarm.sowing_date).getTime();
      const harvestTime = new Date(activeFarm.expected_harvest_date).getTime();
      const scanTime = scan.created_at ? new Date(scan.created_at).getTime() : 0;
      
      if (scanTime >= sowingTime && scanTime <= harvestTime) {
        events.push({
          title: language === 'ta' ? 'பயிர் பரிசோதனை' : 'Disease Scan',
          description: `${scan.disease_name} (${scan.confidence}%)`,
          date: scan.created_at ? scan.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          icon: HeartPulse,
          color: scan.disease_name.includes('Healthy') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
        });
      }
    });

    events.push({
      title: language === 'ta' ? 'அறுவடை' : 'Expected Harvest',
      description: language === 'ta' ? 'பயிர் அறுவடை செய்யும் திட்டமிடப்பட்ட நாள்' : 'Target crop harvesting day',
      date: activeFarm.expected_harvest_date,
      icon: Calendar,
      color: 'text-primary-500 bg-primary-500/10'
    });

    currentIncomes.forEach(inc => {
      events.push({
        title: language === 'ta' ? 'விளைச்சல் விற்பனை' : 'Crop Sold',
        description: `${inc.crop_sold} - ${inc.quantity} kg @ ₹${inc.price_per_unit}`,
        date: inc.date,
        icon: DollarSign,
        color: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/30'
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeFarm, scanHistory, currentIncomes, language]);

  // Navigate helper
  const navigateToTab = (tabName: string) => {
    window.location.hash = ''; 
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (farmsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100 dark:border-primary-950/30 border-t-primary-500 animate-spin" />
        <span className="text-xs font-bold text-earth-500 tracking-wider">LOADING FARM HUB RECORDS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* ─── CASE A: NO FARMS (ONBOARDING) ─── */}
      {farms.length === 0 ? (
        <div className="max-w-xl mx-auto rounded-[28px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-foreground">{t('onboarding_title')}</h2>
            <p className="text-xs leading-relaxed text-earth-550 dark:text-earth-450 font-semibold">
              {t('onboarding_desc')}
            </p>
          </div>

          <form onSubmit={handleCreateFarm} className="text-left space-y-4 pt-6 border-t border-earth-150/40 dark:border-earth-900/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('farm_name')} (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Tomato Farm"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="vlink-input h-11 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('village')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Melur"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="vlink-input h-11 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('district')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="vlink-input h-11 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('state')}</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="vlink-input h-11 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('land_size')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0.1"
                    value={landSize}
                    onChange={(e) => setLandSize(parseFloat(e.target.value) || 0)}
                    className="vlink-input h-11 text-xs"
                  />
                  <select
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value as 'acres' | 'hectares')}
                    className="vlink-input h-11 text-xs px-3 w-32"
                  >
                    <option value="acres">{language === 'ta' ? 'ஏக்கர்' : 'Acres'}</option>
                    <option value="hectares">{language === 'ta' ? 'ஹெக்டேர்' : 'Hectares'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('soil_type')}</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="vlink-input h-11 text-xs"
                >
                  <option value="Clay Loam">Clay Loam (களிமண் கலவை)</option>
                  <option value="Sandy Soil">Sandy Soil (மணல் மண்)</option>
                  <option value="Black Cotton Soil">Black Cotton Soil (கரிசல் மண்)</option>
                  <option value="Alluvial Soil">Alluvial Soil (வண்டல் மண்)</option>
                  <option value="Red Soil">Red Soil (செம்மண்)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('water_source')}</label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="vlink-input h-11 text-xs"
                >
                  <option value="Borewell">Borewell (ஆழ்துளை கிணறு)</option>
                  <option value="Well Irrigation">Well Irrigation (கிணற்று பாசனம்)</option>
                  <option value="Canal Source">Canal Source (கால்வாய் பாசனம்)</option>
                  <option value="Rainfed">Rainfed (மழைநீர்ப் பாசனம்)</option>
                  <option value="Drip Irrigation System">Drip Irrigation (சொட்டு நீர் பாசனம்)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('primary_crop')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato"
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('secondary_crop')}</label>
                <input
                  type="text"
                  placeholder="e.g. Chilli (Optional)"
                  value={secondaryCrop}
                  onChange={(e) => setSecondaryCrop(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('sowing_date')}</label>
                <input
                  type="date"
                  required
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('expected_harvest_date')}</label>
                <input
                  type="date"
                  required
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('gps_location')} (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Auto-detect coordinates"
                    value={gpsLocation}
                    className="flex-1 h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50/50 dark:bg-earth-900/10 text-foreground text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchGps}
                    className="h-11 px-4 rounded-xl border border-primary-500/30 text-primary-500 hover:bg-primary-500/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isGpsLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5" />
                    )}
                    <span>GPS</span>
                  </button>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs shadow-md cursor-pointer border-0 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('save')} & Setup Farm Dashboard</span>
            </button>
          </form>
        </div>
      ) : (
        /* ─── CASE B: HAS FARMS (DASHBOARD) ─── */
        activeFarm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left and Middle Columns (Dashboard Data) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Header Farm Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 p-5 rounded-3xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-earth-400 block">{t('switch_farm')}</span>
                    <select
                      value={selectedFarmId}
                      onChange={(e) => setSelectedFarmId(e.target.value)}
                      className="text-sm font-black text-foreground bg-transparent border-0 focus:ring-0 outline-none p-0 pr-6 cursor-pointer"
                    >
                      {farms.map((f) => (
                        <option key={f.id} value={f.id} className="dark:bg-[#111714]">
                          {f.name || `${f.primary_crop} (${f.village})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openEditFarmModal}
                    className="h-10 px-4 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-50 dark:hover:bg-earth-900/60 text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-earth-500" />
                    <span>{t('edit_farm')}</span>
                  </button>
                  <button
                    onClick={() => setIsAddFarmOpen(true)}
                    className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer border-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('add_farm')}</span>
                  </button>
                </div>
              </div>

              {/* Main Info Hero Card */}
              <div className="relative overflow-hidden border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm rounded-[24px]">
                {activeFarm.image_url && (
                  <div className="absolute top-0 right-0 w-1/3 h-full hidden md:block opacity-20 dark:opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${activeFarm.image_url})` }} />
                )}
                <div className="p-6 md:p-8 space-y-6 relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-foreground">{activeFarm.name || `${activeFarm.primary_crop} Field`}</h2>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-earth-400 mt-1">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{activeFarm.village}, {activeFarm.district}, {activeFarm.state}</span>
                        {activeFarm.gps_location && <span className="font-mono text-[10px] bg-earth-100 dark:bg-earth-900 text-earth-500 px-1.5 py-0.2 rounded-md">({activeFarm.gps_location})</span>}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black text-earth-400 tracking-wider block">{t('land_size')}</span>
                      <span className="text-lg font-black text-foreground">{activeFarm.land_size} {activeFarm.land_unit === 'acres' ? (language === 'ta' ? 'ஏக்கர்' : 'Acres') : (language === 'ta' ? 'ஹெக்டேர்' : 'Hectares')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-earth-100 dark:border-earth-900/30 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-earth-400 block">{t('primary_crop')}</span>
                      <span className="font-black text-foreground">{activeFarm.primary_crop}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-earth-400 block">{t('soil_type')}</span>
                      <span className="font-bold text-foreground">{activeFarm.soil_type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-earth-400 block">{t('water_source')}</span>
                      <span className="font-bold text-foreground">{activeFarm.water_source}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-earth-400 block">{t('expected_harvest')}</span>
                      <span className="font-bold text-primary-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(activeFarm.expected_harvest_date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="space-y-2 pt-4 border-t border-earth-100 dark:border-earth-900/25">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-foreground flex items-center gap-1">
                        <Sprout className="w-4 h-4 text-emerald-500" />
                        <span>{language === 'ta' ? 'பயிர் நிலை:' : 'Crop Stage:'} <span className="text-primary-500">{cropStageInfo.stage}</span></span>
                      </span>
                      <span className="font-mono text-earth-400">{cropStageInfo.percent}%</span>
                    </div>
                    <div className="h-3 w-full bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${cropStageInfo.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-earth-400">{t('quick_actions')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  
                  <button
                    onClick={() => navigateToTab('diagnosis')}
                    className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900/40 flex flex-col items-center justify-center text-center space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-foreground leading-tight">{language === 'ta' ? 'பயிர் ஆய்வு' : 'Scan Crop'}</span>
                  </button>

                  <button
                    onClick={() => navigateToTab('market')}
                    className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900/40 flex flex-col items-center justify-center text-center space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-foreground leading-tight">{language === 'ta' ? 'பயிர் விற்பனை' : 'Sell Crop'}</span>
                  </button>

                  <button
                    onClick={() => navigateToTab('rentals')}
                    className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900/40 flex flex-col items-center justify-center text-center space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-foreground leading-tight">{language === 'ta' ? 'கருவி வாடகை' : 'Rent Equipment'}</span>
                  </button>

                  <button
                    onClick={() => navigateToTab('labor')}
                    className="p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900/40 flex flex-col items-center justify-center text-center space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-foreground leading-tight">{language === 'ta' ? 'வேலை ஆட்கள்' : 'Find Labour'}</span>
                  </button>

                  <button
                    onClick={() => setIsRecordsOpen(true)}
                    className="col-span-2 sm:col-span-1 p-4 rounded-3xl border border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] hover:bg-earth-50 dark:hover:bg-earth-900/40 flex flex-col items-center justify-center text-center space-y-2 group shadow-xs cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-foreground leading-tight">{language === 'ta' ? 'பண்ணை பதிவுகள்' : 'Farm Records'}</span>
                  </button>

                </div>
              </div>

              {/* Dynamic Visual Timeline */}
              <div className="p-6 border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm rounded-[24px] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span>{t('timeline')}</span>
                  </h3>
                  <span className="text-[10px] font-bold text-earth-400 font-mono bg-earth-50 dark:bg-earth-950 px-2.5 py-1 rounded-full">
                    {activeFarm.primary_crop} Cycle
                  </span>
                </div>

                <div className="relative pl-6 border-l border-earth-150 dark:border-earth-900 space-y-6 py-2 ml-3">
                  {timelineEvents.map((ev, i) => {
                    const IconComp = ev.icon;
                    const isPassed = new Date(ev.date) <= new Date();

                    return (
                      <div key={i} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className={`absolute -left-[35px] w-5 h-5 rounded-full border-4 border-white dark:border-[#141816] flex items-center justify-center shadow-xs transition-colors ${ev.color}`}>
                          <IconComp className="w-2.5 h-2.5" />
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-black flex items-center gap-1.5 ${isPassed ? 'text-foreground' : 'text-earth-400'}`}>
                            <span>{ev.title}</span>
                            {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </h4>
                          <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 leading-normal">{ev.description}</p>
                        </div>

                        <span className="text-[10px] font-bold font-mono text-earth-400 sm:text-right shrink-0 mt-0.5 sm:mt-0">
                          {new Date(ev.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (Alerts & Summaries) */}
            <div className="space-y-8">
              
              {/* Today's Tasks & Alerts */}
              <div className="p-6 border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm rounded-[24px] space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-earth-400">{t('today_tasks')}</h3>
                
                <div className="space-y-3.5">
                  {/* Weather Alert */}
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-300 flex gap-3 text-xs">
                    <CloudRain className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-black block">{t('weather_alert')}</span>
                      <p className="leading-relaxed font-semibold">
                        {language === 'ta' ? 'மிதமான மழை எச்சரிக்கை: அடுத்த 24 மணி நேரத்தில் மழை பெய்ய வாய்ப்புள்ளது. பாசனத்தைத் தள்ளிப்போடுங்கள்.' : 'Moderate Rain: Expect light showers in Melur. Postpone scheduled chemical pesticide sprays.'}
                      </p>
                    </div>
                  </div>

                  {/* Gov Scheme Alert */}
                  <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-300 flex gap-3 text-xs hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => navigateToTab('schemes')}>
                    <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-black block">{t('scheme_alert')}</span>
                      <p className="leading-relaxed font-semibold">
                        {language === 'ta' ? 'PM-KISAN தவணை: தகுதிச் சரிபார்ப்பு கடைசி நாள் நெருங்குகிறது. இப்போதே விண்ணப்பிக்கவும்!' : 'PM-KISAN Deadline: Scheme verification is closing in 5 days. Tap to apply via V-Link.'}
                      </p>
                    </div>
                  </div>

                  {/* Crop Reminder */}
                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300 flex gap-3 text-xs">
                    <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-black block">{t('crop_reminder')}</span>
                      <p className="leading-relaxed font-semibold">
                        {language === 'ta' ? 'NPK உரம்: பயிர் வளர ஆரம்பித்து 35 நாட்கள் ஆகிவிட்டது. இரண்டாவது முறை உரமிடவும்.' : 'Fertilizer Application: Crop has passed day 30. Dose organic NPK compost for tomatoes.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Farm Summary Card */}
              <div className="p-6 border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm rounded-[24px] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-earth-400">{t('farm_summary')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150/40 dark:border-earth-900/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-earth-400 block">{t('expenses')}</span>
                    <span className="text-lg font-black text-red-500 mt-1 block">₹{calculations.totalExpenses}</span>
                  </div>
                  <div className="p-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150/40 dark:border-earth-900/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-earth-400 block">{t('income')}</span>
                    <span className="text-lg font-black text-emerald-500 mt-1 block">₹{calculations.totalIncome}</span>
                  </div>
                </div>

                <div className="p-4.5 bg-earth-50/70 dark:bg-earth-950/30 border border-earth-150/50 dark:border-earth-900/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-earth-400 block">{t('net_profit')}</span>
                    <span className={`text-xl font-black mt-1 block ${calculations.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ₹{calculations.netProfit}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${calculations.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsLogExpenseOpen(true)}
                    className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-650 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border-0"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{t('add_expense')}</span>
                  </button>
                  <button
                    onClick={() => setIsLogIncomeOpen(true)}
                    className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border-0"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>{t('add_income')}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )
      )}

      {/* ─── OVERLAY MODAL 1: ADD FARM ─── */}
      {isAddFarmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-850 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/35 pb-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary-500" />
                <span>{t('add_farm')}</span>
              </h3>
              <button onClick={() => setIsAddFarmOpen(false)} className="p-1.5 rounded-full hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-400 cursor-pointer border-0 bg-transparent">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('farm_name')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato Field A"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('village')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Melur"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('district')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madurai"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('state')}</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('land_size')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0.1"
                      value={landSize}
                      onChange={(e) => setLandSize(parseFloat(e.target.value) || 0)}
                      className="flex-1 h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                    <select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value as 'acres' | 'hectares')}
                      className="h-11 px-3 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent dark:bg-[#111714] text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="acres">{language === 'ta' ? 'ஏக்கர்' : 'Acres'}</option>
                      <option value="hectares">{language === 'ta' ? 'ஹெக்டேர்' : 'Hectares'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('soil_type')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Soil"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('water_source')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Borewell"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('primary_crop')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato"
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('sowing_date')}</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('expected_harvest_date')}</label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-4 border-t border-earth-100 dark:border-earth-900/35 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddFarmOpen(false)}
                  className="h-10 px-5 rounded-xl border border-earth-200 dark:border-earth-800 text-foreground font-bold text-xs cursor-pointer bg-transparent"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OVERLAY MODAL 2: EDIT FARM ─── */}
      {isEditFarmOpen && activeFarm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-850 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/35 pb-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary-500" />
                <span>{t('edit_farm')}</span>
              </h3>
              <button onClick={() => setIsEditFarmOpen(false)} className="p-1.5 rounded-full hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-400 cursor-pointer border-0 bg-transparent">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFarm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('farm_name')}</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('village')}</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('district')}</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('land_size')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={landSize}
                      onChange={(e) => setLandSize(parseFloat(e.target.value) || 0)}
                      className="flex-1 h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                    />
                    <select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value as 'acres' | 'hectares')}
                      className="h-11 px-3 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent dark:bg-[#111714] text-foreground text-xs outline-none"
                    >
                      <option value="acres">{language === 'ta' ? 'ஏக்கர்' : 'Acres'}</option>
                      <option value="hectares">{language === 'ta' ? 'ஹெக்டேர்' : 'Hectares'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('primary_crop')}</label>
                  <input
                    type="text"
                    required
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('sowing_date')}</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-between items-center pt-4 border-t border-earth-100 dark:border-earth-900/35">
                <button
                  type="button"
                  onClick={handleDeleteFarm}
                  className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer border-0 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('delete_farm')}</span>
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditFarmOpen(false)}
                    className="h-10 px-5 rounded-xl border border-earth-200 dark:border-earth-800 text-foreground font-bold text-xs cursor-pointer bg-transparent"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OVERLAY MODAL 3: LOG EXPENSE ─── */}
      {isLogExpenseOpen && activeFarm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-850 w-full max-w-md shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/35 pb-3">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
                <span>{t('add_expense')}</span>
              </h3>
              <button onClick={() => setIsLogExpenseOpen(false)} className="p-1.5 rounded-full hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-400 cursor-pointer border-0 bg-transparent">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('category')}</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as 'seeds' | 'fertilizers' | 'pesticides' | 'rentals' | 'labour' | 'transport' | 'misc')}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent dark:bg-[#111714] text-foreground text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="seeds">{t('seeds')}</option>
                  <option value="fertilizers">{t('fertilizers')}</option>
                  <option value="pesticides">{t('pesticides')}</option>
                  <option value="rentals">{t('rentals')}</option>
                  <option value="labour">{t('labour')}</option>
                  <option value="transport">{t('transport')}</option>
                  <option value="misc">{t('misc')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('amount')} (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1500"
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. purchased organic seed pack"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('sowing_date')}</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-earth-100 dark:border-earth-900/35 justify-end">
                <button
                  type="button"
                  onClick={() => setIsLogExpenseOpen(false)}
                  className="h-10 px-5 rounded-xl border border-earth-200 dark:border-earth-800 text-foreground font-bold text-xs cursor-pointer bg-transparent"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-red-500 hover:bg-red-650 text-white font-bold text-xs cursor-pointer border-0 shadow-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OVERLAY MODAL 4: LOG INCOME ─── */}
      {isLogIncomeOpen && activeFarm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-850 w-full max-w-md shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/35 pb-3">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                <span>{t('add_income')}</span>
              </h3>
              <button onClick={() => setIsLogIncomeOpen(false)} className="p-1.5 rounded-full hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-400 cursor-pointer border-0 bg-transparent">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('buyer')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Mandi / Buyer Name"
                  value={incBuyer}
                  onChange={(e) => setIncBuyer(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">Crop Sold</label>
                <input
                  type="text"
                  required
                  value={incCrop || activeFarm.primary_crop}
                  onChange={(e) => setIncCrop(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('quantity')} (Kg)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incQty || ''}
                    onChange={(e) => setIncQty(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 100"
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-earth-400 block">{t('selling_price')} (₹/Kg)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incPrice || ''}
                    onChange={(e) => setIncPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 35"
                    className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-400 block">{t('sowing_date')}</label>
                <input
                  type="date"
                  required
                  value={incDate}
                  onChange={(e) => setIncDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent text-foreground text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-earth-100 dark:border-earth-900/35 justify-end">
                <button
                  type="button"
                  onClick={() => setIsLogIncomeOpen(false)}
                  className="h-10 px-5 rounded-xl border border-earth-200 dark:border-earth-800 text-foreground font-bold text-xs cursor-pointer bg-transparent"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs cursor-pointer border-0 shadow-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OVERLAY MODAL 5: FARM RECORDS / HISTORY LEDGER ─── */}
      {isRecordsOpen && activeFarm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111714] rounded-3xl border border-earth-200 dark:border-earth-850 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/35 pb-4">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span>{language === 'ta' ? 'பண்ணைப் பதிவுகள் மற்றும் வரலாறு' : 'Farm Records & Integrations Log'}</span>
                </h3>
                <p className="text-[10px] text-earth-400 mt-1">{activeFarm.name} Ledger</p>
              </div>
              <button onClick={() => setIsRecordsOpen(false)} className="p-1.5 rounded-full hover:bg-earth-100 dark:hover:bg-earth-900 text-earth-400 cursor-pointer border-0 bg-transparent">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. EXPENSES LIST */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase">{t('expenses')}</h4>
                    <span className="font-mono text-xs font-black text-red-500">₹{calculations.totalExpenses}</span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {currentExpenses.length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No expenses logged yet.</p>
                    ) : (
                      currentExpenses.map((exp) => (
                        <div key={exp.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-foreground capitalize">{exp.category}</span>
                            {exp.description && <span className="text-earth-400 block text-[9px]">{exp.description}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-red-500">₹{exp.amount}</span>
                            <button
                              onClick={() => deleteFarmExpense(exp.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer border-0 bg-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. INCOME LIST */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase">{t('income')}</h4>
                    <span className="font-mono text-xs font-black text-emerald-500">₹{calculations.totalIncome}</span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {currentIncomes.length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No sales logged yet.</p>
                    ) : (
                      currentIncomes.map((inc) => (
                        <div key={inc.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-foreground">{inc.crop_sold}</span>
                            {inc.buyer_name && <span className="text-earth-400 block text-[9px]">Buyer: {inc.buyer_name} ({inc.quantity} kg)</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-500">₹{inc.total_income}</span>
                            <button
                              onClick={() => deleteFarmIncome(inc.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer border-0 bg-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. EQUIPMENT RENTAL HISTORY INTEGRATION */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-500" />
                      <span>{language === 'ta' ? 'வாடகை உபகரணங்கள்' : 'Equipment Rentals'}</span>
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {rentalBookings.length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No machine rentals recorded.</p>
                    ) : (
                      rentalBookings.map((b) => (
                        <div key={b.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-foreground">{b.itemName}</span>
                            <span className="text-earth-400 block text-[9px]">{b.startDate} to {b.endDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground block">₹{b.totalCost}</span>
                            <span className="text-[9px] uppercase font-bold text-amber-500">{b.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. LABOUR BOOKINGS HISTORY INTEGRATION */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{language === 'ta' ? 'கூலி ஆட்கள் வரலாறு' : 'Labour Hiring'}</span>
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {laborJobs.filter(j => j.status === 'completed' || j.status === 'ongoing' || j.status === 'accepted').length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No labour jobs hired yet.</p>
                    ) : (
                      laborJobs.filter(j => j.status === 'completed' || j.status === 'ongoing' || j.status === 'accepted').map((j) => (
                        <div key={j.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-foreground">{j.category}</span>
                            <span className="text-earth-400 block text-[9px]">{j.village} ({j.duration})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground block">₹{j.wages}/day</span>
                            <span className="text-[9px] uppercase font-bold text-blue-500">{j.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 5. CROP DISEASE SCANS INTEGRATION */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-red-500" />
                      <span>{language === 'ta' ? 'பயிர் பரிசோதனை வரலாறு' : 'Crop Scan History'}</span>
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {scanHistory.length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No disease scans logged.</p>
                    ) : (
                      scanHistory.map((scan) => (
                        <div key={scan.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center gap-3 text-[11px]">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-earth-900 shrink-0">
                            <img src={scan.image_url} alt={scan.disease_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-foreground truncate block">{scan.disease_name}</span>
                            <span className="text-earth-400 text-[9px] font-mono">Confidence: {scan.confidence}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 6. GOVT SCHEMES APPLICATIONS INTEGRATION */}
                <div className="p-5 rounded-2xl border border-earth-200 dark:border-earth-850 bg-earth-50/20 dark:bg-earth-950/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-earth-100 dark:border-earth-900/30 pb-2">
                    <h4 className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{language === 'ta' ? 'விண்ணப்பித்த திட்டங்கள்' : 'Gov Scheme Applications'}</span>
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {schemeApplications.length === 0 ? (
                      <p className="text-[10px] text-earth-400 italic py-4 text-center">No scheme applications submitted.</p>
                    ) : (
                      schemeApplications.map((app) => (
                        <div key={app.id} className="p-2.5 bg-white dark:bg-earth-950 border border-earth-150/40 dark:border-earth-900/10 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-foreground">{app.scheme_name}</span>
                            <span className="text-earth-400 block text-[9px]">{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-primary-500 bg-primary-500/5 px-2 py-0.5 rounded-full">{app.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

            <div className="pt-4 border-t border-earth-100 dark:border-earth-900/35 flex justify-end">
              <button
                onClick={() => setIsRecordsOpen(false)}
                className="h-11 px-6 rounded-2xl bg-earth-100 hover:bg-earth-200 dark:bg-earth-900 dark:hover:bg-earth-850 text-foreground font-black text-xs cursor-pointer border-0"
              >
                Close Records Ledger
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
