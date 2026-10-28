import React, { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  signUpWithEmail,
  logoutUser 
} from '../firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { 
    syncWithFirestore, 
    isBangla, 
    currentUser 
  } = useAdminData();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      await syncWithFirestore();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError(isBangla ? 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।' : 'Sign-in window was closed.');
      } else {
        setAuthError(err?.message || 'Google sign-in failed');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (isRegistering) {
        await signUpWithEmail(emailInput.trim(), passwordInput);
      } else {
        await loginWithEmail(emailInput.trim(), passwordInput);
      }
      await syncWithFirestore();
      onClose();
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError(isBangla ? 'ভুল পাসওয়ার্ড বা ইমেইল প্রদান করেছেন।' : 'Invalid email or password.');
      } else if (code === 'auth/user-not-found') {
        setAuthError(isBangla 
          ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সাইন আপ করুন।' 
          : 'User not found. Switch to Sign Up below to create your account.');
      } else if (code === 'auth/email-already-in-use') {
        setAuthError(isBangla 
          ? 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।' 
          : 'Email is already in use. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setAuthError(isBangla 
          ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' 
          : 'Password must be at least 6 characters.');
      } else {
        setAuthError(err?.message || 'Authentication failed');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    try {
      await logoutUser();
      await syncWithFirestore();
    } catch (err: any) {
      setAuthError(err?.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 my-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-700 p-1.5 flex items-center justify-center border border-rose-400/20">
              <img src="/ghotok_logo.png" alt="Ghotok Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isBangla ? 'অ্যাডমিন প্রমাণীকরণ' : 'Admin Authentication'}
              </h2>
              <p className="text-xs text-slate-400">Ghotok Matrimony Operations Desk</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user logged in state */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authenticated Admin
                </span>
                <p className="text-slate-100 font-bold text-sm mt-0.5">{currentUser.email || 'Admin User'}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">UID: {currentUser.uid}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isAuthLoading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>{isBangla ? 'লগ আউট করুন' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{authError}</p>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  {isBangla ? 'ইমেইল' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@ghotok.com.bd"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  {isBangla ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isAuthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>
                  {isRegistering 
                    ? (isBangla ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account') 
                    : (isBangla ? 'সাইন ইন' : 'Sign In')}
                </span>
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center text-xs text-slate-400">
              {isRegistering ? (
                <span>
                  {isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
                  >
                    {isBangla ? 'সাইন ইন' : 'Sign In'}
                  </button>
                </span>
              ) : (
                <span>
                  {isBangla ? 'কোনো অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
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

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-colors shadow"
            >
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
        )}

      </div>
    </div>
  );
};
