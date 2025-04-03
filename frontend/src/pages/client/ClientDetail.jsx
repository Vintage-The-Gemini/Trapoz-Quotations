// frontend/src/pages/client/ClientDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Mail, Phone, Globe, MapPin, Building } from 'lucide-react';
import * as clientService from '../../services/clientService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { toast } from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientResponse = await clientService.getClientById(id);
      setClient(clientResponse.data);
      
      // Fetch client statement data
      const statementResponse = await clientService.getClientStatement(id);
      setStatementData(statementResponse.data);
      
      setError(null);
    } catch (error) {
      setError('Failed to fetch client details');
      toast.error('Error loading client information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    try {
      await clientService.downloadClientStatement(id);
      toast.success('Statement downloaded successfully');
    } catch (error) {
      toast.error('Failed to download statement');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Client not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clients')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            {client.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadStatement}
            className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center gap-2"
          >
            <Download size={20} />
            Statement
          </button>
          <Link
            to={`/clients/${id}/edit`}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Edit size={20} />
            Edit
          </Link>
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="text-gray-400 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-400">Client Number</p>
                <p className="text-white">{client.clientNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white whitespace-pre-line">
                  {client.address?.street || 'N/A'}
                  {client.address?.street && client.address?.city && <br />}
                  {client.address?.city}
                  {client.address?.city && client.address?.state && ', '}
                  {client.address?.state} {client.address?.postalCode}
                  {(client.address?.city || client.address?.state) && client.address?.country && <br />}
                  {client.address?.country}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{client.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{client.phone || 'N/A'}</p>
              </div>
            </div>
            {client.website && (
              <div className="flex items-start gap-3">
                <Globe className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="text-white">{client.website}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Person */}
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Person</h2>
          {client.contactPerson?.name ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{client.contactPerson.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Position</p>
                <p className="text-white">{client.contactPerson.position || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{client.contactPerson.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{client.contactPerson.phone || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No contact person information</p>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Industry</p>
              <p className="text-white">{client.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                client.status === 'active'
                  ? 'bg-green-700 text-green-200'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {client.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Payment Terms</p>
              <p className="text-white">
                {client.paymentTerms?.dueDate
                  ? `${client.paymentTerms.dueDate} days`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">VAT Number</p>
              <p className="text-white">{client.taxInfo?.vatNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">PIN Number</p>
              <p className="text-white">{client.taxInfo?.pinNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {statementData && statementData.transactions && (
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-lighter">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter">
                {statementData.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-dark-lighter transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {transaction.reference}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                      {transaction.type === 'invoice' ? `KSH ${transaction.amount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                      {transaction.type === 'payment' ? `KSH ${transaction.amount.toLocaleString()}` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-white">
                      KSH {transaction.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-dark">
                  <td colSpan="3" className="px-4 py-3 font-medium text-gray-400">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    KSH {statementData.transactions
                      .filter(t => t.type === 'invoice')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    KSH {statementData.transactions
                      .filter(t => t.type === 'payment')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary">
                    KSH {(statementData.transactions[statementData.transactions.length - 1]?.balance || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="bg-dark-light rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <p className="text-gray-300 whitespace-pre-line">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;