// server/routes/deliveryNoteRoutes.js
import express from 'express';
import {
  getDeliveryNotes,
  getDeliveryNoteById,
  createDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  markDeliveryNoteAsDelivered,
  downloadDeliveryNotePDF
} from '../controllers/deliveryNoteController.js';

const router = express.Router();

// Get all delivery notes
router.get('/', getDeliveryNotes);

// Get single delivery note by ID
router.get('/:id', getDeliveryNoteById);

// Create a new delivery note
router.post('/', createDeliveryNote);

// Update delivery note
router.put('/:id', updateDeliveryNote);

// Delete delivery note
router.delete('/:id', deleteDeliveryNote);

// Mark delivery note as delivered
router.patch('/:id/deliver', markDeliveryNoteAsDelivered);

// Download delivery note PDF
router.get('/:id/download', downloadDeliveryNotePDF);

export default router;