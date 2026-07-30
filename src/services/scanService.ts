import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ScanResult {
  id?: string;
  user_id?: string;
  image_url: string; // base64 representation or URL
  disease_name: string;
  confidence: number;
  treatment: {
    chemical: string[];
    biological: string[];
    prevention: string[];
  };
  prevention: string[];
  created_at?: string;
}

export async function diagnoseImage(base64Image: string): Promise<ScanResult> {
  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to diagnose image');
  }

  const data = await response.json();
  
  // Format the Plant.id v3 health_assessment response to our unified ScanResult format
  const result = data.result;
  const isPlant = result?.is_plant?.binary ?? true;
  
  if (!isPlant) {
    throw new Error('No plant was detected in the uploaded image. Please try again with a clear photo of a crop.');
  }

  const assessment = result?.health_assessment;
  const isHealthy = assessment?.is_healthy?.binary ?? true;

  if (isHealthy || !assessment?.diseases || assessment.diseases.length === 0) {
    return {
      image_url: base64Image,
      disease_name: 'Healthy Plant',
      confidence: Math.round((assessment?.is_healthy?.probability ?? 1) * 100),
      treatment: {
        chemical: [],
        biological: [],
        prevention: ['Keep doing what you are doing. Maintain regular watering and fertilization schedules.'],
      },
      prevention: ['Ensure crop rotation and sanitization of tools between harvests.'],
    };
  }

  // Get the most likely disease
  const topDisease = assessment.diseases[0];
  const treatment = topDisease.treatment || {};

  return {
    image_url: base64Image,
    disease_name: topDisease.name || 'Unknown Condition',
    confidence: Math.round((topDisease.probability || 0.8) * 100),
    treatment: {
      chemical: treatment.chemical || [],
      biological: treatment.biological || [],
      prevention: treatment.prevention || [],
    },
    prevention: treatment.prevention || [],
  };
}

export async function saveScanRecord(
  userId: string | null,
  scan: Omit<ScanResult, 'id' | 'created_at'>
): Promise<ScanResult> {
  const newRecord: ScanResult = {
    ...scan,
    id: `scan_${Date.now()}`,
    user_id: userId || 'sandbox_user',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && userId && !userId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .insert({
          user_id: userId,
          image_url: scan.image_url,
          disease_name: scan.disease_name,
          confidence: scan.confidence,
          treatment: scan.treatment,
          prevention: scan.prevention,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          user_id: data.user_id,
          image_url: data.image_url,
          disease_name: data.disease_name,
          confidence: Number(data.confidence),
          treatment: data.treatment as any,
          prevention: data.prevention,
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.warn('[ScanService] Supabase insert failed. Saving to local cache.', err);
    }
  }

  // Fallback to local storage (Sandbox mode or database error)
  try {
    const history = JSON.parse(localStorage.getItem('vlink_scan_history') || '[]');
    history.unshift(newRecord);
    localStorage.setItem('vlink_scan_history', JSON.stringify(history));
  } catch (err) {
    console.error('[ScanService] Local storage save failed:', err);
  }

  return newRecord;
}

export async function fetchScanHistory(userId: string | null): Promise<ScanResult[]> {
  if (isSupabaseConfigured && supabase && userId && !userId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          image_url: item.image_url,
          disease_name: item.disease_name,
          confidence: Number(item.confidence),
          treatment: item.treatment || { chemical: [], biological: [], prevention: [] },
          prevention: item.prevention || [],
          created_at: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('[ScanService] Supabase select failed. Loading from local cache.', err);
    }
  }

  // Fallback to local storage (Sandbox/offline)
  try {
    const history = JSON.parse(localStorage.getItem('vlink_scan_history') || '[]');
    // Filter history for current user in sandbox mode
    return history.filter((item: any) => item.user_id === (userId || 'sandbox_user'));
  } catch (err) {
    console.error('[ScanService] Local storage fetch failed:', err);
    return [];
  }
}
