// frontend/src/pages/quotation/QuotationDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Share, Edit, Trash2, CheckCircle, 
  XCircle, Clock, AlertCircle 
} from 'lucide-react';
import * as quotationService from '../../services/quotationService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';
import QuotationApproval from '../../components/quotation/QuotationApproval';
import ProformaInvoice from '../../components/quotation/ProformaInvoice';
import ShareDocument from '../../components/shared/ShareDocument';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchQuotationDetails();
  }, [id]);

  const fetchQuotationDetails = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(id);
      setQuotation(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch quotation details');
      toast.error('Error loading quotation information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await quotationService.downloadPDF(id);
      toast.success('Quotation downloaded successfully');
    } catch (error) {
      toast.error('Failed to download quotation');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await quotationService.deleteQuotation(id);
        toast.success('Quotation deleted successfully');
        navigate('/quotations');
      } catch (error) {
        toast.error('Failed to delete quotation');
      }
    }
  };

  const handleStatusChange = (updatedQuotation) => {
    setQuotation(updatedQuotation);
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-700', text: 'text-yellow-200', label: 'Pending', icon: Clock },
      approved: { bg: 'bg-green-700', text: 'text-green-200', label: 'Approved', icon: CheckCircle },
      rejected: { bg: 'bg-red-700', text: 'text-red-200', label: 'Rejected', icon: XCircle },
      expired: { bg: 'bg-gray-700', text: 'text-gray-200', label: 'Expired', icon: AlertCircle },
      converted: { bg: 'bg-blue-700', text: 'text-blue-200', label: 'Converted', icon: CheckCircle }
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

  if (!quotation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Quotation not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDocument
          documentType="quotation"
          documentId={id}
          documentNumber={quotation.quoteNumber}
          clientName={quotation.clientName}
          clientEmail={''}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quotations')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Quotation #{quotation.quoteNumber}
            </h1>
            <p className="text-gray-400 mt-1 flex items-center">
              {getStatusBadge(quotation.status)} 
              <span className="mx-2">•</span>
              Date: {formatDate(quotation.createdAt || quotation.date)}
            </p>
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
          <Link
            to={`/quotations/${id}/edit`}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Status Approval/Actions Section */}
      <div className="mb-6">
        {/* Approval component for pending quotations */}
        <QuotationApproval quotation={quotation} onStatusChange={handleStatusChange} />
        
        {/* ProformaInvoice component for approved quotations */}
        {quotation.status === 'approved' && (
          <ProformaInvoice quotation={quotation} />
        )}
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>
          <div className="space-y-2">
            <p className="text-white font-medium">{quotation.clientName}</p>
            {quotation.clientAddress && (
              <p className="text-gray-400 whitespace-pre-line">{quotation.clientAddress}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quotation Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Quote Number:</span>
              <span className="text-white">{quotation.quoteNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="text-white">{formatDate(quotation.createdAt || quotation.date)}</span>
            </div>
            {quotation.validUntil && (
              <div className="flex justify-between">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-white">{formatDate(quotation.validUntil)}</span>
              </div>
            )}
            {quotation.site && (
              <div className="flex justify-between">
                <span className="text-gray-400">Site:</span>
                <span className="text-white">{quotation.site}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Amount Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">{formatCurrency(quotation.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT (16%):</span>
              <span className="text-white">{formatCurrency(quotation.vat)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dark-lighter">
              <span className="text-gray-400 font-medium">Total Amount:</span>
              <span className="text-primary font-medium">{formatCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quotation Items</h2>
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
              {quotation.items.map((item, index) => (
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
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(quotation.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">VAT (16%)</td>
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(quotation.vat)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total</td>
                <td className="text-right py-3 px-4 font-medium text-primary">{formatCurrency(quotation.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Terms and Conditions */}
      {quotation.termsAndConditions && (
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Terms and Conditions</h2>
          <p className="text-gray-300 whitespace-pre-line">{quotation.termsAndConditions}</p>
        </div>
      )}

      {/* Notes - will show for rejected quotations */}
      {quotation.notes && quotation.status === 'rejected' && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rejection Reason</h2>
          <p className="text-gray-300 whitespace-pre-line">{quotation.notes}</p>
        </div>
      )}
    </div>
  );
};

export default QuotationDetail;