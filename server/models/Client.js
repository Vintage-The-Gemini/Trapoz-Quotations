// server/models/Client.js
import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  clientNumber: {
    type: String,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'Kenya' }
  },
  contactPerson: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  phone: String,
  email: String,
  website: String,
  industry: String,
  notes: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  paymentTerms: {
    dueDate: { type: Number, default: 30 }, // Days until payment is due
    discountDays: { type: Number, default: 0 }, // Days for early payment discount
    discountPercent: { type: Number, default: 0 } // Early payment discount percentage
  },
  taxInfo: {
    vatNumber: String,
    pinNumber: String,
    taxExempt: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Generate client number before saving
ClientSchema.pre('save', function(next) {
  if (!this.clientNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.clientNumber = `C${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  next();
});

// Virtual for formatted address
ClientSchema.virtual('formattedAddress').get(function() {
  const addr = this.address || {};
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Helper method to get client statement
ClientSchema.methods.getStatement = async function(startDate, endDate) {
  const Quotation = mongoose.model('Quotation');
  const Invoice = mongoose.model('Invoice');
  const Payment = mongoose.model('Payment');
  
  // If no dates provided, default to last 3 months
  if (!startDate) {
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
  }
  
  if (!endDate) {
    endDate = new Date();
  }
  
  // Get all invoices for this client
  const invoices = await Invoice.find({
    clientId: this._id,
    date: { $gte: startDate, $lte: endDate }
  }).sort('date');
  
  // Get all payments for these invoices
  const payments = await Payment.find({
    invoice: { $in: invoices.map(inv => inv._id) },
    date: { $gte: startDate, $lte: endDate }
  }).populate('invoice').sort('date');
  
  // Combine into a single transaction list
  const transactions = [
    ...invoices.map(inv => ({
      date: inv.date,
      type: 'invoice',
      description: `Invoice ${inv.invoiceNumber}`,
      reference: inv.invoiceNumber,
      amount: inv.totalAmount,
      balance: inv.balance
    })),
    ...payments.map(payment => ({
      date: payment.date,
      type: 'payment',
      description: `Payment for Invoice ${payment.invoice.invoiceNumber}`,
      reference: payment.receiptNumber,
      amount: payment.amount,
      balance: 0
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    client: this,
    startDate,
    endDate,
    transactions
  };
};

export default mongoose.model('Client', ClientSchema);