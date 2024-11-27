// backend/controllers/quotationController.js
import Quotation from '../models/Quotation.js';
import { generateQuotationPDF } from '../utils/pdfGenerator.js';
import fs from 'fs'

// Define your routes here...


// Get all quotations
export const getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find()
            .populate('items.item')
            .sort('-createdAt');
        res.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single quotation
export const getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('items.item');
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json(quotation);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create quotation
export const createQuotation = async (req, res) => {
    try {
        const { 
            clientName, 
            clientAddress, 
            site, 
            items = [], 
            customItems = [], 
            termsAndConditions 
        } = req.body;

        // Combine regular and custom items
        const allItems = [
            ...items.map(item => ({
                ...item,
                isCustomItem: false
            })),
            ...customItems.map(item => ({
                ...item,
                isCustomItem: true
            }))
        ];

        // Calculate totals
        const subTotal = allItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const vat = subTotal * 0.16;
        const totalAmount = subTotal + vat;

        const quotation = new Quotation({
            clientName,
            clientAddress,
            site,
            items: allItems,
            subTotal,
            vat,
            totalAmount,
            termsAndConditions
        });

        const savedQuotation = await quotation.save();
        res.status(201).json(savedQuotation);
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors 
        });
    }
};

// Update quotation
export const updateQuotation = async (req, res) => {
    try {
        console.log('Update Request Body:', req.body); // Debug log

        const quotationData = {
            clientName: req.body.clientName,
            clientAddress: req.body.clientAddress,
            site: req.body.site,
            items: req.body.items.map(item => ({
                item: item.item,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                amount: Number(item.amount),
                description: item.description,
                units: item.units
            })),
            customItems: (req.body.customItems || []).map(item => ({
                description: item.description,
                units: item.units,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                amount: Number(item.amount)
            })),
            subTotal: Number(req.body.subTotal),
            vat: Number(req.body.vat),
            totalAmount: Number(req.body.totalAmount),
            termsAndConditions: req.body.termsAndConditions
        };

        console.log('Processed Quotation Data:', quotationData); // Debug log

        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            quotationData,
            { new: true, runValidators: true }
        );

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        res.json(quotation);
    } catch (error) {
        console.error('Update Error:', error); // Debug log
        res.status(400).json({ 
            message: 'Error updating quotation',
            error: error.message,
            details: error.errors
        });
    }
};
// Delete quotation
export const deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Download PDF
export const downloadPDF = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('items.item');
        
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        // Generate PDF
        const pdfPath = await generateQuotationPDF(quotation);

        // Send the file
        res.download(pdfPath, `quotation-${quotation.quoteNumber}.pdf`, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ message: 'Error downloading PDF' });
            }

            // Optional: Delete the file after download
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp PDF:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).json({ message: error.message });
    }
};