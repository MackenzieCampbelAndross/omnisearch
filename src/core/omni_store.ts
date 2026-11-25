import { create } from 'zustand';
import {
  SearchResult,
  SearchCategory,
  IndexedDirectory,
  PrivacySettings,
  SearchHistoryItem,
  IndexerStats,
} from '../types';
import { SearchEngine } from './search_engine';
import { FileIndexer } from './file_indexer';
import { ImageIndexer } from './image_indexer';

interface OmniState {
  query: string;
  activeCategory: SearchCategory;
  results: SearchResult[];
  selectedIndex: number;
  allItems: SearchResult[];
  recentSearches: SearchHistoryItem[];
  directories: IndexedDirectory[];
  privacy: PrivacySettings;
  isIndexing: boolean;
  stats: IndexerStats;
  isPrivacyModalOpen: boolean;
  isDirectoriesModalOpen: boolean;

  // Actions
  setQuery: (query: string) => void;
  setActiveCategory: (category: SearchCategory) => void;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrev: () => void;
  executeSelected: () => void;
  rebuildIndex: () => void;
  addDirectory: (path: string) => void;
  removeDirectory: (id: string) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  togglePrivacyModal: (open?: boolean) => void;
  toggleDirectoriesModal: (open?: boolean) => void;
  clearHistory: () => void;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  blacklistedPaths: ['C:/Users/User/AppData/Local/Temp', 'C:/Windows/System32'],
  indexContents: true,
  enableOcr: true,
  enableTelemetry: false,
  maxFileSizeMb: 50,
};

const DEFAULT_DIRECTORIES: IndexedDirectory[] = [
  {
    id: 'dir_1',
    path: 'C:/ProgramData/Microsoft/Windows/Start Menu',
    recursive: true,
    fileCount: 42,
    lastIndexed: new Date().toISOString(),
    status: 'IDLE',
  },
  {
    id: 'dir_2',
    path: 'C:/Users/User/Documents',
    recursive: true,
    fileCount: 156,
    lastIndexed: new Date().toISOString(),
    status: 'IDLE',
  },
  {
    id: 'dir_3',
    path: 'C:/Users/User/Pictures/Screenshots',
    recursive: false,
    fileCount: 28,
    lastIndexed: new Date().toISOString(),
    status: 'IDLE',
  },
  {
    id: 'dir_4',
    path: 'C:/Users/User/Workspace',
    recursive: true,
    fileCount: 384,
    lastIndexed: new Date().toISOString(),
    status: 'IDLE',
  },
];

function buildInitialItems(privacy: PrivacySettings): SearchResult[] {
  const seedFiles = FileIndexer.getSeedFiles();
  const items: SearchResult[] = [];

  for (const f of seedFiles) {
    if (f.name.toLowerCase().endsWith('.png') || f.name.toLowerCase().endsWith('.jpg')) {
      items.push(ImageIndexer.indexImage({ ...f, rawOcrText: f.rawContent }, privacy));
    } else {
      const indexed = FileIndexer.indexFile(f, privacy);
      if (indexed) items.push(indexed);
    }
  }

  return items;
}

const initialItems = buildInitialItems(DEFAULT_PRIVACY);

