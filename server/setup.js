// server/setup.js
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

// Load environment variables
dotenv.config();

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/lpo',
    'uploads/quotations',
    'uploads/invoices',
    'uploads/payments',
    'uploads/delivery-notes'
  ];

  console.log('Creating necessary directories...');
  
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  Created: ${dir}`);
    } else {
      console.log(`  Already exists: ${dir}`);
    }
  });
  
  console.log('Directory setup complete.');
};

// Create default settings
const createDefaultSettings = async () => {
  try {
    console.log('Checking for existing settings...');
    
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      console.log('Creating default settings...');
      
      const defaultSettings = new Settings({
        companyName: 'Trapoz Ashphalt Limited',
        companyAddress: 'P.O Box, Nairobi',
        companyPhone: '+254 XXX XXX XXX',
        companyEmail: 'info@trapozashphalt.com',
        vatRate: process.env.DEFAULT_VAT_RATE || 16,
        quotationPrefix: 'Q',
        termsAndConditions: "1. Payment terms: 30 days\n2. Validity: 30 days\n3. VAT Exclusive",
        bankDetails: "Bank: EXAMPLE BANK\nAccount Name: Trapoz Ashphalt Limited\nAccount Number: 1234567890\nBranch: Main Branch"
      });
      
      await defaultSettings.save();
      console.log('Default settings created successfully.');
    } else {
      console.log('Settings already exist, skipping creation.');
    }
    
    await mongoose.disconnect();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error creating default settings:', error);
    process.exit(1);
  }
};

// Run setup
const runSetup = async () => {
  console.log('Starting setup...');
  
  createDirectories();
  await createDefaultSettings();
  
  console.log('Setup completed successfully!');
  process.exit(0);
};

runSetup();