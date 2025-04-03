// frontend/src/pages/invoice/InvoiceDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, CreditCard, Share, Trash2 } from 'lucide-react';
import * as invoiceService from '../../services/invoiceService';
import * as paymentService from '../../services/paymentService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency, formatDate } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';
import ShareDocument from '../../components/shared/ShareDocument';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      // Fetch invoice details
      const invoiceResponse = await invoiceService.getInvoiceById(id);
      setInvoice(invoiceResponse.data);
      
      // Fetch payments for this invoice
      const paymentsResponse = await paymentService.getPaymentsByInvoice(id);
      setPayments(paymentsResponse.data);
      
      setError(null);
    } catch (error) {
      setError('Failed to fetch invoice details');
      toast.error('Error loading invoice information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await invoiceService.downloadInvoicePDF(id);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(id);
        toast.success('Invoice deleted successfully');
        navigate('/invoices');
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

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

  if (error) {
    return <Error message={error} />;
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDocument
          documentType="invoice"
          documentId={id}
          documentNumber={invoice.invoiceNumber}
          clientName={invoice.clientName}
          clientEmail={invoice.clientEmail}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <p className="text-gray-400">
              {getStatusBadge(invoice.status)} • Date: {formatDate(invoice.date)}
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
          {invoice.status !== 'paid' && (
            <Link
              to={`/payments/create?invoiceId=${id}`}
              className="btn btn-primary flex items-center gap-2"
            >
              <CreditCard size={18} />
              Record Payment
            </Link>
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

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Details</h2>
          <div className="space-y-2">
            <p className="text-white font-medium">{invoice.clientName}</p>
            {invoice.clientAddress && (
              <p className="text-gray-400 whitespace-pre-line">{invoice.clientAddress}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Invoice Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Invoice Date:</span>
              <span className="text-white">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Due Date:</span>
              <span className="text-white">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.lpo && (
              <div className="flex justify-between">
                <span className="text-gray-400">LPO Number:</span>
                <Link to={`/lpos/${invoice.lpo._id}`} className="text-primary hover:text-primary-light">
                  {invoice.lpo.lpoNumber}
                </Link>
              </div>
            )}
            {invoice.paymentTerms && (
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Terms:</span>
                <span className="text-white">{invoice.paymentTerms}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-white font-medium">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Paid:</span>
              <span className="text-green-400">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dark-lighter">
              <span className="text-gray-400 font-medium">Balance:</span>
              <span className={`font-medium ${invoice.balance > 0 ? 'text-primary' : 'text-green-400'}`}>
                {formatCurrency(invoice.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invoice Items</h2>
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
              {invoice.items.map((item, index) => (
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
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(invoice.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">VAT (16%)</td>
                <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(invoice.vat)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total</td>
                <td className="text-right py-3 px-4 font-medium text-primary">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-dark-light rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Payment History</h2>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-dark">
                  <th className="text-left py-3 px-4 text-gray-400">Receipt #</th>
                  <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Method</th>
                  <th className="text-left py-3 px-4 text-gray-400">Reference</th>
                  <th className="text-right py-3 px-4 text-gray-400">Amount</th>
                  <th className="text-center py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-dark-lighter">
                    <td className="py-3 px-4">
                      <Link to={`/payments/${payment._id}`} className="text-primary hover:text-primary-light">
                        {payment.receiptNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{formatDate(payment.date)}</td>
                    <td className="py-3 px-4">
                      {payment.paymentMethod.replace(/_/g, ' ').split(' ').map(
                        word => word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </td>
                    <td className="py-3 px-4">{payment.referenceNumber || 'N/A'}</td>
                    <td className="py-3 px-4 text-right text-green-400">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={async () => {
                          try {
                            await paymentService.downloadReceiptPDF(payment._id);
                            toast.success('Receipt downloaded successfully');
                          } catch (error) {
                            toast.error('Failed to download receipt');
                          }
                        }}
                        className="text-yellow-500 hover:text-yellow-400"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total Paid</td>
                  <td className="text-right py-3 px-4 font-medium text-green-400">
                    {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No payments recorded for this invoice.</p>
            {invoice.status !== 'paid' && (
              <Link
                to={`/payments/create?invoiceId=${id}`}
                className="btn btn-primary mt-4 inline-flex items-center gap-2"
              >
                <CreditCard size={18} />
                Record Payment
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-dark-light rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <p className="text-gray-300 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;