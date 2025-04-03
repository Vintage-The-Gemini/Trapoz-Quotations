// frontend/src/pages/quotation/QuotationList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Download,
  Eye,
  Trash2,
  Edit,
  Search,
  Filter,
} from "lucide-react";
import * as quotationService from "../../services/quotationService";
import { toast } from "react-hot-toast";

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotations();
      setQuotations(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch quotations");
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await quotationService.deleteQuotation(id);
        toast.success("Quotation deleted successfully");
        fetchQuotations();
      } catch (error) {
        toast.error("Failed to delete quotation");
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await quotationService.downloadPDF(id);
      toast.success("Quotation downloaded successfully");
    } catch (error) {
      toast.error("Failed to download quotation");
    }
  };

  // Filter quotations based on search term and status filter
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      searchTerm === "" ||
      quotation.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

      {/* Search and Filter */}
      <div className="bg-dark-light p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>
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
                  <th className="px-6 py-3 bg-dark text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
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
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map((quotation) => (
                    <tr
                      key={quotation._id}
                      className="hover:bg-dark-lighter transition-colors"
                    >
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={quotation.status} />
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
                          <Link
                            to={`/quotations/${quotation._id}/edit`}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDownload(quotation._id)}
                            className="text-green-500 hover:text-green-400"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(quotation._id)}
                            className="text-red-500 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "No quotations match your search criteria"
                        : "No quotations found. Create your first quotation!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-700 text-yellow-200";
      case "approved":
        return "bg-green-700 text-green-200";
      case "rejected":
        return "bg-red-700 text-red-200";
      case "expired":
        return "bg-gray-700 text-gray-200";
      case "converted":
        return "bg-purple-700 text-purple-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default QuotationList;
