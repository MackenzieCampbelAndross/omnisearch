import React from 'react';
import { Search, X, FolderCog, ShieldCheck, RefreshCw, Command } from 'lucide-react';
import { useOmniStore } from '../core/omni_store';
import { SearchCategory } from '../types';

const CATEGORIES: Array<{ key: SearchCategory; label: string }> = [
  { key: 'ALL', label: 'All Results' },
  { key: 'APP', label: 'Apps' },
  { key: 'DOC', label: 'Documents' },
  { key: 'MEDIA', label: 'Media & OCR' },
  { key: 'CODE', label: 'Source Code' },
  { key: 'BOOKMARK', label: 'Bookmarks' },
];

export const Header: React.FC = () => {
  const {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    isIndexing,
    rebuildIndex,
    toggleDirectoriesModal,
    togglePrivacyModal,
    stats,
  } = useOmniStore();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-6 py-4">
      {/* Top Bar: Brand, Quick Stats & Action Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">OmniSearch</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Universal Semantic Search &bull; {stats.totalIndexedItems} items indexed &bull; {stats.lastRebuiltAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => rebuildIndex()}
            disabled={isIndexing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Refresh search index"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin text-indigo-400' : ''}`} />
            {isIndexing ? 'Indexing...' : 'Refresh Index'}
          </button>

          <button
            onClick={() => toggleDirectoriesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <FolderCog className="w-3.5 h-3.5 text-slate-400" />
            Directories
          </button>

          <button
            onClick={() => togglePrivacyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Privacy
          </button>
        </div>
      </div>

      {/* Main Omnibar Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files, documents, applications, code, OCR screenshots or query semantically..."
          className="w-full pl-12 pr-28 py-3.5 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-400 text-sm font-medium outline-none shadow-inner transition"
          autoFocus
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
            Esc to clear
          </span>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border border-slate-700/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
};
