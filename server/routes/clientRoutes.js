// server/routes/clientRoutes.js
import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStatement,
  downloadClientStatement
} from '../controllers/clientController.js';

const router = express.Router();

// Get all clients
router.get('/', getClients);

// Get single client by ID
router.get('/:id', getClientById);

// Create a new client
router.post('/', createClient);

// Update client
router.put('/:id', updateClient);

// Delete client
router.delete('/:id', deleteClient);

// Get client statement
router.get('/:id/statement', getClientStatement);

// Download client statement as PDF
router.get('/:id/statement/download', downloadClientStatement);

export default router;