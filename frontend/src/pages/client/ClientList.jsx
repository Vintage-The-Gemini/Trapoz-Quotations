// frontend/src/pages/client/ClientList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, FileText, Download, Search, Filter } from 'lucide-react';
import * as clientService from '../../services/clientService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      setClients(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch clients');
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(id);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleDownloadStatement = async (id) => {
    try {
      await clientService.downloadClientStatement(id);
      toast.success('Statement downloaded successfully');
    } catch (error) {
      toast.error('Failed to download statement');
    }
  };

  // Filter clients based on search term and status filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Clients</h1>
        <Link to="/clients/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          New Client
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
              placeholder="Search clients..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                    Client #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/clients/${client._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {client.clientNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {client.contactPerson?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {client.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'active'
                            ? 'bg-green-700 text-green-200'
                            : 'bg-gray-700 text-gray-200'
                        }`}>
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/clients/${client._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <FileText size={18} />
                          </Link>
                          <Link
                            to={`/clients/${client._id}/edit`}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDownloadStatement(client._id)}
                            className="text-green-500 hover:text-green-400"
                            title="Download Statement"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
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
                        ? 'No clients match your search criteria'
                        : 'No clients found. Create your first client!'}
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

export default ClientList;