// server/controllers/paymentController.js
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { generateReceiptPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';
import path from 'path';

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'invoice',
        populate: {
          path: 'lpo quotation'
        }
      })
      .sort('-createdAt');
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get payments by invoice ID
export const getPaymentsByInvoice = async (req, res) => {
  try {
    const payments = await Payment.find({ invoice: req.params.invoiceId })
      .sort('-createdAt');
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'invoice',
        populate: {
          path: 'lpo quotation'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Record a payment for an invoice
export const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, referenceNumber, notes, receivedBy } = req.body;
    
    // Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if payment amount is valid
    if (amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }
    
    if (amount > invoice.balance) {
      return res.status(400).json({ message: 'Payment amount cannot exceed the invoice balance' });
    }
    
    // Create payment
    const payment = new Payment({
      invoice: invoiceId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      receivedBy
    });
    
    const savedPayment = await payment.save();
    
    // Update invoice (this is handled in the Payment model post-save hook)
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    // Store the original payment to calculate difference
    const originalPayment = await Payment.findById(req.params.id);
    if (!originalPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const { amount, paymentMethod, referenceNumber, notes, receivedBy } = req.body;
    
    // If amount changed, check if new amount is valid
    if (amount !== originalPayment.amount) {
      const amountDifference = amount - originalPayment.amount;
      
      // Find the invoice
      const invoice = await Invoice.findById(originalPayment.invoice);
      
      // If increasing amount, check if it exceeds balance
      if (amountDifference > 0 && amountDifference > invoice.balance) {
        return res.status(400).json({ 
          message: 'The new payment amount would exceed the invoice balance'
        });
      }
      
      // Update invoice amountPaid and balance
      invoice.amountPaid += amountDifference;
      invoice.balance = invoice.totalAmount - invoice.amountPaid;
      
      // Update status based on payment
      if (invoice.amountPaid === 0) {
        invoice.status = 'unpaid';
      } else if (invoice.amountPaid < invoice.totalAmount) {
        invoice.status = 'partially_paid';
      } else {
        invoice.status = 'paid';
      }
      
      // Check if overdue but not fully paid
      if (invoice.dueDate < new Date() && invoice.status !== 'paid') {
        invoice.status = 'overdue';
      }
      
      await invoice.save();
    }
    
    // Update payment
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, paymentMethod, referenceNumber, notes, receivedBy },
      { new: true, runValidators: true }
    );
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update invoice
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      // Subtract payment amount
      invoice.amountPaid -= payment.amount;
      invoice.balance = invoice.totalAmount - invoice.amountPaid;
      
      // Update status
      if (invoice.amountPaid === 0) {
        invoice.status = 'unpaid';
      } else if (invoice.amountPaid < invoice.totalAmount) {
        invoice.status = 'partially_paid';
      } else {
        invoice.status = 'paid';
      }
      
      // Check if overdue but not fully paid
      if (invoice.dueDate < new Date() && invoice.status !== 'paid') {
        invoice.status = 'overdue';
      }
      
      await invoice.save();
    }
    
    await payment.deleteOne();
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download receipt as PDF
export const downloadReceiptPDF = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'invoice',
        populate: {
          path: 'lpo quotation'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Generate PDF
    const pdfPath = await generateReceiptPDF(payment);
    
    // Send the file
    res.download(pdfPath, `receipt-${payment.receiptNumber}.pdf`, (err) => {
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
    console.error('Error downloading receipt PDF:', error);
    res.status(500).json({ message: error.message });
  }
};