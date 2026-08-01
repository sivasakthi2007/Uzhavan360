'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Leaf,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Loader2,
  CheckCircle,
  Phone,
  Mail,
  ShieldCheck,
  WifiOff,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

function SignupContent() {
  const { theme, setTheme, signInWithOtp, verifyOtp, completeSignup, loginWithGoogle, loading: appLoading, user, language, setLanguage, t, addToast } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill check from search params (for quick sandbox access)
  const prefillEmail = searchParams.get('prefill');

  const [inputVal, setInputVal] = useState(''); // phone or email
  const [otpVal, setOtpVal] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'profile'>('request'); // request OTP, verify, or collect profile
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // New profile collection states
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | 'labor' | 'vendor'>('farmer');
  const [selectedBuyerType, setSelectedBuyerType] = useState<'customer' | 'hotel' | 'retail' | 'marriage'>('customer');
  
  // Resend OTP countdown timer state
  const [resendCountdown, setResendCountdown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (!appLoading && user) {
      if (step !== 'profile') {
        router.replace('/dashboard');
      }
    }
  }, [user, appLoading, router, step]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleGoogleLogin = async () => {
    setError('');
    setLocalLoading(true);
    try {
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem('vlink_active_role') : null;
      const role = (savedRole as any) || 'farmer';
      await loginWithGoogle(role);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLocalLoading(false);
    }
  };

  // Set prefill email on load
  useEffect(() => {
    if (prefillEmail) {
      setInputVal(prefillEmail);
    }
  }, [prefillEmail]);

  const isLoading = appLoading || localLoading;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputVal.trim()) {
      setError(t('error_input_empty'));
      return;
    }

    setLocalLoading(true);
    try {
      await signInWithOtp(inputVal.trim());
      setStep('verify');
      setResendCountdown(30);
    } catch (err: any) {
      const errMsg = err.message || '';
      const isUnsupported = errMsg.includes('Unsupported provider') || errMsg.includes('provider is not enabled') || errMsg.includes('provider_not_enabled');
      if (isUnsupported) {
        setError(
          language === 'ta'
            ? 'தொலைபேசி OTP தற்போது கிடைக்கவில்லை. மற்றொரு உள்நுழைவு முறையைப் பயன்படுத்தவும்.'
            : 'Phone OTP is currently unavailable. Please use another sign-in method.'
        );
      } else {
        setError(errMsg || t('error_send_failed'));
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError('');

    setLocalLoading(true);
    try {
      await signInWithOtp(inputVal.trim());
      setResendCountdown(30);
      addToast(
        language === 'ta' ? 'OTP மீண்டும் அனுப்பப்பட்டது!' : 'OTP resent successfully!',
        'success'
      );
    } catch (err: any) {
      const errMsg = err.message || '';
      const isUnsupported = errMsg.includes('Unsupported provider') || errMsg.includes('provider is not enabled') || errMsg.includes('provider_not_enabled');
      if (isUnsupported) {
        setError(
          language === 'ta'
            ? 'தொலைபேசி OTP தற்போது கிடைக்கவில்லை. மற்றொரு உள்நுழைவு முறையைப் பயன்படுத்தவும்.'
            : 'Phone OTP is currently unavailable. Please use another sign-in method.'
        );
      } else {
        setError(errMsg || t('error_send_failed'));
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpVal.trim() || otpVal.length < 6) {
      setError(t('error_otp_empty'));
      return;
    }

    setLocalLoading(true);
    try {
      const { profileExists } = await verifyOtp(inputVal.trim(), otpVal.trim());
      if (!profileExists) {
        setStep('profile');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || t('error_verify_failed'));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your name.');
      return;
    }

    setLocalLoading(true);
    try {
      await completeSignup(
        fullName.trim(),
        selectedRole,
        selectedRole === 'buyer' ? selectedBuyerType : null
      );
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('error_signup_failed') || 'Signup failed');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] dark:bg-[#070b09] flex flex-col font-sans transition-colors duration-500 justify-between relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-accent-500/5 dark:bg-primary-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="h-20 px-6 lg:px-16 border-b border-earth-200/50 dark:border-primary-950/20 flex items-center justify-between bg-white/70 dark:bg-[#111714]/75 backdrop-blur-xl transition-all duration-300 relative z-10">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md">
            <Leaf className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-display font-black text-base tracking-tight text-foreground block">V-LINK</span>
            <span className="text-[8px] font-mono text-primary-500 font-extrabold uppercase tracking-widest -mt-1 block">{t('platform_name')}</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Global Language Selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
              className="h-8 px-2.5 pr-6 rounded-lg text-[9px] font-mono font-black bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/25 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/30 appearance-none uppercase"
            >
              <option value="ta" className="text-foreground bg-white dark:bg-[#111714]">தமிழ்</option>
              <option value="en" className="text-foreground bg-white dark:bg-[#111714]">EN</option>
            </select>
            <div className="pointer-events-none absolute right-2 flex items-center opacity-60">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-8 h-8 flex items-center justify-center text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100/50 dark:hover:bg-earth-900/40 rounded-lg cursor-pointer border-0 bg-transparent"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <Link
            href="/"
            className="flex items-center gap-1 text-[10px] font-mono font-black text-earth-500 dark:text-earth-400 hover:text-foreground no-underline uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('back')}</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg space-y-6">

          {/* Sandbox warning */}
          {!isSupabaseConfigured && (
            <div className="p-4 bg-primary-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-400 rounded-2xl text-[11px] font-bold flex items-start gap-2.5 shadow-xs animate-fade-in">
              <span className="text-sm shrink-0">⚡</span>
              <div>
                {t('sandbox_warning')}
              </div>
            </div>
          )}

          {/* Success state */}
          {success ? (
            <div className="bg-white dark:bg-[#111714] border border-primary-500/20 rounded-[28px] p-10 shadow-xl text-center space-y-5 animate-scale-up">
              <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-display font-black text-foreground">{t('verified_success')}</h2>
                <p className="text-xs text-earth-500 dark:text-earth-450">
                  {t('redirecting')}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-primary-500 font-mono font-bold">
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>{t('booting_workspace')}</span>
              </div>
            </div>
          ) : (
            /* Form Card */
            <div className="bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 rounded-[28px] p-8 md:p-10 shadow-xl space-y-6 transition-all">

              {/* Brand Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-display font-black text-foreground tracking-tight">
                  {step === 'request' ? t('signup_title') : step === 'verify' ? t('enter_otp') : (language === 'ta' ? 'விவரங்களை பூர்த்தி செய்யவும்' : 'Complete Profile')}
                </h1>
                <p className="text-xs text-earth-500 dark:text-earth-450 leading-relaxed font-semibold">
                  {step === 'request'
                    ? t('request_otp')
                    : step === 'verify'
                    ? `${t('enter_otp_sent_to')}: ${inputVal}`
                    : (language === 'ta' ? 'உங்களது விவசாய கணக்கை அமைக்க கீழே உள்ள விவரங்களை பூர்த்தி செய்யவும்.' : 'Please enter your details to finalize your operator account.')}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed animate-fade-in">
                  {error}
                </div>
              )}

              {step === 'request' ? (
                /* Step 1: Request OTP */
                <>
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-455 block">
                        {t('phone_email_label')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          placeholder={t('phone_email_placeholder')}
                          className="vlink-input pl-12"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400">
                          {inputVal.includes('@') ? (
                            <Mail className="w-4.5 h-4.5" />
                          ) : (
                            <Phone className="w-4.5 h-4.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        <>
                          <span>{t('send_otp')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider and Google Login */}
                  <div className="space-y-4 pt-2">
                    <div className="relative flex py-1 items-center">
                       <div className="flex-grow border-t border-earth-200/50 dark:border-primary-950/20"></div>
                       <span className="flex-shrink mx-4 text-[9px] font-mono font-black uppercase tracking-widest text-earth-450">
                         {t('or_sign_in_with')}
                       </span>
                       <div className="flex-grow border-t border-earth-200/50 dark:border-primary-950/20"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full h-12 bg-white dark:bg-[#151c19] hover:bg-earth-50 dark:hover:bg-earth-900 border border-earth-200 dark:border-primary-950/20 text-foreground rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                    >
                      {/* Google Icon */}
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{t('google_auth_btn') || 'Sign in with Google'}</span>
                    </button>
                  </div>
                </>
              ) : step === 'verify' ? (
                /* Step 2: Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-450 block">
                      {t('otp_code_label')}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={t('otp_code_placeholder')}
                      className="w-full h-12 px-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-primary-950/20 rounded-xl text-center text-xl font-black tracking-[0.3em] text-foreground focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>{t('verify_enter')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('request');
                        setOtpVal('');
                      }}
                      className="text-[10px] font-mono font-black uppercase tracking-widest text-earth-500 hover:text-foreground border-0 bg-transparent cursor-pointer"
                    >
                      {t('change_contact')}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading || resendCountdown > 0}
                      className="text-[10px] font-mono font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCountdown > 0
                        ? `${language === 'ta' ? 'மீண்டும் அனுப்பவும்' : 'Resend'} (${resendCountdown}s)`
                        : (language === 'ta' ? 'மீண்டும் அனுப்பவும்' : 'Resend OTP')}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 3: Collect Profile Details */
                <form onSubmit={handleCompleteSignup} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-450 block">
                      {language === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'ta' ? 'உங்களது பெயரை உள்ளிடவும்' : 'Enter your name'}
                      className="vlink-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-450 block">
                      {language === 'ta' ? 'விவசாயி / பயனர் வகை' : 'Operator Role'}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="w-full h-12 px-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-primary-950/20 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                    >
                      <option value="farmer">{language === 'ta' ? 'விவசாயி (Farmer)' : 'Farmer'}</option>
                      <option value="buyer">{language === 'ta' ? 'கொள்முதல் செய்பவர் (Buyer)' : 'Buyer'}</option>
                      <option value="labor">{language === 'ta' ? 'விவசாய தொழிலாளி (Labour)' : 'Labour'}</option>
                      <option value="vendor">{language === 'ta' ? 'கருவி வாடகை தருபவர் (Rental Vendor)' : 'Rental Vendor'}</option>
                    </select>
                  </div>

                  {selectedRole === 'buyer' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-450 block">
                        {language === 'ta' ? 'கொள்முதல் வகை' : 'Buyer Type'}
                      </label>
                      <select
                        value={selectedBuyerType}
                        onChange={(e) => setSelectedBuyerType(e.target.value as any)}
                        className="w-full h-12 px-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-primary-950/20 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                      >
                        <option value="customer">{language === 'ta' ? 'நேரடி நுகர்வோர்' : 'Direct Customer'}</option>
                        <option value="hotel">{language === 'ta' ? 'ஹோட்டல்' : 'Hotel / Restaurant'}</option>
                        <option value="retail">{language === 'ta' ? 'சில்லறை கடை' : 'Retail Store'}</option>
                        <option value="marriage">{language === 'ta' ? 'திருமண மண்டபம் / விழாக்கள்' : 'Marriage / Event Caterer'}</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>{language === 'ta' ? 'பதிவை முடிக்கவும்' : 'Complete Registration'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-earth-200/50 dark:border-primary-950/20 text-center text-[9px] font-mono font-black uppercase tracking-wider text-earth-450 bg-white dark:bg-[#0c120f] transition-all">
        Secure agricultural login · V-Link Rural Infrastructure Systems
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9f6] dark:bg-[#070b09] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Leaf className="w-8 h-8 text-primary-500 animate-bounce" />
            <span className="text-xs font-semibold text-earth-500">Loading signup portal...</span>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
