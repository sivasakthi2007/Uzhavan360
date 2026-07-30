'use client';

import React, { useEffect } from 'react';
import { Leaf, ArrowRight, Sun, Moon, WifiOff, Globe, BookOpen, ShoppingBag, MessageSquare, Shield, Users, Sprout } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { theme, setTheme, language, setLanguage, t } = useApp();
  const router = useRouter();

  useEffect(() => {
    router.replace('/signup');
  }, [router]);

  // Sandbox Mode Indicator
  const isSandbox = typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="flex-1 bg-[#f7f9f6] dark:bg-[#070b09] flex flex-col font-sans min-h-screen transition-colors duration-500 relative overflow-hidden">
      
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-500/5 dark:bg-primary-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="h-20 border-b border-earth-200/50 dark:border-primary-950/20 px-6 lg:px-16 flex items-center justify-between sticky top-0 z-50 bg-[#f7f9f6]/75 dark:bg-[#070b09]/80 backdrop-blur-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-lg shadow-primary-500/10">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-foreground block">V-LINK</span>
            <span className="text-[9px] block font-mono text-primary-500 font-extrabold uppercase tracking-widest -mt-0.5">{t('platform_name')}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-2 text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-500/5 dark:bg-primary-500/10 px-3.5 py-1.5 rounded-full border border-primary-500/10">
            <WifiOff className="w-3.5 h-3.5 text-primary-500 shrink-0" />
            {t('offline_mode_ready')}
          </span>

          {/* Global Language Selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
              className="h-9 px-3 pr-7 rounded-xl text-[10px] font-mono font-black bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/25 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/35 appearance-none uppercase"
            >
              <option value="ta" className="text-foreground bg-white dark:bg-[#111714]">தமிழ்</option>
              <option value="en" className="text-foreground bg-white dark:bg-[#111714]">EN</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 flex items-center opacity-65">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-9 h-9 flex items-center justify-center text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100/50 dark:hover:bg-earth-900/40 rounded-xl cursor-pointer border-0 bg-transparent transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4.5 h-4.5" />}
          </button>

          <Link
            href="/signup"
            className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer text-center no-underline"
          >
            <span>{t('get_started')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 max-w-5xl mx-auto flex flex-col items-center text-center flex-1 justify-center z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary-500/10 bg-primary-500/5 dark:bg-primary-500/10 text-[10px] font-mono font-bold text-primary-700 dark:text-primary-400 mb-6">
          <WifiOff className="w-4 h-4 text-primary-500 shrink-0" />
          <span>{t('works_offline')}</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-display font-black tracking-tight text-foreground leading-[1.05] max-w-4xl">
          {t('landing_title')}
        </h1>

        <p className="mt-6 text-sm sm:text-base text-earth-550 dark:text-earth-400 max-w-2xl leading-relaxed font-semibold">
          {t('landing_subtitle')}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 px-8 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-xs font-bold text-white shadow-xl shadow-primary-500/10 hover:shadow-2xl transition-all duration-300 cursor-pointer no-underline"
          >
            <span>{t('get_started')}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 px-8 rounded-xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 text-xs font-bold text-foreground hover:bg-earth-50 dark:hover:bg-earth-900/40 transition-all duration-300 cursor-pointer no-underline"
          >
            <span>Learn More</span>
          </a>
        </div>

        {/* Dynamic Sandbox Quick Access (Appears only when supabase is unconfigured/sandbox mode is active) */}
        {isSandbox && (
          <div className="mt-14 w-full max-w-2xl p-6 rounded-[24px] border border-primary-500/10 bg-white/50 dark:bg-[#111714]/40 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Sandbox Quick Access</span>
            </div>
            <p className="text-[11px] text-earth-500 dark:text-earth-400 max-w-md mx-auto">
              You are currently running in **Offline Sandbox Mode**. Click a role preset below to log in instantly.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/signup?prefill=farmer_1@vlink.com"
                className="p-3 rounded-2xl bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 hover:border-primary-500/40 text-center text-xs font-black text-foreground hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex flex-col items-center gap-1.5"
              >
                <span className="text-xl">👨‍🌾</span>
                <span>Farmer (farmer_1)</span>
              </Link>
              <Link
                href="/signup?prefill=buyer_1@vlink.com"
                className="p-3 rounded-2xl bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 hover:border-primary-500/40 text-center text-xs font-black text-foreground hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex flex-col items-center gap-1.5"
              >
                <span className="text-xl">🤝</span>
                <span>Buyer (buyer_1)</span>
              </Link>
              <Link
                href="/signup?prefill=labor_1@vlink.com"
                className="p-3 rounded-2xl bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 hover:border-primary-500/40 text-center text-xs font-black text-foreground hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex flex-col items-center gap-1.5"
              >
                <span className="text-xl">👷</span>
                <span>Labour (labor_1)</span>
              </Link>
              <Link
                href="/signup?prefill=admin@vlink.com"
                className="p-3 rounded-2xl bg-white dark:bg-[#151c19] border border-earth-200 dark:border-primary-950/20 hover:border-primary-500/40 text-center text-xs font-black text-foreground hover:shadow-md transition-all duration-300 no-underline cursor-pointer flex flex-col items-center gap-1.5"
              >
                <span className="text-xl">🛡️</span>
                <span>Admin</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Core Agriculture Features Preview */}
      <section id="features" className="px-6 py-20 bg-white/40 dark:bg-[#111714]/20 border-t border-earth-200/50 dark:border-primary-950/20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[9px] font-mono font-black uppercase text-primary-500 tracking-widest">Platform capabilities</span>
            <h2 className="text-3xl font-display font-black text-foreground tracking-tight">Everything you need to grow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-[22px] border border-earth-200/60 dark:border-primary-950/10 bg-white dark:bg-[#111714] shadow-xs hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm text-foreground">{t('landing_globe_title')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-450 leading-relaxed font-medium">
                  {t('landing_globe_desc')}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[22px] border border-earth-200/60 dark:border-primary-950/10 bg-white dark:bg-[#111714] shadow-xs hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm text-foreground">{t('landing_grants_title')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-450 leading-relaxed font-medium">
                  {t('landing_grants_desc')}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[22px] border border-earth-200/60 dark:border-primary-950/10 bg-white dark:bg-[#111714] shadow-xs hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm text-foreground">{t('landing_trade_title')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-450 leading-relaxed font-medium">
                  {t('landing_trade_desc')}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[22px] border border-earth-200/60 dark:border-primary-950/10 bg-white dark:bg-[#111714] shadow-xs hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm text-foreground">{t('landing_rentals_title')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-450 leading-relaxed font-medium">
                  {t('landing_rentals_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-earth-200/50 dark:border-primary-950/20 py-12 px-6 lg:px-16 bg-white dark:bg-[#0c120f] text-center transition-colors relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-primary-500 animate-pulse" />
          <span className="font-display font-black text-foreground">V-LINK</span>
        </div>
        <p className="text-xs text-earth-450 font-bold uppercase tracking-wider">
          © 2026 V-Link Agriculture Platform. Built to support Indian farming communities.
        </p>
      </footer>
    </div>
  );
}
