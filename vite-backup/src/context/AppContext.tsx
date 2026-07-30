import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Type definitions
export type Role = 'farmer' | 'buyer' | 'delivery' | 'labor' | 'vendor';
export type BuyerType = 'customer' | 'hotel' | 'retail' | 'marriage';
export type Language = 'en' | 'ta' | 'hi';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  buyerType?: BuyerType | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  stockKg: number;
  location: string;
  farmerName: string;
  farmerId: string;
  image: string;
  targetChannel: 'b2c' | 'hotel' | 'retail' | 'marriage';
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  buyerName: string;
  buyerType: BuyerType;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered';
  farmerId: string;
  deliveryJobId?: string;
  createdAt: string;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  pickupLocation: string;
  deliveryLocation: string;
  wage: number;
  status: 'available' | 'assigned' | 'delivered';
  driverId?: string;
  driverName?: string;
}

export interface LaborJob {
  id: string;
  title: string;
  wages: number;
  location: string;
  date: string;
  duration: string;
  farmerId: string;
  farmerName: string;
  status: 'open' | 'applied' | 'filled';
  applicantsCount: number;
  description: string;
}

export interface RentalItem {
  id: string;
  name: string;
  category: 'tractor' | 'vehicle' | 'tool';
  pricePerDay: number;
  location: string;
  image: string;
  vendorId: string;
  vendorName: string;
  status: 'available' | 'rented';
}

export interface MarketInsight {
  id: string;
  crop: string;
  region: string;
  govPrice: number;
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'UP' | 'STABLE' | 'DOWN';
  recommendation: string;
  priceChangePercent: number;
}

