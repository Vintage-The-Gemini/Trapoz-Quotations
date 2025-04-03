// frontend/src/services/deliveryService.js
import api from './api';

// Get all delivery notes
export const getDeliveryNotes = () => api.get('/delivery-notes');

// Get delivery note by ID
export const getDeliveryNoteById = (id) => api.get(`/delivery-notes/${id}`);

// Create a new delivery note
export const createDeliveryNote = (deliveryData) => api.post('/delivery-notes', deliveryData);

// Update delivery note
export const updateDeliveryNote = (id, deliveryData) => api.put(`/delivery-notes/${id}`, deliveryData);

// Delete delivery note
export const deleteDeliveryNote = (id) => api.delete(`/delivery-notes/${id}`);

// Mark delivery note as delivered
export const markDeliveryAsDelivered = (id, deliveryData) => api.patch(`/delivery-notes/${id}/deliver`, deliveryData);

// Download delivery note as PDF
export const downloadDeliveryNotePDF = async (id) => {
  try {
    const response = await api.get(`/delivery-notes/${id}/download`, { 
      responseType: 'blob' 
    });
    
    // Create a link to download the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `delivery-note-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response;
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
};