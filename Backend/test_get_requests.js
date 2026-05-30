const mongoose = require('mongoose');
const { getVendorRequests } = require('./src/controllers/serviceController');
const Vendor = require('./src/models/Vendor');
const ServiceRequest = require('./src/models/ServiceRequest');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Mock req and res
    const req = {
        user: { id: "6a1a7247eab73c626263f0a9" }
    };
    
    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log("Status Code:", this.statusCode || 200);
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    };
    
    try {
        await getVendorRequests(req, res);
    } catch (err) {
        console.error("Error running controller:", err);
    }
    
    await mongoose.disconnect();
};

run();
