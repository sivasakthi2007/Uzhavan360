'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, Wifi, ChevronRight, Sun, Moon, Laptop, Eye } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { activeRole, setActiveRole, orders, laborJobs, language, setLanguage, isVisualMode, setIsVisualMode, theme, setTheme, t } = useApp();
  const pathname = usePathname() || '';
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate dynamic path breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const isLast = idx === segments.length - 1;
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
      return (
        <React.Fragment key={seg}>
          {idx > 0 && <ChevronRight className="w-3 h-3 text-earth-300 dark:text-earth-800" />}
          <span className={`font-mono text-[10px] tracking-widest uppercase ${isLast ? 'text-foreground font-black' : 'text-earth-400'}`}>
            {formatted}
          </span>
        </React.Fragment>
      );
    });
  };

  // Compile notifications based on dynamic states
  const getNotifications = () => {
    const alerts: { id: string; text: string; time: string; type: 'info' | 'success' | 'warn' }[] = [];

    // Order status alerts
    orders.slice(0, 3).forEach((ord, index) => {
      if (ord.status === 'pending') {
        alerts.push({
          id: `ord-p-${index}`,
          text: (t('new_order_received_msg') || 'New order #{id} received for {qty}kg of {name}.')
            .replace('{id}', ord.id)
            .replace('{qty}', ord.quantity.toString())
            .replace('{name}', ord.productName),
          time: 'Just now',
          type: 'info'
        });
      } else if (ord.status === 'accepted') {
        alerts.push({
          id: `ord-a-${index}`,
          text: (t('order_confirmed_msg') || 'Order #{id} ({productName}) confirmed by farmer.')
            .replace('{id}', ord.id)
            .replace('{productName}', ord.productName),
          time: '5m ago',
          type: 'success'
        });
      } else if (ord.status === 'completed') {
        alerts.push({
          id: `ord-d-${index}`,
          text: (t('order_completed_msg') || 'Order #{id} successfully completed! Escrow funds released.')
            .replace('{id}', ord.id),
          time: '30m ago',
          type: 'success'
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: 'welcome',
        text: t('welcome_alert') || 'Welcome to V-LINK. System fully operational.',
        time: '1h ago',
        type: 'success'
      });
    }

    return alerts;
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 border border-earth-200/50 dark:border-primary-950/20 bg-white/70 dark:bg-[#111714]/75 backdrop-blur-xl px-6 flex items-center justify-between sticky top-4 z-40 rounded-[20px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)] transition-all duration-300 mx-4 md:mx-6 mt-4">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-1.5 text-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1.5"></div>
        {getBreadcrumbs()}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3">
        
        {/* Network connection diagnostic */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary-500/10 bg-primary-500/5 dark:bg-primary-500/10 text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-primary-500" />
          <span>SYS ONLINE</span>
          <span className="opacity-45">·</span>
          <span>12MS</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-9 h-9 flex items-center justify-center text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100/60 dark:hover:bg-earth-900/40 rounded-xl cursor-pointer border-0 bg-transparent transition-colors duration-200"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications Icon and Tray */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100/60 dark:hover:bg-earth-900/40 rounded-xl relative cursor-pointer border-0 bg-transparent transition-colors duration-200"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111714]" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay Backdrop to dismiss */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-80 rounded-[20px] border border-earth-200 dark:border-primary-950/30 bg-white dark:bg-[#111714] shadow-xl p-5 z-50 animate-scale-up">
                <div className="flex items-center justify-between mb-4 border-b border-earth-100 dark:border-earth-900/30 pb-2.5">
                  <h4 className="text-[9px] font-mono font-black uppercase tracking-widest text-earth-450">
                    {t('system_feed') || 'System Feed'}
                  </h4>
                  <span className="text-[9px] font-mono font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                    {notifications.length} {t('active') || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs border-b border-earth-100 dark:border-earth-900/10 last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          n.type === 'success' ? 'bg-primary-500' : n.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <p className="font-semibold text-foreground leading-relaxed flex-1">{n.text}</p>
                      </div>
                      <span className="text-[9px] text-earth-400 block text-right font-mono font-bold">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative flex items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="h-9 px-3 pr-7 rounded-xl text-[10px] font-mono font-black bg-earth-50 dark:bg-earth-950/40 border border-earth-200 dark:border-primary-950/20 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/20 appearance-none uppercase"
          >
            <option value="ta" className="text-foreground bg-white dark:bg-[#111714]">தமிழ்</option>
            <option value="en" className="text-foreground bg-white dark:bg-[#111714]">EN</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 flex items-center opacity-55">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Pictorial / Visual Mode Switcher */}
        <button
          onClick={() => setIsVisualMode(!isVisualMode)}
          className={`h-9 px-3.5 rounded-xl border text-[10px] font-mono font-black cursor-pointer flex items-center gap-1.5 transition-all duration-300 ${
            isVisualMode
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/10'
              : 'bg-white hover:bg-earth-50 dark:bg-[#111714] dark:hover:bg-earth-900/40 border-earth-200 dark:border-primary-950/20 text-earth-500 dark:text-earth-400'
          }`}
          title={isVisualMode ? "Switch to Text Mode" : "Switch to Visual / Pictorial Mode"}
        >
          <span className="hidden sm:inline">{isVisualMode ? "TEXT" : "VISUAL"}</span>
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-earth-200 dark:bg-earth-900 mx-1" />
        
        {/* User Role Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className={`px-3.5 py-1.5 pr-7 rounded-xl text-[10px] font-mono font-black tracking-widest appearance-none cursor-pointer border border-earth-200/50 dark:border-primary-950/10 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all ${
                activeRole === 'farmer' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                activeRole === 'buyer' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                activeRole === 'labor' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                activeRole === 'admin' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                'bg-earth-500/10 text-earth-600 dark:text-earth-400'
              }`}
            >
              <option value="farmer" className="text-foreground bg-white dark:bg-[#111714]">Farmer</option>
              <option value="buyer" className="text-foreground bg-white dark:bg-[#111714]">Buyer</option>
              <option value="labor" className="text-foreground bg-white dark:bg-[#111714]">Labor</option>
              <option value="vendor" className="text-foreground bg-white dark:bg-[#111714]">Owner</option>
              <option value="admin" className="text-foreground bg-white dark:bg-[#111714]">Admin</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 flex items-center opacity-60">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
