import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  BarChart3,
  HeartHandshake,
  FileCheck2,
  Flame,
  BadgeAlert,
  SlidersHorizontal,
  Database,
  Lock,
  Zap,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { logoutUser } from '../firebase';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const { 
    stats, 
    isBangla, 
    users, 
    firestoreStatus, 
    currentUser, 
    isLiveMode,
    syncWithFirestore
  } = useAdminData();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const flaggedBiosCount = users.filter(u => u.flaggedForSuspiciousBio).length;

  const modules = [
    {
      id: 'kyc',
      labelEn: 'KYC & ID Verification',
      labelBn: 'কেওয়াইসি ও আইডি ভেরিফিকেশন',
      subtitleEn: 'Review NID / Passport scans',
      subtitleBn: 'এনআইডি ও পাসপোর্ট যাচাই',
      icon: ShieldCheck,
      badge: stats.pendingVerifications,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      badgePulse: stats.pendingVerifications > 0,
      highlight: true
    },
    {
      id: 'payments',
      labelEn: 'bKash / Nagad Payments',
      labelBn: 'পেমেন্ট ও মেম্বারশিপ প্যাকেজ',
      subtitleEn: 'TrxID queue & Quota control',
      subtitleBn: 'TrxID যাচাই ও কোটা কন্ট্রোল',
      icon: CreditCard,
      badge: stats.pendingPayments,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      badgePulse: stats.pendingPayments > 0
    },
    {
      id: 'moderation',
      labelEn: 'User & Biodata Moderation',
      labelBn: 'বায়োডাটা ও প্রোফাইল মডারেশন',
      subtitleEn: 'B & G profiles, bio editor, ban',
      subtitleBn: 'পাত্র-পাত্রী প্রোফাইল, তথ্য সম্পাদন',
      icon: Users,
      badge: flaggedBiosCount > 0 ? flaggedBiosCount : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      badgeTitle: isBangla ? 'সন্দেহজনক বায়ো' : 'Suspicious bios'
    },
    {
      id: 'ghotok_desk',
      labelEn: 'Ghotok Desk (Matchmaking)',
      labelBn: 'ঘটক ডেস্ক (অ্যাসিস্টেড ম্যাচমেকিং)',
      subtitleEn: 'Auto compatibility & Call logs',
      subtitleBn: 'কম্প্যাটিবিলিটি ও অভিভাবক কল লগ',
      icon: HeartHandshake,
      badge: 'VIP',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'safety',
      labelEn: 'Safety, Reports & Audit',
      labelBn: 'নিরাপত্তা, অভিযোগ ও অডিট লগ',
      subtitleEn: 'Disputes & Anti-scraping audit',
      subtitleBn: 'রিপোর্ট যাচাই ও ফোন আনলক হিস্ট্রি',
      icon: AlertTriangle,
      badge: stats.pendingReports,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      badgePulse: stats.pendingReports > 0
    },
    {
      id: 'broadcast',
      labelEn: 'Broadcast & Notifications',
      labelBn: 'ব্রডকাস্ট ও নোটিফিকেশন সেন্টার',
      subtitleEn: 'Targeted English & বাংলা alerts',
      subtitleBn: 'বাংলা ও ইংরেজিতে পুশ নোটিফিকেশন',
      icon: Send
    },
    {
      id: 'analytics',
      labelEn: 'Live Analytics Dashboard',
      labelBn: 'লাইভ অ্যানালিটিক্স ড্যাশবোর্ড',
      subtitleEn: 'Funnel, ratio & conversion',
      subtitleBn: 'ফানেল, জেলা ব্যালান্স ও এঙ্গেজমেন্ট',
      icon: BarChart3
    }
  ];

  const handleSelect = (id: string) => {
    setActiveModule(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-16 bottom-0 left-0 z-40
        w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="p-3.5 space-y-2 overflow-y-auto flex-1">
          
          {/* DATABASE CONNECTION CARD AT TOP OF SIDEBAR */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Firestore Database</span>
              </span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                currentUser 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}>
                {currentUser ? 'Live Synced' : 'Auth Required'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono truncate" title={firestoreStatus.projectId}>
              Project: {firestoreStatus.projectId}
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isBangla ? 'লগ আউট' : 'Sign Out'}</span>
              </button>
            </div>
          </div>

          <div className="px-3 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{isBangla ? 'মডিউলসমূহ' : 'Core Modules'}</span>
            <span className="text-[10px] text-rose-400 font-medium">7 Active</span>
          </div>

          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;

            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`
                  w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 relative group
                  ${isActive 
                    ? 'bg-gradient-to-r from-rose-900/60 to-rose-950/40 text-rose-100 border border-rose-500/40 shadow-lg shadow-rose-950/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'}
                `}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r" />
                )}

                <div className={`
                  p-2 rounded-lg mt-0.5 shrink-0 transition-colors
                  ${isActive 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : 'bg-slate-800 text-slate-400 group-hover:text-rose-400 group-hover:bg-slate-700/80'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs sm:text-sm truncate">
                      {isBangla ? m.labelBn : m.labelEn}
                    </span>

                    {m.badge !== undefined && (
                      <span className={`
                        px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0
                        ${m.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}
                        ${m.badgePulse ? 'animate-pulse' : ''}
                      `} title={m.badgeTitle}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {isBangla ? m.subtitleBn : m.subtitleEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom System Banner */}
        <div className="p-3.5 border-t border-slate-800/90 bg-slate-950/40 m-2 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-medium text-slate-400">
              {isBangla ? 'আজকের ম্যাচমেকিং রেট' : 'Matchmaking Rate'}
            </span>
            <span className="font-bold text-emerald-400">{stats.interestsAcceptedRate}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${stats.interestsAcceptedRate}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{isBangla ? 'সফল বিবাহ' : 'Success Stories'}: <strong className="text-rose-300 font-bold">{stats.matchesMade}</strong></span>
            <span>{isBangla ? 'আজকের প্রস্তাব' : 'Today'}: <strong className="text-amber-300 font-bold">{stats.interestsSentToday}</strong></span>
          </div>
        </div>
      </aside>

      {/* Config modal */}
      <FirebaseConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
};
