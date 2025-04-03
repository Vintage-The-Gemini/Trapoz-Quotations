// server/controllers/sharingController.js
import Quotation from '../models/Quotation.js';
import LPO from '../models/LPO.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import DeliveryNote from '../models/DeliveryNote.js';
import { 
  generateQuotationPDF, 
  generateLPOPDF, 
  generateInvoicePDF, 
  generateReceiptPDF, 
  generateDeliveryNotePDF 
} from '../utils/pdfGenerator.js';
import { sendDocumentEmail } from '../services/emailService.js';
import fs from 'fs';
import path from 'path';

// Share document via email
export const shareDocument = async (req, res) => {
  try {
    const { documentType, documentId, recipientEmail, recipientName, message } = req.body;
    
    if (!documentType || !documentId || !recipientEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate document type
    const validTypes = ['quotation', 'lpo', 'invoice', 'receipt', 'delivery-note'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    
    // Get document and generate PDF
    let document, pdfPath, emailSubject, documentNumber;
    
    switch (documentType) {
      case 'quotation':
        document = await Quotation.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Quotation not found' });
        pdfPath = await generateQuotationPDF(document);
        emailSubject = `Quotation: ${document.quoteNumber}`;
        documentNumber = document.quoteNumber;
        break;
        
      case 'lpo':
        document = await LPO.findById(documentId);
        if (!document) return res.status(404).json({ message: 'LPO not found' });
        pdfPath = await generateLPOPDF(document);
        emailSubject = `Local Purchase Order: ${document.lpoNumber}`;
        documentNumber = document.lpoNumber;
        break;
        
      case 'invoice':
        document = await Invoice.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Invoice not found' });
        pdfPath = await generateInvoicePDF(document);
        emailSubject = `Invoice: ${document.invoiceNumber}`;
        documentNumber = document.invoiceNumber;
        break;
        
      case 'receipt':
        document = await Payment.findById(documentId).populate('invoice');
        if (!document) return res.status(404).json({ message: 'Receipt not found' });
        pdfPath = await generateReceiptPDF(document);
        emailSubject = `Receipt: ${document.receiptNumber}`;
        documentNumber = document.receiptNumber;
        break;
        
      case 'delivery-note':
        document = await DeliveryNote.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Delivery Note not found' });
        pdfPath = await generateDeliveryNotePDF(document);
        emailSubject = `Delivery Note: ${document.deliveryNumber}`;
        documentNumber = document.deliveryNumber;
        break;
    }
    
    // Send email via email service
    await sendDocumentEmail({
      documentType,
      documentNumber,
      recipientEmail,
      recipientName,
      message,
      attachmentPath: pdfPath
    });
    
    // Delete temporary PDF file
    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Error deleting temp PDF:', err);
    });
    
    res.json({ success: true, message: `Document shared with ${recipientEmail}` });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ message: error.message });
  }
};