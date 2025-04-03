// frontend/src/components/quotation/QuotationApproval.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as quotationService from '../../services/quotationService';

const QuotationApproval = ({ quotation, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (quotation.status !== 'pending') {
    return null;
  }

  const handleApprove = async () => {
    try {
      setLoading(true);
      // We're only sending the status update, not the entire quotation
      const response = await quotationService.updateQuotationStatus(quotation._id, 'approved');
      toast.success('Quotation approved successfully');
      
      // Pass the updated quotation to the parent component
      if (onStatusChange && response.data) {
        onStatusChange(response.data);
      }
    } catch (error) {
      toast.error('Failed to approve quotation');
      console.error('Error approving quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      const response = await quotationService.updateQuotationStatus(
        quotation._id, 
        'rejected',
        rejectionReason
      );
      
      toast.success('Quotation rejected');
      setShowRejectForm(false);
      
      // Pass the updated quotation to the parent component
      if (onStatusChange && response.data) {
        onStatusChange(response.data);
      }
    } catch (error) {
      toast.error('Failed to reject quotation');
      console.error('Error rejecting quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-light rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Quotation Status</h2>
        <span className="px-3 py-1 text-sm rounded-full bg-yellow-700 text-yellow-200">
          Pending Approval
        </span>
      </div>

      {showRejectForm ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Reason for Rejection
            </label>
            <textarea
              className="input w-full h-24 resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejecting this quotation..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRejectForm(false)}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              disabled={loading}
            >
              <X size={18} />
              Confirm Rejection
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-500 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-white">This quotation requires your approval before proceeding.</p>
              <p className="text-gray-400 text-sm mt-1">
                After approval, you can create a proforma invoice or an LPO if the client provides one.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowRejectForm(true)}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <X size={18} />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Check size={18} />
              Approve
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotationApproval;