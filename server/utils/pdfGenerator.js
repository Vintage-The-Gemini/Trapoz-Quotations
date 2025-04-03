// server/utils/pdfGenerator.js
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

// Base PDF generator with common styling and helper functions
class BasePDFGenerator {
  constructor(document, options = {}) {
    this.document = document;
    this.options = options;
    this.doc = new PDFDocument({ margin: 50, size: 'A4', ...options });
    this.setupDirectory();
  }

  setupDirectory() {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  // Add company logo and header
  addHeader(title) {
    // Add logo at the top center
    const logoPath = path.join(process.cwd(), 'public/images/trapoz logo.png');
    if (fs.existsSync(logoPath)) {
      this.doc.image(logoPath, (this.doc.page.width - 150) / 2, 15, { 
        fit: [150, 150], 
        align: 'center', 
        valign: 'top' 
      });
      this.doc.moveDown(2);
    }

    // Add header
    this.doc.fontSize(20)
       .fillColor('black')
       .text(title, { align: 'center' })
       .moveDown(1.5);

    // Add company details
    this.doc.fontSize(12)
       .fillColor('orange')
       .text('Trapoz Ashphalt Limited', { align: 'center' })
       .text('P.O BOX', { align: 'center' })
       .text('NAIROBI', { align: 'center' })
       .moveDown(1.5);
  }

  // Draw a stylish table
  drawTable(headers, rows, startY) {
    const tableTop = startY || this.doc.y;
    const tableHeaderHeight = 20;
    const cellPadding = 5;
    const columnWidths = [];
    
    // Calculate column widths based on headers
    const tableWidth = this.doc.page.width - 100; // 50px margin on each side
    const equalWidth = Math.floor(tableWidth / headers.length);
    
    headers.forEach(() => {
      columnWidths.push(equalWidth);
    });

    // Draw table header
    headers.forEach((header, i) => {
      this.drawCell(
        header, 
        50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), 
        tableTop, 
        columnWidths[i], 
        tableHeaderHeight, 
        { fill: 'black', textColor: 'orange' }
      );
    });

    let y = tableTop + tableHeaderHeight;

    // Draw table rows
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        this.drawCell(
          String(cell), 
          50 + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0), 
          y, 
          columnWidths[cellIndex], 
          tableHeaderHeight,
          { 
            fill: rowIndex % 2 === 0 ? 'orange' : '#FFA500', 
            textColor: 'white',
            align: cellIndex === 0 ? 'left' : 'right' 
          }
        );
      });
      y += tableHeaderHeight;
    });

    return y; // Return the y position after the table
  }

  // Draw a cell in the table
  drawCell(text, x, y, width, height, options = {}) {
    const { fill = 'orange', textColor = 'black', align = 'left' } = options;
    
    this.doc.rect(x, y, width, height)
       .fill(fill)
       .stroke();
       
    this.doc.fillColor(textColor)
       .text(
         text, 
         x + 5,  // Left padding
         y + 5,  // Top padding
         { 
           width: width - 10,  // Subtract padding from both sides
           align: align,
           lineBreak: false
         }
       );
  }

  // Add totals section to the document
  addTotals(subtotal, vat, total, y) {
    const startY = y + 10;
    const labelWidth = 150;
    const valueWidth = 100;
    const x = this.doc.page.width - 50 - labelWidth - valueWidth;
    
    this.drawCell('Subtotal:', x, startY, labelWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    this.drawCell(`KSH ${subtotal.toLocaleString()}`, x + labelWidth, startY, valueWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    
    this.drawCell('VAT (16%):', x, startY + 20, labelWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    this.drawCell(`KSH ${vat.toLocaleString()}`, x + labelWidth, startY + 20, valueWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    
    this.drawCell('Total:', x, startY + 40, labelWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    this.drawCell(`KSH ${total.toLocaleString()}`, x + labelWidth, startY + 40, valueWidth, 20, { fill: 'black', textColor: 'orange', align: 'right' });
    
    return startY + 60; // Return the y position after the totals section
  }
  
  // Add client information section
  addClientInfo(clientName, clientAddress, additionalInfo = {}) {
    this.doc.fillColor('black');
    
    this.doc.text(`Client: ${clientName}`, 50, this.doc.y);
    
    if (clientAddress) {
      this.doc.text(`Address: ${clientAddress}`);
    }
    
    // Add any additional information
    Object.entries(additionalInfo).forEach(([key, value]) => {
      if (value) {
        this.doc.text(`${key}: ${value}`);
      }
    });
    
    this.doc.moveDown(1.5);
    return this.doc.y;
  }
  
  // Add terms and conditions section
  addTermsAndConditions(text) {
    if (!text) return this.doc.y;
    
    this.doc.moveDown(1)
       .fontSize(12)
       .fillColor('orange')
       .text('Terms and Conditions:')
       .fontSize(10)
       .fillColor('black')
       .text(text, {
         paragraphGap: 5,
         indent: 10,
         align: 'left',
         columns: 1
       });
       
    return this.doc.y;
  }
  
  // Add footer to document
  addFooter() {
    this.doc.fontSize(10)
       .fillColor('black')
       .text(
         'Thank you for your business',
         50,
         this.doc.page.height - 50,
         { align: 'center' }
       );
  }
  
  // Save PDF to file
  save(filename) {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const writeStream = fs.createWriteStream(filePath);
    this.doc.pipe(writeStream);
    
    // Add footer to the last page
    this.addFooter();
    
    this.doc.end();
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    });
  }
}

// Generate Quotation PDF
export const generateQuotationPDF = async (quotation) => {
  const pdf = new BasePDFGenerator(quotation);
  
  // Add header
  pdf.addHeader('QUOTATION');
  
  // Add quotation details
  const additionalInfo = {
    'Quotation Number': quotation.quoteNumber,
    'Date': new Date(quotation.date).toLocaleDateString(),
    'Site': quotation.site
  };
  
  const tableStartY = pdf.addClientInfo(quotation.clientName, quotation.clientAddress, additionalInfo);
  
  // Prepare items for table
  const headers = ['Description', 'Units', 'Qty', 'Unit Price', 'Amount'];
  const rows = [];
  
  // Add regular items
  (quotation.items || []).forEach(item => {
    rows.push([
      item.description,
      item.units || '',
      item.quantity,
      item.unitPrice.toLocaleString(),
      item.amount.toLocaleString()
    ]);
  });
  
  // Add custom items if they exist
  if (quotation.customItems && quotation.customItems.length > 0) {
    quotation.customItems.forEach(item => {
      rows.push([
        item.description,
        item.units || '',
        item.quantity,
        item.unitPrice.toLocaleString(),
        item.amount.toLocaleString()
      ]);
    });
  }
  
  // Draw items table
  const totalsStartY = pdf.drawTable(headers, rows, tableStartY);
  
  // Add totals
  const termsStartY = pdf.addTotals(
    quotation.subTotal, 
    quotation.vat, 
    quotation.totalAmount,
    totalsStartY
  );
  
  // Add terms and conditions
  pdf.addTermsAndConditions(quotation.termsAndConditions);
  
  // Save PDF
  return await pdf.save(`quotation-${quotation.quoteNumber}.pdf`);
};

// Generate LPO PDF
export const generateLPOPDF = async (lpo) => {
  const pdf = new BasePDFGenerator(lpo);
  
  // Add header
  pdf.addHeader('LOCAL PURCHASE ORDER');
  
  // Add LPO details
  const additionalInfo = {
    'LPO Number': lpo.lpoNumber,
    'Issued Date': new Date(lpo.issuedDate).toLocaleDateString(),
    'Received Date': new Date(lpo.receivedDate).toLocaleDateString(),
    'Delivery Address': lpo.deliveryAddress
  };
  
  const tableStartY = pdf.addClientInfo(lpo.clientName, lpo.clientAddress, additionalInfo);
  
  // Prepare items for table
  const headers = ['Description', 'Units', 'Qty', 'Unit Price', 'Amount'];
  const rows = lpo.items.map(item => [
    item.description,
    item.units || '',
    item.quantity,
    item.unitPrice.toLocaleString(),
    item.amount.toLocaleString()
  ]);
  
  // Draw items table
  const totalsStartY = pdf.drawTable(headers, rows, tableStartY);
  
  // Add totals
  const notesStartY = pdf.addTotals(
    lpo.subTotal, 
    lpo.vat, 
    lpo.totalAmount,
    totalsStartY
  );
  
  // Add additional notes
  pdf.addTermsAndConditions(lpo.additionalNotes);
  
  // Save PDF
  return await pdf.save(`lpo-${lpo.lpoNumber}.pdf`);
};

// Generate Invoice PDF
export const generateInvoicePDF = async (invoice) => {
  const pdf = new BasePDFGenerator(invoice);
  
  // Add header
  pdf.addHeader('INVOICE');
  
  // Add invoice details
  const additionalInfo = {
    'Invoice Number': invoice.invoiceNumber,
    'Date': new Date(invoice.date).toLocaleDateString(),
    'Due Date': new Date(invoice.dueDate).toLocaleDateString(),
    'LPO Number': invoice.lpo?.lpoNumber || 'N/A'
  };
  
  const tableStartY = pdf.addClientInfo(invoice.clientName, invoice.clientAddress, additionalInfo);
  
  // Prepare items for table
  const headers = ['Description', 'Units', 'Qty', 'Unit Price', 'Amount'];
  const rows = invoice.items.map(item => [
    item.description,
    item.units || '',
    item.quantity,
    item.unitPrice.toLocaleString(),
    item.amount.toLocaleString()
  ]);
  
  // Draw items table
  const totalsStartY = pdf.drawTable(headers, rows, tableStartY);
  
  // Add totals
  let y = pdf.addTotals(
    invoice.subTotal, 
    invoice.vat, 
    invoice.totalAmount,
    totalsStartY
  );
  
  // Add payment status
  pdf.doc.moveDown(1)
     .fontSize(12)
     .fillColor('orange')
     .text('Payment Status:')
     .fontSize(10)
     .fillColor('black');
  
  const statusColors = {
    unpaid: 'red',
    partially_paid: 'orange',
    paid: 'green',
    overdue: 'red'
  };
  
  // Payment information table
  pdf.doc.text(`Status: ${invoice.status.toUpperCase()}`, { color: statusColors[invoice.status] })
     .text(`Amount Paid: KSH ${invoice.amountPaid.toLocaleString()}`)
     .text(`Balance: KSH ${invoice.balance.toLocaleString()}`);
  
  // Add payment terms
  if (invoice.paymentTerms) {
    pdf.doc.moveDown(1)
       .fontSize(10)
       .fillColor('black')
       .text(`Payment Terms: ${invoice.paymentTerms}`);
  }
  
  // Save PDF
  return await pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

// Generate Receipt PDF
export const generateReceiptPDF = async (payment) => {
  const pdf = new BasePDFGenerator(payment);
  
  // Add header
  pdf.addHeader('RECEIPT');
  
  // Add receipt details
  const additionalInfo = {
    'Receipt Number': payment.receiptNumber,
    'Date': new Date(payment.date).toLocaleDateString(),
    'Invoice Number': payment.invoice?.invoiceNumber || 'N/A',
    'Payment Method': payment.paymentMethod.replace('_', ' ').toUpperCase(),
    'Reference': payment.referenceNumber || 'N/A'
  };
  
  const contentStartY = pdf.addClientInfo(payment.invoice?.clientName, payment.invoice?.clientAddress, additionalInfo);
  
  // Add payment details
  pdf.doc.y = contentStartY + 20;
  pdf.doc.fontSize(14)
     .fillColor('orange')
     .text('PAYMENT DETAILS', { align: 'center' })
     .moveDown(1);
  
  // Add amount in a box
  const amountBoxY = pdf.doc.y;
  pdf.doc.rect(100, amountBoxY, pdf.doc.page.width - 200, 40)
     .fill('black');
     
  pdf.doc.fontSize(16)
     .fillColor('orange')
     .text(
       `KSH ${payment.amount.toLocaleString()}`,
       100, 
       amountBoxY + 10, 
       { align: 'center', width: pdf.doc.page.width - 200 }
     );
  
  // Add notes
  if (payment.notes) {
    pdf.doc.y = amountBoxY + 60;
    pdf.doc.fontSize(10)
       .fillColor('black')
       .text('Notes:')
       .text(payment.notes, {
         paragraphGap: 5,
         indent: 10,
         align: 'left'
       });
  }
  
  // Add received by
  if (payment.receivedBy) {
    pdf.doc.moveDown(2)
       .fontSize(10)
       .text(`Received By: ${payment.receivedBy}`);
  }
  
  // Save PDF
  return await pdf.save(`receipt-${payment.receiptNumber}.pdf`);
};

// Generate Delivery Note PDF
export const generateDeliveryNotePDF = async (deliveryNote) => {
  const pdf = new BasePDFGenerator(deliveryNote);
  
  // Add header
  pdf.addHeader('DELIVERY NOTE');
  
  // Add delivery note details
  const additionalInfo = {
    'Delivery Note Number': deliveryNote.deliveryNumber,
    'Date': new Date(deliveryNote.date).toLocaleDateString(),
    'LPO Number': deliveryNote.lpo?.lpoNumber || 'N/A',
    'Delivery Address': deliveryNote.deliveryAddress
  };
  
  const tableStartY = pdf.addClientInfo(deliveryNote.clientName, deliveryNote.clientAddress, additionalInfo);
  
  // Prepare items for table
  const headers = ['Description', 'Units', 'Quantity', 'Remarks'];
  const rows = deliveryNote.items.map(item => [
    item.description,
    item.units || '',
    item.quantity,
    item.remarks || ''
  ]);
  
  // Draw items table
  let y = pdf.drawTable(headers, rows, tableStartY);
  
  // Add delivery details
  pdf.doc.y = y + 30;
  pdf.doc.fontSize(12)
     .fillColor('orange')
     .text('DELIVERY DETAILS')
     .moveDown(0.5)
     .fontSize(10)
     .fillColor('black');
  
  // Vehicle and driver information
  if (deliveryNote.vehicleDetails) {
    pdf.doc.text(`Vehicle Details: ${deliveryNote.vehicleDetails}`);
  }
  
  if (deliveryNote.driverName) {
    pdf.doc.text(`Driver: ${deliveryNote.driverName}`);
  }
  
  if (deliveryNote.driverContact) {
    pdf.doc.text(`Driver Contact: ${deliveryNote.driverContact}`);
  }
  
  // Delivery confirmation if delivered
  if (deliveryNote.status === 'delivered') {
    pdf.doc.moveDown(1)
       .fillColor('green')
       .text('DELIVERED', { underline: true })
       .fillColor('black')
       .moveDown(0.5);
    
    if (deliveryNote.receivedBy) {
      pdf.doc.text(`Received By: ${deliveryNote.receivedBy}`);
    }
    
    if (deliveryNote.receiverPosition) {
      pdf.doc.text(`Position: ${deliveryNote.receiverPosition}`);
    }
    
    if (deliveryNote.receivedDate) {
      pdf.doc.text(`Date Received: ${new Date(deliveryNote.receivedDate).toLocaleDateString()}`);
    }
  }
  
  // Add notes
  if (deliveryNote.notes) {
    pdf.doc.moveDown(1)
       .fillColor('orange')
       .text('Notes:')
       .fillColor('black')
       .text(deliveryNote.notes);
  }
  
  // Save PDF
  return await pdf.save(`delivery-note-${deliveryNote.deliveryNumber}.pdf`);
};

// Generate Statement of Account PDF
export const generateStatementPDF = async (client, transactions) => {
  const pdf = new BasePDFGenerator({ clientName: client.name });
  
  // Add header
  pdf.addHeader('STATEMENT OF ACCOUNT');
  
  // Add client details and statement period
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  
  const additionalInfo = {
    'Statement Date': today.toLocaleDateString(),
    'Period': `${startDate.toLocaleDateString()} to ${today.toLocaleDateString()}`
  };
  
  const tableStartY = pdf.addClientInfo(client.name, client.address, additionalInfo);
  
  // Prepare transactions for table
  const headers = ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'];
  
  let balance = 0;
  const rows = transactions.map(t => {
    const debit = t.type === 'invoice' ? t.amount : 0;
    const credit = t.type === 'payment' ? t.amount : 0;
    
    balance += debit - credit;
    
    return [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.reference,
      debit ? `KSH ${debit.toLocaleString()}` : '',
      credit ? `KSH ${credit.toLocaleString()}` : '',
      `KSH ${balance.toLocaleString()}`
    ];
  });
  
  // Draw transactions table
  let y = pdf.drawTable(headers, rows, tableStartY);
  
  // Add summary
  pdf.doc.y = y + 30;
  pdf.doc.fontSize(12)
     .fillColor('orange')
     .text('ACCOUNT SUMMARY')
     .moveDown(0.5);
  
  // Summary table
  const totalInvoiced = transactions
    .filter(t => t.type === 'invoice')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalPaid = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const summaryHeaders = ['Description', 'Amount'];
  const summaryRows = [
    ['Total Invoiced', `KSH ${totalInvoiced.toLocaleString()}`],
    ['Total Paid', `KSH ${totalPaid.toLocaleString()}`],
    ['Current Balance', `KSH ${balance.toLocaleString()}`]
  ];
  
  pdf.drawTable(summaryHeaders, summaryRows);
  
  // Payment instructions
  pdf.doc.moveDown(2)
     .fontSize(10)
     .fillColor('black')
     .text('Payment Instructions:')
     .text('Please make payments to the following account:')
     .moveDown(0.5)
     .text('Bank: EXAMPLE BANK')
     .text('Account Name: Trapoz Ashphalt Limited')
     .text('Account Number: 1234567890')
     .text('Branch: Main Branch')
     .text('Reference: Your client number or invoice number');
  
  // Save PDF
  return await pdf.save(`statement-${client.name.replace(/\s+/g, '-')}-${today.toISOString().split('T')[0]}.pdf`);
};