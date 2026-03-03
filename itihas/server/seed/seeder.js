/**
 * Database seeder
 *
 * Usage:  node server/seed/seeder.js          – seed sample data
 *         node server/seed/seeder.js --clear   – remove all data
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import models here when created
// const Site = require('../models/Site');

const sampleData = [
  // Add sample documents here
];

const seedDB = async () => {
  await connectDB();

  if (process.argv.includes('--clear')) {
    // await Site.deleteMany();
    console.log('Data cleared!');
  } else {
    // await Site.insertMany(sampleData);
    console.log('Sample data seeded!');
  }

  process.exit(0);
};

seedDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
