import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit3, 
  X, 
  Check, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  User, 
  Globe, 
  Users, 
  FileText,
  AlertCircle,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserBiodata } from '../types/admin';
import {
  RELIGIONS,
  CREATED_BY,
  MARITAL_STATUSES,
  HEIGHTS,
  COMPLEXIONS,
  BLOOD_GROUPS,
  EYE_COLOURS,
  HAIR_COLOURS,
  DISABILITIES,
  EDUCATION_LEVELS,
  IELTS_SCORES,
  EMPLOYMENT_TYPES,
  PROFESSIONS,
  JOB_EMPLOYMENT_STATUSES,
  MONTHLY_INCOMES,
  OVERSEAS_COUNTRIES,
  VISA_STATUSES,
  FAMILY_TYPES,
  PARENTS_STATUSES,
  FINANCIAL_CONDITIONS,
  MARRIAGE_TIMELINES,
  BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict
} from '../constants/biodataOptions';

interface EditBiodataModalProps {
  user: UserBiodata | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserBiodata) => void;
  isBangla?: boolean;
}

type TabKey = 'BASIC' | 'PHYSICAL' | 'EDUCATION_CAREER' | 'LOCATION' | 'FAMILY' | 'BIO';

export const EditBiodataModal: React.FC<EditBiodataModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  isBangla = false
}) => {
  const [formData, setFormData] = useState<UserBiodata | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('BASIC');
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null);

  // Sync state when incoming user changes
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        createdBy: user.createdBy || 'Self',
        eyeColour: user.eyeColour || 'Black',
        hairColour: user.hairColour || 'Black',
        disability: user.disability || 'None',
        ieltsScore: user.ieltsScore || 'None / N/A',
        jobEmploymentStatus: user.jobEmploymentStatus || 'Permanent',
        visaStatus: user.visaStatus || 'Citizen',
        parentsStatus: user.parentsStatus || 'Both Alive',
        marriageTimeline: user.marriageTimeline || 'Flexible / Not Fixed',
        locationDivision: user.locationDivision || 'Dhaka',
        locationDistrict: user.locationDistrict || 'Dhaka',
        presentUpazila: user.presentUpazila || 'Dhanmondi',
        permanentDivision: user.permanentDivision || user.locationDivision || 'Dhaka',
        permanentDistrict: user.permanentDistrict || user.locationDistrict || 'Dhaka',
        permanentUpazila: user.permanentUpazila || user.presentUpazila || '',
        familyType: user.familyType || 'Nuclear',
        financialCondition: user.financialCondition || 'Middle Class'
      });
      setActiveTab('BASIC');
    } else {
      setFormData(null);
    }
  }, [user]);

  // Check for leaked phone numbers in bio
  useEffect(() => {
    if (!formData?.aboutMe) {
      setPhoneWarning(null);
      return;
    }
    const phoneRegex = /(01[3-9]\d{8}|\+?880\s?1[3-9]\d{8})/g;
    if (phoneRegex.test(formData.aboutMe)) {
      setPhoneWarning(
        isBangla
          ? 'সতর্কতা: বায়োতে ফোন নম্বর শনাক্ত হয়েছে! পাবলিক বায়োডাটাতে এটি গোপন রাখা প্রয়োজন।'
          : 'Warning: Phone number detected in Bio! Matrimony rules require phone numbers to stay locked.'
      );
    } else {
      setPhoneWarning(null);
    }
  }, [formData?.aboutMe, isBangla]);

  // Cascading options for Present Location
  const presentDistricts = useMemo(() => {
    return getDistrictsForDivision(formData?.locationDivision);
  }, [formData?.locationDivision]);

  const presentUpazilas = useMemo(() => {
    return getUpazilasForDistrict(formData?.locationDistrict, formData?.locationDivision);
  }, [formData?.locationDistrict, formData?.locationDivision]);

  // Cascading options for Permanent Location
  const permanentDistricts = useMemo(() => {
    return getDistrictsForDivision(formData?.permanentDivision);
  }, [formData?.permanentDivision]);

  const permanentUpazilas = useMemo(() => {
    return getUpazilasForDistrict(formData?.permanentDistrict, formData?.permanentDivision);
  }, [formData?.permanentDistrict, formData?.permanentDivision]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const sanitizeBioPhone = () => {
    const phoneRegex = /(01[3-9]\d{8}|\+?880\s?1[3-9]\d{8})/g;
    const sanitized = formData.aboutMe.replace(phoneRegex, '[ফোন নম্বর গোপন করা হয়েছে - কন্টাক্ট আনলক করুন]');
    setFormData(prev => prev ? ({ ...prev, aboutMe: sanitized, flaggedForSuspiciousBio: false }) : null);
  };

  const tabs: { key: TabKey; labelEn: string; labelBn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'BASIC', labelEn: 'Basic Info', labelBn: 'মৌলিক তথ্য', icon: User },
    { key: 'PHYSICAL', labelEn: 'Physical & Health', labelBn: 'শারীরিক বিবরণ', icon: Heart },
    { key: 'EDUCATION_CAREER', labelEn: 'Education & Career', labelBn: 'শিক্ষা ও পেশা', icon: Briefcase },
    { key: 'LOCATION', labelEn: 'Location & Overseas', labelBn: 'ঠিকানা ও প্রবাস', icon: MapPin },
    { key: 'FAMILY', labelEn: 'Family & Guardian', labelBn: 'পারিবারিক ও অভিভাবক', icon: Users },
    { key: 'BIO', labelEn: 'Bio & Notes', labelBn: 'বায়ো ও প্রত্যাশা', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  {isBangla ? 'বায়োডাটা পূর্ণাঙ্গ সম্পাদনা' : 'Edit Biodata Record'}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-300 font-bold">
                  {formData.profileCode}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  formData.gender === 'Female' 
                    ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30' 
                    : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                }`}>
                  {formData.gender === 'Female' ? 'Bride (কনে)' : 'Groom (পাত্র)'}
                </span>
                {formData.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formData.displayName} {formData.displayNameBangla ? `(${formData.displayNameBangla})` : ''} • {formData.profession} • {formData.locationDistrict}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-900/60 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{isBangla ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 text-xs space-y-5">

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'BASIC' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'প্রোফাইল শনাক্তকারী ও সাধারণ তথ্য' : 'Candidate Identification & General Info'}
                </span>
                <span className="font-mono text-[11px] text-slate-400">UID: {formData.userId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'পূর্ণ নাম (ইংরেজিতে)' : 'Full Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'পূর্ণ নাম (বাংলায়)' : 'Full Name in Bangla'}
                  </label>
                  <input
                    type="text"
                    value={formData.displayNameBangla || ''}
                    onChange={(e) => setFormData({ ...formData, displayNameBangla: e.target.value })}
                    placeholder="যেমন: ড. তানভীর আহমেদ"
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'লিঙ্গ' : 'Gender'} *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Female">Female (Bride / কনে)</option>
                    <option value="Male">Male (Groom / পাত্র)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বায়োডাটা প্রস্তুতকারক' : 'Biodata Created By'} *
                  </label>
                  <select
                    value={formData.createdBy || 'Self'}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CREATED_BY.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'ধর্ম' : 'Religion'} *
                  </label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RELIGIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'জন্ম তারিখ' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      const dob = e.target.value;
                      let calculatedAge = formData.age;
                      if (dob) {
                        const birthYear = new Date(dob).getFullYear();
                        if (!isNaN(birthYear)) {
                          calculatedAge = Math.max(18, new Date().getFullYear() - birthYear);
                        }
                      }
                      setFormData({ ...formData, dateOfBirth: dob, age: calculatedAge });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বয়স (বছর)' : 'Age (Years)'} *
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={80}
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বৈবাহিক অবস্থা' : 'Marital Status'} *
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MARITAL_STATUSES.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  {isBangla ? 'বিবাহের প্রত্যাশিত সময়সীমা' : 'Expected Marriage Timeline'}
                </label>
                <select
                  value={formData.marriageTimeline || 'Flexible / Not Fixed'}
                  onChange={(e) => setFormData({ ...formData, marriageTimeline: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MARRIAGE_TIMELINES.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL & HEALTH ATTRIBUTES */}
          {activeTab === 'PHYSICAL' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'শারীরিক গঠন ও স্বাস্থ্য সম্পর্কিত বিবরণ' : 'Physical Appearance & Health Metrics'}
                </span>
                <span className="text-[11px] text-slate-400">Android BiodataOptions Reference</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'উচ্চতা' : 'Height'} *
                  </label>
                  <select
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  >
                    {!HEIGHTS.includes(formData.height) && (
                      <option value={formData.height}>{formData.height}</option>
                    )}
                    {HEIGHTS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'শারীরিক বর্ণ / গায়ের রঙ' : 'Complexion'} *
                  </label>
                  <select
                    value={formData.complexion}
                    onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COMPLEXIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {!COMPLEXIONS.includes(formData.complexion as any) && (
                      <option value={formData.complexion}>{formData.complexion}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {BLOOD_GROUPS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'চোখের রঙ' : 'Eye Colour'}
                  </label>
                  <select
                    value={formData.eyeColour || 'Black'}
                    onChange={(e) => setFormData({ ...formData, eyeColour: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EYE_COLOURS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'চুলের রঙ' : 'Hair Colour'}
                  </label>
                  <select
                    value={formData.hairColour || 'Black'}
                    onChange={(e) => setFormData({ ...formData, hairColour: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {HAIR_COLOURS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'ওজন (কেজি)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    value={formData.weightKg || 60}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  {isBangla ? 'শারীরিক বা মানসিক প্রতিবন্ধকতা' : 'Disabilities'} *
                </label>
                <select
                  value={formData.disability || 'None'}
                  onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DISABILITIES.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION & CAREER */}
          {activeTab === 'EDUCATION_CAREER' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'শিক্ষাগত যোগ্যতা ও কর্মসংস্থান' : 'Educational Qualifications & Career Profile'}
                </span>
                <span className="text-[11px] text-slate-400">Exact 113+ Professions & IELTS</span>
              </div>

              {/* Education section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'শিক্ষাগত স্তর' : 'Education Level'} *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EDUCATION_LEVELS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {!EDUCATION_LEVELS.includes(formData.educationLevel as any) && (
                      <option value={formData.educationLevel}>{formData.educationLevel}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'আইইএলটিএস স্কোর' : 'IELTS Score'}
                  </label>
                  <select
                    value={formData.ieltsScore || 'None / N/A'}
                    onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  >
                    {IELTS_SCORES.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বিষয় / বিভাগ' : 'Field / Subject of Study'}
                  </label>
                  <input
                    type="text"
                    value={formData.educationSubject || ''}
                    onChange={(e) => setFormData({ ...formData, educationSubject: e.target.value })}
                    placeholder="e.g. Computer Science, MBBS, Accounting, Law..."
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'শিক্ষা প্রতিষ্ঠান / বিশ্ববিদ্যালয়' : 'Institution / University'}
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. BUET, Dhaka University, DMC, NSU..."
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Career section */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3">
                  {isBangla ? 'পেশাগত তথ্য' : 'Professional & Employment Information'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'কর্মসংস্থানের ধরন' : 'Employment Type'} *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {EMPLOYMENT_TYPES.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'পেশা' : 'Profession'} *
                    </label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PROFESSIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                      {!PROFESSIONS.includes(formData.profession as any) && (
                        <option value={formData.profession}>{formData.profession}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'চাকরির স্থায়িত্ব / পদমর্যাদা স্ট্যাটাস' : 'Job Status'}
                    </label>
                    <select
                      value={formData.jobEmploymentStatus || 'Permanent'}
                      onChange={(e) => setFormData({ ...formData, jobEmploymentStatus: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {JOB_EMPLOYMENT_STATUSES.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'পদবী ও প্রতিষ্ঠান' : 'Job Designation & Company'}
                    </label>
                    <input
                      type="text"
                      value={formData.jobDesignation || ''}
                      onChange={(e) => setFormData({ ...formData, jobDesignation: e.target.value })}
                      placeholder="e.g. Senior Software Engineer at Grameenphone"
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'মাসিক আয়' : 'Monthly Income'} *
                    </label>
                    <select
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MONTHLY_INCOMES.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                      {!MONTHLY_INCOMES.includes(formData.monthlyIncome as any) && formData.monthlyIncome && (
                        <option value={formData.monthlyIncome}>{formData.monthlyIncome}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION & OVERSEAS STATUS */}
          {activeTab === 'LOCATION' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'বর্তমান ও স্থায়ী ঠিকানা (বিভাগ, জেলা ও উপজেলা)' : 'Present & Permanent Location (Cascading)'}
                </span>
                <span className="text-[11px] text-slate-400">64 Districts & Upazilas</span>
              </div>

              {/* Present Location */}
              <div className="p-4 bg-slate-800/25 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>{isBangla ? 'বর্তমান বাসস্থান / ঠিকানা' : 'Present Residence & Address'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'বিভাগ' : 'Division'} *
                    </label>
                    <select
                      value={formData.locationDivision}
                      onChange={(e) => {
                        const newDiv = e.target.value;
                        const dists = getDistrictsForDivision(newDiv);
                        const firstDist = dists[0] || '';
                        const upaz = getUpazilasForDistrict(firstDist, newDiv);
                        setFormData({
                          ...formData,
                          locationDivision: newDiv,
                          locationDistrict: firstDist,
                          presentUpazila: upaz[0] || ''
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {BANGLADESH_DIVISIONS.map(div => (
                        <option key={div.name} value={div.name}>{div.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'জেলা' : 'District'} *
                    </label>
                    <select
                      value={formData.locationDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        const upaz = getUpazilasForDistrict(newDist, formData.locationDivision);
                        setFormData({
                          ...formData,
                          locationDistrict: newDist,
                          presentUpazila: upaz[0] || ''
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {presentDistricts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                      {!presentDistricts.includes(formData.locationDistrict) && formData.locationDistrict && (
                        <option value={formData.locationDistrict}>{formData.locationDistrict}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'উপজেলা / থানা' : 'Upazila / Thana'} *
                    </label>
                    <select
                      value={formData.presentUpazila}
                      onChange={(e) => setFormData({ ...formData, presentUpazila: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {presentUpazilas.map(upaz => (
                        <option key={upaz} value={upaz}>{upaz}</option>
                      ))}
                      {!presentUpazilas.includes(formData.presentUpazila) && formData.presentUpazila && (
                        <option value={formData.presentUpazila}>{formData.presentUpazila}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বিস্তারিত বর্তমান ঠিকানা (রোড, বাসা ইত্যাদি)' : 'Present Street Address / Area'}
                  </label>
                  <input
                    type="text"
                    value={formData.presentAddress || ''}
                    onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                    placeholder="House / Road / Sector / Neighborhood"
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Permanent Location */}
              <div className="p-4 bg-slate-800/25 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>{isBangla ? 'স্থায়ী ঠিকানা / গ্রামের বাড়ি' : 'Permanent / Ancestral Address'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'স্থায়ী বিভাগ' : 'Permanent Division'}
                    </label>
                    <select
                      value={formData.permanentDivision || formData.locationDivision}
                      onChange={(e) => {
                        const newDiv = e.target.value;
                        const dists = getDistrictsForDivision(newDiv);
                        const firstDist = dists[0] || '';
                        const upaz = getUpazilasForDistrict(firstDist, newDiv);
                        setFormData({
                          ...formData,
                          permanentDivision: newDiv,
                          permanentDistrict: firstDist,
                          permanentUpazila: upaz[0] || ''
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {BANGLADESH_DIVISIONS.map(div => (
                        <option key={div.name} value={div.name}>{div.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'স্থায়ী জেলা' : 'Permanent District'}
                    </label>
                    <select
                      value={formData.permanentDistrict || formData.locationDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        const upaz = getUpazilasForDistrict(newDist, formData.permanentDivision);
                        setFormData({
                          ...formData,
                          permanentDistrict: newDist,
                          permanentUpazila: upaz[0] || ''
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {permanentDistricts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                      {!permanentDistricts.includes(formData.permanentDistrict) && formData.permanentDistrict && (
                        <option value={formData.permanentDistrict}>{formData.permanentDistrict}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'স্থায়ী উপজেলা / থানা' : 'Permanent Upazila / Thana'}
                    </label>
                    <select
                      value={formData.permanentUpazila || ''}
                      onChange={(e) => setFormData({ ...formData, permanentUpazila: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Upazila / Sadar</option>
                      {permanentUpazilas.map(upaz => (
                        <option key={upaz} value={upaz}>{upaz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বিস্তারিত স্থায়ী ঠিকানা (গ্রাম / ডাকঘর)' : 'Permanent Village / Post Office'}
                  </label>
                  <input
                    type="text"
                    value={formData.permanentAddress || ''}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    placeholder="Village, Union, Post Office..."
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Overseas & NRB Info */}
              <div className="p-4 bg-slate-800/25 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>{isBangla ? 'প্রবাসী ও বৈদেশিক স্ট্যাটাস (যদি প্রযোজ্য হয়)' : 'Overseas & Diaspora Status'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'প্রবাসী দেশ' : 'Overseas Country'}
                    </label>
                    <select
                      value={formData.overseasCountry || ''}
                      onChange={(e) => setFormData({ ...formData, overseasCountry: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None (Living in Bangladesh)</option>
                      {OVERSEAS_COUNTRIES.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'ভিসা স্ট্যাটাস' : 'Visa / Residency Status'}
                    </label>
                    <select
                      value={formData.visaStatus || 'Citizen'}
                      onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {VISA_STATUSES.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY & GUARDIAN */}
          {activeTab === 'FAMILY' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'পারিবারিক পটভূমি ও অভিভাবকের তথ্য' : 'Family Structure & Guardian Contacts'}
                </span>
                <span className="text-[11px] text-slate-400">Strict Guardian Verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'পরিবারের ধরন' : 'Family Type'} *
                  </label>
                  <select
                    value={formData.familyType}
                    onChange={(e) => setFormData({ ...formData, familyType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FAMILY_TYPES.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'পিতামাতার বর্তমান অবস্থা' : 'Parents Status'} *
                  </label>
                  <select
                    value={formData.parentsStatus || 'Both Alive'}
                    onChange={(e) => setFormData({ ...formData, parentsStatus: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PARENTS_STATUSES.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'আর্থিক অবস্থা' : 'Financial Condition'} *
                  </label>
                  <select
                    value={formData.financialCondition}
                    onChange={(e) => setFormData({ ...formData, financialCondition: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FINANCIAL_CONDITIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'পিতার পেশা' : "Father's Profession"}
                  </label>
                  <input
                    type="text"
                    value={formData.fatherProfession}
                    onChange={(e) => setFormData({ ...formData, fatherProfession: e.target.value })}
                    placeholder="e.g. Businessman, Retired Govt Officer, Teacher..."
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'মাতার পেশা' : "Mother's Profession"}
                  </label>
                  <input
                    type="text"
                    value={formData.motherProfession || ''}
                    onChange={(e) => setFormData({ ...formData, motherProfession: e.target.value })}
                    placeholder="e.g. Homemaker, Govt Teacher, Doctor..."
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'ভাইয়ের সংখ্যা' : 'Number of Brothers'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formData.brotherCount}
                    onChange={(e) => setFormData({ ...formData, brotherCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'বোনের সংখ্যা' : 'Number of Sisters'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formData.sisterCount}
                    onChange={(e) => setFormData({ ...formData, sisterCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Guardian contact numbers */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  {isBangla ? 'অভিভাবকের যোগাযোগ নম্বর' : 'Guardian Contact & Verification Link'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'অভিভাবকের ফোন নম্বর' : 'Guardian Phone Number'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+880 1711-xxxxxx"
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      {isBangla ? 'সম্পর্ক' : 'Guardian Relation'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      placeholder="e.g. Father, Mother, Elder Brother, Uncle..."
                      className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BIO, ABOUT ME & SANITIZATION */}
          {activeTab === 'BIO' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                <span className="font-medium">
                  {isBangla ? 'নিজের সম্পর্কে বিবরণ ও প্রত্যাশা' : 'About Me & Partner Expectations'}
                </span>
                <span className="text-[11px] text-slate-400">Public Biodata Description</span>
              </div>

              {phoneWarning && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-start justify-between gap-3 text-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">{phoneWarning}</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        {isBangla 
                          ? 'পাবলিক প্রোফাইলে ফোন ফাঁস হলে রাজস্ব ক্ষতিগ্রস্ত হয়।'
                          : 'Publicly exposing phone numbers bypasses contact unlock credits.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={sanitizeBioPhone}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] shrink-0"
                  >
                    {isBangla ? 'নম্বর লুকান' : 'Auto Sanitize'}
                  </button>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  {isBangla ? 'নিজের সম্পর্কে ও জীবনসঙ্গী সম্পর্কে প্রত্যাশা (Bio)' : 'About Me & Partner Expectations'}
                </label>
                <textarea
                  rows={6}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Describe personality, values, religious practices, lifestyle, and expected qualities in a spouse..."
                  className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'সদস্যের নিজস্ব ফোন (লগইন ফোন)' : 'Member Login / Direct Phone'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    {isBangla ? 'ইমেইল এড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {isBangla ? 'সকল পরিবর্তন তাৎক্ষণিকভাবে ক্লাউড ডাটাবেজে সংরক্ষিত হবে।' : 'Edits sync immediately with Android Ghotok app.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-900/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isBangla ? 'বায়োডাটা আপডেট করুন' : 'Save Biodata Updates'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
