// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart4, 
  FileText, 
  DollarSign, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  AlertCircle,
  RefreshCcw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  FileCheck,
  Truck,
  Receipt,
  CreditCard,
  Calendar,
  CalendarClock
} from 'lucide-react';
import * as quotationService from '../services/quotationService';
import * as invoiceService from '../services/invoiceService';
import * as clientService from '../services/clientService';
import * as paymentService from '../services/paymentService';
import * as lpoService from '../services/lpoService';
import * as deliveryService from '../services/deliveryService';
import { Loading } from '../components/shared/Loading';
import { Error } from '../components/shared/Error';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    quotations: { total: 0, pending: 0, approved: 0, expired: 0, rejected: 0 },
    invoices: { total: 0, unpaid: 0, partiallyPaid: 0, paid: 0, overdue: 0 },
    clients: { total: 0, active: 0, new: 0 },
    payments: { today: 0, thisMonth: 0, total: 0, count: 0 },
    lpos: { total: 0, processing: 0, fulfilled: 0 },
    deliveries: { pending: 0, delivered: 0 },
    recentQuotations: [],
    recentInvoices: [],
    upcomingPayments: [],
    recentPayments: [],
    pendingDeliveries: []
  });

  // For the mini chart
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', amount: 120000 },
    { month: 'Feb', amount: 150000 },
    { month: 'Mar', amount: 180000 },
    { month: 'Apr', amount: 220000 },
    { month: 'May', amount: 190000 },
    { month: 'Jun', amount: 240000 },
    { month: 'Jul', amount: 270000 },
    { month: 'Aug', amount: 300000 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this could be a single API endpoint for dashboard data
      // Here we're making separate calls to simulate the process
      const [quotationsRes, invoicesRes, clientsRes, paymentsRes, lposRes, deliveriesRes] = await Promise.all([
        quotationService.getQuotations(),
        invoiceService.getInvoices(),
        clientService.getClients(),
        paymentService.getPayments(),
        lpoService.getLPOs(),
        deliveryService.getDeliveryNotes()
      ]);

      // Process quotations data
      const quotations = quotationsRes.data || [];
      const pendingQuotations = quotations.filter(q => q.status === 'pending');
      const approvedQuotations = quotations.filter(q => q.status === 'approved');
      const expiredQuotations = quotations.filter(q => q.status === 'expired');
      const rejectedQuotations = quotations.filter(q => q.status === 'rejected');
      
      // Process invoices data
      const invoices = invoicesRes.data || [];
      const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
      const partiallyPaidInvoices = invoices.filter(i => i.status === 'partially_paid');
      const paidInvoices = invoices.filter(i => i.status === 'paid');
      const overdueInvoices = invoices.filter(i => i.status === 'overdue');
      
      // Process clients data
      const clients = clientsRes.data || [];
      const activeClients = clients.filter(c => c.status === 'active');
      
      // Get new clients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newClients = clients.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
      
      // Process payments data
      const payments = paymentsRes.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todayPayments = payments.filter(p => new Date(p.date) >= today);
      const thisMonthPayments = payments.filter(p => new Date(p.date) >= firstDayOfMonth);
      
      const todayPaymentsTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);
      const thisMonthPaymentsTotal = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      
      // Process LPO data
      const lpos = lposRes.data || [];
      const processingLPOs = lpos.filter(l => l.status === 'processing');
      const fulfilledLPOs = lpos.filter(l => l.status === 'fulfilled');
      
      // Process delivery notes data
      const deliveries = deliveriesRes.data || [];
      const pendingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'in_transit');
      const deliveredItems = deliveries.filter(d => d.status === 'delivered');
      
      // Upcoming payments calculation (invoices due in the next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingPayments = invoices
        .filter(i => 
          i.status !== 'paid' && 
          new Date(i.dueDate) >= today && 
          new Date(i.dueDate) <= nextWeek
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setStats({
        quotations: {
          total: quotations.length,
          pending: pendingQuotations.length,
          approved: approvedQuotations.length,
          expired: expiredQuotations.length,
          rejected: rejectedQuotations.length
        },
        invoices: {
          total: invoices.length,
          unpaid: unpaidInvoices.length,
          partiallyPaid: partiallyPaidInvoices.length,
          paid: paidInvoices.length,
          overdue: overdueInvoices.length
        },
        clients: {
          total: clients.length,
          active: activeClients.length,
          new: newClients.length
        },
        payments: {
          today: todayPaymentsTotal,
          thisMonth: thisMonthPaymentsTotal,
          total: totalPaymentsAmount,
          count: payments.length
        },
        lpos: {
          total: lpos.length,
          processing: processingLPOs.length,
          fulfilled: fulfilledLPOs.length
        },
        deliveries: {
          pending: pendingDeliveries.length,
          delivered: deliveredItems.length
        },
        recentQuotations: quotations.slice(0, 5),
        recentInvoices: invoices.slice(0, 5),
        upcomingPayments: upcomingPayments.slice(0, 5),
        recentPayments: payments.slice(0, 5),
        pendingDeliveries: pendingDeliveries.slice(0, 5)
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

  if (loading && !refreshing) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, here's an overview of your business</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/quotations/create"
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="border-b border-dark-lighter">
        <nav className="flex flex-wrap -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sales')}
          >
            Sales Pipeline
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'finance'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('finance')}
          >
            Finance
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operations'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('operations')}
          >
            Operations
          </button>
        </nav>
      </div>
      
      {/* Main Dashboard Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Quick Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quotations Card */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Quotations</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.quotations.total}</h3>
                    <div className="flex items-center mt-2">
                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center">
                        <span>{stats.quotations.pending} Pending</span>
                      </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No quotations found
                  </div>
                )}
              </div>
            </div>
            
            {/* Upcoming Payments */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Upcoming Payments</h2>
                <Link to="/invoices" className="text-xs text-primary hover:text-primary-light">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-dark-lighter">
                {stats.upcomingPayments.length > 0 ? (
                  stats.upcomingPayments.map((invoice) => (
                    <div key={invoice._id} className="p-4 hover:bg-dark-lighter transition-colors">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                            <CalendarClock size={16} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                              {invoice.invoiceNumber} - {invoice.clientName}
                            </p>
                            <div className="flex text-xs text-gray-400">
                              <p className="mr-2">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                              <p>Amount: KSH {invoice.balance.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <Link to={`/invoices/${invoice._id}`} className="text-orange-500 hover:text-orange-400">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No upcoming payments
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quotation Status Breakdown */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter">
              <h2 className="text-lg font-semibold text-white">Quotation Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Pending</span>
                    <span>{stats.quotations.pending} ({stats.quotations.total ? Math.round((stats.quotations.pending / stats.quotations.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: `${stats.quotations.total ? (stats.quotations.pending / stats.quotations.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Approved</span>
                    <span>{stats.quotations.approved} ({stats.quotations.total ? Math.round((stats.quotations.approved / stats.quotations.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${stats.quotations.total ? (stats.quotations.approved / stats.quotations.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Rejected</span>
                    <span>{stats.quotations.rejected} ({stats.quotations.total ? Math.round((stats.quotations.rejected / stats.quotations.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${stats.quotations.total ? (stats.quotations.rejected / stats.quotations.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Expired</span>
                    <span>{stats.quotations.expired} ({stats.quotations.total ? Math.round((stats.quotations.expired / stats.quotations.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-gray-500 rounded-full" 
                      style={{ width: `${stats.quotations.total ? (stats.quotations.expired / stats.quotations.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-lighter">
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-white">{stats.quotations.approved}</span> out of <span className="font-medium text-white">{stats.quotations.total}</span> quotations have been approved.
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent LPOs */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Recent LPOs</h2>
              <Link to="/lpos" className="text-xs text-primary hover:text-primary-light">
                View all
              </Link>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <FileCheck size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">LPO2045</p>
                      <p className="text-xs text-gray-400">ABC Company Ltd.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">KSH 125,000</p>
                    <p className="text-xs text-green-500">Processing</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <FileCheck size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">LPO2044</p>
                      <p className="text-xs text-gray-400">XYZ Industries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">KSH 85,700</p>
                    <p className="text-xs text-gray-500">Fulfilled</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <FileCheck size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">LPO2043</p>
                      <p className="text-xs text-gray-400">123 Construction Co.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">KSH 230,500</p>
                    <p className="text-xs text-green-500">Processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Deliveries */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Pending Deliveries</h2>
              <Link to="/delivery-notes" className="text-xs text-primary hover:text-primary-light">
                View all
              </Link>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {stats.pendingDeliveries.length > 0 ? (
                  stats.pendingDeliveries.map((delivery, index) => (
                    <div key={delivery._id || index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                          <Truck size={16} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{delivery.deliveryNumber || `DN${index+1}`}</p>
                          <p className="text-xs text-gray-400">{delivery.clientName || 'Client Name'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-yellow-500">
                          {delivery.status === 'in_transit' ? 'In Transit' : 'Pending'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {delivery.date ? new Date(delivery.date).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No pending deliveries
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Status */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter">
              <h2 className="text-lg font-semibold text-white">Invoice Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Unpaid</span>
                    <span>{stats.invoices.unpaid} ({stats.invoices.total ? Math.round((stats.invoices.unpaid / stats.invoices.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${stats.invoices.total ? (stats.invoices.unpaid / stats.invoices.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Partially Paid</span>
                    <span>{stats.invoices.partiallyPaid} ({stats.invoices.total ? Math.round((stats.invoices.partiallyPaid / stats.invoices.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: `${stats.invoices.total ? (stats.invoices.partiallyPaid / stats.invoices.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Paid</span>
                    <span>{stats.invoices.paid} ({stats.invoices.total ? Math.round((stats.invoices.paid / stats.invoices.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${stats.invoices.total ? (stats.invoices.paid / stats.invoices.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-white mb-1">
                    <span>Overdue</span>
                    <span>{stats.invoices.overdue} ({stats.invoices.total ? Math.round((stats.invoices.overdue / stats.invoices.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-dark-lighter rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${stats.invoices.total ? (stats.invoices.overdue / stats.invoices.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-lighter">
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-white">{stats.invoices.paid + stats.invoices.partiallyPaid}</span> out of <span className="font-medium text-white">{stats.invoices.total}</span> invoices have received payments.
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent Payments */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
              <Link to="/payments" className="text-xs text-primary hover:text-primary-light">
                View all
              </Link>
            </div>
            <div className="divide-y divide-dark-lighter">
              {stats.recentPayments.length > 0 ? (
                stats.recentPayments.map((payment, index) => (
                  <div key={payment._id || index} className="p-4 hover:bg-dark-lighter transition-colors">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                          <Receipt size={16} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {payment.receiptNumber || `RCT${index+1}`} - {payment.invoice?.clientName || 'Client'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.paymentMethod ? payment.paymentMethod.replace('_', ' ').toUpperCase() : 'Payment Method'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          KSH {payment.amount?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.date ? new Date(payment.date).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No recent payments
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'operations' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Delivery Status */}
          <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-lighter">
              <h2 className="text-lg font-semibold text-white">Delivery Status</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-yellow-500/20 p-3 rounded-full">
                    <Truck className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{stats.deliveries.pending}</h3>
                  <p className="text-sm text-gray-400">Pending Deliveries</p>
                </div>
                <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{stats.deliveries.delivered}</h3>
                  <p className="text-sm text-gray-400">Completed Deliveries</p>
                </div>
                <div className="bg-dark rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{stats.lpos.processing}</h3>
                  <p className="text-sm text-gray-400">LPOs in Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-dark-lighter">
                <div className="flex justify-between items-center">
                  <Link to="/quotations" className="text-xs text-primary hover:text-primary-light flex items-center">
                    View all
                    <ChevronRight size={14} className="ml-1" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-500">{stats.quotations.approved} Approved</span>
                    <span className="text-xs text-red-500">{stats.quotations.rejected} Rejected</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoices Card */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Invoices</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.invoices.total}</h3>
                    <div className="flex items-center mt-2">
                      <div className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded flex items-center">
                        <span>{stats.invoices.overdue} Overdue</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <FileCheck className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-dark-lighter">
                <div className="flex justify-between items-center">
                  <Link to="/invoices" className="text-xs text-blue-500 hover:text-blue-400 flex items-center">
                    View all
                    <ChevronRight size={14} className="ml-1" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-500">{stats.invoices.paid} Paid</span>
                    <span className="text-xs text-yellow-500">{stats.invoices.partiallyPaid} Partial</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payments Card */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Monthly Revenue</p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      KSH {stats.payments.thisMonth.toLocaleString()}
                    </h3>
                    <div className="flex items-center mt-2">
                      <div className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded flex items-center">
                        <ArrowUpRight size={12} className="mr-1" />
                        <span>Today: KSH {stats.payments.today.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-dark-lighter">
                <div className="flex justify-between items-center">
                  <Link to="/payments" className="text-xs text-green-500 hover:text-green-400 flex items-center">
                    View payments
                    <ChevronRight size={14} className="ml-1" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{stats.payments.count} Payments</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clients Card */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Clients</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.clients.total}</h3>
                    <div className="flex items-center mt-2">
                      <div className="bg-purple-500/10 text-purple-500 text-xs px-2 py-1 rounded flex items-center">
                        <span>{stats.clients.active} Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-dark-lighter">
                <div className="flex justify-between items-center">
                  <Link to="/clients" className="text-xs text-purple-500 hover:text-purple-400 flex items-center">
                    View clients
                    <ChevronRight size={14} className="ml-1" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-500">{stats.clients.new} New this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sales Pipeline Visualization */}
          <div className="bg-dark-light rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Sales Pipeline</h2>
              <button className="text-xs text-primary hover:text-primary-light">View details</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              {/* Pipeline steps */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{stats.quotations.total}</h3>
                  <p className="text-sm text-gray-400">Quotations</p>
                </div>
                <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                  <div
                    className="absolute h-full bg-primary rounded"
                    style={{ width: `${(stats.quotations.approved / stats.quotations.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-8 h-8 hidden md:flex items-center justify-center">
                <ChevronRight className="text-gray-600" />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                  <FileCheck className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{stats.lpos.total}</h3>
                  <p className="text-sm text-gray-400">LPOs</p>
                </div>
                <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                  <div
                    className="absolute h-full bg-blue-500 rounded"
                    style={{ width: `${(stats.lpos.processing / stats.lpos.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-8 h-8 hidden md:flex items-center justify-center">
                <ChevronRight className="text-gray-600" />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
                  <Truck className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{stats.deliveries.pending + stats.deliveries.delivered}</h3>
                  <p className="text-sm text-gray-400">Deliveries</p>
                </div>
                <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                  <div
                    className="absolute h-full bg-yellow-500 rounded"
                    style={{ width: `${(stats.deliveries.delivered / (stats.deliveries.pending + stats.deliveries.delivered || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-8 h-8 hidden md:flex items-center justify-center">
                <ChevronRight className="text-gray-600" />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{stats.invoices.total}</h3>
                  <p className="text-sm text-gray-400">Invoices</p>
                </div>
                <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                  <div
                    className="absolute h-full bg-orange-500 rounded"
                    style={{ width: `${(stats.invoices.paid / stats.invoices.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-8 h-8 hidden md:flex items-center justify-center">
                <ChevronRight className="text-gray-600" />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <Receipt className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{stats.payments.count}</h3>
                  <p className="text-sm text-gray-400">Payments</p>
                </div>
                <div className="h-1 w-full md:w-24 lg:w-32 mt-4 bg-dark-lighter relative">
                  <div
                    className="absolute h-full bg-green-500 rounded"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity and Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Quotations */}
            <div className="bg-dark-light rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-dark-lighter flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Recent Quotations</h2>
                <Link to="/quotations" className="text-xs text-primary hover:text-primary-light">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-dark-lighter">
                {stats.recentQuotations.length > 0 ? (
                  stats.recentQuotations.map((quotation) => (
                    <div key={quotation._id} className="p-4 hover:bg-dark-lighter transition-colors">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className={`
                            h-8 w-8 rounded-full flex items-center justify-center 
                            ${quotation.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                              quotation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'}
                          `}>
                            {quotation.status === 'approved' ? <CheckCircle size={16} /> : 
                             quotation.status === 'pending' ? <Clock size={16} /> : 
                             <AlertCircle size={16} />}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                              {quotation.quoteNumber} - {quotation.clientName}
                            </p>
                            <p className="text-xs text-gray-400">
                              Amount: KSH {quotation.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Link to={`/quotations/${quotation._id}`} className="text-primary hover:text-primary-dark">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>