// frontend/src/services/invoiceService.js
import api from "./api";

// Get all invoices
export const getInvoices = () => api.get("/invoices");

// Get invoice by ID
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);

// Create new invoice (from LPO)
export const createInvoice = (invoiceData) =>
  api.post("/invoices", invoiceData);

// Update invoice
export const updateInvoice = (id, invoiceData) =>
  api.put(`/invoices/${id}`, invoiceData);

// Delete invoice
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// Download invoice as PDF
export const downloadInvoicePDF = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: "blob",
    });

    // Create a link to download the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response;
  } catch (error) {
    console.error("PDF download error:", error);
    throw error;
  }
};
