// frontend/src/pages/delivery/DeliveryNoteList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Trash2, Download, Search, Filter, CheckCircle, Clock, Truck } from 'lucide-react';
import * as deliveryService from '../../services/deliveryService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const DeliveryNoteList = () => {
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveryNotes();
      setDeliveryNotes(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch delivery notes');
      toast.error('Failed to load delivery notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery note?')) {
      try {
        await deliveryService.deleteDeliveryNote(id);
        toast.success('Delivery note deleted successfully');
        fetchDeliveryNotes();
      } catch (error) {
        toast.error('Failed to delete delivery note');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await deliveryService.downloadDeliveryNotePDF(id);
      toast.success('Delivery note downloaded successfully');
    } catch (error) {
      toast.error('Failed to download delivery note');
    }
  };

  // Filter delivery notes based on search term and status filter
  const filteredDeliveryNotes = deliveryNotes.filter((note) => {
    const matchesSearch =
      searchTerm === '' ||
      note.deliveryNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.lpo?.lpoNumber && note.lpo.lpoNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Pending' },
      in_transit: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'In Transit' },
      delivered: { bg: 'bg-green-700', text: 'text-green-200', label: 'Delivered' },
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
        <h1 className="text-2xl font-bold text-primary">Delivery Notes</h1>
        <Link to="/delivery-notes/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          New Delivery Note
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
              placeholder="Search delivery notes..."
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
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
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
                    Delivery #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    LPO #
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
                {filteredDeliveryNotes.length > 0 ? (
                  filteredDeliveryNotes.map((note) => (
                    <tr key={note._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/delivery-notes/${note._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {note.deliveryNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {note.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(note.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {note.lpo ? (
                          <Link
                            to={`/lpos/${note.lpo._id}`}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            {note.lpo.lpoNumber}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(note.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/delivery-notes/${note._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          
                          {(note.status === 'pending' || note.status === 'in_transit') && (
                            <Link
                              to={`/delivery-notes/${note._id}`}
                              className="text-green-500 hover:text-green-400"
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={18} />
                            </Link>
                          )}
                          
                          <button
                            onClick={() => handleDownload(note._id)}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(note._id)}
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
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No delivery notes match your search criteria'
                        : 'No delivery notes found. Create your first delivery note!'}
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

export default DeliveryNoteList;