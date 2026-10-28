import { 
  UserBiodata, 
  VerificationRequestItem, 
  PaymentRequestItem, 
  GuardianCallLog, 
  ContactAuditLog, 
  ReportedItem, 
  BroadcastAnnouncement 
} from '../types/admin';

// Pure live data mode: All initial dummy/mock records cleared.
export const INITIAL_USERS: UserBiodata[] = [];
export const INITIAL_VERIFICATION_REQUESTS: VerificationRequestItem[] = [];
export const INITIAL_PAYMENT_REQUESTS: PaymentRequestItem[] = [];
export const INITIAL_CALL_LOGS: GuardianCallLog[] = [];
export const INITIAL_AUDIT_LOGS: ContactAuditLog[] = [];
export const INITIAL_REPORTS: ReportedItem[] = [];
export const INITIAL_BROADCASTS: BroadcastAnnouncement[] = [];
