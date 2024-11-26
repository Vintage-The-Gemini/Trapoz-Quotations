// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { FileText, DollarSign, Users, TrendingUp } from 'lucide-react';
import { getQuotations } from '../../services/quotationService';


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalAmount: 0,
    monthlyQuotations: [],
    recentQuotations: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getQuotations();
      // Process the data
      const quotations = response.data;
      setStats({
        totalQuotations: quotations.length,
        totalAmount: quotations.reduce((sum, q) => sum + q.totalAmount, 0),
        recentQuotations: quotations.slice(0, 5)
      });
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-light rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Quotations</p>
              <h4 className="text-2xl font-bold text-white">
                {stats.totalQuotations}
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-dark-light rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Amount</p>
              <h4 className="text-2xl font-bold text-white">
                KSH {stats.totalAmount.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotations */}
      <div className="bg-dark-light rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Quotations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-lighter">
              {stats.recentQuotations.map((quote) => (
                <tr key={quote._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {quote.quoteNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {quote.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    KSH {quote.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;