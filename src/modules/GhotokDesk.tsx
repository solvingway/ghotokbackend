import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  PhoneCall, 
  Send, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  ShieldCheck,
  CheckCircle2,
  FileText,
  Check
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { UserBiodata, GuardianCallLog } from '../types/admin';

export const GhotokDesk: React.FC = () => {
  const { 
    users, 
    callLogs, 
    addCallLog, 
    sendGhotokRecommendation, 
    isBangla 
  } = useAdminData();

  const [activeSubTab, setActiveSubTab] = useState<'MATCHMAKER' | 'CALL_LOGS'>('MATCHMAKER');
  const [selectedClientCode, setSelectedClientCode] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  
  // Call Log form state
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [callLogForm, setCallLogForm] = useState({
    profileCode: '',
    userName: '',
    guardianName: '',
    guardianPhone: '',
    callType: 'Match Consultation' as const,
    adminName: 'Begum Laila (Matchmaker)',
    notes: '',
    followUpDate: '',
    status: 'Completed' as const
  });

  // Recommendation modal state
  const [recommendingCandidate, setRecommendingCandidate] = useState<UserBiodata | null>(null);
  const [recommendationNote, setRecommendationNote] = useState('');

  // Find active client
  const activeClient = users.find(u => u.profileCode === selectedClientCode) || users[0] || null;

  // Candidates of opposite gender for compatibility ranking
  const candidatePool = useMemo(() => {
    if (!activeClient) return [];
    const targetGender = activeClient.gender === 'Female' ? 'Male' : 'Female';
    return users.filter(u => 
      u.gender === targetGender && 
      u.accountStatus === 'ACTIVE' && 
      u.profileCode !== activeClient.profileCode
    );
  }, [activeClient, users]);

  // Compatibility ranking algorithm
  const rankedMatches = useMemo(() => {
    if (!activeClient) return [];

    return candidatePool.map(candidate => {
      let score = 40; // Base score
      const matchReasons: string[] = [];

      // 1. Religion match (+25)
      if (candidate.religion.toLowerCase().includes(activeClient.religion.toLowerCase().split(' ')[0])) {
        score += 25;
        matchReasons.push(isBangla ? 'একই ধর্মীয় বিশ্বাস' : 'Shared Religion');
      }

      // 2. Age compatibility (+15)
      const ageDiff = Math.abs(activeClient.age - candidate.age);
      if (activeClient.gender === 'Female') {
        if (candidate.age >= activeClient.age && candidate.age <= activeClient.age + 6) {
          score += 18;
          matchReasons.push(isBangla ? 'আদর্শ বয়স ব্যবধান' : 'Ideal Age Gap');
        } else if (candidate.age >= activeClient.age - 1 && candidate.age <= activeClient.age + 8) {
          score += 10;
        }
      } else {
        if (candidate.age <= activeClient.age && candidate.age >= activeClient.age - 6) {
          score += 18;
          matchReasons.push(isBangla ? 'আদর্শ বয়স ব্যবধান' : 'Ideal Age Gap');
        } else if (ageDiff <= 6) {
          score += 10;
        }
      }

      // 3. Location / District compatibility (+15)
      if (candidate.locationDistrict.toLowerCase() === activeClient.locationDistrict.toLowerCase()) {
        score += 15;
        matchReasons.push(isBangla ? `উভয়ের বর্তমান জেলা ${activeClient.locationDistrict}` : `Both in ${activeClient.locationDistrict}`);
      } else if (candidate.locationDivision.toLowerCase() === activeClient.locationDivision.toLowerCase()) {
        score += 8;
        matchReasons.push(isBangla ? `উভয়ে ${activeClient.locationDivision} বিভাগের` : `Both in ${activeClient.locationDivision} Division`);
      }

      // 4. Education & Profession synergy (+15)
      const highEducations = ["Bachelor's", "Master's", "MBBS", "PhD"];
      const isClientHighEdu = highEducations.some(e => activeClient.educationLevel.includes(e));
      const isCandHighEdu = highEducations.some(e => candidate.educationLevel.includes(e));
      if (isClientHighEdu && isCandHighEdu) {
        score += 12;
        matchReasons.push(isBangla ? 'উচ্চশিক্ষিত ব্যাকগ্রাউন্ড' : 'Higher Education Synergy');
      }

      if (
        (activeClient.profession.includes('Engineer') && candidate.profession.includes('Engineer')) ||
        (activeClient.profession.includes('Doctor') && candidate.profession.includes('Doctor')) ||
        (candidate.profession.includes('BCS') || candidate.profession.includes('Govt'))
      ) {
        score += 8;
        matchReasons.push(isBangla ? 'পেশাগত মর্যাদা মিল' : 'Professional Prestige');
      }

      // 5. Overseas status (+10)
      if (
        (candidate.overseasCountry && candidate.overseasCountry !== 'None (Living in BD)') ||
        (activeClient.overseasCountry && activeClient.overseasCountry !== 'None (Living in BD)')
      ) {
        score += 7;
        matchReasons.push(isBangla ? 'প্রবাসী সংযোগ' : 'Overseas / PR Profile');
      }

      // Verified boost
      if (candidate.isVerified) {
        score += 5;
      }

      const finalScore = Math.min(98, Math.max(52, score));
      return {
        candidate,
        score: finalScore,
        reasons: matchReasons
      };
    }).sort((a, b) => b.score - a.score);
  }, [activeClient, candidatePool, isBangla]);

  const handleOpenCallLogForClient = (client: UserBiodata) => {
    setCallLogForm({
      profileCode: client.profileCode,
      userName: client.displayName,
      guardianName: client.guardianRelation || 'Guardian',
      guardianPhone: client.guardianPhone || client.phone,
      callType: 'Match Consultation',
      adminName: 'Begum Laila (Matchmaker)',
      notes: '',
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Completed'
    });
    setShowCallLogModal(true);
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    addCallLog(callLogForm);
    setShowCallLogModal(false);
  };

  const handlePushRecommendation = () => {
    if (!activeClient || !recommendingCandidate) return;
    sendGhotokRecommendation(activeClient.profileCode, recommendingCandidate.profileCode, recommendationNote);
    setRecommendingCandidate(null);
    setRecommendationNote('');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'ঘটক ডেস্ক (অ্যাসিস্টেড ম্যাচমেকিং ও অভিভাবক হেল্পলাইন)' : 'Assisted Matchmaking ("Ghotok Desk")'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Family VIP Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'অভিভাবকদের সাথে ব্যক্তিগত যোগাযোগ, কম্পিউটার অ্যালগরিদম ভিত্তিক ম্যাচ রেঙ্কিং এবং ঘটক সুপারিশ প্রেরণ।'
              : 'Auto-ranked compatibility finder for clients, push curated recommendations, and track private guardian phone logs.'}
          </p>
        </div>

        {/* Tab switch: Matchmaker vs Call Logs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('MATCHMAKER')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'MATCHMAKER' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBangla ? 'কম্প্যাটিবিলিটি ফাইন্ডার' : 'Match Finder'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CALL_LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'CALL_LOGS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isBangla ? 'অভিভাবক কল লগ' : 'Guardian Call Log'} ({callLogs.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'MATCHMAKER' && (
        <div className="space-y-6">
          
          {/* Top Client Selector Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>{isBangla ? 'ক্লায়েন্ট প্রোফাইল নির্বাচন করুন:' : 'Select Client for Matchmaking:'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'ক্লায়েন্টের পছন্দ অনুযায়ী বিপরীত লিঙ্গের প্রার্থীদের স্বয়ংক্রিয়ভাবে রেঙ্ক করা হবে:'
                    : 'Select a bride or groom to see auto-ranked compatible profiles based on religion, age, district, and profession.'}
                </p>
              </div>

              {/* Client search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={isBangla ? "ক্লায়েন্ট খুঁজুন..." : "Filter clients..."}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Horizontal Client Carousel */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1">
              {users
                .filter(u => !clientSearch || u.displayName.toLowerCase().includes(clientSearch.toLowerCase()) || u.profileCode.toLowerCase().includes(clientSearch.toLowerCase()))
                .map(client => {
                  const isSelected = selectedClientCode === client.profileCode;
                  const isBride = client.gender === 'Female';

                  return (
                    <button
                      key={client.profileCode}
                      onClick={() => setSelectedClientCode(client.profileCode)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all
                        ${isSelected 
                          ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md text-slate-100' 
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                      `}
                    >
                      <img 
                        src={client.photoUrl} 
                        alt={client.displayName} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-700" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate max-w-[110px]">{client.displayName}</span>
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                            isBride ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {client.profileCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {client.age} yrs • {client.locationDistrict}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Active Client Details Card */}
          {activeClient && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={activeClient.photoUrl} 
                      alt={activeClient.displayName} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[9px] font-black uppercase">
                      Client
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-100">
                        {isBangla && activeClient.displayNameBangla ? activeClient.displayNameBangla : activeClient.displayName}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${
                        activeClient.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {activeClient.profileCode}
                      </span>
                      {activeClient.isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300 mt-1">
                      <strong>{activeClient.age} yrs</strong> • {activeClient.height} • {activeClient.religion} • 
                      <span className="text-indigo-300 font-semibold ml-1">{activeClient.profession}</span> ({activeClient.jobOrganization || 'General'})
                    </p>
                    
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{activeClient.presentAddress || activeClient.locationDistrict}</span> • 
                      <span>Permanent: {activeClient.permanentDistrict}</span>
                    </p>
                  </div>
                </div>

                {/* Right call & info trigger */}
                <div className="flex items-center gap-2.5 self-start md:self-center">
                  <button
                    onClick={() => handleOpenCallLogForClient(activeClient)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'অভিভাবককে কল করুন' : 'Log Guardian Call'}</span>
                  </button>

                  <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Guardian Contact</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{activeClient.guardianPhone}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Auto-Ranked Compatible Matches List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isBangla ? `${activeClient?.displayName}-এর জন্য সেরা প্রস্তাবসমূহ (স্বয়ংক্রিয় ম্যাচ রেঙ্কিং)` : `Auto-Ranked Matches for ${activeClient?.displayName}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isBangla ? 'বয়স, জেলা, পেশা, ধর্ম ও প্রবাসী স্ট্যাটাস বিশ্লেষণে রেঙ্ক করা হয়েছে:' : 'Ranked by Ghotok algorithm across religion, location, career, and family background:'}
                </p>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                {rankedMatches.length} Candidates Available
              </span>
            </div>

            {rankedMatches.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                {isBangla ? 'কোনো উপযুক্ত প্রার্থী পাওয়া যায়নি।' : 'No compatible candidates found in live database.'}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rankedMatches.slice(0, 8).map(({ candidate, score, reasons }) => {
                const isBride = candidate.gender === 'Female';

                return (
                  <div
                    key={candidate.profileCode}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div>
                      {/* Top Match Card Row */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={candidate.photoUrl} 
                            alt={candidate.displayName}
                            className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow" 
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-slate-100">
                                {isBangla && candidate.displayNameBangla ? candidate.displayNameBangla : candidate.displayName}
                              </h4>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                isBride ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {candidate.profileCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {candidate.age} yrs • {candidate.height} • {candidate.religion}
                            </p>
                            <p className="text-xs text-indigo-300 font-medium">
                              {candidate.profession} ({candidate.jobOrganization || candidate.educationLevel})
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-center p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                          <div className={`text-base font-black ${
                            score >= 90 ? 'text-emerald-400' :
                            score >= 75 ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {score}%
                          </div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            Match
                          </span>
                        </div>
                      </div>

                      {/* Reasons why compatible */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {reasons.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            {r}
                          </span>
                        ))}
                      </div>

                      {/* Location snippet */}
                      <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {candidate.locationDistrict} {candidate.overseasCountry && candidate.overseasCountry !== 'None (Living in BD)' && `(${candidate.overseasCountry})`}
                        </span>
                        <span className="font-mono text-slate-500">
                          Guardian: {candidate.guardianPhone}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: Push recommendation */}
                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Tier: <strong className="text-slate-200">{candidate.packageTier}</strong>
                      </span>

                      <button
                        onClick={() => {
                          setRecommendingCandidate(candidate);
                          setRecommendationNote(`Assalamu Alaikum, Ghotok Matchmaker recommends ${candidate.displayName} (${candidate.profileCode}) as an excellent family match based on shared values and district.`);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isBangla ? 'ক্লায়েন্টকে সুপারিশ পাঠান' : 'Push Ghotok Recommendation'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: Guardian Call Log */}
      {activeSubTab === 'CALL_LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              <span>{isBangla ? 'অভিভাবক কল লগ ও ফলো-আপ নোট' : 'Guardian Call & Matchmaking Consultation Logs'}</span>
            </h3>

            <button
              onClick={() => handleOpenCallLogForClient(activeClient)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBangla ? 'নতুন কল লগ যোগ করুন' : 'New Call Log'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {callLogs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                {isBangla ? 'কোনো অভিভাবক কল লগ নেই। নতুন কল লগ যোগ করতে ওপরের বাটনে ক্লিক করুন।' : 'No guardian call logs recorded yet in live database. Click above to log your first family consultation.'}
              </div>
            ) : (
              callLogs.map(log => (
                <div 
                  key={log.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <PhoneCall className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{log.userName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                            {log.profileCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {log.callType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Guardian: <strong className="text-slate-300">{log.guardianName}</strong> ({log.guardianPhone})
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">{log.callDate}</span>
                      <span className="text-[11px] text-indigo-300 font-medium">Logged by: {log.adminName}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Admin Notes:</span>
                    <p className="leading-relaxed">"{log.notes}"</p>
                  </div>

                  {log.followUpDate && (
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Follow-up scheduled: <strong className="text-slate-200">{log.followUpDate}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Push Recommendation Modal */}
      {recommendingCandidate && activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-200">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <Send className="w-5 h-5" />
              <span>{isBangla ? 'ঘটক অফিশিয়াল প্রস্তাব সুপারিশ পাঠান' : 'Push Ghotok Recommendation'}</span>
            </div>

            <p className="text-xs text-slate-400">
              {isBangla
                ? `ক্লায়েন্ট ${activeClient.displayName} (${activeClient.profileCode})-এর কাছে পাত্র/পাত্রী ${recommendingCandidate.displayName} (${recommendingCandidate.profileCode})-কে সুপারিশ হিসেবে পাঠাতে বার্তাটি নিশ্চিত করুন:`
                : `Dispatch official Ghotok Matchmaker recommendation of candidate ${recommendingCandidate.displayName} (${recommendingCandidate.profileCode}) to client ${activeClient.displayName}:`}
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
              <img src={recommendingCandidate.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
              <div className="text-xs">
                <span className="font-bold text-slate-100 block">{recommendingCandidate.displayName} ({recommendingCandidate.profileCode})</span>
                <span className="text-slate-400">{recommendingCandidate.age} yrs • {recommendingCandidate.profession} • {recommendingCandidate.locationDistrict}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isBangla ? 'পরামর্শ বার্তা (Message to Family):' : 'Custom Matchmaker Note to Family:'}
              </label>
              <textarea
                rows={3}
                value={recommendationNote}
                onChange={(e) => setRecommendationNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRecommendingCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePushRecommendation}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Dispatch Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Guardian Call Modal */}
      {showCallLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-100">
                  {isBangla ? 'অভিভাবক কল ও কনসালটেশন লগ' : 'Record Guardian Call Log'}
                </h3>
              </div>
              <button onClick={() => setShowCallLogModal(false)} className="text-slate-400 hover:text-slate-100">✕</button>
            </div>

            <form onSubmit={handleSaveCallLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Profile Code</label>
                  <input
                    type="text"
                    required
                    value={callLogForm.profileCode}
                    onChange={(e) => setCallLogForm({ ...callLogForm, profileCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={callLogForm.userName}
                    onChange={(e) => setCallLogForm({ ...callLogForm, userName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Guardian Name &amp; Relation</label>
                  <input
                    type="text"
                    required
                    value={callLogForm.guardianName}
                    onChange={(e) => setCallLogForm({ ...callLogForm, guardianName: e.target.value })}
                    placeholder="e.g. Father, Mother, Uncle"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Guardian Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={callLogForm.guardianPhone}
                    onChange={(e) => setCallLogForm({ ...callLogForm, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Call Type</label>
                  <select
                    value={callLogForm.callType}
                    onChange={(e) => setCallLogForm({ ...callLogForm, callType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="Match Consultation">Match Consultation</option>
                    <option value="Inbound Inquiry">Inbound Inquiry</option>
                    <option value="Outbound Verification">Outbound Verification</option>
                    <option value="Complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={callLogForm.followUpDate}
                    onChange={(e) => setCallLogForm({ ...callLogForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Private Matchmaker Conversation Notes *</label>
                <textarea
                  rows={4}
                  required
                  placeholder={isBangla ? "অভিভাবকের সাথে আলাপের বিস্তারিত বিবরণ (যেমন: বরের বয়স, পড়াশোনা বা জেলার সুনির্দিষ্ট শর্ত)..." : "Specific expectations, guardian preferences, family tone, agreed shortlist criteria..."}
                  value={callLogForm.notes}
                  onChange={(e) => setCallLogForm({ ...callLogForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCallLogModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
