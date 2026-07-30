import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, Wifi, ChevronRight, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const { activeRole, setActiveRole, orders, deliveryJobs, laborJobs, language, setLanguage, isVisualMode, setIsVisualMode, theme, setTheme } = useApp();
  const { pathname } = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate dynamic path breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const isLast = idx === segments.length - 1;
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
      return (
        <React.Fragment key={seg}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-earth-300 dark:text-earth-700" />}
          <span className={isLast ? 'text-foreground font-semibold' : 'text-earth-400 font-medium'}>
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
          text: `New order #${ord.id} received for ${ord.quantity}kg of ${ord.productName}.`,
          time: 'Just now',
          type: 'info'
        });
      } else if (ord.status === 'accepted') {
        alerts.push({
          id: `ord-a-${index}`,
          text: `Order #${ord.id} (${ord.productName}) accepted for delivery.`,
          time: '5m ago',
          type: 'success'
        });
      } else if (ord.status === 'delivered') {
        alerts.push({
          id: `ord-d-${index}`,
          text: `Order #${ord.id} successfully delivered! Payouts released.`,
          time: '30m ago',
          type: 'success'
        });
      }
    });

    // Labor jobs alerts
    laborJobs.slice(0, 2).forEach((job, index) => {
      if (job.status === 'applied') {
        alerts.push({
          id: `lab-a-${index}`,
          text: `Workforce alert: ${job.applicantsCount} workers applied for "${job.title}".`,
          time: '12m ago',
          type: 'info'
        });
      }
    });

    // Delivery jobs alerts
    const openDeliveries = deliveryJobs.filter(j => j.status === 'available');
    if (openDeliveries.length > 0) {
      alerts.push({
        id: 'del-av',
        text: `Logistics Dispatch: ${openDeliveries.length} delivery routes waiting for pickup.`,
        time: 'Just now',
        type: 'warn'
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'welcome',
        text: 'Welcome to V-LINK R-COS. System fully operational.',
        time: '1h ago',
        type: 'success'
      });
    }

    return alerts;
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 border-b border-[#e6eae7] dark:border-[#232a26] bg-white/70 dark:bg-[#141816]/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-xs">
        {getBreadcrumbs()}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Network connection diagnostic */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary-500/10 bg-primary-50/50 dark:bg-primary-950/20 text-[10px] font-mono text-primary-600 dark:text-primary-400">
          <Wifi className="w-3 h-3 animate-pulse text-primary-500" />
          <span>SYS ONLINE</span>
          <span className="opacity-40">|</span>
          <span>12ms</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100 dark:hover:bg-earth-900/40 rounded-lg cursor-pointer border-0 bg-transparent"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications Icon and Tray */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100 dark:hover:bg-earth-900/40 rounded-lg relative cursor-pointer border-0 bg-transparent"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-stone-900" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay Backdrop to dismiss */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-[#e6eae7] dark:border-[#232a26] pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-earth-400">
                    System Feed
                  </h4>
                  <span className="text-[10px] font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded">
                    {notifications.length} Active
                  </span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs border-b border-earth-100 dark:border-earth-900/40 last:border-0 pb-2.5">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          n.type === 'success' ? 'bg-primary-500' : n.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <p className="font-medium text-foreground leading-relaxed flex-1 ml-1">{n.text}</p>
                      </div>
                      <span className="text-[10px] text-earth-400 block text-right font-mono">{n.time}</span>
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
            className="h-8 px-2.5 pr-6 rounded-xl text-xs font-bold bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500/30 appearance-none"
          >
            <option value="ta" className="text-foreground bg-white dark:bg-[#141816]">தமிழ்</option>
            <option value="en" className="text-foreground bg-white dark:bg-[#141816]">EN</option>
            <option value="hi" className="text-foreground bg-white dark:bg-[#141816]">हिंदी</option>
          </select>
          <div className="pointer-events-none absolute right-2 flex items-center opacity-60">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Pictorial / Visual Mode Switcher */}
        <button
          onClick={() => setIsVisualMode(!isVisualMode)}
          className={`h-8 px-2.5 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
            isVisualMode
              ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
              : 'bg-white hover:bg-earth-50/50 dark:bg-[#141816] dark:hover:bg-earth-900/40 border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400'
          }`}
          title={isVisualMode ? "Switch to Text Mode" : "Switch to Visual / Pictorial Mode"}
        >
          <span className="text-[10px] hidden sm:inline">{isVisualMode ? "Text Mode" : "Visual Mode"}</span>
          <span className="text-sm">🖼️</span>
        </button>

        {/* Action button */}
        <div className="h-8 w-px bg-[#e6eae7] dark:bg-[#232a26]" />
        
        {/* User Role Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className={`px-3 py-1 pr-6 rounded-full text-xs font-semibold uppercase tracking-wider appearance-none cursor-pointer border border-transparent focus:outline-none focus:ring-1 focus:ring-primary-500/30 ${
                activeRole === 'farmer' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' :
                activeRole === 'buyer' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' :
                activeRole === 'delivery' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                'bg-stone-100 dark:bg-stone-950/40 text-stone-800 dark:text-stone-300'
              }`}
            >
              <option value="farmer" className="text-foreground bg-white dark:bg-[#141816]">Farmer</option>
              <option value="buyer" className="text-foreground bg-white dark:bg-[#141816]">Buyer</option>
              <option value="delivery" className="text-foreground bg-white dark:bg-[#141816]">Logistics</option>
              <option value="labor" className="text-foreground bg-white dark:bg-[#141816]">Labor</option>
            </select>
            <div className="pointer-events-none absolute right-2 flex items-center opacity-60">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
