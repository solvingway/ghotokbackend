import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * 1. Broadcast & Notifications Desk (Targeted English & বাংলা Alerts)
 * Connects to write to /broadcasts/{broadcastId} and triggers real-time
 * Android Notification Drawer and In-App Announcement Card.
 */
export async function sendTargetedBroadcast({
  targetSegment, // Exact label or key from Target Audience Segment dropdown
  titleEn,
  bodyEn,
  titleBn,
  bodyBn,
  actionRoute = "PACKAGES", // "PACKAGES" | "VERIFY" | "MATCHES" | "PROFILE"
  showBanner = true,        // Shows the In-App Announcement Card on Home Screen
  pushNotification = true   // Triggers Android Notification Drawer alert
}: {
  targetSegment: string;
  titleEn: string;
  bodyEn: string;
  titleBn: string;
  bodyBn: string;
  actionRoute?: string;
  showBanner?: boolean;
  pushNotification?: boolean;
}) {
  const broadcastId = `bcast_${Date.now()}`;
  await setDoc(doc(db, "broadcasts", broadcastId), {
    broadcastId,
    type: "BROADCAST",
    targetSegment, // Works with exact dropdown text or segment key
    targetUserId: "ALL",
    title: titleEn || titleBn,
    titleEn: titleEn || "",
    titleBn: titleBn || "",
    body: bodyEn || bodyBn,
    bodyEn: bodyEn || "",
    bodyBn: bodyBn || "",
    actionRoute: targetSegment.toLowerCase().includes("unverified") ? "VERIFY" : actionRoute,
    showBanner,
    pushNotification,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return broadcastId;
}

/**
 * 2. KYC / Account Verification Approval (With Push + In-App Alert)
 * When approving a user's NID/Passport in KYC & ID Verification
 */
export async function approveUserVerification({
  requestId,   // e.g. "B600001"
  userId,      // Firebase UID from the verificationRequests doc
  profileCode, // Formatted ID e.g. "B600001" or "G600001"
  docType      // e.g. "Smart NID Card" or "Passport"
}: {
  requestId: string;
  userId: string;
  profileCode: string;
  docType: string;
}) {
  // 1. Mark verification request APPROVED
  await updateDoc(doc(db, "verificationRequests", requestId), {
    status: "APPROVED",
    updatedAt: serverTimestamp()
  });

  // 2. Activate Verified Badge on user & public profile
  const verifyUpdates = {
    isVerified: true,
    verificationStatus: "VERIFIED",
    verificationDocType: docType,
    updatedAt: serverTimestamp()
  };
  await updateDoc(doc(db, "users", profileCode), verifyUpdates);
  await setDoc(doc(db, "profiles", profileCode), verifyUpdates, { merge: true });

  // 3. Send Push + In-App Notification to the user
  const notificationId = `kyc_approved_${profileCode}_${Date.now()}`;
  await setDoc(doc(db, "notifications", notificationId), {
    notificationId,
    type: "ACCOUNT_APPROVED",
    targetUserId: userId,
    targetProfileCode: profileCode,
    title: "Your Ghotok Profile is Verified!",
    titleEn: "Your Ghotok Profile is Verified!",
    titleBn: "অভিনন্দন! আপনার ঘটক প্রোফাইল ভেরিফাইড হয়েছে!",
    body: `Your ${docType} has been verified by Ghotok Admin. Your Verified Badge is now active.`,
    bodyEn: `Your ${docType} has been verified by Ghotok Admin. Your Verified Badge is now active.`,
    bodyBn: `অ্যাডমিন আপনার ${docType} যাচাই সম্পন্ন করেছেন। আপনার বায়োডাটায় ভেরিফাইড ব্যাজ সক্রিয় হয়েছে।`,
    actionRoute: "PROFILE",
    showBanner: true,
    pushNotification: true,
    createdAt: serverTimestamp()
  });
  return notificationId;
}

/**
 * 3. bKash / Nagad Package Approval (With Push + In-App Alert)
 * When approving a payment TrxID in bKash / Nagad Payments
 */
export async function approvePackagePayment({
  requestId,
  userId,
  profileCode,
  packageTier,       // "Silver" | "Gold" | "Diamond"
  interestsToCredit, // e.g. 25, 60, 150
  contactsToCredit   // e.g. 10, 30, 75
}: {
  requestId: string;
  userId: string;
  profileCode: string;
  packageTier: "Silver" | "Gold" | "Diamond";
  interestsToCredit: number;
  contactsToCredit: number;
}) {
  // 1. Mark payment request APPROVED
  await updateDoc(doc(db, "paymentRequests", requestId), {
    status: "APPROVED",
    updatedAt: serverTimestamp()
  });

  // 2. Credit package tier and quotas on user & public profile
  const pkgUpdates = {
    packageTier,
    pendingPackageTier: "",
    interestsRemaining: interestsToCredit,
    contactsRemaining: contactsToCredit,
    updatedAt: serverTimestamp()
  };
  await updateDoc(doc(db, "users", profileCode), pkgUpdates);
  await setDoc(doc(db, "profiles", profileCode), pkgUpdates, { merge: true });

  // 3. Send Push + In-App Notification to the user
  const notificationId = `pkg_approved_${profileCode}_${Date.now()}`;
  await setDoc(doc(db, "notifications", notificationId), {
    notificationId,
    type: "PACKAGE_APPROVED",
    targetUserId: userId,
    targetProfileCode: profileCode,
    packageTier,
    title: `${packageTier} Package Activated!`,
    titleEn: `${packageTier} Package Activated!`,
    titleBn: `আপনার ${packageTier} মেম্বারশিপ প্যাকেজ চালু হয়েছে!`,
    body: `Your payment is verified! ${interestsToCredit} proposals and ${contactsToCredit} contact unlocks have been added to your account.`,
    bodyEn: `Your payment is verified! ${interestsToCredit} proposals and ${contactsToCredit} contact unlocks have been added to your account.`,
    bodyBn: `আপনার পেমেন্ট যাচাই সম্পন্ন হয়েছে! একাউন্টে ${interestsToCredit}টি প্রস্তাব এবং ${contactsToCredit}টি কন্টাক্ট আনলক যুক্ত হয়েছে।`,
    actionRoute: "PACKAGES",
    showBanner: true,
    pushNotification: true,
    createdAt: serverTimestamp()
  });
  return notificationId;
}

/**
 * 4. Ghotok Desk — Match Found Notification (Opens Match / Candidate Biodata)
 * Dispatches targeted push and in-app alert when Ghotok Matchmaker recommends a candidate
 */
export async function sendMatchFoundNotification({
  targetUserId,
  targetProfileCode,
  matchedUserId,
  matchedProfileCode,
  matchedName,
  matchedProfession,
  matchedDistrict,
  matchScore = 85,
  note
}: {
  targetUserId?: string;
  targetProfileCode: string;
  matchedUserId?: string;
  matchedProfileCode: string;
  matchedName: string;
  matchedProfession?: string;
  matchedDistrict?: string;
  matchScore?: number;
  note?: string;
}) {
  const notificationId = `match_${targetProfileCode}_${matchedProfileCode}_${Date.now()}`;
  await setDoc(doc(db, "notifications", notificationId), {
    notificationId,
    type: "MATCH_FOUND",
    targetUserId: targetUserId || targetProfileCode,
    targetProfileCode,
    matchedUserId: matchedUserId || matchedProfileCode,
    matchedProfileCode,
    matchedName,
    matchScore,
    title: `New Match Found: ${matchedProfileCode}`,
    titleEn: `New Compatible Match Recommendation: ${matchedProfileCode}`,
    titleBn: `নতুন পাত্র/পাত্রী সুপারিশ: ${matchedName} (${matchedProfileCode})`,
    body: note || `Ghotok Matchmaker found a ${matchScore}% compatible match: ${matchedName} (${matchedProfession || 'Professional'}, ${matchedDistrict || 'Dhaka'}).`,
    bodyEn: note || `Ghotok Matchmaker found a ${matchScore}% compatible match: ${matchedName} (${matchedProfession || 'Professional'}, ${matchedDistrict || 'Dhaka'}).`,
    bodyBn: note || `ঘটক ম্যাচমেকার আপনার জন্য ${matchScore}% মানানসই প্রস্তাব খুঁজে পেয়েছে: ${matchedName} (${matchedDistrict || 'ঢাকা'})। বিস্তারিত দেখুন।`,
    actionRoute: "MATCHES",
    actionPayload: { candidateCode: matchedProfileCode },
    showBanner: true,
    pushNotification: true,
    createdAt: serverTimestamp()
  });
  return notificationId;
}
