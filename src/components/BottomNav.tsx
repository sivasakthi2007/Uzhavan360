'use client';

import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
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
import { usePathname, useSearchParams } from 'next/navigation';

export default function BottomNav() {
  const { activeRole, t } = useApp();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'market';

  // Base navigation items definitions
  const allNavItems = [
    { name: t('nav_short_market') || 'Market', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market', roles: ['farmer', 'buyer'] },
    { name: t('my_farm_tab') || 'My Farm', icon: Sprout, path: '/dashboard?tab=myfarm', tabKey: 'myfarm', roles: ['farmer'] },
    { name: t('nav_short_intel') || 'Prices', icon: LayoutDashboard, path: '/dashboard?tab=home', tabKey: 'home', roles: ['farmer', 'buyer'] },
    { name: t('disease_tab') || 'Diagnosis', icon: HeartPulse, path: '/dashboard?tab=diagnosis', tabKey: 'diagnosis', roles: ['farmer'] },
    { name: t('schemes_tab') || 'Schemes', icon: BookOpen, path: '/dashboard?tab=schemes', tabKey: 'schemes', roles: ['farmer'] },
    { name: t('nav_short_rentals') || 'Rentals', icon: Wrench, path: '/dashboard?tab=rentals', tabKey: 'rentals', roles: ['farmer', 'vendor'] },
    { name: t('nav_short_labor') || 'Labor', icon: Users, path: '/dashboard?tab=labor', tabKey: 'labor', roles: ['farmer', 'labor'] },
    { name: t('nav_short_weather') || 'Weather', icon: CloudSun, path: '/dashboard?tab=weather', tabKey: 'weather', roles: ['farmer'] },
    { name: t('nav_short_assistant') || 'AI Help', icon: Bot, path: '/dashboard?tab=assistant', tabKey: 'assistant', roles: ['farmer'] },
    { name: t('nav_short_support') || 'Support', icon: Headset, path: '/dashboard?tab=support', tabKey: 'support', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: t('nav_short_admin') || 'Admin', icon: ShieldAlert, path: '/dashboard?tab=admin', tabKey: 'admin', roles: ['admin'] }
  ];

  // Filter items matching current active role workspace
  const navItems = allNavItems.filter(item => item.roles.includes(activeRole));

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <nav className="w-full max-w-md h-16 bg-white/80 dark:bg-[#111714]/85 backdrop-blur-xl border border-earth-200/50 dark:border-primary-950/20 rounded-[22px] flex items-center justify-around px-2 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-12 rounded-[16px] py-1 transition-all duration-350 ${
                isActive
                  ? 'text-primary-500 dark:text-primary-400 font-black scale-102 bg-primary-500/5 dark:bg-primary-500/10'
                  : 'text-earth-450 dark:text-earth-500 hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary-500 dark:text-primary-400 scale-110' : 'text-earth-450 group-hover:text-primary-500'}`} />
              <span className="text-[8px] mt-1 font-black tracking-widest uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
