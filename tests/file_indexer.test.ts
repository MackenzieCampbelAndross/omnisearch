import { describe, it, expect } from 'vitest';
import { FileIndexer } from '../src/core/file_indexer';
import { PrivacySettings } from '../src/types';

describe('FileIndexer', () => {
  const privacy: PrivacySettings = {
    blacklistedPaths: ['C:/Users/User/PrivateVault'],
    indexContents: true,
    enableOcr: true,
    enableTelemetry: false,
    maxFileSizeMb: 10,
  };

  it('correctly detects ignored and blacklisted system paths', () => {
    expect(FileIndexer.isPathIgnored('D:/project/node_modules/pkg/index.js', privacy)).toBe(true);
    expect(FileIndexer.isPathIgnored('D:/project/.git/HEAD', privacy)).toBe(true);
    expect(FileIndexer.isPathIgnored('C:/Users/User/PrivateVault/secrets.txt', privacy)).toBe(true);
    expect(FileIndexer.isPathIgnored('C:/Users/User/Documents/PublicReport.pdf', privacy)).toBe(false);
  });

  it('categorizes files by extensions appropriately', () => {
    expect(FileIndexer.categorizeFile('app.exe')).toBe('APP');
    expect(FileIndexer.categorizeFile('notes.pdf')).toBe('DOC');
    expect(FileIndexer.categorizeFile('photo.png')).toBe('MEDIA');
    expect(FileIndexer.categorizeFile('engine.rs')).toBe('CODE');
    expect(FileIndexer.categorizeFile('script.ts')).toBe('CODE');
  });

  it('extracts and truncates content snippets safely', () => {
    const longText = 'A'.repeat(300);
    const snippet = FileIndexer.extractSnippet(longText, 50);
    expect(snippet.length).toBe(53); // 50 + '...'
    expect(snippet.endsWith('...')).toBe(true);
  });

  it('indexes file metadata and rejects oversized files', () => {
    const regularFile = {
      name: 'Guide.pdf',
      path: 'C:/Docs/Guide.pdf',
      size: 1024 * 500, // 500 KB
      modifiedAt: '2026-11-20T10:00:00Z',
      rawContent: 'Sample user guide documentation text',
    };

    const indexed = FileIndexer.indexFile(regularFile, privacy);
    expect(indexed).not.toBeNull();
    expect(indexed?.title).toBe('Guide.pdf');
    expect(indexed?.category).toBe('DOC');
    expect(indexed?.snippet).toContain('Sample user guide');

    const oversizedFile = {
      name: 'Gigantic.zip',
      path: 'C:/Docs/Gigantic.zip',
      size: 1024 * 1024 * 100, // 100 MB > 10 MB limit
      modifiedAt: '2026-11-20T10:00:00Z',
    };

    const oversizedResult = FileIndexer.indexFile(oversizedFile, privacy);
    expect(oversizedResult).toBeNull();
  });
});
