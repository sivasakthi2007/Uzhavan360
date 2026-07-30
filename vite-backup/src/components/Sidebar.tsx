import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  User, 
  Leaf, 
  LogOut,
  Wallet
} from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function Sidebar() {
  const { activeRole, wallets, userName, t, logout } = useApp();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'home';

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/dashboard?tab=home', tabKey: 'home' },
    { name: 'Market', icon: ShoppingBag, path: '/dashboard?tab=market', tabKey: 'market' },
    { name: 'Services', icon: Layers, path: '/dashboard?tab=services', tabKey: 'services' },
    { name: 'Profile', icon: User, path: '/dashboard?tab=profile', tabKey: 'profile' }
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] flex-col h-full shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#e6eae7] dark:border-[#232a26] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="p-1.5 rounded-lg bg-primary-500 text-white shadow-sm flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-primary-500 block">V-LINK</span>
            <span className="text-[9px] block font-mono text-earth-400 uppercase tracking-widest -mt-1.5">SaaS R-COS</span>
          </div>
        </Link>
        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 uppercase tracking-wider">
          {activeRole}
        </span>
      </div>

      {/* Profile summary card */}
      <div className="px-4 pt-5 pb-2">
        <Link 
          to="/dashboard?tab=profile"
          className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950/30 border border-earth-200/50 dark:border-earth-900/40 flex items-center gap-3 hover:bg-earth-100 dark:hover:bg-earth-900/50 transition-all duration-200 cursor-pointer group no-underline block"
        >
          <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <User className="w-5 h-5 text-current" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary-500 transition-colors">{userName}</h4>
            <span className="text-[9px] text-earth-400 font-bold block uppercase mt-0.5 tracking-wider">{activeRole} mode</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <span className="text-[9px] font-mono font-bold text-earth-400 uppercase tracking-widest block px-3 mb-2">
          OPERATOR CORE
        </span>
        {navItems.map((item) => {
          const isActive = pathname === '/dashboard' && activeTab === item.tabKey;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-200 no-underline ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10 scale-102'
                  : 'text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900/40 hover:text-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-earth-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Summary */}
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
          <Wallet className="w-20 h-20" />
        </div>
        <span className="text-[9px] text-primary-100 uppercase tracking-widest font-bold block mb-1">
          {t('wallet')}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black font-mono">₹{wallets[activeRole]?.toLocaleString('en-IN') || '0'}</span>
          <span className="text-[9px] font-bold text-primary-100">INR</span>
        </div>
        <span className="text-[8px] text-primary-200 block mt-2 border-t border-white/10 pt-1.5 font-bold uppercase tracking-wider">
          Secured Escrow Ledger
        </span>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-[#e6eae7] dark:border-[#232a26] flex items-center justify-between bg-earth-50/20 dark:bg-earth-950/10">
        <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">
          Session Active
        </span>
        <button 
          onClick={async () => {
            await logout();
            navigate('/auth');
          }}
          className="p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer border-0 bg-transparent flex items-center gap-1.5 font-bold text-xs"
          title={t('logout')}
        >
          <LogOut className="w-4 h-4 text-current" />
          <span>Exit</span>
        </button>
      </div>
    </aside>
  );
}
