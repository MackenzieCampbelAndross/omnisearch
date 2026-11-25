import { describe, it, expect } from 'vitest';
import { SearchEngine } from '../src/core/search_engine';
import { SearchResult } from '../src/types';

describe('SearchEngine', () => {
  it('tokenizes text correctly into alphanumeric terms', () => {
    const terms = SearchEngine.tokenize('Hello, World! OmniSearch v1.0.0 (Fast)');
    expect(terms).toContain('hello');
    expect(terms).toContain('world');
    expect(terms).toContain('omnisearch');
    expect(terms).toContain('v1.0.0');
    expect(terms).toContain('fast');
  });

  it('computes exact and prefix text scores appropriately', () => {
    const exact = SearchEngine.calculateTextScore('chrome', 'chrome');
    const prefix = SearchEngine.calculateTextScore('chr', 'chrome');
    const substring = SearchEngine.calculateTextScore('rom', 'chrome');
    const none = SearchEngine.calculateTextScore('firefox', 'chrome');

    expect(exact).toBe(1.0);
    expect(prefix).toBeGreaterThan(0.85);
    expect(substring).toBeGreaterThan(0.6);
    expect(none).toBe(0);
  });

  it('computes vector cosine similarity', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    expect(SearchEngine.cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    expect(SearchEngine.cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
  });

  it('generates normalized embeddings with designated dimensions', () => {
    const embedding = SearchEngine.generateEmbedding('Rust memory safety', 8);
    expect(embedding.length).toBe(8);

    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1.0);
  });

  it('parses natural language search prefixes and intent', () => {
    const appQuery = SearchEngine.parseQuery('app: code');
    expect(appQuery.inferredCategory).toBe('APP');
    expect(appQuery.cleanQuery).toBe('code');

    const docQuery = SearchEngine.parseQuery('doc: Financial Report');
    expect(docQuery.inferredCategory).toBe('DOC');
    expect(docQuery.cleanQuery).toBe('financial report');

    const codeQuery = SearchEngine.parseQuery('code: kernel');
    expect(codeQuery.inferredCategory).toBe('CODE');
    expect(codeQuery.cleanQuery).toBe('kernel');
  });

  it('ranks and filters search results by query relevance', () => {
    const items: SearchResult[] = [
      {
        id: '1',
        title: 'Visual Studio Code',
        subtitle: 'C:/Apps/VSCode.exe',
        path: 'C:/Apps/VSCode.exe',
        category: 'APP',
        score: 1.0,
        icon: 'Cpu',
      },
      {
        id: '2',
        title: 'Financial Q4 Report.docx',
        subtitle: 'C:/Docs/Report.docx',
        path: 'C:/Docs/Report.docx',
        category: 'DOC',
        score: 1.0,
        icon: 'FileText',
      },
    ];

    const results = SearchEngine.search('code', items, 'ALL');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Visual Studio Code');
  });
});
