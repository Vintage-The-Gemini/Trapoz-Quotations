// frontend/src/services/quotationService.js
import api from './api';
import axios from 'axios';  // Make sure to import axios

export const getQuotations = () => api.get('/quotations');
export const createQuotation = (quotation) => api.post('/quotations', quotation);
export const getQuotationById = (id) => api.get(`/quotations/${id}`);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}`);
export const updateQuotation = (id, data) => api.put(`/quotations/${id}`, data);

// New method specifically for status updates
export const updateQuotationStatus = (id, status, notes = null) => {
  const data = { status };
  
  // Add notes if provided
  if (notes) {
    data.notes = notes;
  }
  
  return api.put(`/quotations/${id}`, data);
};

export const downloadPDF = async (id) => {
  try {
    const response = await axios.get(`/api/quotations/${id}/download`, { 
      responseType: 'blob' 
    });
    
    // Create a link to download the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quotation-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
};