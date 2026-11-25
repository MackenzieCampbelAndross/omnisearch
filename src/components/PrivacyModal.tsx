import React, { useState } from 'react';
import { X, Shield, Plus, Trash2, Lock, EyeOff } from 'lucide-react';
import { useOmniStore } from '../core/omni_store';

export const PrivacyModal: React.FC = () => {
  const {
    isPrivacyModalOpen,
    togglePrivacyModal,
    privacy,
    updatePrivacy,
  } = useOmniStore();

  const [blacklistedInput, setBlacklistedInput] = useState('');

  if (!isPrivacyModalOpen) return null;

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (blacklistedInput.trim()) {
      updatePrivacy({
        blacklistedPaths: [...privacy.blacklistedPaths, blacklistedInput.trim()],
      });
      setBlacklistedInput('');
    }
  };

  const handleRemoveBlacklist = (target: string) => {
    updatePrivacy({
      blacklistedPaths: privacy.blacklistedPaths.filter((p) => p !== target),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Local Privacy Controls</h2>
          </div>
          <button
            onClick={() => togglePrivacyModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Privacy Toggles */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Indexing Policies
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Index Document Contents</p>
                <p className="text-[11px] text-slate-400">
                  Extract and search plain text within PDF, DOCX, and TXT files.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.indexContents}
                onChange={(e) => updatePrivacy({ indexContents: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Enable OCR on Screenshots</p>
                <p className="text-[11px] text-slate-400">
                  Extract visible text from screenshots and photos using local OCR.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableOcr}
                onChange={(e) => updatePrivacy({ enableOcr: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Anonymous Diagnostics</p>
                <p className="text-[11px] text-slate-400">
                  Transmit anonymous crash telemetry. Defaults to disabled.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableTelemetry}
                onChange={(e) => updatePrivacy({ enableTelemetry: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          {/* Blacklisted Folders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                Blacklisted Directories (Never Indexed)
              </h3>
            </div>

            <form onSubmit={handleAddBlacklist} className="flex gap-2">
              <input
                type="text"
                value={blacklistedInput}
                onChange={(e) => setBlacklistedInput(e.target.value)}
                placeholder="e.g. C:/Users/User/Private or D:/SecureVault"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" />
                Exclude
              </button>
            </form>

            <div className="space-y-2">
              {privacy.blacklistedPaths.map((bp) => (
                <div
                  key={bp}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300"
                >
                  <span className="truncate pr-2">{bp}</span>
                  <button
                    onClick={() => handleRemoveBlacklist(bp)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>All embeddings and indexes remain 100% on this machine.</span>
          </div>
          <button
            onClick={() => togglePrivacyModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
