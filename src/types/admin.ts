export type Gender = 'Male' | 'Female';
export type VerificationStatus = 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'HIDDEN' | 'MARRIED';
export type PackageTier = 'Free' | 'Silver' | 'Gold' | 'Diamond';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface UserBiodata {
  id: string; // e.g. "B600001" or "G600002"
  userId: string; // Auth UID
  profileCode: string; // e.g. "B600001"
  displayName: string;
  displayNameBangla: string;
  email: string;
  phone: string;
  photoUrl: string;
  gender: Gender;
  dateOfBirth: string; // "1998-05-15"
  age: number;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed' | 'Separated';
  religion: string;
  height: string;
  weightKg: number;
  complexion: string;
  bloodGroup: string;
  educationLevel: string;
  educationSubject: string;
  institution: string;
  ieltsScore: string;
  employmentType: string;
  profession: string;
  jobDesignation: string;
  jobOrganization: string;
  monthlyIncome: string;
  locationDivision: string;
  locationDistrict: string;
  presentUpazila: string;
  presentAddress: string;
  permanentDistrict: string;
  permanentAddress: string;
  overseasCountry?: string;
  citizenshipStatus?: string;
  familyType: 'Nuclear' | 'Joint' | 'Other' | string;
  fatherProfession: string;
  motherProfession: string;
  brotherCount: number;
  sisterCount: number;
  financialCondition: 'Upper Class' | 'Upper Middle Class' | 'Middle Class' | 'Lower Middle Class' | 'Lower Class' | string;
  aboutMe: string;
  guardianPhone: string;
  guardianRelation: string;
  createdBy?: string;
  eyeColour?: string;
  hairColour?: string;
  disability?: string;
  jobEmploymentStatus?: string;
  visaStatus?: string;
  parentsStatus?: string;
  marriageTimeline?: string;
  permanentDivision?: string;
  permanentUpazila?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDocType: string;
  verificationIdNumber: string;
  verificationDocUri: string;
  verificationSubmittedAt?: string;
  rejectionReason?: string;
  accountStatus: AccountStatus;
  packageTier: PackageTier;
  pendingPackageTier?: string;
  interestsRemaining: number;
  contactsRemaining: number;
  isAssistedGhotokProfile?: boolean; // Offline seed/assisted profile
  marriageDate?: string;
  successStoryNote?: string;
  createdAt: string;
  updatedAt: string;
  flaggedForSuspiciousBio?: boolean; // Contains phone number or external link in bio
  unlockedByUsersCount?: number;
}

export interface VerificationRequestItem {
  id: string;
  userId: string;
  profileCode: string;
  displayName: string;
  displayNameBangla: string;
  gender: Gender;
  age: number;
  dateOfBirth: string;
  photoUrl: string;
  locationDistrict: string;
  docType: 'Smart NID Card' | 'Bangladesh Passport' | 'Birth Certificate' | 'Professional License (BMDC/Bar)';
  idNumber: string;
  docUrl: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNote?: string;
}

export interface PaymentRequestItem {
  id: string;
  userId: string;
  profileCode: string;
  displayName: string;
  phone: string;
  packageTier: 'Silver' | 'Gold' | 'Diamond';
  amountBdt: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';
  senderPhone: string;
  transactionId: string;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminNote?: string;
  interestsToCredit: number;
  contactsToCredit: number;
}

export interface GuardianCallLog {
  id: string;
  profileCode: string;
  userName: string;
  guardianName: string;
  guardianPhone: string;
  callType: 'Inbound Inquiry' | 'Outbound Verification' | 'Match Consultation' | 'Complaint';
  callDate: string;
  adminName: string;
  notes: string;
  followUpDate?: string;
  status: 'Completed' | 'Follow-up Needed' | 'No Answer';
}

export interface ContactAuditLog {
  id: string;
  unlockedAt: string;
  unlockedByCode: string;
  unlockedByName: string;
  unlockedUserPhone: string;
  targetProfileCode: string;
  targetProfileName: string;
  targetGuardianPhone: string;
  packageTier: PackageTier;
  ipAddress: string;
  deviceInfo: string;
  flaggedSuspicious: boolean;
}

export interface ReportedItem {
  id: string;
  reportType: 'PROFILE' | 'CHAT_MESSAGE';
  reporterCode: string;
  reporterName: string;
  reportedCode: string;
  reportedName: string;
  reportedPhoto: string;
  category: 'Fake Info / Scammer' | 'Harassment / Abusive' | 'Financial Fraud / Asking Money' | 'Married Person on App' | 'Inappropriate Photo';
  description: string;
  evidenceText?: string;
  evidenceScreenshot?: string;
  reportedAt: string;
  status: ReportStatus;
  resolutionNote?: string;
  adminNote?: string;
  actionTaken?: 'NO_ACTION' | 'WARNING_SENT' | 'TEMP_SUSPEND' | 'PERMANENT_BAN';
}

export interface BroadcastAnnouncement {
  id: string;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  targetAudience: 'ALL' | 'UNVERIFIED' | 'FREE_TIERS' | 'INCOMPLETE_ONBOARDING' | 'DIAMOND_VIP' | 'DHAKA_DIVISION' | 'OVERSEAS';
  targetSegment?: string;
  channels: ('IN_APP' | 'PUSH' | 'SMS')[];
  actionRoute?: string;
  showBanner?: boolean;
  pushNotification?: boolean;
  sentAt: string;
  recipientCount: number;
  clickCount: number;
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
}

export interface AdminStats {
  totalRegistered: number;
  completedBiodatas: number;
  verifiedProfiles: number;
  pendingVerifications: number;
  pendingPayments: number;
  pendingReports: number;
  activeSubscribers: number;
  totalRevenueBdt: number;
  brideCount: number;
  groomCount: number;
  matchesMade: number;
  activeChatsCount: number;
  interestsSentToday: number;
  interestsAcceptedRate: number;
}
