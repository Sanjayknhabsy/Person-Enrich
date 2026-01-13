
import React from 'react';
import { ExternalLink, Linkedin, Phone, Building2, CheckCircle2, Loader2, AlertCircle, Download, User2, Globe, RefreshCw, Timer } from 'lucide-react';
import { LeadTableProps, LeadResult } from '../types';

const LeadTable: React.FC<LeadTableProps> = ({ leads, onRerun }) => {
  const exportToCSV = () => {
    const headers = ['Company Name', 'Person Name', 'Designation', 'Phone Number', 'Alt Phone Number', 'Source Link', 'LinkedIn Profile', 'Time Taken'];
    const rows = leads.map(l => [
      l.companyName,
      l.personName,
      l.designation,
      l.phoneNumber,
      l.altPhoneNumber,
      l.sourceLink,
      l.linkedinProfile,
      l.timeTaken || '0s'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_parallel_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (leads.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            Dashboard
            <span className="bg-blue-50 text-blue-600 text-xs font-black py-1 px-4 rounded-full border border-blue-100">
              {leads.length} Records
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">Real-time B2B insights with verified mobile numbers.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export Dataset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-100">
              <th className="px-8 py-5 w-24 text-center">Status</th>
              <th className="px-8 py-5">Company & Time</th>
              <th className="px-8 py-5">Decision Maker</th>
              <th className="px-8 py-5">Verified Contacts</th>
              <th className="px-8 py-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...leads].reverse().map((lead, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    {(lead.status === 'processing' || lead.status === 'verifying') && (
                      <div className="relative">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    )}
                    {lead.status === 'completed' && (
                      <div className={`w-10 h-10 ${lead.phoneNumber ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-xl flex items-center justify-center border border-current opacity-20`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    {lead.status === 'failed' && (
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      </div>
                    )}
                    {lead.status === 'pending' && <div className="w-2 h-2 bg-slate-200 rounded-full" />}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors border border-slate-100">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-black text-slate-900 tracking-tight">{lead.companyName}</span>
                    </div>
                    {lead.timeTaken && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 ml-11">
                        <Timer className="w-3 h-3" />
                        Took {lead.timeTaken}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-black text-slate-800 tracking-tight">{lead.personName || '--'}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{lead.designation || 'Position N/A'}</span>
                    {lead.linkedinProfile && (
                      <a href={lead.linkedinProfile} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                        <Linkedin className="w-3 h-3" /> Profile
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    {lead.phoneNumber ? (
                      <div className="flex items-center gap-2 text-sm font-black text-slate-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {lead.phoneNumber}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold px-3 py-1.5 bg-slate-50 rounded-xl italic">No Mobile Found</span>
                    )}
                    {lead.altPhoneNumber && (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.altPhoneNumber} (Alt)
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onRerun(lead.companyName)}
                      disabled={lead.status === 'processing' || lead.status === 'verifying'}
                      className="p-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 hover:border-blue-100 disabled:opacity-50"
                      title="Refresh / Rerun Search"
                    >
                      <RefreshCw className={`w-4 h-4 ${(lead.status === 'processing' || lead.status === 'verifying') ? 'animate-spin' : ''}`} />
                    </button>
                    {lead.sourceLink && (
                      <a
                        href={lead.sourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100 hover:border-indigo-100"
                        title="View Source"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
