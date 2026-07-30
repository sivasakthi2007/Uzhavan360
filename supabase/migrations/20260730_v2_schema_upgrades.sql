-- =========================================================================
-- UZHAVAN360 VERSION 2.0 - DATABASE MIGRATION SCRIPT
-- Type: Supabase PostgreSQL (Production-Grade)
-- =========================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- PART 1: SYSTEM SYNCHRONIZATION HELPERS & TRIGGERS
-- -------------------------------------------------------------------------

-- Helper function to automatically update last_modified_at and sync_version on row updates
CREATE OR REPLACE FUNCTION public.update_sync_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = NOW();
    NEW.sync_version = OLD.sync_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- PART 2: ALTERING EXISTING V1 TABLES FOR OFFLINE-FIRST SYNC SUPPORT
-- -------------------------------------------------------------------------
-- Adding sync_version, last_modified_at, and is_deleted fields to existing tables.
-- These alterations preserve all existing columns and data.

-- 1. public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 2. public.products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 3. public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 4. public.delivery_jobs
ALTER TABLE public.delivery_jobs ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.delivery_jobs ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.delivery_jobs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_delivery_jobs
    BEFORE UPDATE ON public.delivery_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 5. public.labor_jobs
ALTER TABLE public.labor_jobs ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.labor_jobs ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.labor_jobs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_labor_jobs
    BEFORE UPDATE ON public.labor_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 6. public.wallet_transactions
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_wallet_transactions
    BEFORE UPDATE ON public.wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 7. public.market_prices
ALTER TABLE public.market_prices ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.market_prices ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.market_prices ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_market_prices
    BEFORE UPDATE ON public.market_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 8. public.scan_history
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.scan_history ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_scan_history
    BEFORE UPDATE ON public.scan_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 9. public.farms
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.farms ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_farms
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 10. public.farm_expenses
ALTER TABLE public.farm_expenses ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.farm_expenses ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.farm_expenses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_farm_expenses
    BEFORE UPDATE ON public.farm_expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 11. public.farm_income
ALTER TABLE public.farm_income ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.farm_income ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.farm_income ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_farm_income
    BEFORE UPDATE ON public.farm_income
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();

-- 12. public.scheme_applications
ALTER TABLE public.scheme_applications ADD COLUMN IF NOT EXISTS sync_version INT DEFAULT 1;
ALTER TABLE public.scheme_applications ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.scheme_applications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE TRIGGER tr_sync_scheme_applications
    BEFORE UPDATE ON public.scheme_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_fields();


-- -------------------------------------------------------------------------
-- PART 3: NEW TABLES FOR VERSION 2.0 UPGRADE MODULES
-- -------------------------------------------------------------------------

-- 1. FPO Network Table
-- Objective: Stores FPO metadata and contact links for direct corporate relationships
CREATE TABLE IF NOT EXISTS public.fpos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    member_count INT DEFAULT 0 CHECK (member_count >= 0),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2. Harvest Pre-Bookings Table
-- Objective: Secures contracts between buyers and farmers on expected future harvests
CREATE TABLE IF NOT EXISTS public.harvest_pre_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    estimated_quantity NUMERIC(12,2) NOT NULL CHECK (estimated_quantity > 0),
    unit TEXT NOT NULL DEFAULT 'kg',
    agreed_price_per_unit NUMERIC(12,2) NOT NULL CHECK (agreed_price_per_unit > 0),
    escrow_deposit NUMERIC(12,2) DEFAULT 0 CHECK (escrow_deposit >= 0),
    expected_harvest_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'negotiating', 'contracted', 'cancelled', 'completed')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 3. Labour Registrations Table
-- Objective: Registered work profiles and rates of local labourers
CREATE TABLE IF NOT EXISTS public.labour_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL,
    daily_wage_expectation NUMERIC(10,2) NOT NULL CHECK (daily_wage_expectation > 0),
    preferred_district TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 4. Labour Bookings Table
