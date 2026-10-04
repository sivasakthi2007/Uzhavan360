-- V-LINK Layer 2 Mesh Network Schema Migration

-- 1. Mesh Nodes Registry Table
CREATE TABLE IF NOT EXISTS public.vlink_nodes (
    node_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    device_capabilities JSONB NOT NULL DEFAULT '{"ble": true, "wifi_direct": true, "max_storage_mb": 500}'::jsonb,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    connection_state TEXT DEFAULT 'disconnected',
    software_version TEXT DEFAULT '1.0.0'
);

ALTER TABLE public.vlink_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to vlink_nodes" ON public.vlink_nodes FOR SELECT USING (true);
CREATE POLICY "Allow nodes to upsert their status" ON public.vlink_nodes FOR ALL USING (true);

-- 2. Mesh Messages Audit and Relay Store
CREATE TABLE IF NOT EXISTS public.vlink_messages (
    message_id TEXT PRIMARY KEY,
    origin_node_id TEXT NOT NULL,
    source_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    destination_type TEXT NOT NULL DEFAULT 'SUPABASE_GATEWAY',
    payload_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ttl INT NOT NULL DEFAULT 8,
    hop_count INT NOT NULL DEFAULT 0,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    payload_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('CREATED', 'QUEUED', 'DISCOVERED', 'TRANSFERRED', 'RELAYED', 'GATEWAY_RECEIVED', 'CLOUD_SYNCED', 'ACKNOWLEDGED', 'TRANSFER_FAILED', 'TTL_EXPIRED'))
);

ALTER TABLE public.vlink_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to vlink_messages" ON public.vlink_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated devices to sync mesh messages" ON public.vlink_messages FOR ALL USING (true);

-- 3. Message Hop Trace Receipts (Audit trail for delivery verification)
CREATE TABLE IF NOT EXISTS public.vlink_message_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT REFERENCES public.vlink_messages(message_id) ON DELETE CASCADE,
    hop_index INT NOT NULL,
    from_node_id TEXT NOT NULL,
    to_node_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vlink_message_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to receipts" ON public.vlink_message_receipts FOR SELECT USING (true);
CREATE POLICY "Allow devices to log receipts" ON public.vlink_message_receipts FOR INSERT WITH CHECK (true);
