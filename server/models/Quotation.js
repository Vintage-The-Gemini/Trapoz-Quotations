// backend/models/Quotation.js
import mongoose from 'mongoose';

const QuotationItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false
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
  customItems: [QuotationItemSchema], // Added separate array for custom items
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

// Calculate totals before save
QuotationSchema.pre('save', function(next) {
  try {
    // Calculate totals from regular items
    const itemsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate totals from custom items
    const customItemsTotal = this.customItems ? 
      this.customItems.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;

    // Set total amounts
    this.subTotal = itemsTotal + customItemsTotal;
    this.vat = this.subTotal * 0.16; // 16% VAT
    this.totalAmount = this.subTotal + this.vat;

    next();
  } catch (error) {
    next(error);
  }
});

// Add middleware for update operations
QuotationSchema.pre('findOneAndUpdate', function(next) {
  try {
    const update = this.getUpdate();
    if (update.items || update.customItems) {
      const itemsTotal = (update.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
      const customItemsTotal = (update.customItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);

      this.setUpdate({
        ...update,
        subTotal: itemsTotal + customItemsTotal,
        vat: (itemsTotal + customItemsTotal) * 0.16,
        totalAmount: (itemsTotal + customItemsTotal) * 1.16
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add method to recalculate totals
QuotationSchema.methods.recalculateTotals = function() {
  const itemsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const customItemsTotal = this.customItems ? 
    this.customItems.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;

  this.subTotal = itemsTotal + customItemsTotal;
  this.vat = this.subTotal * 0.16;
  this.totalAmount = this.subTotal + this.vat;
};

export default mongoose.model('Quotation', QuotationSchema);