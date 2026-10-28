import React, { useState } from 'react';
import { AdminDataProvider, useAdminData } from './context/AdminDataContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KYCVerificationQueue } from './modules/KYCVerificationQueue';
import { PaymentManagement } from './modules/PaymentManagement';
import { BiodataModeration } from './modules/BiodataModeration';
import { GhotokDesk } from './modules/GhotokDesk';
import { SafetyAndAudit } from './modules/SafetyAndAudit';
import { BroadcastCenter } from './modules/BroadcastCenter';
import { AnalyticsDashboard } from './modules/AnalyticsDashboard';
import { LoginPage } from './components/LoginPage';
import { Menu, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

function DashboardContent() {
  const [activeModule, setActiveModule] = useState<string>('kyc'); // KYC Queue is Top Priority
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toastMessage, setToastMessage, currentUser, isAuthChecking } = useAdminData();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 shadow-xl p-2.5 border border-rose-400/20 mb-3 animate-pulse flex items-center justify-center">
          <img src="/ghotok_logo.png" alt="Ghotok Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 border border-slate-700/80 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold flex-1 leading-snug">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-100 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Mobile Menu Opener Bar */}
      <div className="lg:hidden bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg font-semibold text-slate-300"
        >
          <Menu className="w-4 h-4 text-rose-400" />
          <span>Modules Menu</span>
        </button>
        <span className="font-mono text-[11px] text-slate-400 uppercase">
          Active: <strong className="text-rose-400">{activeModule}</strong>
        </span>
      </div>

      {/* Body: Sidebar + Active Module Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeModule === 'kyc' && <KYCVerificationQueue />}
          {activeModule === 'payments' && <PaymentManagement />}
          {activeModule === 'moderation' && <BiodataModeration />}
          {activeModule === 'ghotok_desk' && <GhotokDesk />}
          {activeModule === 'safety' && <SafetyAndAudit />}
          {activeModule === 'broadcast' && <BroadcastCenter />}
          {activeModule === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AdminDataProvider>
      <DashboardContent />
    </AdminDataProvider>
  );
}
