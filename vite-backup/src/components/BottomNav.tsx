import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  User 
} from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function BottomNav() {
  const { t } = useApp();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'home';

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/dashboard?tab=home', tabKey: 'home' },
    { name: 'Market', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market' },
    { name: 'Services', icon: Layers, path: '/dashboard?tab=services', tabKey: 'services' },
    { name: 'Profile', icon: User, path: '/dashboard?tab=profile', tabKey: 'profile' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#141816]/95 backdrop-blur-md border-t border-[#e6eae7] dark:border-[#232a26] flex items-center justify-around px-2 z-50 shadow-lg transition-colors">
      {navItems.map((item) => {
        const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 ${
              isActive
                ? 'text-primary-500 dark:text-primary-400 font-black scale-105'
                : 'text-earth-400 dark:text-earth-500 hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-earth-400'}`} />
            <span className="text-[9px] mt-1 font-extrabold tracking-wide uppercase">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
