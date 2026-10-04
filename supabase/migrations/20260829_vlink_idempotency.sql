-- V-LINK Idempotency and Duplicate Business Transaction Prevention Schema

-- Add vlink_message_id reference column to core business transaction tables
-- to ensure that a mesh message processed multiple times at the gateway
-- does not duplicate listings, orders, or applications.

-- 1. Products (Crop Availability Listings)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS vlink_message_id TEXT UNIQUE REFERENCES public.vlink_messages(message_id) ON DELETE SET NULL;

-- 2. Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS vlink_message_id TEXT UNIQUE REFERENCES public.vlink_messages(message_id) ON DELETE SET NULL;

-- 3. Scheme Applications
ALTER TABLE public.scheme_applications 
ADD COLUMN IF NOT EXISTS vlink_message_id TEXT UNIQUE REFERENCES public.vlink_messages(message_id) ON DELETE SET NULL;

-- 4. Farms
ALTER TABLE public.farms 
ADD COLUMN IF NOT EXISTS vlink_message_id TEXT UNIQUE REFERENCES public.vlink_messages(message_id) ON DELETE SET NULL;


-- Idempotent sync processing function for gateway uploads
CREATE OR REPLACE FUNCTION public.sync_vlink_envelope(
    p_message_id TEXT,
    p_origin_node_id TEXT,
    p_source_user_id UUID,
    p_payload_type TEXT,
    p_payload JSONB,
    p_expires_at TIMESTAMPTZ,
    p_ttl INT,
    p_hop_count INT,
    p_priority TEXT,
    p_payload_hash TEXT
) RETURNS TEXT AS $$
DECLARE
    v_existing_msg_id TEXT;
BEGIN
    -- Check if message has already been received/synchronized
    SELECT message_id INTO v_existing_msg_id 
    FROM public.vlink_messages 
    WHERE message_id = p_message_id;
    
    IF v_existing_msg_id IS NOT NULL THEN
        RETURN 'DUPLICATE_IGNORED';
    END IF;
    
    -- Insert mesh packet envelope
    INSERT INTO public.vlink_messages (
        message_id,
        origin_node_id,
        source_user_id,
        destination_type,
        payload_type,
        payload,
        expires_at,
        ttl,
        hop_count,
        priority,
        payload_hash,
        status
    ) VALUES (
        p_message_id,
        p_origin_node_id,
        p_source_user_id,
        'SUPABASE_GATEWAY',
        p_payload_type,
        p_payload,
        p_expires_at,
        p_ttl,
        p_hop_count,
        p_priority,
        p_payload_hash,
        'CLOUD_SYNCED'
    );
    
    -- Apply the business transaction based on payload_type
    IF p_payload_type = 'CROP_AVAILABILITY' THEN
        INSERT INTO public.products (
            crop_name,
            quantity,
            unit,
            price,
            location,
            farmer_id,
            vlink_message_id
        ) VALUES (
            p_payload->>'cropName',
            (p_payload->>'quantityKg')::numeric,
            COALESCE(p_payload->>'unit', 'kg'),
            (p_payload->>'targetPrice')::numeric,
            COALESCE(p_payload->>'location', 'Unknown Location'),
            p_source_user_id,
            p_message_id
        ) ON CONFLICT (vlink_message_id) DO NOTHING;
        
    ELSIF p_payload_type = 'SCHEME_APPLICATION' THEN
        INSERT INTO public.scheme_applications (
            user_id,
            scheme_id,
            scheme_name,
            status,
            vlink_message_id
        ) VALUES (
            p_source_user_id,
            p_payload->>'schemeId',
            p_payload->>'schemeName',
            'pending',
            p_message_id
        ) ON CONFLICT (vlink_message_id) DO NOTHING;
        
    END IF;
    
    RETURN 'SYNCED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
