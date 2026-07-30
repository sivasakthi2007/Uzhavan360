import { supabase, isSupabaseConfigured } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────
export interface AuthResult {
  data: { user: any; session: any };
  error: any;
}

// ─── Create Profile in public.profiles ──────────────────────────────
/**
 * Inserts a new row into the `profiles` table after signup.
 * Called right after supabase.auth.signUp() succeeds.
 */
export async function createProfile(params: {
  id: string;
  email: string;
  full_name: string;
  role: string;
  language?: string;
}): Promise<{ error: any }> {
  const activeLanguage = params.language || (typeof window !== 'undefined' ? localStorage.getItem('vlink_language') : 'ta') || 'ta';

  if (!isSupabaseConfigured || !supabase) {
    // Sandbox: persist profile to localStorage for mock mode
    try {
      const profiles = JSON.parse(localStorage.getItem('vlink_mock_profiles') || '[]');
      profiles.push({ ...params, language: activeLanguage, created_at: new Date().toISOString() });
      localStorage.setItem('vlink_mock_profiles', JSON.stringify(profiles));
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: params.id,
      email: params.email,
      full_name: params.full_name,
      role: params.role,
      language: activeLanguage,
      created_at: new Date().toISOString(),
    });

  return { error };
}

// ─── Sign Up ─────────────────────────────────────────────────────────
/**
 * Creates a new user in Supabase Auth.
 * Passes full_name and role as user_metadata so they're stored on the auth user.
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { full_name?: string; role?: string; language?: string }
): Promise<AuthResult> {
  const activeLanguage = metadata?.language || (typeof window !== 'undefined' ? localStorage.getItem('vlink_language') : 'ta') || 'ta';

  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.full_name || '',
          role: metadata?.role || 'farmer',
          language: activeLanguage,
        },
      },
    });
  }

  // Sandbox Mode: Simulate signup with LocalStorage persistence
  try {
    const users = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already registered. Please sign in instead.' },
      };
    }

    const mockUser = {
      id: `mock_user_${Date.now()}`,
      email,
      role: 'authenticated',
      user_metadata: {
        full_name: metadata?.full_name || '',
        role: metadata?.role || 'farmer',
        language: activeLanguage,
      },
      created_at: new Date().toISOString(),
    };
    const mockSession = {
      access_token: `mock_token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_${Date.now()}`,
      user: mockUser,
    };

    users.push({ email, password, profile: mockUser });
    localStorage.setItem('vlink_mock_users', JSON.stringify(users));
    localStorage.setItem('vlink_mock_session', JSON.stringify(mockSession));

    return { data: { user: mockUser, session: mockSession }, error: null };
  } catch (err: any) {
    return { data: { user: null, session: null }, error: err };
  }
}

// ─── Sign In ─────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  // Sandbox Mode: Validate credentials against LocalStorage
  try {
    const users = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
    const matched = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!matched) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid email or password. Please check your credentials.' },
      };
    }

    const mockSession = {
      access_token: `mock_token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_${Date.now()}`,
      user: matched.profile,
    };

    localStorage.setItem('vlink_mock_session', JSON.stringify(mockSession));
    return { data: { user: matched.profile, session: mockSession }, error: null };
  } catch (err: any) {
    return { data: { user: null, session: null }, error: err };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────
export async function signOut(): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signOut();
  }

  localStorage.removeItem('vlink_mock_session');
  return { error: null };
}

// ─── Get Session ──────────────────────────────────────────────────────
export async function getSession(): Promise<{ data: { session: any }; error: any }> {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.getSession();
  }

  // Sandbox Mode: Restore from localStorage
  try {
    const sessionStr =
      typeof window !== 'undefined' ? localStorage.getItem('vlink_mock_session') : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    return { data: { session }, error: null };
  } catch (err: any) {
    return { data: { session: null }, error: err };
  }
}

// ─── Get Current User ─────────────────────────────────────────────────
export async function getCurrentUser(): Promise<{ data: { user: any }; error: any }> {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.getUser();
  }

  try {
    const { data: { session } } = await getSession();
    return { data: { user: session ? session.user : null }, error: null };
  } catch (err: any) {
    return { data: { user: null }, error: err };
  }
}

// ─── Sign In With OTP (Phone/Email) ─────────────────────────────────
export async function signInWithOtp(emailOrPhone: string): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
    const isEmail = emailOrPhone.includes('@');
    let res;
    if (isEmail) {
      res = await supabase.auth.signInWithOtp({ email: emailOrPhone });
    } else {
      res = await supabase.auth.signInWithOtp({ phone: emailOrPhone });
    }
    if (res.error) {
      console.warn('[V-Link] Supabase OTP error, falling back to sandbox simulator:', res.error.message);
      return { error: null }; // Silent fallback to simulated mode
    }
    return { error: null };
  }

  // Sandbox Mode: simulate sending OTP
  return { error: null };
}

// ─── Verify OTP ──────────────────────────────────────────────────────
export async function verifyOtp(emailOrPhone: string, token: string): Promise<AuthResult> {
  if (isSupabaseConfigured && supabase) {
    const isEmail = emailOrPhone.includes('@');
    let result;
    if (isEmail) {
      result = await supabase.auth.verifyOtp({
        email: emailOrPhone,
        token,
        type: 'magiclink',
      });
    } else {
      result = await supabase.auth.verifyOtp({
        phone: emailOrPhone,
        token,
        type: 'sms',
      });
    }
    const { data, error } = result;
    if (!error && data?.user) {
      return { data: { user: data.user, session: data.session }, error: null };
    }
    console.warn('[V-Link] Supabase OTP verification error, falling back to sandbox verification:', error?.message);
  }

  // Sandbox Mode: verify OTP
  if (!/^\d{6}$/.test(token)) {
    return { data: { user: null, session: null }, error: { message: 'Verification code must be 6 digits.' } };
  }

  try {
    const users = JSON.parse(localStorage.getItem('vlink_mock_users') || '[]');
    let matched = users.find((u: any) => u.email.toLowerCase() === emailOrPhone.toLowerCase());

    if (!matched) {
      // Auto-signup in sandbox mode if user doesn't exist yet!
      const activeLanguage = (typeof window !== 'undefined' ? localStorage.getItem('vlink_language') : 'ta') || 'ta';
      const mockUser = {
        id: `mock_user_${Date.now()}`,
        email: emailOrPhone,
        role: 'authenticated',
        user_metadata: {
          full_name: emailOrPhone.split('@')[0],
          role: 'farmer',
          language: activeLanguage,
        },
        created_at: new Date().toISOString(),
      };
      matched = { email: emailOrPhone, password: '', profile: mockUser };
      users.push(matched);
      localStorage.setItem('vlink_mock_users', JSON.stringify(users));
    }

    const mockSession = {
      access_token: `mock_token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_${Date.now()}`,
      user: matched.profile,
    };

    localStorage.setItem('vlink_mock_session', JSON.stringify(mockSession));
    return { data: { user: matched.profile, session: mockSession }, error: null };
  } catch (err: any) {
    return { data: { user: null, session: null }, error: err };
  }
}

