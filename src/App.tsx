import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { PublicRankings } from './components/PublicRankings';
import { AdminInterface } from './components/AdminInterface';
import './index.css';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRankings />} />
          <Route path="/admin" element={<AdminInterface />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
