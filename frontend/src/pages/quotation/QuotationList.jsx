// src/pages/quotation/QuotationList.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Download,
  Eye,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Share2,
  Edit,
} from "lucide-react";
import * as quotationService from "../../services/quotationService";
import { format } from "date-fns";
import { Loading } from "../../components/shared/Loading";
import { Error } from "../../components/shared/Error";
import { toast } from "react-hot-toast";

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const filterMenuRef = useRef(null);
  const shareModalRef = useRef(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    // Apply filters, search and sorting
    let result = [...quotations];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((q) => q.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      if (dateFilter === "today") {
        result = result.filter((q) => new Date(q.createdAt) >= today);
      } else if (dateFilter === "30days") {
        result = result.filter((q) => new Date(q.createdAt) >= thirtyDaysAgo);
      } else if (dateFilter === "90days") {
        result = result.filter((q) => new Date(q.createdAt) >= ninetyDaysAgo);
      }
    }

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(lowerQuery) ||
          q.clientName.toLowerCase().includes(lowerQuery) ||
          (q.site && q.site.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredQuotations(result);
  }, [quotations, statusFilter, dateFilter, searchQuery, sortConfig]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setIsFilterMenuOpen(false);
      }
      if (
        shareModalRef.current &&
        !shareModalRef.current.contains(event.target)
      ) {
        setIsShareModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    try {
      if (window.confirm("Are you sure you want to delete this quotation?")) {
        await quotationService.deleteQuotation(id);
        toast.success("Quotation deleted successfully");
        fetchQuotations();
      }
    } catch (error) {
      toast.error("Failed to delete quotation");
    }
  };

  const handleDownload = async (id) => {
    try {
      await quotationService.downloadPDF(id);
      toast.success("Quotation downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleShare = (quotation) => {
    setSelectedQuotation(quotation);
    setIsShareModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    if (!email || !selectedQuotation) return;

    try {
      // Simulate API call to share document
      toast.success(`Quotation shared with ${email}`);
      setIsShareModalOpen(false);
    } catch (error) {
      toast.error("Failed to share quotation");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "rejected":
        return <AlertCircle size={16} className="text-red-500" />;
      case "expired":
        return <AlertCircle size={16} className="text-gray-500" />;
      default:
        return <FileText size={16} className="text-primary" />;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Quotations</h1>
            <p className="text-gray-400">Manage all your quotations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/quotations/create"
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>New Quotation</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search quotations..."
              className="bg-dark-light border border-dark-lighter rounded-md py-2 pl-10 pr-4 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="bg-dark-light border border-dark-lighter rounded-md py-2 px-4 text-white flex items-center gap-2"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-light rounded-md shadow-lg z-10 border border-dark-lighter">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      className="input w-full"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <select
                      className="input w-full"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-dark-lighter p-3 flex justify-end">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setDateFilter("all");
                    }}
                    className="text-xs text-primary hover:text-primary-dark"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-dark-light rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-dark border-b border-dark-lighter">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("quoteNumber")}
                      className="flex items-center focus:outline-none"
                    >
                      Quote #
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("clientName")}
                      className="flex items-center focus:outline-none"
                    >
                      Client
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center focus:outline-none"
                    >
                      Date
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("totalAmount")}
                      className="flex items-center focus:outline-none ml-auto"
                    >
                      Amount
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                          className="text-primary hover:text-primary-light font-medium"
                        >
                          {quotation.quoteNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {quotation.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {format(new Date(quotation.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                        KSH {quotation.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            quotation.status === "approved"
                              ? "bg-green-500/20 text-green-500"
                              : quotation.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : quotation.status === "rejected"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-gray-500/20 text-gray-500"
                          }
                        `}
                        >
                          {getStatusIcon(quotation.status)}
                          <span className="ml-1 capitalize">
                            {quotation.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Link
                            to={`/quotations/${quotation._id}`}
                            className="text-blue-500 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/quotations/${quotation._id}/edit`}
                            className="text-green-500 hover:text-green-400"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDownload(quotation._id)}
                            className="text-primary hover:text-primary-light"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleShare(quotation)}
                            className="text-purple-500 hover:text-purple-400"
                            title="Share"
                          >
                            <Share2 size={18} />
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
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No quotations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-dark-light rounded-lg p-6 w-full max-w-md relative"
            ref={shareModalRef}
          >
            <h2 className="text-xl font-bold mb-4 text-white">
              Share Quotation {selectedQuotation.quoteNumber}
            </h2>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="input w-full"
                  placeholder="Enter recipient email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  className="input w-full h-24"
                  placeholder="Add a message..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn bg-dark-lighter hover:bg-dark text-gray-300"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotationList;
