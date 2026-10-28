import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Ban, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  Smartphone, 
  Globe, 
  Search, 
  Clock, 
  Flag,
  UserX,
  FileWarning,
  MessageSquare
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { ReportedItem, ContactAuditLog } from '../types/admin';

export const SafetyAndAudit: React.FC = () => {
  const { 
    reports, 
    auditLogs, 
    resolveReport, 
    flagAuditLog, 
    setAccountStatus, 
    isBangla 
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'AUDIT_LOGS'>('REPORTS');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [auditFilterSuspicious, setAuditFilterSuspicious] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Resolve Report Modal
  const [resolvingReport, setResolvingReport] = useState<ReportedItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'NO_ACTION' | 'WARNING_SENT' | 'TEMP_SUSPEND' | 'PERMANENT_BAN'>('WARNING_SENT');
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredReports = reports.filter(r => {
    if (reportFilter === 'ALL') return true;
    return r.status === reportFilter;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSuspicious = !auditFilterSuspicious || log.flaggedSuspicious;
    const q = auditSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      log.unlockedByCode.toLowerCase().includes(q) ||
      log.unlockedByName.toLowerCase().includes(q) ||
      log.targetProfileCode.toLowerCase().includes(q) ||
      log.targetProfileName.toLowerCase().includes(q) ||
      log.unlockedUserPhone.includes(q) ||
      log.targetGuardianPhone.includes(q);
    return matchesSuspicious && matchesSearch;
  });

  const handleConfirmResolution = () => {
    if (!resolvingReport) return;
    resolveReport(resolvingReport.id, resolutionAction, resolutionNote);
    setResolvingReport(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {isBangla ? 'নিরাপত্তা, অভিযোগ ও কন্টাক্ট অডিট লগ' : 'Safety, Reports & Dispute Resolution'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Anti-Scam &amp; Anti-Scraping
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'ব্যবহারকারীদের রিপোর্ট পর্যালোচনা, প্রতারণা ও আপত্তিকর চ্যাট প্রতিরোধ এবং ফোন নম্বর আনলক অডিট হিস্ট্রি।'
              : 'Review user reports with evidence, dispute resolution, and audit logs of who unlocked whose guardianPhone to prevent data scraping.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'REPORTS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>{isBangla ? 'অভিযোগ কিউ (Disputes)' : 'Reports & Disputes'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {reports.filter(r => r.status === 'PENDING').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT_LOGS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>{isBangla ? 'অভিভাবক ফোন আনলক অডিট' : 'Contact Unlock Audit'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Reported Profiles & Chats */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">{isBangla ? 'অবস্থা:' : 'Filter Status:'}</span>
              {(['ALL', 'PENDING', 'RESOLVED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setReportFilter(s)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    reportFilter === s ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="text-slate-400">
              {filteredReports.length} {isBangla ? 'টি রিপোর্ট পাওয়া গেছে' : 'reports recorded'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                {isBangla ? 'কোনো নিরাপত্তা অভিযোগ পাওয়া যায়নি।' : 'No reported profiles or dispute tickets found in live database.'}
              </div>
            ) : (
              filteredReports.map(report => (
                <div
                  key={report.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
                >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-start gap-3">
                    <img 
                      src={report.reportedPhoto} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">{isBangla ? 'অভিযুক্ত:' : 'Reported User:'}</span>
                        <h3 className="font-bold text-sm text-slate-100">{report.reportedName}</h3>
                        <span className="px-2 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                          {report.reportedCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {report.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Reported by: <strong className="text-slate-300">{report.reporterName}</strong> ({report.reporterCode}) • {report.reportedAt}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold self-start ${
                    report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    {report.status}
                  </span>
                </div>

                {/* Report Description */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Reporter Statement:
                  </span>
                  <p className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl leading-relaxed">
                    "{report.description}"
                  </p>
                </div>

                {/* Evidence / Chat excerpt */}
                {report.evidenceText && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Chat Evidence Attached:
                    </span>
                    <p className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl font-mono text-amber-200 text-xs">
                      {report.evidenceText}
                    </p>
                  </div>
                )}

                {/* Resolution note if resolved */}
                {report.status === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1 text-emerald-300">
                    <span className="font-bold text-[11px] block flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Resolution Action: {report.actionTaken}
                    </span>
                    <p className="text-slate-300">{report.resolutionNote}</p>
                  </div>
                )}

                {/* Action button if pending */}
                {report.status === 'PENDING' && (
                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setResolvingReport(report);
                        setResolutionNote('');
                        setResolutionAction('WARNING_SENT');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{isBangla ? 'মীমাংসা ও ব্যবস্থা গ্রহণ' : 'Take Administrative Action'}</span>
                    </button>
                  </div>
                )}

              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Guardian Contact Audit Log */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          
          {/* Audit Search & Security Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={isBangla ? "আনলককারী বা টার্গেট নম্বর দিয়ে খুঁজুন..." : "Filter audit log by phone, ID, or name..."}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditFilterSuspicious(!auditFilterSuspicious)}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                  auditFilterSuspicious 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/60' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBangla ? 'সন্দেহজনক আনলকসমূহ' : 'Suspicious Velocity Alerts'}</span>
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{isBangla ? 'সময়' : 'Unlocked At'}</th>
                    <th className="py-3 px-4">{isBangla ? 'আনলককারী গ্রাহক' : 'Unlocked By'}</th>
                    <th className="py-3 px-4">{isBangla ? 'টার্গেট অভিভাবক নম্বর' : 'Target Guardian Contact'}</th>
                    <th className="py-3 px-4">{isBangla ? 'প্যাকেজ টিয়ার' : 'Plan Tier'}</th>
                    <th className="py-3 px-4">{isBangla ? 'ডিভাইস ও আইপি' : 'IP & Device'}</th>
                    <th className="py-3 px-4 text-right">{isBangla ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        {isBangla ? 'কোনো কন্টাক্ট আনলক অডিট রেকর্ড পাওয়া যায়নি।' : 'No contact unlock audit logs found in live database.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${log.flaggedSuspicious ? 'bg-rose-950/20' : ''}`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {log.unlockedAt}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100 block">{log.unlockedByName}</span>
                        <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/10 px-1 rounded mr-1">
                          {log.unlockedByCode}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{log.unlockedUserPhone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200 block">{log.targetProfileName} ({log.targetProfileCode})</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
                          {log.targetGuardianPhone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200">
                          {log.packageTier}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        <span className="block font-mono text-[11px]">{log.ipAddress}</span>
                        <span className="text-[10px] text-slate-500">{log.deviceInfo}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => flagAuditLog(log.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              log.flaggedSuspicious 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                            title="Toggle Suspicious Scraping Flag"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setAccountStatus(log.unlockedByCode, 'SUSPENDED', 'Data scraping / abnormal unlock velocity detected in audit log')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                            title="Instant Account Suspension"
                          >
                            Ban Scraper
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Report Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>{isBangla ? 'রিপোর্ট মীমাংসা ও প্রশাসনিক ব্যবস্থা' : 'Resolve Report & Issue Penalty'}</span>
            </div>

            <p className="text-xs text-slate-400">
              {isBangla
                ? `প্রার্থী ${resolvingReport.reportedName} (${resolvingReport.reportedCode})-এর বিরুদ্ধে গৃহিত পদক্ষেপ নির্বাচন করুন:`
                : `Select penalty or action against ${resolvingReport.reportedName} (${resolvingReport.reportedCode}):`}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Action Choice:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'WARNING_SENT', label: 'Send Official Warning' },
                  { id: 'TEMP_SUSPEND', label: 'Suspend for 7 Days' },
                  { id: 'PERMANENT_BAN', label: 'Permanent Account Ban' },
                  { id: 'NO_ACTION', label: 'Dismiss (False Report)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResolutionAction(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      resolutionAction === opt.id 
                        ? 'bg-purple-600 text-white border-purple-500 shadow' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Resolution Reason / Internal Record:
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Details of investigation and reason for decision..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setResolvingReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
              >
                Execute Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
