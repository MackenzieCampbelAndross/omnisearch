import { SearchResult, PrivacySettings, IndexedDirectory } from '../types';

export class FileIndexer {
  /**
   * Determine whether a given path is excluded by privacy settings or default ignore rules
   */
  static isPathIgnored(path: string, privacy: PrivacySettings): boolean {
    const normalized = path.replace(/\\/g, '/').toLowerCase();

    // Default system ignores
    const defaultIgnores = [
      'node_modules',
      '.git',
      '.vscode',
      'target/debug',
      'target/release',
      'dist',
      'build',
      'appdata/local/temp',
      '$recycle.bin',
    ];

    if (defaultIgnores.some((ignore) => normalized.includes(ignore))) {
      return true;
    }

    // User-configured blacklisted paths
    return privacy.blacklistedPaths.some((blacklisted) => {
      const bNorm = blacklisted.replace(/\\/g, '/').toLowerCase();
      return normalized.startsWith(bNorm);
    });
  }

  /**
   * Infer file category from extension
   */
  static categorizeFile(filename: string): 'APP' | 'DOC' | 'MEDIA' | 'CODE' | 'BOOKMARK' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['exe', 'lnk', 'app', 'bat', 'cmd'].includes(ext)) return 'APP';
    if (['pdf', 'docx', 'doc', 'txt', 'rtf', 'md', 'csv', 'xlsx'].includes(ext)) return 'DOC';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'tiff'].includes(ext)) return 'MEDIA';
    if (['ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'go', 'json', 'html', 'css', 'cpp', 'c', 'sql'].includes(ext)) return 'CODE';

    return 'DOC';
  }

  /**
   * Extract text snippet from document or code content safely
   */
  static extractSnippet(content: string, maxLength = 160): string {
    const clean = content.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.slice(0, maxLength) + '...';
  }

  /**
   * Parse simulated file system entry into SearchResult
   */
  static indexFile(
    file: {
      name: string;
      path: string;
      size: number;
      modifiedAt: string;
      rawContent?: string;
    },
    privacy: PrivacySettings
  ): SearchResult | null {
    if (this.isPathIgnored(file.path, privacy)) {
      return null;
    }

    const category = this.categorizeFile(file.name);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    // File size guard
    const maxBytes = privacy.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return null;
    }

    const snippet = privacy.indexContents && file.rawContent
      ? this.extractSnippet(file.rawContent)
      : undefined;

    return {
      id: `file_${file.path.replace(/[^\w]/g, '_')}`,
      title: file.name,
      subtitle: file.path,
      path: file.path,
      category,
      score: 1.0,
      icon: category === 'APP' ? 'Cpu' : category === 'CODE' ? 'Code' : category === 'MEDIA' ? 'Image' : 'FileText',
      size: file.size,
      modifiedAt: file.modifiedAt,
      snippet,
      tags: [ext.toLowerCase(), category.toLowerCase()],
      metadata: {
        extension: ext,
        sizeBytes: file.size,
        modified: file.modifiedAt,
      },
    };
  }

  /**
   * Mock default seed files for desktop environment
   */
  static getSeedFiles(): Array<{
    name: string;
    path: string;
    size: number;
    modifiedAt: string;
    rawContent?: string;
  }> {
    return [
      {
        name: 'Visual Studio Code.lnk',
        path: 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/Visual Studio Code.lnk',
        size: 2048,
        modifiedAt: '2026-11-20T10:00:00Z',
      },
      {
        name: 'Google Chrome.lnk',
        path: 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/Google Chrome.lnk',
        size: 2150,
        modifiedAt: '2026-11-22T08:30:00Z',
      },
      {
        name: 'Terminal.lnk',
        path: 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/Windows Terminal.lnk',
        size: 1980,
        modifiedAt: '2026-11-21T12:00:00Z',
      },
      {
        name: 'Architecture_Design_2026.pdf',
        path: 'C:/Users/User/Documents/Projects/Architecture_Design_2026.pdf',
        size: 3450000,
        modifiedAt: '2026-11-24T14:15:00Z',
        rawContent: 'Microservice distributed architecture guidelines, event bus patterns, latency bounds and database scaling strategies.',
      },
      {
        name: 'Quarterly_Financial_Report.xlsx',
        path: 'C:/Users/User/Documents/Finance/Quarterly_Financial_Report.xlsx',
        size: 512000,
        modifiedAt: '2026-11-23T09:45:00Z',
        rawContent: 'Revenue projections, operating expenses, burn rate, recurring ARR growth by month and EBITDA performance.',
      },
      {
        name: 'main_kernel.rs',
        path: 'C:/Users/User/Workspace/rust-engine/src/main_kernel.rs',
        size: 14200,
        modifiedAt: '2026-11-25T08:10:00Z',
        rawContent: 'pub fn initialize_kernel() -> Result<(), KernelError> { unsafe { setup_page_tables(); } info!("Kernel ready"); Ok(()) }',
      },
      {
        name: 'search_service.ts',
        path: 'C:/Users/User/Workspace/omnisearch/src/core/search_service.ts',
        size: 9800,
        modifiedAt: '2026-11-25T09:00:00Z',
        rawContent: 'export class SearchService { async query(text: string) { return this.vectorIndex.search(text); } }',
      },
      {
        name: 'Screenshot_Dashboard_2026.png',
        path: 'C:/Users/User/Pictures/Screenshots/Screenshot_Dashboard_2026.png',
        size: 1820000,
        modifiedAt: '2026-11-24T16:20:00Z',
        rawContent: 'OCR Text: System Monitor CPU 24% Memory 6.2GB Active Services 8 Running Healthy Port 5173 8080',
      },
      {
        name: 'GitHub_PullRequests.url',
        path: 'C:/Users/User/Favorites/GitHub_PullRequests.url',
        size: 180,
        modifiedAt: '2026-11-15T11:00:00Z',
        rawContent: 'https://github.com/pulls - Review requested and assigned open pull requests across all repositories.',
      },
    ];
  }
}