-- Objective: Employment contracts between farmers and local farm workers
CREATE TABLE IF NOT EXISTS public.labour_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    wages NUMERIC(10,2) NOT NULL CHECK (wages > 0),
    start_date DATE NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 5. Shared Transport Routes Table
-- Objective: Fleet driver routing plans, departures, and pricing for cargo sharing
CREATE TABLE IF NOT EXISTS public.transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_capacity NUMERIC(12,2) NOT NULL CHECK (vehicle_capacity > 0),
    available_capacity NUMERIC(12,2) NOT NULL CHECK (available_capacity >= 0),
    route_from TEXT NOT NULL,
    route_to TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    price_per_kg NUMERIC(10,2) NOT NULL CHECK (price_per_kg >= 0),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'departed', 'completed', 'cancelled')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 6. Shared Transport Bookings Table
-- Objective: Transport request agreements mapped to routes
CREATE TABLE IF NOT EXISTS public.transport_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cargo_weight NUMERIC(12,2) NOT NULL CHECK (cargo_weight > 0),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    total_fare NUMERIC(12,2) NOT NULL CHECK (total_fare >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'loaded', 'delivered', 'cancelled')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 7. Warehouses Table
-- Objective: Local storage registries including temperature capabilities and daily pricing
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    total_capacity NUMERIC(12,2) NOT NULL CHECK (total_capacity > 0),
    available_capacity NUMERIC(12,2) NOT NULL CHECK (available_capacity >= 0),
    price_per_unit_daily NUMERIC(10,2) NOT NULL CHECK (price_per_unit_daily >= 0),
    has_cold_storage BOOLEAN DEFAULT FALSE,
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 8. Warehouse Bookings Table
-- Objective: Cold storage reservations booked by local farmers
CREATE TABLE IF NOT EXISTS public.warehouse_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    commodity_name TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    total_cost NUMERIC(12,2) NOT NULL CHECK (total_cost >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'released', 'cancelled')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 9. Community Posts Table
-- Objective: Community discussions and local notifications
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    category TEXT CHECK (category IN ('general', 'pests', 'weather', 'mandi', 'machinery')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 10. Community Comments Table
-- Objective: Nested commentaries related to community posts
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 11. Support Tickets Table
-- Objective: Customer care center support queries
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 12. Support Messages Table
-- Objective: Ongoing conversations linked to tickets
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    
    -- Sync columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE
);


-- -------------------------------------------------------------------------
-- PART 4: ATTACH SYNC TRIGGERS FOR NEW V2 TABLES
-- -------------------------------------------------------------------------

CREATE TRIGGER tr_sync_fpos BEFORE UPDATE ON public.fpos FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_harvest_pre_bookings BEFORE UPDATE ON public.harvest_pre_bookings FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_labour_registrations BEFORE UPDATE ON public.labour_registrations FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_labour_bookings BEFORE UPDATE ON public.labour_bookings FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_transport_routes BEFORE UPDATE ON public.transport_routes FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_transport_bookings BEFORE UPDATE ON public.transport_bookings FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_warehouses BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_warehouse_bookings BEFORE UPDATE ON public.warehouse_bookings FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_community_posts BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_community_comments BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_support_tickets BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();
CREATE TRIGGER tr_sync_support_messages BEFORE UPDATE ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.update_sync_fields();


-- -------------------------------------------------------------------------
-- PART 5: FOREIGN KEY INDEXES OPTIMIZATION
-- -------------------------------------------------------------------------
-- High-concurrency indices to speed up queries on foreign keys and filters

