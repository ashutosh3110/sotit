const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const requests = await mongoose.connection.collection('servicerequests').find({}).toArray();
    console.log(JSON.stringify(requests, null, 2));
    await mongoose.disconnect();
};

run();
