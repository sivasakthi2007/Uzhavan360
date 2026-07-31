'use client';

import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Leaf,
  LogOut,
  Wrench,
  Users,
  ShieldAlert,
  HeartPulse,
  Sprout,
  CloudSun,
  Bot,
  Headset
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const { userName, logout, activeRole, t, isOffline } = useApp();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get('tab') || 'market';

  // Base navigation items definitions
  const allNavItems = [
    { name: t('sales_tab') || 'Marketplace', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market', roles: ['farmer', 'buyer'] },
    { name: t('my_farm_tab') || 'My Farm', icon: Sprout, path: '/dashboard?tab=myfarm', tabKey: 'myfarm', roles: ['farmer'] },
    { name: t('intel_tab') || 'Market Prices', icon: LayoutDashboard, path: '/dashboard?tab=home', tabKey: 'home', roles: ['farmer', 'buyer'] },
    { name: t('disease_tab') || 'Crop Diagnosis', icon: HeartPulse, path: '/dashboard?tab=diagnosis', tabKey: 'diagnosis', roles: ['farmer'] },
    { name: t('schemes_tab') || 'Gov Schemes', icon: BookOpen, path: '/dashboard?tab=schemes', tabKey: 'schemes', roles: ['farmer'] },
    { name: t('rentals_tab') || 'Equipment Rental', icon: Wrench, path: '/dashboard?tab=rentals', tabKey: 'rentals', roles: ['farmer', 'vendor'] },
    { name: t('labor_tab') || 'Labor Board', icon: Users, path: '/dashboard?tab=labor', tabKey: 'labor', roles: ['farmer', 'labor'] },
    { name: t('weather_tab') || 'Weather', icon: CloudSun, path: '/dashboard?tab=weather', tabKey: 'weather', roles: ['farmer'] },
    { name: t('ai_assistant_tab') || 'AI Assistant', icon: Bot, path: '/dashboard?tab=assistant', tabKey: 'assistant', roles: ['farmer'] },
    { name: t('support_tab') || 'Customer Care', icon: Headset, path: '/dashboard?tab=support', tabKey: 'support', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: t('admin_tab') || 'Admin Console', icon: ShieldAlert, path: '/dashboard?tab=admin', tabKey: 'admin', roles: ['admin'] }
  ];

  // Filter items matching current active role workspace
  const navItems = allNavItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="hidden md:flex w-72 flex-col h-screen shrink-0 p-5 bg-[#f7f9f6] dark:bg-[#090e0c] transition-colors duration-300">
      {/* Floating Glass Container */}
      <div className="flex-1 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-earth-150/40 dark:border-earth-900/10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-lg shadow-primary-500/10">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-foreground block">V-LINK</span>
            <span className="text-[9px] block font-mono text-primary-500 font-extrabold uppercase tracking-widest -mt-0.5">{t('platform_tagline')}</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4">
          <div className="p-3.5 rounded-2xl bg-earth-50/50 dark:bg-earth-950/40 border border-earth-100/40 dark:border-earth-900/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-headline font-bold text-sm shrink-0">
              {userName?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-foreground truncate">{userName || 'User'}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                <span className="text-[9px] text-earth-400 font-black uppercase tracking-wider">{activeRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[9px] font-mono font-black text-earth-450 uppercase tracking-widest">
              Navigation
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-earth-100 dark:bg-earth-900 text-[8px] font-bold text-earth-400">
              {navItems.length}
            </span>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 no-underline group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/10 scale-102 font-black'
                    : 'text-earth-500 dark:text-earth-400 hover:bg-earth-100/60 dark:hover:bg-earth-900/40 hover:text-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-earth-400 group-hover:text-primary-500'}`} />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-earth-150/40 dark:border-earth-900/10 bg-earth-50/20 dark:bg-earth-950/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOffline ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-mono font-bold text-amber-500 tracking-wider">
                  {t('sync_status_offline')}
                </span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></div>
                <span className="text-[9px] font-mono font-bold text-primary-500 tracking-wider">
                  {t('sync_status_online')}
                </span>
              </>
            )}
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="h-8 px-3 rounded-xl hover:bg-red-500/10 text-earth-450 hover:text-red-500 border border-transparent hover:border-red-500/20 bg-transparent flex items-center gap-1.5 font-black text-[10px] cursor-pointer transition-all duration-350"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
