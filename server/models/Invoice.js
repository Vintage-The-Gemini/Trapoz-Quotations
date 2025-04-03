// server/models/Invoice.js
import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  units: String,
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    lpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LPO",
      required: true,
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientAddress: String,
    items: [InvoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    vat: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "overdue"],
      default: "unpaid",
    },
    notes: String,
    paymentTerms: String,
  },
  {
    timestamps: true,
  }
);

// Generate invoice number before saving
InvoiceSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    this.invoiceNumber = `INV${year}${month}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }

  // Calculate balance
  this.balance = this.totalAmount - this.amountPaid;

  // Update status based on payment
  if (this.amountPaid === 0) {
    this.status = "unpaid";
  } else if (this.amountPaid < this.totalAmount) {
    this.status = "partially_paid";
  } else {
    this.status = "paid";
  }

  // Check if overdue
  if (this.dueDate < new Date() && this.status !== "paid") {
    this.status = "overdue";
  }

  next();
});

export default mongoose.model("Invoice", InvoiceSchema);