// Translations Dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    advisory_tab: "Advisory & Weather",
    intel_tab: "Market Price Information",
    sales_tab: "Direct Sales Hub",
    rentals_tab: "Agri-Rentals Board",
    labor_tab: "Labor Recruitment",
    sakthi_tab: "Sakthi Voice Helper",
    orders_tab: "My Sales Orders",
    buyer_market_tab: "Direct Marketplace",
    buyer_orders_tab: "Purchase Contracts",
    delivery_avail_tab: "Available Routes",
    delivery_active_tab: "My Deliveries",
    labor_avail_tab: "Local Farm Jobs",
    labor_sched_tab: "My Schedule",
    vendor_inv_tab: "Machinery Inventory",
    vendor_lease_tab: "Lease Contracts",
    wallet: "Ecosystem Wallet",
    logout: "Log Out",
    nav_short_advisory: "Advisory",
    nav_short_intel: "Market Intel",
    nav_short_sales: "Sales",
    nav_short_rentals: "Rentals",
    nav_short_labor: "Labor",
    nav_short_sakthi: "Sakthi",
    nav_short_orders: "Orders",
    nav_short_market: "Market",
    nav_short_contracts: "Contracts",
    nav_short_routes: "Routes",
    nav_short_transit: "Transit",
    nav_short_jobs: "Jobs",
    nav_short_schedule: "Schedule",
    nav_short_inventory: "Machinery",
    nav_short_lease: "Leases",

    farmer_welcome: "Hello, Ramanathan Swamy",
    farmer_desc: "Check weather advisories, sell crop produce directly to B2C or wholesale buyers, lease tools, and manage labor bookings.",
    buyer_welcome: "Wholesale Buyer Workspace",
    buyer_desc: "Source verified crops directly from agricultural districts. Track active dispatches.",
    delivery_welcome: "Logistics Driver Console",
    delivery_desc: "Fulfill local vegetable dispatches. Students and local workers earn payouts on verified drops.",
    labor_welcome: "Farm Worker Console",
    labor_desc: "Find seasonal planting and harvesting bookings in your local region with fixed wage rates.",
    vendor_welcome: "Rental fleet Console",
    vendor_desc: "Publish heavy tractors, tillers, pumps, or agri cargo vehicles for lease to local farmers.",

    weather_title: "Local Weather & Advisory",
    weather_desc: "Madurai East District, TN",
    weather_bulletin: "Monsoon warning: Expect heavy downpours in the next 24-48 hours. Ensure crop fields have adequate drainage to prevent tomato root rot. Stagger your harvests today.",
    weather_temp: "Temp",
    weather_hum: "Humidity",
    weather_rain: "Rain Prob.",
    input_cost_title: "Rising Fertilizer & Fuel Costs",
    input_cost_desc: "Fertilizer costs have risen by 12% MoM. We recommend group bulk-buying to save on logistics fees.",
    subsidy_active: "SUBSIDY ACTIVE: YES",
    apply_subsidy: "Apply at cooperative",

    mandi_benchmarks: "Daily Mandi Benchmark Comparison (Gov Price Portal)",
    gov_rate: "Avg Gov Mandi Rate",
    vlink_rate: "Direct V-LINK Price",
    savings: "Middleman Commission Saved",

    rental_title: "Farming Machinery & Tool Rentals",
    rental_desc: "Rent tractors, tillers, pumps, or cargo trucks directly from local suppliers.",
    rate_day: "/ day",
    rent_cta: "Rent Machinery",
    rented_status: "Rented Out",

    labor_title: "Local Labor Booking Board",
    labor_booking_desc: "Solve harvesting worker shortages by hiring locally verified professionals.",
    hire_cta: "Hire Applied Worker",

    sakthi_welcome: "Sakthi - Voice-First Farming Assistant",
    sakthi_welcome_sub: "Tamil, Hindi & English spoken support",
    sakthi_tip: "Sakthi translates app steps and alerts into Tamil, Hindi or English speech. Tap play to listen.",
    sakthi_play: "Play Voice Guide",
    sakthi_stop: "Stop Playback",
    sakthi_playing: "Playing Audio Guide...",
    sakthi_idle: "Audio ready",

    visual_mode: "Visual Mode",
    visual_desc: "Tap direct visual actions below",
    v_sell_crop: "Sell Crops",
    v_rent_tractor: "Rent Tractor / Tools",
    v_hire_labor: "Hire Local Workers",
    v_voice_advisory: "Hear Today's Weather & Rates",
    v_current_inventory: "Your Listed Vegetables",

    list_crop: "List Crop Produce",
    post_labor: "Post Labor Booking",
    list_machinery: "List Rental Machinery",
    cancel: "Cancel",
    confirm: "Confirm",
    ok: "OK",
    price: "Price",
    stock: "Stock",
    location: "Location",
    target_channel: "Target Channel",

    escrow_title: "Ecosystem Escrow Contracts",
    escrow_farmer_desc: "Track sales purchases and escrow clearances.",
    escrow_buyer_desc: "Track order contracts and logistics status.",
    escrow_sandbox_desc: "Sandbox view of all active network contracts.",
    no_orders: "No orders found",
    no_orders_desc: "There are no transaction records associated with your role workspace yet.",
    escrow_table_title: "Escrow & Delivery Agreements",
    escrow_table_desc: "Funds are locked in V-LINK smart escrow until proof-of-delivery is confirmed.",
    col_agreement_id: "Agreement ID",
    col_crop: "Crop / Produce",
    col_counterparty: "Counterparty",
    col_quantity: "Quantity",
    col_valuation: "Valuation",
    col_status: "Fulfillment Status",
    col_created: "Created At",

    delivery_title: "Logistics Dispatch Network",
    delivery_board_desc: "Auto-generated delivery dispatches matching farm sales. Fulfill routes to unlock instant wallet settlements.",
    current_dispatches: "Your Current Dispatches",
    active_transit: "Active Transit",
    no_active_routes: "No active routes assigned. Review 'Available Routes' below to accept jobs.",
    simulated_live_transit: "Simulated Live Transit",
    gps_tracking_live: "GPS Tracking Live",
    pickup_hub: "Pickup Hub",
    dropoff_dest: "Dropoff Destination",
    available_dispatch_routes: "Available Dispatch Routes",
    select_routes_matching: "Select routes matching your district",
    driver_mode_required: "Driver-mode required to accept",
    no_avail_routes: "No available dispatch routes. Check back when buyers place orders.",
    accept_route_cta: "Accept Delivery Route",
    confirm_delivery_cta: "Confirm Delivery",
    completed_history: "Completed Deliveries History",

    labor_registry_title: "Agricultural Workforce Registry",
    labor_registry_desc: "Post harvesting and sowing requirements or discover verified farm job postings with guaranteed wage agreements.",
    labor_app_status: "Your Applications & Hiring Status",
    no_active_applications: "No active job applications. Browse the open job board below.",
    available_job_postings: "Available Farm Job Postings",
    jobs_matching_skills: "Select jobs matching your skills",
    laborer_mode_required: "Laborer-mode required to apply",
    no_labor_listed: "No open labor positions listed currently. Farmers can post jobs from their dashboard.",
    manage_job_postings: "Manage Your Job Postings",
    approve_hire_cta: "Approve & Hire Candidate",
    apply_position_cta: "Apply for Position",

    route_dispatch: "Route Dispatch",
    farm_workforce: "Farm Workforce",
    pickup: "Pickup",
    delivery_destination: "Delivery Destination",
    delivery_payout: "Delivery Payout",
    daily_wage_rate: "Daily Wage Rate",
    day_unit: "/ day",
    starts: "Starts",
    duration: "Duration",
    applicants_count: "Applicant(s)",
    kg_unit: "kg",
    out_of_stock: "OUT OF STOCK",
    per_kg: "per kg",
    farmer_prefix: "Farmer",
    available_stock: "Available Stock",
    place_purchase_order: "Place Purchase Order",

    confirm_purchase_order: "Confirm Purchase Order",
    smart_escrow_system: "V-LINK Smart Escrow & Clearing System",
    rate_prefix: "Rate",
    stock_prefix: "Stock",
    order_qty_kg: "Order Quantity (kg)",
    qty_greater_zero: "Quantity must be greater than 0 kg",
    only_stock_available: "Only {stock} kg available in stock",
    invalid_qty_msg: "Please input a valid quantity",
    provide_address_msg: "Please provide a delivery address",
    dest_address_label: "Delivery Destination Address",
    enter_drop_loc_placeholder: "Enter drop location",
    ledger_breakdown_title: "Fee Ledger & Logistics Dispatch",
    produce_subtotal: "Produce Subtotal",
    logistics_fare: "Auto-assigned Logistics Fare",
    logistics_fare_desc: "Logistics fare is dynamically calculated at 5% of order + base rate, escrowed, and auto-paid to student delivery partner upon proof-of-delivery.",
    total_escrow_debit: "Total Escrow Debit",
    auth_escrow_place_order: "Authorize Escrow & Place Order",

    status_pending: "Escrow Locked",
    status_accepted: "Driver Assigned",
    status_in_transit: "In Transit",
    status_delivered: "Disbursed",
    status_available: "Unassigned",
    status_assigned: "Driver Assigned",
    status_open: "Hiring Open",
    status_applied: "Applied",
    status_filled: "Position Filled",

    active_channel: "Active Channel",
    direct_marketplace_title: "Direct Produce Marketplace",
    direct_marketplace_desc: "Sourced direct from verified farmers in regional districts with no agent commissions.",
    success_order_placed: "Success: Order {id} cleared & escrowed!",
    viewing_as_warning: "Note: You are currently viewing as a {role}. Log out and sign in as a Buyer to place direct purchase orders.",
    search_crops_placeholder: "Search fresh crops listed for {channel}...",
    no_crops_found: "No crops found on this channel",
    no_crops_found_desc: "There are no matching crop inventories for the {channel} pipeline currently.",
    filter_label: "Filter:",
    all_regions: "All Regions",
    cat_all: "All",
    cat_vegetables: "Vegetables",
    cat_fruits: "Fruits",
    cat_grains: "Grains",
    cat_spices: "Spices",
    channel_hotel: "Hotel B2B Wholesale",
    channel_retail: "Retail Shop B2B Wholesale",
    channel_marriage: "Marriage Banquet Wholesale",
    channel_b2c: "Direct Customer B2C"
  },
  ta: {
    advisory_tab: "அறிவுரை & வானிலை",
    intel_tab: "சந்தை விலை விவரம்",
    sales_tab: "நேரடி விற்பனை",
    rentals_tab: "வாடகை கருவிகள்",
    labor_tab: "வேலைக்கு ஆட்கள்",
    sakthi_tab: "சக்தி குரல் உதவி",
    orders_tab: "எனது விற்பனை ஆர்டர்",
    buyer_market_tab: "நேரடி சந்தை",
    buyer_orders_tab: "கொள்முதல் ஒப்பந்தம்",
    delivery_avail_tab: "கிடைக்கும் வழிகள்",
    delivery_active_tab: "எனது டெலிவரி",
    labor_avail_tab: "விவசாய வேலைகள்",
    labor_sched_tab: "எனது அட்டவணை",
    vendor_inv_tab: "கருவி சரக்கு",
    vendor_lease_tab: "வாடகை ஒப்பந்தம்",
    wallet: "விவசாயி பணப்பை",
    logout: "வெளியேறு",
    nav_short_advisory: "அறிவுரை",
    nav_short_intel: "சந்தை விலை",
    nav_short_sales: "விற்பனை",
    nav_short_rentals: "வாடகை",
    nav_short_labor: "வேலை",
    nav_short_sakthi: "சக்தி",
    nav_short_orders: "ஆர்டர்கள்",
    nav_short_market: "சந்தை",
    nav_short_contracts: "ஒப்பந்தங்கள்",
    nav_short_routes: "வழிகள்",
    nav_short_transit: "பயணம்",
    nav_short_jobs: "வேலைகள்",
    nav_short_schedule: "அட்டவணை",
    nav_short_inventory: "இயந்திரங்கள்",
    nav_short_lease: "குத்தகைகள்",

    farmer_welcome: "வணக்கம், ராமநாதன் சுவாமி",
    farmer_desc: "வானிலை ஆலோசனைகளைச் சரிபார்க்கவும், பயிர் விளைச்சலை நேரடியாக நுகர்வோர்கள் அல்லது மொத்த வாங்குபவர்களுக்கு விற்கவும், கருவிகளை வாடகைக்கு எடுக்கவும் மற்றும் தொழிலாளர்களை வேலைக்கு அமர்த்தவும்.",
    buyer_welcome: "வாங்குபவர் பணியிடம்",
    buyer_desc: "விவசாய மாவட்டங்களில் இருந்து நேரடியாக சரிபார்க்கப்பட்ட பயிர்களை வாங்கவும். ஆர்டர்களைக் கண்காணிக்கவும்.",
    delivery_welcome: "டெலிவரி பார்ட்னர் பணியிடம்",
    delivery_desc: "உள்ளூர் காய்கறி விநியோகங்களை பூர்த்தி செய்யுங்கள். மாணவர்கள் மற்றும் உள்ளூர் தொழிலாளர்கள் டெலிவரி செய்து பணம் பெறலாம்.",
    labor_welcome: "விவசாய தொழிலாளர் பணியிடம்",
    labor_desc: "உள்ளூர் பகுதியில் நடவு மற்றும் அறுவடை வேலைகளை நிலையான தினசரி கூலியுடன் கண்டறியவும்.",
    vendor_welcome: "வாடகை சப்ளையர் பணியிடம்",
    vendor_desc: "டிராக்டர்கள், பவர் டில்லர்கள், பம்புகள் அல்லது சரக்கு வாகனங்களை உள்ளூர் விவசாயிகளுக்கு வாடகைக்கு வெளியிடவும்.",

    weather_title: "உள்ளூர் வானிலை & ஆலோசனை",
    weather_desc: "மதுரை கிழக்கு மாவட்டம், தமிழ்நாடு",
    weather_bulletin: "மழை எச்சரிக்கை: அடுத்த 24-48 மணி நேரத்தில் பலத்த மழை பெய்யக்கூடும். தக்காளி வேர் அழுகலைத் தடுக்க வயல்களில் போதுமான வடிகால் வசதியை உறுதி செய்யவும். அறுவடையை விரைவுபடுத்தவும்.",
    weather_temp: "வெப்பநிலை",
    weather_hum: "ஈரப்பதம்",
    weather_rain: "மழை வாய்ப்பு",
    input_cost_title: "உரம் மற்றும் எரிபொருள் விலை உயர்வு",
    input_cost_desc: "உரச் செலவுகள் மாதத்திற்கு 12% உயர்ந்துள்ளன. போக்குவரத்து மற்றும் உரம் செலவை சேமிக்க கூட்டு கொள்முதல் செய்ய பரிந்துரைக்கிறோம்.",
    subsidy_active: "அரசு மானியம்: உள்ளது",
    apply_subsidy: "கூட்டுறவு சங்கத்தில் விண்ணப்பிக்கவும்",

    mandi_benchmarks: "தினசரி அரசு மண்டி விலை ஒப்பீடு (இடைத்தரகர் இல்லாத நேரடி விலை)",
    gov_rate: "அரசு மண்டி சராசரி விலை",
    vlink_rate: "V-LINK நேரடி விலை",
    savings: "இடைத்தரகர் கமிஷன் சேமிப்பு",

    rental_title: "வாடகை விவசாய எந்திரங்கள் & கருவிகள்",
    rental_desc: "உள்ளூர் சப்ளையர்களிடமிருந்து டிராக்டர்கள், டில்லர்கள், பம்புகள் அல்லது சரக்கு லாரிகளை நேரடியாக வாடகைக்கு எடுக்கவும்.",
    rate_day: "/ நாள்",
    rent_cta: "வாடகைக்கு எடு",
    rented_status: "வாடகைக்கு விடப்பட்டது",

    labor_title: "உள்ளூர் தொழிலாளர் முன்பதிவு பலகை",
    labor_booking_desc: "உள்ளூரில் சரிபார்க்கப்பட்ட தொழிலாளர்களை வேலைக்கு அமர்த்துவதன் மூலம் அறுவடை ஆட்கள் பற்றாக்குறையை தீர்க்கவும்.",
    hire_cta: "வேலைக்கு அமர்த்து",

    sakthi_welcome: "சக்தி - விவசாய குரல் உதவி",
    sakthi_welcome_sub: "தமிழ், இந்தி மற்றும் ஆங்கில குரல் ஆதரவு",
    sakthi_tip: "சக்தி உதவியாளர் செயலியின் பக்கங்கள் மற்றும் எச்சரிக்கைகளை தமிழில் பேசும். கேட்க பிளே செய்யவும்.",
    sakthi_play: "குரல் உதவியைக் கேள்",
    sakthi_stop: "ஒலியை நிறுத்து",
    sakthi_playing: "தமிழ் குரல் ஒலிக்கிறது...",
    sakthi_idle: "ஒலி தயார்",

    visual_mode: "படம் முறை (எளிய வடிவம்)",
    visual_desc: "கீழே உள்ள படங்களை தட்டி நேரடியாக வேலைகளை செய்யவும்",
    v_sell_crop: "விளைச்சல் விற்க",
    v_rent_tractor: "டிராக்டர் / கருவி வாடகைக்கு",
    v_hire_labor: "வேலைக்கு ஆட்களை அழைக்க",
    v_voice_advisory: "வானிலை மற்றும் தக்காளி விலை கேட்க",
    v_current_inventory: "விற்பனைக்கு வைத்துள்ள காய்கறிகள்",

    list_crop: "விளைச்சல் பதிவு செய்",
    post_labor: "வேலை விளம்பரம் செய்",
    list_machinery: "எந்திரத்தை வாடகைக்கு விடு",
    cancel: "ரத்து செய்",
    confirm: "உறுதி செய்",
    ok: "சரி",
    price: "விலை",
    stock: "அளவு",
    location: "மாவட்டம்",
    target_channel: "யாருக்கு விற்க வேண்டும்",

    escrow_title: "கூட்டோறவு எஸ்க்ரோ ஒப்பந்தங்கள்",
    escrow_farmer_desc: "விற்பனை கொள்முதல் மற்றும் எஸ்க்ரோ அனுமதிகளைக் கண்காணிக்கவும்.",
    escrow_buyer_desc: "ஆர்டர் ஒப்பந்தங்கள் மற்றும் தளவாடங்கள் நிலையை கண்காணிக்கவும்.",
    escrow_sandbox_desc: "அனைத்து செயலில் உள்ள நெட்வொர்க் ஒப்பந்தங்களின் சாண்ட்பாக்ஸ் பார்வை.",
    no_orders: "ஆர்டர்கள் எதுவும் கிடைக்கவில்லை",
    no_orders_desc: "இன்னும் உங்கள் பின்தளத்துடன் தொடர்புடைய பரிவர்த்தனை பதிவுகள் எதுவும் இல்லை.",
    escrow_table_title: "எஸ்க்ரோ & விநியோக ஒப்பந்தங்கள்",
    escrow_table_desc: "டெலிவரி உறுதி செய்யப்படும் வரை பணம் V-LINK எஸ்க்ரோவில் பாதுகாப்பாக பூட்டப்பட்டிருக்கும்.",
    col_agreement_id: "ஒப்பந்த ஐடி",
    col_crop: "பயிர் / விளைச்சல்",
    col_counterparty: "வாங்குபவர்/விற்பவர்",
    col_quantity: "அளவு",
    col_valuation: "மதிப்பு",
    col_status: "நிறைவேற்ற நிலை",
    col_created: "உருவாக்கப்பட்ட நேரம்",

    delivery_title: "தளவாடங்கள் விநியோக நெட்வொர்க்",
    delivery_board_desc: "விவசாய விற்பனைக்கு ஏற்ப தானாகவே உருவாக்கப்படும் டெலிவரிகள். உடனடி கொடுப்பனவுகளைப் பெற டெலிவரி செய்யுங்கள்.",
    current_dispatches: "உங்கள் தற்போதைய டெலிவரிகள்",
    active_transit: "செயலில் உள்ள போக்குவரத்து",
    no_active_routes: "செயலில் உள்ள வழிகள் எதுவும் ஒதுக்கப்படவில்லை. வேலைகளை ஏற்க கீழே உள்ள 'கிடைக்கும் வழிகள்' பார்க்கவும்.",
    simulated_live_transit: "நேரடி போக்குவரத்து உருவகப்படுத்துதல்",
    gps_tracking_live: "ஜிபிஎஸ் நேரடி கண்காணிப்பு",
    pickup_hub: "பயிர் எடுக்கும் இடம்",
    dropoff_dest: "டெலிவரி செய்யும் இடம்",
    available_dispatch_routes: "கிடைக்கும் டெலிவரி வழிகள்",
    select_routes_matching: "உங்கள் மாவட்டத்திற்குப் பொருந்தும் வழிகளைத் தேர்ந்தெடுக்கவும்",
    driver_mode_required: "ஏற்க டெலிவரி நபர் பயன்முறை தேவை",
    no_avail_routes: "கிடைக்கும் வழிகள் ஏதுமில்லை. வாங்குபவர்கள் ஆர்டர் செய்யும்போது மீண்டும் பார்க்கவும்.",
    accept_route_cta: "டெலிவரி வழியை ஏற்றுக்கொள்",
    confirm_delivery_cta: "டெலிவரியை உறுதிப்படுத்து",
    completed_history: "முடிக்கப்பட்ட டெலிவரிகளின் வரலாறு",

    labor_registry_title: "விவசாய தொழிலாளர் பதிவேடு",
    labor_registry_desc: "அறுவடை மற்றும் விதைப்பு தேவைகளை இடுகையிடவும் அல்லது உத்தரவாதமான கூலி ஒப்பந்தங்களுடன் சரிபார்க்கப்பட்ட பண்ணை வேலை இடுகைகளைக் கண்டறியவும்.",
    labor_app_status: "உங்கள் விண்ணப்பங்கள் மற்றும் பணியமர்த்தல் நிலை",
    no_active_applications: "செயலில் உள்ள வேலை விண்ணப்பங்கள் எதுவும் இல்லை. கீழே உள்ள திறந்த வேலை வாரியத்தை உலாவவும்.",
    available_job_postings: "கிடைக்கும் பண்ணை வேலை இடுகைகள்",
    jobs_matching_skills: "உங்கள் திறமைகளுக்குப் பொருந்தும் வேலைகளைத் தேர்ந்தெடுக்கவும்",
    laborer_mode_required: "விண்ணப்பிக்க தொழிலாளர் பயன்முறை தேவை",
    no_labor_listed: "தற்போது திறந்த தொழிலாளர் பணியிடங்கள் எதுவும் பட்டியலிடப்படவில்லை. விவசாயிகள் தங்கள் டாஷ்போர்டில் இருந்து வேலைகளை இடுகையிடலாம்.",
    manage_job_postings: "உங்கள் வேலை இடுகைகளை நிர்வகிக்கவும்",
    approve_hire_cta: "விண்ணப்பதாரரை வேலைக்கு அமர்த்து",
    apply_position_cta: "வேலைக்கு விண்ணப்பி",

    route_dispatch: "விநியோக வழி",
    farm_workforce: "விவசாய பணியாளர்கள்",
    pickup: "பயிர் எடுக்கும் இடம்",
    delivery_destination: "டெலிவரி செய்யும் இடம்",
    delivery_payout: "டெலிவரி ஊதியம்",
    daily_wage_rate: "தினசரி கூலி விகிதம்",
    day_unit: "/ நாள்",
    starts: "ஆரம்பம்",
    duration: "கால அளவு",
    applicants_count: "விண்ணப்பதாரர்கள்",
    kg_unit: "கிலோ",
    out_of_stock: "சரக்கு இல்லை",
    per_kg: "ஒரு கிலோவிற்கு",
    farmer_prefix: "விவசாயி",
    available_stock: "கிடைக்கும் சரக்கு",
    place_purchase_order: "கொள்முதல் ஆர்டர் செய்",

    confirm_purchase_order: "கொள்முதல் ஆர்டரை உறுதிப்படுத்து",
    smart_escrow_system: "V-LINK ஸ்மார்ட் எஸ்க்ரோ மற்றும் கிளியரிங் சிஸ்டம்",
    rate_prefix: "விலை",
    stock_prefix: "சரக்கு",
    order_qty_kg: "ஆர்டர் அளவு (கிலோ)",
    qty_greater_zero: "அளவு 0 கிலோவை விட அதிகமாக இருக்க வேண்டும்",
    only_stock_available: "பங்கு உள்ள அளவு {stock} கிலோ மட்டுமே",
    invalid_qty_msg: "சரியான அளவை உள்ளிடவும்",
    provide_address_msg: "டெலிவரி முகவரியை வழங்கவும்",
    dest_address_label: "டெலிவரி செய்யும் முகவரி",
    enter_drop_loc_placeholder: "இறக்க வேண்டிய இடத்தை உள்ளிடவும்",
    ledger_breakdown_title: "கட்டண விபரம் மற்றும் தளவாட விநியோகம்",
    produce_subtotal: "விளைச்சல் துணைத்தொகை",
    logistics_fare: "தளவாட கட்டணம் (தானியங்கி)",
    logistics_fare_desc: "தளவாடக் கட்டணம் தானாகவே ஆர்டரில் 5% + அடிப்படை கட்டணம் என கணக்கிடப்பட்டு எஸ்க்ரோவில் வைக்கப்பட்டு, டெலிவரி செய்யப்பட்டவுடன் டெலிவரி நபருக்கு வழங்கப்படும்.",
    total_escrow_debit: "மொத்த எஸ்க்ரோ கழிவு",
    auth_escrow_place_order: "எஸ்க்ரோவை அங்கீகரித்து ஆர்டர் செய்",

    status_pending: "எஸ்க்ரோவில் பூட்டப்பட்டது",
    status_accepted: "டெலிவரி நபர் ஒதுக்கீடு",
    status_in_transit: "வழியில் உள்ளது",
    status_delivered: "வழங்கப்பட்டது",
    status_available: "ஒதுக்கப்படாதது",
    status_assigned: "டெலிவரி நபர் ஒதுக்கீடு",
    status_open: "வேலைக்கு ஆட்கள் தேவை",
    status_applied: "விண்ணப்பிக்கப்பட்டது",
    status_filled: "பணியிடம் நிரப்பப்பட்டது",

    active_channel: "செயலில் உள்ள விற்பனை",
    direct_marketplace_title: "நேரடி விளைச்சல் சந்தை",
    direct_marketplace_desc: "இடைத்தரகர் கமிஷன் இல்லாமல் பிராந்திய மாவட்டங்களில் சரிபார்க்கப்பட்ட விவசாயிகளிடமிருந்து நேரடியாக வாங்கப்பட்டது.",
    success_order_placed: "வெற்றி: ஆர்டர் {id} சரிபார்க்கப்பட்டு எஸ்க்ரோ செய்யப்பட்டது!",
    viewing_as_warning: "குறிப்பு: நீங்கள் தற்போது {role} ஆகப் பார்க்கிறீர்கள். ஆர்டர் செய்ய வாங்குபவராக உள்நுழையவும்.",
    search_crops_placeholder: "{channel}-க்கான புதிய பயிர்களைத் தேடுங்கள்...",
    no_crops_found: "இந்த விற்பனையில் பயிர்கள் எதுவும் இல்லை",
    no_crops_found_desc: "தற்போது {channel} விற்பனையில் எந்த பயிர் சரக்குகளும் இல்லை.",
    filter_label: "வடிகட்டி:",
    all_regions: "அனைத்து மாவட்டங்களும்",
    cat_all: "அனைத்தும்",
    cat_vegetables: "காய்கறிகள்",
    cat_fruits: "பழங்கள்",
    cat_grains: "தானியங்கள்",
    cat_spices: "மசாலாக்கள்",
    channel_hotel: "ஹோட்டல் B2B மொத்த விற்பனை",
    channel_retail: "சில்லறை கடை B2B மொத்த விற்பனை",
    channel_marriage: "திருமண மண்டபம் மொத்த விற்பனை",
    channel_b2c: "நேரடி வாடிக்கையாளர் B2C"
  },
  hi: {
    advisory_tab: "सलाह और मौसम",
    intel_tab: "मंडी भाव जानकारी",
    sales_tab: "सीधी बिक्री हब",
    rentals_tab: "कृषि उपकरण किराया",
    labor_tab: "मज़दूर बुकिंग",
    sakthi_tab: "शक्ति आवाज सहायक",
    orders_tab: "मेरे बिक्री आदेश",
    buyer_market_tab: "सीधा बाजार",
    buyer_orders_tab: "खरीद अनुबंध",
    delivery_avail_tab: "उपलब्ध मार्ग",
    delivery_active_tab: "मेरी डिलीवरी",
    labor_avail_tab: "स्थानीय कृषि कार्य",
    labor_sched_tab: "मेरी अनुसूची",
    vendor_inv_tab: "मशीनरी सूची",
    vendor_lease_tab: "पट्टा अनुबंध",
    wallet: "किसान वॉलेट",
    logout: "लॉग आउट",
    nav_short_advisory: "सलाह",
    nav_short_intel: "मंडी भाव",
    nav_short_sales: "बिक्री",
    nav_short_rentals: "किराया",
    nav_short_labor: "मजदूर",
    nav_short_sakthi: "शक्ति",
    nav_short_orders: "आदेश",
    nav_short_market: "बाजार",
    nav_short_contracts: "अनुबंध",
    nav_short_routes: "मार्ग",
    nav_short_transit: "पारगमन",
    nav_short_jobs: "नौकरियां",
    nav_short_schedule: "अनुसूची",
    nav_short_inventory: "मशीनें",
    nav_short_lease: "पट्टे",

    farmer_welcome: "नमस्कार, रामनाथन स्वामी जी",
    farmer_desc: "मौसम की सलाह देखें, अपनी उपज सीधे उपभोक्ताओं या थोक खरीदारों को बेचें, उपकरण किराए पर लें, और स्थानीय श्रमिकों को काम पर रखें।",
    buyer_welcome: "थोक खरीदार कार्यक्षेत्र",
    buyer_desc: "सीधे कृषि जिलों से सत्यापित उपज खरीदें। अपनी डिलीवरी ट्रैक करें।",
    delivery_welcome: "लॉजिस्टिक्स ड्राइवर कंसोल",
    delivery_desc: "स्थानीय सब्जी डिलीवरी पूरी करें। छात्र और स्थानीय कामगार मार्ग पूरा करके तुरंत पैसे कमाएं।",
    labor_welcome: "कृषि श्रमिक कंसोल",
    labor_desc: "निश्चित दैनिक मजदूरी दरों के साथ अपने स्थानीय क्षेत्र में रोपण और कटाई के काम खोजें।",
    vendor_welcome: "किराया सप्लायर कंसोल",
    vendor_desc: "स्थानीय किसानों के लिए भारी ट्रैक्टर, टिलर, पंप या मालवाहक वाहन किराए पर उपलब्ध कराएं।",

    weather_title: "स्थानीय मौसम और सलाह",
    weather_desc: "मदुरै पूर्व जिला, तमिलनाडु",
    weather_bulletin: "मानसून की चेतावनी: अगले 24-48 घंटों में भारी बारिश की संभावना है। टमाटर की जड़ों को सड़ने से बचाने के लिए खेतों में जल निकासी की व्यवस्था करें। आज ही कटाई पूरी करें।",
    weather_temp: "तापमान",
    weather_hum: "नमी",
    weather_rain: "बारिश की संभावना",
    input_cost_title: "खाद और ईंधन की बढ़ती कीमतें",
    input_cost_desc: "उर्वरक लागत में महीने-दर-महीने 12% की वृद्धि हुई है। हम मालभाड़ा बचाने के लिए समूह में थोक खरीद की सलाह देते हैं।",
    subsidy_active: "सरकारी सब्सिडी: सक्रिय है",
    apply_subsidy: "सहकारी समिति में आवेदन करें",

    mandi_benchmarks: "दैनिक सरकारी मंडी मूल्य तुलना (बिचौलियों के बिना सीधा दाम)",
    gov_rate: "सरकारी मंडी औसत दर",
    vlink_rate: "V-LINK सीधी दर",
    savings: "बचाया गया बिचौलिया कमीशन",

    rental_title: "किराए के कृषि उपकरण और मशीनरी",
    rental_desc: "स्थानीय विक्रेताओं से सीधे ट्रैक्टर, टिलर, पंप या मालवाहक ट्रक किराए पर लें।",
    rate_day: "/ दिन",
    rent_cta: "किराए पर लें",
    rented_status: "किराए पर दिया गया",

    labor_title: "स्थानीय मजदूर बुकिंग बोर्ड",
    labor_booking_desc: "स्थानीय रूप से सत्यापित कृषि श्रमिकों को काम पर रखकर कटाई के मजदूरों की कमी को दूर करें।",
    hire_cta: "श्रमिक को काम पर रखें",

    sakthi_welcome: "शक्ति - कृषि आवाज सहायक",
    sakthi_welcome_sub: "तमिल, हिंदी और अंग्रेजी भाषा आवाज सहायता",
    sakthi_tip: "शक्ति सहायक ऐप के पेजों और चेतावनी संदेशों को हिंदी में सुनाएगा। सुनने के लिए प्ले दबाएं।",
    sakthi_play: "आवाज सहायक सुनें",
    sakthi_stop: "आवाज बंद करें",
    sakthi_playing: "हिंदी आवाज बज रही है...",
    sakthi_idle: "आवाज तैयार है",

    visual_mode: "चित्र मोड (सरल रूप)",
    visual_desc: "खेती के कामों को आसानी से करने के लिए नीचे दिए गए चित्रों को दबाएं",
    v_sell_crop: "फसल बेचने के लिए",
    v_rent_tractor: "ट्रैक्टर / उपकरण किराए के लिए",
    v_hire_labor: "खेत मजदूर बुलाने के लिए",
    v_voice_advisory: "मौसम और टमाटर का भाव सुनने के लिए",
    v_current_inventory: "आपकी बेची जाने वाली सब्जियां",

    list_crop: "फसल दर्ज करें",
    post_labor: "काम दर्ज करें",
    list_machinery: "मशीनरी किराए पर दें",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    ok: "ठीक",
    price: "मूल्य",
    stock: "मात्रा",
    location: "जिला",
    target_channel: "बिक्री का माध्यम",

    escrow_title: "पारिस्थितिकी तंत्र एस्क्रो अनुबंध",
    escrow_farmer_desc: "बिक्री खरीद और एस्क्रो निकासी को ट्रैक करें।",
    escrow_buyer_desc: "ऑर्डर अनुबंध और रसद स्थिति को ट्रैक करें।",
    escrow_sandbox_desc: "सभी सक्रिय नेटवर्क अनुबंधों का सैंडबॉक्स दृश्य।",
    no_orders: "कोई ऑर्डर नहीं मिला",
    no_orders_desc: "अभी तक आपके कार्यक्षेत्र से संबंधित कोई लेनदेन रिकॉर्ड नहीं है।",
    escrow_table_title: "एस्क्रो और वितरण समझौते",
    escrow_table_desc: "डिलीवरी की पुष्टि होने तक फंड V-LINK स्मार्ट एस्क्रो में सुरक्षित लॉक रहते हैं।",
    col_agreement_id: "समझौता आईडी",
    col_crop: "फसल / उपज",
    col_counterparty: "प्रतिपक्ष",
    col_quantity: "मात्रा",
    col_valuation: "मूल्यांकन",
    col_status: "पूर्ति की स्थिति",
    col_created: "बनाने का समय",

    delivery_title: "लॉजिस्टिक्स डिस्पैच नेटवर्क",
    delivery_board_desc: "कृषि बिक्री से मेल खाने वाले स्वचालित डिलीवरी डिस्पैच। तत्काल भुगतान अनलॉक करने के लिए मार्ग पूरा करें।",
    current_dispatches: "आपके वर्तमान डिस्पैच",
    active_transit: "सक्रिय पारगमन",
    no_active_routes: "कोई सक्रिय मार्ग आवंटित नहीं है। काम स्वीकार करने के लिए नीचे 'उपलब्ध मार्ग' देखें।",
    simulated_live_transit: "सिम्युलेटेड लाइव ट्रांजिट",
    gps_tracking_live: "जीपीएस लाइव ट्रैकिंग",
    pickup_hub: "पिकअप हब",
    dropoff_dest: "वितरण गंतव्य",
    available_dispatch_routes: "उपलब्ध डिस्पैच मार्ग",
    select_routes_matching: "अपने जिले से मेल खाने वाले मार्गों का चयन करें",
    driver_mode_required: "स्वीकार करने के लिए ड्राइवर मोड आवश्यक है",
    no_avail_routes: "कोई उपलब्ध डिस्पैच मार्ग नहीं है। खरीदारों द्वारा ऑर्डर देने पर पुनः जांचें।",
    accept_route_cta: "डिलीवरी मार्ग स्वीकार करें",
    confirm_delivery_cta: "डिलीवरी की पुष्टि करें",
    completed_history: "पूर्ण डिलीवरी का इतिहास",

    labor_registry_title: "कृषि कार्यबल रजिस्ट्री",
    labor_registry_desc: "कटाई और बुआई की आवश्यकताएं दर्ज करें या गारंटीकृत मजदूरी समझौतों के साथ सत्यापित कृषि नौकरियों की तलाश करें।",
    labor_app_status: "आपके आवेदन और भर्ती की स्थिति",
    no_active_applications: "कोई सक्रिय नौकरी आवेदन नहीं है। नीचे दिए गए जॉब बोर्ड को देखें।",
    available_job_postings: "उपलब्ध कृषि नौकरियाँ",
    jobs_matching_skills: "अपने कौशल से मेल खाने वाली नौकरियों का चयन करें",
    laborer_mode_required: "आवेदन करने के लिए मजदूर मोड आवश्यक है",
    no_labor_listed: "वर्तमान में कोई कृषि पद खाली नहीं हैं। किसान अपने डैशबोर्ड से नौकरी पोस्ट कर सकते हैं।",
    manage_job_postings: "अपनी नौकरी पोस्टिंग का प्रबंधन करें",
    approve_hire_cta: "उम्मीदवार को काम पर रखें",
    apply_position_cta: "पद के लिए आवेदन करें",

    route_dispatch: "मार्ग डिस्पैच",
    farm_workforce: "कृषि कार्यबल",
    pickup: "पिकअप",
    delivery_destination: "वितरण गंतव्य",
    delivery_payout: "वितरण भुगतान",
    daily_wage_rate: "दैनिक मजदूरी दर",
    day_unit: "/ दिन",
    starts: "शुरू",
    duration: "अवधि",
    applicants_count: "आवेदक",
    kg_unit: "किलो",
    out_of_stock: "स्टॉक में नहीं",
    per_kg: "प्रति किलो",
    farmer_prefix: "किसान",
    available_stock: "उपलब्ध स्टॉक",
    place_purchase_order: "खरीद आदेश दें",

    confirm_purchase_order: "खरीद आदेश की पुष्टि करें",
    smart_escrow_system: "V-LINK स्मार्ट एस्क्रो और क्लियरिंग सिस्टम",
    rate_prefix: "मूल्य",
    stock_prefix: "स्टॉक",
    order_qty_kg: "ऑर्डर मात्रा (किलो)",
    qty_greater_zero: "मात्रा 0 किलो से अधिक होनी चाहिए",
    only_stock_available: "स्टॉक में केवल {stock} किलो उपलब्ध है",
    invalid_qty_msg: "कृपया एक मान्य मात्रा दर्ज करें",
    provide_address_msg: "कृपया वितरण पता प्रदान करें",
    dest_address_label: "वितरण गंतव्य पता",
    enter_drop_loc_placeholder: "वितरण स्थान दर्ज करें",
    ledger_breakdown_title: "शुल्क बही और रसद प्रेषण",
    produce_subtotal: "उपज उप-योग",
    logistics_fare: "रसद किराया (स्वचालित)",
    logistics_fare_desc: "रसद किराया स्वचालित रूप से ऑर्डर का 5% + आधार दर गिना जाता है और एस्क्रो में रखा जाता है, और डिलीवरी पूरी होने पर भुगतान किया जाता है।",
    total_escrow_debit: "कुल एस्क्रो डेबिट",
    auth_escrow_place_order: "एस्क्रो स्वीकृत करें और ऑर्डर दें",

    status_pending: "एस्क्रो में लॉक",
    status_accepted: "चालक असाइन किया गया",
    status_in_transit: "रास्ते में है",
    status_delivered: "वितरित किया गया",
    status_available: "अनअसाइन किया गया",
    status_assigned: "चालक असाइन किया गया",
    status_open: "नौकरी खुली है",
    status_applied: "आवेदन किया",
    status_filled: "पद भर गया",

    active_channel: "सक्रिय चैनल",
    direct_marketplace_title: "सीधा उपज बाजार",
    direct_marketplace_desc: "बिना किसी बिचौलिये कमीशन के सीधे क्षेत्रीय जिलों के सत्यापित किसानों से खरीदा गया।",
    success_order_placed: "सफलता: ऑर्डर {id} स्वीकृत और एस्क्रो में है!",
    viewing_as_warning: "नोट: आप वर्तमान में {role} के रूप में देख रहे हैं। खरीद आदेश देने के लिए खरीदार के रूप में लॉग इन करें।",
    search_crops_placeholder: "{channel} के लिए उपलब्ध फसलों को खोजें...",
    no_crops_found: "इस चैनल पर कोई फसल नहीं मिली",
    no_crops_found_desc: "वर्तमान में {channel} चैनल के लिए कोई फसल उपलब्ध नहीं है।",
    filter_label: "फ़िल्टर:",
    all_regions: "सभी जिले",
    cat_all: "सभी",
    cat_vegetables: "सब्जियां",
    cat_fruits: "फल",
    cat_grains: "अनाज",
    cat_spices: "मसाले",
    channel_hotel: "होटल B2B थोक",
    channel_retail: "खुदरा दुकान B2B थोक",
    channel_marriage: "विवाह भोज थोक",
    channel_b2c: "सीधा ग्राहक B2C"
  }
};

interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  created_at: string;
}

interface AppContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  buyerType: BuyerType | null;
  setBuyerType: (type: BuyerType | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;

  language: Language;
  setLanguage: (lang: Language) => void;
  isVisualMode: boolean;
  setIsVisualMode: (val: boolean) => void;
  t: (key: string) => string;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  user: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, displayName: string, role: Role, buyerType?: BuyerType | null) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: Role, buyerType?: BuyerType | null) => Promise<void>;
  logout: () => Promise<void>;

  products: Product[];
  orders: Order[];
  deliveryJobs: DeliveryJob[];
  laborJobs: LaborJob[];
  rentalItems: RentalItem[];
  insights: MarketInsight[];

  wallets: Record<Role, number>;
  walletTransactions: WalletTransaction[];

  addProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => void;
  placeOrder: (productId: string, quantity: number, buyerName: string, deliveryLoc: string) => void;
  acceptDeliveryJob: (jobId: string, driverName: string) => void;
  completeDelivery: (jobId: string) => void;
  createLaborJob: (job: Omit<LaborJob, 'id' | 'farmerId' | 'farmerName' | 'status' | 'applicantsCount'>) => void;
  applyForLaborJob: (jobId: string) => void;
  hireLaborWorker: (jobId: string) => void;

  addRentalItem: (item: Omit<RentalItem, 'id' | 'vendorId' | 'vendorName' | 'status'>) => void;
  rentRentalItem: (itemId: string) => void;
  returnRentalItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock datasets
