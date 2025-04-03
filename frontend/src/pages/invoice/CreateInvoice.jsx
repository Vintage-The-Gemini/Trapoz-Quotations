// frontend/src/pages/invoice/CreateInvoice.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Info } from 'lucide-react';
import * as lpoService from '../../services/lpoService';
import * as invoiceService from '../../services/invoiceService';
import { Loading } from '../../components/shared/Loading';
import { Error } from '../../components/shared/Error';
import { formatCurrency } from '../../utils/fomatters';
import { toast } from 'react-hot-toast';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lpos, setLpos] = useState([]);
  const [selectedLpo, setSelectedLpo] = useState(null);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days of invoice date.');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchLpos();
    
    // Set default due date (30 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const fetchLpos = async () => {
    try {
      setLoading(true);
      const response = await lpoService.getLPOs();
      // Filter LPOs that have been fulfilled but don't have an invoice yet
      const eligibleLpos = response.data.filter(lpo => 
        lpo.status === 'fulfilled' || lpo.status === 'processing'
      );
      setLpos(eligibleLpos);
      setError(null);
    } catch (error) {
      setError('Failed to fetch eligible LPOs');
      toast.error('Failed to load LPOs');
    } finally {
      setLoading(false);
    }
  };

  const handleLpoSelect = (lpoId) => {
    const lpo = lpos.find(lpo => lpo._id === lpoId);
    setSelectedLpo(lpo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLpo) {
      toast.error('Please select an LPO');
      return;
    }

    try {
      setSubmitting(true);
      
      const invoiceData = {
        lpoId: selectedLpo._id,
        dueDate,
        paymentTerms,
        notes
      };

      const response = await invoiceService.createInvoice(invoiceData);
      toast.success('Invoice created successfully');
      navigate(`/invoices/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error('Error creating invoice:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/invoices')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          Create New Invoice
        </h1>
      </div>

      {error ? (
        <Error message={error} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* LPO Selection */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select LPO</h2>
            
            {lpos.length === 0 ? (
              <div className="bg-dark rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-4">No eligible LPOs found for invoicing.</p>
                <p className="text-gray-500 text-sm mb-4">
                  Create an LPO first or check if existing LPOs are ready for invoicing.
                </p>
                <Link to="/lpos/create" className="btn btn-primary">
                  Create New LPO
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Information note */}
                <div className="bg-blue-900/30 border border-blue-700 text-blue-200 p-4 rounded-lg flex items-start">
                  <Info size={20} className="flex-shrink-0 mt-0.5 mr-3" />
                  <p className="text-sm">
                    Select an LPO to generate an invoice. The invoice will include all items from the selected LPO.
                  </p>
                </div>
                
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                  {lpos.map((lpo) => (
                    <div
                      key={lpo._id}
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        selectedLpo?._id === lpo._id
                          ? 'border-primary bg-primary/10'
                          : 'border-dark-lighter hover:border-primary/50'
                      }`}
                      onClick={() => handleLpoSelect(lpo._id)}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-white">LPO #{lpo.lpoNumber}</h3>
                        <span className="text-sm text-gray-400">
                          Date: {new Date(lpo.issuedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Client: {lpo.clientName}</span>
                        <span className="text-primary font-medium">{formatCurrency(lpo.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          {lpo.items.length} {lpo.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lpo.status === 'fulfilled' 
                            ? 'bg-green-700 text-green-200' 
                            : 'bg-yellow-700 text-yellow-200'
                        }`}>
                          {lpo.status === 'fulfilled' ? 'Fulfilled' : 'Processing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="bg-dark-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  className="input w-full"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Issue date is set to today by default
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="input w-full"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  className="input w-full h-24 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this invoice..."
                />
              </div>
            </div>
          </div>

          {/* Preview if LPO is selected */}
          {selectedLpo && (
            <div className="bg-dark-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Invoice Preview</h2>
              
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
                    {selectedLpo.items.map((item, index) => (
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
                      <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(selectedLpo.subTotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">VAT (16%)</td>
                      <td className="text-right py-3 px-4 font-medium text-white">{formatCurrency(selectedLpo.vat)}</td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-right py-3 px-4 font-medium text-gray-400">Total</td>
                      <td className="text-right py-3 px-4 font-medium text-primary">{formatCurrency(selectedLpo.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={!selectedLpo || submitting}
            >
              <Save size={20} />
              Create Invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateInvoice;