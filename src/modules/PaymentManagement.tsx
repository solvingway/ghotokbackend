import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Search, 
  Sliders, 
  Download, 
  ArrowUpRight, 
  ShieldCheck, 
  Phone, 
  DollarSign, 
  Plus, 
  Minus, 
  Copy,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { PaymentRequestItem, PackageTier, UserBiodata } from '../types/admin';

export const PaymentManagement: React.FC = () => {
  const { 
    paymentRequests, 
    users, 
    approvePayment, 
    rejectPayment, 
    updateUserQuota, 
    stats,
    isBangla 
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'QUOTA_CONTROL' | 'REVENUE_LOGS'>('QUEUE');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [queueSearch, setQueueSearch] = useState('');

  // Manual Quota Control State
  const [selectedUserCode, setSelectedUserCode] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<PackageTier>('Gold');
  const [bonusInterests, setBonusInterests] = useState<number>(40);
  const [bonusContacts, setBonusContacts] = useState<number>(25);
  const [supportNote, setSupportNote] = useState<string>('');
  const [userSearchText, setUserSearchText] = useState('');

  // Reject TrxID State
  const [rejectingItem, setRejectingItem] = useState<PaymentRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Transaction ID not found in merchant statement');

  const filteredPayments = paymentRequests.filter(req => {
    const matchesStatus = filterStatus === 'ALL' ? true : req.status === filterStatus;
    const matchesMethod = filterMethod === 'ALL' ? true : req.paymentMethod === filterMethod;
    const q = queueSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      req.profileCode.toLowerCase().includes(q) ||
      req.displayName.toLowerCase().includes(q) ||
      req.transactionId.toLowerCase().includes(q) ||
      req.senderPhone.includes(q);
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const selectedTargetUser = users.find(u => u.profileCode === selectedUserCode) || users[0] || null;

  const handleSelectUserForQuota = (user: UserBiodata) => {
    setSelectedUserCode(user.profileCode);
    setSelectedTier(user.packageTier);
    setBonusInterests(user.interestsRemaining);
    setBonusContacts(user.contactsRemaining);
  };

  const handleSaveQuota = () => {
    if (!selectedTargetUser) return;
    updateUserQuota(selectedTargetUser.profileCode, selectedTier, bonusInterests, bonusContacts);
  };

  const exportPaymentsCSV = () => {
    const headers = ['RequestID', 'ProfileID', 'Name', 'Package', 'Amount(BDT)', 'Method', 'SenderPhone', 'TrxID', 'Status', 'Date'];
    const rows = paymentRequests.map(p => [
      p.id,
      p.profileCode,
      `"${p.displayName}"`,
      p.packageTier,
      p.amountBdt,
      p.paymentMethod,
      p.senderPhone,
      p.transactionId,
      p.status,
      p.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ghotok_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'পেমেন্ট ও মেম্বারশিপ প্যাকেজ ম্যানেজমেন্ট' : 'Payment & Membership Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              bKash • Nagad • Rocket
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'বিকাশ, নগদ ও রকেট মাধ্যমে পাঠানো TrxID যাচাই করুন এবং কাস্টমার সাপোর্টের জন্য কোটা নিয়ন্ত্রণ করুন।'
              : 'Verify manual MFS Send Money transactions (TrxID), upgrade membership tiers, and control proposal quotas.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'QUEUE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isBangla ? 'ভেরিফিকেশন কিউ' : 'TrxID Queue'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {stats.pendingPayments}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('QUOTA_CONTROL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'QUOTA_CONTROL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isBangla ? 'কোটা ও প্যাকেজ অ্যাসাইন' : 'Quota Control'}</span>
          </button>

          <button
            onClick={() => setActiveTab('REVENUE_LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'REVENUE_LOGS' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isBangla ? 'সাবস্ক্রিপশন ও রেভিনিউ' : 'Revenue Logs'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Payment Verification Queue */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          
          {/* Quick Metrics & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium block">
                {isBangla ? 'অপেক্ষমাণ পেমেন্ট' : 'Pending Verification'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-rose-400">{stats.pendingPayments}</span>
                <span className="text-[11px] text-slate-400">requests</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium block">
                {isBangla ? 'মোট সংগৃহীত রেভিনিউ' : 'Total Revenue'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-emerald-400">৳{(stats.totalRevenueBdt).toLocaleString()}</span>
                <span className="text-[11px] text-emerald-400/80 font-bold">BDT</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium block">
                {isBangla ? 'সক্রিয় পেইড গ্রাহক' : 'Paid Subscribers'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-amber-300">{stats.activeSubscribers}</span>
                <span className="text-[11px] text-slate-400">members</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isBangla ? 'রিপোর্ট এক্সপোর্ট' : 'Accounting Report'}
                </span>
                <span className="text-xs text-slate-300 font-semibold mt-0.5 block">CSV Format</span>
              </div>
              <button
                onClick={exportPaymentsCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filtering row */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={isBangla ? "TrxID, ফোন নম্বর বা আইডি দিয়ে খুঁজুন..." : "Search by TrxID, sender phone, ID..."}
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isBangla ? 'মাধ্যম:' : 'Method:'}</span>
              {['ALL', 'bKash', 'Nagad', 'Rocket'].map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterMethod === m ? 'bg-slate-700 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <span className="text-slate-400 font-medium">{isBangla ? 'অবস্থা:' : 'Status:'}</span>
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === s ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Verification Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{isBangla ? 'প্রার্থী ও প্রোফাইল' : 'Member & Profile'}</th>
                    <th className="py-3 px-4">{isBangla ? 'অনুরোধকৃত প্যাকেজ' : 'Package Requested'}</th>
                    <th className="py-3 px-4">{isBangla ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</th>
                    <th className="py-3 px-4">{isBangla ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</th>
                    <th className="py-3 px-4">{isBangla ? 'প্রেরক নম্বর' : 'Sender Mobile'}</th>
                    <th className="py-3 px-4">{isBangla ? 'ট্রানজেকশন আইডি (TrxID)' : 'TrxID & Timestamp'}</th>
                    <th className="py-3 px-4">{isBangla ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        {isBangla ? 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।' : 'No payment requests found matching filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => {
                      const user = users.find(u => u.profileCode === p.profileCode);

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                                alt={p.displayName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                              />
                              <div>
                                <span className="font-bold text-slate-100 block">{p.displayName}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                  user?.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {p.profileCode}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                              p.packageTier === 'Diamond' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                              p.packageTier === 'Gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-slate-700 text-slate-200'
                            }`}>
                              {p.packageTier} Plan
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-slate-100 text-sm">
                            ৳{p.amountBdt}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.paymentMethod === 'bKash' ? 'bg-pink-900/40 text-pink-300 border border-pink-700/50' :
                              p.paymentMethod === 'Nagad' ? 'bg-orange-900/40 text-orange-300 border border-orange-700/50' :
                              p.paymentMethod === 'Rocket' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {p.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            {p.senderPhone}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {p.transactionId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(p.transactionId)}
                                className="p-1 text-slate-400 hover:text-slate-100 rounded"
                                title="Copy TrxID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {new Date(p.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(p.submittedAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              p.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {p.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => approvePayment(p.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                  title="Verify TrxID & Activate Package"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>{isBangla ? 'অনুমোদন' : 'Verify & Activate'}</span>
                                </button>
                                <button
                                  onClick={() => setRejectingItem(p)}
                                  className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 transition-colors"
                                  title="Reject TrxID"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                {p.adminNote || 'Processed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manual Package Assignment & Quota Control */}
      {activeTab === 'QUOTA_CONTROL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* User selector list */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-200">
              {isBangla ? 'সদস্য নির্বাচন করুন (কাস্টমার সাপোর্ট)' : 'Select Member for Quota Control'}
            </h3>

            <input
              type="text"
              placeholder={isBangla ? "নাম, আইডি বা ফোন দিয়ে খুঁজুন..." : "Filter by name, profile ID, or phone..."}
              value={userSearchText}
              onChange={(e) => setUserSearchText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {users
                .filter(u => 
                  !userSearchText || 
                  u.displayName.toLowerCase().includes(userSearchText.toLowerCase()) ||
                  u.profileCode.toLowerCase().includes(userSearchText.toLowerCase()) ||
                  u.phone.includes(userSearchText)
                )
                .map(user => {
                  const isSelected = selectedUserCode === user.profileCode;

                  return (
                    <div
                      key={user.profileCode}
                      onClick={() => handleSelectUserForQuota(user)}
                      className={`
                        p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                        ${isSelected 
                          ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40 text-slate-100' 
                          : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-300'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.photoUrl} 
                          alt={user.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs">{user.displayName}</span>
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-700 text-slate-300">
                              {user.profileCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {user.profession} • {user.locationDistrict}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.packageTier === 'Diamond' ? 'bg-purple-500/20 text-purple-300' :
                          user.packageTier === 'Gold' ? 'bg-amber-500/20 text-amber-300' :
                          user.packageTier === 'Silver' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {user.packageTier}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {user.interestsRemaining} ints • {user.contactsRemaining} contacts
                        </span>
                      </div>
                    </div>
                  );
                })}
              {users.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  {isBangla ? 'কোনো সদস্য প্রোফাইল পাওয়া যায়নি।' : 'No user profiles found in live database.'}
                </div>
              )}
            </div>
          </div>

          {/* Quota modification editor form */}
          {selectedTargetUser ? (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedTargetUser.photoUrl} 
                  alt={selectedTargetUser.displayName} 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <span>{selectedTargetUser.displayName}</span>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-500/20 text-rose-300">
                      {selectedTargetUser.profileCode}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phone: <span className="text-slate-300 font-mono">{selectedTargetUser.phone}</span> • District: {selectedTargetUser.locationDistrict}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300">
                Current: <strong className="text-rose-400 font-bold">{selectedTargetUser.packageTier}</strong>
              </span>
            </div>

            {/* Tier selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{isBangla ? 'প্যাকেজ পরিবর্তন / অ্যাসাইন করুন:' : 'Change Package Tier:'}</span>
                <span className="text-[11px] text-slate-400 font-normal">Customer Support Override</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Free', 'Silver', 'Gold', 'Diamond'] as PackageTier[]).map(tier => {
                  const isCur = selectedTier === tier;
                  const tierPricing: Record<PackageTier, string> = {
                    Free: '৳0 (Lifetime)',
                    Silver: '৳490 (1 Month)',
                    Gold: '৳990 (3 Months)',
                    Diamond: '৳1990 (6 Months)'
                  };

                  return (
                    <div
                      key={tier}
                      onClick={() => {
                        setSelectedTier(tier);
                        if (tier === 'Diamond') {
                          setBonusInterests(999);
                          setBonusContacts(999);
                        } else if (tier === 'Gold') {
                          setBonusInterests(40);
                          setBonusContacts(25);
                        } else if (tier === 'Silver') {
                          setBonusInterests(20);
                          setBonusContacts(10);
                        } else {
                          setBonusInterests(2);
                          setBonusContacts(0);
                        }
                      }}
                      className={`
                        p-3 rounded-xl border cursor-pointer text-center transition-all
                        ${isCur 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-md font-bold' 
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'}
                      `}
                    >
                      <span className="block font-bold text-sm text-slate-100">{tier}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tierPricing[tier]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quota Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Proposal Interests Quota */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  {isBangla ? 'প্রস্তাব কোটা (Interests Left)' : 'Marriage Proposal Quota'}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBonusInterests(prev => Math.max(0, prev - 5))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-black text-xl text-rose-400 w-16 text-center">
                      {bonusInterests >= 999 ? '∞ Unltd' : bonusInterests}
                    </span>
                    <button
                      onClick={() => setBonusInterests(prev => prev + 5)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setBonusInterests(prev => prev + 10)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      +10
                    </button>
                    <button 
                      onClick={() => setBonusInterests(prev => prev + 25)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Unlocks Quota */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  {isBangla ? 'যোগাযোগ আনলক কোটা (Contacts Left)' : 'Phone & Guardian Contact Unlocks'}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBonusContacts(prev => Math.max(0, prev - 2))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-black text-xl text-emerald-400 w-16 text-center">
                      {bonusContacts >= 999 ? '∞ Unltd' : bonusContacts}
                    </span>
                    <button
                      onClick={() => setBonusContacts(prev => prev + 2)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setBonusContacts(prev => prev + 5)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      +5
                    </button>
                    <button 
                      onClick={() => setBonusContacts(prev => prev + 15)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      +15
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Support reason note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                {isBangla ? 'কাস্টমার সাপোর্ট কারণ / নোট:' : 'Support Reason for Adjustment:'}
              </label>
              <input
                type="text"
                placeholder={isBangla ? "যেমন: অভিভাবকের ফোনে কথা বলে ৫টি বোনাস কন্টাক্ট প্রদান করা হলো..." : "e.g. Compensated 5 contact credits after guardian consultation..."}
                value={supportNote}
                onChange={(e) => setSupportNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveQuota}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isBangla ? 'কোটা ও প্যাকেজ আপডেট সংরক্ষণ করুন' : 'Apply Quota & Package Override'}</span>
              </button>
            </div>

          </div>
          ) : (
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              {isBangla ? 'কোটা সম্পাদনা করতে বাম পাশের তালিকা থেকে সদস্য নির্বাচন করুন।' : 'Select a member from the left list to edit package quota.'}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: Revenue & Subscription Logs */}
      {activeTab === 'REVENUE_LOGS' && (() => {
        const approvedPayments = paymentRequests.filter(p => p.status === 'APPROVED');
        const bkashRequests = approvedPayments.filter(p => p.paymentMethod === 'bKash');
        const bkashTotal = bkashRequests.reduce((acc, p) => acc + p.amountBdt, 0);

        const nagadRequests = approvedPayments.filter(p => p.paymentMethod === 'Nagad');
        const nagadTotal = nagadRequests.reduce((acc, p) => acc + p.amountBdt, 0);

        const otherRequests = approvedPayments.filter(p => p.paymentMethod !== 'bKash' && p.paymentMethod !== 'Nagad');
        const otherTotal = otherRequests.reduce((acc, p) => acc + p.amountBdt, 0);

        const grandTotal = bkashTotal + nagadTotal + otherTotal;
        const bkashShare = grandTotal > 0 ? Math.round((bkashTotal / grandTotal) * 100) : 0;
        const nagadShare = grandTotal > 0 ? Math.round((nagadTotal / grandTotal) * 100) : 0;
        const otherShare = grandTotal > 0 ? Math.max(0, 100 - bkashShare - nagadShare) : 0;

        const paidSubscribers = users.filter(u => u.packageTier !== 'Free');

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>bKash Merchant (01700-000000)</span>
                  <span className="text-pink-400">{bkashShare}% Share</span>
                </div>
                <div className="text-2xl font-black text-slate-100">৳{bkashTotal.toLocaleString()}</div>
                <p className="text-[11px] text-slate-400 mt-1">{bkashRequests.length} transactions processed</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>Nagad Merchant (01819-000000)</span>
                  <span className="text-orange-400">{nagadShare}% Share</span>
                </div>
                <div className="text-2xl font-black text-slate-100">৳{nagadTotal.toLocaleString()}</div>
                <p className="text-[11px] text-slate-400 mt-1">{nagadRequests.length} transactions processed</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>Rocket / Bank Transfer</span>
                  <span className="text-purple-400">{otherShare}% Share</span>
                </div>
                <div className="text-2xl font-black text-slate-100">৳{otherTotal.toLocaleString()}</div>
                <p className="text-[11px] text-slate-400 mt-1">{otherRequests.length} transactions processed</p>
              </div>
            </div>

            {/* Active Paid Subscribers Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">
                  {isBangla ? 'চলতি পেইড সাবস্ক্রাইবার তালিকা' : 'Active Paid Subscribers & Package Health'}
                </h3>
                <span className="text-xs text-slate-400">
                  {paidSubscribers.length} Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Package Tier</th>
                      <th className="py-2.5 px-3">Remaining Interests</th>
                      <th className="py-2.5 px-3">Remaining Contacts</th>
                      <th className="py-2.5 px-3">Verified Badge</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {paidSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          {isBangla ? 'বর্তমানে কোনো পেইড সাবস্ক্রাইবার নেই।' : 'No active paid subscribers yet in live database.'}
                        </td>
                      </tr>
                    ) : (
                      paidSubscribers.map(u => (
                        <tr key={u.profileCode} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <img src={u.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                              <span className="font-bold text-slate-100">{u.displayName} ({u.profileCode})</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-500/20 text-rose-300">
                              {u.packageTier} Plan
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-rose-300 font-bold">
                            {u.interestsRemaining >= 999 ? 'Unlimited' : u.interestsRemaining}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                            {u.contactsRemaining >= 999 ? 'Unlimited' : u.contactsRemaining}
                          </td>
                          <td className="py-2.5 px-3">
                            {u.isVerified ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-slate-500">Unverified</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reject Payment Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-200">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>{isBangla ? 'পেমেন্ট TrxID বাতিল করুন' : 'Reject Payment Request'}</span>
            </div>

            <p className="text-xs text-slate-400">
              {isBangla
                ? `প্রার্থী ${rejectingItem.displayName}-এর জমা দেওয়া TrxID (${rejectingItem.transactionId}) বাতিলের কারণ লিখুন:`
                : `Enter reason why TrxID (${rejectingItem.transactionId}) from ${rejectingItem.displayName} is being rejected:`}
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="Transaction ID not found in merchant statement">Transaction ID not found in merchant statement</option>
              <option value="Amount paid does not match package fee (৳490 / ৳990 / ৳1990)">Amount paid does not match package fee</option>
              <option value="Duplicate TrxID already claimed by another user">Duplicate TrxID already claimed by another user</option>
              <option value="Payment reversed or cancelled by bank/bKash">Payment reversed or cancelled by bank/bKash</option>
            </select>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectPayment(rejectingItem.id, rejectReason);
                  setRejectingItem(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
