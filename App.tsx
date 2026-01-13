
import React, { useState, useCallback, useRef } from 'react';
import { Search, ShieldCheck, Zap, Info, ArrowRight, Table as TableIcon, RefreshCw, Timer, ZapOff } from 'lucide-react';
import { LeadResult } from './types';
import BulkUpload from './components/BulkUpload';
import LeadTable from './components/LeadTable';
import { fetchLeadData } from './services/geminiService';

const LOGO_URL = "https://framerusercontent.com/images/jjOldF3SAkGHttvv2zCCUKBxlYI.svg?width=224&height=79";

const App: React.FC = () => {
  const [leads, setLeads] = useState<LeadResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const debounceTimerRef = useRef<number | null>(null);

  const processLead = async (company: string, isRerun: boolean = false) => {
    const startTime = performance.now();
    
    // Update individual lead status to processing
    setLeads(prev => prev.map(l => 
      l.companyName === company ? { ...l, status: 'processing', error: undefined } : l
    ));

    try {
      const data = await fetchLeadData(company, isRerun);
      const endTime = performance.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(1);

      // Auto-Retry logic: If no phone found and not already a rerun, try one more time immediately
      const needsAutoRetry = !data.phoneNumber && !isRerun;

      if (needsAutoRetry) {
        setLeads(prev => prev.map(l => 
          l.companyName === company ? { ...l, status: 'verifying', timeTaken: `${durationSeconds}s` } : l
        ));
        // Recurse once for the auto-retry
        return processLead(company, true);
      }

      setLeads(prev => prev.map(l => 
        l.companyName === company 
          ? { ...l, ...data, status: 'completed', timeTaken: `${durationSeconds}s` } 
          : l
      ));
    } catch (error) {
      setLeads(prev => prev.map(l => 
        l.companyName === company ? { ...l, status: 'failed', error: 'Research failed' } : l
      ));
    } finally {
      setProgress(p => ({ ...p, current: p.current + 1 }));
    }
  };

  const processQueue = useCallback(async (companyNames: string[]) => {
    setIsProcessing(true);
    
    const existingNames = new Set(leads.map(l => l.companyName.toLowerCase()));
    const uniqueNewNames = companyNames.filter(name => !existingNames.has(name.toLowerCase()));
    
    if (uniqueNewNames.length === 0) {
      setIsProcessing(false);
      return;
    }

    const newLeads: LeadResult[] = uniqueNewNames.map(name => ({
      companyName: name,
      personName: '',
      designation: '',
      phoneNumber: '',
      altPhoneNumber: '',
      sourceLink: '',
      linkedinProfile: '',
      status: 'pending',
      retryCount: 0
    }));
    
    setLeads(prev => [...prev, ...newLeads]);
    setProgress({ current: 0, total: uniqueNewNames.length });

    // START ALL EXTRACTIONS SIMULTANEOUSLY (NO CHUNKING)
    // Map each name to a promise and run them all in parallel for maximum speed.
    const promises = uniqueNewNames.map(company => processLead(company));
    await Promise.all(promises);

    setIsProcessing(false);
  }, [leads]);

  const handleUpload = (companyList: string[]) => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    
    // Debounce processing by 500ms to allow users to finish pasting or multiple uploads
    debounceTimerRef.current = window.setTimeout(() => {
      const uniqueBatch = Array.from(new Set(companyList));
      processQueue(uniqueBatch);
    }, 500);
  };

  const handleRerun = (companyName: string) => {
    processLead(companyName, true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fdfdff] pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="bg-[#050b18] text-white pt-8 pb-32 px-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_70%)]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-1 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                <img src={LOGO_URL} alt="Logo" className="h-10 md:h-12 object-contain" />
              </div>
              <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-300 hidden md:block">B2B Intelligence</h1>
            </div>
            <div className="flex gap-6 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                Full-Throttle Parallel
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                Auto-Retry Active
              </span>
            </div>
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1] tracking-tight text-white">
              Instant Extraction <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300">
                All-at-Once Delivery.
              </span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              Why wait? Our engine now starts processing every company on your list simultaneously. Real-time tracking of search performance and deep grounding.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <BulkUpload onUpload={handleUpload} isProcessing={isProcessing} />

        {isProcessing && (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <span className="block font-black text-slate-900 text-lg">Mass Parallel Execution</span>
                <span className="text-sm text-slate-500 font-medium">Extracting all companies simultaneously...</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8 w-full md:w-auto flex-1 md:max-w-lg">
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200/50">
                <div 
                  className="bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-slate-900 tabular-nums">
                  {progress.current} <span className="text-slate-300 font-light text-base">/</span> {progress.total}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Processing</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {leads.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <LeadTable leads={leads} onRerun={handleRerun} />
            </div>
          ) : !isProcessing && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-sm">
              <div className="p-8 bg-white rounded-full mb-8 shadow-xl shadow-indigo-50 border border-indigo-50">
                <TableIcon className="w-16 h-16 text-indigo-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Engine Ready</h3>
              <p className="text-slate-500 mb-10 text-center max-w-sm px-6 font-medium">
                Paste your list to trigger high-speed parallel lead generation.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-24 py-16 border-t border-slate-100 bg-white/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-4">
            <img src={LOGO_URL} alt="Logo" className="h-8 opacity-40 grayscale" />
            <p className="text-slate-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} LeadGen Pro Ultra-Fast Edition.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
