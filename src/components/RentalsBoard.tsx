'use client';
import { prioritizeEquipment } from '@/services/priorityService';

import React, { useState, useMemo } from 'react';
import { useApp, RentalItem, RentalBooking } from '@/context/AppContext';
import { 
  Plus, Search, Filter, MapPin, Calendar as CalendarIcon, 
  IndianRupee, Wrench, Truck, ShieldCheck, History, 
  User, TrendingUp, UserCheck, LayoutDashboard, Star, 
  Settings, Trash2, Edit3, X, Check, CheckCircle
} from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import EquipmentDetails from './EquipmentDetails';
import BookingCard from './BookingCard';
import StatisticsCard from './StatisticsCard';
import EmptyState from './EmptyState';
import ConfirmationDialog from './ConfirmationDialog';
import SuccessModal from './SuccessModal';

export default function RentalsBoard() {
  const { 
    rentalItems, rentalBookings, addRentalItem, bookEquipment, 
    cancelRentalBooking, acceptRentalBooking, startRentalBooking, 
    completeRentalBooking, deleteRentalItem, updateRentalItem, wallets, userName, t
  } = useApp();

  // Mode: 'renter' (farmer looking for gear) vs 'owner' (equipment fleet supplier)
  const [workspaceMode, setWorkspaceMode] = useState<'renter' | 'owner'>('renter');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recommended');
  const [rentalsPage, setRentalsPage] = useState(1);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Selected gear details slide-over
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Booking Flow state
  const [bookingItemId, setBookingItemId] = useState<string | null>(null);
  const [bookingDates, setBookingDates] = useState<{ start: string; end: string } | null>(null);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  // Add Machinery listing state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGearName, setNewGearName] = useState('');
  const [newGearType, setNewGearType] = useState<'tractor' | 'harvester' | 'rotavator' | 'tiller' | 'seeder' | 'cultivator' | 'sprayer' | 'pump' | 'truck' | 'tool' | 'other'>('tractor');
  const [newGearCategory, setNewGearCategory] = useState<'tractor' | 'vehicle' | 'tool' | 'harvester' | 'sprayer' | 'pump' | 'other'>('tractor');
  const [newGearDayPrice, setNewGearDayPrice] = useState(1500);
  const [newGearHourPrice, setNewGearHourPrice] = useState(200);
  const [newGearVillage, setNewGearVillage] = useState('');
  const [newGearDistrict, setNewGearDistrict] = useState('Madurai');
  const [newGearImage, setNewGearImage] = useState('');
  const [newGearDesc, setNewGearDesc] = useState('');

  // Edit Machinery listing state
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);

  // Extract unique districts from equipment list
  const districtsList = useMemo(() => {
    const districts = rentalItems.map(item => item.district);
    return ['all', ...Array.from(new Set(districts))];
  }, [rentalItems]);

  // Categories list for tabs
  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'tractor', label: 'Tractors' },
    { id: 'harvester', label: 'Harvesters' },
    { id: 'rotavator', label: 'Rotavators' },
    { id: 'tiller', label: 'Tillers' },
    { id: 'pump', label: 'Water Pumps' },
    { id: 'sprayer', label: 'Sprayers' }
  ];

  // Filters & sorts equipment using prioritizeEquipment service
  const processedGear = useMemo(() => {
    return prioritizeEquipment(rentalItems, 'Madurai', 'Othakadai', sortOption, {
      category: selectedType,
      district: selectedDistrict,
      availability: onlyAvailable ? 'available' : 'all'
    });
  }, [rentalItems, selectedType, selectedDistrict, onlyAvailable, sortOption]);

  const searchedGear = useMemo(() => {
    let results = [...processedGear];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.village.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.equipmentType.toLowerCase().includes(q)
      );
    }
    return results;
  }, [processedGear, searchQuery]);

  // Filter owner's listings (mocking owner owns items listed by Rajan Agri Rentals/vendor_self/vendor_1)
  const ownerListings = useMemo(() => {
    return rentalItems.filter(item => item.vendorId === 'vendor_1' || item.vendorId === 'vendor_self');
  }, [rentalItems]);

  // Filter bookings renter placed
  const renterBookings = useMemo(() => {
    return rentalBookings.filter(b => b.renterId === 'farmer_1');
  }, [rentalBookings]);

  // Filter requests owner received
  const ownerBookingRequests = useMemo(() => {
    return rentalBookings.filter(b => {
      const item = rentalItems.find(r => r.id === b.itemId);
      return item && (item.vendorId === 'vendor_1' || item.vendorId === 'vendor_self');
    });
  }, [rentalBookings, rentalItems]);

  // Owner earnings metrics
  const ownerStats = useMemo(() => {
    const activeBookings = ownerBookingRequests.filter(b => b.status === 'in_progress' || b.status === 'accepted');
    const upcomingBookings = ownerBookingRequests.filter(b => b.status === 'pending');
    
    // Earnings calculated from completed bookings
    const completed = ownerBookingRequests.filter(b => b.status === 'completed');
    const earnings = completed.reduce((sum, b) => sum + b.totalCost, 0);

    return {
      activeFleet: ownerListings.length,
      activeRentals: activeBookings.length,
      upcomingBookings: upcomingBookings.length,
      totalEarnings: earnings
    };
  }, [ownerBookingRequests, ownerListings, ownerBookingRequests]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearName.trim() || !newGearVillage.trim()) return;

    let defaultImg = 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&auto=format&fit=crop&q=80';
    if (newGearType === 'harvester') {
      defaultImg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=80';
    } else if (newGearType === 'pump') {
      defaultImg = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80';
    } else if (newGearType === 'tiller' || newGearType === 'rotavator') {
      defaultImg = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80';
    } else if (newGearType === 'sprayer') {
      defaultImg = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&auto=format&fit=crop&q=80';
    }

    addRentalItem({
      name: newGearName,
      equipmentType: newGearType,
      category: newGearCategory,
      pricePerDay: Number(newGearDayPrice),
      pricePerHour: Number(newGearHourPrice),
      location: `${newGearVillage}, ${newGearDistrict}`,
      village: newGearVillage,
      district: newGearDistrict,
      distanceKm: parseFloat((Math.random() * 8 + 2).toFixed(1)),
      image: newGearImage || defaultImg,
      description: newGearDesc || 'High quality equipment ready for farm operations.'
    });

    // Reset Form
    setNewGearName('');
    setNewGearVillage('');
    setNewGearDesc('');
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateRentalItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const triggerConfirmBooking = (itemId: string, start: string, end: string) => {
    setBookingItemId(itemId);
    setBookingDates({ start, end });
    setShowConfirmBooking(true);
  };

  const handleConfirmBookingSubmit = () => {
    if (!bookingItemId || !bookingDates) return;
    bookEquipment(bookingItemId, bookingDates.start, bookingDates.end);
    setShowConfirmBooking(false);
    setSelectedItemId(null);
    setShowBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Switcher & Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary-500" />
            <span>Farm Equipment Rental</span>
          </h1>
          <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
            Rent high quality farming equipment or list your machinery to generate rental earnings.
          </p>
        </div>

        {/* Switcher Tab Buttons */}
        <div className="inline-flex p-1 rounded-2xl bg-earth-100 dark:bg-earth-950/40 border border-earth-200/50 dark:border-earth-900/40 w-fit shrink-0">
          <button
            onClick={() => setWorkspaceMode('renter')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-0 ${
              workspaceMode === 'renter'
                ? 'bg-white dark:bg-[#111714] text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-earth-500 dark:text-earth-400 hover:text-foreground'
            }`}
          >
            {t('lease_machinery')}
          </button>
          <button
            onClick={() => setWorkspaceMode('owner')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-0 ${
              workspaceMode === 'owner'
                ? 'bg-white dark:bg-[#111714] text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-earth-500 dark:text-earth-400 hover:text-foreground'
            }`}
          >
            {t('fleet_panel')}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RENTER (FARMER LEASING MACHINERY) WORKSPACE */}
      {/* ========================================================================= */}
      {workspaceMode === 'renter' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Dashboard Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard
              title={t('total_gear_available')}
              value={rentalItems.length}
              icon={Wrench}
              color="emerald"
              description={t('machinery_cooperative')}
            />
            <StatisticsCard
              title={t('active_rentals')}
              value={renterBookings.filter(b => b.status === 'in_progress').length}
              icon={Truck}
              color="blue"
              description={t('gear_in_deployment')}
            />
            <StatisticsCard
              title={t('upcoming_bookings')}
              value={renterBookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
              icon={CalendarIcon}
              color="amber"
              description={t('upcoming_bookings_desc')}
            />
            <StatisticsCard
              title="Ecosystem Wallet"
              value={`₹${wallets.farmer.toLocaleString()}`}
              icon={IndianRupee}
              color="stone"
              description={t('farming_credit')}
            />
          </div>

          {/* Search, Categories, & Advanced Filter Panel */}
          <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={t('search_rentals_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="vlink-input pl-10 text-xs h-11"
                />
              </div>

              {/* District Filter Dropdown */}
              <div className="relative w-full md:w-48">
                <MapPin className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setRentalsPage(1); }}
                  className="vlink-input pl-10 text-xs h-11 cursor-pointer"
                >
                  <option value="all">{t('all_districts')}</option>
                  {districtsList.filter(d => d !== 'all').map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative w-full md:w-48">
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setRentalsPage(1); }}
                  className="vlink-input text-xs h-11 cursor-pointer"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Nearest">Nearest</option>
                  <option value="Price">Price</option>
                  <option value="Rating">Rating</option>
                </select>
              </div>

              {/* Available Today Checkbox Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-earth-600 dark:text-earth-400 cursor-pointer shrink-0 py-2">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-earth-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <span>{t('available_today')}</span>
              </label>
            </div>

            {/* Categories horizontal tabs bar */}
            <div className="border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-earth-400 uppercase tracking-wider shrink-0 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Categories:</span>
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedType(cat.id); setRentalsPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
                    selectedType === cat.id
                      ? 'bg-primary-500 border-primary-500 text-white shadow-sm font-black'
                      : 'bg-transparent border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 hover:border-primary-500/40 hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Available Listings ({searchedGear.length})
            </h2>

            {searchedGear.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No Farming Machinery Found"
                description="We couldn't find any rental equipment matching your filters. Try resetting or adjusting filters."
                actionText="Reset Filters"
                onActionClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedDistrict('all');
                  setOnlyAvailable(false);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchedGear.slice((rentalsPage - 1) * 4, rentalsPage * 4).map((item) => (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    onViewClick={(id) => setSelectedItemId(id)}
                    onBookClick={(id) => setSelectedItemId(id)} // Details has calendar selection
                  />
                ))}
              </div>
            )}
          </div>

          {/* Rental Bookings History */}
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-primary-500" />
              <span>Your Lease Bookings History</span>
            </h2>

            {renterBookings.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-earth-200 dark:border-earth-850 bg-white dark:bg-[#111714] text-earth-400 text-xs font-bold">
                No rental bookings placed yet. Find a machinery above to confirm lease.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renterBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={cancelRentalBooking}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* OWNER (EQUIPMENT FLEET SUPPLIER) WORKSPACE */}
      {/* ========================================================================= */}
      {workspaceMode === 'owner' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Owner Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatisticsCard
              title="Active fleet listed"
              value={ownerStats.activeFleet}
              icon={Wrench}
              color="emerald"
              description="Gear published to market"
            />
            <StatisticsCard
              title="Deployments"
              value={ownerStats.activeRentals}
              icon={Truck}
              color="blue"
              description="Currently earning rental lease"
            />
            <StatisticsCard
              title="Open Requests"
              value={ownerStats.upcomingBookings}
              icon={CalendarIcon}
              color="amber"
              description="Awaiting your approval"
            />
            <StatisticsCard
              title="Your Rental Income"
              value={`₹${ownerStats.totalEarnings.toLocaleString()}`}
              icon={TrendingUp}
              color="stone"
              description="Settled to your wallet wallet"
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center border-b border-earth-150 dark:border-earth-900/40 pb-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Manage Your Listed Gear ({ownerListings.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="py-2.5 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>List Machinery</span>
            </button>
          </div>

          {/* Owner Listings Management list */}
          {ownerListings.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="List Your Farm Machinery"
              description="Earn lease income by listing your idle tractors, harvesters, or pump tools. Accessible to thousands of nearby farmers."
              actionText="Publish Your First Gear"
              onActionClick={() => setShowAddForm(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ownerListings.map((item) => (
                <div key={item.id} className="rounded-3xl border border-earth-150 dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 flex gap-4 shadow-sm relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-2xl shrink-0 bg-earth-100 dark:bg-earth-900"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-black text-xs text-foreground truncate">{item.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          item.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-earth-400 font-semibold mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.village} • ₹{item.pricePerDay}/day</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-earth-100 dark:border-earth-900/20 mt-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="py-1 px-2.5 rounded-lg border border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 hover:text-foreground font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteRentalItem(item.id)}
                        className="py-1 px-2.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/5 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Owner Booking Requests & Queue Management */}
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon className="w-4.5 h-4.5 text-primary-500" />
              <span>Incoming Lease Requests ({ownerBookingRequests.length})</span>
            </h2>

            {ownerBookingRequests.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-earth-200 dark:border-primary-950/20 bg-white dark:bg-[#111714] text-earth-400 text-xs font-bold">
                No active rental requests or bookings for your equipment currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerBookingRequests.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isOwnerView={true}
                    onCancel={cancelRentalBooking}
                    onAccept={acceptRentalBooking}
                    onStart={startRentalBooking}
                    onComplete={completeRentalBooking}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED OVERLAYS, MODALS AND POPUPS */}
      {/* ========================================================================= */}

      {/* Equipment Detailed Panel slide-over */}
      {selectedItemId && (
        <EquipmentDetails
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
          onBookNow={triggerConfirmBooking}
        />
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmationDialog
        isOpen={showConfirmBooking}
        title="Confirm Equipment Lease?"
        description={`You are authorizing the lock of payment for this rental. Rent period starts from ${bookingDates?.start} to ${bookingDates?.end}. Funds are locked in V-LINK smart escrow and released on completed return.`}
        confirmText="Confirm & Lock Escrow"
        cancelText="Change Dates"
        onConfirm={handleConfirmBookingSubmit}
        onCancel={() => setShowConfirmBooking(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showBookingSuccess}
        title="Booking Successful!"
        description="Your equipment lease request has been submitted to the owner Rajan Agri Rentals. We have escrowed the rental charges. Check notifications for handover."
        actionText="Track Lease Booking"
        onActionClick={() => {
          setShowBookingSuccess(false);
          // Auto route to renter bookings
          setWorkspaceMode('renter');
          // Scroll or focus history bookings
        }}
      />

      {/* Add Machinery Listing Drawer Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => setShowAddForm(false)}
          />
          <div className="relative bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full rounded-[24px] p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-earth-150 dark:border-earth-900/30 pb-3">
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                List Farming Gear
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 text-earth-450 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  Equipment / Model Name
                </label>
                <input
                  type="text"
                  required
                  value={newGearName}
                  onChange={(e) => setNewGearName(e.target.value)}
                  placeholder="e.g. Mahindra Arjun Novo 605"
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Equipment Type
                  </label>
                  <select
                    value={newGearType}
                    onChange={(e) => {
                      setNewGearType(e.target.value as any);
                      // Map to category automatically
                      if (['tractor'].includes(e.target.value)) setNewGearCategory('tractor');
                      else if (['harvester'].includes(e.target.value)) setNewGearCategory('harvester');
                      else if (['pump'].includes(e.target.value)) setNewGearCategory('pump');
                      else if (['sprayer'].includes(e.target.value)) setNewGearCategory('sprayer');
                      else setNewGearCategory('tool');
                    }}
                    className="w-full h-10 px-2 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                  >
                    <option value="tractor">Tractor</option>
                    <option value="harvester">Combine Harvester</option>
                    <option value="rotavator">Rotavator</option>
                    <option value="tiller">Power Tiller</option>
                    <option value="seeder">Seeder</option>
                    <option value="cultivator">Cultivator</option>
                    <option value="sprayer">Pesticide Sprayer</option>
                    <option value="pump">Water Pump</option>
                    <option value="truck">Mini Truck</option>
                    <option value="tool">Other Tool</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    District Location
                  </label>
                  <select
                    value={newGearDistrict}
                    onChange={(e) => setNewGearDistrict(e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Daily Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newGearDayPrice}
                    onChange={(e) => setNewGearDayPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newGearHourPrice}
                    onChange={(e) => setNewGearHourPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  Village (Local Area)
                </label>
                <input
                  type="text"
                  required
                  value={newGearVillage}
                  onChange={(e) => setNewGearVillage(e.target.value)}
                  placeholder="e.g. Othakadai"
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  Machinery Description & Condition
                </label>
                <textarea
                  rows={3}
                  value={newGearDesc}
                  onChange={(e) => setNewGearDesc(e.target.value)}
                  placeholder="Tell farmers about horsepower, attached tools, who provides diesel etc..."
                  className="w-full p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all border-0"
              >
                Publish Listing to Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Machinery Form Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div 
            className="fixed inset-0 cursor-default" 
            onClick={() => setEditingItem(null)}
          />
          <div className="relative bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-md rounded-[24px] p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-earth-150 dark:border-earth-900/30 pb-3">
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                Edit Listing
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-earth-450 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                  Equipment Name
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Daily Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.pricePerDay}
                    onChange={(e) => setEditingItem({ ...editingItem, pricePerDay: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.pricePerHour}
                    onChange={(e) => setEditingItem({ ...editingItem, pricePerHour: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all border-0"
              >
                Save Listing Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
