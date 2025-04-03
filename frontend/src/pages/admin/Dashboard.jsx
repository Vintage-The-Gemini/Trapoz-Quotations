// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import OverviewTab from '../../components/dashboard/tabs/OverviewTab';
import SalesTab from '../../components/dashboard/tabs/SalesTab';
import FinanceTab from '../../components/dashboard/tabs/FinanceTab';
import OperationsTab from '../../components/dashboard/tabs/OperationsTab';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';

// Services imports
import * as quotationService from '../../services/quotationService';
import * as invoiceService from '../../services/invoiceService';
import * as clientService from '../../services/clientService';
import * as paymentService from '../../services/paymentService';
import * as lpoService from '../../services/lpoService';
import * as deliveryService from '../../services/deliveryService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    quotations: { total: 0, pending: 0, approved: 0, expired: 0, rejected: 0, recentItems: [] },
    invoices: { total: 0, unpaid: 0, partiallyPaid: 0, paid: 0, overdue: 0, recentItems: [] },
    clients: { total: 0, active: 0, new: 0 },
    payments: { today: 0, thisMonth: 0, total: 0, count: 0, recentItems: [] },
    lpos: { total: 0, processing: 0, fulfilled: 0 },
    deliveries: { pending: 0, delivered: 0, pendingItems: [] },
    upcomingPayments: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data services with error handling for each
      let quotationsData = [], invoicesData = [], clientsData = [], 
          paymentsData = [], lposData = [], deliveriesData = [];
      
      try {
        const response = await quotationService.getQuotations();
        quotationsData = response.data || [];
      } catch (err) {
        console.error('Error fetching quotations:', err);
      }
      
      try {
        const response = await invoiceService.getInvoices();
        invoicesData = response.data || [];
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
      
      try {
        const response = await clientService.getClients();
        clientsData = response.data || [];
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
      
      try {
        const response = await paymentService.getPayments();
        paymentsData = response.data || [];
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
      
      try {
        const response = await lpoService.getLPOs();
        lposData = response.data || [];
      } catch (err) {
        console.error('Error fetching LPOs:', err);
      }
      
      try {
        const response = await deliveryService.getDeliveryNotes();
        deliveriesData = response.data || [];
      } catch (err) {
        console.error('Error fetching delivery notes:', err);
      }

      // Process quotations data
      const pendingQuotations = quotationsData.filter(q => q.status === 'pending');
      const approvedQuotations = quotationsData.filter(q => q.status === 'approved');
      const expiredQuotations = quotationsData.filter(q => q.status === 'expired');
      const rejectedQuotations = quotationsData.filter(q => q.status === 'rejected');
      
      // Process invoices data
      const unpaidInvoices = invoicesData.filter(i => i.status === 'unpaid');
      const partiallyPaidInvoices = invoicesData.filter(i => i.status === 'partially_paid');
      const paidInvoices = invoicesData.filter(i => i.status === 'paid');
      const overdueInvoices = invoicesData.filter(i => i.status === 'overdue');
      
      // Process clients data
      const activeClients = clientsData.filter(c => c.status === 'active');
      
      // Get new clients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newClients = clientsData.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
      
      // Process payments data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todayPayments = paymentsData.filter(p => new Date(p.date) >= today);
      const thisMonthPayments = paymentsData.filter(p => new Date(p.date) >= firstDayOfMonth);
      
      const todayPaymentsTotal = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const thisMonthPaymentsTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPaymentsAmount = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Process LPO data
      const processingLPOs = lposData.filter(l => l.status === 'processing');
      const fulfilledLPOs = lposData.filter(l => l.status === 'fulfilled');
      
      // Process delivery notes data
      const pendingDeliveries = deliveriesData.filter(d => d.status === 'pending' || d.status === 'in_transit');
      const deliveredItems = deliveriesData.filter(d => d.status === 'delivered');
      
      // Upcoming payments calculation (invoices due in the next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingPayments = invoicesData
        .filter(i => 
          i.status !== 'paid' && 
          new Date(i.dueDate) >= today && 
          new Date(i.dueDate) <= nextWeek
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      // Update dashboard data state
      setDashboardData({
        quotations: {
          total: quotationsData.length,
          pending: pendingQuotations.length,
          approved: approvedQuotations.length,
          expired: expiredQuotations.length,
          rejected: rejectedQuotations.length,
          recentItems: quotationsData.slice(0, 5)
        },
        invoices: {
          total: invoicesData.length,
          unpaid: unpaidInvoices.length,
          partiallyPaid: partiallyPaidInvoices.length,
          paid: paidInvoices.length,
          overdue: overdueInvoices.length,
          recentItems: invoicesData.slice(0, 5)
        },
        clients: {
          total: clientsData.length,
          active: activeClients.length,
          new: newClients.length
        },
        payments: {
          today: todayPaymentsTotal,
          thisMonth: thisMonthPaymentsTotal,
          total: totalPaymentsAmount,
          count: paymentsData.length,
          recentItems: paymentsData.slice(0, 5)
        },
        lpos: {
          total: lposData.length,
          processing: processingLPOs.length,
          fulfilled: fulfilledLPOs.length
        },
        deliveries: {
          pending: pendingDeliveries.length,
          delivered: deliveredItems.length,
          pendingItems: pendingDeliveries.slice(0, 5)
        },
        upcomingPayments: upcomingPayments.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading && !refreshing) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={dashboardData} />;
      case 'sales':
        return <SalesTab data={dashboardData} />;
      case 'finance':
        return <FinanceTab data={dashboardData} />;
      case 'operations':
        return <OperationsTab data={dashboardData} />;
      default:
        return <OverviewTab data={dashboardData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with title and action buttons */}
      <DashboardHeader 
        onRefresh={handleRefresh} 
        refreshing={refreshing} 
      />
      
      {/* Tab Navigation */}
      <DashboardTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Active Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Dashboard;