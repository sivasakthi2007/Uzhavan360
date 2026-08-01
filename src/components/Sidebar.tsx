'use client';

import { useApp } from '@/context/AppContext';
import {
  Home,
  Sprout,
  ShoppingBag,
  Package,
  Users,
  CloudSun,
  Bot,
  ClipboardList,
  Wallet,
  BookOpen,
  Headset,
  User,
  ShieldAlert,
  Leaf,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const { userName, logout, activeRole, t, isOffline, language } = useApp();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get('tab') || 'home';

  // Primary navigation items
  const primaryNavItems = [
    { name: language === 'ta' ? 'முகப்பு' : 'Home', icon: Home, path: '/dashboard?tab=home', tabKey: 'home', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'என் பண்ணை' : 'My Farm', icon: Sprout, path: '/dashboard?tab=myfarm', tabKey: 'myfarm', roles: ['farmer'] },
    { name: language === 'ta' ? 'பயிர் சந்தை' : 'Crop Market', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market', roles: ['farmer', 'buyer'] },
    { name: language === 'ta' ? 'முன்-பதிவுகள்' : 'Pre-Bookings', icon: Package, path: '/dashboard?tab=prebookings', tabKey: 'prebookings', roles: ['farmer', 'buyer'] },
    { name: language === 'ta' ? 'வேலைவாய்ப்பு' : 'Labour Exchange', icon: Users, path: '/dashboard?tab=labor', tabKey: 'labor', roles: ['farmer', 'labor'] },
    { name: language === 'ta' ? 'வானிலை' : 'Weather', icon: CloudSun, path: '/dashboard?tab=weather', tabKey: 'weather', roles: ['farmer'] },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { name: language === 'ta' ? 'AI உதவியாளர்' : 'AI Assistant', icon: Bot, path: '/dashboard?tab=assistant', tabKey: 'assistant', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'ஆர்டர்கள்' : 'Orders', icon: ClipboardList, path: '/dashboard?tab=orders', tabKey: 'orders', roles: ['farmer', 'buyer'] },
    { name: language === 'ta' ? 'பணப்பை' : 'Wallet', icon: Wallet, path: '/dashboard?tab=wallet', tabKey: 'wallet', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'அரசு திட்டங்கள்' : 'Gov Schemes', icon: BookOpen, path: '/dashboard?tab=schemes', tabKey: 'schemes', roles: ['farmer'] },
    { name: language === 'ta' ? 'உதவி மையம்' : 'Support', icon: Headset, path: '/dashboard?tab=support', tabKey: 'support', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'சுயவிவரம்' : 'Profile', icon: User, path: '/dashboard?tab=profile', tabKey: 'profile', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: t('admin_tab') || 'Admin Console', icon: ShieldAlert, path: '/dashboard?tab=admin', tabKey: 'admin', roles: ['admin'] }
  ];

  const filteredPrimary = primaryNavItems.filter(item => item.roles.includes(activeRole) || activeRole === 'admin');
  const filteredSecondary = secondaryNavItems.filter(item => item.roles.includes(activeRole) || activeRole === 'admin');

  return (
    <aside className="hidden md:flex w-72 flex-col h-screen shrink-0 p-5 bg-[#f7f9f6] dark:bg-[#090e0c] transition-colors duration-300">
      <div className="flex-1 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-earth-150/40 dark:border-earth-900/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-lg shadow-primary-500/10">
            <Leaf className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-foreground block">V-LINK</span>
            <span className="text-[8px] block font-mono text-primary-500 font-extrabold uppercase tracking-widest -mt-0.5">{t('platform_tagline')}</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4">
          <div className="p-3 rounded-2xl bg-earth-50/50 dark:bg-earth-950/40 border border-earth-100/40 dark:border-earth-900/20 flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-headline font-bold text-sm shrink-0">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-foreground truncate">{userName || 'User'}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                <span className="text-[8px] text-earth-400 font-black uppercase tracking-wider">{activeRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {/* Primary Group */}
          {filteredPrimary.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[9px] font-mono font-black text-earth-450 uppercase tracking-widest block mb-2">
                {language === 'ta' ? 'முக்கிய சேவைகள்' : 'Primary Services'}
              </span>
              {filteredPrimary.map((item) => {
                const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 no-underline group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/10 scale-102 font-black'
                        : 'text-earth-500 dark:text-earth-400 hover:bg-earth-100/50 dark:hover:bg-earth-900/40 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-earth-400 group-hover:text-primary-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Secondary Group */}
          {filteredSecondary.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[9px] font-mono font-black text-earth-450 uppercase tracking-widest block mb-2">
                {language === 'ta' ? 'இதர சேவைகள்' : 'Other Services'}
              </span>
              {filteredSecondary.map((item) => {
                const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 no-underline group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/10 scale-102 font-black'
                        : 'text-earth-500 dark:text-earth-400 hover:bg-earth-100/50 dark:hover:bg-earth-900/40 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-earth-400 group-hover:text-primary-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-earth-150/40 dark:border-earth-900/10 bg-earth-50/20 dark:bg-earth-950/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOffline ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-mono font-bold text-amber-500 tracking-wider">
                  {language === 'ta' ? 'உள்ளூர்' : 'OFFLINE'}
                </span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-[9px] font-mono font-bold text-primary-500 tracking-wider">
                  {language === 'ta' ? 'இணைக்கப்பட்டது' : 'ONLINE'}
                </span>
              </>
            )}
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="h-8 px-3 rounded-xl hover:bg-red-500/10 text-earth-450 hover:text-red-500 border border-transparent hover:border-red-500/20 bg-transparent flex items-center gap-1.5 font-black text-[10px] cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
