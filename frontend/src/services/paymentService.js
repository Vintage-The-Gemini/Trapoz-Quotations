// frontend/src/services/paymentService.js
import api from './api';

// Get all payments
export const getPayments = () => api.get('/payments');

// Get payment by ID
export const getPaymentById = (id) => api.get(`/payments/${id}`);

// Get payments by invoice
export const getPaymentsByInvoice = (invoiceId) => api.get(`/payments/invoice/${invoiceId}`);

// Record a new payment
export const recordPayment = (paymentData) => api.post('/payments', paymentData);

// Update payment
export const updatePayment = (id, paymentData) => api.put(`/payments/${id}`, paymentData);

// Delete payment
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Download receipt PDF
export const downloadReceiptPDF = async (id) => {
  try {
    const response = await api.get(`/payments/${id}/receipt`, { 
      responseType: 'blob' 
    });
    
    // Create a link to download the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
};

// Get payment statistics
export const getPaymentStats = () => api.get('/payments/stats');