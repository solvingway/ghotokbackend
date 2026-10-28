import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  CreditCard, 
  AlertTriangle, 
  Bell, 
  Sparkles, 
  ExternalLink, 
  Database, 
  LogIn, 
  SlidersHorizontal, 
  Flame,
  Zap,
  Lock,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { logoutUser } from '../firebase';

interface HeaderProps {
  onSearchSelect?: (profileCode: string) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchSelect, setActiveModule }) => {
  const { 
    stats, 
    isBangla, 
    toggleLanguage, 
    resetToDemoData, 
    users, 
    firestoreStatus, 
    currentUser, 
    isLiveMode,
    syncWithFirestore
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const searchResults = searchQuery.trim().length >= 2 
    ? users.filter(u => 
        u.profileCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayNameBangla.includes(searchQuery) ||
        u.phone.includes(searchQuery) ||
        u.locationDistrict.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveModule('analytics')}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 shadow-md shadow-rose-950/40 p-1.5 border border-rose-400/20">
                <img src="/ghotok_logo.png" alt="Ghotok Logo" className="w-full h-full object-contain" />
                <div 
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    currentUser ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`} 
                  title={currentUser ? 'Authenticated' : 'Auth Required'} 
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-200 via-amber-200 to-rose-400 bg-clip-text text-transparent">
                    GHOTOK ADMIN
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    {isBangla ? 'মডারেশন পোর্টাল' : 'Operations Desk'}
                  </span>
                </div>
                
                {/* Database connectivity pill */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="flex items-center gap-1 px-1.5 py-0.2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono transition-colors"
                    title={`Click to inspect or authenticate: ${firestoreStatus.databaseId}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentUser ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    <span className="truncate max-w-[130px] sm:max-w-[180px]">{firestoreStatus.projectId}</span>
                  </button>
                  
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {isBangla ? 'লাইভ ডেটা' : 'Live DB'}
                  </span>
                </div>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isBangla ? "প্রোফাইল আইডি (G600001, B600001), নাম, ফোন..." : "Lookup Profile ID (G600001, B600001), name, phone..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800/95 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Live Search Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800"
                  onMouseLeave={() => setShowSearchResults(false)}
                >
                  <div className="px-3 py-1.5 bg-slate-800/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {isBangla ? 'মিল পাওয়া প্রোফাইল' : 'Matched Profiles'}
                  </div>
                  {searchResults.map(profile => (
                    <div
                      key={profile.profileCode}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        setActiveModule('moderation');
                        if (onSearchSelect) onSearchSelect(profile.profileCode);
                      }}
                      className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={profile.photoUrl} 
                          alt={profile.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-slate-100">
                              {isBangla && profile.displayNameBangla ? profile.displayNameBangla : profile.displayName}
                            </span>
                            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                              profile.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {profile.profileCode}
                            </span>
                            {profile.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {profile.profession} • {profile.locationDistrict} • {profile.age} yrs
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                        {isBangla ? 'সম্পাদনা' : 'Manage'} <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Counter Pills */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveModule('kyc')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 transition-colors"
                title="KYC Verification Queue"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isBangla ? 'কেওয়াইসি' : 'KYC'}:</span>
                <span className="px-1.5 py-0.2 bg-amber-500/30 font-bold rounded-full">{stats.pendingVerifications}</span>
              </button>

              <button
                onClick={() => setActiveModule('payments')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-medium text-rose-300 transition-colors"
                title="Payment Verification Queue"
              >
                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBangla ? 'পেমেন্ট' : 'TrxID'}:</span>
                <span className="px-1.5 py-0.2 bg-rose-500/30 font-bold rounded-full">{stats.pendingPayments}</span>
              </button>

              <button
                onClick={() => setActiveModule('safety')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-medium text-purple-300 transition-colors"
                title="Safety Reports Queue"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                <span>{isBangla ? 'অভিযোগ' : 'Disputes'}:</span>
                <span className="px-1.5 py-0.2 bg-purple-500/30 font-bold rounded-full">{stats.pendingReports}</span>
              </button>
            </div>

            {/* Right Side Action Buttons */}
            <div className="flex items-center gap-2">
              
              {/* PRIMARY PROMINENT AUTH BUTTON: Always visible on all screen sizes! */}
              {currentUser ? (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 transition-all shadow-sm"
                  title="Firebase Auth Active - Click to manage database"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Database className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'লাইভ কানেক্টেড' : 'Live Synced'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-950/40 animate-pulse"
                  title="Firestore requires Authentication to view live database records"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'অথেনটিকেশন প্রয়োজন' : 'Auth Required'}</span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors shadow-sm"
                title={isBangla ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
              >
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBangla ? 'বাংলা' : 'ENG'}</span>
              </button>

              {/* Refresh Live Firestore Data Button */}
              <button
                onClick={() => syncWithFirestore()}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-300 rounded-xl transition-colors shadow-sm"
                title={isBangla ? "লাইভ ফায়ারস্টোর রিফ্রেশ করুন" : "Refresh Live Firestore Data"}
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 hover:text-emerald-400 transition-colors ${firestoreStatus.syncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>

              {/* Admin Profile & Log Out */}
              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div 
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow-inner"
                    title={currentUser.email || 'Admin'}
                  >
                    {currentUser.email ? currentUser.email.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="hidden lg:block text-left text-[11px] leading-tight">
                    <p className="font-semibold text-slate-200 truncate max-w-[130px]">{currentUser.email || 'Admin'}</p>
                    <p className="text-emerald-400 text-[10px] font-mono">Authenticated</p>
                  </div>
                  <button
                    onClick={async () => {
                      await logoutUser();
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors ml-1"
                    title={isBangla ? 'লগ আউট' : 'Sign Out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Firebase Configuration Modal */}
      <FirebaseConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
      />
    </>
  );
};
