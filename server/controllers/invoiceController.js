// server/controllers/invoiceController.js
import Invoice from '../models/Invoice.js';
import LPO from '../models/LPO.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import fs from 'fs';
import path from 'path';

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('lpo')
      .populate('quotation')
      .sort('-createdAt');
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('lpo')
      .populate('quotation');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create invoice from an LPO
export const createInvoice = async (req, res) => {
  try {
    const { lpoId } = req.body;
    
    // Find the LPO
    const lpo = await LPO.findById(lpoId).populate('quotation');
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    // Calculate due date (default: 30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Create invoice from LPO data
    const invoiceData = {
      lpo: lpoId,
      quotation: lpo.quotation._id,
      clientName: lpo.clientName,
      clientAddress: lpo.clientAddress,
      dueDate,
      items: lpo.items.map(item => ({
        description: item.description,
        units: item.units,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })),
      subTotal: lpo.subTotal,
      vat: lpo.vat,
      totalAmount: lpo.totalAmount,
      paymentTerms: "Payment due within 30 days of invoice date."
    };
    
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const updates = req.body;
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download invoice as PDF
export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('lpo')
      .populate('quotation');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice);
    
    // Send the file
    res.download(pdfPath, `invoice-${invoice.invoiceNumber}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading PDF' });
      }
      
      // Delete the file after download
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp PDF:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: error.message });
  }
};