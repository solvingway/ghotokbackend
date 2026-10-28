import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Heart, 
  MessageSquare, 
  Globe, 
  MapPin, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';

export const AnalyticsDashboard: React.FC = () => {
  const { stats, users, isBangla } = useAdminData();

  const totalUsers = users.length;
  const verifiedCount = users.filter(u => u.isVerified).length;
  const verifiedPercent = totalUsers > 0 ? Number(((verifiedCount / totalUsers) * 100).toFixed(1)) : 0;
  const completedCount = users.filter(u => Boolean(u.profession && u.locationDistrict)).length;
  const completedPercent = totalUsers > 0 ? Number(((completedCount / totalUsers) * 100).toFixed(1)) : 0;
  const paidCount = users.filter(u => u.packageTier !== 'Free').length;
  const paidPercent = totalUsers > 0 ? Number(((paidCount / totalUsers) * 100).toFixed(1)) : 0;

  const bridesCount = users.filter(u => u.gender === 'Female').length;
  const groomsCount = users.filter(u => u.gender === 'Male').length;
  const bridePercent = totalUsers > 0 ? Math.round((bridesCount / totalUsers) * 100) : 0;
  const groomPercent = totalUsers > 0 ? (100 - bridePercent) : 0;

  const funnelSteps = [
    {
      labelEn: 'Total Registered',
      labelBn: 'মোট নিবন্ধিত গ্রাহক',
      count: totalUsers,
      percent: 100,
      color: 'bg-blue-500',
      textColor: 'text-blue-400'
    },
    {
      labelEn: 'Completed Biodatas',
      labelBn: 'সম্পূর্ণ বায়োডাটা পূরণ',
      count: completedCount,
      percent: completedPercent,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400'
    },
    {
      labelEn: 'Verified Badge Profiles',
      labelBn: 'এনআইডি ভেরিফাইড প্রোফাইল',
      count: verifiedCount,
      percent: verifiedPercent,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400'
    },
    {
      labelEn: 'Paid Membership Subscribers',
      labelBn: 'পেইড গ্রাহক (সিলভার, গোল্ড, ডায়মন্ড)',
      count: paidCount,
      percent: paidPercent,
      color: 'bg-rose-500',
      textColor: 'text-rose-400'
    }
  ];

  const divisionList = [
    { nameEn: 'Dhaka', nameBn: 'ঢাকা' },
    { nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
    { nameEn: 'Sylhet', nameBn: 'সিলেট' },
    { nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
    { nameEn: 'Khulna', nameBn: 'খুলনা' },
    { nameEn: 'Barishal', nameBn: 'বরিশাল' },
    { nameEn: 'Rangpur', nameBn: 'রংপুর' },
    { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' }
  ];

  const divisionBreakdown = useMemo(() => {
    return divisionList.map(div => {
      const count = users.filter(u => 
        (u.locationDivision && u.locationDivision.toLowerCase() === div.nameEn.toLowerCase()) ||
        (u.locationDistrict && u.locationDistrict.toLowerCase() === div.nameEn.toLowerCase())
      ).length;
      const percent = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      return {
        ...div,
        count,
        percent
      };
    });
  }, [users, totalUsers]);

  const overseasList = [
    'United Kingdom (UK)',
    'US (America)',
    'Canada',
    'Australia',
    'Saudi Arabia',
    'UAE (Dubai)',
    'Malaysia'
  ];

  const overseasBreakdown = useMemo(() => {
    const totalOverseas = users.filter(u => u.overseasCountry && !u.overseasCountry.toLowerCase().includes('none')).length;
    return overseasList.map(country => {
      const count = users.filter(u => u.overseasCountry && u.overseasCountry.toLowerCase().includes(country.toLowerCase().slice(0, 5))).length;
      const percent = totalOverseas > 0 ? Math.round((count / totalOverseas) * 100) : 0;
      return {
        country,
        count,
        percent
      };
    });
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'লাইভ অ্যানালিটিক্স ও অপারেশনাল মেট্রিক্স' : 'Live Analytics & Matchmaking Funnel'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'নিবন্ধন থেকে সফল বিবাহ পর্যন্ত ফানেল বিশ্লেষণ, জেলাভিত্তিক পাত্র-পাত্রী অনুপাত এবং এনগেজমেন্ট রেট।'
              : 'Real-time metrics, bride/groom location balance across divisions, overseas distribution, and live database aggregations.'}
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Registered */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBangla ? 'মোট নিবন্ধিত সদস্য' : 'Total Registered'}
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-100">{totalUsers.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-400">Live DB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Real-time registered profiles</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
        </div>

        {/* Card 2: Verified Profiles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBangla ? 'এনআইডি ভেরিফাইড প্রোফাইল' : 'Verified Badge Holders'}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-400">{verifiedCount.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-400">{verifiedPercent}% rate</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Smart NID &amp; Passport verified</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
        </div>

        {/* Card 3: Matches & Proposals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBangla ? 'বিবাহ সম্পন্ন / ম্যাচ প্রাপ্ত' : 'Matches & Success Stories'}
            </span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-400">{stats.matchesMade}</span>
            <span className="text-[11px] font-bold text-slate-400">Nikahs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Married / Match Found status</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl" />
        </div>

        {/* Card 4: Revenue & Subscribers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBangla ? 'মোট মেম্বারশিপ রেভিনিউ' : 'Total Revenue (MFS)'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-300">৳{stats.totalRevenueBdt.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-amber-400">BDT</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{paidCount} paying subscribers</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
        </div>

      </div>

      {/* Row 2: Conversion Funnel (7 cols) + Gender Balance Ratio (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Funnel Metrics Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>{isBangla ? 'ম্যাট্রিমনি কনভার্সন ফানেল' : 'Matrimony Onboarding & Trust Funnel'}</span>
              </h3>
              <p className="text-xs text-slate-400">From account signup to verified paid subscriber</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">Live Funnel</span>
          </div>

          <div className="space-y-4 pt-1">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {isBangla ? step.labelBn : step.labelEn}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-300">{step.count.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${step.textColor}`}>({step.percent}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className={`${step.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(step.percent, step.count > 0 ? 5 : 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Balance: Bride vs Groom */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span>{isBangla ? 'পাত্র ও পাত্রীর অনুপাত (Gender Balance)' : 'Bride vs Groom Ratio (B & G)'}</span>
              </h3>
              <p className="text-xs text-slate-400">Ensures balanced proposal exchange</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-pink-500" />
                <span className="text-xs font-bold text-pink-300">{isBangla ? 'পাত্রী (Brides - B)' : 'Brides (B)'}</span>
              </div>
              <span className="text-sm font-black text-pink-300 font-mono">{bridePercent}% ({bridesCount})</span>
            </div>

            <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden flex">
              <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${totalUsers > 0 ? bridePercent : 50}%` }} title={`Brides: ${bridePercent}%`} />
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${totalUsers > 0 ? groomPercent : 50}%` }} title={`Grooms: ${groomPercent}%`} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-500" />
                <span className="text-xs font-bold text-blue-300">{isBangla ? 'পাত্র (Grooms - G)' : 'Grooms (G)'}</span>
              </div>
              <span className="text-sm font-black text-blue-300 font-mono">{groomPercent}% ({groomsCount})</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {totalUsers > 0
                ? `${bridesCount} Bride(s) and ${groomsCount} Groom(s) registered in live database.`
                : 'Awaiting initial live candidate registrations from mobile app.'}
            </span>
          </div>
        </div>

      </div>

      {/* Row 3: Geographic Distribution: Bangladesh 8 Divisions + Overseas NRBs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Bangladesh Divisions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{isBangla ? 'বিভাগভিত্তিক পাত্র-পাত্রী বণ্টন (৮টি বিভাগ)' : 'National Distribution Across 8 Divisions'}</span>
              </h3>
              <p className="text-xs text-slate-400">Live breakdown by candidate locations</p>
            </div>
            <span className="text-xs text-slate-400">Bangladesh Core</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {divisionBreakdown.map(div => (
              <div key={div.nameEn} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {isBangla ? div.nameBn : div.nameEn}
                  </span>
                  <span className="font-mono text-rose-400 font-bold">{div.percent}% ({div.count})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, div.percent)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overseas & NRB Profiles (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{isBangla ? 'প্রবাসী ও এনআরবি প্রোফাইল বণ্টন' : 'Overseas / Non-Resident Bangladeshi (NRB)'}</span>
              </h3>
              <p className="text-xs text-slate-400">Live overseas candidates</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {overseasBreakdown.map(os => (
              <div key={os.country} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate">{os.country}</span>
                  <span className="font-mono text-indigo-300 font-bold">{os.percent}% ({os.count})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, os.percent)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Engagement & Live Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-sm text-slate-100 pb-3 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>{isBangla ? 'লাইভ এনগেজমেন্ট ও প্রোফাইল মেট্রিক্স' : 'Live Engagement & Activity Metrics'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">Live Profiles in DB</span>
            <span className="text-xl font-black text-slate-100 font-mono mt-1 block">{totalUsers}</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Live</span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">Pending Verifications</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-1 block">{stats.pendingVerifications}</span>
            <span className="text-[10px] text-slate-400">KYC Queue</span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">Pending Payments</span>
            <span className="text-xl font-black text-rose-400 font-mono mt-1 block">{stats.pendingPayments}</span>
            <span className="text-[10px] text-rose-400/80">TrxID Submissions</span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block font-medium">Paid Subscribers</span>
            <span className="text-xl font-black text-indigo-300 font-mono mt-1 block">{paidCount}</span>
            <span className="text-[10px] text-indigo-400/80">Active packages</span>
          </div>
        </div>
      </div>

    </div>
  );
};
