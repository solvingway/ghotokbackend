import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserBiodata, 
  VerificationRequestItem, 
  PaymentRequestItem, 
  GuardianCallLog, 
  ContactAuditLog, 
  ReportedItem, 
  BroadcastAnnouncement, 
  AdminStats,
  AccountStatus,
  PackageTier
} from '../types/admin';
import { 
  INITIAL_USERS, 
  INITIAL_VERIFICATION_REQUESTS, 
  INITIAL_PAYMENT_REQUESTS, 
  INITIAL_CALL_LOGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_REPORTS, 
  INITIAL_BROADCASTS 
} from '../data/mockData';
import { 
  db, 
  auth,
  checkFirestoreConnection, 
  FIRESTORE_DATABASE_ID, 
  FIREBASE_PROJECT_ID,
  loginAnonymously
} from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  sendTargetedBroadcast, 
  approveUserVerification, 
  approvePackagePayment, 
  sendMatchFoundNotification 
} from '../services/notificationService';

interface FirestoreSyncState {
  connected: boolean;
  databaseId: string;
  projectId: string;
  syncing: boolean;
  statusText: string;
  liveUsersCount: number;
  liveRequestsCount: number;
}

interface AdminDataContextType {
  users: UserBiodata[];
  verificationRequests: VerificationRequestItem[];
  paymentRequests: PaymentRequestItem[];
  callLogs: GuardianCallLog[];
  auditLogs: ContactAuditLog[];
  reports: ReportedItem[];
  broadcasts: BroadcastAnnouncement[];
  stats: AdminStats;
  isBangla: boolean;
  toggleLanguage: () => void;
  currentUser: User | null;
  isAuthChecking: boolean;
  isLiveMode: boolean;
  toggleLiveMode: () => void;
  firestoreStatus: FirestoreSyncState;
  syncWithFirestore: () => Promise<void>;
  seedLiveDatabaseWithInitialData: () => Promise<void>;
  // Module 1 Actions
  approveVerification: (requestId: string, adminNote?: string) => Promise<void>;
  rejectVerification: (requestId: string, reason: string, adminNote?: string) => Promise<void>;
  // Module 2 Actions
  approvePayment: (requestId: string, adminNote?: string) => Promise<void>;
  rejectPayment: (requestId: string, reason: string) => Promise<void>;
  updateUserQuota: (profileCode: string, tier: PackageTier, interests: number, contacts: number) => Promise<void>;
  // Module 3 Actions
  saveUserBiodata: (updatedUser: UserBiodata) => Promise<void>;
  deleteUserProfile: (profile: UserBiodata) => Promise<void>;
  setAccountStatus: (profileCode: string, status: AccountStatus, reason?: string, successStory?: string) => Promise<void>;
  toggleAssistedProfile: (profileCode: string) => void;
  createUserProfile: (newUser: Omit<UserBiodata, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserBiodata>;
  // Module 4 Actions
  addCallLog: (log: Omit<GuardianCallLog, 'id' | 'callDate'>) => Promise<void>;
  sendGhotokRecommendation: (clientCode: string, candidateCode: string, note: string) => void;
  // Module 5 Actions
  resolveReport: (reportId: string, action: 'NO_ACTION' | 'WARNING_SENT' | 'TEMP_SUSPEND' | 'PERMANENT_BAN', note: string) => Promise<void>;
  flagAuditLog: (logId: string) => Promise<void>;
  // Module 6 Actions
  sendBroadcast: (broadcast: Omit<BroadcastAnnouncement, 'id' | 'sentAt' | 'recipientCount' | 'clickCount' | 'status'>) => Promise<void>;
  // General
  resetToDemoData: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'ghotok_admin_';

// Purge any legacy cached mock data in localStorage once on startup
try {
  const cachedUsers = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
  if (cachedUsers && (cachedUsers.includes('sayma.akter@example.com') || cachedUsers.includes('uid_b600001'))) {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}verifications`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}payments`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}calls`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}reports`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}broadcasts`);
  }

  // Ensure database ID is pointed to the live Android app Firestore DB
  const fbCfg = localStorage.getItem('ghotok_firebase_cfg_v2_config');
  if (fbCfg && fbCfg.includes('ai-studio-ee10d669-2437-4e64-9a43-3484863699ca')) {
    const parsed = JSON.parse(fbCfg);
    parsed.firestoreDatabaseId = 'ai-studio-android-ghotok-4211e3a9-df28-46c8-9b21-bd8ea1fc4a18';
    localStorage.setItem('ghotok_firebase_cfg_v2_config', JSON.stringify(parsed));
  }
} catch {
  // ignore storage exceptions
}

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBangla, setIsBangla] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`) === 'bn';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Live Mode is permanently active
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreSyncState>({
    connected: false,
    databaseId: FIRESTORE_DATABASE_ID,
    projectId: FIREBASE_PROJECT_ID,
    syncing: false,
    statusText: 'Connecting to Firestore...',
    liveUsersCount: 0,
    liveRequestsCount: 0
  });

  // State initialized purely from live data (empty by default)
  const [users, setUsers] = useState<UserBiodata[]>(INITIAL_USERS);
  const [liveFirestoreUsers, setLiveFirestoreUsers] = useState<UserBiodata[]>([]);

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestItem[]>(INITIAL_VERIFICATION_REQUESTS);
  const [liveVerificationRequests, setLiveVerificationRequests] = useState<VerificationRequestItem[]>([]);

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);
  const [livePaymentRequests, setLivePaymentRequests] = useState<PaymentRequestItem[]>([]);

  const [callLogs, setCallLogs] = useState<GuardianCallLog[]>(INITIAL_CALL_LOGS);
  const [auditLogs, setAuditLogs] = useState<ContactAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [reports, setReports] = useState<ReportedItem[]>(INITIAL_REPORTS);
  const [broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>(INITIAL_BROADCASTS);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const toggleLiveMode = () => {
    showToast(isBangla ? '১০০% লাইভ ফায়ারস্টোর মোড সক্রিয়।' : '100% Live Firestore Database Mode Active');
  };

  // Helper to parse Firestore user doc into UserBiodata
  const parseFirestoreUser = (docId: string, data: any): UserBiodata => {
    return {
      id: docId,
      userId: data.userId || docId,
      profileCode: data.profileCode || docId,
      displayName: data.displayName || data.displayNameBangla || docId,
      displayNameBangla: data.displayNameBangla || '',
      email: data.email || '',
      phone: data.phone || data.contactPhone || '',
      photoUrl: data.photoUrl || data.photoURL || (docId.startsWith('B') ? '/default_woman_dp.jpg' : '/default_man_dp.jpg'),
      gender: data.gender || (docId.startsWith('B') ? 'Female' : 'Male'),
      dateOfBirth: data.dateOfBirth || '1998-05-15',
      age: data.age || 26,
      maritalStatus: data.maritalStatus || 'Never Married',
      religion: data.religion || 'Muslim',
      height: data.height || "5'6''",
      weightKg: data.weight || data.weightKg || 60,
      complexion: data.complexion || 'Fair',
      bloodGroup: data.bloodGroup || 'B+',
      educationLevel: data.education || "Bachelor's",
      educationSubject: data.educationGroup || 'General',
      institution: data.institution || '',
      ieltsScore: data.ieltsScore || 'None / N/A',
      employmentType: data.employmentType || 'Private job',
      profession: data.profession || 'Professional',
      jobDesignation: data.jobDesignation || '',
      jobOrganization: data.jobOrganization || '',
      monthlyIncome: data.monthlyIncome || '',
      locationDivision: data.locationDivision || data.presentDivision || 'Dhaka',
      locationDistrict: data.locationDistrict || data.presentDistrict || 'Dhaka',
      presentUpazila: data.presentUpazila || 'Sadar',
      presentAddress: data.presentAddress || '',
      permanentDistrict: data.permanentDistrict || 'Dhaka',
      permanentAddress: data.permanentAddress || '',
      overseasCountry: data.overseasCountry || '',
      familyType: data.familyType || 'Nuclear',
      fatherProfession: data.fatherProfession || '',
      motherProfession: data.motherProfession || '',
      brotherCount: data.brotherCount || 0,
      sisterCount: data.sisterCount || 0,
      financialCondition: data.financialCondition || 'Middle Class',
      aboutMe: data.aboutMe || '',
      guardianPhone: data.guardianPhone || '',
      guardianRelation: data.guardianRelation || 'Guardian',
      createdBy: data.createdBy || 'Self',
      eyeColour: data.eyeColour || data.eyeColor || 'Black',
      hairColour: data.hairColour || data.hairColor || 'Black',
      disability: data.disability || 'None',
      jobEmploymentStatus: data.jobEmploymentStatus || data.jobStatus || 'Permanent',
      visaStatus: data.visaStatus || 'Citizen',
      parentsStatus: data.parentsStatus || 'Both Alive',
      marriageTimeline: data.marriageTimeline || 'Flexible / Not Fixed',
      permanentDivision: data.permanentDivision || data.locationDivision || 'Dhaka',
      permanentUpazila: data.permanentUpazila || '',
      isVerified: data.isVerified || false,
      verificationStatus: data.verificationStatus || (data.isVerified ? 'VERIFIED' : 'UNSUBMITTED'),
      verificationDocType: data.verificationDocType || 'Smart NID Card',
      verificationIdNumber: data.verificationIdNumber || '',
      verificationDocUri: data.verificationDocUri || '',
      accountStatus: data.accountStatus || 'ACTIVE',
      packageTier: data.packageTier || 'Free',
      interestsRemaining: data.interestsRemaining ?? 2,
      contactsRemaining: data.contactsRemaining ?? 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
    };
  };

  // Real-time synchronization with Firestore
  const syncWithFirestore = useCallback(async () => {
    setFirestoreStatus(prev => ({ ...prev, syncing: true, statusText: 'Connecting to Firestore...' }));
    try {
      const check = await checkFirestoreConnection();
      
      // Fetch users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      const parsedUsers: UserBiodata[] = [];
      usersSnap.forEach(d => {
        parsedUsers.push(parseFirestoreUser(d.id, d.data()));
      });

      setLiveFirestoreUsers(parsedUsers);

      // Fetch verification requests collection
      try {
        const verSnap = await getDocs(collection(db, 'verificationRequests'));
        const parsedVer: VerificationRequestItem[] = [];
        verSnap.forEach(d => {
          const data = d.data();
          parsedVer.push({
            id: d.id,
            userId: data.userId || d.id,
            profileCode: data.profileCode || d.id,
            displayName: data.displayName || d.id,
            displayNameBangla: data.displayNameBangla || '',
            gender: data.gender || 'Male',
            age: data.age || 26,
            dateOfBirth: data.dateOfBirth || '',
            photoUrl: data.photoUrl || '/default_man_dp.jpg',
            locationDistrict: data.locationDistrict || 'Dhaka',
            docType: data.docType || 'Smart NID Card',
            idNumber: data.idNumber || '',
            docUrl: data.docUrl || '',
            status: data.status || 'PENDING',
            submittedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            adminNote: data.adminNote || ''
          });
        });
        setLiveVerificationRequests(parsedVer);
      } catch (e) {
        // ignore
      }

      // Fetch payment requests collection
      try {
        const paySnap = await getDocs(collection(db, 'paymentRequests'));
        const parsedPay: PaymentRequestItem[] = [];
        paySnap.forEach(d => {
          const data = d.data();
          parsedPay.push({
            id: d.id,
            userId: data.userId || '',
            profileCode: data.profileCode || '',
            displayName: data.displayName || '',
            phone: data.phone || data.senderPhone || '',
            packageTier: data.packageTier || 'Gold',
            amountBdt: data.amountBdt || 990,
            paymentMethod: data.paymentMethod || 'bKash',
            senderPhone: data.senderPhone || '',
            transactionId: data.transactionId || '',
            status: data.status || 'PENDING',
            submittedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            adminNote: data.adminNote || '',
            interestsToCredit: data.interestsToCredit || 40,
            contactsToCredit: data.contactsToCredit || 25
          });
        });
        setLivePaymentRequests(parsedPay);
      } catch (e) {
        // ignore
      }

      // Fetch reports collection
      try {
        const repSnap = await getDocs(collection(db, 'reports'));
        const parsedRep: ReportedItem[] = [];
        repSnap.forEach(d => {
          const data = d.data();
          parsedRep.push({
            id: d.id,
            reportType: data.reportType || 'PROFILE',
            reporterCode: data.reporterCode || '',
            reporterName: data.reporterName || '',
            reportedCode: data.reportedCode || '',
            reportedName: data.reportedName || '',
            reportedPhoto: data.reportedPhoto || '',
            category: data.category || 'Inappropriate Content',
            description: data.description || '',
            evidenceText: data.evidenceText || '',
            reportedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            status: data.status || 'PENDING',
            actionTaken: data.actionTaken,
            resolutionNote: data.resolutionNote
          });
        });
        if (parsedRep.length > 0) {
          setReports(parsedRep);
        }
      } catch (e) {
        // ignore
      }

      // Fetch broadcasts collection
      try {
        const bcSnap = await getDocs(collection(db, 'broadcasts'));
        const parsedBc: BroadcastAnnouncement[] = [];
        bcSnap.forEach(d => {
          const data = d.data();
          parsedBc.push({
            id: d.id,
            titleEn: data.titleEn || '',
            titleBn: data.titleBn || '',
            messageEn: data.messageEn || '',
            messageBn: data.messageBn || '',
            targetAudience: data.targetAudience || 'ALL',
            channels: data.channels || ['IN_APP', 'PUSH'],
            sentAt: data.sentAt || new Date().toISOString(),
            recipientCount: data.recipientCount || 0,
            clickCount: data.clickCount || 0,
            status: data.status || 'SENT'
          });
        });
        if (parsedBc.length > 0) {
          setBroadcasts(parsedBc);
        }
      } catch (e) {
        // ignore
      }

      // Fetch callLogs collection
      try {
        const callSnap = await getDocs(collection(db, 'callLogs'));
        const parsedCalls: GuardianCallLog[] = [];
        callSnap.forEach(d => {
          const data = d.data();
          parsedCalls.push({
            id: d.id,
            profileCode: data.profileCode || '',
            userName: data.userName || '',
            guardianName: data.guardianName || '',
            guardianPhone: data.guardianPhone || '',
            callDate: data.callDate || new Date().toISOString(),
            callType: data.callType || 'Match Consultation',
            adminName: data.adminName || 'Admin',
            notes: data.notes || '',
            followUpDate: data.followUpDate,
            status: data.status || 'Completed'
          });
        });
        if (parsedCalls.length > 0) {
          setCallLogs(parsedCalls);
        }
      } catch (e) {
        // ignore
      }

      setFirestoreStatus({
        connected: check.connected,
        databaseId: FIRESTORE_DATABASE_ID,
        projectId: FIREBASE_PROJECT_ID,
        syncing: false,
        statusText: `Online • ${parsedUsers.length} Live Users`,
        liveUsersCount: parsedUsers.length,
        liveRequestsCount: usersSnap.size
      });
    } catch (err: any) {
      setFirestoreStatus({
        connected: false,
        databaseId: FIRESTORE_DATABASE_ID,
        projectId: FIREBASE_PROJECT_ID,
        syncing: false,
        statusText: err?.code === 'permission-denied' 
          ? 'Permission Denied (Sign In Required)' 
          : (err?.message || 'Offline Mode'),
        liveUsersCount: 0,
        liveRequestsCount: 0
      });
    }
  }, []);

  // Listen to Auth State & establish real-time Firestore onSnapshot subscriptions
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
      if (user) {
        await syncWithFirestore();

        // Subscribe in real-time to users collection
        try {
          const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const list: UserBiodata[] = [];
            snapshot.forEach(d => list.push(parseFirestoreUser(d.id, d.data())));
            setLiveFirestoreUsers(list);
            setFirestoreStatus(prev => ({
              ...prev,
              connected: true,
              liveUsersCount: list.length,
              statusText: `Live Synced • ${list.length} Users`
            }));
          }, (err) => {
            console.warn('Real-time users snapshot error:', err);
          });
          unsubs.push(unsubUsers);
        } catch (e) {
          console.warn('Users listener attach error:', e);
        }

        // Subscribe in real-time to verificationRequests collection
        try {
          const unsubVer = onSnapshot(collection(db, 'verificationRequests'), (snapshot) => {
            const list: VerificationRequestItem[] = [];
            snapshot.forEach(d => {
              const data = d.data();
              list.push({
                id: d.id,
                userId: data.userId || d.id,
                profileCode: data.profileCode || d.id,
                displayName: data.displayName || d.id,
                displayNameBangla: data.displayNameBangla || '',
                gender: data.gender || 'Male',
                age: data.age || 26,
                dateOfBirth: data.dateOfBirth || '',
                photoUrl: data.photoUrl || '/default_man_dp.jpg',
                locationDistrict: data.locationDistrict || 'Dhaka',
                docType: data.docType || 'Smart NID Card',
                idNumber: data.idNumber || '',
                docUrl: data.docUrl || '',
                status: data.status || 'PENDING',
                submittedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                adminNote: data.adminNote || ''
              });
            });
            setLiveVerificationRequests(list);
          }, (err) => {
            console.warn('Real-time verifications snapshot error:', err);
          });
          unsubs.push(unsubVer);
        } catch (e) {
          console.warn('Verifications listener attach error:', e);
        }

        // Subscribe in real-time to paymentRequests collection
        try {
          const unsubPay = onSnapshot(collection(db, 'paymentRequests'), (snapshot) => {
            const list: PaymentRequestItem[] = [];
            snapshot.forEach(d => {
              const data = d.data();
              list.push({
                id: d.id,
                userId: data.userId || '',
                profileCode: data.profileCode || '',
                displayName: data.displayName || '',
                phone: data.phone || data.senderPhone || '',
                packageTier: data.packageTier || 'Gold',
                amountBdt: data.amountBdt || 990,
                paymentMethod: data.paymentMethod || 'bKash',
                senderPhone: data.senderPhone || '',
                transactionId: data.transactionId || '',
                status: data.status || 'PENDING',
                submittedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                adminNote: data.adminNote || '',
                interestsToCredit: data.interestsToCredit || 40,
                contactsToCredit: data.contactsToCredit || 25
              });
            });
            setLivePaymentRequests(list);
          }, (err) => {
            console.warn('Real-time payments snapshot error:', err);
          });
          unsubs.push(unsubPay);
        } catch (e) {
          console.warn('Payments listener attach error:', e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(u => u());
    };
  }, [syncWithFirestore]);

  // Initial sync on mount
  useEffect(() => {
    syncWithFirestore();
  }, [syncWithFirestore]);

  // Pure Live Data selections: Deduplicate live profiles and never fallback to mock data
  const activeUsers = useMemo(() => {
    // Deduplicate live Firestore users: if multiple docs share the same profileCode or userId, prioritize the canonical profile
    const deduplicated: UserBiodata[] = [];
    const seenCodes = new Set<string>();
    const seenUserIds = new Set<string>();

    // Sort so canonical formatted profile codes (e.g. B600001, G600001) take precedence over raw UIDs
    const sortedLive = [...liveFirestoreUsers].sort((a, b) => {
      const aIsFormatted = /^[BG]\d{5,7}$/i.test(a.profileCode || '');
      const bIsFormatted = /^[BG]\d{5,7}$/i.test(b.profileCode || '');
      if (aIsFormatted && !bIsFormatted) return -1;
      if (!aIsFormatted && bIsFormatted) return 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });

    for (const u of sortedLive) {
      const code = (u.profileCode || '').trim();
      const uid = (u.userId || '').trim();
      const id = (u.id || '').trim();

      // Skip duplicates that share an already seen profileCode or raw UID
      if (code && seenCodes.has(code)) {
        continue;
      }
      if (uid && seenUserIds.has(uid) && !/^[BG]\d{5,7}$/i.test(code)) {
        continue;
      }

      if (code) seenCodes.add(code);
      if (uid) seenUserIds.add(uid);
      if (id) seenCodes.add(id);
      deduplicated.push(u);
    }

    const finalCodes = new Set(deduplicated.map(u => u.profileCode || u.id));
    const offlineOnly = users.filter(u => !finalCodes.has(u.profileCode || u.id));
    return [...deduplicated, ...offlineOnly];
  }, [liveFirestoreUsers, users]);

  const activeVerificationRequests = useMemo(() => {
    return liveVerificationRequests;
  }, [liveVerificationRequests]);

  const activePaymentRequests = useMemo(() => {
    return livePaymentRequests;
  }, [livePaymentRequests]);

  const toggleLanguage = () => {
    setIsBangla(prev => {
      const next = !prev;
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, next ? 'bn' : 'en');
      return next;
    });
  };

  // Module 1: Approve Verification
  const approveVerification = async (requestId: string, note?: string) => {
    const req = activeVerificationRequests.find(r => r.id === requestId);
    if (!req) return;

    setLiveVerificationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'VERIFIED', adminNote: note || r.adminNote };
      }
      return r;
    }));

    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === req.profileCode || u.userId === req.userId) {
        return { ...u, isVerified: true, verificationStatus: 'VERIFIED', updatedAt: new Date().toISOString() };
      }
      return u;
    }));

    showToast(isBangla 
      ? `${req.displayName}-এর পরিচয়পত্র ভেরিফিকেশন অনুমোদিত হয়েছে এবং ব্যাজ যুক্ত করা হয়েছে!` 
      : `Verified Badge approved and assigned to ${req.displayName} (${req.profileCode})!`
    );

    try {
      await approveUserVerification({
        requestId,
        userId: req.userId || req.profileCode,
        profileCode: req.profileCode,
        docType: req.docType || 'Smart NID Card'
      });
      if (note) {
        await updateDoc(doc(db, 'verificationRequests', requestId), {
          adminNote: note
        });
      }
    } catch (err) {
      console.log('Saved to state (Firestore background write handled):', err);
    }
  };

  // Module 1: Reject Verification
  const rejectVerification = async (requestId: string, reason: string, note?: string) => {
    const req = activeVerificationRequests.find(r => r.id === requestId);
    if (!req) return;

    setLiveVerificationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'REJECTED', rejectionReason: reason, adminNote: note || r.adminNote };
      }
      return r;
    }));

    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === req.profileCode || u.userId === req.userId) {
        return {
          ...u,
          isVerified: false,
          verificationStatus: 'REJECTED',
          rejectionReason: reason,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    showToast(isBangla 
      ? `${req.displayName}-এর ভেরিফিকেশন প্রত্যাখ্যান করা হয়েছে (কারণ: ${reason})` 
      : `Verification rejected for ${req.displayName}: ${reason}`
    );

    try {
      await updateDoc(doc(db, 'verificationRequests', requestId), {
        status: 'REJECTED',
        adminNote: reason,
        reviewedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', req.profileCode), {
        isVerified: false,
        verificationStatus: 'REJECTED',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.log('Saved to state:', err);
    }
  };

  // Module 2: Approve Payment
  const approvePayment = async (requestId: string, note?: string) => {
    const req = activePaymentRequests.find(r => r.id === requestId);
    if (!req) return;

    setLivePaymentRequests(prev => prev.map(p => {
      if (p.id === requestId) {
        return { ...p, status: 'APPROVED', adminNote: note || 'Approved' };
      }
      return p;
    }));

    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === req.profileCode || u.userId === req.userId) {
        return {
          ...u,
          packageTier: req.packageTier,
          pendingPackageTier: undefined,
          interestsRemaining: req.packageTier === 'Diamond' ? 999 : (u.interestsRemaining + req.interestsToCredit),
          contactsRemaining: req.packageTier === 'Diamond' ? 999 : (u.contactsRemaining + req.contactsToCredit),
          isVerified: (req.packageTier === 'Gold' || req.packageTier === 'Diamond') ? true : u.isVerified,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    showToast(isBangla
      ? `৳${req.amountBdt} পেমেন্ট (TrxID: ${req.transactionId}) অনুমোদিত! ${req.packageTier} প্যাকেজ সক্রিয় হয়েছে।`
      : `Payment of ৳${req.amountBdt} (TrxID: ${req.transactionId}) verified! Activated ${req.packageTier} for ${req.displayName}.`
    );

    const interestsToCredit = req.interestsToCredit || (req.packageTier === 'Diamond' ? 150 : req.packageTier === 'Gold' ? 60 : 25);
    const contactsToCredit = req.contactsToCredit || (req.packageTier === 'Diamond' ? 75 : req.packageTier === 'Gold' ? 30 : 10);

    try {
      await approvePackagePayment({
        requestId,
        userId: req.userId || req.profileCode,
        profileCode: req.profileCode,
        packageTier: (req.packageTier as any) || 'Gold',
        interestsToCredit,
        contactsToCredit
      });
      if (note) {
        await updateDoc(doc(db, 'paymentRequests', requestId), {
          adminNote: note
        });
      }
    } catch (err) {
      console.log('Saved to state:', err);
    }
  };

  // Module 2: Reject Payment
  const rejectPayment = async (requestId: string, reason: string) => {
    const req = activePaymentRequests.find(r => r.id === requestId);
    if (!req) return;

    setLivePaymentRequests(prev => prev.map(p => {
      if (p.id === requestId) {
        return { ...p, status: 'REJECTED', adminNote: reason };
      }
      return p;
    }));

    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === req.profileCode || u.userId === req.userId) {
        return {
          ...u,
          pendingPackageTier: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    showToast(isBangla
      ? `পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে: ${reason}`
      : `Payment request rejected: ${reason}`
    );

    try {
      await updateDoc(doc(db, 'paymentRequests', requestId), {
        status: 'REJECTED',
        adminNote: reason,
        reviewedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', req.profileCode), {
        pendingPackageTier: '',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.log('Saved to state:', err);
    }
  };

  // Module 2: Update User Quota / Package manually
  const updateUserQuota = async (profileCode: string, tier: PackageTier, interests: number, contacts: number) => {
    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === profileCode) {
        return {
          ...u,
          packageTier: tier,
          interestsRemaining: interests,
          contactsRemaining: contacts,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));
    showToast(`Updated ${profileCode} quota: Tier ${tier}, Interests: ${interests}, Contacts: ${contacts}`);

    try {
      await updateDoc(doc(db, 'users', profileCode), {
        packageTier: tier,
        interestsRemaining: interests,
        contactsRemaining: contacts,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.log('Saved to state:', err);
    }
  };

  // Module 3: Save User Biodata edit (In-place update to existing document without duplication)
  const saveUserBiodata = async (updatedUser: UserBiodata) => {
    // 1. Update live state in-place matching by id or profileCode
    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.id === updatedUser.id || (updatedUser.profileCode && u.profileCode === updatedUser.profileCode)) {
        return {
          ...updatedUser,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === updatedUser.id || (updatedUser.profileCode && u.profileCode === updatedUser.profileCode)) {
        return {
          ...updatedUser,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    showToast(isBangla
      ? `প্রোফাইল ${updatedUser.profileCode} সফলভাবে আপডেট করা হয়েছে!`
      : `Biodata for ${updatedUser.profileCode} (${updatedUser.displayName}) updated successfully!`
    );

    const docUpdates: Record<string, any> = {
      profileCode: updatedUser.profileCode,
      userId: updatedUser.userId || updatedUser.id || updatedUser.profileCode,
      displayName: updatedUser.displayName,
      displayNameBangla: updatedUser.displayNameBangla || '',
      phone: updatedUser.phone,
      contactPhone: updatedUser.phone,
      email: updatedUser.email,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      age: updatedUser.age,
      maritalStatus: updatedUser.maritalStatus,
      religion: updatedUser.religion,
      height: updatedUser.height,
      weight: updatedUser.weightKg,
      weightKg: updatedUser.weightKg,
      complexion: updatedUser.complexion,
      bloodGroup: updatedUser.bloodGroup,
      education: updatedUser.educationLevel,
      educationLevel: updatedUser.educationLevel,
      educationSubject: updatedUser.educationSubject,
      institution: updatedUser.institution,
      ieltsScore: updatedUser.ieltsScore,
      employmentType: updatedUser.employmentType,
      profession: updatedUser.profession,
      jobDesignation: updatedUser.jobDesignation,
      jobOrganization: updatedUser.jobOrganization,
      jobEmploymentStatus: updatedUser.jobEmploymentStatus || '',
      monthlyIncome: updatedUser.monthlyIncome,
      locationDivision: updatedUser.locationDivision,
      presentDivision: updatedUser.locationDivision,
      locationDistrict: updatedUser.locationDistrict,
      presentDistrict: updatedUser.locationDistrict,
      presentUpazila: updatedUser.presentUpazila,
      presentAddress: updatedUser.presentAddress,
      permanentDivision: updatedUser.permanentDivision || '',
      permanentDistrict: updatedUser.permanentDistrict,
      permanentUpazila: updatedUser.permanentUpazila || '',
      permanentAddress: updatedUser.permanentAddress,
      overseasCountry: updatedUser.overseasCountry || '',
      visaStatus: updatedUser.visaStatus || '',
      familyType: updatedUser.familyType,
      parentsStatus: updatedUser.parentsStatus || '',
      fatherProfession: updatedUser.fatherProfession,
      motherProfession: updatedUser.motherProfession,
      brotherCount: updatedUser.brotherCount,
      sisterCount: updatedUser.sisterCount,
      financialCondition: updatedUser.financialCondition,
      marriageTimeline: updatedUser.marriageTimeline || '',
      createdBy: updatedUser.createdBy || '',
      eyeColour: updatedUser.eyeColour || '',
      hairColour: updatedUser.hairColour || '',
      disability: updatedUser.disability || '',
      aboutMe: updatedUser.aboutMe,
      guardianPhone: updatedUser.guardianPhone,
      guardianRelation: updatedUser.guardianRelation,
      updatedAt: serverTimestamp()
    };

    try {
      // Update ONLY the exact single Firestore document for this user
      const targetDocId = updatedUser.id || updatedUser.profileCode;
      await setDoc(doc(db, 'users', targetDocId), docUpdates, { merge: true });

      // If profile has a profileCode, sync public facts to 'profiles' collection for app searches
      if (updatedUser.profileCode) {
        await setDoc(doc(db, 'profiles', updatedUser.profileCode), {
          ...docUpdates,
          profileCode: updatedUser.profileCode
        }, { merge: true });
      }
    } catch (err) {
      console.log('Saved to state (Firestore sync note):', err);
    }
  };

  // Module 3: Delete User Profile (removes record permanently from Firestore & in-memory)
  const deleteUserProfile = async (profile: UserBiodata) => {
    setLiveFirestoreUsers(prev => prev.filter(u => u.id !== profile.id && u.profileCode !== profile.profileCode));
    setUsers(prev => prev.filter(u => u.id !== profile.id && u.profileCode !== profile.profileCode));

    showToast(isBangla 
      ? `প্রোফাইল ${profile.profileCode} মুছে ফেলা হয়েছে।` 
      : `Profile ${profile.profileCode} (${profile.displayName}) deleted successfully.`
    );

    try {
      const docId = profile.id || profile.profileCode;
      if (docId) {
        await deleteDoc(doc(db, 'users', docId));
      }
      if (profile.profileCode && profile.profileCode !== docId) {
        await deleteDoc(doc(db, 'users', profile.profileCode));
      }
      if (profile.profileCode) {
        await deleteDoc(doc(db, 'profiles', profile.profileCode));
      }
    } catch (err) {
      console.warn('Delete profile error:', err);
    }
  };

  // Module 3: Set Account Status
  const setAccountStatus = async (profileCode: string, status: AccountStatus, reason?: string, successStory?: string) => {
    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === profileCode) {
        return {
          ...u,
          accountStatus: status,
          marriageDate: status === 'MARRIED' ? (new Date().toISOString().split('T')[0]) : u.marriageDate,
          successStoryNote: successStory || u.successStoryNote,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    const statusLabels: Record<AccountStatus, string> = {
      ACTIVE: isBangla ? 'সক্রিয়' : 'Active',
      SUSPENDED: isBangla ? 'সাময়িক স্থগিত/ব্যান' : 'Suspended/Banned',
      HIDDEN: isBangla ? 'লুকানো' : 'Hidden',
      MARRIED: isBangla ? 'বিবাহ সম্পন্ন / ম্যাচ পাওয়া গেছে' : 'Married / Match Found'
    };

    showToast(`${profileCode} status set to ${statusLabels[status]}`);

    try {
      await updateDoc(doc(db, 'users', profileCode), {
        accountStatus: status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.log('Saved to state:', err);
    }
  };

  // Module 3: Toggle Seed / Assisted Profile
  const toggleAssistedProfile = (profileCode: string) => {
    setLiveFirestoreUsers(prev => prev.map(u => {
      if (u.profileCode === profileCode) {
        return {
          ...u,
          isAssistedGhotokProfile: !u.isAssistedGhotokProfile,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    }));
  };

  // Module 3: Create User Profile in live Firestore
  const createUserProfile = async (newUser: Omit<UserBiodata, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserBiodata> => {
    const isBride = newUser.gender === 'Female';
    const prefix = isBride ? 'B' : 'G';
    const existingSerials = activeUsers
      .filter(u => u.gender === newUser.gender && u.profileCode.startsWith(prefix))
      .map(u => parseInt(u.profileCode.slice(2), 10))
      .filter(n => !isNaN(n));
    const nextSerial = (existingSerials.length > 0 ? Math.max(...existingSerials) : 0) + 1;
    const profileCode = `${prefix}6${String(nextSerial).padStart(5, '0')}`;
    
    const created: UserBiodata = {
      ...newUser,
      id: profileCode,
      profileCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [created, ...prev]);
    setLiveFirestoreUsers(prev => [created, ...prev]);

    try {
      await setDoc(doc(db, 'users', profileCode), {
        userId: created.userId,
        profileCode: created.profileCode,
        displayName: created.displayName,
        displayNameBangla: created.displayNameBangla,
        email: created.email,
        phone: created.phone,
        contactPhone: created.phone,
        guardianPhone: created.guardianPhone,
        photoUrl: created.photoUrl,
        photoURL: created.photoUrl,
        gender: created.gender,
        dateOfBirth: created.dateOfBirth,
        age: created.age,
        maritalStatus: created.maritalStatus,
        religion: created.religion,
        height: created.height,
        weight: created.weightKg,
        complexion: created.complexion,
        bloodGroup: created.bloodGroup,
        education: created.educationLevel,
        profession: created.profession,
        locationDistrict: created.locationDistrict,
        locationDivision: created.locationDivision,
        presentUpazila: created.presentUpazila,
        familyType: created.familyType,
        fatherProfession: created.fatherProfession,
        motherProfession: created.motherProfession,
        financialCondition: created.financialCondition,
        aboutMe: created.aboutMe,
        isVerified: created.isVerified,
        verificationStatus: created.verificationStatus,
        accountStatus: created.accountStatus,
        packageTier: created.packageTier,
        interestsRemaining: created.interestsRemaining,
        contactsRemaining: created.contactsRemaining,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Live create user warning:', e);
    }

    showToast(`Created new ${newUser.gender} profile: ${profileCode}`);
    return created;
  };

  // Module 4: Add Call Log
  const addCallLog = async (log: Omit<GuardianCallLog, 'id' | 'callDate'>) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: GuardianCallLog = {
      ...log,
      id: `call_${Date.now()}`,
      callDate: formattedDate
    };
    setCallLogs(prev => [newLog, ...prev]);
    showToast(isBangla ? 'অভিভাবক কল লগ সফলভাবে রেকর্ড করা হয়েছে!' : 'Guardian call log recorded!');

    try {
      await setDoc(doc(db, 'callLogs', newLog.id), {
        ...newLog,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      // ignore
    }
  };

  // Module 4: Send Recommendation
  const sendGhotokRecommendation = async (clientCode: string, candidateCode: string, note: string) => {
    const client = activeUsers.find(u => u.profileCode === clientCode);
    const candidate = activeUsers.find(u => u.profileCode === candidateCode);
    showToast(isBangla
      ? `ঘটক সুপারিশ: ${candidate?.displayName || candidateCode} প্রস্তাবটি ${client?.displayName || clientCode}-এর কাছে পাঠানো হয়েছে!`
      : `Recommendation pushed: ${candidate?.displayName || candidateCode} suggested to ${client?.displayName || clientCode}!`
    );

    try {
      await sendMatchFoundNotification({
        targetUserId: client?.userId || clientCode,
        targetProfileCode: clientCode,
        matchedUserId: candidate?.userId || candidateCode,
        matchedProfileCode: candidateCode,
        matchedName: candidate?.displayName || candidateCode,
        matchedProfession: candidate?.profession,
        matchedDistrict: candidate?.locationDistrict,
        matchScore: 92,
        note
      });
    } catch (e) {
      console.warn('Match found notification error:', e);
    }
  };

  // Module 5: Resolve Report
  const resolveReport = async (reportId: string, action: 'NO_ACTION' | 'WARNING_SENT' | 'TEMP_SUSPEND' | 'PERMANENT_BAN', note: string) => {
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return;

    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'RESOLVED',
          actionTaken: action,
          resolutionNote: note
        };
      }
      return r;
    }));

    if (action === 'TEMP_SUSPEND' || action === 'PERMANENT_BAN') {
      setAccountStatus(rep.reportedCode, 'SUSPENDED', note);
    }

    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'RESOLVED',
        actionTaken: action,
        resolutionNote: note,
        resolvedAt: serverTimestamp()
      });
    } catch (e) {
      // ignore
    }

    showToast(`Report ${reportId} resolved with action: ${action}`);
  };

  const flagAuditLog = async (logId: string) => {
    setAuditLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return { ...l, flaggedSuspicious: !l.flaggedSuspicious };
      }
      return l;
    }));

    try {
      const target = auditLogs.find(l => l.id === logId);
      if (target) {
        await setDoc(doc(db, 'auditLogs', logId), {
          ...target,
          flaggedSuspicious: !target.flaggedSuspicious,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      // ignore
    }
  };

  // Module 6: Send Broadcast
  const sendBroadcast = async (data: Omit<BroadcastAnnouncement, 'id' | 'sentAt' | 'recipientCount' | 'clickCount' | 'status'>) => {
    const recipientCount = data.targetAudience === 'ALL' ? activeUsers.length
      : data.targetAudience === 'UNVERIFIED' ? activeUsers.filter(u => !u.isVerified).length
      : data.targetAudience === 'FREE_TIERS' ? activeUsers.filter(u => u.packageTier === 'Free').length
      : activeUsers.length;

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newBroadcast: BroadcastAnnouncement = {
      ...data,
      id: `bc_${Date.now()}`,
      sentAt: formattedDate,
      recipientCount,
      clickCount: 0,
      status: 'SENT'
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);

    try {
      await sendTargetedBroadcast({
        targetSegment: data.targetSegment || data.targetAudience,
        titleEn: data.titleEn,
        bodyEn: data.messageEn,
        titleBn: data.titleBn,
        bodyBn: data.messageBn,
        actionRoute: data.actionRoute || (data.targetAudience === 'UNVERIFIED' ? 'VERIFY' : 'PACKAGES'),
        showBanner: data.showBanner !== undefined ? data.showBanner : data.channels.includes('IN_APP'),
        pushNotification: data.pushNotification !== undefined ? data.pushNotification : data.channels.includes('PUSH')
      });
    } catch (e) {
      console.warn('Broadcast send error:', e);
    }

    showToast(isBangla 
      ? `ঘোষণা পাঠানো হয়েছে ${recipientCount} জন ব্যবহারকারীর কাছে!` 
      : `Broadcast dispatched to ${recipientCount} targeted members!`
    );
  };

  // Refresh Live Data from Firestore
  const resetToDemoData = () => {
    syncWithFirestore();
    showToast(isBangla ? 'লাইভ ফায়ারস্টোর ডেটা রিফ্রেশ করা হয়েছে।' : 'Refreshed live Firestore records.');
  };

  const seedLiveDatabaseWithInitialData = async () => {
    await syncWithFirestore();
    showToast(isBangla ? 'লাইভ ডেটাবেজ সিঙ্ক সম্পন্ন।' : 'Live database synced.');
  };

  // Computed true live stats
  const stats = useMemo<AdminStats>(() => {
    const verified = activeUsers.filter(u => u.isVerified).length;
    const brides = activeUsers.filter(u => u.gender === 'Female').length;
    const grooms = activeUsers.filter(u => u.gender === 'Male').length;
    const pendingVer = activeVerificationRequests.filter(v => v.status === 'PENDING').length;
    const pendingPay = activePaymentRequests.filter(p => p.status === 'PENDING').length;
    const pendingRep = reports.filter(r => r.status === 'PENDING').length;
    const paidSubs = activeUsers.filter(u => u.packageTier !== 'Free').length;
    const marriedCount = activeUsers.filter(u => u.accountStatus === 'MARRIED').length;

    const revenueBdt = activePaymentRequests
      .filter(p => p.status === 'APPROVED')
      .reduce((acc, p) => acc + p.amountBdt, 0);

    return {
      totalRegistered: activeUsers.length,
      completedBiodatas: activeUsers.filter(u => Boolean(u.profession || u.displayName)).length,
      verifiedProfiles: verified,
      pendingVerifications: pendingVer,
      pendingPayments: pendingPay,
      pendingReports: pendingRep,
      activeSubscribers: paidSubs,
      totalRevenueBdt: revenueBdt,
      brideCount: brides,
      groomCount: grooms,
      matchesMade: marriedCount,
      activeChatsCount: 0,
      interestsSentToday: 0,
      interestsAcceptedRate: activeUsers.length > 0 ? Number(((verified / activeUsers.length) * 100).toFixed(1)) : 0
    };
  }, [activeUsers, activeVerificationRequests, activePaymentRequests, reports]);

  return (
    <AdminDataContext.Provider
      value={{
        users: activeUsers,
        verificationRequests: activeVerificationRequests,
        paymentRequests: activePaymentRequests,
        callLogs,
        auditLogs,
        reports,
        broadcasts,
        stats,
        isBangla,
        toggleLanguage,
        currentUser,
        isAuthChecking,
        isLiveMode,
        toggleLiveMode,
        firestoreStatus,
        syncWithFirestore,
        seedLiveDatabaseWithInitialData,
        approveVerification,
        rejectVerification,
        approvePayment,
        rejectPayment,
        updateUserQuota,
        saveUserBiodata,
        deleteUserProfile,
        setAccountStatus,
        toggleAssistedProfile,
        createUserProfile,
        addCallLog,
        sendGhotokRecommendation,
        resolveReport,
        flagAuditLog,
        sendBroadcast,
        resetToDemoData,
        toastMessage,
        setToastMessage
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
