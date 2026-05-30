const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const vendors = await mongoose.connection.collection('vendors').find({}).toArray();
    console.log(JSON.stringify(vendors, null, 2));
    await mongoose.disconnect();
};

run();
