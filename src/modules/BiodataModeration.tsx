import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert, 
  Heart, 
  Ban, 
  CheckCircle, 
  UserPlus, 
  Eye, 
  EyeOff, 
  MapPin, 
  Briefcase, 
  Phone, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  Check,
  X,
  Share2,
  Trash2
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { UserBiodata, AccountStatus, Gender, PackageTier } from '../types/admin';
import { EditBiodataModal } from '../components/EditBiodataModal';
import { getAllDistricts, PROFESSIONS } from '../constants/biodataOptions';

export const BiodataModeration: React.FC = () => {
  const { 
    users, 
    saveUserBiodata, 
    deleteUserProfile,
    setAccountStatus, 
    toggleAssistedProfile, 
    createUserProfile,
    isBangla 
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'Female' | 'Male'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlySuspicious, setOnlySuspicious] = useState(false);
  const [onlyAssisted, setOnlyAssisted] = useState(false);

  // Edit Profile Modal State
  const [editingUser, setEditingUser] = useState<UserBiodata | null>(null);

  // Delete Profile Confirmation State
  const [profileToDelete, setProfileToDelete] = useState<UserBiodata | null>(null);

  // Success Story / Married Modal State
  const [marriageModalUser, setMarriageModalUser] = useState<UserBiodata | null>(null);
  const [marriageDate, setMarriageDate] = useState(new Date().toISOString().split('T')[0]);
  const [successStory, setSuccessStory] = useState('');

  // Create Offline Profile Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileForm, setNewProfileForm] = useState<Partial<UserBiodata>>({
    displayName: '',
    displayNameBangla: '',
    gender: 'Female',
    age: 25,
    dateOfBirth: '2001-04-10',
    maritalStatus: 'Never Married',
    religion: 'Muslim (Sunni)',
    profession: 'Software Engineer',
    educationLevel: "Bachelor's (B.Sc / BBA)",
    locationDivision: 'Dhaka',
    locationDistrict: 'Dhaka',
    presentUpazila: 'Dhanmondi',
    phone: '+880 1700-000000',
    guardianPhone: '+880 1800-000000',
    guardianRelation: 'Father',
    packageTier: 'Free',
    aboutMe: '',
    isAssistedGhotokProfile: true
  });

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      u.profileCode.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.displayNameBangla.includes(q) ||
      u.phone.includes(q) ||
      u.guardianPhone.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.locationDistrict.toLowerCase().includes(q) ||
      u.profession.toLowerCase().includes(q);

    const matchesGender = selectedGender === 'ALL' || u.gender === selectedGender;
    const matchesStatus = selectedStatus === 'ALL' || u.accountStatus === selectedStatus;
    const matchesVerified = !onlyVerified || u.isVerified;
    const matchesSuspicious = !onlySuspicious || u.flaggedForSuspiciousBio;
    const matchesAssisted = !onlyAssisted || u.isAssistedGhotokProfile;

    return matchesSearch && matchesGender && matchesStatus && matchesVerified && matchesSuspicious && matchesAssisted;
  });

  const handleSanitizeBio = (user: UserBiodata) => {
    // Strip 11-digit Bangladeshi phone numbers from bio
    const phoneRegex = /(01[3-9]\d{8}|\+?880\s?1[3-9]\d{8})/g;
    const sanitized = user.aboutMe.replace(phoneRegex, '[ফোন নম্বর গোপন করা হয়েছে - কন্টাক্ট আনলক করুন]');
    saveUserBiodata({
      ...user,
      aboutMe: sanitized,
      flaggedForSuspiciousBio: false
    });
  };

  const handleMarkMarried = () => {
    if (!marriageModalUser) return;
    setAccountStatus(marriageModalUser.profileCode, 'MARRIED', undefined, successStory);
    setMarriageModalUser(null);
    setSuccessStory('');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileForm.displayName || !newProfileForm.gender) return;

    createUserProfile({
      userId: `offline_${Date.now()}`,
      profileCode: '',
      displayName: newProfileForm.displayName || 'Candidate',
      displayNameBangla: newProfileForm.displayNameBangla || '',
      email: newProfileForm.email || 'offline@ghotok.com.bd',
      phone: newProfileForm.phone || '+880 1700-000000',
      photoUrl: newProfileForm.photoUrl || (newProfileForm.gender === 'Female' ? '/default_woman_dp.jpg' : '/default_man_dp.jpg'),
      gender: newProfileForm.gender as Gender,
      dateOfBirth: newProfileForm.dateOfBirth || '2000-01-01',
      age: Number(newProfileForm.age) || 26,
      maritalStatus: (newProfileForm.maritalStatus as any) || 'Never Married',
      religion: newProfileForm.religion || 'Muslim (Sunni)',
      height: newProfileForm.height || "5'4''",
      weightKg: Number(newProfileForm.weightKg) || 58,
      complexion: newProfileForm.complexion || 'Fair',
      bloodGroup: newProfileForm.bloodGroup || 'B+',
      educationLevel: newProfileForm.educationLevel || "Bachelor's (B.Sc / BBA)",
      educationSubject: newProfileForm.educationSubject || 'General',
      institution: newProfileForm.institution || 'Reputed Institution',
      ieltsScore: newProfileForm.ieltsScore || 'None / N/A',
      employmentType: newProfileForm.employmentType || 'Private job',
      profession: newProfileForm.profession || 'Professional',
      jobDesignation: newProfileForm.jobDesignation || 'Officer',
      jobOrganization: newProfileForm.jobOrganization || 'Organization',
      monthlyIncome: newProfileForm.monthlyIncome || '৳ 50,000 - ৳ 1,00,000',
      locationDivision: newProfileForm.locationDivision || 'Dhaka',
      locationDistrict: newProfileForm.locationDistrict || 'Dhaka',
      presentUpazila: newProfileForm.presentUpazila || 'Sadar',
      presentAddress: newProfileForm.presentAddress || 'Dhaka',
      permanentDistrict: newProfileForm.permanentDistrict || 'Dhaka',
      permanentAddress: newProfileForm.permanentAddress || 'Dhaka',
      familyType: (newProfileForm.familyType as any) || 'Nuclear',
      fatherProfession: newProfileForm.fatherProfession || 'Respected Person',
      motherProfession: newProfileForm.motherProfession || 'Homemaker',
      brotherCount: Number(newProfileForm.brotherCount) || 0,
      sisterCount: Number(newProfileForm.sisterCount) || 0,
      financialCondition: 'Middle Class',
      aboutMe: newProfileForm.aboutMe || 'Managed by Ghotok Matchmaking Desk.',
      guardianPhone: newProfileForm.guardianPhone || '+880 1700-000000',
      guardianRelation: newProfileForm.guardianRelation || 'Parent',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verificationDocType: 'Ghotok Assisted Physical Verification',
      verificationIdNumber: 'GHOTOK-OFFLINE-VERIFIED',
      verificationDocUri: '',
      accountStatus: 'ACTIVE',
      packageTier: 'Diamond',
      interestsRemaining: 999,
      contactsRemaining: 999,
      isAssistedGhotokProfile: true
    });

    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'পাত্র-পাত্রীর বায়োডাটা মডারেশন ও প্রোফাইল এডিটর' : 'User & Biodata Moderation (B & G Profiles)'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              B &amp; G Profiles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'আইডি নম্বর, ফোন বা নাম দিয়ে খুঁজুন; অনাকাঙ্ক্ষিত তথ্য বা ফোন নম্বর ফিল্টার করুন এবং পরিবারের সহায়তায় বায়োডাটা এডিট করুন।'
              : 'Search B & G profiles, sanitize leaked phone numbers from public bios, edit biodata on behalf of families, or archive married matches.'}
          </p>
        </div>

        {/* Action Button: Create Assisted Profile */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isBangla ? 'নতুন ঘটক বায়োডাটা তৈরি' : 'Create Ghotok Assisted Profile'}</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isBangla ? "প্রোফাইল আইডি (G600001, B600001), ফোন, নাম, জেলা দিয়ে খুঁজুন..." : "Search by Profile ID (G600001, B600001), phone, name, district..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Gender Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">{isBangla ? 'সব পাত্র ও পাত্রী (B & G)' : 'All Genders (B & G)'}</option>
              <option value="Female">{isBangla ? 'পাত্রী প্রোফাইল (B - Bride)' : 'Brides Only (B Series)'}</option>
              <option value="Male">{isBangla ? 'পাত্র প্রোফাইল (G - Groom)' : 'Grooms Only (G Series)'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">{isBangla ? 'সব স্ট্যাটাস' : 'All Account Statuses'}</option>
              <option value="ACTIVE">{isBangla ? 'সক্রিয় (Active)' : 'Active Members'}</option>
              <option value="SUSPENDED">{isBangla ? 'স্থগিত/ব্যানড (Suspended)' : 'Suspended / Banned'}</option>
              <option value="MARRIED">{isBangla ? 'বিবাহ সম্পন্ন (Match Found)' : 'Match Found / Married'}</option>
              <option value="HIDDEN">{isBangla ? 'লুকানো (Hidden)' : 'Hidden from Search'}</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">{isBangla ? 'ফিল্টার করুন:' : 'Quick Filters:'}</span>

          <button
            onClick={() => setOnlySuspicious(!onlySuspicious)}
            className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              onlySuspicious 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isBangla ? 'সন্দেহজনক বায়ো / ফোন নম্বর ফাঁস' : 'Leaked Phone in Bio Alerts'}</span>
          </button>

          <button
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              onlyVerified 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBangla ? 'শুধুমাত্র ভেরিফাইড' : 'Verified Profiles Only'}</span>
          </button>

          <button
            onClick={() => setOnlyAssisted(!onlyAssisted)}
            className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              onlyAssisted 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBangla ? 'ঘটক অ্যাসিস্টেড / অফলাইন' : 'Ghotok Assisted Profiles'}</span>
          </button>

          <span className="ml-auto text-[11px] text-slate-400">
            {filteredUsers.length} {isBangla ? 'টি প্রোফাইল প্রদর্শিত' : 'profiles shown'}
          </span>
        </div>
      </div>

      {/* Profiles Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            {isBangla ? 'কোনো প্রোফাইল মেলেনি' : 'No profiles found matching search criteria.'}
          </div>
        ) : (
          filteredUsers.map(user => {
            const isBride = user.gender === 'Female';
            const isBanned = user.accountStatus === 'SUSPENDED';
            const isMarried = user.accountStatus === 'MARRIED';

            return (
              <div
                key={user.profileCode}
                className={`
                  bg-slate-900 border rounded-2xl p-4.5 space-y-4 shadow-lg transition-all flex flex-col justify-between
                  ${isBanned ? 'border-rose-900/60 bg-rose-950/15' :
                    isMarried ? 'border-amber-600/50 bg-amber-950/15' :
                    user.flaggedForSuspiciousBio ? 'border-orange-500/60 ring-1 ring-orange-500/30' :
                    'border-slate-800 hover:border-slate-700'}
                `}
              >
                <div>
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={user.photoUrl} 
                          alt={user.displayName}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow" 
                        />
                        {user.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="Verified Badge">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-100">
                            {isBangla && user.displayNameBangla ? user.displayNameBangla : user.displayName}
                          </h3>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                            isBride ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {user.profileCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {user.age} yrs • {user.height} • {user.maritalStatus}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.packageTier === 'Diamond' ? 'bg-purple-500/20 text-purple-300' :
                        user.packageTier === 'Gold' ? 'bg-amber-500/20 text-amber-300' :
                        user.packageTier === 'Silver' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {user.packageTier}
                      </span>
                      {user.isAssistedGhotokProfile && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Ghotok Client
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges / Status row */}
                  {user.accountStatus !== 'ACTIVE' && (
                    <div className="mt-2.5">
                      {isBanned && (
                        <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5" /> {isBangla ? 'অ্যাকাউন্ট স্থগিত / ব্যানড' : 'Account Suspended from Matches'}
                        </span>
                      )}
                      {isMarried && (
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {isBangla ? 'বিবাহ সম্পন্ন / ম্যাচ পাওয়া গেছে' : 'Married / Success Story'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Suspicious phone leak warning */}
                  {user.flaggedForSuspiciousBio && (
                    <div className="mt-2.5 p-2 bg-orange-950/40 border border-orange-500/40 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-orange-300 font-bold text-[11px]">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                          {isBangla ? 'বায়োতে ফোন নম্বর পাওয়া গেছে' : 'Leaked phone number in public bio'}
                        </span>
                        <button
                          onClick={() => handleSanitizeBio(user)}
                          className="px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold text-[10px] transition-colors"
                        >
                          {isBangla ? 'ফিল্টার করুন' : 'Sanitize Bio'}
                        </button>
                      </div>
                      <p className="text-[11px] text-orange-200/80 font-mono italic truncate">
                        "{user.aboutMe}"
                      </p>
                    </div>
                  )}

                  {/* Key facts bullet list */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-500" /> {user.profession}
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[150px]">{user.jobOrganization}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {user.locationDistrict}
                      </span>
                      <span className="text-slate-300 font-medium">
                        {user.overseasCountry && user.overseasCountry !== 'None (Living in BD)' 
                          ? `✈ ${user.overseasCountry}` 
                          : user.presentUpazila}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono text-[11px]">
                      <span className="text-slate-400">Phone: {user.phone}</span>
                      <span className="text-emerald-400 font-semibold">G: {user.guardianPhone}</span>
                    </div>
                  </div>

                  {/* Success story note if married */}
                  {user.successStoryNote && (
                    <div className="mt-2.5 p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-amber-200/90 italic">
                      "{user.successStoryNote}"
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  {/* Edit Full Profile */}
                  <button
                    onClick={() => setEditingUser(user)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                    title="Edit any field on behalf of guardian"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isBangla ? 'সম্পাদনা' : 'Edit Biodata'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Mark Married Button */}
                    {!isMarried ? (
                      <button
                        onClick={() => {
                          setMarriageModalUser(user);
                          setSuccessStory(`Alhamdulillah! Profile ${user.profileCode} found match via Ghotok Matrimony in ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.`);
                        }}
                        className="p-1.5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                        title="Mark as Married / Match Found"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setAccountStatus(user.profileCode, 'ACTIVE')}
                        className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-[11px] font-bold"
                        title="Revert status to Active"
                      >
                        Un-archive
                      </button>
                    )}

                    {/* Suspend / Ban Toggle */}
                    <button
                      onClick={() => setAccountStatus(user.profileCode, isBanned ? 'ACTIVE' : 'SUSPENDED')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBanned 
                          ? 'bg-rose-500/30 text-rose-300 hover:bg-rose-500/40' 
                          : 'hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                      }`}
                      title={isBanned ? "Unsuspend / Reactivate" : "Suspend / Ban user from Matches"}
                    >
                      <Ban className="w-4 h-4" />
                    </button>

                    {/* Toggle Assisted Ghotok Client */}
                    <button
                      onClick={() => toggleAssistedProfile(user.profileCode)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.isAssistedGhotokProfile 
                          ? 'bg-indigo-500/30 text-indigo-300' 
                          : 'hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400'
                      }`}
                      title="Toggle Ghotok Matchmaker Client tag"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Delete / Remove Profile */}
                    <button
                      onClick={() => setProfileToDelete(user)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      title={isBangla ? "প্রোফাইল মুছুন" : "Delete profile record"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* FULL PROFILE EDITOR MODAL */}
      <EditBiodataModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(updated) => {
          saveUserBiodata(updated);
          setEditingUser(null);
        }}
        isBangla={isBangla}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-200">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>{isBangla ? 'প্রোফাইল মুছে ফেলার নিশ্চয়তা' : 'Delete Profile Record'}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBangla
                ? `আপনি কি নিশ্চিত যে প্রোফাইল ${profileToDelete.displayName} (${profileToDelete.profileCode}) স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`
                : `Are you sure you want to permanently delete profile ${profileToDelete.displayName} (${profileToDelete.profileCode}) from Firestore? This action cannot be undone.`}
            </p>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div><span className="text-slate-500 font-semibold">ID / Code:</span> <span className="font-mono text-slate-200 font-bold">{profileToDelete.profileCode}</span></div>
              <div><span className="text-slate-500 font-semibold">Name:</span> <span className="text-slate-200">{profileToDelete.displayName}</span></div>
              <div><span className="text-slate-500 font-semibold">Phone:</span> <span className="font-mono text-slate-300">{profileToDelete.phone}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300"
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = profileToDelete;
                  setProfileToDelete(null);
                  await deleteUserProfile(target);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/40"
              >
                {isBangla ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MATCH FOUND / MARRIED ARCHIVE MODAL */}
      {marriageModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Heart className="w-5 h-5 fill-amber-400" />
              <span>{isBangla ? 'ম্যাচ সম্পন্ন ও সফল বিবাহ রেকর্ড' : 'Mark as "Married / Match Found"'}</span>
            </div>

            <p className="text-xs text-slate-400">
              {isBangla
                ? `প্রোফাইল ${marriageModalUser.displayName} (${marriageModalUser.profileCode})-এর বিবাহ সম্পন্ন হলে পাবলিক ফিড থেকে সরিয়ে আর্কাইভ করা হবে:`
                : `Archiving ${marriageModalUser.displayName} (${marriageModalUser.profileCode}) will remove them from the active matches feed and record a success story:`}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Marriage / Nikah Date</label>
                <input
                  type="date"
                  value={marriageDate}
                  onChange={(e) => setMarriageDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Success Story Note (Optional)</label>
                <textarea
                  rows={3}
                  value={successStory}
                  onChange={(e) => setSuccessStory(e.target.value)}
                  placeholder="e.g. Matched via Ghotok app with groom G600006; wedding completed in Dhaka."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setMarriageModalUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkMarried}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs"
              >
                Archive as Married
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OFFLINE GHOTOK PROFILE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-100">
                  {isBangla ? 'নতুন ঘটক অ্যাসিস্টেড বায়োডাটা তৈরি' : 'Create Ghotok Assisted Profile'}
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-100">✕</button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Candidate Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newProfileForm.displayName || ''}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    placeholder="e.g. Sabrina Ahmed"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Bangla Name</label>
                  <input
                    type="text"
                    value={newProfileForm.displayNameBangla || ''}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, displayNameBangla: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    placeholder="সাবেরিনা আহমেদ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Gender *</label>
                  <select
                    value={newProfileForm.gender}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="Female">Female (Bride - B Series)</option>
                    <option value="Male">Male (Groom - G Series)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newProfileForm.age}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">District *</label>
                  <select
                    value={newProfileForm.locationDistrict}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, locationDistrict: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="">Select District</option>
                    {getAllDistricts().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Profession *</label>
                  <select
                    value={newProfileForm.profession}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, profession: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="">Select Profession</option>
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Guardian Phone (অভিভাবকের ফোন)</label>
                  <input
                    type="text"
                    value={newProfileForm.guardianPhone}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                    placeholder="+880 1711-xxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">About Me / Family Background</label>
                <textarea
                  rows={3}
                  value={newProfileForm.aboutMe}
                  onChange={(e) => setNewProfileForm({ ...newProfileForm, aboutMe: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  placeholder="Family background and partner expectations..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
                >
                  Generate Profile ID &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
