// server/controllers/deliveryNoteController.js
import DeliveryNote from '../models/DeliveryNote.js';
import LPO from '../models/LPO.js';
import { generateDeliveryNotePDF } from '../utils/pdfGenerator.js';
import fs from 'fs';
import path from 'path';

// Get all delivery notes
export const getDeliveryNotes = async (req, res) => {
  try {
    const deliveryNotes = await DeliveryNote.find()
      .populate('lpo')
      .sort('-createdAt');
    res.json(deliveryNotes);
  } catch (error) {
    console.error('Error fetching delivery notes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single delivery note by ID
export const getDeliveryNoteById = async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id)
      .populate('lpo');
    
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }
    
    res.json(deliveryNote);
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create delivery note from an LPO
export const createDeliveryNote = async (req, res) => {
  try {
    const { lpoId, vehicleDetails, driverName, driverContact, items } = req.body;
    
    // Find the LPO
    const lpo = await LPO.findById(lpoId);
    if (!lpo) {
      return res.status(404).json({ message: 'LPO not found' });
    }
    
    // Prepare delivery items
    const deliveryItems = items || lpo.items.map(item => ({
      description: item.description,
      units: item.units,
      quantity: item.quantity,
      remarks: ''
    }));
    
    // Create delivery note data
    const deliveryNoteData = {
      lpo: lpoId,
      clientName: lpo.clientName,
      clientAddress: lpo.clientAddress,
      deliveryAddress: lpo.deliveryAddress || lpo.clientAddress,
      items: deliveryItems,
      vehicleDetails,
      driverName,
      driverContact
    };
    
    const deliveryNote = new DeliveryNote(deliveryNoteData);
    const savedDeliveryNote = await deliveryNote.save();
    
    // Update LPO status if not already updated
    if (lpo.status === 'received' || lpo.status === 'processing') {
      lpo.status = 'processing';
      await lpo.save();
    }
    
    res.status(201).json(savedDeliveryNote);
  } catch (error) {
    console.error('Error creating delivery note:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update delivery note
export const updateDeliveryNote = async (req, res) => {
  try {
    const updates = req.body;
    
    const deliveryNote = await DeliveryNote.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }
    
    res.json(deliveryNote);
  } catch (error) {
    console.error('Error updating delivery note:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete delivery note
export const deleteDeliveryNote = async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findByIdAndDelete(req.params.id);
    
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }
    
    res.json({ message: 'Delivery note deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery note:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark delivery note as delivered
export const markDeliveryNoteAsDelivered = async (req, res) => {
  try {
    const { receivedBy, receiverPosition, notes } = req.body;
    
    // Validate required fields
    if (!receivedBy) {
      return res.status(400).json({ message: 'Receiver name is required' });
    }
    
    const deliveryNote = await DeliveryNote.findById(req.params.id);
    
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }
    
    // Update delivery note
    deliveryNote.status = 'delivered';
    deliveryNote.receivedBy = receivedBy;
    deliveryNote.receiverPosition = receiverPosition;
    deliveryNote.receivedDate = new Date();
    if (notes) deliveryNote.notes = notes;
    
    const updatedDeliveryNote = await deliveryNote.save();
    
    // Update the LPO status
    const lpo = await LPO.findById(deliveryNote.lpo);
    if (lpo) {
      lpo.status = 'fulfilled';
      lpo.deliveryDate = deliveryNote.receivedDate;
      await lpo.save();
    }
    
    res.json(updatedDeliveryNote);
  } catch (error) {
    console.error('Error marking delivery note as delivered:', error);
    res.status(400).json({ message: error.message });
  }
};

// Download delivery note as PDF
export const downloadDeliveryNotePDF = async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id)
      .populate('lpo');
    
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }
    
    // Generate PDF
    const pdfPath = await generateDeliveryNotePDF(deliveryNote);
    
    // Send the file
    res.download(pdfPath, `delivery-note-${deliveryNote.deliveryNumber}.pdf`, (err) => {
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
    console.error('Error downloading delivery note PDF:', error);
    res.status(500).json({ message: error.message });
  }
};