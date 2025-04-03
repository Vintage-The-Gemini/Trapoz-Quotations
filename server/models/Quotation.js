// server/models/Quotation.js
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
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: {
    type: String,
    required: true
  },
  clientAddress: String,
  clientEmail: String,
  clientPhone: String,
  contactPerson: String,
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
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'converted'],
    default: 'pending'
  },
  validUntil: {
    type: Date
  },
  notes: String,
  attachmentUrl: String
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
  
  // Set validity date if not set (default 30 days)
  if (!this.validUntil) {
    const validityDate = new Date(this.date);
    validityDate.setDate(validityDate.getDate() + 30);
    this.validUntil = validityDate;
  }
  
  next();
});

// Calculate totals before save (handle both full updates and status-only updates)
QuotationSchema.pre('save', function(next) {
  try {
    // Only recalculate if items are present and this is not just a status update
    if (this.items && this.items.length > 0 && this.isModified('items')) {
      // Calculate totals from regular items
      const itemsTotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Calculate totals from custom items
      const customItemsTotal = this.customItems ? 
        this.customItems.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;

      // Set total amounts
      this.subTotal = itemsTotal + customItemsTotal;
      this.vat = this.subTotal * 0.16; // 16% VAT
      this.totalAmount = this.subTotal + this.vat;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Check if quotation is expired
QuotationSchema.methods.isExpired = function() {
  return this.validUntil < new Date();
};

// Method to approve quotation
QuotationSchema.methods.approve = function() {
  if (this.status === 'pending' && !this.isExpired()) {
    this.status = 'approved';
    return true;
  }
  return false;
};

// Method to reject quotation
QuotationSchema.methods.reject = function(reason) {
  if (this.status === 'pending') {
    this.status = 'rejected';
    this.notes = reason || this.notes;
    return true;
  }
  return false;
};

export default mongoose.model('Quotation', QuotationSchema);