
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Users, 
  ArrowUpRight, 
  CheckCircle,
  Database,
  Globe,
  Activity,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export default function LandingPage() {
  const { theme, setTheme } = useApp();
  const stats = [
    { label: 'Active Farmers onboarded', value: '18,400+', icon: Leaf, change: '+12.4% MoM' },
    { label: 'Total Transaction Volume cleared', value: '₹14.8 Cr', icon: ShieldCheck, change: '100% Escrow safe' },
    { label: 'Logistics SLA Delivery rate', value: '98.6%', icon: Truck, change: 'Avg 22 hours transit' },
    { label: 'Active Agricultural districts', value: '42 Districts', icon: Globe, change: 'Tamil Nadu & Maharashtra' },
  ];

  const roles = [
    {
      title: 'Farmer',
      desc: 'Sell crop produce at fair market rates directly to institutional buyers. Eliminate commission agents and middle-men.',
      badge: 'Aggregator Interface',
      features: ['Real-time market insights', 'Instant wallet settlement', 'Hire verified farm workers'],
      color: 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500/50',
      icon: Leaf,
      iconColor: 'text-emerald-500',
      roleKey: 'farmer'
    },
    {
      title: 'Wholesale Buyer',
      desc: 'Source verified crops from verified farms with location tags. Automate contract fulfillment and trace source origins.',
      badge: 'Retail & Hospitality B2B',
      features: ['Direct farmer contracts', 'Location-based crop discovery', 'Integrated escrow clearing'],
      color: 'border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-500/50',
      icon: Database,
      iconColor: 'text-blue-500',
      roleKey: 'buyer'
    },
    {
      title: 'Delivery Partner',
      desc: 'Earn regular income by fulfilling automatic dispatch routes. Student-friendly logistics network for rural areas.',
      badge: 'Logistics Network',
      features: ['Optimized transit routes', 'Clear wage payouts', 'Proof of delivery scanner'],
      color: 'border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-500/50',
      icon: Truck,
      iconColor: 'text-amber-500',
      roleKey: 'delivery'
    },
    {
      title: 'Labor Worker',
      desc: 'Find verified farm jobs near you with fixed wage rates. Track earnings history and build professional farm profiles.',
      badge: 'Workforce Hub',
      features: ['Daily wage transparency', 'Verified farm job postings', 'Flexible seasonal schedules'],
      color: 'border-stone-500/20 bg-stone-50/20 dark:bg-stone-950/10 hover:border-stone-500/50',
      icon: Users,
      iconColor: 'text-stone-500',
      roleKey: 'labor'
    }
  ];

  return (
    <div className="flex-1 bg-[#fcfdfc] dark:bg-[#111613] flex flex-col font-sans min-h-screen">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-[#e6eae7] dark:border-[#26332a] px-6 lg:px-16 flex items-center justify-between sticky top-0 z-50 bg-[#fcfdfc]/80 dark:bg-[#111613]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary-500 text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">V-LINK</span>
            <span className="text-[10px] block font-mono text-earth-400 uppercase tracking-widest -mt-1.5">RURAL OPERATING SYSTEM</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            V-LINK Network Active (Sandbox Mode)
          </span>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100 dark:hover:bg-earth-900/40 rounded-xl cursor-pointer border-0 bg-transparent"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <Link 
            to="/agrigravity"
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-750 hover:to-green-750 text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch AgriGravity UI</span>
          </Link>

          <Link 
            to="/auth"
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-[#f3f4f6] dark:bg-[#1f2937] hover:bg-earth-100 dark:hover:bg-earth-800 text-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center"
          >
            <span>Launch Sandbox Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-24 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary-500/10 bg-primary-50/50 dark:bg-primary-950/20 text-xs font-semibold text-primary-700 dark:text-primary-400 mb-6">
          <Activity className="w-3.5 h-3.5" />
          <span>Bridging The Agriculture Trading Gap</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1] max-w-4xl">
          The Next-Gen Operating System for <span className="text-primary-500 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">Rural Commerce</span>
        </h1>
        
        <p className="mt-6 text-base sm:text-lg text-earth-500 dark:text-earth-400 max-w-2xl leading-relaxed">
          V-LINK replaces fragmented middlemen networks with an integrated digital ecosystem. Connecting farmers directly to wholesale markets, optimized student logistics dispatch, and local agricultural workforces.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/agrigravity"
            className="h-12 flex items-center justify-center gap-2 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            <span>Launch AgriGravity Super App</span>
          </Link>
          <Link
            to="/auth"
            className="h-12 flex items-center justify-center gap-2 px-8 rounded-xl border border-earth-200 dark:border-earth-800 text-sm font-bold text-foreground hover:bg-earth-50 dark:hover:bg-earth-900/40 transition-all duration-200 cursor-pointer"
          >
            <span>Enter SaaS Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stat Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full border-y border-[#e6eae7] dark:border-[#232a26]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-earth-400">
                    {s.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {s.value}
                  </h3>
                  <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">
                    {s.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles / Ecosystem Architecture */}
      <section id="architecture" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Unified Four-Role SaaS Ecosystem</h2>
          <p className="text-sm text-earth-500 dark:text-earth-400 mt-2 max-w-xl mx-auto">
            V-LINK aggregates all operations of rural commerce into one workflow loop, giving each user role a customized interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${r.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl bg-white dark:bg-[#1c201e] shadow-sm ${r.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-earth-400 border border-earth-200 dark:border-earth-800 px-1.5 py-0.5 rounded bg-white dark:bg-[#1c201e]">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground tracking-tight">{r.title}</h3>
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-2.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-dashed border-earth-200 dark:border-earth-800">
                  <ul className="space-y-2">
                    {r.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-[11px] text-foreground font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={`/auth?role=${r.roleKey}`}
                    className="mt-6 w-full flex items-center justify-between py-2 px-4 rounded-xl text-xs font-bold border border-primary-500/10 bg-white dark:bg-[#141816] hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 cursor-pointer"
                  >
                    <span>Enter Console</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Workflow Simulation Preview */}
      <section className="px-6 py-20 bg-earth-50/50 dark:bg-earth-950/20 border-t border-earth-100 dark:border-earth-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-foreground tracking-tight">The Escrow Settlement Loop</h2>
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-1">
            🌾 Zero Middlemen, Instant Settlement
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-12 text-left relative">
            
            <div className="p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm relative">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs mb-3">1</span>
              <h4 className="font-bold text-xs text-foreground">Produce Listed</h4>
              <p className="text-[10px] text-earth-400 mt-1">Farmer lists harvest with pricing & geolocation.</p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm relative">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs mb-3">2</span>
              <h4 className="font-bold text-xs text-foreground">Escrow Funded</h4>
              <p className="text-[10px] text-earth-400 mt-1">Buyer buys crop; funds are lock-escrowed instantly.</p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm relative">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs mb-3">3</span>
              <h4 className="font-bold text-xs text-foreground">Logistics Dispatch</h4>
              <p className="text-[10px] text-earth-400 mt-1">A pickup job is auto-posted for delivery partners.</p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm relative">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs mb-3">4</span>
              <h4 className="font-bold text-xs text-foreground">Transit Transit</h4>
              <p className="text-[10px] text-earth-400 mt-1">Delivery partner scans pickup & drives route.</p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm relative">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs mb-3">5</span>
              <h4 className="font-bold text-xs text-foreground">Cleared Pay</h4>
              <p className="text-[10px] text-earth-400 mt-1">Delivered! Escrow unlocks payouts to farmer & driver.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e6eae7] dark:border-[#232a26] py-12 px-6 lg:px-16 bg-white dark:bg-[#141816] text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-primary-500" />
          <span className="font-bold text-foreground">V-LINK R-COS</span>
        </div>
        <p className="text-xs text-earth-400">
          © 2026 V-LINK Rural Technologies Ltd. Built for global agricultural supply chain empowerment.
        </p>
      </footer>
    </div>
  );
}
