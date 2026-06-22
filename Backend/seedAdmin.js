const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin updated successfully.');
    } else {
      await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin created successfully.');
    }

    console.log('Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
    mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
