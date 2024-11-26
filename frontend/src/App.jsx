// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/admin/Dashboard';
import ItemManagement from './pages/admin/ItemManagement';
import CreateQuotation from './pages/quotation/CreateQuotation';
import QuotationList from './pages/quotation/QuotationList';
import QuotationDetail from './pages/quotation/QuotationDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/items" element={<ItemManagement />} />
              <Route path="/quotation/create" element={<CreateQuotation />} />
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E1E1E',
            color: '#fff',
            border: '1px solid #2D2D2D',
          },
          success: {
            icon: '✅',
            style: {
              background: '#064E3B',
              border: '1px solid #065F46',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: '#7F1D1D',
              border: '1px solid #991B1B',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;