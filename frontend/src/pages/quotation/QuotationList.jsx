// frontend/src/pages/quotation/QuotationList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Download, Eye, Trash2 } from 'lucide-react';
import * as quotationService from '../../services/quotationService';
import { toast } from 'react-hot-toast';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await quotationService.getQuotations();
      setQuotations(response.data);
    } catch (error) {
      setError('Failed to fetch quotations');
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await quotationService.deleteQuotation(id);
      toast.success('Quotation deleted successfully');
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await quotationService.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Quotations</h1>
        <Link
          to="/quotation/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={20} />
          New Quotation
        </Link>
      </div>

      {error ? (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-dark-light rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-lighter">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-dark text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 bg-dark text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-lighter">
                {quotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-dark-lighter transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/quotations/${quotation._id}`}
                        className="text-primary hover:text-primary-light"
                      >
                        {quotation.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {quotation.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                      KSH {quotation.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/quotations/${quotation._id}`}
                          className="text-blue-500 hover:text-blue-400"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDownload(quotation._id)}
                          className="text-green-500 hover:text-green-400"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this quotation?')) {
                              handleDelete(quotation._id);
                            }
                          }}
                          className="text-red-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList;