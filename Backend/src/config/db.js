const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop the old non-sparse unique email index if it exists, so Mongoose can recreate it as sparse.
    try {
      const usersCol = mongoose.connection.collection('users');
      await usersCol.dropIndex('email_1');
      console.log('Successfully dropped old email_1 index.');
    } catch (indexErr) {
      // indexErr.code 27 means index does not exist, which is fine
      if (indexErr.code !== 27) {
        console.log(`Index cleanup note: ${indexErr.message}`);
      }
    }

    // Seed default vehicle types if they don't exist
    try {
      const VehicleType = require('../models/VehicleType');
      const defaults = ['Bike', 'Car', 'Truck', 'Bus', '2 Wheeler', '4 Wheeler'];
      for (const def of defaults) {
        const exists = await VehicleType.findOne({ name: def });
        if (!exists) {
          await VehicleType.create({ name: def });
        }
      }
      console.log('Default vehicle types verified/seeded successfully.');
    } catch (seedErr) {
      console.error('Error seeding default vehicle types:', seedErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
