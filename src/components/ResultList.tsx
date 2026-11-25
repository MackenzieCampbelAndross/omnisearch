import React from 'react';
import {
  Cpu,
  FileText,
  Image as ImageIcon,
  Code2,
  Bookmark,
  Sparkles,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { useOmniStore } from '../core/omni_store';
import { SearchResult, SearchCategory } from '../types';

const getCategoryIcon = (category: SearchCategory) => {
  switch (category) {
    case 'APP':
      return <Cpu className="w-4 h-4 text-sky-400" />;
    case 'DOC':
      return <FileText className="w-4 h-4 text-amber-400" />;
    case 'MEDIA':
      return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    case 'CODE':
      return <Code2 className="w-4 h-4 text-purple-400" />;
    case 'BOOKMARK':
      return <Bookmark className="w-4 h-4 text-pink-400" />;
    default:
      return <FileCode className="w-4 h-4 text-slate-400" />;
  }
};

export const ResultList: React.FC = () => {
  const { results, selectedIndex, setSelectedIndex, executeSelected } = useOmniStore();

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
        <FileCode className="w-12 h-12 mb-3 stroke-1 text-slate-600" />
        <p className="text-sm font-medium text-slate-400">No matching items found</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Try adjusting your query, switching categories, or checking your indexed directories.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[calc(100vh-220px)]">
      {results.map((item: SearchResult, idx: number) => {
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={item.id}
            onClick={() => {
              setSelectedIndex(idx);
              executeSelected();
            }}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`flex items-start justify-between px-6 py-3.5 cursor-pointer transition select-none ${
              isSelected
                ? 'bg-indigo-600/15 border-l-4 border-indigo-500 pl-5'
                : 'hover:bg-slate-800/40 border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 pr-4">
              <div
                className={`mt-0.5 p-2 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-indigo-500/20' : 'bg-slate-800'
                }`}
              >
                {getCategoryIcon(item.category)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isSelected ? 'text-indigo-200' : 'text-slate-100'
                    }`}
                  >
                    {item.title}
                  </span>

                  {item.semanticScore && item.semanticScore > 0.65 ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      Semantic
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>

                {item.snippet && (
                  <p className="text-xs text-slate-400/90 line-clamp-1 mt-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/40 font-mono">
                    {item.snippet}
                  </p>
                )}

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.size && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(item.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1 text-slate-500">
              <span className="text-[11px] font-mono text-slate-400">
                {Math.round(item.score * 100)}%
              </span>
              {isSelected && <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
