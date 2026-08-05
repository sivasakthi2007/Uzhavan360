'use client';

import taTranslations from '../locales/ta.json';
import enTranslations from '../locales/en.json';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createProfile } from '../lib/auth';
import { useAuth } from './AuthContext';
import { MarketPrice, GovScheme, DEFAULT_MARKET_PRICES, DEFAULT_GOV_SCHEMES } from '../lib/cachedData';
import { ScanResult, saveScanRecord, fetchScanHistory } from '../services/scanService';

// ─── Type definitions ───────────────────────────────────────────────
export type Role = 'farmer' | 'buyer' | 'labor' | 'vendor' | 'admin';
export type BuyerType = 'customer' | 'hotel' | 'retail' | 'marriage';
export type Language = 'ta' | 'en';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  buyerType?: BuyerType | null;
  createdAt: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name?: string;
  image_url?: string;
  village: string;
  district: string;
  state: string;
  gps_location?: string;
  land_size: number;
  land_unit: 'acres' | 'hectares';
  soil_type: string;
  water_source: string;
  primary_crop: string;
  secondary_crop?: string;
  sowing_date: string;
  expected_harvest_date: string;
  created_at?: string;
  prebook_available?: boolean;
  prebook_price?: number;
  prebook_quantity?: number;
}

export interface BuyerRequirement {
  id: string;
  crop: string;
  quantity: number;
  requiredDate: string;
  location: string;
  buyerId: string;
  buyerName: string;
  status: 'open' | 'matched';
  matchedFarmerId?: string;
  matchedFarmerName?: string;
  createdAt: string;
}

export interface FarmExpense {
  id: string;
  farm_id: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'rentals' | 'labour' | 'transport' | 'misc';
  amount: number;
  description?: string;
  date: string;
  created_at?: string;
}

export interface FarmIncome {
  id: string;
  farm_id: string;
  buyer_name?: string;
  crop_sold: string;
  quantity: number;
  price_per_unit: number;
  total_income: number;
  date: string;
  created_at?: string;
}

export interface SchemeApplication {
  id: string;
  user_id: string;
  scheme_id: string;
  scheme_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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
  createdAt: string;
  distanceKm: number;
  farmerRating: number;
  isVerifiedFarmer: boolean;
  isRecommended: boolean;
  salesCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  village?: string;
  taluk?: string;
  district?: string;
  farmerContact?: string;
  shareContactConsent?: boolean;
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
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  farmerId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
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
  status: 'open' | 'applied' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  applicantsCount: number;
  description: string;
  workersNeeded: number;
  skills: string[];
  village: string;
  taluk: string;
  district: string;
  category: 'Land Preparation' | 'Planting' | 'Weeding' | 'Fertilizer Application' | 'Irrigation' | 'Pesticide Spraying' | 'Harvesting' | 'Packaging' | 'Loading & Unloading' | 'Other Farm Work';
  saved?: boolean;
  createdAt: string;
  distanceKm: number;
  isUrgent: boolean;
  isVerifiedEmployer: boolean;
  farmerRating: number;
}

export interface RentalItemReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RentalItem {
  id: string;
  name: string;
  equipmentType: 'tractor' | 'harvester' | 'rotavator' | 'tiller' | 'seeder' | 'cultivator' | 'sprayer' | 'pump' | 'truck' | 'tool' | 'other';
  category: 'tractor' | 'vehicle' | 'tool' | 'harvester' | 'sprayer' | 'pump' | 'other';
  pricePerDay: number;
  pricePerHour: number;
  location: string;
  village: string;
  district: string;
  distanceKm: number;
  image: string;
  vendorId: string;
  vendorName: string;
  ownerRating: number;
  reviewCount: number;
  description: string;
  status: 'available' | 'rented' | 'maintenance';
  availableDates: string[]; // ISO date strings
  specs: Record<string, string>;
  reviews: RentalItemReview[];
  createdAt: string;
  isVerifiedOwner: boolean;
  isRecommended: boolean;
}

export interface RentalBooking {
  id: string;
  itemId: string;
  itemName: string;
  renterId: string;
  renterName: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  totalDays: number;
  totalCost: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
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

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  created_at: string;
}

// ─── Translations dictionary ────────────────────────────────────────
const translations: Record<Language, Record<string, any>> = {
  ta: taTranslations,
  en: enTranslations
};

// ─── Helper: generate available dates (next 14 days excluding 2-3 random busy days) ────
const genAvailDates = (busyDayIndices: number[] = []): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    if (!busyDayIndices.includes(i)) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
};

// ─── Mock seed data ─────────────────────────────────────────────────
const SEED_FARMS: Farm[] = [
  {
    id: 'farm_1',
    user_id: 'farmer_1',
    name: 'Thangam Farm (தங்கம் பண்ணை)',
    image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    village: 'Melur (மேலூர்)',
    district: 'Madurai (மதுரை)',
    state: 'Tamil Nadu (தமிழ்நாடு)',
    gps_location: '9.9833, 78.3333',
    land_size: 2.5,
    land_unit: 'acres',
    soil_type: 'Clay Loam (களிமண் கலவை)',
    water_source: 'Borewell (ஆழ்துளை கிணறு)',
    primary_crop: 'Tomato (தக்காளி)',
    secondary_crop: 'Chilli (மிளகாய்)',
    sowing_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days ago
    expected_harvest_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 55 days from now
    created_at: new Date().toISOString()
  }
];

