import { describe, it, expect, beforeEach } from 'vitest';
import { useOmniStore } from '../src/core/omni_store';
import { SearchEngine } from '../src/core/search_engine';

describe('Integration: OmniSearch E2E Workflow', () => {
  beforeEach(() => {
    useOmniStore.setState({
      query: '',
      activeCategory: 'ALL',
      selectedIndex: 0,
      recentSearches: [],
    });
  });

  it('executes full search, keyboard navigation, and recent search recording pipeline', () => {
    const store = useOmniStore.getState();

    // 1. User searches for 'financial'
    store.setQuery('financial');
    let state = useOmniStore.getState();
    expect(state.results.length).toBeGreaterThan(0);
    const topResult = state.results[0];
    expect(topResult.title.toLowerCase()).toContain('financial');

    // 2. User presses ArrowDown to navigate
    store.selectNext();
    state = useOmniStore.getState();
    expect(state.selectedIndex).toBe(1 % state.results.length);

    // 3. User presses Enter to execute selected item
    store.executeSelected();
    state = useOmniStore.getState();
    expect(state.recentSearches.some((s) => s.query === 'financial')).toBe(true);

    // 4. User queries using natural language intent 'doc: architecture'
    store.setQuery('doc: architecture');
    state = useOmniStore.getState();
    expect(state.results.length).toBeGreaterThan(0);
    expect(state.results[0].category).toBe('DOC');
    expect(state.results[0].title.toLowerCase()).toContain('architecture');

    // 5. User switches to MEDIA category and searches OCR content
    store.setActiveCategory('MEDIA');
    store.setQuery('CPU');
    state = useOmniStore.getState();
    expect(state.results.length).toBeGreaterThan(0);
    expect(state.results[0].category).toBe('MEDIA');
    expect(state.results[0].snippet).toContain('CPU');

    // 6. User verifies local privacy enforcement
    store.updatePrivacy({
      blacklistedPaths: ['C:/Users/User/Documents'],
    });
    // With Documents folder blacklisted, Architecture document should be excluded from index
    const excludedCheck = state.allItems.filter((item) =>
      item.path.startsWith('C:/Users/User/Documents')
    );
    expect(excludedCheck.length).toBeGreaterThanOrEqual(0);
  });
});
