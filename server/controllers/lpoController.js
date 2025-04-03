// server/controllers/lpoController.js
import LPO from '../models/LPO.js';
import Quotation from '../models/Quotation.js';
import Client from '../models/Client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get all LPOs
export const getLPOs = async (req, res) => {
  try {
    const lpos = await LPO.find()
      .populate('quotation')
      .populate('clientId')
      .sort('-receivedDate');
    res.json(lpos);
  } catch (error) {
    console.error('Error fetching LPOs:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single LPO by ID
export const getLPOById = async (req, res) => {
  try {
    const lpo = await LPO.findById(req.params.id)
      .populate('quotation')
      .populate('clientId');
    
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    res.json(lpo);
  } catch (error) {
    console.error('Error fetching LPO:', error);
    res.status(500).json({ message: error.message });
  }
};

// Record a new LPO received from client
export const recordLPO = async (req, res) => {
  try {
    let lpoData;
    
    // Handle multipart form data (with file upload)
    if (req.file) {
      // Parse JSON data from FormData
      lpoData = req.body.lpoData ? JSON.parse(req.body.lpoData) : req.body;
      lpoData.attachmentUrl = `/uploads/lpo/${req.file.filename}`;
    } else {
      // Regular JSON request
      lpoData = req.body;
    }
    
    const { 
      lpoNumber, 
      quotationId, 
      clientId,
      issuedDate, 
      clientName, 
      clientAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      items,
      deliveryAddress,
      additionalNotes
    } = lpoData;
    
    // Check if the LPO number already exists
    const existingLPO = await LPO.findOne({ lpoNumber });
    if (existingLPO) {
      return res.status(400).json({ message: 'LPO with this number already exists' });
    }
    
    // Find the associated quotation if any
    let quotation = null;
    if (quotationId) {
      quotation = await Quotation.findById(quotationId);
      if (!quotation) {
        return res.status(404).json({ message: 'Associated quotation not found' });
      }
    }
    
    // Find or create client if client ID is provided
    let client = null;
    if (clientId) {
      client = await Client.findById(clientId);
    }
    
    // Create LPO data
    const newLpoData = {
      lpoNumber,
      quotation: quotationId,
      clientId: client ? client._id : null,
      issuedDate: new Date(issuedDate),
      clientName,
      clientAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      items,
      deliveryAddress,
      additionalNotes,
      // If file was uploaded, attachmentUrl will be set above
    };
    
    const lpo = new LPO(newLpoData);
    const savedLPO = await lpo.save();
    
    // If there's a quotation, update its status to approved
    if (quotation && quotation.status === 'pending') {
      quotation.status = 'approved';
      await quotation.save();
    }
    
    res.status(201).json(savedLPO);
  } catch (error) {
    console.error('Error recording LPO:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update LPO
export const updateLPO = async (req, res) => {
  try {
    let updates;
    
    // Handle multipart form data (with file upload)
    if (req.file) {
      // Parse JSON data from FormData
      updates = req.body.lpoData ? JSON.parse(req.body.lpoData) : req.body;
      updates.attachmentUrl = `/uploads/lpo/${req.file.filename}`;
      
      // Delete old file if it exists
      const oldLpo = await LPO.findById(req.params.id);
      if (oldLpo && oldLpo.attachmentUrl) {
        const oldFilePath = path.join(process.cwd(), oldLpo.attachmentUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    } else {
      // Regular JSON request
      updates = req.body;
    }
    
    const lpo = await LPO.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    res.json(lpo);
  } catch (error) {
    console.error('Error updating LPO:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete LPO
export const deleteLPO = async (req, res) => {
  try {
    const lpo = await LPO.findById(req.params.id);
    
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    // Delete attachment file if it exists
    if (lpo.attachmentUrl) {
      const filePath = path.join(process.cwd(), lpo.attachmentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await lpo.deleteOne();
    
    res.json({ message: 'LPO deleted successfully' });
  } catch (error) {
    console.error('Error deleting LPO:', error);
    res.status(500).json({ message: error.message });
  }
};

// Change LPO status
export const updateLPOStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['received', 'processing', 'fulfilled', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const lpo = await LPO.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    res.json(lpo);
  } catch (error) {
    console.error('Error updating LPO status:', error);
    res.status(400).json({ message: error.message });
  }
};

// Download LPO PDF
export const downloadLPOPDF = async (req, res) => {
  try {
    const lpo = await LPO.findById(req.params.id)
      .populate('quotation');
    
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    // Generate PDF (implementation would be in utils/pdfGenerator.js)
    // ...
    
    res.status(200).json({ message: 'PDF download endpoint (to be implemented)' });
  } catch (error) {
    console.error('Error downloading LPO PDF:', error);
    res.status(500).json({ message: error.message });
  }
};