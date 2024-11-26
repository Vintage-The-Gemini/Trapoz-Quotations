// backend/routes/quotationRoutes.js
import express from 'express';
import { 
    getQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    downloadPDF 
} from '../controllers/quotationController.js';

const router = express.Router();

// Base routes
router.route('/')
    .get(getQuotations)
    .post(createQuotation);

// Specific quotation routes
router.route('/:id')
    .get(getQuotationById)
    .put(updateQuotation)
    .delete(deleteQuotation);

// PDF download route
router.get('/:id/download', downloadPDF);

export default router;