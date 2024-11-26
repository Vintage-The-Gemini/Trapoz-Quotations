// frontend/src/pages/quotation/QuotationDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import * as quotationService from '../../services/quotationService';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error('Error fetching quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quotations/${id}/download`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${quotation.quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await quotationService.deleteQuotation(id);
        navigate('/quotations');
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotations')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            Quotation #{quotation.quoteNumber}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Download PDF
          </button>
          <button
            onClick={() => navigate(`/quotations/${id}/edit`)}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Edit size={20} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 size={20} />
            Delete
          </button>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400">Client Name</p>
            <p className="text-white text-lg">{quotation.clientName}</p>
          </div>
          <div>
            <p className="text-gray-400">Client Address</p>
            <p className="text-white text-lg">{quotation.clientAddress || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Site</p>
            <p className="text-white text-lg">{quotation.site || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="text-white text-lg">
              {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-dark-light rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Items</h2>
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
                  <td className="py-3 px-4">{item.description || item.item?.description}</td>
                  <td className="py-3 px-4">{item.units || item.item?.units}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">
                    KSH {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    KSH {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Items Table */}
      {quotation.customItems && quotation.customItems.length > 0 && (
        <div className="bg-dark-light rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Custom Items</h2>
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
                {quotation.customItems.map((item, index) => (
                  <tr key={index} className="border-b border-dark-lighter">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4">{item.units}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      KSH {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      KSH {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="bg-dark-light rounded-lg p-6">
        <div className="flex flex-col items-end space-y-2">
          <div className="flex justify-between w-64">
            <span className="text-gray-400">Subtotal:</span>
            <span className="text-white">
              KSH {quotation.subTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between w-64">
            <span className="text-gray-400">VAT (16%):</span>
            <span className="text-white">
              KSH {quotation.vat.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-dark-lighter">
            <span className="text-lg font-bold text-gray-400">Total:</span>
            <span className="text-lg font-bold text-primary">
              KSH {quotation.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {quotation.termsAndConditions && (
        <div className="bg-dark-light rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Terms and Conditions</h2>
          <p className="text-gray-400 whitespace-pre-line">
            {quotation.termsAndConditions}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotationDetail;