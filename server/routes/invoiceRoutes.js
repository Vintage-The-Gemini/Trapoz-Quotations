// server/routes/invoiceRoutes.js
import express from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
} from "../controllers/invoiceController.js";

const router = express.Router();

// Get all invoices
router.get("/", getInvoices);

// Get single invoice by ID
router.get("/:id", getInvoiceById);

// Create a new invoice
router.post("/", createInvoice);

// Update invoice
router.put("/:id", updateInvoice);

// Delete invoice
router.delete("/:id", deleteInvoice);

// Download invoice PDF
router.get("/:id/download", downloadInvoicePDF);

export default router;
