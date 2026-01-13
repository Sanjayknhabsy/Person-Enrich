
import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { BulkUploadProps } from '../types';

const BulkUpload: React.FC<BulkUploadProps> = ({ onUpload, isProcessing }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const companies = content
          .split(/[\n,]+/)
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        onUpload(companies);
      };
      reader.readAsText(file);
    }
  };

  const handleTextSubmit = () => {
    const companies = text
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (companies.length > 0) {
      onUpload(companies);
      setText('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <FileSpreadsheet className="w-32 h-32" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {/* Manual Input */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Manual List Input
            </label>
          </div>
          <textarea
            className="flex-1 w-full min-h-[160px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none outline-none font-medium text-slate-700"
            placeholder="Paste multiple companies here. One per line or comma separated..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
          />
          <button
            onClick={handleTextSubmit}
            disabled={isProcessing || !text.trim()}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Generate Leads
          </button>
        </div>

        {/* File Upload */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Bulk Upload CSV
            </label>
          </div>
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all p-6 bg-slate-50 cursor-pointer ${
              isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  const companies = content.split(/[\n,]+/).map(c => c.trim()).filter(c => c.length > 0);
                  onUpload(companies);
                };
                reader.readAsText(file);
              }
            }}
            onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
          >
            <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${isDragging ? 'bg-indigo-100 scale-110' : 'bg-slate-100'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm text-slate-600 text-center font-medium">
              Drag & Drop your <strong>.csv</strong> or <strong>.txt</strong> file<br />
              <span className="text-slate-400 font-normal mt-1 block">Max size: 5MB</span>
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
          </div>
          <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">
              Supported: CSV, TXT (UTF-8). Our AI will prioritize Indian HQ companies.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
