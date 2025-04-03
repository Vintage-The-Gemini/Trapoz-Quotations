// server/models/DeliveryNote.js
import mongoose from 'mongoose';

const DeliveryItemSchema = new mongoose.Schema({
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
  remarks: String
});

const DeliveryNoteSchema = new mongoose.Schema({
  deliveryNumber: {
    type: String,
    unique: true
  },
  lpo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LPO',
    required: true
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
  deliveryAddress: {
    type: String,
    required: true
  },
  items: [DeliveryItemSchema],
  vehicleDetails: String,
  driverName: String,
  driverContact: String,
  receivedBy: String,
  receiverPosition: String,
  receivedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

// Generate delivery note number before saving
DeliveryNoteSchema.pre('save', function(next) {
  if (!this.deliveryNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.deliveryNumber = `DN${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  next();
});

// Update LPO status when delivery is complete
DeliveryNoteSchema.post('save', async function() {
  if (this.status === 'delivered') {
    const LPO = mongoose.model('LPO');
    await LPO.findByIdAndUpdate(this.lpo, { status: 'delivered', deliveryDate: this.receivedDate || this.updatedAt });
  }
});

export default mongoose.model('DeliveryNote', DeliveryNoteSchema);