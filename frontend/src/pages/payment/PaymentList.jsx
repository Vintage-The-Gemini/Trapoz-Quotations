// frontend/src/pages/payment/PaymentList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Trash2, Download, Search, Filter, Calendar } from 'lucide-react';
import * as paymentService from '../../services/paymentService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments();
      setPayments(response.data);
      setError(null);
      
      // Set default date ranges for filtering
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } catch (error) {
      setError('Failed to fetch payments');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentService.deletePayment(id);
        toast.success('Payment record deleted successfully');
        fetchPayments();
      } catch (error) {
        toast.error('Failed to delete payment record');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await paymentService.downloadReceiptPDF(id);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === '' ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.invoice?.invoiceNumber && payment.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.invoice?.clientName && payment.invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply method filter
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    // Apply date filter
    let matchesDate = true;
    const paymentDate = new Date(payment.date);
    
    if (dateFilter === 'custom') {
      const filterStartDate = startDate ? new Date(startDate) : null;
      const filterEndDate = endDate ? new Date(endDate) : null;
      
      if (filterStartDate && filterEndDate) {
        // Set end date to end of day for inclusive comparison
        filterEndDate.setHours(23, 59, 59, 999);
        matchesDate = paymentDate >= filterStartDate && paymentDate <= filterEndDate;
      }
    } else if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = paymentDate >= today && paymentDate < tomorrow;
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      firstDayOfWeek.setHours(0, 0, 0, 0);
      
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7); // End of week (Saturday)
      
      matchesDate = paymentDate >= firstDayOfWeek && paymentDate < lastDayOfWeek;
    } else if (dateFilter === 'thisMonth') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      matchesDate = paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
    }
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  // Calculate total for filtered payments
  const filteredTotal = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Payments</h1>
        <Link to="/payments/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          Record Payment
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-dark-light p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="input"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <select
              className="input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        {/* Custom date range */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="input w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="input w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Total Amount Summary */}
      <div className="bg-dark-light p-4 rounded-lg mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
        <div className="text-right">
          <p className="text-gray-400">Total Amount ({filteredPayments.length} payments):</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(filteredTotal)}</p>
        </div>
      </div>

      {error ? (
        <Error message={error} />
      ) : (
        <div className="bg-dark-light rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-lighter">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Receipt #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 bg-dark text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/payments/${payment._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {payment.receiptNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.invoice ? (
                          <Link
                            to={`/invoices/${payment.invoice}`}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            {payment.invoice.invoiceNumber || '#' + payment.invoice.substring(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {payment.invoice?.clientName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {payment.paymentMethod.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/payments/${payment._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleDownload(payment._id)}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Download Receipt"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(payment._id)}
                            className="text-red-500 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      {searchTerm || dateFilter !== 'all' || methodFilter !== 'all'
                        ? 'No payments match your search criteria'
                        : 'No payments found. Record your first payment!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;