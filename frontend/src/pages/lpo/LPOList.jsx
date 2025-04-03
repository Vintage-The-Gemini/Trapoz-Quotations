// frontend/src/pages/lpo/LPOList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Trash2, Download, Search, Filter, FileText, Truck, Clock } from 'lucide-react';
import * as lpoService from '../../services/lpoService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const LPOList = () => {
  const [lpos, setLpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLpos();
  }, []);

  const fetchLpos = async () => {
    try {
      setLoading(true);
      const response = await lpoService.getLPOs();
      setLpos(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch LPOs');
      toast.error('Failed to load LPOs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this LPO?')) {
      try {
        await lpoService.deleteLPO(id);
        toast.success('LPO deleted successfully');
        fetchLpos();
      } catch (error) {
        toast.error('Failed to delete LPO');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await lpoService.downloadLPOPDF(id);
      toast.success('LPO downloaded successfully');
    } catch (error) {
      toast.error('Failed to download LPO');
    }
  };

  // Filter LPOs based on search term and status filter
  const filteredLpos = lpos.filter((lpo) => {
    const matchesSearch =
      searchTerm === '' ||
      lpo.lpoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lpo.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lpo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      received: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'Received' },
      processing: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Processing' },
      fulfilled: { bg: 'bg-green-700', text: 'text-green-200', label: 'Fulfilled' },
      cancelled: { bg: 'bg-red-700', text: 'text-red-200', label: 'Cancelled' }
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
        <h1 className="text-2xl font-bold text-primary">Local Purchase Orders</h1>
        <Link to="/lpos/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          Record New LPO
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
              placeholder="Search LPOs..."
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
              <option value="received">Received</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
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
                    LPO #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Received Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
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
                {filteredLpos.length > 0 ? (
                  filteredLpos.map((lpo) => (
                    <tr key={lpo._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/lpos/${lpo._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {lpo.lpoNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {lpo.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(lpo.issuedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(lpo.receivedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(lpo.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                        {formatCurrency(lpo.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/lpos/${lpo._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          
                          {lpo.status === 'received' && (
                            <Link
                              to={`/delivery-notes/create?lpoId=${lpo._id}`}
                              className="text-yellow-500 hover:text-yellow-400"
                              title="Create Delivery Note"
                            >
                              <Truck size={18} />
                            </Link>
                          )}
                          
                          {lpo.status === 'fulfilled' && (
                            <Link
                              to={`/invoices/create?lpoId=${lpo._id}`}
                              className="text-green-500 hover:text-green-400"
                              title="Create Invoice"
                            >
                              <FileText size={18} />
                            </Link>
                          )}
                          
                          <button
                            onClick={() => handleDownload(lpo._id)}
                            className="text-blue-500 hover:text-blue-400"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(lpo._id)}
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
                      {searchTerm || statusFilter !== 'all'
                        ? 'No LPOs match your search criteria'
                        : 'No LPOs found. Record your first LPO!'}
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

export default LPOList;