import React, { useState } from 'react';
import { 
  LogIn, 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../firebase';
import { useAdminData } from '../context/AdminDataContext';

export const LoginPage: React.FC = () => {
  const { syncWithFirestore, isBangla } = useAdminData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      await syncWithFirestore();
    } catch (err: any) {
      console.error('Email auth error:', err);
      const code = err?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError(isBangla ? 'ভুল পাসওয়ার্ড বা ইমেইল প্রদান করেছেন।' : 'Invalid email or password.');
      } else if (code === 'auth/user-not-found') {
        setError(isBangla 
          ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিচে "Sign Up" চাপুন।' 
          : 'No account found with this email. Switch to "Sign Up" below to register.');
      } else if (code === 'auth/email-already-in-use') {
        setError(isBangla 
          ? 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে। সাইন-ইন করুন।' 
          : 'Email is already in use. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError(isBangla 
          ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' 
          : 'Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError(isBangla ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.');
      } else {
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      await syncWithFirestore();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError(isBangla ? 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।' : 'Sign-in window was closed.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError(isBangla ? 'পপআপ ব্লক করা হয়েছে। ব্রাউজারের অনুমতি দিন।' : 'Sign-in popup was blocked by browser.');
      } else {
        setError(err?.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-8 relative z-10 space-y-6">
        
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 shadow-xl shadow-rose-950/50 p-2.5 border border-rose-400/20 mb-1">
            <img 
              src="/ghotok_logo.png" 
              alt="Ghotok Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-200 via-amber-200 to-rose-400 bg-clip-text text-transparent">
            GHOTOK ADMIN
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {isBangla ? 'মডারেশন ও অ্যাডমিন পোর্টাল' : 'Operations & Moderation Desk'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-rose-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed flex-1">{error}</p>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              {isBangla ? 'ইমেইল এড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ghotok.com.bd"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                {isBangla ? 'পাসওয়ার্ড' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>
              {isRegistering 
                ? (isBangla ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account') 
                : (isBangla ? 'সাইন ইন করুন' : 'Sign In')}
            </span>
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="text-center text-xs text-slate-400">
          {isRegistering ? (
            <span>
              {isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError(null);
                }}
                className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
              >
                {isBangla ? 'সাইন ইন করুন' : 'Sign In'}
              </button>
            </span>
          ) : (
            <span>
              {isBangla ? 'কোনো অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError(null);
                }}
                className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
              >
                {isBangla ? 'সাইন আপ করুন' : 'Sign Up'}
              </button>
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            {isBangla ? 'অথবা' : 'OR'}
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/90 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-50"
        >
          {/* Authentic Google 'G' Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isBangla ? 'গুগল দিয়ে সাইন ইন করুন' : 'Sign in with Google'}</span>
        </button>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
        <span>Ghotok Matrimony Operations Desk • Secure Access</span>
      </div>

    </div>
  );
};