const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    pricePerKg: 32,
    stockKg: 450,
    location: 'Madurai East, TN',
    farmerName: 'Ramanathan Swamy',
    farmerId: 'farmer_1',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'b2c'
  },
  {
    id: 'p2',
    name: 'Premium Red Onions',
    category: 'Vegetables',
    pricePerKg: 28,
    stockKg: 1200,
    location: 'Nashik District, MH',
    farmerName: 'Dnyaneshwar Patil',
    farmerId: 'farmer_2',
    image: 'https://images.unsplash.com/photo-1508747703725-719ae25db3e4?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'retail'
  },
  {
    id: 'p3',
    name: 'Sona Masuri Rice',
    category: 'Grains',
    pricePerKg: 55,
    stockKg: 2000,
    location: 'Shimoga Rural, KA',
    farmerName: 'Basavaraj Gowda',
    farmerId: 'farmer_3',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'marriage'
  },
  {
    id: 'p4',
    name: 'Alphonso Mangoes',
    category: 'Fruits',
    pricePerKg: 180,
    stockKg: 150,
    location: 'Ratnagiri West, MH',
    farmerName: 'Dnyaneshwar Patil',
    farmerId: 'farmer_2',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'b2c'
  },
  {
    id: 'p5',
    name: 'Fresh Turmeric Finger',
    category: 'Spices',
    pricePerKg: 120,
    stockKg: 600,
    location: 'Erode North, TN',
    farmerName: 'Ramanathan Swamy',
    farmerId: 'farmer_1',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'hotel'
  },
  {
    id: 'p6',
    name: 'Cavendish Bananas',
    category: 'Fruits',
    pricePerKg: 25,
    stockKg: 1500,
    location: 'Madurai East, TN',
    farmerName: 'Ramanathan Swamy',
    farmerId: 'farmer_1',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
    targetChannel: 'hotel'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ord_101',
    productId: 'p2',
    productName: 'Premium Red Onions',
    buyerId: 'buyer_1',
    buyerName: 'Raza Wholesale Grocers',
    buyerType: 'retail',
    quantity: 300,
    totalPrice: 8400,
    status: 'delivered',
    farmerId: 'farmer_2',
    deliveryJobId: 'job_201',
    createdAt: '2026-06-22T14:30:00Z'
  },
  {
    id: 'ord_102',
    productId: 'p5',
    productName: 'Fresh Turmeric Finger',
    buyerId: 'buyer_2',
    buyerName: 'Gourmet Grand Hotel',
    buyerType: 'hotel',
    quantity: 100,
    totalPrice: 12000,
    status: 'in_transit',
    farmerId: 'farmer_1',
    deliveryJobId: 'job_202',
    createdAt: '2026-06-23T05:15:00Z'
  }
];

