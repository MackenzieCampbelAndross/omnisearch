import React, { useState } from 'react';
import { X, FolderPlus, Trash2, Folder, CheckCircle } from 'lucide-react';
import { useOmniStore } from '../core/omni_store';

export const DirectoriesModal: React.FC = () => {
  const {
    isDirectoriesModalOpen,
    toggleDirectoriesModal,
    directories,
    addDirectory,
    removeDirectory,
    rebuildIndex,
  } = useOmniStore();

  const [newPath, setNewPath] = useState('');

  if (!isDirectoriesModalOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPath.trim()) {
      addDirectory(newPath.trim());
      setNewPath('');
      rebuildIndex();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Indexed Search Locations</h2>
          </div>
          <button
            onClick={() => toggleDirectoriesModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Directory Form */}
        <form onSubmit={handleAdd} className="p-6 border-b border-slate-800 bg-slate-850">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Add Directory to Index
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="e.g. D:/Mac/Documents or C:/Users/Public"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition shadow-sm"
            >
              <FolderPlus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        {/* Directory List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {directories.map((dir) => (
            <div
              key={dir.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate font-mono">
                    {dir.path}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {dir.fileCount} files &bull; {dir.recursive ? 'Recursive' : 'Top-level only'} &bull; Indexed{' '}
                  {new Date(dir.lastIndexed).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={() => {
                  removeDirectory(dir.id);
                  rebuildIndex();
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Remove from index"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={() => toggleDirectoriesModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