export const useOmniStore = create<OmniState>((set, get) => ({
  query: '',
  activeCategory: 'ALL',
  results: initialItems,
  selectedIndex: 0,
  allItems: initialItems,
  recentSearches: [
    { id: 'h_1', query: 'Architecture', timestamp: '10 mins ago', resultCount: 4 },
    { id: 'h_2', query: 'Financial', timestamp: '1 hour ago', resultCount: 2 },
  ],
  directories: DEFAULT_DIRECTORIES,
  privacy: DEFAULT_PRIVACY,
  isIndexing: false,
  stats: {
    totalIndexedItems: initialItems.length,
    totalApps: initialItems.filter((i) => i.category === 'APP').length,
    totalDocs: initialItems.filter((i) => i.category === 'DOC').length,
    totalMedia: initialItems.filter((i) => i.category === 'MEDIA').length,
    totalCodeFiles: initialItems.filter((i) => i.category === 'CODE').length,
    totalBookmarks: initialItems.filter((i) => i.category === 'BOOKMARK').length,
    indexSizeBytes: 1245000,
    lastRebuiltAt: new Date().toLocaleTimeString(),
  },
  isPrivacyModalOpen: false,
  isDirectoriesModalOpen: false,

  setQuery: (query: string) => {
    const { allItems, activeCategory } = get();
    const results = SearchEngine.search(query, allItems, activeCategory);
    set({
      query,
      results,
      selectedIndex: 0,
    });
  },

  setActiveCategory: (activeCategory: SearchCategory) => {
    const { allItems, query } = get();
    const results = SearchEngine.search(query, allItems, activeCategory);
    set({
      activeCategory,
      results,
      selectedIndex: 0,
    });
  },

  setSelectedIndex: (selectedIndex: number) => {
    set({ selectedIndex });
  },

  selectNext: () => {
    const { results, selectedIndex } = get();
    if (results.length === 0) return;
    set({ selectedIndex: (selectedIndex + 1) % results.length });
  },

  selectPrev: () => {
    const { results, selectedIndex } = get();
    if (results.length === 0) return;
    set({ selectedIndex: (selectedIndex - 1 + results.length) % results.length });
  },

  executeSelected: () => {
    const { results, selectedIndex, query, recentSearches } = get();
    const item = results[selectedIndex];
    if (!item) return;

    if (query.trim()) {
      const filtered = recentSearches.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
      set({
        recentSearches: [
          {
            id: `h_${Date.now()}`,
            query,
            timestamp: 'Just now',
            resultCount: results.length,
          },
          ...filtered.slice(0, 6),
        ],
      });
    }
  },

  rebuildIndex: () => {
    set({ isIndexing: true });
    const { privacy } = get();
    setTimeout(() => {
      const items = buildInitialItems(privacy);
      const { query, activeCategory } = get();
      const results = SearchEngine.search(query, items, activeCategory);

      set({
        allItems: items,
        results,
        isIndexing: false,
        stats: {
          totalIndexedItems: items.length,
          totalApps: items.filter((i) => i.category === 'APP').length,
          totalDocs: items.filter((i) => i.category === 'DOC').length,
          totalMedia: items.filter((i) => i.category === 'MEDIA').length,
          totalCodeFiles: items.filter((i) => i.category === 'CODE').length,
          totalBookmarks: items.filter((i) => i.category === 'BOOKMARK').length,
          indexSizeBytes: 1245000 + Math.floor(Math.random() * 50000),
          lastRebuiltAt: new Date().toLocaleTimeString(),
        },
      });
    }, 400);
  },

  addDirectory: (path: string) => {
    const { directories } = get();
    const newDir: IndexedDirectory = {
      id: `dir_${Date.now()}`,
      path,
      recursive: true,
      fileCount: 0,
      lastIndexed: new Date().toISOString(),
      status: 'IDLE',
    };
    set({ directories: [...directories, newDir] });
  },

  removeDirectory: (id: string) => {
    const { directories } = get();
    set({ directories: directories.filter((d) => d.id !== id) });
  },

  updatePrivacy: (newSettings: Partial<PrivacySettings>) => {
    const current = get().privacy;
    const updated = { ...current, ...newSettings };
    set({ privacy: updated });
    get().rebuildIndex();
  },

  togglePrivacyModal: (open?: boolean) => {
    set((state) => ({
      isPrivacyModalOpen: open !== undefined ? open : !state.isPrivacyModalOpen,
    }));
  },

  toggleDirectoriesModal: (open?: boolean) => {
    set((state) => ({
      isDirectoriesModalOpen: open !== undefined ? open : !state.isDirectoriesModalOpen,
    }));
  },

  clearHistory: () => {
    set({ recentSearches: [] });
  },
}));
