const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Add Madhya Pradesh / Indore to priyank's serviceStates
    const vendorId = "6a1a7247eab73c626263f0a9";
    await Vendor.findByIdAndUpdate(vendorId, {
        "professionalDetails.serviceStates": [
            {
                name: "Madhya Pradesh",
                isoCode: "MP",
                districts: ["Indore"]
            }
        ]
    });
    
    console.log("Updated priyank's serviceStates successfully!");
    await mongoose.disconnect();
};

run();
