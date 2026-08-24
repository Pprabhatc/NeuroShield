const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neuroshield';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (err) {
    isMongoConnected = false;
    console.log('MongoDB connection skipped/unavailable. Utilizing active embedded file store fallback.');
  }
};

const getStatus = () => isMongoConnected;

module.exports = { connectDB, getStatus };
