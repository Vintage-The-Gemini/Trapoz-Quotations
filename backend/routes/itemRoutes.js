// backend/routes/itemRoutes.js
import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);
router.post('/bulk', itemController.bulkCreateItems);


export default router;