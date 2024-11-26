import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export const generateQuotationPDF = async (quotation) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `quotation-${quotation.quoteNumber}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Add logo at the top center
    const logoPath = path.join(process.cwd(), 'public/images/trapoz logo.png');
    doc.image(logoPath, (doc.page.width - 150) / 2, 15, { fit: [150, 150], align: 'center', valign: 'top' });

    doc.moveDown(2);

    // Add header
    doc.fontSize(20)
       .fillColor('black')
       .text('QUOTATION', { align: 'center' })
       .moveDown(1.5);

    // Add company details
    doc.fontSize(12)
       .fillColor('orange')
       .text('Trapoz Ashphalt Limited', { align: 'center' })
       .text('P.O BOX', { align: 'center' })
       .text('NAIROBI', { align: 'center' })
       .moveDown(1.5);

    // Add quotation details
    doc.fillColor('black')
       .text(`Quotation Number: ${quotation.quoteNumber}`)
       .text(`Date: ${new Date(quotation.date).toLocaleDateString()}`)
       .text(`Client: ${quotation.clientName}`)
       .text(`Address: ${quotation.clientAddress}`)
       .text(`Site: ${quotation.site}`)
       .moveDown(1.5);

    // Add items table header with stylish design
    doc.fontSize(10);
    const tableTop = doc.y;
    const tableHeaderHeight = 20;
    const cellPadding = 5;
    const columnWidths = [200, 60, 60, 100, 100];

    const drawCell = (text, x, y, width, height, options = {}) => {
        const { fill = 'orange', textColor = 'black', align = 'left' } = options;
        doc.rect(x, y, width, height)
           .fill(fill)
           .stroke();
        doc.fillColor(textColor)
           .text(text, x + cellPadding, y + cellPadding, { width: width - cellPadding * 2, align: align });
    };

    const headers = ['Description', 'Units', 'Qty', 'Unit Price', 'Amount'];
    headers.forEach((header, i) => {
        drawCell(header, 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, columnWidths[i], tableHeaderHeight, { fill: 'black', textColor: 'orange' });
    });

    let y = tableTop + tableHeaderHeight;

    // Add items
    const items = quotation.items || [];
    const customItems = quotation.customItems || [];

    const renderItems = (items, isCustom = false) => {
        items.forEach(item => {
            drawCell(item.description, 50, y, columnWidths[0], tableHeaderHeight, { fill: isCustom ? 'black' : 'orange', textColor: 'white' });
            drawCell(item.units, 50 + columnWidths[0], y, columnWidths[1], tableHeaderHeight, { fill: isCustom ? 'black' : 'orange', textColor: 'white', align: 'center' });
            drawCell(item.quantity.toString(), 50 + columnWidths[0] + columnWidths[1], y, columnWidths[2], tableHeaderHeight, { fill: isCustom ? 'black' : 'orange', textColor: 'white', align: 'right' });
            drawCell(item.unitPrice.toLocaleString(), 50 + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], tableHeaderHeight, { fill: isCustom ? 'black' : 'orange', textColor: 'white', align: 'right' });
            drawCell(item.amount.toLocaleString(), 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, columnWidths[4], tableHeaderHeight, { fill: isCustom ? 'black' : 'orange', textColor: 'white', align: 'right' });
            y += tableHeaderHeight;
        });
    };

    renderItems(items);
    renderItems(customItems, true);

    // Add totals
    const drawTotal = (label, amount, yPosition) => {
        drawCell(label, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition, columnWidths[3], tableHeaderHeight, { fill: 'black', textColor: 'orange', align: 'right' });
        drawCell(amount.toLocaleString(), 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], yPosition, columnWidths[4], tableHeaderHeight, { fill: 'black', textColor: 'orange', align: 'right' });
    };

    y += 10;
    drawTotal('Subtotal:', quotation.subTotal, y);
    y += tableHeaderHeight;
    drawTotal('VAT (16%):', quotation.vat, y);
    y += tableHeaderHeight;
    drawTotal('Total:', quotation.totalAmount, y);

    // Add terms and conditions
    doc.moveDown(2)
       .fontSize(12)
       .fillColor('orange')
       .text('Terms and Conditions:')
       .fontSize(10)
       .fillColor('black')
       .text(quotation.termsAndConditions);

    // Add footer
    doc.fontSize(10)
       .fillColor('black')
       .text('Thank you for your business', 50, doc.page.height - 50, { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
};
