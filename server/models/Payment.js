// server/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "check",
        "mobile_money",
        "credit_card",
        "other",
      ],
      required: true,
    },
    referenceNumber: String,
    notes: String,
    receivedBy: String,
  },
  {
    timestamps: true,
  }
);

// Generate receipt number before saving
PaymentSchema.pre("save", function (next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    this.receiptNumber = `RCT${year}${month}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }
  next();
});

// Update invoice after payment is recorded
PaymentSchema.post("save", async function () {
  const Invoice = mongoose.model("Invoice");

  const invoice = await Invoice.findById(this.invoice);
  if (invoice) {
    // Update amount paid
    invoice.amountPaid += this.amount;

    // Calculate balance
    invoice.balance = invoice.totalAmount - invoice.amountPaid;

    // Update status
    if (invoice.amountPaid === 0) {
      invoice.status = "unpaid";
    } else if (invoice.amountPaid < invoice.totalAmount) {
      invoice.status = "partially_paid";
    } else {
      invoice.status = "paid";
    }

    // Check if overdue but not fully paid
    if (invoice.dueDate < new Date() && invoice.status !== "paid") {
      invoice.status = "overdue";
    }

    await invoice.save();
  }
});

export default mongoose.model("Payment", PaymentSchema);
