// Type definitions for OoruConnect AI-Powered Local Help Matching

export type RequestCategory = 'labor' | 'equipment' | 'technician' | 'transport' | 'general';
export type AvailabilityStatus = 'confirmed' | 'unconfirmed' | 'unavailable';
export type VerificationBadge = 'trusted' | 'fpo_certified' | 'community_vouched';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface VillageInfo {
  name: string;
  nameTa: string;
  district: string;
  coords: LocationCoords;
}

export interface ParsedHelpRequest {
  service_category: RequestCategory;
  request_type?: RequestCategory; // Alias for backward compatibility
  work_type: string | null;
  quantity: number | null;
  unit: string | null;
  required_date: string | null; // ISO YYYY-MM-DD
  village: string | null;
  location: LocationCoords | null;
  radius_km: number;
  additional_requirements: string | null;
  missing_fields: ('work_type' | 'village' | 'required_date')[];
  confidence: number | null;
  raw_input: string;
  extraction_source: 'gemini' | 'openai' | 'rule_based_fallback';
  is_llm_configured?: boolean;
}

export interface FollowUpQuestion {
  field: 'work_type' | 'village' | 'required_date';
  questionTa: string;
  questionEn: string;
  helperTextTa: string;
  helperTextEn: string;
  suggestions: {
    labelTa: string;
    labelEn: string;
    value: string;
  }[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  service_category: RequestCategory;
  roleTa: string;
  roleEn: string;
  skills: string[];
  village: string;
  district: string;
  coords: LocationCoords;
  capacity_number: number;
  capacity_unit: string;
  capacity_descriptionTa: string;
  capacity_descriptionEn: string;
  availability_status: AvailabilityStatus;
  availability_date: string; // ISO date YYYY-MM-DD or 'today' | 'tomorrow'
  availability_updated_at: string;
  is_verified: boolean;
  verification_badge: VerificationBadge;
  rating: number;
  completed_jobs: number;
  verified_price_rate: string | null; // e.g. "₹550 / worker / day" or null if unverified
  phone: string;
  is_synthetic_demo: boolean;
  bioTa?: string;
  bioEn?: string;
}

export interface MatchScoreBreakdown {
  skill_match: number;       // up to 40%
  distance_score: number;    // up to 25%
  availability_score: number;// up to 20%
  capacity_score: number;    // up to 10%
  verification_score: number;// up to 5%
}

export interface ProviderMatchResult {
  provider: ServiceProvider;
  match_score: number; // 0 - 100
  distance_km: number;
  score_breakdown: MatchScoreBreakdown;
  match_reasonsTa: string[];
  match_reasonsEn: string[];
}
