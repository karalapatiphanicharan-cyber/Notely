import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<div>All Notes (Phase 2)</div>} />
          <Route path="/favorites" element={<div>Favorites (Phase 2)</div>} />
          <Route path="/archive" element={<div>Archive (Phase 2)</div>} />
          <Route path="/trash" element={<div>Trash (Phase 2)</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
