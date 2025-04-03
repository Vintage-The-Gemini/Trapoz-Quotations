// frontend/src/pages/delivery/DeliveryNoteDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Share, Trash2, CheckCircle, 
  XCircle, Clock, AlertCircle 
} from 'lucide-react';
import * as deliveryService from '../../services/deliveryService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';
import ShareDocument from '../../components/shared/ShareDocument';

const DeliveryNoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deliveryNote, setDeliveryNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [markAsDeliveredModal, setMarkAsDeliveredModal] = useState(false);
  const [deliveryFormData, setDeliveryFormData] = useState({
    receivedBy: '',
    receiverPosition: '',
    notes: ''
  });

  useEffect(() => {
    fetchDeliveryDetails();
  }, [id]);

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveryNoteById(id);
      setDeliveryNote(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch delivery note details');
      toast.error('Error loading delivery note information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await deliveryService.downloadDeliveryNotePDF(id);
      toast.success('Delivery note downloaded successfully');
    } catch (error) {
      toast.error('Failed to download delivery note');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this delivery note?')) {
      try {
        await deliveryService.deleteDeliveryNote(id);
        toast.success('Delivery note deleted successfully');
        navigate('/delivery-notes');
      } catch (error) {
        toast.error('Failed to delete delivery note');
      }
    }
  };

  const handleMarkAsDelivered = async (e) => {
    e.preventDefault();
    try {
      if (!deliveryFormData.receivedBy) {
        toast.error('Receiver name is required');
        return;
      }
      
      await deliveryService.markDeliveryAsDelivered(id, deliveryFormData);
      toast.success('Delivery note marked as delivered');
      setMarkAsDeliveredModal(false);
      fetchDeliveryDetails();
    } catch (error) {
      toast.error('Failed to update delivery status');
    }
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Pending', icon: Clock },
      in_transit: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'In Transit', icon: AlertCircle },
      delivered: { bg: 'bg-green-700', text: 'text-green-200', label: 'Delivered', icon: CheckCircle },
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

  if (!deliveryNote) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Delivery note not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDocument
          documentType="delivery-note"
          documentId={id}
          documentNumber={deliveryNote.deliveryNumber}
          clientName={deliveryNote.clientName}
          clientEmail={''}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Mark as Delivered Modal */}
      {markAsDeliveredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-dark-light rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-dark-lighter">
              <h2 className="text-lg font-semibold text-white">Mark as Delivered</h2>
              <button onClick={() => setMarkAsDeliveredModal(false)} className="p-1 rounded hover:bg-dark-lighter">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleMarkAsDelivered} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Received By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={deliveryFormData.receivedBy}
                  onChange={(e) => setDeliveryFormData({...deliveryFormData, receivedBy: e.target.value})}
                  placeholder="Name of person receiving the delivery"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={deliveryFormData.receiverPosition}
                  onChange={(e) => setDeliveryFormData({...deliveryFormData, receiverPosition: e.target.value})}
                  placeholder="Position or title of receiver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  className="input w-full h-24 resize-none"
                  value={deliveryFormData.notes}
                  onChange={(e) => setDeliveryFormData({...deliveryFormData, notes: e.target.value})}
                  placeholder="Any additional notes about the delivery"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMarkAsDeliveredModal(false)}
                  className="btn bg-dark-lighter hover:bg-dark text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/delivery-notes')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Delivery Note #{deliveryNote.deliveryNumber}
            </h1>
            <div className="flex items-center mt-1">
              {getStatusBadge(deliveryNote.status)}
              <span className="text-gray-400 ml-2">• Date: {formatDate(deliveryNote.date)}</span>
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
          
          {(deliveryNote.status === 'pending' || deliveryNote.status === 'in_transit') && (
            <button
              onClick={() => setMarkAsDeliveredModal(true)}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Mark as Delivered
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Details</h2>
          <div className="space-y-2">
            <p className="text-white font-medium">{deliveryNote.clientName}</p>
            {deliveryNote.clientAddress && (
              <p className="text-gray-400 whitespace-pre-line">{deliveryNote.clientAddress}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Delivery Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Delivery Number:</span>
              <span className="text-white">{deliveryNote.deliveryNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="text-white">{formatDate(deliveryNote.date)}</span>
            </div>
            {deliveryNote.lpo && (
              <div className="flex justify-between">
                <span className="text-gray-400">Related LPO:</span>
                <Link to={`/lpos/${deliveryNote.lpo._id}`} className="text-primary hover:text-primary-light">
                  {deliveryNote.lpo.lpoNumber}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transport Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Vehicle Details:</span>
              <span className="text-white">{deliveryNote.vehicleDetails || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Driver Name:</span>
              <span className="text-white">{deliveryNote.driverName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Driver Contact:</span>
              <span className="text-white">{deliveryNote.driverContact || 'N/A'}</span>
            </div>
            <div className="pt-2 border-t border-dark-lighter">
              <p className="text-gray-400">Delivery Address:</p>
              <p className="text-white whitespace-pre-line">{deliveryNote.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Delivery Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark">
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-gray-400">Units</th>
                <th className="text-right py-3 px-4 text-gray-400">Quantity</th>
                <th className="text-left py-3 px-4 text-gray-400">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {deliveryNote.items.map((item, index) => (
                <tr key={index} className="border-b border-dark-lighter">
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4">{item.units || 'N/A'}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4">{item.remarks || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Confirmation */}
      {deliveryNote.status === 'delivered' && (
        <div className="bg-dark-light rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Delivery Confirmation</h2>
          <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <div className="flex items-center mb-3">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <span className="text-green-400 font-medium">Delivered</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Received By</p>
                <p className="text-white">{deliveryNote.receivedBy}</p>
              </div>
              {deliveryNote.receiverPosition && (
                <div>
                  <p className="text-gray-400 text-sm">Position</p>
                  <p className="text-white">{deliveryNote.receiverPosition}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Date Received</p>
                <p className="text-white">{formatDate(deliveryNote.receivedDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {deliveryNote.notes && (
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <p className="text-gray-300 whitespace-pre-line">{deliveryNote.notes}</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryNoteDetail;