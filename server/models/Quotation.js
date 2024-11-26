// backend/models/Quotation.js
import mongoose from 'mongoose';

const QuotationItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false // Changed to false to allow custom items
  },
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
  },
  isCustomItem: {
    type: Boolean,
    default: false
  }
});

const QuotationSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  clientName: {
    type: String,
    required: true
  },
  clientAddress: String,
  site: String,
  items: [QuotationItemSchema],
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
  termsAndConditions: {
    type: String,
    default: "1. Payment terms: 30 days\n2. Validity: 30 days\n3. VAT Exclusive"
  }
}, {
  timestamps: true
});

// Generate quote number before saving
QuotationSchema.pre('save', function(next) {
  if (!this.quoteNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.quoteNumber = `Q${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model('Quotation', QuotationSchema);