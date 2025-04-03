// frontend/src/pages/payment/RecordPayment.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Info, Receipt } from 'lucide-react';
import * as invoiceService from '../../services/invoiceService';
import * as paymentService from '../../services/paymentService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    } else {
      setLoading(false);
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoiceById(invoiceId);
      const invoiceData = response.data;
      
      setInvoice(invoiceData);
      
      setFormData(prev => ({
        ...prev,
        invoiceId: invoiceData._id,
        amount: invoiceData.balance || invoiceData.totalAmount
      }));
      
      setError(null);
    } catch (error) {
      setError('Failed to fetch invoice details');
      toast.error('Error loading invoice information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invoice) {
      toast.error('Please select an invoice');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (formData.amount > invoice.balance) {
      toast.error('Payment amount cannot exceed the remaining balance');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await paymentService.recordPayment(formData);
      toast.success('Payment recorded successfully');
      
      // Navigate to the receipt page
      navigate(`/payments/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to record payment');
      console.error('Error recording payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          Record Payment
        </h1>
      </div>

      {error ? (
        <Error message={error} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Selection Section */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
            
            {!invoice ? (
              <div className="bg-dark p-4 rounded-lg text-center">
                <p className="text-gray-400 mb-4">Please select an invoice to record a payment for.</p>
                <button
                  type="button"
                  onClick={() => navigate('/invoices')}
                  className="btn btn-primary"
                >
                  Select Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-dark p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                      <p className="text-gray-400">Client: {invoice.clientName}</p>
                      <p className="text-gray-400">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Total Amount:</p>
                      <p className="text-white font-bold text-lg">{formatCurrency(invoice.totalAmount)}</p>
                      <p className="text-gray-400">Balance Due:</p>
                      <p className="text-primary font-bold text-lg">{formatCurrency(invoice.balance)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-4 rounded-lg flex items-start">
                  <Info size={20} className="flex-shrink-0 mt-0.5 mr-3" />
                  <p className="text-sm">
                    This payment will be recorded against Invoice #{invoice.invoiceNumber} for {invoice.clientName}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          {invoice && (
            <>
              <div className="bg-dark-light rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">KSH</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        className="input pl-14 w-full"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        max={invoice.balance}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="paymentDate"
                      className="input w-full"
                      value={formData.paymentDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      className="input w-full"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      className="input w-full"
                      value={formData.referenceNumber}
                      onChange={handleInputChange}
                      placeholder="Transaction reference or cheque number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      className="input w-full h-24 resize-none"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes about this payment..."
                    />
                  </div>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="bg-dark-light rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Receipt Preview</h2>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg flex items-center">
                    <Receipt size={16} className="mr-1" />
                    <span className="text-sm">Receipt will be generated automatically</span>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-dark-lighter rounded-lg p-6 bg-dark">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">RECEIPT</h3>
                      <p className="text-gray-400">Company Name</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Receipt #: <span className="text-white">AUTO-GENERATED</span></p>
                      <p className="text-gray-400">Date: <span className="text-white">{new Date(formData.paymentDate).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-400">Received from:</p>
                    <p className="text-white">{invoice.clientName}</p>
                    <p className="text-gray-400 mt-4">For Invoice:</p>
                    <p className="text-white">{invoice.invoiceNumber}</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between py-3 border-t border-b border-dark-lighter">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className="text-white">
                        {formData.paymentMethod.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                    {formData.referenceNumber && (
                      <div className="flex justify-between py-3 border-b border-dark-lighter">
                        <span className="text-gray-400">Reference:</span>
                        <span className="text-white">{formData.referenceNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-dark-lighter font-bold">
                      <span className="text-gray-400">Amount Paid:</span>
                      <span className="text-primary">{formatCurrency(formData.amount)}</span>
                    </div>
                  </div>
                  
                  {formData.notes && (
                    <div className="mb-6">
                      <p className="text-gray-400">Notes:</p>
                      <p className="text-white">{formData.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <div className="border-t border-dark-lighter text-center pt-4 w-48">
                      <p className="text-gray-400 text-sm">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn bg-dark-lighter hover:bg-dark text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={submitting}
                >
                  <Save size={20} />
                  {submitting ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default RecordPayment;