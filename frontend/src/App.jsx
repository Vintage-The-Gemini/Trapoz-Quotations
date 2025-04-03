// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/admin/Dashboard';
import ItemManagement from './pages/admin/ItemManagement';

// Quotation pages
import QuotationList from './pages/quotation/QuotationList';
import CreateQuotation from './pages/quotation/CreateQuotation';
import QuotationDetail from './pages/quotation/QuotationDetail';
import EditQuotation from './pages/quotation/EditQuotation';

// Other pages would be imported here as they're developed
// import ClientList from './pages/client/ClientList';
// import InvoiceList from './pages/invoice/InvoiceList';
// import LPOList from './pages/lpo/LPOList';
// import PaymentList from './pages/payment/PaymentList';
// import DeliveryList from './pages/delivery/DeliveryList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main application with layout */}
        <Route element={<MainLayout />}>
          {/* Dashboard as default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Quotation routes */}
          <Route path="/quotations" element={<QuotationList />} />
          <Route path="/quotations/create" element={<CreateQuotation />} />
          <Route path="/quotations/:id" element={<QuotationDetail />} />
          <Route path="/quotations/:id/edit" element={<EditQuotation />} />
          
          {/* Admin routes */}
          <Route path="/items" element={<ItemManagement />} />
          
          {/* Other routes would be added here as they're developed */}
          {/* <Route path="/clients" element={<ClientList />} /> */}
          {/* <Route path="/invoices" element={<InvoiceList />} /> */}
          {/* <Route path="/lpos" element={<LPOList />} /> */}
          {/* <Route path="/payments" element={<PaymentList />} /> */}
          {/* <Route path="/delivery-notes" element={<DeliveryList />} /> */}
          
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