'use client';

import { useApp } from '@/context/AppContext';
import {
  Home,
  Sprout,
  ShoppingBag,
  ClipboardList,
  Bot,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function BottomNav() {
  const { activeRole, language } = useApp();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'home';

  // Base navigation items definitions for mobile - exactly 5 tabs
  const allNavItems = [
    { name: language === 'ta' ? 'முகப்பு' : 'Home', icon: Home, path: '/dashboard?tab=home', tabKey: 'home', highlightKeys: ['home', 'crop-discovery'], roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'என் பண்ணை' : 'My Farm', icon: Sprout, path: '/dashboard?tab=myfarm', tabKey: 'myfarm', highlightKeys: ['myfarm'], roles: ['farmer'] },
    { name: language === 'ta' ? 'வாங்கு/விற்று' : 'Buy/Sell', icon: ShoppingBag, path: '/dashboard?tab=buysell', tabKey: 'buysell', highlightKeys: ['buysell', 'market', 'rentals', 'labor'], roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'உதவியாளர்' : 'AI Assistant', icon: Bot, path: '/dashboard?tab=assistant', tabKey: 'assistant', highlightKeys: ['assistant'], roles: ['farmer', 'buyer', 'labor', 'vendor'] },
    { name: language === 'ta' ? 'இதர' : 'More', icon: Menu, path: '/dashboard?tab=more', tabKey: 'more', highlightKeys: ['more', 'orders', 'translator', 'weather', 'wallet', 'profile', 'schemes', 'support', 'admin'], roles: ['farmer', 'buyer', 'labor', 'vendor'] },
  ];

  // Filter items matching current active role workspace
  const navItems = allNavItems.filter(item => item.roles.includes(activeRole) || activeRole === 'admin');

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-fade-in">
      <nav className="w-full max-w-md h-16 bg-white/95 dark:bg-[#111714]/95 backdrop-blur-xl border border-earth-200/50 dark:border-primary-950/20 rounded-[22px] flex items-center justify-around px-2 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === '/dashboard' && item.highlightKeys.includes(activeTab);
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
