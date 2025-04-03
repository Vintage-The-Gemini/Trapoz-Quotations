// frontend/src/pages/lpo/LPODetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Truck, FileText, Share, Trash2, CheckCircle, 
  XCircle, Clock, AlertCircle 
} from 'lucide-react';
import * as lpoService from '../../services/lpoService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';
import ShareDocument from '../../components/shared/ShareDocument';

const LPODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lpo, setLpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchLpoDetails();
  }, [id]);

  const fetchLpoDetails = async () => {
    try {
      setLoading(true);
      const response = await lpoService.getLPOById(id);
      setLpo(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch LPO details');
      toast.error('Error loading LPO information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await lpoService.downloadLPOPDF(id);
      toast.success('LPO downloaded successfully');
    } catch (error) {
      toast.error('Failed to download LPO');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this LPO?')) {
      try {
        await lpoService.deleteLPO(id);
        toast.success('LPO deleted successfully');
        navigate('/lpos');
      } catch (error) {
        toast.error('Failed to delete LPO');
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      await lpoService.updateLPOStatus(id, newStatus);
      toast.success('LPO status updated successfully');
      setStatusModalOpen(false);
      fetchLpoDetails();
    } catch (error) {
      toast.error('Failed to update LPO status');
    }
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      received: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'Received', icon: Clock },
      processing: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Processing', icon: AlertCircle },
      fulfilled: { bg: 'bg-green-700', text: 'text-green-200', label: 'Fulfilled', icon: CheckCircle },
      cancelled: { bg: 'bg-red-700', text: 'text-red-200', label: 'Cancelled', icon: XCircle }
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-700', text: 'text-gray-200', label: status, icon: Clock };
    const Icon = statusInfo.icon;
    
    return (
      <span className={`flex items-center px-3 py-1 text-sm rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
        <Icon size={14} className="mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!lpo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">LPO not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDocument
          documentType="lpo"
          documentId={id}
          documentNumber={lpo.lpoNumber}
          clientName={lpo.clientName}
          clientEmail={lpo.contactEmail}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Status Change Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-dark-light rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-dark-lighter">
              <h2 className="text-lg font-semibold text-white">Update LPO Status</h2>
              <button onClick={() => setStatusModalOpen(false)} className="p-1 rounded hover:bg-dark-lighter">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Current Status
                </label>
                <div className="p-2 bg-dark-lighter rounded">
                  {getStatusBadge(lpo.status)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  New Status
                </label>
                <select
                  className="input w-full"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="received">Received</option>
                  <option value="processing">Processing</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="btn bg-dark-lighter hover:bg-dark text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusChange}
                  className="btn btn-primary"
                  disabled={!newStatus || newStatus === lpo.status}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/lpos')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              LPO #{lpo.lpoNumber}
            </h1>
            <div className="flex items-center mt-1">
              {getStatusBadge(lpo.status)}
              <span className="text-gray-400 ml-2">• Issued: {formatDate(lpo.issuedDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center gap-2"
          >
            <Share size={18} />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </button>
          
          {lpo.status === 'fulfilled' && (
            <Link
              to={`/invoices/create?lpoId=${id}`}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <FileText size={18} />
              Create Invoice
            </Link>
          )}
          
          {lpo.status === 'received' && (
            <Link
              to={`/delivery-notes/create?lpoId=${id}`}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Truck size={18} />
              Create Delivery Note
            </Link>
          )}
          
          <button
            onClick={() => {
              setNewStatus('');
              setStatusModalOpen(true);
            }}
            className="btn bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
          >
            <Clock size={18} />
            Change Status
          </button>
          
          <button
            onClick={handleDelete}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* LPO Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Details</h2>
          <div className="space-y-2">
            <p className="text-white font-medium">{lpo.clientName}</p>
            {lpo.clientAddress && (
              <p className="text-gray-400 whitespace-pre-line">{lpo.clientAddress}</p>
            )}
            {lpo.contactPerson && (
              <p className="text-gray-400">Contact: {lpo.contactPerson}</p>
            )}
            {lpo.contactEmail && (
              <p className="text-gray-400">Email: {lpo.contactEmail}</p>
            )}
            {lpo.contactPhone && (
              <p className="text-gray-400">Phone: {lpo.contactPhone}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">LPO Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">LPO Number:</span>
              <span className="text-white">{lpo.lpoNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Issue Date:</span>
              <span className="text-white">{formatDate(lpo.issuedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Received Date:</span>
              <span className="text-white">{formatDate(lpo.receivedDate)}</span>
            </div>
            {lpo.quotation && (
              <div className="flex justify-between">
                <span className="text-gray-400">Based on Quotation:</span>
                <Link to={`/quotations/${lpo.quotation._id}`} className="text-primary hover:text-primary-light">
                  {lpo.quotation.quoteNumber}
                </Link>
              </div>
            )}
            {lpo.deliveryAddress && (
              <div className="pt-2 border-t border-dark-lighter">
                <p className="text-gray-400">Delivery Address:</p>
                <p className="text-white whitespace-pre-line">{lpo.deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Amount Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">{formatCurrency(lpo.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT (16%):</span>
              <span className="text-white">{formatCurrency(lpo.vat)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dark-lighter">
              <span className="text-gray-400 font-medium">Total Amount:</span>
              <span className="text-primary font-medium">{formatCurrency(lpo.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">LPO Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark">
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-gray-400">Units</th>
                <th className="text-right py-3 px-4 text-gray-400">Quantity</th>
                <th className="text-right py-3 px-4 text-gray-400">Unit Price</th>
                <th className="text-right py-3 px-4 text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lpo.items.map((item, index) => (
                <tr key={index} className="border-b border-dark-lighter">
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">{item.units || 'N/A'}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Subtotal</td>
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(lpo.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">VAT (16%)</td>
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(lpo.vat)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total</td>
                <td className="text-right py-3 px-4 font-medium text-primary">{formatCurrency(lpo.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {lpo.additionalNotes && (
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Notes</h2>
          <p className="text-gray-300 whitespace-pre-line">{lpo.additionalNotes}</p>
        </div>
      )}
    </div>
  );
};

export default LPODetail;