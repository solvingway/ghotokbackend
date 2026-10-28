import React, { useState } from 'react';
import { 
  Send, 
  Bell, 
  Smartphone, 
  Users, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  MessageSquare,
  Globe,
  Radio,
  FileText
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { BroadcastAnnouncement } from '../types/admin';

export const BroadcastCenter: React.FC = () => {
  const { broadcasts, sendBroadcast, isBangla } = useAdminData();

  const [titleEn, setTitleEn] = useState('Verify Your NID Today for 3x More Marriage Proposals');
  const [titleBn, setTitleBn] = useState('৩ গুণ বেশি বিয়ের প্রস্তাব পেতে আজই এনআইডি ভেরিফাই করুন');
  const [messageEn, setMessageEn] = useState('Bangladeshi families prioritize verified biodatas. Upload your Smart NID or Passport to receive the official Verified Badge.');
  const [messageBn, setMessageBn] = useState('পরিবারের কাছে বিশ্বস্ততাই আসল। আজই স্মার্ট এনআইডি বা পাসপোর্ট আপলোড করে আপনার বায়োডাটায় অফিশিয়াল ভেরিফাইড ব্যাজ গ্রহণ করুন।');
  const [targetAudience, setTargetAudience] = useState<BroadcastAnnouncement['targetAudience']>('UNVERIFIED');
  const [actionRoute, setActionRoute] = useState<'PACKAGES' | 'VERIFY' | 'MATCHES' | 'PROFILE'>('VERIFY');
  const [channels, setChannels] = useState<('IN_APP' | 'PUSH' | 'SMS')[]>(['IN_APP', 'PUSH']);
  const [previewLanguage, setPreviewLanguage] = useState<'EN' | 'BN'>('BN');

  const SEGMENT_LABELS: Record<string, string> = {
    UNVERIFIED: "Unverified Users (Nudge to submit Smart NID / Passport)",
    INCOMPLETE_ONBOARDING: "Incomplete Onboarding Drafts (in onboardingDrafts collection)",
    FREE_TIERS: "Free-Tier Members (Discount & Upgrade campaign)",
    ALL: "All Registered Members (4,800+ Users)",
    DIAMOND_VIP: "Diamond VIP Members (Exclusive matchmaker invites)",
    DHAKA_DIVISION: "Dhaka Division Members Only",
    OVERSEAS: "Overseas & NRB Profiles (UK, USA, Canada, Gulf)"
  };

  const QUICK_TEMPLATES = [
    {
      label: isBangla ? 'এনআইডি ভেরিফিকেশন তাগিদ' : 'NID Verification Prompt',
      en: {
        title: 'Verify Your NID Today for 3x More Marriage Proposals',
        msg: 'Bangladeshi families prioritize verified biodatas. Upload your Smart NID or Passport to receive the official Verified Badge.'
      },
      bn: {
        title: '৩ গুণ বেশি বিয়ের প্রস্তাব পেতে আজই এনআইডি ভেরিফাই করুন',
        msg: 'পরিবারের কাছে বিশ্বস্ততাই আসল। আজই স্মার্ট এনআইডি বা পাসপোর্ট আপলোড করে আপনার বায়োডাটায় অফিশিয়াল ভেরিফাইড ব্যাজ গ্রহণ করুন।'
      },
      target: 'UNVERIFIED' as const,
      route: 'VERIFY' as const
    },
    {
      label: isBangla ? 'অসম্পূর্ণ বায়োডাটা পূরণ করার তাগিদ' : 'Incomplete Draft Reminder',
      en: {
        title: 'Your Matrimonial Biodata is 80% Complete',
        msg: 'Families are actively browsing matches in your district. Complete the remaining partner preference steps to publish your biodata.'
      },
      bn: {
        title: 'আপনার বিয়ের বায়োডাটা ৮০% সম্পন্ন হয়েছে',
        msg: 'আপনার জেলার পরিবারগুলো নিয়মিত উপযুক্ত পাত্র-পাত্রী খুঁজছেন। বাকি পছন্দগুলো পূরণ করে বায়োডাটা প্রকাশ করুন।'
      },
      target: 'INCOMPLETE_ONBOARDING' as const,
      route: 'PROFILE' as const
    },
    {
      label: isBangla ? 'প্যাকেজে ২৫% বিশেষ ছাড় (ফ্রি সদস্যদের জন্য)' : '25% Festive Discount (Free Tiers)',
      en: {
        title: 'Special 25% Off on Golden Nikah & Family Diamond Tiers',
        msg: 'Unlock verified direct phone numbers & guardian contacts today. Use promo code GHOTOK25 at checkout.'
      },
      bn: {
        title: 'গোল্ডেন নিকাহ ও ডায়মন্ড প্যাকেজে বিশেষ ২৫% ছাড়!',
        msg: 'সরাসরি মোবাইল নম্বর ও অভিভাবকের তথ্য আনলক করুন এখনই। চেকআউটে বিকাশ বা নগদে বিশেষ ছাড় উপভোগ করুন।'
      },
      target: 'FREE_TIERS' as const,
      route: 'PACKAGES' as const
    }
  ];

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setTitleEn(tmpl.en.title);
    setTitleBn(tmpl.bn.title);
    setMessageEn(tmpl.en.msg);
    setMessageBn(tmpl.bn.msg);
    setTargetAudience(tmpl.target);
    setActionRoute(tmpl.route);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleBn.trim()) return;

    sendBroadcast({
      titleEn,
      titleBn,
      messageEn,
      messageBn,
      targetAudience,
      targetSegment: SEGMENT_LABELS[targetAudience] || targetAudience,
      channels,
      actionRoute,
      showBanner: channels.includes('IN_APP'),
      pushNotification: channels.includes('PUSH')
    });
  };

  const toggleChannel = (ch: 'IN_APP' | 'PUSH' | 'SMS') => {
    setChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
              <Send className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'ব্রডকাস্ট ও নোটিফিকেশন সেন্টার' : 'Broadcast & Notification Center'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              English &amp; বাংলা
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'নির্দিষ্ট গ্রুপের ব্যবহারকারীদের কাছে (অসম্পূর্ণ ড্রাফট, অনিবন্ধিত বা ফ্রি সদস্য) টার্গেটেড ইন-অ্যাপ ও পুশ নোটিফিকেশন পাঠান।'
              : 'Send segment-targeted announcements in English & Bengali to incomplete onboarding drafts, unverified users, or free tiers.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Composer (7 cols) + Mobile Notification Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COMPOSER (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          
          {/* Quick Template Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBangla ? 'প্রস্তুত টেমপ্লেট নির্বাচন করুন:' : 'Quick Notification Templates:'}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            
            {/* Target Audience Segmentation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                {isBangla ? 'টার্গেট অডিয়েন্স / গ্রাহক সেগমেন্ট *' : 'Target Audience Segment *'}
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="UNVERIFIED">Unverified Users (Nudge to submit Smart NID / Passport)</option>
                <option value="INCOMPLETE_ONBOARDING">Incomplete Onboarding Drafts (in onboardingDrafts collection)</option>
                <option value="FREE_TIERS">Free-Tier Members (Discount &amp; Upgrade campaign)</option>
                <option value="ALL">All Registered Members (4,800+ Users)</option>
                <option value="DIAMOND_VIP">Diamond VIP Members (Exclusive matchmaker invites)</option>
                <option value="DHAKA_DIVISION">Dhaka Division Members Only</option>
                <option value="OVERSEAS">Overseas &amp; NRB Profiles (UK, USA, Canada, Gulf)</option>
              </select>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                {isBangla ? 'ডেলিভারি চ্যানেলসমূহ:' : 'Delivery Channels:'}
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'IN_APP', label: isBangla ? 'ইন-অ্যাপ ব্যানার ও বেল' : 'In-App Notification & Bell' },
                  { id: 'PUSH', label: isBangla ? 'মোবাইল পুশ নোটিফিকেশন' : 'Push Notification' },
                  { id: 'SMS', label: isBangla ? 'এসএমএস গেটওয়ে (ঐচ্ছিক)' : 'SMS Alert' }
                ].map((ch) => {
                  const isChecked = channels.includes(ch.id as any);
                  return (
                    <label 
                      key={ch.id} 
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all
                        ${isChecked 
                          ? 'bg-rose-500/15 border-rose-500/60 text-rose-200 font-semibold' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChannel(ch.id as any)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>{ch.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Deep Navigation Action Route */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block flex items-center justify-between">
                <span>{isBangla ? 'এক-ট্যাপে নেভিগেশন রুট (Android Deep Link):' : 'One-Tap Action Route (Android Deep Link):'}</span>
                <span className="text-[10px] text-rose-400 font-mono">actionRoute: {actionRoute}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'VERIFY', label: isBangla ? 'এনআইডি ভেরিফাই' : 'Verify NID', desc: 'Opens ID Verification tab' },
                  { id: 'PACKAGES', label: isBangla ? 'প্যাকেজ কিনুন' : 'Upgrade Packages', desc: 'Opens Packages screen' },
                  { id: 'MATCHES', label: isBangla ? 'ম্যাচ বায়োডাটা' : 'Browse Matches', desc: 'Opens Matches tab' },
                  { id: 'PROFILE', label: isBangla ? 'আমার প্রোফাইল' : 'My Biodata', desc: 'Opens Profile Edit screen' }
                ].map((route) => {
                  const isSelected = actionRoute === route.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setActionRoute(route.id as any)}
                      className={`
                        p-2.5 rounded-xl border text-left transition-all
                        ${isSelected 
                          ? 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500/50 text-slate-100 shadow-sm' 
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                      `}
                    >
                      <div className="font-bold text-xs">{route.label}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{route.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bilingual Content Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-rose-400" />
                  {isBangla ? 'বার্তা রচনা (English & বাংলা)' : 'Announcement Copy (English & বাংলা)'}
                </span>
                <span className="text-[11px] text-slate-400">Users receive language per app setting</span>
              </div>

              {/* Bengali Version */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-amber-300 block">
                  বাংলা সংস্করণ (Bengali Copy):
                </span>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="বাংলা শিরোনাম..."
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-bengali"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="বাংলা বিস্তারিত বার্তা..."
                    value={messageBn}
                    onChange={(e) => setMessageBn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-bengali"
                  />
                </div>
              </div>

              {/* English Version */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-blue-300 block">
                  English Copy:
                </span>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="English Title..."
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="English detailed message..."
                    value={messageEn}
                    onChange={(e) => setMessageEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isBangla ? 'ব্রডকাস্ট প্রেরণ করুন' : 'Dispatch Targeted Broadcast'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* MOBILE NOTIFICATION PREVIEW (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>{isBangla ? 'স্মার্টফোন পুশ প্রিভিউ' : 'Live Mobile Alert Preview'}</span>
            </h3>

            {/* Toggle Preview Language */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-[10px] font-bold">
              <button
                onClick={() => setPreviewLanguage('BN')}
                className={`px-2 py-0.5 rounded ${previewLanguage === 'BN' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setPreviewLanguage('EN')}
                className={`px-2 py-0.5 rounded ${previewLanguage === 'EN' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                ENG
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {isBangla 
              ? 'ব্যবহারকারীর ফোনে অ্যান্ড্রয়েড নোটিফিকেশন কেমন দেখাবে তা নিচে সরাসরি দেখা যাচ্ছে:' 
              : 'Real-time rendering of what members see on Android notification drawer & in-app modal:'}
          </p>

          {/* Phone Frame Simulator */}
          <div className="mx-auto max-w-[320px] bg-slate-950 border-4 border-slate-800 rounded-[32px] p-4 shadow-2xl relative">
            
            {/* Top Phone speaker notch */}
            <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-4" />

            {/* Simulated Android Notification Banner */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <div className="w-4 h-4 rounded bg-rose-600 p-0.5 flex items-center justify-center">
                    <img src="/ghotok_logo.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <span>GHOTOK MATRIMONY</span>
                </div>
                <span>Just now</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-100 leading-snug">
                  {previewLanguage === 'BN' ? (titleBn || 'ঘোষণার শিরোনাম') : (titleEn || 'Announcement Title')}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {previewLanguage === 'BN' ? (messageBn || 'বিস্তারিত বার্তা...') : (messageEn || 'Detailed notification message...')}
                </p>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-rose-400 font-semibold">
                <span>View Details</span>
                <span>Open Ghotok</span>
              </div>
            </div>

            {/* Simulated App In-box Card */}
            <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
                <Bell className="w-3 h-3 text-amber-400" />
                <span>In-App Announcement Card</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {previewLanguage === 'BN' ? titleBn : titleEn}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Broadcast History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{isBangla ? 'বিগত ব্রডকাস্টের তালিকা ও পারফরম্যান্স' : 'Broadcast Dispatch History & Delivery Performance'}</span>
          </h3>
          <span className="text-xs text-slate-400">{broadcasts.length} Dispatched</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isBangla ? 'শিরোনাম ও বিষয়' : 'Title & Preview'}</th>
                <th className="py-3 px-4">{isBangla ? 'টার্গেট সেগমেন্ট' : 'Audience Segment'}</th>
                <th className="py-3 px-4">{isBangla ? 'চ্যানেল' : 'Channels'}</th>
                <th className="py-3 px-4">{isBangla ? 'প্রেরণের সময়' : 'Sent Timestamp'}</th>
                <th className="py-3 px-4">{isBangla ? 'প্রাপক সংখ্যা' : 'Recipients'}</th>
                <th className="py-3 px-4">{isBangla ? 'ক্লিক রেট' : 'Engagement'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {broadcasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    {isBangla ? 'কোনো পূর্ববর্তী ব্রডকাস্ট রেকর্ড নেই।' : 'No broadcast announcements dispatched yet.'}
                  </td>
                </tr>
              ) : (
                broadcasts.map(bc => (
                <tr key={bc.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-100 block">{bc.titleBn || bc.titleEn}</span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-xs">{bc.messageBn || bc.messageEn}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
                      {bc.targetAudience}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {bc.channels.map(ch => (
                        <span key={ch} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    {bc.sentAt}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {bc.recipientCount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {bc.clickCount > 0 ? `${Math.round((bc.clickCount / bc.recipientCount) * 100)}%` : 'Active'}
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
};
