// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, ListOrdered } from 'lucide-react';
import * as quotationService from '../services/quotationService';

const Home = () => {
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalAmount: 0,
    recentQuotations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await quotationService.getQuotations();
      const quotations = response.data || [];
      
      setStats({
        totalQuotations: quotations.length,
        totalAmount: quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0),
        recentQuotations: quotations.slice(0, 5)
      });
    } catch (error) {
      setError(error.message);
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="bg-dark-light py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Quotation Management System
            </h1>
            <p className="text-xl text-gray-400">
              Create and manage professional quotations efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/quotation/create" 
            className="bg-dark-light p-6 rounded-lg hover:bg-dark-lighter transition-colors transform hover:scale-105 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <PlusCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create New Quotation</h3>
              <p className="text-gray-400">Generate a new quotation for your clients</p>
            </div>
          </Link>

          <Link to="/quotations" 
            className="bg-dark-light p-6 rounded-lg hover:bg-dark-lighter transition-colors transform hover:scale-105 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">View Quotations</h3>
              <p className="text-gray-400">Access and manage all quotations</p>
            </div>
          </Link>

          <Link to="/admin/items" 
            className="bg-dark-light p-6 rounded-lg hover:bg-dark-lighter transition-colors transform hover:scale-105 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <ListOrdered className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manage Items</h3>
              <p className="text-gray-400">Configure quotation items and pricing</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Quotations */}
      {stats.recentQuotations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Quotations</h2>
          <div className="bg-dark-light rounded-lg overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-dark border-b border-dark-lighter">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-lighter">
                  {stats.recentQuotations.map((quote) => (
                    <tr key={quote._id} className="hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/quotations/${quote._id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {quote.quoteNumber || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {quote.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                        KSH {quote.totalAmount?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;