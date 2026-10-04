-- ================================================================
-- Ooru Connect Phase 1 Complete Database Migration
-- Instant Labour Squad & Skilled Service Dispatch Network
-- ================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Villages Table
CREATE TABLE IF NOT EXISTS public.villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    village_id UUID REFERENCES public.villages(id),
    village_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('demand', 'provider', 'admin')),
    preferred_language VARCHAR(10) DEFAULT 'ta',
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Skills & Work Types
CREATE TABLE IF NOT EXISTS public.service_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('labour_squad', 'technician')),
    icon_name VARCHAR(50) DEFAULT 'build',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Service Providers (Maistries & Technicians)
CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('maistry', 'technician')),
    title VARCHAR(150) NOT NULL,
    experience_years INT DEFAULT 0,
    service_radius_km DOUBLE PRECISION DEFAULT 10.0,
    base_rate VARCHAR(100),
    is_phone_verified BOOLEAN DEFAULT TRUE,
    squad_size INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Provider Skills Mapping
CREATE TABLE IF NOT EXISTS public.provider_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.service_skills(id) ON DELETE CASCADE,
    UNIQUE(provider_id, skill_id)
);

-- 6. Provider Availabilities
CREATE TABLE IF NOT EXISTS public.provider_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL UNIQUE REFERENCES public.service_providers(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'available_today' CHECK (status IN ('available_today', 'available_date', 'booked')),
    available_date DATE,
    booked_until DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Service Requests (Labour Squad & Technician)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('labour_squad', 'technician')),
    skill_id UUID REFERENCES public.service_skills(id),
    skill_name VARCHAR(100),
    required_workers INT DEFAULT 1,
    required_date DATE NOT NULL,
    required_time VARCHAR(50),
    village_id UUID REFERENCES public.villages(id),
    village_name VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    duration VARCHAR(50),
    budget_offered VARCHAR(100),
    problem_details TEXT,
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'broadcasting' CHECK (status IN ('broadcasting', 'connected', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Request Matches & Responses
CREATE TABLE IF NOT EXISTS public.request_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    match_score INT DEFAULT 100,
    distance_km DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'notified' CHECK (status IN ('notified', 'accepted', 'rejected')),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(request_id, provider_id)
);

-- 9. Village Mutual Vouches
CREATE TABLE IF NOT EXISTS public.vouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    voucher_village_name VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(voucher_profile_id, target_provider_id)
);

-- 10. Reports & Block
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_profile_id UUID REFERENCES public.profiles(id),
    target_request_id UUID REFERENCES public.service_requests(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    payload JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;

-- Public read policies for service skills, villages, providers & profiles
CREATE POLICY "Public read for villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Public read for skills" ON public.service_skills FOR SELECT USING (true);
CREATE POLICY "Public read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read for providers" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Public read for availabilities" ON public.provider_availabilities FOR SELECT USING (true);
CREATE POLICY "Public read for requests" ON public.service_requests FOR SELECT USING (true);
CREATE POLICY "Public read for vouches" ON public.vouches FOR SELECT USING (true);

-- Insert Seed Data (Villages in Tamil Nadu)
INSERT INTO public.villages (name, district, latitude, longitude) VALUES
('Vadugapalayam', 'Coimbatore', 11.0050, 77.0300),
('Pollachi Rural', 'Coimbatore', 10.6600, 77.0100),
('Kinathukadavu', 'Coimbatore', 10.8200, 77.0200),
('Sulur', 'Coimbatore', 11.0280, 77.1260),
('Thondamuthur', 'Coimbatore', 10.9930, 76.8340),
('Dharapuram', 'Tiruppur', 10.7300, 77.5200),
('Udumalaipettai', 'Tiruppur', 10.5800, 77.2500)
ON CONFLICT DO NOTHING;

-- Insert Seed Data (Service Skills)
INSERT INTO public.service_skills (name_en, name_ta, category, icon_name) VALUES
('Paddy Harvesting', 'அறுவடை (Paddy Harvesting)', 'labour_squad', 'agriculture'),
('Planting & Weeding', 'நற்று நடுதல் & களை எடுத்தல்', 'labour_squad', 'grass'),
('Construction & Masonry', 'கட்டுமான வேலை (Masonry)', 'labour_squad', 'foundation'),
('Loading & Unloading', 'மூட்டை ஏற்றுதல் & இறக்குதல்', 'labour_squad', 'unarchive'),
('Motor & Pump Mechanic', 'மோட்டார் & பம்ப் மெக்கானிக்', 'technician', 'build'),
('Electrician & Wiring', 'எலக்ட்ரீஷியன்', 'technician', 'electrical_services'),
('Tractor Operator', 'டிராக்டர் டிரைவர்', 'technician', 'directions_car'),
('JCB & Earthmover Operator', 'JCB ஆபரேட்டர்', 'technician', 'precision_manufacturing'),
('Tree Cutter & Coconut Climber', 'மரம் வெட்டுபவர் / தென்னை ஏறுபவர்', 'technician', 'park'),
('Sprayer Operator', 'மருந்து தெளிப்பவர் (Sprayer)', 'technician', 'sanitization')
ON CONFLICT DO NOTHING;
