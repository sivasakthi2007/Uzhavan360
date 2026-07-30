import React, { useState, useEffect, Suspense } from 'react';
import { useApp, Role, BuyerType } from '@/context/AppContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Leaf, Truck, Database, Settings, ArrowRight, ArrowLeft, Users, Sun, Moon } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

function AuthContent() {
  const { theme, setTheme, signUpWithEmail, loginWithEmail, loginWithGoogle, loading: appLoading } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab State
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Feedback states
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Selected state
  const [selectedRole, setSelectedRole] = useState<Role>('farmer');
  const [selectedBuyerType, setSelectedBuyerType] = useState<BuyerType>('customer');

  useEffect(() => {
    const roleParam = searchParams.get('role') as Role;
    if (roleParam && ['farmer', 'buyer', 'delivery', 'labor', 'vendor'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all email and password fields.');
      return;
    }
    
    setLocalLoading(true);
    try {
      if (authTab === 'signup') {
        if (!fullName) {
          setError('Please provide your full name.');
          setLocalLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLocalLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLocalLoading(false);
          return;
        }
        await signUpWithEmail(
          email, 
          password, 
          fullName, 
          selectedRole, 
          selectedRole === 'buyer' ? selectedBuyerType : null
        );
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No user profile found with this email. Try signing up!');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLocalLoading(true);
    try {
      await loginWithGoogle(
        selectedRole, 
        selectedRole === 'buyer' ? selectedBuyerType : null
      );
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = appLoading || localLoading;

  const roleDetails: Record<Role, { name: string; desc: string; icon: any; color: string }> = {
    farmer: {
      name: 'Ramanathan Swamy',
      desc: 'Agricultural Farmer. Access weather advisory, list direct crop yields, lease tools, hire workforce, and use Sakthi voice.',
      icon: Leaf,
      color: 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400'
    },
    buyer: {
      name: 'Direct Wholesale Buyer',
      desc: 'Purchase fresh vegetables and grains directly from farmer fields without commission agents.',
      icon: Database,
      color: 'border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400'
    },
    delivery: {
      name: 'Suresh Kumar',
      desc: 'Logistics Courier Partner. Access open local route dispatches and request instant payouts.',
      icon: Truck,
      color: 'border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400'
    },
    labor: {
      name: 'Karthick Raja',
      desc: 'Farming Laborer. Search seasonal agricultural harvesting and sowing job openings locally.',
      icon: Users,
      color: 'border-stone-500/20 bg-stone-50/20 dark:bg-stone-950/10 text-stone-600 dark:text-stone-400'
    },
    vendor: {
      name: 'Srinivasan Machinery',
      desc: 'Machinery Rental Vendor. List heavy tractors, pumps, tillers, and cargo vans for lease.',
      icon: Settings,
      color: 'border-purple-500/20 bg-purple-50/20 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400'
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfa] dark:bg-[#111613] flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Header */}
      <header className="h-16 px-6 lg:px-16 border-b border-[#e6eae7] dark:border-[#26332a] flex items-center justify-between bg-white dark:bg-[#19211c] transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-500 text-white shadow-sm">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-foreground">V-LINK</span>
            <span className="text-[9px] block font-mono text-earth-400 uppercase tracking-widest -mt-1.5">R-COS</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-earth-500 dark:text-earth-400 hover:text-primary-500 hover:bg-earth-100 dark:hover:bg-earth-900/40 rounded-xl cursor-pointer border-0 bg-transparent"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-xs text-earth-500 dark:text-earth-400 hover:text-foreground font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        
        {/* Sandbox Warning Banner */}
        {!isSupabaseConfigured && (
          <div className="w-full max-w-4xl px-5 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold animate-pulse shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <span><strong>Sandbox Mock Mode Active</strong>: Supabase configuration keys are missing. Email login/signup and Google authentication will run using simulated browser database persistence.</span>
            </div>
            <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">SANDBOX RUN</span>
          </div>
        )}

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch bg-white dark:bg-[#19211c] border border-earth-200 dark:border-[#26332a] p-6 sm:p-10 rounded-3xl shadow-xl transition-all">
          
          {/* Left panel: Info and Role buttons */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Ecosystem Role Context</h2>
                <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">Select your user role. This role will associate with your registered profile.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(roleDetails) as Role[]).map((r) => {
                  const prof = roleDetails[r];
                  const Icon = prof.icon;
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 cursor-pointer transition-all duration-200 bg-transparent ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10 ring-1 ring-primary-500' 
                          : 'border-earth-200 dark:border-earth-800 hover:bg-earth-50/50 dark:hover:bg-[#26332a]/40'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg w-fit ${prof.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground capitalize">{r === 'vendor' ? 'Rental Supplier' : r}</h4>
                        <p className="text-[10px] text-earth-400 truncate mt-0.5">{prof.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Info Box */}
            <div className="p-4 rounded-2xl border border-dashed border-primary-500/20 bg-primary-50/5 dark:bg-primary-950/5 mt-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-1">
                Selected Role Template Details
              </span>
              <h3 className="font-extrabold text-sm text-foreground">{roleDetails[selectedRole].name}</h3>
              <p className="text-[11px] text-earth-500 dark:text-earth-400 leading-normal mt-1">
                {roleDetails[selectedRole].desc}
              </p>
            </div>
          </div>

          {/* Right panel: Login / Signup Box */}
          <div className="border-t md:border-t-0 md:border-l border-earth-100 dark:border-earth-900/40 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Tab Selector */}
              <div className="flex border-b border-earth-100 dark:border-earth-900/40 pb-0.5">
                <button
                  type="button"
                  onClick={() => { setAuthTab('signin'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 cursor-pointer transition-all ${
                    authTab === 'signin'
                      ? 'border-primary-500 text-foreground'
                      : 'border-transparent text-earth-400 hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('signup'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 cursor-pointer transition-all ${
                    authTab === 'signup'
                      ? 'border-primary-500 text-foreground'
                      : 'border-transparent text-earth-400 hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed animate-fade-in">
                  {error}
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                
                {/* Full Name (Sign Up Only) */}
                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramanathan Swamy"
                      className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                    Passkey / Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                      Confirm Passkey
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full h-10 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                )}

                {/* Buyer Subtypes Selector (Visible only if Buyer role is selected) */}
                {selectedRole === 'buyer' && (
                  <div className="space-y-2 animate-slide-up p-3.5 rounded-2xl border border-blue-500/10 bg-blue-50/5 dark:bg-blue-950/5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                      Buyer Profile Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'customer', label: 'B2C Customer' },
                        { id: 'hotel', label: 'Hotel Manager' },
                        { id: 'retail', label: 'Retail Veggie Shop' },
                        { id: 'marriage', label: 'Marriage Hall' }
                      ].map((b) => (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBuyerType(b.id as BuyerType)}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                            selectedBuyerType === b.id
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-earth-200 text-earth-600 dark:text-earth-400 bg-transparent hover:bg-earth-100 dark:hover:bg-earth-900/40'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{authTab === 'signin' ? 'Sign In & Load Console' : 'Create Account & Enter'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-earth-100 dark:border-earth-900/40"></div>
                <span className="flex-shrink mx-4 text-[9px] text-earth-400 font-bold uppercase tracking-wider">or sign in with</span>
                <div className="flex-grow border-t border-earth-100 dark:border-earth-900/40"></div>
              </div>

              {/* Google login option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-10 border border-earth-200 dark:border-earth-800 bg-transparent hover:bg-earth-50 dark:hover:bg-earth-950/40 text-foreground dark:text-[#f2f4f3] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {/* SVG Google logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeWidth="0" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Profile Auth</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-[#e6eae7] dark:border-[#26332a] text-center text-[10px] text-earth-400 bg-white dark:bg-[#19211c] transition-colors duration-200">
        Secure operator login. Powered by V-LINK R-COS cryptographic escrow networks.
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafbfa] dark:bg-[#111613] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Leaf className="w-8 h-8 text-primary-500 animate-bounce" />
          <span className="text-xs font-semibold">Loading Sandbox Console...</span>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
