import { describe, it, expect, beforeEach } from 'vitest';
import { useOmniStore } from '../src/core/omni_store';

describe('useOmniStore', () => {
  beforeEach(() => {
    useOmniStore.setState({
      query: '',
      activeCategory: 'ALL',
      selectedIndex: 0,
      recentSearches: [],
    });
  });

  it('initializes with seed items across multiple categories', () => {
    const state = useOmniStore.getState();
    expect(state.allItems.length).toBeGreaterThan(0);
    expect(state.results.length).toBe(state.allItems.length);
    expect(state.stats.totalIndexedItems).toBe(state.allItems.length);
  });

  it('updates search query and filters results', () => {
    const { setQuery } = useOmniStore.getState();
    setQuery('Chrome');

    const state = useOmniStore.getState();
    expect(state.query).toBe('Chrome');
    expect(state.results.length).toBeGreaterThan(0);
    expect(state.results[0].title).toContain('Chrome');
  });

  it('filters results by category', () => {
    const { setActiveCategory } = useOmniStore.getState();
    setActiveCategory('CODE');

    const state = useOmniStore.getState();
    expect(state.activeCategory).toBe('CODE');
    expect(state.results.every((r) => r.category === 'CODE')).toBe(true);
  });

  it('navigates result selection with wrapping', () => {
    const { selectNext, selectPrev, results } = useOmniStore.getState();
    expect(results.length).toBeGreaterThan(1);

    selectNext();
    expect(useOmniStore.getState().selectedIndex).toBe(1);

    selectPrev();
    expect(useOmniStore.getState().selectedIndex).toBe(0);

    selectPrev();
    expect(useOmniStore.getState().selectedIndex).toBe(results.length - 1);
  });

  it('manages indexed directories', () => {
    const { addDirectory, removeDirectory } = useOmniStore.getState();
    const initialCount = useOmniStore.getState().directories.length;

    addDirectory('D:/CustomPath/Docs');
    expect(useOmniStore.getState().directories.length).toBe(initialCount + 1);

    const added = useOmniStore.getState().directories.find((d) => d.path === 'D:/CustomPath/Docs');
    expect(added).toBeDefined();

    if (added) {
      removeDirectory(added.id);
      expect(useOmniStore.getState().directories.length).toBe(initialCount);
    }
  });

  it('updates privacy settings and toggles modal', () => {
    const { updatePrivacy, togglePrivacyModal } = useOmniStore.getState();
    togglePrivacyModal(true);
    expect(useOmniStore.getState().isPrivacyModalOpen).toBe(true);

    updatePrivacy({ maxFileSizeMb: 120 });
    expect(useOmniStore.getState().privacy.maxFileSizeMb).toBe(120);
  });
});
