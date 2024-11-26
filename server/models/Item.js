// backend/models/Item.js
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  itemNo: {
    type: Number,
    required: false  // Changed to false to allow sub-items
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Transport', 'Equipment', 'Labour', 'Auxiliaries',]
  },
  units: String,
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isParent: {
    type: Boolean,
    default: false
  },
  parentNo: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Item', ItemSchema);