CREATE INDEX IF NOT EXISTS idx_fpos_district ON public.fpos(district);
CREATE INDEX IF NOT EXISTS idx_harvest_pre_bookings_farmer_id ON public.harvest_pre_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvest_pre_bookings_buyer_id ON public.harvest_pre_bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_labour_registrations_worker_id ON public.labour_registrations(worker_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_employer_id ON public.labour_bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_worker_id ON public.labour_bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_transport_routes_driver_id ON public.transport_routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_route_id ON public.transport_bookings(route_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_farmer_id ON public.transport_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_district ON public.warehouses(district);
CREATE INDEX IF NOT EXISTS idx_warehouse_bookings_warehouse_id ON public.warehouse_bookings(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_bookings_farmer_id ON public.warehouse_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id);


-- -------------------------------------------------------------------------
-- PART 6: ROW LEVEL SECURITY (RLS) POLICIES FOR NEW V2 TABLES
-- -------------------------------------------------------------------------

-- 1. public.fpos
ALTER TABLE public.fpos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to fpos" ON public.fpos FOR SELECT USING (TRUE);
CREATE POLICY "Allow admin to manage fpos" ON public.fpos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. public.harvest_pre_bookings
ALTER TABLE public.harvest_pre_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own pre-bookings" ON public.harvest_pre_bookings FOR SELECT USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id OR auth.uid() IS NULL
);
CREATE POLICY "Allow farmers to post pre-bookings" ON public.harvest_pre_bookings FOR INSERT WITH CHECK (
    auth.uid() = farmer_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Allow buyers to update pre-bookings" ON public.harvest_pre_bookings FOR UPDATE USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
);

-- 3. public.labour_registrations
ALTER TABLE public.labour_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to labour registrations" ON public.labour_registrations FOR SELECT USING (TRUE);
CREATE POLICY "Allow labourers to manage their registration" ON public.labour_registrations FOR ALL USING (
    auth.uid() = worker_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'labor')
);

-- 4. public.labour_bookings
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own labour bookings" ON public.labour_bookings FOR SELECT USING (
    auth.uid() = employer_id OR auth.uid() = worker_id
);
CREATE POLICY "Allow employers to book labour" ON public.labour_bookings FOR INSERT WITH CHECK (
    auth.uid() = employer_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Allow participants to update labour booking status" ON public.labour_bookings FOR UPDATE USING (
    auth.uid() = employer_id OR auth.uid() = worker_id
);

-- 5. public.transport_routes
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to transport routes" ON public.transport_routes FOR SELECT USING (TRUE);
CREATE POLICY "Allow drivers to manage their own routes" ON public.transport_routes FOR ALL USING (
    auth.uid() = driver_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'delivery')
);

-- 6. public.transport_bookings
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own transport bookings" ON public.transport_bookings FOR SELECT USING (
    auth.uid() = farmer_id OR auth.uid() IN (SELECT driver_id FROM public.transport_routes WHERE id = route_id)
);
CREATE POLICY "Allow farmers to book transport" ON public.transport_bookings FOR INSERT WITH CHECK (
    auth.uid() = farmer_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Allow participants to update transport booking status" ON public.transport_bookings FOR UPDATE USING (
    auth.uid() = farmer_id OR auth.uid() IN (SELECT driver_id FROM public.transport_routes WHERE id = route_id)
);

-- 7. public.warehouses
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to warehouses" ON public.warehouses FOR SELECT USING (TRUE);
CREATE POLICY "Allow admin to manage warehouses" ON public.warehouses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. public.warehouse_bookings
ALTER TABLE public.warehouse_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own warehouse bookings" ON public.warehouse_bookings FOR SELECT USING (
    auth.uid() = farmer_id
);
CREATE POLICY "Allow farmers to book warehouse space" ON public.warehouse_bookings FOR INSERT WITH CHECK (
    auth.uid() = farmer_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);

-- 9. public.community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to community posts" ON public.community_posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow users to create and update their own posts" ON public.community_posts FOR ALL USING (
    auth.uid() = author_id
);

-- 10. public.community_comments
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to community comments" ON public.community_comments FOR SELECT USING (TRUE);
CREATE POLICY "Allow users to create and manage their own comments" ON public.community_comments FOR ALL USING (
    auth.uid() = author_id
);

-- 11. public.support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own support tickets" ON public.support_tickets FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow users to open support tickets" ON public.support_tickets FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- 12. public.support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view support messages for their own tickets" ON public.support_messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() IN (SELECT user_id FROM public.support_tickets WHERE id = ticket_id)
);
CREATE POLICY "Allow users to post support messages on their own tickets" ON public.support_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);
