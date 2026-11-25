import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  FolderOpen,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Tag,
  Shield,
  Layers,
} from 'lucide-react';
import { useOmniStore } from '../core/omni_store';

export const PreviewPane: React.FC = () => {
  const { results, selectedIndex } = useOmniStore();
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const item = results[selectedIndex];

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 border-l border-slate-800 bg-slate-900/40">
        <Layers className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
        <p className="text-xs text-slate-400">Select an item to inspect details</p>
      </div>
    );
  }

  const handleCopyPath = () => {
    navigator.clipboard?.writeText(item.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerAction = (label: string) => {
    setActionNotice(label);
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <aside className="h-full border-l border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Item Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white truncate" title={item.title}>
              {item.title}
            </h2>
            <p className="text-xs text-indigo-400 font-mono mt-0.5">{item.category}</p>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => triggerAction(`Launched ${item.title}`)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </button>
          <button
            onClick={() => triggerAction(`Revealed in Explorer: ${item.path}`)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Reveal
          </button>
          <button
            onClick={handleCopyPath}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* File Metadata Details */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Metadata Details
          </h3>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Size
              </span>
              <span className="text-slate-200 font-mono">
                {item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Modified
              </span>
              <span className="text-slate-200 font-mono text-[11px]">
                {item.modifiedAt ? new Date(item.modifiedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Match Score
              </span>
              <span className="text-indigo-400 font-mono font-medium">
                {(item.score * 100).toFixed(0)}%
              </span>
            </div>

            {item.metadata &&
              Object.entries(item.metadata).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1">
                  <span className="text-slate-400 capitalize">{k}</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate max-w-[150px]">
                    {String(v)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Path Display */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Full File Path
          </label>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 font-mono text-[11px] break-all select-all">
            {item.path}
          </div>
        </div>

        {/* Snippet / Content Preview */}
        {item.snippet && (
          <div className="mt-5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Extracted Content / OCR Preview
            </label>
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {item.snippet}
            </div>
          </div>
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-slate-500 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local index &bull; Zero cloud transmission</span>
        </div>
      </div>
    </aside>
  );
};