const SEED_FARM_EXPENSES: FarmExpense[] = [
  {
    id: 'exp_1',
    farm_id: 'farm_1',
    category: 'seeds',
    amount: 1500,
    description: 'Tomato Hybrid Seeds',
    date: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'exp_2',
    farm_id: 'farm_1',
    category: 'fertilizers',
    amount: 3200,
    description: 'Organic NPK Compost Pack',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'exp_3',
    farm_id: 'farm_1',
    category: 'labour',
    amount: 1800,
    description: 'Weeding Support',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const SEED_FARM_INCOMES: FarmIncome[] = [
  {
    id: 'inc_1',
    farm_id: 'farm_1',
    buyer_name: 'Madurai Fresh Mart',
    crop_sold: 'Tomato (தக்காளி)',
    quantity: 120,
    price_per_unit: 35,
    total_income: 4200,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const SEED_SCHEME_APPLICATIONS: SchemeApplication[] = [
  {
    id: 'app_1',
    user_id: 'farmer_1',
    scheme_id: 'scheme_pm_kisan',
    scheme_name: 'PM-KISAN (Samman Nidhi)',
    status: 'pending',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Organic Tomatoes', category: 'Vegetables', pricePerKg: 32, stockKg: 840, location: 'Madurai East, TN', farmerName: 'Ramanathan Swamy', farmerId: 'farmer_1', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80', targetChannel: 'b2c', createdAt: '2026-07-01T10:00:00Z', distanceKm: 4.2, farmerRating: 4.8, isVerifiedFarmer: true, isRecommended: true, salesCount: 350, isNew: false, isTrending: true, village: 'Othakadai', district: 'Madurai', farmerContact: '+91 94432 10987', shareContactConsent: true },
  { id: 'prod_2', name: 'Red Onions', category: 'Vegetables', pricePerKg: 28, stockKg: 1200, location: 'Dindigul, TN', farmerName: 'Lakshmi Devi', farmerId: 'farmer_2', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80', targetChannel: 'hotel', createdAt: '2026-07-02T11:30:00Z', distanceKm: 28.5, farmerRating: 4.5, isVerifiedFarmer: true, isRecommended: true, salesCount: 180, isNew: true, isTrending: false, village: 'Palani', district: 'Dindigul', farmerContact: '+91 98421 23456', shareContactConsent: true },
  { id: 'prod_3', name: 'Green Chillies', category: 'Vegetables', pricePerKg: 45, stockKg: 360, location: 'Virudhunagar, TN', farmerName: 'Murugan Vel', farmerId: 'farmer_3', image: 'https://images.unsplash.com/photo-1588891557711-3635694de1c0?w=400&auto=format&fit=crop&q=80', targetChannel: 'retail', createdAt: '2026-06-30T09:00:00Z', distanceKm: 12.1, farmerRating: 4.2, isVerifiedFarmer: false, isRecommended: false, salesCount: 95, isNew: false, isTrending: false, village: 'Sattur', district: 'Virudhunagar', farmerContact: '+91 97654 32109', shareContactConsent: false },
  { id: 'prod_4', name: 'Alphonso Mangoes', category: 'Fruits', pricePerKg: 120, stockKg: 500, location: 'Ratnagiri, MH', farmerName: 'Shankar Patil', farmerId: 'farmer_4', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80', targetChannel: 'b2c', createdAt: '2026-07-02T16:00:00Z', distanceKm: 45.0, farmerRating: 4.9, isVerifiedFarmer: true, isRecommended: true, salesCount: 420, isNew: true, isTrending: true, village: 'Guhagar', district: 'Ratnagiri', farmerContact: '+91 91234 56789', shareContactConsent: true },
  { id: 'prod_5', name: 'Basmati Paddy Rice', category: 'Grains', pricePerKg: 55, stockKg: 2000, location: 'Thanjavur, TN', farmerName: 'Anbu Selvan', farmerId: 'farmer_5', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80', targetChannel: 'hotel', createdAt: '2026-06-28T08:15:00Z', distanceKm: 5.5, farmerRating: 4.7, isVerifiedFarmer: true, isRecommended: true, salesCount: 510, isNew: false, isTrending: true, village: 'Kumbakonam', district: 'Thanjavur', farmerContact: '+91 94876 54321', shareContactConsent: true },
  { id: 'prod_6', name: 'Turmeric Fingers', category: 'Spices', pricePerKg: 95, stockKg: 600, location: 'Erode, TN', farmerName: 'Kavitha Raman', farmerId: 'farmer_6', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80', targetChannel: 'retail', createdAt: '2026-06-29T14:45:00Z', distanceKm: 14.3, farmerRating: 4.0, isVerifiedFarmer: false, isRecommended: false, salesCount: 80, isNew: false, isTrending: false, village: 'Gobichettipalayam', district: 'Erode', farmerContact: '+91 95432 16789', shareContactConsent: true },
  { id: 'prod_7', name: 'Fresh Drumsticks', category: 'Vegetables', pricePerKg: 38, stockKg: 450, location: 'Madurai West, TN', farmerName: 'Ramanathan Swamy', farmerId: 'farmer_1', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80', targetChannel: 'marriage', createdAt: '2026-07-03T07:30:00Z', distanceKm: 6.8, farmerRating: 4.8, isVerifiedFarmer: true, isRecommended: false, salesCount: 150, isNew: true, isTrending: false, village: 'Thiruparankundram', district: 'Madurai', farmerContact: '+91 94432 10987', shareContactConsent: true },
  { id: 'prod_8', name: 'Cluster Beans (Kothavarangai)', category: 'Vegetables', pricePerKg: 42, stockKg: 0, location: 'Sivagangai, TN', farmerName: 'Priya Narayanan', farmerId: 'farmer_7', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80', targetChannel: 'b2c', createdAt: '2026-07-01T15:20:00Z', distanceKm: 22.0, farmerRating: 4.6, isVerifiedFarmer: true, isRecommended: false, salesCount: 110, isNew: false, isTrending: false, village: 'Karaikudi', district: 'Sivagangai', farmerContact: '+91 98765 43210', shareContactConsent: true },
];

const SEED_ORDERS: Order[] = [
  { id: 'ORD-001', productId: 'prod_1', productName: 'Organic Tomatoes', buyerId: 'buyer_1', buyerName: 'Gourmet Grand Hotel', buyerType: 'hotel', quantity: 200, totalPrice: 6400, status: 'accepted', farmerId: 'farmer_1', createdAt: '2026-06-25T08:30:00Z' },
  { id: 'ORD-002', productId: 'prod_2', productName: 'Red Onions', buyerId: 'buyer_2', buyerName: 'Raza Grocers', buyerType: 'retail', quantity: 500, totalPrice: 14000, status: 'pending', farmerId: 'farmer_2', createdAt: '2026-06-25T14:15:00Z' },
  { id: 'ORD-003', productId: 'prod_5', productName: 'Basmati Paddy Rice', buyerId: 'buyer_3', buyerName: 'Sri Lakshmi Caterers', buyerType: 'marriage', quantity: 300, totalPrice: 16500, status: 'completed', farmerId: 'farmer_5', createdAt: '2026-06-24T10:00:00Z' },
];

const SEED_LABOR_JOBS: LaborJob[] = [
  { 
    id: 'lj_1', 
    title: 'Tomato Harvesting – 5 Workers Needed', 
    wages: 450, 
    location: 'Madurai East, TN', 
    date: '2026-06-28', 
    duration: '3 Days', 
    farmerId: 'farmer_1', 
    farmerName: 'Ramanathan Swamy', 
    status: 'open', 
    applicantsCount: 2, 
    description: 'Seasonal tomato harvesting. Experience with organic fields preferred. Standard 8-hour shift.',
    workersNeeded: 5,
    skills: ['Harvesting', 'Sorting'],
    village: 'Othakadai',
    taluk: 'Madurai East',
    district: 'Madurai',
    category: 'Harvesting',
    saved: false,
    createdAt: '2026-07-02T08:00:00Z',
    distanceKm: 4.2,
    isUrgent: true,
    isVerifiedEmployer: true,
    farmerRating: 4.8
  },
  { 
    id: 'lj_2', 
    title: 'Paddy Field Sowing Support', 
    wages: 500, 
    location: 'Thanjavur, TN', 
    date: '2026-07-01', 
    duration: '5 Days', 
    farmerId: 'farmer_5', 
    farmerName: 'Anbu Selvan', 
    status: 'open', 
    applicantsCount: 0, 
    description: 'Need 8 workers for paddy sowing. Meals and transportation included. Experience in flooded fields required.',
    workersNeeded: 8,
    skills: ['Planting', 'Irrigation'],
    village: 'Kabisthalam',
    taluk: 'Papanasam',
    district: 'Thanjavur',
    category: 'Planting',
    saved: true,
    createdAt: '2026-07-03T09:00:00Z',
    distanceKm: 8.5,
    isUrgent: false,
    isVerifiedEmployer: true,
    farmerRating: 4.7
  },
  { 
    id: 'lj_3', 
    title: 'Turmeric Root Cleaning', 
    wages: 380, 
    location: 'Erode, TN', 
    date: '2026-06-30', 
    duration: '2 Days', 
    farmerId: 'farmer_6', 
    farmerName: 'Kavitha Raman', 
    status: 'open', 
    applicantsCount: 3, 
    description: 'Root washing and drying preparation for export lot. Indoor warehouse work.',
    workersNeeded: 4,
    skills: ['Packaging', 'Loading & Unloading'],
    village: 'Kodumudi',
    taluk: 'Kodumudi',
    district: 'Erode',
    category: 'Packaging',
    saved: false,
    createdAt: '2026-07-01T10:00:00Z',
    distanceKm: 14.3,
    isUrgent: false,
    isVerifiedEmployer: false,
    farmerRating: 4.0
  },
  { 
    id: 'lj_4', 
    title: 'Mango Orchard Pruning', 
    wages: 520, 
    location: 'Ratnagiri, MH', 
    date: '2026-07-05', 
    duration: '4 Days', 
    farmerId: 'farmer_4', 
    farmerName: 'Shankar Patil', 
    status: 'open', 
    applicantsCount: 1, 
    description: 'Post-harvest pruning. Bring own secateurs if possible. Training will be provided.',
    workersNeeded: 3,
    skills: ['Land Preparation', 'Other Farm Work'],
    village: 'Guhagar',
    taluk: 'Guhagar',
    district: 'Ratnagiri',
    category: 'Other Farm Work',
    saved: false,
    createdAt: '2026-07-03T11:00:00Z',
    distanceKm: 45.0,
    isUrgent: true,
    isVerifiedEmployer: true,
    farmerRating: 4.9
  },
];

const SEED_RENTAL_ITEMS: RentalItem[] = [
  {
    id: 'rent_1', name: 'Mahindra 575 DI Tractor', equipmentType: 'tractor', category: 'tractor',
    pricePerDay: 2400, pricePerHour: 350, location: 'Madurai East, TN', village: 'Othakadai', district: 'Madurai', distanceKm: 4.2,
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_1', vendorName: 'Rajan Agri Rentals', ownerRating: 4.8, reviewCount: 42,
    description: '45 HP Mahindra tractor with rotavator attachment. Perfect for ploughing, sowing, and levelling. Fuel included in daily rate.',
    status: 'available', availableDates: genAvailDates([3, 7]),
    specs: { 'Power': '45 HP', 'Fuel Capacity': '48 L', 'Weight': '1860 kg', 'Attachments': 'Rotavator' },
    reviews: [
      { id: 'rev_1', reviewerName: 'M. Senthil', rating: 5, comment: 'Excellent performance, fuel consumption was very reasonable.', date: '2026-06-20' },
      { id: 'rev_2', reviewerName: 'G. Murugan', rating: 4, comment: 'Good condition, owner Rajan is very helpful.', date: '2026-06-18' }
    ],
    createdAt: '2026-06-25T10:00:00Z',
    isVerifiedOwner: true,
    isRecommended: true
  },
  {
    id: 'rent_2', name: 'John Deere Combine Harvester', equipmentType: 'harvester', category: 'harvester',
    pricePerDay: 6500, pricePerHour: 950, location: 'Dindigul, TN', village: 'Palani', district: 'Dindigul', distanceKm: 18.5,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_2', vendorName: 'Selvam Harvesting Co.', ownerRating: 4.6, reviewCount: 29,
    description: 'Self-propelled combine harvester for paddy, wheat, and soybean. Operator included. Ideal for 2-5 acre fields.',
    status: 'rented', availableDates: genAvailDates([0, 1, 2, 3, 4]),
    specs: { 'Power': '75 HP', 'Cutting Width': '12 feet', 'Grain Tank': '1500 L', 'Operator': 'Included' },
    reviews: [
      { id: 'rev_3', reviewerName: 'K. Balaji', rating: 4.5, comment: 'Saves a lot of time. Operator was very skilled.', date: '2026-06-22' }
    ],
    createdAt: '2026-06-26T11:00:00Z',
    isVerifiedOwner: true,
    isRecommended: true
  },
  {
    id: 'rent_3', name: 'Mini Sonalika Rotavator', equipmentType: 'rotavator', category: 'tool',
    pricePerDay: 1200, pricePerHour: 180, location: 'Virudhunagar, TN', village: 'Sattur', district: 'Virudhunagar', distanceKm: 8.9,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_3', vendorName: 'Velmurugan Tools', ownerRating: 4.2, reviewCount: 15,
    description: 'Rotavator attachment suitable for mini tractors (20-30 HP). Great for secondary tillage and preparing seed beds.',
    status: 'available', availableDates: genAvailDates([5]),
    specs: { 'Working Width': '4 feet', 'Blade Count': '36', 'Compatible HP': '20-30 HP' },
    reviews: [],
    createdAt: '2026-06-28T12:00:00Z',
    isVerifiedOwner: false,
    isRecommended: false
  },
  {
    id: 'rent_4', name: 'Power Tiller 15HP', equipmentType: 'tiller', category: 'tractor',
    pricePerDay: 1500, pricePerHour: 220, location: 'Thanjavur, TN', village: 'Kumbakonam', district: 'Thanjavur', distanceKm: 3.5,
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_4', vendorName: 'Kaveri Delta Rentals', ownerRating: 4.9, reviewCount: 38,
    description: '15 HP walk-behind power tiller. Easy to maneuver in wet paddy clay. Rotator attachment included.',
    status: 'available', availableDates: genAvailDates([2, 9]),
    specs: { 'Power': '15 HP', 'Engine': 'Single Cylinder Diesel', 'Weight': '290 kg' },
    reviews: [],
    createdAt: '2026-07-01T08:00:00Z',
    isVerifiedOwner: true,
    isRecommended: true
  },
  {
    id: 'rent_5', name: 'High-Pressure Sprayer', equipmentType: 'sprayer', category: 'sprayer',
    pricePerDay: 800, pricePerHour: 120, location: 'Erode, TN', village: 'Kodumudi', district: 'Erode', distanceKm: 15.0,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_5', vendorName: 'Erode Agri Agency', ownerRating: 3.9, reviewCount: 8,
    description: 'Engine-powered high-pressure chemical and fertilizer sprayer. 100 meter hose reel included.',
    status: 'available', availableDates: genAvailDates([]),
    specs: { 'Tank Capacity': '20 L', 'Pressure': '40 bar', 'Hose Length': '100 m' },
    reviews: [],
    createdAt: '2026-06-29T14:00:00Z',
    isVerifiedOwner: false,
    isRecommended: false
  },
  {
    id: 'rent_6', name: '5HP Diesel Water Pump', equipmentType: 'pump', category: 'pump',
    pricePerDay: 900, pricePerHour: 140, location: 'Madurai West, TN', village: 'Thiruparankundram', district: 'Madurai', distanceKm: 11.2,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_1', vendorName: 'Rajan Agri Rentals', ownerRating: 4.5, reviewCount: 22,
    description: 'Portable 5 HP diesel engine water pump for farm irrigation. Suction pipe and output hose included.',
    status: 'available', availableDates: genAvailDates([6, 8, 11]),
    specs: { 'Power': '5 HP', 'Discharge Rate': '1000 L/min', 'Inlet/Outlet': '3 inch' },
    reviews: [],
    createdAt: '2026-06-30T10:00:00Z',
    isVerifiedOwner: true,
    isRecommended: false
  },
  {
    id: 'rent_7', name: 'Mahindra Bolero Pickup Truck', equipmentType: 'truck', category: 'vehicle',
    pricePerDay: 3200, pricePerHour: 450, location: 'Madurai East, TN', village: 'Othakadai', district: 'Madurai', distanceKm: 5.8,
    image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_1', vendorName: 'Rajan Agri Rentals', ownerRating: 4.7, reviewCount: 19,
    description: '1.7 Ton cargo capacity pickup truck for bulk vegetable delivery to wholesale markets. Driver optional.',
    status: 'available', availableDates: genAvailDates([1]),
    specs: { 'Capacity': '1.7 Ton', 'Fuel Type': 'Diesel', 'AC': 'No' },
    reviews: [],
    createdAt: '2026-07-02T09:00:00Z',
    isVerifiedOwner: true,
    isRecommended: true
  },
  {
    id: 'rent_8', name: 'Automatic Paddy Seeder', equipmentType: 'seeder', category: 'tool',
    pricePerDay: 1800, pricePerHour: 250, location: 'Sivagangai, TN', village: 'Karaikudi', district: 'Sivagangai', distanceKm: 22.4,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=80',
    vendorId: 'vendor_6', vendorName: 'Sivagangai Agro Leases', ownerRating: 4.4, reviewCount: 11,
    description: '8-row direct paddy seeder. Drum seeder made of plastic, lightweight and easy to pull.',
    status: 'available', availableDates: genAvailDates([4, 10, 13]),
    specs: { 'Row Count': '8 Rows', 'Row spacing': '20 cm', 'Weight': '10 kg' },
    reviews: [],
    createdAt: '2026-07-01T15:00:00Z',
    isVerifiedOwner: true,
    isRecommended: false
  }
];

const SEED_RENTAL_BOOKINGS: RentalBooking[] = [
  {
    id: 'rb_1', itemId: 'rent_2', itemName: 'John Deere Combine Harvester',
    renterId: 'farmer_1', renterName: 'Ramanathan Swamy',
    startDate: '2026-06-27', endDate: '2026-07-01',
    pricePerDay: 6500, totalDays: 5, totalCost: 32500,
    status: 'in_progress', createdAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'rb_2', itemId: 'rent_5', itemName: 'Diesel Water Pump (5 HP)',
    renterId: 'farmer_1', renterName: 'Ramanathan Swamy',
    startDate: '2026-06-15', endDate: '2026-06-17',
    pricePerDay: 450, totalDays: 2, totalCost: 900,
    status: 'completed', createdAt: '2026-06-14T08:30:00Z',
  },
];

const SEED_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'TXN-001', user_id: 'farmer_1', amount: 6400, transaction_type: 'credit', created_at: '2026-06-25T09:00:00Z' },
  { id: 'TXN-002', user_id: 'buyer_1', amount: 6400, transaction_type: 'debit', created_at: '2026-06-25T08:30:00Z' },
  { id: 'TXN-003', user_id: 'delivery_1', amount: 350, transaction_type: 'credit', created_at: '2026-06-25T12:00:00Z' },
  { id: 'TXN-004', user_id: 'farmer_5', amount: 16500, transaction_type: 'credit', created_at: '2026-06-24T18:00:00Z' },
  { id: 'TXN-005', user_id: 'labor_1', amount: 1350, transaction_type: 'credit', created_at: '2026-06-24T17:00:00Z' },
];

const SEED_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg_1', jobId: 'dj_1', senderId: 'farmer_1', senderName: 'Ramanathan Swamy', senderRole: 'farmer', text: 'Hello Suresh, I have packed the organic tomatoes in 10 kg crates. Ready for pickup at Farm Hub Gate 2!', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'msg_2', jobId: 'dj_1', senderId: 'delivery_1', senderName: 'Suresh Kumar', senderRole: 'delivery', text: 'Great, thanks Ramanathan! I am on my way. Should be there in 20 minutes. Keep the gate open please.', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'msg_3', jobId: 'dj_1', senderId: 'farmer_1', senderName: 'Ramanathan Swamy', senderRole: 'farmer', text: 'Gate is open. My son Senthil will be there to help load.', createdAt: new Date(Date.now() - 900000).toISOString() },
];

const INITIAL_WALLETS: Record<Role, number> = {
  farmer: 24_850,
  buyer: 1_45_000,
  labor: 1_800,
  vendor: 8_500,
  admin: 1_20_000,
};

// ─── Context interface ──────────────────────────────────────────────
interface AppContextProps {
  // Theme
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;

  // Role
  activeRole: Role;
  setActiveRole: React.Dispatch<React.SetStateAction<Role>>;
  buyerType: BuyerType;
  setBuyerType: React.Dispatch<React.SetStateAction<BuyerType>>;

  // User
  user: UserProfile | null;
  userName: string;
  loading: boolean;

  // Language & translations
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  translations: Record<string, string>;
  t: (key: string) => string;

  // Visual mode
  isVisualMode: boolean;
  setIsVisualMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Data stores
  wallets: Record<Role, number>;
  products: Product[];
  orders: Order[];
  laborJobs: LaborJob[];
  walletTransactions: WalletTransaction[];
  rentalItems: RentalItem[];
  rentalBookings: RentalBooking[];
  chatMessages: ChatMessage[];
  marketPrices: MarketPrice[];
  marketPricesError: boolean;
  govSchemes: GovScheme[];
  isOffline: boolean;
  syncData: () => Promise<void>;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Auth actions
  signUpWithEmail: (email: string, password: string, fullName: string, role: Role, buyerType?: BuyerType | null) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: Role, buyerType?: BuyerType | null) => Promise<void>;
  logout: () => Promise<void>;
  signInWithOtp: (emailOrPhone: string) => Promise<void>;
  verifyOtp: (emailOrPhone: string, token: string) => Promise<{ profileExists: boolean }>;
  completeSignup: (fullName: string, role: Role, buyerType?: BuyerType | null) => Promise<void>;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'createdAt' | 'distanceKm' | 'farmerRating' | 'isVerifiedFarmer' | 'isRecommended' | 'salesCount'>) => void;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'farmerId' | 'farmerName'>>) => void;
  deleteProduct: (productId: string) => void;

  // Order actions
  placeOrder: (productId: string, quantity: number, buyerName: string, deliveryAddress: string) => void;
  confirmOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;



  // Chat actions
  sendChatMessage: (jobId: string, text: string) => void;

  // Labor actions
  createLaborJob: (job: Omit<LaborJob, 'id' | 'farmerId' | 'farmerName' | 'status' | 'applicantsCount' | 'createdAt' | 'distanceKm' | 'isUrgent' | 'isVerifiedEmployer' | 'farmerRating'>) => void;
  applyForLaborJob: (jobId: string) => void;
  hireLaborWorker: (jobId: string) => void;
  toggleSaveJob: (jobId: string) => void;
  addReviewToLabor: (jobId: string, rating: number, comment: string) => void;

  // Rental actions
  bookEquipment: (itemId: string, startDate: string, endDate: string) => void;
  cancelRentalBooking: (bookingId: string) => void;
  addRentalItem: (item: Omit<RentalItem, 'id' | 'vendorId' | 'vendorName' | 'availableDates' | 'status' | 'specs' | 'reviews' | 'ownerRating' | 'reviewCount' | 'createdAt' | 'isVerifiedOwner' | 'isRecommended'>) => void;
  acceptRentalBooking: (bookingId: string) => void;
  startRentalBooking: (bookingId: string) => void;
  completeRentalBooking: (bookingId: string) => void;
  deleteRentalItem: (itemId: string) => void;
  updateRentalItem: (itemId: string, updates: Partial<RentalItem>) => void;
  addReviewToEquipment: (itemId: string, rating: number, comment: string) => void;

  // Scan history
  scanHistory: ScanResult[];
  scanHistoryLoading: boolean;
  addScanRecord: (scan: Omit<ScanResult, 'id' | 'created_at'>) => Promise<void>;
  loadScanHistory: () => Promise<void>;

  // Farms
  farms: Farm[];
  farmsLoading: boolean;
  addFarm: (farm: Omit<Farm, 'id' | 'user_id' | 'created_at'>) => Promise<Farm>;
  updateFarm: (farmId: string, updates: Partial<Farm>) => Promise<void>;
  deleteFarm: (farmId: string) => Promise<void>;

  // Expenses
  farmExpenses: FarmExpense[];
  addFarmExpense: (expense: Omit<FarmExpense, 'id' | 'created_at'>) => Promise<void>;
  deleteFarmExpense: (expenseId: string) => Promise<void>;

  // Income
  farmIncomes: FarmIncome[];
  addFarmIncome: (income: Omit<FarmIncome, 'id' | 'created_at'>) => Promise<void>;
  deleteFarmIncome: (incomeId: string) => Promise<void>;

  // Schemes
  schemeApplications: SchemeApplication[];
  applyForScheme: (schemeId: string, schemeName: string) => Promise<void>;

  // Buyer Requirements
  buyerRequirements: BuyerRequirement[];
  addBuyerRequirement: (crop: string, quantity: number, requiredDate: string, location: string) => void;
  matchBuyerRequirement: (requirementId: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────
const AppContext = createContext<AppContextProps | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // ── Theme ──
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Restore theme from localStorage on mount
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vlink_theme') : null;
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    // Sync theme class on <html> and persist to localStorage
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('vlink_theme', theme);
    }
  }, [theme]);

  // ── Role ──
  const [activeRole, setActiveRole] = useState<Role>('farmer');
  const [buyerType, setBuyerType] = useState<BuyerType>('customer');

  // ── User ──
  const [appUser, setAppUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user from AuthContext
  useEffect(() => {
    if (auth.loading) {
      setLoading(true);
      return;
    }

    if (auth.user) {
      // Restore role from localStorage or default
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem('vlink_active_role') : null;
      const role = (savedRole as Role) || 'farmer';
      setActiveRole(role);

      // Restore user language preference end-to-end
      const userLang = auth.user.user_metadata?.language;
      if (userLang === 'en' || userLang === 'ta') {
        setLanguage(userLang);
      }

      setAppUser({
        id: auth.user.id || `mock_${Date.now()}`,
        email: auth.user.email || '',
        displayName: auth.user.user_metadata?.full_name || auth.user.email?.split('@')[0] || 'User',
        role,
        buyerType: null,
        createdAt: auth.user.created_at || new Date().toISOString(),
      });
    } else {
      setAppUser(null);
    }
    setLoading(false);
  }, [auth.user, auth.loading]);

  // Persist role changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_active_role', activeRole);
    }
  }, [activeRole]);

  const userName = appUser?.displayName || 'User';

  // ── Language ──
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vlink_language');
      if (saved === 'en' || saved === 'ta') return saved;
    }
    return 'ta';
  });
  const currentTranslations = translations[language] || translations.en;

  const t = useCallback(
    (key: string): string => {
      return currentTranslations[key] || translations.en[key] || key;
    },
    [currentTranslations]
  );

  // Persist language changes to localStorage and profiles / metadata
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_language', language);
    }

    const syncLanguage = async () => {
      if (!auth.user) return;

      // Avoid redundant metadata updates
      if (auth.user.user_metadata?.language === language) return;

      if (isSupabaseConfigured && supabase) {
        try {
          // Update Supabase Auth user_metadata
          const { error: authError } = await supabase.auth.updateUser({
            data: { language }
          });
          if (authError) throw authError;

          // Update public.profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ language })
            .eq('id', auth.user.id);
          
          if (profileError) {
            console.warn('[V-Link] Profiles database update error:', profileError.message);
          }
        } catch (err) {
          console.warn('[V-Link] Failed to sync language metadata in Supabase:', err);
        }
      } else {
        // Sandbox mode
        try {
          // Update mock users list in local storage
          const mockUsers = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
          let updated = false;
          const updatedUsers = mockUsers.map((u: any) => {
            if (u.profile.id === auth.user.id || u.email.toLowerCase() === auth.user.email?.toLowerCase()) {
              updated = true;
              return {
                ...u,
                profile: {
                  ...u.profile,
                  user_metadata: {
                    ...u.profile.user_metadata,
                    language
                  }
                }
              };
            }
            return u;
          });

          if (updated) {
            localStorage.setItem('vlink_mock_users', JSON.stringify(updatedUsers));
          }

          // Update mock session in local storage
          const mockSessionStr = localStorage.getItem('vlink_mock_session');
          if (mockSessionStr) {
            const session = JSON.parse(mockSessionStr);
            if (session.user && (session.user.id === auth.user.id || session.user.email === auth.user.email)) {
              session.user.user_metadata = {
                ...session.user.user_metadata,
                language
              };
              localStorage.setItem('vlink_mock_session', JSON.stringify(session));
            }
          }

          // In-memory sync for current loaded user
          auth.user.user_metadata = {
            ...auth.user.user_metadata,
            language
          };
        } catch (err) {
          console.warn('[V-Link] Failed to update mock user language:', err);
        }
      }
    };

    syncLanguage();
  }, [language, auth.user]);

  // ── Visual mode ──
  const [isVisualMode, setIsVisualMode] = useState(false);

  // ── Data stores ──
  const [wallets, setWallets] = useState<Record<Role, number>>({ ...INITIAL_WALLETS });
  const [products, setProducts] = useState<Product[]>([...SEED_PRODUCTS]);
  const [orders, setOrders] = useState<Order[]>([...SEED_ORDERS]);
  const [laborJobs, setLaborJobs] = useState<LaborJob[]>([...SEED_LABOR_JOBS]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([...SEED_WALLET_TRANSACTIONS]);
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([...SEED_RENTAL_ITEMS]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([...SEED_RENTAL_BOOKINGS]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([...SEED_CHAT_MESSAGES]);
  const [buyerRequirements, setBuyerRequirements] = useState<BuyerRequirement[]>([
    {
      id: 'req_1',
      crop: 'Rice (நெல்)',
      quantity: 200,
      requiredDate: '2026-08-25',
      location: 'Madurai East (மதுரை கிழக்கு)',
      buyerId: 'buyer_1',
      buyerName: 'Gourmet Grand Hotel',
      status: 'open',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_2',
      crop: 'Tomato (தக்காளி)',
      quantity: 500,
      requiredDate: '2026-08-15',
      location: 'Melur (மேலூர்)',
      buyerId: 'buyer_2',
      buyerName: 'Raza Grocers',
      status: 'open',
      createdAt: new Date().toISOString()
    }
  ]);

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [marketPricesError, setMarketPricesError] = useState(false);
  const [govSchemes, setGovSchemes] = useState<GovScheme[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Load / Sync cache logic
  const syncData = useCallback(async () => {
    const online = typeof window !== 'undefined' ? navigator.onLine : true;
    setIsOffline(!online);

    if (!online) {
      const cachedMarket = localStorage.getItem('uzhavan360_live_market_prices');
      const cachedSchemes = localStorage.getItem('vlink_cache_schemes');
      if (cachedMarket) {
        setMarketPrices(JSON.parse(cachedMarket));
        setMarketPricesError(false);
      } else {
        setMarketPrices([]);
        setMarketPricesError(true);
      }

      if (cachedSchemes) setGovSchemes(JSON.parse(cachedSchemes));
      else setGovSchemes([...DEFAULT_GOV_SCHEMES]);
      return;
    }

    try {
      const res = await fetch('/api/market-prices');
      if (!res.ok) {
        throw new Error('API route returned error status');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.records || data.records.length === 0) {
        throw new Error('No records returned from API');
      }
      setMarketPrices(data.records);
      setMarketPricesError(false);
      localStorage.setItem('uzhavan360_live_market_prices', JSON.stringify(data.records));
    } catch (err) {
      console.warn('[V-Link] Government API Fetch failed:', err);
      const cachedMarket = localStorage.getItem('uzhavan360_live_market_prices');
      if (cachedMarket) {
        setMarketPrices(JSON.parse(cachedMarket));
        setMarketPricesError(false);
      } else {
        setMarketPrices([]);
        setMarketPricesError(true);
      }
    }

    try {
      const cachedSchemes = localStorage.getItem('vlink_cache_schemes');
      const finalSchemes = cachedSchemes ? JSON.parse(cachedSchemes) : [...DEFAULT_GOV_SCHEMES];
      setGovSchemes(finalSchemes);
      if (!cachedSchemes) localStorage.setItem('vlink_cache_schemes', JSON.stringify(finalSchemes));
    } catch (err) {
      setGovSchemes([...DEFAULT_GOV_SCHEMES]);
    }
  }, []);

  // Network connection listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      syncData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    syncData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // ── Scan History ──
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState<boolean>(false);

  const loadScanHistory = useCallback(async () => {
    setScanHistoryLoading(true);
    try {
      const history = await fetchScanHistory(appUser?.id || null);
      setScanHistory(history);
    } catch (err) {
      console.error('[AppContext] Failed to load scan history:', err);
    } finally {
      setScanHistoryLoading(false);
    }
  }, [appUser?.id]);

  const addScanRecord = useCallback(async (scan: Omit<ScanResult, 'id' | 'created_at'>) => {
    try {
      const saved = await saveScanRecord(appUser?.id || null, scan);
      setScanHistory(prev => [saved, ...prev]);
      addToast(language === 'ta' ? 'பயிர் பரிசோதனை சேமிக்கப்பட்டது!' : 'Crop scan saved to history!', 'success');
    } catch (err) {
      console.error('[AppContext] Failed to save scan record:', err);
      addToast(language === 'ta' ? 'வரலாற்றைச் சேமிக்க முடியவில்லை!' : 'Failed to save scan to history!', 'error');
    }
  }, [appUser?.id, addToast, language]);

  // ── Farms & Farm Records ──
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmsLoading, setFarmsLoading] = useState<boolean>(false);
  const [farmExpenses, setFarmExpenses] = useState<FarmExpense[]>([]);
  const [farmIncomes, setFarmIncomes] = useState<FarmIncome[]>([]);
  const [schemeApplications, setSchemeApplications] = useState<SchemeApplication[]>([]);

  // ── Load Farm Data ──
  const loadFarmData = useCallback(async () => {
    setFarmsLoading(true);
    try {
      const uId = appUser?.id || 'farmer_1';
      
      if (!isOffline && supabase) {
        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', uId);
          
        if (!farmsError && farmsData && farmsData.length > 0) {
          setFarms(farmsData);
          
          const farmIds = farmsData.map(f => f.id);
          const { data: expensesData } = await supabase
            .from('farm_expenses')
            .select('*')
            .in('farm_id', farmIds);
          if (expensesData) setFarmExpenses(expensesData);

          const { data: incomesData } = await supabase
            .from('farm_income')
            .select('*')
            .in('farm_id', farmIds);
          if (incomesData) setFarmIncomes(incomesData);
        } else {
          loadFarmDataFromLocalStorage(uId);
        }

        const { data: schemesData } = await supabase
          .from('scheme_applications')
          .select('*')
          .eq('user_id', uId);
        if (schemesData) setSchemeApplications(schemesData);
      } else {
        loadFarmDataFromLocalStorage(uId);
      }
    } catch (err) {
      console.error('[AppContext] Failed to load farm data:', err);
      loadFarmDataFromLocalStorage(appUser?.id || 'farmer_1');
    } finally {
      setFarmsLoading(false);
    }
  }, [appUser?.id, isOffline]);

  const loadFarmDataFromLocalStorage = (uId: string) => {
    const cachedFarms = localStorage.getItem(`vlink_farms_${uId}`);
    const cachedExpenses = localStorage.getItem(`vlink_expenses_${uId}`);
    const cachedIncomes = localStorage.getItem(`vlink_incomes_${uId}`);
    const cachedSchemes = localStorage.getItem(`vlink_schemes_${uId}`);

    if (cachedFarms) {
      setFarms(JSON.parse(cachedFarms));
    } else {
      if (uId === 'farmer_1') {
        setFarms([...SEED_FARMS]);
        localStorage.setItem(`vlink_farms_${uId}`, JSON.stringify(SEED_FARMS));
      } else {
        setFarms([]);
      }
    }

    if (cachedExpenses) {
      setFarmExpenses(JSON.parse(cachedExpenses));
    } else {
      if (uId === 'farmer_1') {
        setFarmExpenses([...SEED_FARM_EXPENSES]);
        localStorage.setItem(`vlink_expenses_${uId}`, JSON.stringify(SEED_FARM_EXPENSES));
      } else {
        setFarmExpenses([]);
      }
    }

    if (cachedIncomes) {
      setFarmIncomes(JSON.parse(cachedIncomes));
    } else {
      if (uId === 'farmer_1') {
        setFarmIncomes([...SEED_FARM_INCOMES]);
        localStorage.setItem(`vlink_incomes_${uId}`, JSON.stringify(SEED_FARM_INCOMES));
      } else {
        setFarmIncomes([]);
      }
    }

    if (cachedSchemes) {
      setSchemeApplications(JSON.parse(cachedSchemes));
    } else {
      if (uId === 'farmer_1') {
        setSchemeApplications([...SEED_SCHEME_APPLICATIONS]);
        localStorage.setItem(`vlink_schemes_${uId}`, JSON.stringify(SEED_SCHEME_APPLICATIONS));
      } else {
        setSchemeApplications([]);
      }
    }
  };

  // ── Farm Actions ──
  const addFarm = async (farmData: Omit<Farm, 'id' | 'user_id' | 'created_at'>) => {
    const uId = appUser?.id || 'farmer_1';
    const newFarm: Farm = {
      ...farmData,
      id: `farm_${Date.now()}`,
      user_id: uId,
      created_at: new Date().toISOString()
    };

    try {
      if (!isOffline && supabase) {
        const { data, error } = await supabase
          .from('farms')
          .insert([{ ...farmData, user_id: uId }])
          .select()
          .single();
        if (!error && data) {
          newFarm.id = data.id;
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to save farm to Supabase:', err);
    }

    setFarms(prev => {
      const updated = [newFarm, ...prev];
      localStorage.setItem(`vlink_farms_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'புதிய பண்ணை வெற்றிகரமாக சேர்க்கப்பட்டது!' : 'New farm added successfully!', 'success');
    return newFarm;
  };

  const updateFarm = async (farmId: string, updates: Partial<Farm>) => {
    const uId = appUser?.id || 'farmer_1';
    try {
      if (!isOffline && supabase) {
        await supabase
          .from('farms')
          .update(updates)
          .eq('id', farmId);
      }
    } catch (err) {
      console.error('[AppContext] Failed to update farm in Supabase:', err);
    }

    setFarms(prev => {
      const updated = prev.map(f => f.id === farmId ? { ...f, ...updates } : f);
      localStorage.setItem(`vlink_farms_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'பண்ணை விவரங்கள் புதுப்பிக்கப்பட்டன!' : 'Farm details updated successfully!', 'success');
  };

  const deleteFarm = async (farmId: string) => {
    const uId = appUser?.id || 'farmer_1';
    try {
      if (!isOffline && supabase) {
        await supabase
          .from('farms')
          .delete()
          .eq('id', farmId);
      }
    } catch (err) {
      console.error('[AppContext] Failed to delete farm in Supabase:', err);
    }

    setFarms(prev => {
      const updated = prev.filter(f => f.id !== farmId);
      localStorage.setItem(`vlink_farms_${uId}`, JSON.stringify(updated));
      return updated;
    });

    setFarmExpenses(prev => {
      const updated = prev.filter(e => e.farm_id !== farmId);
      localStorage.setItem(`vlink_expenses_${uId}`, JSON.stringify(updated));
      return updated;
    });
    setFarmIncomes(prev => {
      const updated = prev.filter(i => i.farm_id !== farmId);
      localStorage.setItem(`vlink_incomes_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'பண்ணை நீக்கப்பட்டது!' : 'Farm deleted successfully!', 'success');
  };

  // ── Expense Actions ──
  const addFarmExpense = async (expenseData: Omit<FarmExpense, 'id' | 'created_at'>) => {
    const uId = appUser?.id || 'farmer_1';
    const newExpense: FarmExpense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      if (!isOffline && supabase) {
        const { data, error } = await supabase
          .from('farm_expenses')
          .insert([expenseData])
          .select()
          .single();
        if (!error && data) {
          newExpense.id = data.id;
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to save expense to Supabase:', err);
    }

    setFarmExpenses(prev => {
      const updated = [newExpense, ...prev];
      localStorage.setItem(`vlink_expenses_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'செலவுப் பதிவு சேர்க்கப்பட்டது!' : 'Expense record added!', 'success');
  };

  const deleteFarmExpense = async (expenseId: string) => {
    const uId = appUser?.id || 'farmer_1';
    try {
      if (!isOffline && supabase) {
        await supabase
          .from('farm_expenses')
          .delete()
          .eq('id', expenseId);
      }
    } catch (err) {
      console.error('[AppContext] Failed to delete expense in Supabase:', err);
    }

    setFarmExpenses(prev => {
      const updated = prev.filter(e => e.id !== expenseId);
      localStorage.setItem(`vlink_expenses_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'செலவுப் பதிவு நீக்கப்பட்டது!' : 'Expense record deleted!', 'info');
  };

  // ── Income Actions ──
  const addFarmIncome = async (incomeData: Omit<FarmIncome, 'id' | 'created_at'>) => {
    const uId = appUser?.id || 'farmer_1';
    const newIncome: FarmIncome = {
      ...incomeData,
      id: `inc_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      if (!isOffline && supabase) {
        const { data, error } = await supabase
          .from('farm_income')
          .insert([incomeData])
          .select()
          .single();
        if (!error && data) {
          newIncome.id = data.id;
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to save income to Supabase:', err);
    }

    setFarmIncomes(prev => {
      const updated = [newIncome, ...prev];
      localStorage.setItem(`vlink_incomes_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'வரவுப் பதிவு சேர்க்கப்பட்டது!' : 'Income record added!', 'success');
  };

  const deleteFarmIncome = async (incomeId: string) => {
    const uId = appUser?.id || 'farmer_1';
    try {
      if (!isOffline && supabase) {
        await supabase
          .from('farm_income')
          .delete()
          .eq('id', incomeId);
      }
    } catch (err) {
      console.error('[AppContext] Failed to delete income in Supabase:', err);
    }

    setFarmIncomes(prev => {
      const updated = prev.filter(i => i.id !== incomeId);
      localStorage.setItem(`vlink_incomes_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'வரவுப் பதிவு நீக்கப்பட்டது!' : 'Income record deleted!', 'info');
  };

  // ── Scheme Applications ──
  const applyForScheme = async (schemeId: string, schemeName: string) => {
    const uId = appUser?.id || 'farmer_1';
    const newApp: SchemeApplication = {
      id: `app_${Date.now()}`,
      user_id: uId,
      scheme_id: schemeId,
      scheme_name: schemeName,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      if (!isOffline && supabase) {
        const { data, error } = await supabase
          .from('scheme_applications')
          .insert([{ user_id: uId, scheme_id: schemeId, scheme_name: schemeName }])
          .select()
          .single();
        if (!error && data) {
          newApp.id = data.id;
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to save scheme application in Supabase:', err);
    }

    setSchemeApplications(prev => {
      const updated = [newApp, ...prev];
      localStorage.setItem(`vlink_schemes_${uId}`, JSON.stringify(updated));
      return updated;
    });

    addToast(language === 'ta' ? 'திட்ட விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!' : 'Scheme application submitted successfully!', 'success');
  };

  // ── Buyer Requirements Actions ──
  const addBuyerRequirement = (crop: string, quantity: number, requiredDate: string, location: string) => {
    const newRequirement: BuyerRequirement = {
      id: `req_${Date.now()}`,
      crop,
      quantity,
      requiredDate,
      location,
      buyerId: appUser?.id || 'buyer_1',
      buyerName: userName,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setBuyerRequirements(prev => [newRequirement, ...prev]);
    addToast(language === 'ta' ? 'தேவை வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!' : 'Buyer requirement posted successfully!', 'success');
  };

  const matchBuyerRequirement = (requirementId: string) => {
    setBuyerRequirements(prev =>
      prev.map(req =>
        req.id === requirementId
          ? {
              ...req,
              status: 'matched' as const,
              matchedFarmerId: appUser?.id || 'farmer_1',
              matchedFarmerName: userName
            }
          : req
      )
    );
    addToast(language === 'ta' ? 'விருப்பம் அனுப்பப்பட்டது! வாங்குபவர் உங்களைத் தொடர்புகொள்வார்.' : 'Interest sent! The buyer will contact you.', 'success');
  };

  // Load scan history and farm data when appUser changes
  useEffect(() => {
    loadScanHistory();
    loadFarmData();
  }, [appUser?.id, loadScanHistory, loadFarmData]);

  // ── Auth actions ──
  const signUpWithEmail = async (email: string, password: string, fullName: string, role: Role, bt?: BuyerType | null) => {
    // Sign up with Supabase — pass full_name + role as user_metadata
    const res = await auth.signUp(email, password, { full_name: fullName, role, language });
    if (res.error) throw res.error;

    const userId = res.data.user?.id;

    // Insert profile row into public.profiles table
    if (userId) {
      const { error: profileError } = await createProfile({
        id: userId,
        email,
        full_name: fullName,
        role,
        language,
      });
      if (profileError) {
        // Non-fatal: log but don't block the user
        console.warn('[V-LINK] Profile creation warning:', profileError.message);
      }
    }

    // Set role and buyer type in app state
    setActiveRole(role);
    if (bt) setBuyerType(bt);

    // Build local user profile
    setAppUser({
      id: userId || `mock_${Date.now()}`,
      email,
      displayName: fullName,
      role,
      buyerType: bt || null,
      createdAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_active_role', role);
      localStorage.setItem('vlink_user_name', fullName);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await auth.signIn(email, password);
    if (res.error) throw res.error;

    // Restore saved role (or fall back to 'farmer')
    const savedRole = typeof window !== 'undefined' ? localStorage.getItem('vlink_active_role') : null;
    const role = (savedRole as Role) || 'farmer';
    setActiveRole(role);

    // Prefer Supabase user_metadata for display name, then localStorage, then email prefix
    const metaName = res.data.user?.user_metadata?.full_name;
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('vlink_user_name') : null;
    const displayName = metaName || savedName || email.split('@')[0];

    setAppUser({
      id: res.data.user?.id || `mock_${Date.now()}`,
      email,
      displayName,
      role,
      buyerType: null,
      createdAt: new Date().toISOString(),
    });

    // Persist display name from server
    if (displayName && typeof window !== 'undefined') {
      localStorage.setItem('vlink_user_name', displayName);
    }
  };

  const loginWithGoogle = async (role: Role, bt?: BuyerType | null) => {
    if (isSupabaseConfigured && supabase) {
      // Real Google OAuth with dynamic redirect URL based on current host
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/signup` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } else {
      // Sandbox: simulate Google sign-in
      const mockUser: UserProfile = {
        id: `google_mock_${Date.now()}`,
        email: 'demo.user@gmail.com',
        displayName: 'Demo Google User',
        role,
        buyerType: bt || null,
        createdAt: new Date().toISOString(),
      };
      setAppUser(mockUser);
      setActiveRole(role);
      if (bt) setBuyerType(bt);

      // Persist mock session
      if (typeof window !== 'undefined') {
        const mockSession = {
          access_token: `google_mock_token_${Date.now()}`,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: `google_mock_refresh_${Date.now()}`,
          user: { id: mockUser.id, email: mockUser.email, user_metadata: { full_name: mockUser.displayName } },
        };
        localStorage.setItem('vlink_mock_session', JSON.stringify(mockSession));
        localStorage.setItem('vlink_active_role', role);
        localStorage.setItem('vlink_user_name', mockUser.displayName);
      }
    }
  };

  const signInWithOtp = async (emailOrPhone: string) => {
    const res = await auth.signInWithOtp(emailOrPhone);
    if (res.error) throw res.error;
  };

  const verifyOtp = async (emailOrPhone: string, token: string): Promise<{ profileExists: boolean }> => {
    const res = await auth.verifyOtp(emailOrPhone, token);
    if (res.error) throw res.error;

    // Restore saved role (or fall back to 'farmer')
    const savedRole = typeof window !== 'undefined' ? localStorage.getItem('vlink_active_role') : null;
    let role = (savedRole as Role) || 'farmer';

    const metaName = res.data.user?.user_metadata?.full_name;
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('vlink_user_name') : null;
    let displayName = metaName || savedName || emailOrPhone.split('@')[0];

    let profileExists = false;

    if (isSupabaseConfigured && supabase && res.data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', res.data.user.id)
        .maybeSingle();

      if (profile) {
        profileExists = true;
        role = profile.role as Role;
        displayName = profile.full_name;
        setActiveRole(role);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vlink_active_role', role);
          localStorage.setItem('vlink_user_name', displayName);
        }
      }
    } else {
      // Sandbox Mode: check if user already has a mock profile
      const users = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
      const matched = users.find((u: any) => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.email.toLowerCase() === res.data.user?.email?.toLowerCase());
      if (matched && matched.profile) {
        // If password is not empty, it means they registered with name/role in sandbox
        if (matched.password !== '' || (matched.profile.user_metadata && matched.profile.user_metadata.full_name && matched.profile.user_metadata.full_name !== emailOrPhone.split('@')[0])) {
          profileExists = true;
          role = matched.profile.user_metadata?.role || role;
          displayName = matched.profile.user_metadata?.full_name || displayName;
          setActiveRole(role);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vlink_active_role', role);
            localStorage.setItem('vlink_user_name', displayName);
          }
        }
      }
    }

    setAppUser({
      id: res.data.user?.id || `mock_${Date.now()}`,
      email: emailOrPhone,
      displayName,
      role,
      buyerType: null,
      createdAt: new Date().toISOString(),
    });

    if (displayName && typeof window !== 'undefined') {
      localStorage.setItem('vlink_user_name', displayName);
    }

    return { profileExists };
  };

  const completeSignup = async (fullName: string, role: Role, bt?: BuyerType | null) => {
    if (!auth.user) {
      throw new Error('No authenticated user session found');
    }

    const email = auth.user.email || auth.user.phone || '';

    // Create profile
    const { error: profileError } = await createProfile({
      id: auth.user.id,
      email,
      full_name: fullName,
      role,
      language,
    });
    if (profileError) throw profileError;

    // Update Supabase Auth metadata so future sessions get the metadata
    if (isSupabaseConfigured && supabase) {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          role,
          language,
        }
      });
      if (authError) {
        console.warn('[V-Link] Failed to update auth metadata:', authError.message);
      }
    } else {
      // Sandbox Mode: Update mock user role and name in localStorage
      try {
        const mockUsers = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
        const updatedUsers = mockUsers.map((u: any) => {
          if (u.profile.id === auth.user.id || u.email.toLowerCase() === email.toLowerCase()) {
            return {
              ...u,
              password: 'verified', // Mark password to show profile exists
              profile: {
                ...u.profile,
                user_metadata: {
                  ...u.profile.user_metadata,
                  full_name: fullName,
                  role,
                }
              }
            };
          }
          return u;
        });
        localStorage.setItem('vlink_mock_users', JSON.stringify(updatedUsers));
      } catch (err) {
        console.warn('[V-Link] Failed to update mock user details:', err);
      }
    }

    setActiveRole(role);
    if (bt) setBuyerType(bt);

    setAppUser({
      id: auth.user.id,
      email,
      displayName: fullName,
      role,
      buyerType: bt || null,
      createdAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_active_role', role);
      localStorage.setItem('vlink_user_name', fullName);
    }
  };

  const logout = async () => {
    await auth.signOut();
    setAppUser(null);
    setActiveRole('farmer');
    setBuyerType('customer');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vlink_active_role');
      localStorage.removeItem('vlink_user_name');
    }
  };

  // ── Product actions ──
  const addProduct = (product: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'createdAt' | 'distanceKm' | 'farmerRating' | 'isVerifiedFarmer' | 'isRecommended' | 'salesCount'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      farmerId: appUser?.id || 'farmer_1',
      farmerName: userName,
      createdAt: new Date().toISOString(),
      distanceKm: 0.1,
      farmerRating: 5.0,
      isVerifiedFarmer: true,
      isRecommended: false,
      salesCount: 0,
      isNew: true,
      isTrending: false,
      village: 'Othakadai',
      district: 'Madurai'
    };
    setProducts(prev => [newProduct, ...prev]);
    addToast('Produce listed on direct marketplace!', 'success');
  };

  const updateProduct = (productId: string, updates: Partial<Omit<Product, 'id' | 'farmerId' | 'farmerName'>>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // ── Order actions ──
  const placeOrder = (productId: string, quantity: number, buyerName: string, deliveryAddress: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const totalPrice = product.pricePerKg * quantity;
    const orderId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;

    // Create order
    const newOrder: Order = {
      id: orderId,
      productId,
      productName: product.name,
      buyerId: appUser?.id || 'buyer_1',
      buyerName,
      buyerType: buyerType || 'customer',
      quantity,
      totalPrice: totalPrice,
      status: 'pending',
      farmerId: product.farmerId,
      createdAt: new Date().toISOString(),
    };

    // Adjust stock
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stockKg: Math.max(0, p.stockKg - quantity) } : p
      )
    );

    // Adjust buyer wallet immediately (Escrow Lock)
    setWallets(prev => ({
      ...prev,
      buyer: prev.buyer - totalPrice,
    }));

    // Add wallet debit transaction
    const now = new Date().toISOString();
    setWalletTransactions(prev => [
      ...prev,
      { id: `TXN-${Date.now()}-d`, user_id: appUser?.id || 'buyer_1', amount: totalPrice, transaction_type: 'debit' as const, created_at: now },
    ]);

    setOrders(prev => [newOrder, ...prev]);
    addToast('Order placed successfully! Funds secured in escrow.', 'success');
  };

  const confirmOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'accepted' as const } : o)
    );
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o)
    );

    // Release escrow to farmer wallet
    setWallets(prev => ({
      ...prev,
      farmer: prev.farmer + order.totalPrice,
    }));

    // Add wallet credit transaction for farmer
    const now = new Date().toISOString();
    setWalletTransactions(prev => [
      ...prev,
      { id: `TXN-${Date.now()}-c`, user_id: order.farmerId, amount: order.totalPrice, transaction_type: 'credit' as const, created_at: now },
    ]);
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o)
    );

    // Restore product stock
    setProducts(prev =>
      prev.map(p =>
        p.id === order.productId ? { ...p, stockKg: p.stockKg + order.quantity } : p
      )
    );

    // Refund buyer wallet
    setWallets(prev => ({
      ...prev,
      buyer: prev.buyer + order.totalPrice,
    }));

    // Add wallet refund transaction for buyer
    const now = new Date().toISOString();
    setWalletTransactions(prev => [
      ...prev,
      { id: `TXN-${Date.now()}-refund`, user_id: order.buyerId, amount: order.totalPrice, transaction_type: 'credit' as const, created_at: now },
    ]);
  };

  const sendChatMessage = (jobId: string, text: string) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      jobId,
      senderId: appUser?.id || 'user_anon',
      senderName: userName,
      senderRole: activeRole,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, msg]);
  };

  // ── Labor actions ──
  const createLaborJob = (job: Omit<LaborJob, 'id' | 'farmerId' | 'farmerName' | 'status' | 'applicantsCount' | 'createdAt' | 'distanceKm' | 'isUrgent' | 'isVerifiedEmployer' | 'farmerRating'>) => {
    const newJob: LaborJob = {
      ...job,
      id: `lj_${Date.now()}`,
      farmerId: appUser?.id || 'farmer_1',
      farmerName: userName,
      status: 'open',
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      distanceKm: 0.1,
      isUrgent: false,
      isVerifiedEmployer: true,
      farmerRating: 5.0
    };
    setLaborJobs(prev => [newJob, ...prev]);
  };

  const applyForLaborJob = (jobId: string) => {
    setLaborJobs(prev =>
      prev.map(j =>
        j.id === jobId
          ? { ...j, status: 'applied' as const, applicantsCount: j.applicantsCount + 1 }
          : j
      )
    );
  };


  const hireLaborWorker = (jobId: string) => {
    const job = laborJobs.find(j => j.id === jobId);

    setLaborJobs(prev =>
      prev.map(j =>
        j.id === jobId ? { ...j, status: 'accepted' as const } : j
      )
    );

    // Pay labor from farmer wallet
    if (job) {
      setWallets(prev => ({
        ...prev,
        labor: prev.labor + job.wages,
        farmer: prev.farmer - job.wages,
      }));
      setWalletTransactions(prev => [
        ...prev,
        { id: `TXN-${Date.now()}-lbr`, user_id: appUser?.id || job.farmerId, amount: job.wages, transaction_type: 'credit' as const, created_at: new Date().toISOString() },
        { id: `TXN-${Date.now()}-fmr`, user_id: job.farmerId, amount: job.wages, transaction_type: 'debit' as const, created_at: new Date().toISOString() },
      ]);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setLaborJobs(prev =>
      prev.map(j => j.id === jobId ? { ...j, saved: !j.saved } : j)
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addReviewToLabor = (_jobId: string, _rating: number, _comment: string) => {
    // Review recorded to local state; Supabase persistence can be added when labor_jobs table is extended.
  };


  // ── Rental actions ──
  const bookEquipment = (itemId: string, startDate: string, endDate: string) => {
    const item = rentalItems.find(r => r.id === itemId);
    if (!item) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const totalCost = item.pricePerDay * totalDays;

    const booking: RentalBooking = {
      id: `rb_${Date.now()}`,
      itemId,
      itemName: item.name,
      renterId: appUser?.id || 'farmer_1',
      renterName: userName,
      startDate,
      endDate,
      pricePerDay: item.pricePerDay,
      totalDays,
      totalCost,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Deduct from wallet
    setWallets(prev => ({ ...prev, farmer: prev.farmer - totalCost }));
    setWalletTransactions(prev => [
      ...prev,
      { id: `TXN-${Date.now()}-rnt`, user_id: appUser?.id || 'farmer_1', amount: totalCost, transaction_type: 'debit' as const, created_at: new Date().toISOString() },
    ]);

    setRentalBookings(prev => [booking, ...prev]);
  };

  const cancelRentalBooking = (bookingId: string) => {
    const booking = rentalBookings.find(b => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return;
    
    setRentalBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    
    // Refund
    setWallets(prev => ({ ...prev, farmer: prev.farmer + booking.totalCost }));
    setWalletTransactions(prev => [
      ...prev,
      { id: `TXN-${Date.now()}-refund`, user_id: booking.renterId, amount: booking.totalCost, transaction_type: 'credit' as const, created_at: new Date().toISOString() }
    ]);
  };

  const addRentalItem = (item: Omit<RentalItem, 'id' | 'vendorId' | 'vendorName' | 'availableDates' | 'status' | 'specs' | 'reviews' | 'ownerRating' | 'reviewCount' | 'createdAt' | 'isVerifiedOwner' | 'isRecommended'>) => {
    const newItem: RentalItem = {
      ...item,
      id: `rent_${Date.now()}`,
      vendorId: appUser?.id || 'vendor_1',
      vendorName: userName,
      status: 'available',
      availableDates: genAvailDates([]),
      ownerRating: 5.0,
      reviewCount: 0,
      specs: { 'Condition': 'Excellent', 'Availability': 'Immediate' },
      reviews: [],
      createdAt: new Date().toISOString(),
      isVerifiedOwner: true,
      isRecommended: false
    };
    setRentalItems(prev => [newItem, ...prev]);
  };

  const acceptRentalBooking = (bookingId: string) => {
    setRentalBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'accepted' as const } : b)
    );
  };

  const startRentalBooking = (bookingId: string) => {
    setRentalBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'in_progress' as const } : b)
    );
  };

  const completeRentalBooking = (bookingId: string) => {
    const booking = rentalBookings.find(b => b.id === bookingId);
    setRentalBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'completed' as const } : b)
    );
    // Pay vendor (owner)
    if (booking) {
      setWallets(prev => ({ ...prev, vendor: prev.vendor + booking.totalCost }));
      setWalletTransactions(prev => [
        ...prev,
        { id: `TXN-${Date.now()}-vnd`, user_id: appUser?.id || booking.itemId, amount: booking.totalCost, transaction_type: 'credit' as const, created_at: new Date().toISOString() }
      ]);
    }
  };

  const deleteRentalItem = (itemId: string) => {
    setRentalItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateRentalItem = (itemId: string, updates: Partial<RentalItem>) => {
    setRentalItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
    );
  };

  const addReviewToEquipment = (itemId: string, rating: number, comment: string) => {
    const newReview: RentalItemReview = {
      id: `rev_${Date.now()}`,
      reviewerName: userName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    setRentalItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const updatedReviews = [newReview, ...item.reviews];
          const averageRating = parseFloat(
            ((item.ownerRating * item.reviewCount + rating) / (item.reviewCount + 1)).toFixed(1)
          );
          return {
            ...item,
            reviews: updatedReviews,
            reviewCount: item.reviewCount + 1,
            ownerRating: averageRating
          };
        }
        return item;
      })
    );
  };

  // ── Context value ──
  const value: AppContextProps = {
    theme,
    setTheme,
    activeRole,
    setActiveRole,
    buyerType,
    setBuyerType,
    user: appUser,
    userName,
    loading,
    language,
    setLanguage,
    translations: currentTranslations,
    t,
    isVisualMode,
    setIsVisualMode,
    wallets,
    products,
    orders,
    laborJobs,
    walletTransactions,
    rentalItems,
    rentalBookings,
    chatMessages,
    toasts,
    addToast,
    marketPrices,
    marketPricesError,
    govSchemes,
    isOffline,
    syncData,
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    signInWithOtp,
    verifyOtp,
    completeSignup,
    addProduct,
    updateProduct,
    deleteProduct,
    placeOrder,
    confirmOrder,
    completeOrder,
    cancelOrder,

    sendChatMessage,
    createLaborJob,
    applyForLaborJob,
    hireLaborWorker,
    toggleSaveJob,
    addReviewToLabor,
    bookEquipment,
    cancelRentalBooking,
    addRentalItem,
    acceptRentalBooking,
    startRentalBooking,
    completeRentalBooking,
    deleteRentalItem,
    updateRentalItem,
    addReviewToEquipment,
    scanHistory,
    scanHistoryLoading,
    addScanRecord,
    loadScanHistory,

    // Farms
    farms,
    farmsLoading,
    addFarm,
    updateFarm,
    deleteFarm,
    farmExpenses,
    addFarmExpense,
    deleteFarmExpense,
    farmIncomes,
    addFarmIncome,
    deleteFarmIncome,
    schemeApplications,
    applyForScheme,
    buyerRequirements,
    addBuyerRequirement,
    matchBuyerRequirement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ─── Consumer hooks ─────────────────────────────────────────────────
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Backward-compatible alias
export const useAppContext = useApp;
