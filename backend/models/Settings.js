
// backend/models/Settings.js
import mongoose from 'mongoose';
const SettingsSchema = new mongoose.Schema({
    companyName: {
      type: String,
      required: true
    },
    companyAddress: String,
    companyPhone: String,
    companyEmail: String,
    vatRate: {
      type: Number,
      default: 16
    },
    quotationPrefix: {
      type: String,
      default: 'Q'
    },
    termsAndConditions: String,
    bankDetails: String,
    logo: String
  }, {
    timestamps: true
  });
  
  export default mongoose.model('Settings', SettingsSchema);