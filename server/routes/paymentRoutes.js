// server/routes/paymentRoutes.js
import express from 'express';
import {
  getPayments,
  getPaymentById,
  getPaymentsByInvoice,
  recordPayment,
  updatePayment,
  deletePayment,
  downloadReceiptPDF
} from '../controllers/paymentController.js';

const router = express.Router();

// Get all payments
router.get('/', getPayments);

// Get single payment by ID
router.get('/:id', getPaymentById);

// Get payments by invoice ID
router.get('/invoice/:invoiceId', getPaymentsByInvoice);

// Record a new payment
router.post('/', recordPayment);

// Update payment
router.put('/:id', updatePayment);

// Delete payment
router.delete('/:id', deletePayment);

// Download receipt PDF
router.get('/:id/receipt', downloadReceiptPDF);

export default router;