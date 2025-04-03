// frontend/src/pages/payment/PaymentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Trash2, Share, CheckCircle } from 'lucide-react';
import * as paymentService from '../../services/paymentService';
import * as invoiceService from '../../services/invoiceService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';
import ShareDocument from '../../components/shared/ShareDocument';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      // Fetch payment details
      const response = await paymentService.getPaymentById(id);
      setPayment(response.data);
      
      // Fetch related invoice
      if (response.data.invoice) {
        const invoiceResponse = await invoiceService.getInvoiceById(response.data.invoice);
        setInvoice(invoiceResponse.data);
      }
      
      setError(null);
    } catch (error) {
      setError('Failed to fetch payment details');
      toast.error('Error loading payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await paymentService.downloadReceiptPDF(id);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentService.deletePayment(id);
        toast.success('Payment record deleted successfully');
        navigate('/payments');
      } catch (error) {
        toast.error('Failed to delete payment record');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Payment record not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDocument
          documentType="receipt"
          documentId={id}
          documentNumber={payment.receiptNumber}
          clientName={invoice?.clientName || ''}
          clientEmail={invoice?.clientEmail || ''}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Receipt #{payment.receiptNumber}
            </h1>
            <div className="flex items-center mt-1">
              <span className="bg-green-700 text-green-200 px-2 py-1 text-xs rounded-full flex items-center">
                <CheckCircle size={12} className="mr-1" />
                Payment Recorded
              </span>
              <span className="text-gray-400 ml-3">
                Date: {formatDate(payment.date)}
              </span>
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
          <button
            onClick={handleDelete}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">RECEIPT</h2>
            <p className="text-gray-400 mt-1">Company Name</p>
          </div>
          <div className="text-right">
            <div className="bg-green-900/30 border border-green-700 text-green-200 px-3 py-1 rounded-lg inline-block mb-2">
              Payment Confirmed
            </div>
            <p className="text-gray-400">Receipt #: <span className="text-white">{payment.receiptNumber}</span></p>
            <p className="text-gray-400">Date: <span className="text-white">{formatDate(payment.date)}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Payment Details</h3>
            <div className="bg-dark p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-white">
                    {payment.paymentMethod.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
                {payment.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference Number:</span>
                    <span className="text-white">{payment.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-dark-lighter">
                  <span className="text-gray-400 font-semibold">Amount Paid:</span>
                  <span className="text-primary font-bold">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Invoice Information</h3>
            {invoice ? (
              <div className="bg-dark p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Number:</span>
                    <Link to={`/invoices/${invoice._id}`} className="text-primary hover:text-primary-light">
                      {invoice.invoiceNumber}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Client:</span>
                    <span className="text-white">{invoice.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Date:</span>
                    <span className="text-white">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Total:</span>
                    <span className="text-white">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-lighter">
                    <span className="text-gray-400">Invoice Status:</span>
                    <span className={`${
                      invoice.status === 'paid' 
                        ? 'text-green-400' 
                        : invoice.status === 'partially_paid' 
                          ? 'text-blue-400' 
                          : 'text-yellow-400'
                    }`}>
                      {invoice.status === 'paid' 
                        ? 'Paid' 
                        : invoice.status === 'partially_paid' 
                          ? 'Partially Paid' 
                          : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-dark p-4 rounded-lg">
                <p className="text-gray-400">No invoice information available</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dark-lighter pt-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Payment Summary</h3>
            <span className="text-green-400 font-semibold">{formatCurrency(payment.amount)}</span>
          </div>
          
          <div className="bg-dark p-4 rounded-lg">
            <div className="flex flex-col items-center">
              <p className="text-gray-400 mb-2">This payment was received from:</p>
              <p className="text-white font-medium">{invoice ? invoice.clientName : 'Client'}</p>
              
              <div className="w-full my-6 border-t border-dark-lighter"></div>
              
              <div className="border-b border-primary w-48 text-center pb-2 mb-1">
                <p className="text-white">Authorized Signature</p>
              </div>
              <p className="text-gray-500 text-sm">Company Representative</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {payment.notes && (
        <div className="bg-dark-light rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <p className="text-gray-300 whitespace-pre-line">{payment.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentDetail;