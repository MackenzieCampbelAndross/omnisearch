export type SearchCategory = 'ALL' | 'APP' | 'DOC' | 'MEDIA' | 'CODE' | 'BOOKMARK';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  category: SearchCategory;
  score: number;
  icon: string;
  size?: number;
  modifiedAt?: string;
  snippet?: string;
  tags?: string[];
  semanticScore?: number;
  embedding?: number[];
  metadata?: Record<string, string | number>;
}

export interface SearchFilter {
  category: SearchCategory;
  extension?: string;
  minScore?: number;
  dateRange?: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

export interface IndexedDirectory {
  id: string;
  path: string;
  recursive: boolean;
  fileCount: number;
  lastIndexed: string;
  status: 'IDLE' | 'INDEXING' | 'ERROR';
}

export interface PrivacySettings {
  blacklistedPaths: string[];
  indexContents: boolean;
  enableOcr: boolean;
  enableTelemetry: boolean;
  maxFileSizeMb: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface IndexerStats {
  totalIndexedItems: number;
  totalApps: number;
  totalDocs: number;
  totalMedia: number;
  totalCodeFiles: number;
  totalBookmarks: number;
  indexSizeBytes: number;
  lastRebuiltAt: string;
}
