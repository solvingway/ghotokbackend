import React, { useState } from 'react';
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Calendar, 
  User, 
  FileText, 
  Phone, 
  MapPin, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  Check, 
  ExternalLink,
  Copy,
  Maximize2
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { VerificationRequestItem } from '../types/admin';

export const KYCVerificationQueue: React.FC = () => {
  const { 
    verificationRequests, 
    users, 
    approveVerification, 
    rejectVerification, 
    isBangla 
  } = useAdminData();

  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Document Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customReasonNote, setCustomReasonNote] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');

  const filteredRequests = verificationRequests.filter(req => {
    const matchesStatus = selectedStatus === 'ALL' ? true : req.status === selectedStatus;
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch = !q || 
      req.profileCode.toLowerCase().includes(q) ||
      req.displayName.toLowerCase().includes(q) ||
      req.displayNameBangla.includes(q) ||
      req.idNumber.toLowerCase().includes(q) ||
      req.locationDistrict.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Default selection to first item in queue
  const activeRequest = verificationRequests.find(r => r.id === (selectedRequestId || filteredRequests[0]?.id)) 
    || filteredRequests[0] 
    || verificationRequests[0];

  const activeUserProfile = users.find(u => u.profileCode === activeRequest?.profileCode);

  const PRESET_REJECTION_REASONS = [
    {
      en: 'Blurry NID image / Low light - please re-upload clear flat photo',
      bn: 'আইডি কার্ডের ছবি অস্পষ্ট / ঝাপসা - আলোতে সোজা করে পরিষ্কার ছবি তুলুন'
    },
    {
      en: 'Name mismatch: Display name does not match name on official document',
      bn: 'নামের অমিল: প্রোফাইলের নামের সাথে সরকারি পরিচয়পত্রের নামের অমিল রয়েছে'
    },
    {
      en: 'Date of Birth mismatch with submitted document',
      bn: 'জন্মতারিখের অমিল: প্রোফাইলের জন্মতারিখ ও পরিচয়পত্রের জন্মতারিখ এক নয়'
    },
    {
      en: 'Cropped edges: Full NID card boundary must be clearly visible',
      bn: 'নথির কোণ কাটা: পরিচয়পত্রের সম্পূর্ণ অংশ ও চারপাশ স্পষ্টভাবে দেখা যেতে হবে'
    },
    {
      en: 'Expired passport or illegible document number',
      bn: 'মেয়াদোত্তীর্ণ পাসপোর্ট বা পরিচয়পত্র নম্বর পাঠযোগ্য নয়'
    },
    {
      en: 'Black and white photocopy not accepted. Color photo/scan required',
      bn: 'সাদাকালো ফটোকপি গ্রহণযোগ্য নয়। রঙিন ছবি বা স্ক্যান কপি আপলোড করুন'
    }
  ];

  const handleApprove = (req: VerificationRequestItem) => {
    approveVerification(req.id, adminNote);
    setAdminNote('');
  };

  const handleOpenReject = (req: VerificationRequestItem) => {
    setSelectedRequestId(req.id);
    setRejectionReason(PRESET_REJECTION_REASONS[0].en);
    setCustomReasonNote('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!activeRequest) return;
    const finalReason = customReasonNote.trim() 
      ? `${rejectionReason} - ${customReasonNote.trim()}` 
      : rejectionReason;
    rejectVerification(activeRequest.id, finalReason, adminNote);
    setShowRejectModal(false);
    setCustomReasonNote('');
    setAdminNote('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'কেওয়াইসি ও আইডি ভেরিফিকেশন কিউ' : 'KYC & ID Verification Queue'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isBangla ? 'শীর্ষ অগ্রাধিকার' : 'Top Priority'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'বিশ্বস্ত পাত্র-পাত্রীর বায়োডাটা নিশ্চিত করতে জাতীয় পরিচয়পত্র (NID) ও পাসপোর্ট যাচাই করুন।'
              : 'Safeguard matrimonial authenticity by verifying government Smart NID, Passports, and credentials.'}
          </p>
        </div>

        {/* Status Tab Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const).map(status => {
            const count = verificationRequests.filter(r => status === 'ALL' ? true : r.status === status).length;
            const labels = {
              PENDING: isBangla ? 'অপেক্ষমাণ' : 'Pending',
              VERIFIED: isBangla ? 'অনুমোদিত' : 'Approved',
              REJECTED: isBangla ? 'বাতিল' : 'Rejected',
              ALL: isBangla ? 'সবগুলো' : 'All'
            };

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedStatus === status 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{labels[status]}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedStatus === status ? 'bg-white/20' : 'bg-slate-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Left Queue List + Right Side-by-Side Review Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Queue List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">
              {isBangla ? 'আবেদনের তালিকা' : 'Submissions'} ({filteredRequests.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              {selectedStatus === 'PENDING' ? (isBangla ? 'রিভিউ বাকি' : 'Needs Review') : selectedStatus}
            </span>
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder={isBangla ? "আইডি, নাম বা এনআইডি নম্বর খুঁজুন..." : "Filter by ID, name or NID number..."}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />

          {/* List of queue items */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {isBangla ? 'কোনো আবেদন পাওয়া যায়নি' : 'No verification requests matching filter.'}
              </div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = activeRequest?.id === req.id;
                const isBride = req.gender === 'Female';

                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setZoomLevel(1);
                      setRotation(0);
                    }}
                    className={`
                      p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3
                      ${isSelected 
                        ? 'bg-gradient-to-r from-amber-950/40 to-slate-800 border-amber-500/60 shadow-md ring-1 ring-amber-500/30' 
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'}
                    `}
                  >
                    <img 
                      src={req.photoUrl} 
                      alt={req.displayName} 
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-700 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-100 truncate">
                          {isBangla && req.displayNameBangla ? req.displayNameBangla : req.displayName}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                          isBride ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {req.profileCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {req.docType} • {req.locationDistrict}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="text-slate-400 font-mono">
                          ID: {req.idNumber}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                          req.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' :
                          req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Side-by-Side Review Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeRequest ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              
              {/* Header with User Info & Review status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={activeRequest.photoUrl} 
                      alt={activeRequest.displayName} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                    />
                    {activeUserProfile?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-100">
                        {isBangla && activeRequest.displayNameBangla ? activeRequest.displayNameBangla : activeRequest.displayName}
                      </h2>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                        activeRequest.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {activeRequest.profileCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isBangla ? 'আবেদনের সময়:' : 'Submitted:'} <span className="text-slate-300 font-medium">{new Date(activeRequest.submittedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Status Tag */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    activeRequest.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    activeRequest.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {activeRequest.status === 'VERIFIED' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {activeRequest.status === 'REJECTED' && <XCircle className="w-4 h-4 text-rose-400" />}
                    {activeRequest.status === 'PENDING' && <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
                    {activeRequest.status}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Panel 1: Profile Biodata Facts */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <User className="w-4 h-4" /> {isBangla ? 'বায়োডাটা তথ্য' : 'Biodata Profile Data'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Candidate record</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'পূর্ণ নাম' : 'Full Name'}:</span>
                      <span className="font-semibold text-slate-200">{activeRequest.displayName}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'বাংলা নাম' : 'Bangla Name'}:</span>
                      <span className="font-semibold text-slate-200">{activeRequest.displayNameBangla || '—'}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60 bg-amber-500/10 px-2 rounded">
                      <span className="text-amber-300 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {isBangla ? 'জন্মতারিখ (DoB)' : 'Date of Birth'}:
                      </span>
                      <span className="font-bold text-amber-200">
                        {activeRequest.dateOfBirth} ({activeRequest.age} yrs)
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'লিঙ্গ ও ধর্ম' : 'Gender & Religion'}:</span>
                      <span className="font-medium text-slate-200">
                        {activeRequest.gender} • {activeUserProfile?.religion || 'Muslim'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'পেশা ও পদবি' : 'Profession & Role'}:</span>
                      <span className="font-medium text-slate-200">
                        {activeUserProfile?.profession} ({activeUserProfile?.jobDesignation || 'Executive'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'বর্তমান জেলা' : 'Location / District'}:</span>
                      <span className="font-medium text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {activeRequest.locationDistrict}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isBangla ? 'যোগাযোগ নম্বর' : 'Candidate Phone'}:</span>
                      <span className="font-mono text-slate-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {activeUserProfile?.phone || 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">{isBangla ? 'অভিভাবকের নম্বর' : 'Guardian Contact'}:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {activeUserProfile?.guardianPhone || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Anti-fraud Verification Checklist */}
                  <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {isBangla ? 'তথ্য যাচাই চেকলিস্ট' : 'Automated Consistency Check'}
                    </div>
                    <p className="text-slate-400">
                      • NID DoB: <strong className="text-slate-200">{activeRequest.dateOfBirth}</strong> (Matches profile age {activeRequest.age})
                    </p>
                    <p className="text-slate-400">
                      • Document Type: <strong className="text-slate-200">{activeRequest.docType}</strong>
                    </p>
                  </div>
                </div>

                {/* Panel 2: Uploaded Government Document Scan Viewer */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <FileText className="w-4 h-4" /> {activeRequest.docType}
                      </span>
                      
                      {/* Document Viewer Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono w-9 text-center">
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRotation(prev => (prev + 90) % 360)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={activeRequest.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                          title="Open Original Image"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Document Display Box */}
                    <div className="relative mt-2 w-full h-56 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2 group">
                      <img 
                        src={activeRequest.docUrl} 
                        alt="Government ID Scan" 
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                          transition: 'transform 0.2s ease-in-out'
                        }}
                        className="max-h-full max-w-full object-contain rounded-lg select-none shadow-lg"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] text-slate-300 font-mono">
                        {activeRequest.docType}
                      </div>
                    </div>

                    {/* Document Number with Copy Tool */}
                    <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          {isBangla ? 'জমা দেওয়া আইডি নম্বর' : 'Submitted Document ID Number'}
                        </span>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {activeRequest.idNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(activeRequest.idNumber)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Copy ID Number"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isBangla ? 'কপি' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {activeRequest.adminNote && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                      <strong>{isBangla ? 'অ্যাডমিন নোট:' : 'Admin Note:'}</strong> {activeRequest.adminNote}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Bar (Approve vs Reject) */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-auto flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder={isBangla ? "ঐচ্ছিক অ্যাডমিন মন্তব্য যোগ করুন..." : "Add private note on this verification..."}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {/* Reject Button */}
                  <button
                    onClick={() => handleOpenReject(activeRequest)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/40 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>{isBangla ? 'কারণসহ প্রত্যাখ্যান' : 'Reject with Reason'}</span>
                  </button>

                  {/* One-Tap Approve Button */}
                  <button
                    onClick={() => handleApprove(activeRequest)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isBangla ? 'ভেরিফাই ও ব্যাজ অনুমোদন' : 'Approve & Assign Badge'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              {isBangla ? 'অনুগ্রহ করে বাম পাশ থেকে একটি আবেদন নির্বাচন করুন' : 'Select a verification request from the list to inspect.'}
            </div>
          )}
        </div>

      </div>

      {/* Reject with Reason Modal */}
      {showRejectModal && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-100">
                  {isBangla ? 'ভেরিফিকেশন বাতিলের কারণ' : 'Reject Verification with Bilingual Reason'}
                </h3>
              </div>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {isBangla
                ? `প্রার্থী (${activeRequest.displayName} - ${activeRequest.profileCode})-এর কাছে এই কারণটি অ্যাপে নোটিফিকেশন আকারে যাবে যাতে তিনি সঠিক নথি পুনরায় আপলোড করতে পারেন:`
                : `Select or specify why ${activeRequest.displayName} (${activeRequest.profileCode})'s ID is rejected so they can re-upload correctly:`}
            </p>

            {/* Preset Rejection Reasons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'সাধারণ কারণ নির্বাচন করুন:' : 'Standard Reasons:'}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_REJECTION_REASONS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`
                      flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors
                      ${rejectionReason === reason.en 
                        ? 'bg-rose-500/15 border-rose-500/60 text-rose-200' 
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'}
                    `}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      checked={rejectionReason === reason.en}
                      onChange={() => setRejectionReason(reason.en)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="font-medium text-slate-200">{reason.en}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-bengali">{reason.bn}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'অতিরিক্ত নির্দেশনা (ঐচ্ছিক):' : 'Additional instruction to user (optional):'}
              </label>
              <textarea
                rows={3}
                placeholder={isBangla ? "যেমন: কার্ডের উল্টোপিঠসহ ভালো আলোতে ছবি তুলে জমা দিন..." : "e.g. Please capture both front and back in good lighting without glare..."}
                value={customReasonNote}
                onChange={(e) => setCustomReasonNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-950/40"
              >
                {isBangla ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm & Notify User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
