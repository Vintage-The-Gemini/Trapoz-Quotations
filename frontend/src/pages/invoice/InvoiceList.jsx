// frontend/src/pages/invoice/InvoiceList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Trash2, Download, Search, Filter, CreditCard } from 'lucide-react';
import * as invoiceService from '../../services/invoiceService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/fomatters';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch invoices');
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(id);
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await invoiceService.downloadInvoicePDF(id);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.lpo?.lpoNumber && invoice.lpo.lpoNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      unpaid: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Unpaid' },
      partially_paid: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'Partially Paid' },
      paid: { bg: 'bg-green-700', text: 'text-green-200', label: 'Paid' },
      overdue: { bg: 'bg-red-700', text: 'text-red-200', label: 'Overdue' }
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-700', text: 'text-gray-200', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Invoices</h1>
        <Link to="/invoices/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          New Invoice
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
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
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
                    Invoice #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    LPO #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {invoice.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {invoice.lpo ? (
                          <Link
                            to={`/lpos/${invoice.lpo._id}`}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            {invoice.lpo.lpoNumber}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/invoices/${invoice._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/payments/create?invoiceId=${invoice._id}`}
                            className="text-green-500 hover:text-green-400"
                            title="Record Payment"
                          >
                            <CreditCard size={18} />
                          </Link>
                          <button
                            onClick={() => handleDownload(invoice._id)}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice._id)}
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
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No invoices match your search criteria'
                        : 'No invoices found. Create your first invoice!'}
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

export default InvoiceList;