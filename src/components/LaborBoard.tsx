'use client';
import { prioritizeJobs } from '@/services/priorityService';

import React, { useState, useMemo } from 'react';
import { useApp, LaborJob } from '@/context/AppContext';
import { 
  Plus, Search, Filter, MapPin, Calendar, 
  IndianRupee, Hammer, Briefcase, History, 
  User, TrendingUp, UserCheck, Check, 
  Settings, Trash2, Edit3, Bookmark, AlertCircle
} from 'lucide-react';
import JobDetails from './JobDetails';
import StatisticsCard from './StatisticsCard';
import EmptyState from './EmptyState';
import ConfirmationDialog from './ConfirmationDialog';
import SuccessModal from './SuccessModal';

export default function LaborBoard() {
  const { 
    laborJobs, createLaborJob, applyForLaborJob, 
    hireLaborWorker, toggleSaveJob, wallets, userName, t, user, language
  } = useApp();

  // Mode: 'worker' (laborer seeking work) vs 'farmer' (farmer hiring laborers)
  const [workspaceMode, setWorkspaceMode] = useState<'worker' | 'farmer'>('worker');

  // Availability state for laborer
  const [isAvailableToday, setIsAvailableToday] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recommended');
  const [jobsPage, setJobsPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [minWage, setMinWage] = useState(300);

  // Selected job details overlay
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Application Flow state
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [showConfirmApply, setShowConfirmApply] = useState(false);
  const [showApplySuccess, setShowApplySuccess] = useState(false);

  // Post Job form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCategory, setNewJobCategory] = useState<LaborJob['category']>('Land Preparation');
  const [newJobWage, setNewJobWage] = useState(400);
  const [newJobDuration, setNewJobDuration] = useState('3 Days');
  const [newJobWorkers, setNewJobWorkers] = useState(3);
  const [newJobDate, setNewJobDate] = useState(new Date().toISOString().split('T')[0]);
  const [newJobVillage, setNewJobVillage] = useState('');
  const [newJobTaluk, setNewJobTaluk] = useState('');
  const [newJobDistrict, setNewJobDistrict] = useState('Madurai');
  const [newJobSkills, setNewJobSkills] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');

  // Extract unique districts
  const districtsList = useMemo(() => {
    const districts = laborJobs.map(job => job.district);
    return ['all', ...Array.from(new Set(districts))];
  }, [laborJobs]);

  // Categories list for filtering
  const getLocalizedCategory = (cat: string) => {
    if (language !== 'ta') {
      if (cat === 'all') return 'All Work';
      if (cat === 'Land Preparation') return 'Tillage / Land Prep';
      if (cat === 'Planting') return 'Planting / Sowing';
      if (cat === 'Fertilizer Application') return 'Fertilizer';
      if (cat === 'Pesticide Spraying') return 'Spraying';
      return cat;
    }
    switch (cat) {
      case 'all': return 'அனைத்து வேலைகளும்';
      case 'Land Preparation': return 'உழவு / நில தயாரிப்பு';
      case 'Planting': return 'நடவு / விதைப்பு';
      case 'Weeding': return 'களை எடுத்தல்';
      case 'Fertilizer Application': return 'உரமிடுதல்';
      case 'Irrigation': return 'நீர் பாசனம்';
      case 'Pesticide Spraying': return 'மருந்து தெளித்தல்';
      case 'Harvesting': return 'அறுவடை';
      case 'Packaging': return 'மூட்டை கட்டுதல் / பேக்கேஜிங்';
      case 'Loading & Unloading': return 'ஏற்றுதல் / இறக்குதல்';
      case 'Other Farm Work': return 'இதர விவசாய வேலை';
      default: return cat;
    }
  };

  const categories = [
    { id: 'all', label: 'All Work' },
    { id: 'Land Preparation', label: 'Tillage / Land Prep' },
    { id: 'Planting', label: 'Planting / Sowing' },
    { id: 'Weeding', label: 'Weeding' },
    { id: 'Fertilizer Application', label: 'Fertilizer' },
    { id: 'Irrigation', label: 'Irrigation' },
    { id: 'Pesticide Spraying', label: 'Spraying' },
    { id: 'Harvesting', label: 'Harvesting' },
    { id: 'Packaging', label: 'Packaging' }
  ];

  // Filters & sorts jobs using prioritizeJobs service
  const processedJobs = useMemo(() => {
    return prioritizeJobs(laborJobs, 'Madurai', 'Othakadai', sortOption, {
      category: selectedCategory,
      district: selectedDistrict,
      maxPrice: undefined,
      minRating: undefined
    });
  }, [laborJobs, selectedCategory, selectedDistrict, sortOption]);

  const searchedJobs = useMemo(() => {
    let results = [...processedJobs];
    // Apply wage filter
    results = results.filter(job => job.wages >= minWage);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(job =>
        job.title.toLowerCase().includes(q) ||
        job.village.toLowerCase().includes(q) ||
        job.district.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [processedJobs, minWage, searchQuery]);

  const farmerPostings = useMemo(() => {
    return laborJobs.filter(job => job.farmerId === user?.id);
  }, [laborJobs, user?.id]);

  // Worker's jobs data
  const workerAppliedJobs = useMemo(() => {
    return laborJobs.filter(job => job.status === 'applied');
  }, [laborJobs]);

  const workerSavedJobs = useMemo(() => {
    return laborJobs.filter(job => job.saved);
  }, [laborJobs]);

  const workerActiveJobs = useMemo(() => {
    return laborJobs.filter(job => job.status === 'accepted' || job.status === 'ongoing');
  }, [laborJobs]);

  const workerCompletedJobs = useMemo(() => {
    return laborJobs.filter(job => job.status === 'completed');
  }, [laborJobs]);

  // Worker earnings summary
  const workerEarnings = useMemo(() => {
    const totalCount = workerActiveJobs.length + workerCompletedJobs.length;
    // Calculate total settled earnings from completed jobs (simulated)
    const activeWages = workerActiveJobs.reduce((sum, j) => sum + (j.wages * parseInt(j.duration)), 0);
    const completedWages = 2700; // Simulated historical earnings seed

    return {
      activeWages,
      completedWages,
      totalJobsCount: totalCount
    };
  }, [workerActiveJobs, workerCompletedJobs]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobVillage.trim()) return;

    createLaborJob({
      title: newJobTitle,
      wages: Number(newJobWage),
      location: `${newJobVillage}, ${newJobDistrict}`,
      date: newJobDate,
      duration: newJobDuration,
      description: newJobDesc || 'Standard agricultural field labor support needed.',
      workersNeeded: Number(newJobWorkers),
      skills: newJobSkills.split(',').map(s => s.trim()).filter(Boolean),
      village: newJobVillage,
      taluk: newJobTaluk || newJobVillage,
      district: newJobDistrict,
      category: newJobCategory
    });

    // Reset Form
    setNewJobTitle('');
    setNewJobVillage('');
    setNewJobTaluk('');
    setNewJobSkills('');
    setNewJobDesc('');
    setShowPostForm(false);
  };

  const triggerConfirmApply = (jobId: string) => {
    setApplyJobId(jobId);
    setShowConfirmApply(true);
  };

  const handleConfirmApplySubmit = () => {
    if (!applyJobId) return;
    applyForLaborJob(applyJobId);
    setShowConfirmApply(false);
    setSelectedJobId(null);
    setShowApplySuccess(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Switcher & Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {language === 'ta' ? 'விவசாய தொழிலாளர் சந்தை' : 'Farm Labor Marketplace'}
          </h1>
          <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
            {language === 'ta'
              ? 'சரிபார்க்கப்பட்ட பருவகால விவசாய தொழிலாளர்களுடன் இணையுங்கள் அல்லது மாவட்ட வாரையாக விவசாய வேலைகளைப் பாருங்கள்.'
              : 'Connect with verified seasonal farm workers or browse local farm jobs in agricultural districts.'}
          </p>
        </div>

        {/* Switcher Tab Buttons */}
        <div className="inline-flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-950/40 border border-earth-200/55 dark:border-earth-900/40 w-fit shrink-0">
          <button
            onClick={() => setWorkspaceMode('worker')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-0 ${
              workspaceMode === 'worker'
                ? 'bg-white dark:bg-[#111714] text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-earth-500 dark:text-earth-400 hover:text-foreground'
            }`}
          >
            {language === 'ta' ? 'தொழிலாளர் பலகை' : 'Worker Board'}
          </button>
          <button
            onClick={() => setWorkspaceMode('farmer')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-0 ${
              workspaceMode === 'farmer'
                ? 'bg-white dark:bg-[#111714] text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-earth-500 dark:text-earth-400 hover:text-foreground'
            }`}
          >
            {language === 'ta' ? 'விவசாயி பணியமர்த்தும் மையம்' : 'Farmer Hiring Desk'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKER WORKSPACE */}
      {/* ========================================================================= */}
      {workspaceMode === 'worker' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Availability Status Card */}
          <div className="p-6 rounded-3xl border border-primary-500/25 bg-white dark:bg-[#111714] shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-foreground">
                  {language === 'ta' ? 'இன்று வேலைக்கு போக விருப்பமா?' : 'Do you want to go to work today?'}
                </h3>
                <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                  {language === 'ta' ? 'உடனடி வேலை வாய்ப்புகளைப் பெற உங்கள் சாய்ஸைத் தேர்ந்தெடுக்கவும்.' : 'Choose your preference for instant matching.'}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAvailableToday(true)}
                  className={`flex-1 sm:flex-none h-12 px-8 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 border-0 cursor-pointer ${
                    isAvailableToday
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-earth-50 dark:bg-[#151c19] text-foreground border border-earth-200 dark:border-primary-950/20 hover:bg-earth-50'
                  }`}
                >
                  {language === 'ta' ? '✅ ஆம்' : '✅ YES'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailableToday(false)}
                  className={`flex-1 sm:flex-none h-12 px-8 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 border-0 cursor-pointer ${
                    !isAvailableToday
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-earth-50 dark:bg-[#151c19] text-foreground border border-earth-200 dark:border-primary-950/20 hover:bg-earth-50'
                  }`}
                >
                  {language === 'ta' ? '❌ இல்லை' : '❌ NO'}
                </button>
              </div>
            </div>

            {isAvailableToday && (
              <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>📞</span>
                  <span>
                    {language === 'ta' 
                      ? 'வேலை வாய்ப்பு பற்றி தெரிந்துகொள்ள எங்கள் Customer Care-ஐ அழைக்கவும்.' 
                      : 'Please call our Customer Care to discuss available job postings.'}
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:1800-VLINK-HELP"
                    className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 no-underline cursor-pointer"
                  >
                    <span>📞 {language === 'ta' ? 'வாடிக்கையாளர் சேவை 1 (இலவசம்)' : 'Customer Care 1 (Toll Free)'}</span>
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-primary-500/20 hover:bg-primary-500/5 text-primary-500 text-xs font-bold flex items-center justify-center gap-1.5 no-underline cursor-pointer"
                  >
                    <span>📞 {language === 'ta' ? 'வாடிக்கையாளர் சேவை 2' : 'Customer Care 2'} (+91 98765 43210)</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard
              title={language === 'ta' ? 'கிடைக்கும் வேலைகள்' : 'Available Jobs'}
              value={searchedJobs.length}
              icon={Briefcase}
              color="emerald"
              description={language === 'ta' ? 'உங்கள் பகுதியில் உள்ள வேலைகள்' : 'Open jobs in your region'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'உங்கள் விண்ணப்பங்கள்' : 'Your Applications'}
              value={workerAppliedJobs.length}
              icon={History}
              color="blue"
              description={language === 'ta' ? 'விவசாயிகளின் பரிசீலனையில்' : 'Reviewing by hiring farmers'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'செயலில் உள்ள முன்பதிவுகள்' : 'Active Bookings'}
              value={workerActiveJobs.length}
              icon={UserCheck}
              color="amber"
              description={language === 'ta' ? 'திட்டமிடப்பட்ட விதைப்பு/அறுவடை' : 'Scheduled sowing/harvesting'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'ஈட்டிய கூலி' : 'Earned Wage'}
              value={`₹${(wallets.labor).toLocaleString()}`}
              icon={TrendingUp}
              color="stone"
              description={language === 'ta' ? 'பணப்பையில் செலுத்தப்பட்டது' : 'Cleared to worker wallet'}
            />
          </div>

          {/* Search, Wage filter, & Category Tabs */}
          <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'வேலைகள், விதைப்பு, அறுவடை, கிராமங்களைத் தேடவும்...' : 'Search jobs, sowing, harvesting, villages...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="vlink-input pl-10 text-xs h-11"
                />
              </div>

              {/* District dropdown */}
              <div className="relative w-full md:w-56">
                <MapPin className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="vlink-input pl-10 text-xs h-11 cursor-pointer"
                >
                  <option value="all">{language === 'ta' ? 'அனைத்து மாவட்டங்களும்' : 'All Districts'}</option>
                  {districtsList.filter(d => d !== 'all').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Minimum wage slider */}
              <div className="w-full md:w-52 px-1 space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-earth-500">
                  <span>{language === 'ta' ? 'குறைந்தபட்ச கூலி:' : 'Min Wage:'}</span>
                  <span className="text-foreground font-bold">₹{minWage}/{language === 'ta' ? 'நாள்' : 'day'}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="600"
                  step="20"
                  value={minWage}
                  onChange={(e) => setMinWage(Number(e.target.value))}
                  className="w-full h-1.5 bg-earth-200 dark:bg-[#26332a] rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-earth-400 uppercase tracking-wider shrink-0 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'வடிகட்டிகள்:' : 'Filters:'}</span>
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setJobsPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
                    selectedCategory === cat.id
                      ? 'bg-primary-500 border-primary-500 text-white shadow-sm font-black'
                      : 'bg-transparent border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 hover:border-primary-500/40 hover:text-foreground'
                  }`}
                >
                  {getLocalizedCategory(cat.id)}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Listings Board */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Open Job Openings ({searchedJobs.length})
            </h2>

            {searchedJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={language === 'ta' ? 'வேலைகள் எதுவும் கிடைக்கவில்லை' : 'No Farm Jobs Found'}
                description={language === 'ta' ? 'எந்த வேலை பொருத்தமும் கிடைக்கவில்லை. வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.' : "We couldn't find any job matches. Try raising the distance or lowering the wage filter."}
                actionText={language === 'ta' ? 'வடிகட்டிகளை மீட்டமை' : 'Reset Filters'}
                onActionClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDistrict('all');
                  setMinWage(300);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchedJobs.slice((jobsPage - 1) * 4, jobsPage * 4).map((job) => (
                  <div key={job.id} className="rounded-3xl border border-earth-150 dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-earth-50 dark:bg-earth-900 text-primary-600 dark:text-primary-400 border border-primary-500/10">
                          {getLocalizedCategory(job.category)}
                        </span>
                        
                        {/* Saved indicator icon */}
                        {job.saved && (
                          <span className="text-amber-500 flex items-center gap-0.5 text-[9px] font-bold">
                            <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{language === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved'}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-base text-foreground line-clamp-1 leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-xs text-earth-400 font-semibold mt-1">
                        {language === 'ta'
                          ? `வேலை வழங்குபவர்: ${job.farmerName} • கிராமம்: ${job.village}`
                          : `Employer: ${job.farmerName} • Village: ${job.village}`}
                      </p>
                      
                      <p className="text-xs text-earth-500 dark:text-earth-400 mt-3 line-clamp-2 leading-relaxed font-semibold">
                        {job.description}
                      </p>
                    </div>

                    <div className="border-t border-earth-100 dark:border-earth-900/30 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">{language === 'ta' ? 'கூலி விகிதம்' : 'Wage Rate'}</span>
                        <span className="text-base font-black text-foreground font-mono">₹{job.wages}<span className="text-xs font-semibold text-earth-400">/{language === 'ta' ? 'நாள்' : 'day'}</span></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJobId(job.id)}
                          className="py-2 px-3.5 rounded-xl border border-earth-200 dark:border-earth-850 hover:bg-earth-100 text-earth-700 dark:text-earth-300 font-bold text-xs cursor-pointer"
                        >
                          {language === 'ta' ? 'விவரங்களைக் காண்க' : 'View details'}
                        </button>
                        <button
                          onClick={() => {
                            if (job.status === 'applied') return;
                            triggerConfirmApply(job.id);
                          }}
                          disabled={job.status === 'applied'}
                          className={`py-2 px-4 rounded-xl font-bold text-xs cursor-pointer border-0 shadow-sm ${
                            job.status === 'applied'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed'
                              : 'bg-primary-500 hover:bg-primary-600 text-white'
                          }`}
                        >
                          {job.status === 'applied' ? (language === 'ta' ? '✓ விண்ணப்பிக்கப்பட்டது' : '✓ Applied') : (language === 'ta' ? 'விண்ணப்பி' : 'Apply')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved & Applied Work sections */}
          {(workerSavedJobs.length > 0 || workerAppliedJobs.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              
              {/* Saved Jobs */}
              {workerSavedJobs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{language === 'ta' ? `சேமித்த வேலைகள் (${workerSavedJobs.length})` : `Saved Positions (${workerSavedJobs.length})`}</span>
                  </h3>
                  <div className="space-y-3">
                    {workerSavedJobs.map((sj) => (
                      <div key={sj.id} className="p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-xs text-foreground truncate max-w-[200px]">{sj.title}</h4>
                          <span className="text-[10px] text-earth-400 block font-mono mt-0.5">₹{sj.wages}/{language === 'ta' ? 'நாள்' : 'day'} • {sj.village}</span>
                        </div>
                        <button
                          onClick={() => setSelectedJobId(sj.id)}
                          className="py-1.5 px-3 rounded-lg bg-earth-50 hover:bg-earth-100 dark:bg-earth-900 text-earth-700 dark:text-earth-300 font-bold text-[10px] cursor-pointer border-0"
                        >
                          {language === 'ta' ? 'விண்ணப்பி' : 'Apply'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied Jobs */}
              {workerAppliedJobs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-primary-500" />
                    <span>{language === 'ta' ? `விண்ணப்பித்த வேலைகள் (${workerAppliedJobs.length})` : `Applied Applications (${workerAppliedJobs.length})`}</span>
                  </h3>
                  <div className="space-y-3">
                    {workerAppliedJobs.map((aj) => (
                      <div key={aj.id} className="p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-xs text-foreground truncate max-w-[200px]">{aj.title}</h4>
                          <span className="text-[10px] text-earth-400 block font-mono mt-0.5">{aj.farmerName} • {aj.village}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                          {language === 'ta' ? 'பரிசீலனையில் உள்ளது' : 'Under Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* FARMER (HIRING MANAGER) WORKSPACE */}
      {/* ========================================================================= */}
      {workspaceMode === 'farmer' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Farmer Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard
              title={language === 'ta' ? 'பதிவிட்ட வேலைகள்' : 'Jobs Posted'}
              value={farmerPostings.length}
              icon={Briefcase}
              color="emerald"
              description={language === 'ta' ? 'நீங்கள் பதிவிட்ட வேலைகள்' : 'Your listed positions'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'பணியமர்த்திய ஆட்கள்' : 'Applicants Hired'}
              value={farmerPostings.filter(j => j.status === 'accepted').length}
              icon={UserCheck}
              color="blue"
              description={language === 'ta' ? 'செயலில் உள்ள பணியமர்த்தல்கள்' : 'Active seasonal hires'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'காலியிடங்கள்' : 'Open Positions'}
              value={farmerPostings.filter(j => j.status === 'open' || j.status === 'applied').length}
              icon={AlertCircle}
              color="amber"
              description={language === 'ta' ? 'விண்ணப்பத்திற்காக காத்திருப்பவை' : 'Awaiting worker applications'}
            />
            <StatisticsCard
              title={language === 'ta' ? 'எஸ்க்ரோவில் உள்ள ஊதியம்' : 'Escrow Wage Locked'}
              value="₹3,200" // Mock locked escrow for active workers
              icon={TrendingUp}
              color="stone"
              description={language === 'ta' ? 'V-LINK எஸ்க்ரோவால் பாதுகாக்கப்பட்டது' : 'Secured by V-LINK Escrow'}
            />
          </div>

          {/* Action Header */}
          <div className="flex justify-between items-center border-b border-earth-150 dark:border-earth-900/40 pb-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              {language === 'ta' ? `உங்கள் வேலை பதிவுகளை நிர்வகிக்கவும் (${farmerPostings.length})` : `Manage Your Job Postings (${farmerPostings.length})`}
            </h2>
            <button
              onClick={() => setShowPostForm(true)}
              className="py-2.5 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ta' ? 'புதிய வேலை பதிவிடவும்' : 'Post New Farm Job'}</span>
            </button>
          </div>

          {/* Farmer Job Postings list */}
          {farmerPostings.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={language === 'ta' ? 'உங்கள் முதல் விவசாய வேலையை பதிவிடவும்' : 'Post Your First Farm Job'}
              description={language === 'ta' ? 'அறுவடை, நில தயாரிப்பு அல்லது நீர் பாசனத்திற்கு உள்ளூர் சரிபார்க்கப்பட்ட தொழிலாளர்களை பணியமர்த்தவும். உத்தரவாதமான நிலையான ஊதியங்களுடன் நேரடி ஒப்பந்தம்.' : 'Hire local verified laborers for harvesting, land prep, or irrigation. Direct contract with guaranteed fixed wages.'}
              actionText={language === 'ta' ? 'விவசாய வேலை பதிவிடவும்' : 'Post Farm Job'}
              onActionClick={() => setShowPostForm(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {farmerPostings.map((job) => (
                <div key={job.id} className="rounded-3xl border border-earth-150 dark:border-earth-900/35 bg-white dark:bg-[#111714] p-5 shadow-sm space-y-4 hover-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-foreground">{job.title}</h4>
                      <p className="text-[10px] text-earth-400 font-bold mt-1">
                        {language === 'ta'
                          ? `வகை: ${getLocalizedCategory(job.category)} • இடம்: ${job.village}`
                          : `Category: ${getLocalizedCategory(job.category)} • Location: ${job.village}`}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      job.status === 'accepted' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {job.status === 'accepted' ? (language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்டது' : 'Hired') : (language === 'ta' ? 'ஆட்கள் தேவை' : 'Hiring')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-2xl">
                    <div>
                      <span className="text-[8px] text-earth-400 block uppercase font-bold">{language === 'ta' ? 'கூலி' : 'Wages'}</span>
                      <span className="font-black text-foreground block font-mono">₹{job.wages}/{language === 'ta' ? 'நா' : 'd'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-earth-400 block uppercase font-bold">{language === 'ta' ? 'வேலையாட்கள்' : 'Workers'}</span>
                      <span className="font-black text-foreground block">{job.workersNeeded}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-earth-400 block uppercase font-bold">{language === 'ta' ? 'விண்ணப்பங்கள்' : 'Applicants'}</span>
                      <span className="font-black text-foreground block">{job.applicantsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100 dark:border-earth-900/20">
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="py-1 px-3 rounded-lg border border-earth-200 dark:border-earth-850 hover:bg-earth-100 text-earth-700 dark:text-earth-300 font-bold text-[10px] cursor-pointer"
                    >
                      {language === 'ta' ? 'விண்ணப்பங்களின் பதிவு' : 'Applicants Registry'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED OVERLAYS & MODAL DIALOGS */}
      {/* ========================================================================= */}

      {/* Job Details Slide-over panel */}
      {selectedJobId && (
        <JobDetails
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onApply={triggerConfirmApply}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmApply}
        title={language === 'ta' ? 'விவசாய வேலைக்கு விண்ணப்பிக்கவா?' : 'Apply for Farm Job?'}
        description={language === 'ta' ? 'விண்ணப்பிப்பதன் மூலம், தேவையான திறன்கள் உங்களிடம் உள்ளன என்றும் குறிப்பிட்ட வேலை நாளில் வேலைக்கு வர முடியும் என்றும் உறுதிப்படுத்துகிறீர்கள். விவசாயி உங்கள் சுயவிவரத்தை ஆய்வு செய்து ஒப்புதல் அளிப்பார்.' : 'By applying, you verify that you have the skills required and are available on the specified work date. The farmer will review your profile to approve.'}
        confirmText={language === 'ta' ? 'விண்ணப்பத்தை சமர்ப்பிக்கவும்' : 'Submit Application'}
        cancelText={language === 'ta' ? 'வேலை விவரங்களை சரிபார்க்கவும்' : 'Review Job Details'}
        onConfirm={handleConfirmApplySubmit}
        onCancel={() => setShowConfirmApply(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showApplySuccess}
        title={language === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!' : 'Application Submitted!'}
        description={language === 'ta' ? `உங்கள் விண்ணப்பம் வேலை வழங்குபவருக்கு அனுப்பப்பட்டுள்ளது. உங்கள் விண்ணப்பம் ஏற்கப்பட்டால் உங்களுக்கு அறிவிப்பு வரும். வேலை முடிந்ததும் உங்கள் பணப்பையைச் சரிபார்க்கவும்.` : 'Your worker profile has been sent to Ramanathan Swamy. You will receive a notification if you are accepted. Check your wallet balance after completion.'}
        actionText={language === 'ta' ? 'வேலை விண்ணப்பங்களைக் கண்காணிக்கவும்' : 'Track Job Applications'}
        onActionClick={() => {
          setShowApplySuccess(false);
          // Auto route to worker applied list
          setWorkspaceMode('worker');
        }}
      />

      {/* Post Job Form Modal Drawer */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => setShowPostForm(false)}
          />
          <div className="relative bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-lg rounded-[24px] p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-earth-150 dark:border-earth-900/30 pb-3">
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                {language === 'ta' ? 'பருவகால வேலை பதிவிடவும்' : 'Post Seasonal Job'}
              </h2>
              <button
                onClick={() => setShowPostForm(false)}
                className="p-1 text-earth-450 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  {language === 'ta' ? 'வேலை தலைப்பு / நோக்கம்' : 'Job Title / Scope'}
                </label>
                <input
                  type="text"
                  required
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா. தக்காளி அறுவடை - 5 பேர் தேவை' : 'e.g. Tomato Harvesting - 5 workers needed'}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'வகை' : 'Category'}
                  </label>
                  <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value as any)}
                    className="w-full h-10 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                  >
                    <option value="Land Preparation">{getLocalizedCategory('Land Preparation')}</option>
                    <option value="Planting">{getLocalizedCategory('Planting')}</option>
                    <option value="Weeding">{getLocalizedCategory('Weeding')}</option>
                    <option value="Fertilizer Application">{getLocalizedCategory('Fertilizer Application')}</option>
                    <option value="Irrigation">{getLocalizedCategory('Irrigation')}</option>
                    <option value="Pesticide Spraying">{getLocalizedCategory('Pesticide Spraying')}</option>
                    <option value="Harvesting">{getLocalizedCategory('Harvesting')}</option>
                    <option value="Packaging">{getLocalizedCategory('Packaging')}</option>
                    <option value="Loading & Unloading">{getLocalizedCategory('Loading & Unloading')}</option>
                    <option value="Other Farm Work">{getLocalizedCategory('Other Farm Work')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'தினசரி கூலி விகிதம் (₹/நாள்)' : 'Daily Wage Rate (₹/day)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newJobWage}
                    onChange={(e) => setNewJobWage(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'தேவைப்படும் ஆட்கள்' : 'Workers Needed'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newJobWorkers}
                    onChange={(e) => setNewJobWorkers(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'வேலை நாள்' : 'Work Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newJobDate}
                    onChange={(e) => setNewJobDate(e.target.value)}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'கிராமம்' : 'Village'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobVillage}
                    onChange={(e) => setNewJobVillage(e.target.value)}
                    placeholder="e.g. Othakadai"
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    {language === 'ta' ? 'மாவட்டம்' : 'District'}
                  </label>
                  <select
                    value={newJobDistrict}
                    onChange={(e) => setNewJobDistrict(e.target.value)}
                    className="w-full h-10 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                  >
                    <option value="Madurai">Madurai</option>
                    <option value="Thanjavur">Thanjavur</option>
                    <option value="Erode">Erode</option>
                    <option value="Dindigul">Dindigul</option>
                    <option value="Virudhunagar">Virudhunagar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  {language === 'ta' ? 'தேவைப்படும் திறன்கள் (காற்புள்ளியால் பிரிக்கவும்)' : 'Required Skills (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={newJobSkills}
                  onChange={(e) => setNewJobSkills(e.target.value)}
                  placeholder="e.g. Sowing, Harvesting, Hand weeding"
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  {language === 'ta' ? 'வேலை விவரங்கள்' : 'Job Description & details'}
                </label>
                <textarea
                  rows={3}
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder={language === 'ta' ? 'வேலை நேரம், உணவு, போக்குவரத்து வசதி போன்றவற்றை விளக்கவும்...' : 'Explain shift duration, food, pick up facilities or specific tool usage...'}
                  className="w-full p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all border-0"
              >
                {language === 'ta' ? 'சந்தையில் வேலையை பதிவிடவும்' : 'Publish Job to Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
