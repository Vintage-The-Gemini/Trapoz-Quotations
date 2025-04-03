// frontend/src/services/clientService.js
import api from './api';

// Get all clients
export const getClients = () => api.get('/clients');

// Get client by ID
export const getClientById = (id) => api.get(`/clients/${id}`);

// Create new client
export const createClient = (client) => api.post('/clients', client);

// Update client
export const updateClient = (id, client) => api.put(`/clients/${id}`, client);

// Delete client
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Get client statement
export const getClientStatement = (id, startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  return api.get(`/clients/${id}/statement`, { params });
};

// Download client statement PDF
export const downloadClientStatement = (id, startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  return api.get(`/clients/${id}/statement/download`, { 
    params,
    responseType: 'blob'
  });
};