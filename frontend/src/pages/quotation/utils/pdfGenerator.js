// backend/utils/pdfGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateQuotationPDF = async (quotation) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Prepare file path
  const filename = `quotation-${quotation.quoteNumber}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  // Create write stream
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Add header
  doc.fontSize(20)
     .text('QUOTATION', { align: 'center' })
     .moveDown();

  // Add company details
  doc.fontSize(12)
     .text('Lucky Diced Investments Limited')
     .text('P.O BOX')
     .text('NAIROBI')
     .moveDown();

  // Add quotation details
  doc.text(`Quotation Number: ${quotation.quoteNumber}`)
     .text(`Date: ${new Date(quotation.date).toLocaleDateString()}`)
     .text(`Client: ${quotation.clientName}`)
     .text(`Address: ${quotation.clientAddress}`)
     .text(`Site: ${quotation.site}`)
     .moveDown();

  // Add items table
  doc.fontSize(12);
  const tableTop = doc.y;
  const itemsTableTop = tableTop + 20;
  
  // Table headers
  doc.text('Description', 50, tableTop)
     .text('Units', 250, tableTop)
     .text('Qty', 300, tableTop)
     .text('Unit Price', 350, tableTop)
     .text('Amount', 450, tableTop);

  // Table content
  let y = itemsTableTop;
  
  // Regular items
  quotation.items.forEach(item => {
    doc.text(item.description, 50, y)
       .text(item.units, 250, y)
       .text(item.quantity.toString(), 300, y)
       .text(item.unitPrice.toLocaleString(), 350, y)
       .text(item.amount.toLocaleString(), 450, y);
    y += 20;
  });

  // Custom items
  quotation.customItems.forEach(item => {
    doc.text(item.description, 50, y)
       .text(item.units, 250, y)
       .text(item.quantity.toString(), 300, y)
       .text(item.unitPrice.toLocaleString(), 350, y)
       .text(item.amount.toLocaleString(), 450, y);
    y += 20;
  });

  // Add totals
  y += 20;
  doc.text('Subtotal:', 350, y)
     .text(quotation.subTotal.toLocaleString(), 450, y);
  y += 20;
  doc.text('VAT (16%):', 350, y)
     .text(quotation.vat.toLocaleString(), 450, y);
  y += 20;
  doc.fontSize(14)
     .text('Total:', 350, y)
     .text(quotation.totalAmount.toLocaleString(), 450, y);

  // Add terms and conditions
  doc.moveDown()
     .fontSize(12)
     .text('Terms and Conditions:')
     .fontSize(10)
     .text(quotation.termsAndConditions);

  // Add footer
  doc.fontSize(10)
     .text(
       'Thank you for your business',
       50,
       doc.page.height - 50,
       { align: 'center' }
     );

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};