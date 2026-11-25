import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ResultList } from './components/ResultList';
import { PreviewPane } from './components/PreviewPane';
import { DirectoriesModal } from './components/DirectoriesModal';
import { PrivacyModal } from './components/PrivacyModal';
import { useOmniStore } from './core/omni_store';

export const App: React.FC = () => {
  const {
    selectNext,
    selectPrev,
    executeSelected,
    setQuery,
    toggleDirectoriesModal,
    togglePrivacyModal,
  } = useOmniStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelected();
      } else if (e.key === 'Escape') {
        setQuery('');
        toggleDirectoriesModal(false);
        togglePrivacyModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, executeSelected, setQuery, toggleDirectoriesModal, togglePrivacyModal]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-7 xl:col-span-8 overflow-hidden flex flex-col">
          <ResultList />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <PreviewPane />
        </div>
      </main>

      <DirectoriesModal />
      <PrivacyModal />
    </div>
  );
};

export default App;
