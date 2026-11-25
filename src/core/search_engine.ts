import { SearchCategory, SearchResult } from '../types';

export class SearchEngine {
  /**
   * Tokenize string into normalized alphanumeric terms
   */
  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 0);
  }

  /**
   * Calculate fuzzy / substring matching score between query and target
   */
  static calculateTextScore(query: string, target: string): number {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase().trim();

    if (!q || !t) return 0;
    if (t === q) return 1.0;
    if (t.startsWith(q)) return 0.85 + 0.15 * (q.length / t.length);
    if (t.includes(q)) return 0.6 + 0.3 * (q.length / t.length);

    // Fuzzy token match
    const qTokens = this.tokenize(q);
    const tTokens = this.tokenize(t);

    let matchCount = 0;
    for (const qt of qTokens) {
      if (tTokens.some((tt) => tt.includes(qt))) {
        matchCount++;
      }
    }

    return qTokens.length > 0 ? (matchCount / qTokens.length) * 0.5 : 0;
  }

  /**
   * Compute cosine similarity between two vector embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || a.length !== b.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generate lightweight deterministic embedding vector for text
   */
  static generateEmbedding(text: string, dimensions = 8): number[] {
    const vector = new Array(dimensions).fill(0);
    const tokens = this.tokenize(text);

    tokens.forEach((token, idx) => {
      for (let i = 0; i < token.length; i++) {
        const charCode = token.charCodeAt(i);
        const slot = (charCode + idx * 7) % dimensions;
        vector[slot] += charCode / 255.0;
      }
    });

    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map((v) => v / norm) : vector;
  }

  /**
   * Natural language query parser: detects category intent and keywords
   */
  static parseQuery(query: string): {
    cleanQuery: string;
    inferredCategory?: SearchCategory;
    isSemantic: boolean;
  } {
    const q = query.trim().toLowerCase();
    let inferredCategory: SearchCategory | undefined = undefined;

    if (q.startsWith('app:') || q.startsWith('open ') || q.startsWith('launch ')) {
      inferredCategory = 'APP';
    } else if (q.startsWith('doc:') || q.startsWith('document:') || q.includes('.pdf') || q.includes('.docx')) {
      inferredCategory = 'DOC';
    } else if (q.startsWith('code:') || q.startsWith('fn:') || q.includes('.ts') || q.includes('.rs')) {
      inferredCategory = 'CODE';
    } else if (q.startsWith('media:') || q.startsWith('image:') || q.startsWith('screenshot:')) {
      inferredCategory = 'MEDIA';
    } else if (q.startsWith('bm:') || q.startsWith('url:') || q.startsWith('http')) {
      inferredCategory = 'BOOKMARK';
    }

    const cleanQuery = q
      .replace(/^(app:|open |launch |doc:|document:|code:|media:|image:|screenshot:|bm:|url:)/, '')
      .trim();

    const isSemantic = cleanQuery.split(' ').length > 2;

    return {
      cleanQuery: cleanQuery || q,
      inferredCategory,
      isSemantic,
    };
  }

  /**
   * Score and rank a collection of search items
   */
  static search(
    query: string,
    items: SearchResult[],
    categoryFilter: SearchCategory = 'ALL'
  ): SearchResult[] {
    if (!query.trim()) {
      return items.filter((item) => categoryFilter === 'ALL' || item.category === categoryFilter);
    }

    const { cleanQuery, inferredCategory } = this.parseQuery(query);
    const activeCategory = categoryFilter !== 'ALL' ? categoryFilter : inferredCategory || 'ALL';
    const queryEmbedding = this.generateEmbedding(cleanQuery);

    const scored = items
      .filter((item) => activeCategory === 'ALL' || item.category === activeCategory)
      .map((item) => {
        const titleScore = this.calculateTextScore(cleanQuery, item.title) * 1.5;
        const subScore = this.calculateTextScore(cleanQuery, item.subtitle) * 0.8;
        const snippetScore = item.snippet ? this.calculateTextScore(cleanQuery, item.snippet) * 0.6 : 0;
        const tagScore = item.tags ? Math.max(0, ...item.tags.map((t) => this.calculateTextScore(cleanQuery, t))) * 1.0 : 0;

        const lexicalScore = Math.max(titleScore, subScore, snippetScore, tagScore);

        const itemEmbedding = item.embedding || this.generateEmbedding(item.title + ' ' + (item.snippet || ''));
        const semanticScore = this.cosineSimilarity(queryEmbedding, itemEmbedding);

        // Hybrid formula
        const combinedScore = lexicalScore > 0 ? lexicalScore * 0.7 + semanticScore * 0.3 : semanticScore * 0.5;

        return {
          ...item,
          score: Math.min(1.0, combinedScore),
          semanticScore,
        };
      })
      .filter((item) => item.score > 0.15)
      .sort((a, b) => b.score - a.score);

    return scored;
  }
}
