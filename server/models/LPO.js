// server/models/LPO.js
import mongoose from 'mongoose';

const LPOItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  units: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const LPOSchema = new mongoose.Schema({
  lpoNumber: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  issuedDate: {
    type: Date,
    required: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  clientName: {
    type: String,
    required: true
  },
  clientAddress: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  items: [LPOItemSchema],
  subTotal: {
    type: Number,
    required: true,
    min: 0
  },
  vat: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['received', 'processing', 'fulfilled', 'cancelled'],
    default: 'received'
  },
  deliveryDate: Date,
  deliveryAddress: String,
  additionalNotes: String,
  attachmentUrl: String
}, {
  timestamps: true
});

// Calculate totals before save
LPOSchema.pre('save', function(next) {
  try {
    // Calculate totals from items
    const itemsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Set total amounts
    this.subTotal = itemsTotal;
    this.vat = this.subTotal * 0.16; // 16% VAT
    this.totalAmount = this.subTotal + this.vat;

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('LPO', LPOSchema);