const initialDeliveryJobs: DeliveryJob[] = [
  {
    id: 'job_201',
    orderId: 'ord_101',
    productName: 'Premium Red Onions',
    quantity: 300,
    pickupLocation: 'Nashik District, MH',
    deliveryLocation: 'Nashik Town Plaza, MH',
    wage: 850,
    status: 'delivered',
    driverId: 'driver_1',
    driverName: 'Suresh Kumar'
  },
  {
    id: 'job_202',
    orderId: 'ord_102',
    productName: 'Fresh Turmeric Finger',
    quantity: 100,
    pickupLocation: 'Erode North, TN',
    deliveryLocation: 'Vasanth Nagar, Madurai, TN',
    wage: 650,
    status: 'assigned',
    driverId: 'driver_1',
    driverName: 'Suresh Kumar'
  }
];

const initialLaborJobs: LaborJob[] = [
  {
    id: 'lab_301',
    title: 'Paddy Harvesting Assistance',
    wages: 450,
    location: 'Shimoga Rural, KA',
    date: '2026-06-25',
    duration: '3 Days',
    farmerId: 'farmer_3',
    farmerName: 'Basavaraj Gowda',
    status: 'open',
    applicantsCount: 2,
    description: 'Requires cutting and gathering of mature paddy crops. Tools will be provided. Lunch included.'
  },
  {
    id: 'lab_302',
    title: 'Tomato Picking & Sorting',
    wages: 400,
    location: 'Madurai East, TN',
    date: '2026-06-24',
    duration: '2 Days',
    farmerId: 'farmer_1',
    farmerName: 'Ramanathan Swamy',
    status: 'applied',
    applicantsCount: 4,
    description: 'Requires sorting and packing fresh tomatoes into crates. Easy transport to the main hub.'
  }
];

