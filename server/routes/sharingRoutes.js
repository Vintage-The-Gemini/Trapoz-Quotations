// server/routes/sharingRoutes.js
import express from 'express';
import { shareDocument } from '../controllers/sharingController.js';

const router = express.Router();

// Share document via email
router.post('/', shareDocument);

export default router;