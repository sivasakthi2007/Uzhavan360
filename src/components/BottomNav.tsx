'use client';

import { useApp } from '@/context/AppContext';
import {
  Home,
  Sprout,
  ShoppingBag,
  Package,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function BottomNav() {
  const { activeRole, language } = useApp();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'home';

  // Base navigation items definitions for mobile
  const allNavItems = [
    { name: language === 'ta' ? 'முகப்பு' : 'Home', icon: Home, path: '/dashboard?tab=home', tabKey: 'home', roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'பண்ணை' : 'Farm', icon: Sprout, path: '/dashboard?tab=myfarm', tabKey: 'myfarm', roles: ['farmer'] },
    { name: language === 'ta' ? 'சந்தை' : 'Market', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market', roles: ['farmer', 'buyer'] },
    { name: language === 'ta' ? 'பதிவு' : 'Bookings', icon: Package, path: '/dashboard?tab=prebookings', tabKey: 'prebookings', roles: ['farmer', 'buyer'] },
    { name: language === 'ta' ? 'வேலை' : 'Labour', icon: Users, path: '/dashboard?tab=labor', tabKey: 'labor', roles: ['farmer', 'labor'] },
  ];

  // Filter items matching current active role workspace
  const navItems = allNavItems.filter(item => item.roles.includes(activeRole) || activeRole === 'admin');

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <nav className="w-full max-w-md h-16 bg-white/90 dark:bg-[#111714]/90 backdrop-blur-xl border border-earth-200/50 dark:border-primary-950/20 rounded-[22px] flex items-center justify-around px-2 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-12 rounded-[16px] py-1 transition-all duration-350 min-h-[48px] ${
                isActive
                  ? 'text-primary-500 dark:text-primary-400 font-black scale-102 bg-primary-500/5 dark:bg-primary-500/10'
                  : 'text-earth-450 dark:text-earth-500 hover:text-foreground'
              }`}
              style={{ minHeight: '48px' }}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary-500 dark:text-primary-400 scale-110' : 'text-earth-450'}`} />
              <span className="text-[8px] mt-1 font-black tracking-wider uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
