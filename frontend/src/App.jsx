// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/admin/Dashboard';
import ItemManagement from './pages/admin/ItemManagement';

// Client pages
import ClientList from './pages/client/ClientList';
import ClientDetail from './pages/client/ClientDetail';
import CreateClient from './pages/client/CreateClient';
import EditClient from './pages/client/EditClient';

// Quotation pages
import QuotationList from './pages/quotation/QuotationList';
import CreateQuotation from './pages/quotation/CreateQuotation';
import QuotationDetail from './pages/quotation/QuotationDetail';
import EditQuotation from './pages/quotation/EditQuotation';

// Invoice pages
import InvoiceList from './pages/invoice/InvoiceList';
import InvoiceDetail from './pages/invoice/InvoiceDetail';
import CreateInvoice from './pages/invoice/CreateInvoice';

// LPO pages
import LPOList from './pages/lpo/LPOList';
import LPODetail from './pages/lpo/LPODetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main application with layout */}
        <Route element={<MainLayout />}>
          {/* Dashboard as default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Client routes */}
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/create" element={<CreateClient />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<EditClient />} />
          
          {/* Quotation routes */}
          <Route path="/quotations" element={<QuotationList />} />
          <Route path="/quotations/create" element={<CreateQuotation />} />
          <Route path="/quotations/:id" element={<QuotationDetail />} />
          <Route path="/quotations/:id/edit" element={<EditQuotation />} />
          
          {/* Invoice routes */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          
          {/* LPO routes */}
          <Route path="/lpos" element={<LPOList />} />
          <Route path="/lpos/:id" element={<LPODetail />} />
          
          {/* Admin routes */}
          <Route path="/items" element={<ItemManagement />} />
          
          {/* Add a catch-all route that redirects to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      
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