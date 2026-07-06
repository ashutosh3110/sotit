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

    // Seed default pages (Privacy Policy, Terms & Conditions) if they don't exist
    try {
      const Page = require('../models/Page');
      const defaultPages = [
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: 'This is the default Privacy Policy for Sootit. You can edit this content from the Super Admin Panel.',
          target: 'customer'
        },
        {
          title: 'Terms & Conditions',
          slug: 'terms-and-conditions',
          content: 'This is the default Terms & Conditions for Sootit. You can edit this content from the Super Admin Panel.',
          target: 'customer'
        },
        {
          title: 'Partner Privacy Policy',
          slug: 'partner-privacy-policy',
          content: 'This is the default Privacy Policy for Sootit Partners/Vendors. You can edit this content from the Super Admin Panel.',
          target: 'vendor'
        },
        {
          title: 'Partner Terms & Conditions',
          slug: 'partner-terms-and-conditions',
          content: 'This is the default Terms & Conditions for Sootit Partners/Vendors. You can edit this content from the Super Admin Panel.',
          target: 'vendor'
        }
      ];

      for (const pageInfo of defaultPages) {
        const exists = await Page.findOne({ slug: pageInfo.slug });
        if (!exists) {
          await Page.create(pageInfo);
        }
      }
      console.log('Default system pages verified/seeded successfully.');
    } catch (pageSeedErr) {
      console.error('Error seeding default system pages:', pageSeedErr.message);
    }

    // Seed/verify default system settings
    try {
      const SystemSetting = require('../models/SystemSetting');
      let settings = await SystemSetting.findOne();
      if (!settings) {
        await SystemSetting.create({});
        console.log('Default system settings seeded.');
      } else if (settings.supportEmail === 'support@sootit.com') {
        settings.supportEmail = 'sootit3@gmail.com';
        await settings.save();
        console.log('System settings updated to sootit3@gmail.com.');
      }
    } catch (settingsErr) {
      console.error('Error seeding default system settings:', settingsErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