const initialRentalItems: RentalItem[] = [
  {
    id: 'r1',
    name: 'John Deere Orchard Tractor',
    category: 'tractor',
    pricePerDay: 1800,
    location: 'Madurai East, TN',
    image: 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_1',
    vendorName: 'Srinivasan Agri Rentals',
    status: 'available'
  },
  {
    id: 'r2',
    name: 'Rotary Power Tiller (12HP)',
    category: 'tool',
    pricePerDay: 600,
    location: 'Erode North, TN',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_1',
    vendorName: 'Srinivasan Agri Rentals',
    status: 'available'
  },
  {
    id: 'r3',
    name: 'Agri Flatbed Cargo Vehicle',
    category: 'vehicle',
    pricePerDay: 2200,
    location: 'Madurai Rural, TN',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_2',
    vendorName: 'Sri Amman Motors',
    status: 'available'
  }
];

const initialInsights: MarketInsight[] = [
  {
    id: 'ins_1',
    crop: 'Tomato',
    region: 'Madurai, TN',
    govPrice: 28,
    demand: 'HIGH',
    trend: 'UP',
    priceChangePercent: 12.5,
    recommendation: 'Tomato demand is HIGH in Madurai. Expected price increase in 24–48 hours. Recommendation: SELL TODAY for guaranteed profit or hold for max 24 hours.'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>('farmer');
  const [buyerType, setBuyerType] = useState<BuyerType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Ramanathan Swamy');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('ta');
  const [isVisualMode, setIsVisualMode] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vlink_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vlink_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [deliveryJobs, setDeliveryJobs] = useState<DeliveryJob[]>(() => {
    const saved = localStorage.getItem('vlink_delivery_jobs');
    return saved ? JSON.parse(saved) : initialDeliveryJobs;
  });

  const [laborJobs, setLaborJobs] = useState<LaborJob[]>(() => {
    const saved = localStorage.getItem('vlink_labor_jobs');
    return saved ? JSON.parse(saved) : initialLaborJobs;
  });

  const [rentalItems, setRentalItems] = useState<RentalItem[]>(() => {
    const saved = localStorage.getItem('vlink_rental_items');
    return saved ? JSON.parse(saved) : initialRentalItems;
  });

  const [insights] = useState<MarketInsight[]>(initialInsights);

  const [wallets, setWallets] = useState<Record<Role, number>>(() => {
    const saved = localStorage.getItem('vlink_wallets');
    return saved ? JSON.parse(saved) : {
      farmer: 18500,
      buyer: 45000,
      delivery: 2450,
      labor: 1800,
      vendor: 12200
    };
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('vlink_wallet_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 't_seed_1', user_id: 'farmer_1', amount: 18500, transaction_type: 'credit', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 't_seed_2', user_id: 'buyer_1', amount: 45000, transaction_type: 'credit', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 't_seed_3', user_id: 'driver_1', amount: 2450, transaction_type: 'credit', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 't_seed_4', user_id: 'labor_1', amount: 1800, transaction_type: 'credit', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];
  });

  // Persist local states in localStorage
  useEffect(() => {
    localStorage.setItem('vlink_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vlink_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vlink_delivery_jobs', JSON.stringify(deliveryJobs));
  }, [deliveryJobs]);

  useEffect(() => {
    localStorage.setItem('vlink_labor_jobs', JSON.stringify(laborJobs));
  }, [laborJobs]);

  useEffect(() => {
    localStorage.setItem('vlink_rental_items', JSON.stringify(rentalItems));
  }, [rentalItems]);

  useEffect(() => {
    localStorage.setItem('vlink_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('vlink_wallet_transactions', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // Auth Listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      setLoading(true);
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedUser = localStorage.getItem('vlink_sandbox_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setUser(parsed);
        setActiveRole(parsed.role);
        setBuyerType(parsed.buyerType || null);
        setUserName(parsed.displayName);
        setIsLoggedIn(true);
      }
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (id: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Create profile if not found
        const newProfile: UserProfile = {
          id,
          email,
          displayName: email.split('@')[0],
          role: 'farmer',
          buyerType: null,
          createdAt: new Date().toISOString()
        };
        await supabase.from('profiles').insert([{
          id,
          full_name: newProfile.displayName,
          email: newProfile.email,
          role: newProfile.role
        }]);
        setUser(newProfile);
        setActiveRole(newProfile.role);
        setUserName(newProfile.displayName);
        setIsLoggedIn(true);
      } else if (data) {
        const mappedProfile: UserProfile = {
          id: data.id,
          email: data.email,
          displayName: data.full_name || email.split('@')[0],
          role: data.role || 'farmer',
          buyerType: null,
          createdAt: data.created_at || new Date().toISOString()
        };
        setUser(mappedProfile);
        setActiveRole(mappedProfile.role);
        setUserName(mappedProfile.displayName);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync Supabase Database (if configured)
  const syncSupabaseData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Products
      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts) {
        const mappedProds: Product[] = dbProducts.map((p: any) => ({
          id: p.id.toString(),
          name: p.crop_name,
          category: 'Vegetables',
          pricePerKg: p.price,
          stockKg: p.quantity,
          location: p.location,
          farmerId: p.farmer_id,
          farmerName: 'Ramanathan Swamy', // Default joining mockup
          image: p.image || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80',
          targetChannel: 'b2c'
        }));
        setProducts(mappedProds);
      }

      // Orders
      const { data: dbOrders } = await supabase.from('orders').select('*');
      if (dbOrders) {
        const mappedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id.toString(),
          productId: o.product_id.toString(),
          productName: 'Organic Tomato Bulk', // Joined placeholder
          buyerId: o.buyer_id,
          buyerName: 'Buyer ' + o.buyer_id.substring(0, 4),
          buyerType: 'retail',
          quantity: 250,
          totalPrice: 8000,
          status: o.status || 'pending',
          farmerId: 'farmer_1',
          createdAt: o.created_at
        }));
        setOrders(mappedOrders);
      }

      // Delivery Jobs
      const { data: dbDelivery } = await supabase.from('delivery_jobs').select('*');
      if (dbDelivery) {
        const mappedJobs: DeliveryJob[] = dbDelivery.map((d: any) => ({
          id: d.id.toString(),
          orderId: d.order_id.toString(),
          productName: 'Dispatch Cargo Lot',
          quantity: 250,
          pickupLocation: 'Madurai East, TN',
          deliveryLocation: 'Vasanth Nagar, Madurai, TN',
          wage: 750,
          status: d.status || 'available',
          driverId: d.delivery_partner_id,
          driverName: 'Suresh Kumar'
        }));
        setDeliveryJobs(mappedJobs);
      }

      // Labor Jobs
      const { data: dbLabor } = await supabase.from('labor_jobs').select('*');
      if (dbLabor) {
        const mappedLabor: LaborJob[] = dbLabor.map((l: any) => ({
          id: l.id.toString(),
          title: l.title,
          wages: l.wage,
          location: l.location,
          date: new Date().toISOString().split('T')[0],
          duration: '3 Days',
          farmerId: 'farmer_1',
          farmerName: 'Ramanathan Swamy',
          status: l.status || 'open',
          applicantsCount: 1,
          description: l.description || ''
        }));
        setLaborJobs(mappedLabor);
      }

      // Wallet Transactions & Balances
      if (user) {
        const { data: txs } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id);
        
        if (txs) {
          const mappedTxs: WalletTransaction[] = txs.map((t: any) => ({
            id: t.id.toString(),
            user_id: t.user_id,
            amount: t.amount,
            transaction_type: t.transaction_type,
            created_at: t.created_at
          }));
          setWalletTransactions(mappedTxs);

          // Compute user wallet
          let balance = 0;
          mappedTxs.forEach((t) => {
            if (t.transaction_type === 'credit') {
              balance += t.amount;
            } else {
              balance -= t.amount;
            }
          });
          
          setWallets((prev) => ({
            ...prev,
            [activeRole]: balance > 0 ? balance : 1000 // Ensure some positive fallback
          }));
        }
      }
    } catch (err) {
      console.error('Error syncing Supabase tables:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && isLoggedIn && user) {
      syncSupabaseData();
    }
  }, [isLoggedIn, user, activeRole]);

  // Theme State
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vlink_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light';
  });

  const setTheme = (val: 'light' | 'dark') => {
    setThemeState(val);
    localStorage.setItem('vlink_theme', val);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth Operations
  const signUpWithEmail = async (email: string, password: string, displayName: string, role: Role, buyerType?: BuyerType | null) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) throw signUpError;
        if (authData.user) {
          const profileRow = {
            id: authData.user.id,
            full_name: displayName,
            email: email,
            role: role
          };
          const { error: profileError } = await supabase.from('profiles').insert([profileRow]);
          if (profileError) throw profileError;

          // Initialize wallet transaction seed
          const initialAmt = role === 'buyer' ? 45000 : role === 'farmer' ? 18500 : 2500;
          await supabase.from('wallet_transactions').insert([{
            user_id: authData.user.id,
            amount: initialAmt,
            transaction_type: 'credit'
          }]);

          const newUser: UserProfile = {
            id: authData.user.id,
            email,
            displayName,
            role,
            buyerType: buyerType || null,
            createdAt: new Date().toISOString()
          };
          setUser(newUser);
          setUserName(displayName);
          setActiveRole(role);
          setBuyerType(buyerType || null);
        }
      } else {
        const mockUid = `mock_${Date.now()}`;
        const newUser: UserProfile = {
          id: mockUid,
          email,
          displayName,
          role,
          buyerType: buyerType || null,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`vlink_user_profile_${mockUid}`, JSON.stringify(newUser));
        localStorage.setItem('vlink_sandbox_user', JSON.stringify(newUser));
        
        // Seed mock transactions
        const initialAmt = role === 'buyer' ? 45000 : role === 'farmer' ? 18500 : 2500;
        const seedTx: WalletTransaction = {
          id: `t_${Date.now()}`,
          user_id: mockUid,
          amount: initialAmt,
          transaction_type: 'credit',
          created_at: new Date().toISOString()
        };
        setWalletTransactions((prev) => [seedTx, ...prev]);
        setWallets((prev) => ({ ...prev, [role]: initialAmt }));

        setUser(newUser);
        setUserName(displayName);
        setActiveRole(role);
        setBuyerType(buyerType || null);
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          await fetchUserProfile(data.user.id, data.user.email || '');
        }
      } else {
        let foundProfile: UserProfile | null = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('vlink_user_profile_')) {
            const val = localStorage.getItem(key);
            if (val) {
              const parsed = JSON.parse(val) as UserProfile;
              if (parsed.email.toLowerCase() === email.toLowerCase()) {
                foundProfile = parsed;
                break;
              }
            }
          }
        }
        
        if (!foundProfile) {
          const mockUid = `mock_${Date.now()}`;
          foundProfile = {
            id: mockUid,
            email,
            displayName: email.split('@')[0],
            role: 'farmer',
            buyerType: null,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`vlink_user_profile_${mockUid}`, JSON.stringify(foundProfile));
        }

        localStorage.setItem('vlink_sandbox_user', JSON.stringify(foundProfile));
        setUser(foundProfile);
        setUserName(foundProfile.displayName);
        setActiveRole(foundProfile.role);
        setBuyerType(foundProfile.buyerType || null);
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: Role, buyerType?: BuyerType | null) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google'
        });
        if (error) throw error;
      } else {
        const mockUid = `mock_google_${Date.now()}`;
        const profile: UserProfile = {
          id: mockUid,
          email: 'googleuser@vlink.com',
          displayName: 'Google Sandbox User',
          role,
          buyerType: buyerType || null,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('vlink_sandbox_user', JSON.stringify(profile));
        localStorage.setItem(`vlink_user_profile_${mockUid}`, JSON.stringify(profile));
        
        const seedTx: WalletTransaction = {
          id: `t_${Date.now()}`,
          user_id: mockUid,
          amount: 25000,
          transaction_type: 'credit',
          created_at: new Date().toISOString()
        };
        setWalletTransactions((prev) => [seedTx, ...prev]);
        setUser(profile);
        setUserName(profile.displayName);
        setActiveRole(role);
        setBuyerType(buyerType || null);
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error Google login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('vlink_sandbox_user');
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sync profile names and templates
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeRole === 'farmer') {
      setUserName(user?.displayName || 'Ramanathan Swamy');
      setBuyerType(null);
    } else if (activeRole === 'buyer') {
      if (!buyerType) setBuyerType('customer');
      setUserName(
        buyerType === 'hotel' ? 'Gourmet Grand Hotel' :
          buyerType === 'retail' ? 'Raza Grocers' :
            buyerType === 'marriage' ? 'Vasantha Mahal' :
              user?.displayName || 'Anjali Sharma'
      );
    } else if (activeRole === 'delivery') {
      setUserName(user?.displayName || 'Suresh Kumar');
      setBuyerType(null);
    } else if (activeRole === 'labor') {
      setUserName(user?.displayName || 'Karthick Raja');
      setBuyerType(null);
    } else if (activeRole === 'vendor') {
      setUserName(user?.displayName || 'Srinivasan');
      setBuyerType(null);
    }
  }, [activeRole, buyerType, isLoggedIn]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  // Business Flows
  const addProduct = async (newProd: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => {
    const idStr = `p_${Date.now()}`;
    const farmerId = user?.id || 'farmer_1';
    
    const freshProd: Product = {
      ...newProd,
      id: idStr,
      farmerId,
      farmerName: userName,
    };
    
    setProducts((prev) => [freshProd, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').insert([{
          crop_name: freshProd.name,
          quantity: freshProd.stockKg,
          unit: 'kg',
          price: freshProd.pricePerKg,
          location: freshProd.location,
          farmer_id: farmerId
        }]);
      } catch (err) {
        console.error('Supabase product insert error:', err);
      }
    }
  };

  const placeOrder = async (productId: string, quantity: number, buyerName: string, deliveryLoc: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stockKg < quantity) return;

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockKg: p.stockKg - quantity } : p))
    );

    const orderId = `ord_${Date.now()}`;
    const deliveryJobId = `job_${Date.now()}`;
    const totalPrice = product.pricePerKg * quantity;

    // Deduct Buyer Wallet
    setWallets((prev) => ({
      ...prev,
      buyer: prev.buyer - totalPrice
    }));

    const debitTx: WalletTransaction = {
      id: `t_deb_${Date.now()}`,
      user_id: user?.id || 'buyer_1',
      amount: totalPrice,
      transaction_type: 'debit',
      created_at: new Date().toISOString()
    };
    setWalletTransactions((prev) => [debitTx, ...prev]);

    const newOrder: Order = {
      id: orderId,
      productId,
      productName: product.name,
      buyerId: user?.id || 'buyer_1',
      buyerName: buyerName,
      buyerType: buyerType || 'customer',
      quantity,
      totalPrice,
      status: 'pending',
      farmerId: product.farmerId,
      deliveryJobId,
      createdAt: new Date().toISOString()
    };

    const newJob: DeliveryJob = {
      id: deliveryJobId,
      orderId,
      productName: product.name,
      quantity,
      pickupLocation: product.location,
      deliveryLocation: deliveryLoc,
      wage: Math.round(totalPrice * 0.05 + 150),
      status: 'available'
    };

    setOrders((prev) => [newOrder, ...prev]);
    setDeliveryJobs((prev) => [newJob, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: oData, error: oError } = await supabase.from('orders').insert([{
          product_id: parseInt(productId.replace(/\D/g, '')) || 1, // Safe numeric parsing
          buyer_id: user?.id || 'buyer_1',
          status: 'pending'
        }]).select();

        if (!oError && oData && oData[0]) {
          await supabase.from('delivery_jobs').insert([{
            order_id: oData[0].id,
            status: 'available'
          }]);
        }

        await supabase.from('wallet_transactions').insert([{
          user_id: user?.id || 'buyer_1',
          amount: totalPrice,
          transaction_type: 'debit'
        }]);
      } catch (err) {
        console.error('Supabase place order error:', err);
      }
    }
  };

  const acceptDeliveryJob = async (jobId: string, driverName: string) => {
    setDeliveryJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, status: 'assigned', driverId: user?.id || 'driver_1', driverName }
          : job
      )
    );

    const targetJob = deliveryJobs.find((j) => j.id === jobId);
    if (targetJob) {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === targetJob.orderId ? { ...ord, status: 'accepted' } : ord
        )
      );

      if (isSupabaseConfigured && supabase) {
        try {
          const numJobId = parseInt(jobId.replace(/\D/g, '')) || 1;
          const numOrderId = parseInt(targetJob.orderId.replace(/\D/g, '')) || 1;
          
          await supabase.from('delivery_jobs').update({
            status: 'assigned',
            delivery_partner_id: user?.id || 'driver_1'
          }).eq('id', numJobId);

          await supabase.from('orders').update({
            status: 'accepted'
          }).eq('id', numOrderId);
        } catch (err) {
          console.error('Supabase accept job error:', err);
        }
      }
    }
  };

  const completeDelivery = async (jobId: string) => {
    const job = deliveryJobs.find((j) => j.id === jobId);
    if (!job) return;

    setDeliveryJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'delivered' } : j))
    );

    setOrders((prev) =>
      prev.map((ord) => (ord.id === job.orderId ? { ...ord, status: 'delivered' } : ord))
    );

    const order = orders.find((o) => o.id === job.orderId);
    if (order) {
      const farmerEarnings = order.totalPrice;
      const driverEarnings = job.wage;

      setWallets((prev) => ({
        ...prev,
        farmer: order.farmerId === 'farmer_1' ? prev.farmer + farmerEarnings : prev.farmer,
        delivery: prev.delivery + driverEarnings
      }));

      // Credit Transactions
      const txFarmer: WalletTransaction = {
        id: `t_farm_${Date.now()}`,
        user_id: order.farmerId,
        amount: farmerEarnings,
        transaction_type: 'credit',
        created_at: new Date().toISOString()
      };

      const txDriver: WalletTransaction = {
        id: `t_drv_${Date.now()}`,
        user_id: user?.id || 'driver_1',
        amount: driverEarnings,
        transaction_type: 'credit',
        created_at: new Date().toISOString()
      };

      setWalletTransactions((prev) => [txDriver, txFarmer, ...prev]);

      if (isSupabaseConfigured && supabase) {
        try {
          const numJobId = parseInt(jobId.replace(/\D/g, '')) || 1;
          const numOrderId = parseInt(job.orderId.replace(/\D/g, '')) || 1;

          await supabase.from('delivery_jobs').update({ status: 'delivered' }).eq('id', numJobId);
          await supabase.from('orders').update({ status: 'delivered' }).eq('id', numOrderId);
          
          await supabase.from('wallet_transactions').insert([
            { user_id: order.farmerId, amount: farmerEarnings, transaction_type: 'credit' },
            { user_id: user?.id || 'driver_1', amount: driverEarnings, transaction_type: 'credit' }
          ]);
        } catch (err) {
          console.error('Supabase complete delivery error:', err);
        }
      }
    }
  };

  const createLaborJob = async (newJob: Omit<LaborJob, 'id' | 'farmerId' | 'farmerName' | 'status' | 'applicantsCount'>) => {
    const jobVal: LaborJob = {
      ...newJob,
      id: `lab_${Date.now()}`,
      farmerId: user?.id || 'farmer_1',
      farmerName: userName,
      status: 'open',
      applicantsCount: 0
    };
    
    setLaborJobs((prev) => [jobVal, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('labor_jobs').insert([{
          title: jobVal.title,
          description: jobVal.description,
          wage: jobVal.wages,
          location: jobVal.location,
          status: 'open'
        }]);
      } catch (err) {
        console.error('Supabase labor insert error:', err);
      }
    }
  };

  const applyForLaborJob = async (jobId: string) => {
    setLaborJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
            ...job,
            status: job.status === 'open' ? 'applied' : job.status,
            applicantsCount: job.applicantsCount + 1
          }
          : job
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const numJobId = parseInt(jobId.replace(/\D/g, '')) || 1;
        await supabase.from('labor_jobs').update({ status: 'applied' }).eq('id', numJobId);
      } catch (err) {
        console.error('Supabase apply job error:', err);
      }
    }
  };

  const hireLaborWorker = async (jobId: string) => {
    const job = laborJobs.find((j) => j.id === jobId);
    if (!job) return;

    setWallets((prev) => ({
      ...prev,
      farmer: prev.farmer - job.wages,
      labor: prev.labor + job.wages
    }));

    const txFarmDeb: WalletTransaction = {
      id: `t_fl_${Date.now()}`,
      user_id: user?.id || 'farmer_1',
      amount: job.wages,
      transaction_type: 'debit',
      created_at: new Date().toISOString()
    };

    const txLabCred: WalletTransaction = {
      id: `t_lc_${Date.now()}`,
      user_id: 'labor_1',
      amount: job.wages,
      transaction_type: 'credit',
      created_at: new Date().toISOString()
    };

    setWalletTransactions((prev) => [txLabCred, txFarmDeb, ...prev]);

    setLaborJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'filled' } : j))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const numJobId = parseInt(jobId.replace(/\D/g, '')) || 1;
        await supabase.from('labor_jobs').update({ status: 'filled' }).eq('id', numJobId);
        
        await supabase.from('wallet_transactions').insert([
          { user_id: user?.id || 'farmer_1', amount: job.wages, transaction_type: 'debit' },
          { user_id: 'labor_1', amount: job.wages, transaction_type: 'credit' }
        ]);
      } catch (err) {
        console.error('Supabase hire labor error:', err);
      }
    }
  };

  const addRentalItem = (newRental: Omit<RentalItem, 'id' | 'vendorId' | 'vendorName' | 'status'>) => {
    const freshRental: RentalItem = {
      ...newRental,
      id: `r_${Date.now()}`,
      vendorId: 'vendor_1',
      vendorName: 'Srinivasan Agri Rentals',
      status: 'available'
    };
    setRentalItems((prev) => [freshRental, ...prev]);
  };

  const rentRentalItem = (itemId: string) => {
    const item = rentalItems.find((r) => r.id === itemId);
    if (!item || item.status !== 'available') return;

    setRentalItems((prev) =>
      prev.map((r) => (r.id === itemId ? { ...r, status: 'rented' } : r))
    );

    setWallets((prev) => ({
      ...prev,
      farmer: prev.farmer - item.pricePerDay,
      vendor: prev.vendor + item.pricePerDay
    }));

    const txFarmDeb: WalletTransaction = {
      id: `t_fr_${Date.now()}`,
      user_id: user?.id || 'farmer_1',
      amount: item.pricePerDay,
      transaction_type: 'debit',
      created_at: new Date().toISOString()
    };
    const txVendCred: WalletTransaction = {
      id: `t_vc_${Date.now()}`,
      user_id: 'vendor_1',
      amount: item.pricePerDay,
      transaction_type: 'credit',
      created_at: new Date().toISOString()
    };
    setWalletTransactions((prev) => [txVendCred, txFarmDeb, ...prev]);
  };

  const returnRentalItem = (itemId: string) => {
    setRentalItems((prev) =>
      prev.map((r) => (r.id === itemId ? { ...r, status: 'available' } : r))
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        buyerType,
        setBuyerType,
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        language,
        setLanguage,
        isVisualMode,
        setIsVisualMode,
        t,
        products,
        orders,
        deliveryJobs,
        laborJobs,
        rentalItems,
        insights,
        wallets,
        walletTransactions,
        addProduct,
        placeOrder,
        acceptDeliveryJob,
        completeDelivery,
        createLaborJob,
        applyForLaborJob,
        hireLaborWorker,
        addRentalItem,
        rentRentalItem,
        returnRentalItem,
        theme,
        setTheme,
        user,
        loading,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
