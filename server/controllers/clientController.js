// server/controllers/clientController.js
import Client from '../models/Client.js';
import Quotation from '../models/Quotation.js';
import Invoice from '../models/Invoice.js';
import { generateStatementPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort('name');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single client
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create client
export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    // Check if client has quotations or invoices
    const quotationsCount = await Quotation.countDocuments({ clientId: req.params.id });
    const invoicesCount = await Invoice.countDocuments({ clientId: req.params.id });
    
    if (quotationsCount > 0 || invoicesCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete client with existing quotations or invoices' 
      });
    }
    
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get client statement
export const getClientStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    
    const statement = await client.getStatement(parsedStartDate, parsedEndDate);
    
    res.json(statement);
  } catch (error) {
    console.error('Error fetching client statement:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download client statement as PDF
export const downloadClientStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    
    const statement = await client.getStatement(parsedStartDate, parsedEndDate);
    
    // Generate PDF
    const pdfPath = await generateStatementPDF(client, statement.transactions);
    
    // Send the file
    res.download(pdfPath, `statement-${client.name.replace(/\s+/g, '-')}.pdf`, (err) => {
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
    console.error('Error downloading client statement:', error);
    res.status(500).json({ message: error.message });
  }
};