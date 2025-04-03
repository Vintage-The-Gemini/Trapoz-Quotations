// frontend/src/components/quotation/ProformaInvoice.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Download,
  FileText,
  Share,
  FileCheck,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import * as quotationService from "../../services/quotationService";
import ShareDocument from "../shared/ShareDocument";

const ProformaInvoice = ({ quotation }) => {
  const [loading, setLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Only show for approved quotations
  if (quotation.status !== "approved") {
    return null;
  }

  const handleGenerateProforma = async () => {
    try {
      setLoading(true);
      // In a real implementation, this might call a different endpoint
      // For now, we'll just download the quotation PDF as a proforma
      await quotationService.downloadPDF(quotation._id);
      toast.success("Proforma invoice generated successfully");
    } catch (error) {
      toast.error("Failed to generate proforma invoice");
      console.error("Error generating proforma invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isShareModalOpen && (
        <ShareDocument
          documentType="quotation"
          documentId={quotation._id}
          documentNumber={`${quotation.quoteNumber} (Proforma)`}
          clientName={quotation.clientName}
          clientEmail={""}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      <div className="bg-dark-light rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Proforma Invoice</h2>
          <span className="px-3 py-1 text-sm rounded-full bg-green-700 text-green-200">
            Quotation Approved
          </span>
        </div>

        <div className="flex items-start gap-3">
          <AlertCircle className="text-primary mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-white">
              This quotation has been approved and can now be processed.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Generate a proforma invoice to send to the client or record an LPO
              if the client has provided one.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateProforma}
              className="btn bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={18} />
              Generate Proforma
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="btn bg-dark-lighter hover:bg-dark text-gray-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Share size={18} />
              Share Proforma
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/lpos/create?quotationId=${quotation._id}`}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Record Client LPO
            </Link>

            <Link
              to={`/invoices/create?quotationId=${quotation._id}`}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProformaInvoice;