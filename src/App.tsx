import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { useEffect } from 'react';
import { useNotesStore } from './store/notesStore';

function App() {
  const loadNotes = useNotesStore((state) => state.loadNotes);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Home />} />
          <Route path="/favorites" element={<div>Favorites (Phase 3)</div>} />
          <Route path="/archive" element={<div>Archive (Phase 3)</div>} />
          <Route path="/trash" element={<div>Trash (Phase 3)</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
