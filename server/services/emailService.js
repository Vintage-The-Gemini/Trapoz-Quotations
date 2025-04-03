// server/services/emailService.js
import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter = null;

// Initialize email transporter
export const initializeTransporter = async () => {
  // Get company settings for email info
  let settings;
  try {
    settings = await Settings.findOne();
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
  
  // Create transporter configuration
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };
  
  // Create transporter
  transporter = nodemailer.createTransport(config);
  
  // Verify connection
  try {
    await transporter.verify();
    console.log('Email service initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing email service:', error);
    return false;
  }
};

/**
 * Send email
 * @param {Object} mailOptions - Email options
 * @returns {Promise} Email sending result
 */
export const sendEmail = async (mailOptions) => {
  // Initialize transporter if not already done
  if (!transporter) {
    await initializeTransporter();
  }
  
  // Set default from address if not provided
  if (!mailOptions.from) {
    mailOptions.from = process.env.EMAIL_FROM || 'info@trapozashphalt.com';
  }
  
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send document via email
 * @param {Object} options - Options for document email
 * @param {string} options.documentType - Type of document (quotation, invoice, etc.)
 * @param {string} options.documentNumber - Document identifier
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.recipientName - Recipient name
 * @param {string} options.message - Optional custom message
 * @param {string} options.attachmentPath - Path to attachment
 * @returns {Promise} Email sending result
 */
export const sendDocumentEmail = async (options) => {
  // Get company info from settings
  let settings;
  try {
    settings = await Settings.findOne();
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
  
  const companyName = settings?.companyName || 'Trapoz Ashphalt Limited';
  const companyEmail = settings?.companyEmail || 'info@trapozashphalt.com';
  const companyPhone = settings?.companyPhone || '+254 XXX XXX XXX';
  
  // Format document type name
  const documentTypeName = options.documentType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Prepare email
  const mailOptions = {
    to: options.recipientEmail,
    subject: `${documentTypeName}: ${options.documentNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #FF8C00;">${companyName}</h2>
        <p>Dear ${options.recipientName || 'Client'},</p>
        
        <p>Please find attached the ${documentTypeName.toLowerCase()} (${options.documentNumber}) from ${companyName}.</p>
        
        ${options.message ? `<p>${options.message}</p>` : ''}
        
        <p>If you have any questions, please do not hesitate to contact us.</p>
        
        <p>Best regards,<br>
        ${companyName}<br>
        ${companyEmail}<br>
        ${companyPhone}</p>
      </div>
    `,
    attachments: [
      {
        filename: options.attachmentPath.split('/').pop(),
        path: options.attachmentPath
      }
    ]
  };
  
  // Send email
  return await sendEmail(mailOptions);
};