// frontend/src/services/lpoService.js
import api from './api';

// Get all LPOs
export const getLPOs = () => api.get('/lpos');

// Get LPO by ID
export const getLPOById = (id) => api.get(`/lpos/${id}`);

// Create a new LPO
export const createLPO = (lpoData) => api.post('/lpos', lpoData);

// Update LPO
export const updateLPO = (id, lpoData) => api.put(`/lpos/${id}`, lpoData);

// Delete LPO
export const deleteLPO = (id) => api.delete(`/lpos/${id}`);

// Update LPO status
export const updateLPOStatus = (id, status) => api.patch(`/lpos/${id}/status`, { status });

// Upload LPO attachment
export const uploadLPOAttachment = (id, file) => {
  const formData = new FormData();
  formData.append('attachment', file);
  
  return api.post(`/lpos/${id}/attachment`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Download LPO as PDF
export const downloadLPOPDF = async (id) => {
  try {
    const response = await api.get(`/lpos/${id}/download`, { 
      responseType: 'blob' 
    });
    
    // Create a link to download the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lpo-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
};