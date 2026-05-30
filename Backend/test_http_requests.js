const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const vendorId = "6a1a7247eab73c626263f0a9";
const token = jwt.sign({ id: vendorId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
});

const run = async () => {
    try {
        console.log("Making HTTP request to local server on port 5000...");
        const response = await axios.get("http://localhost:5000/api/services/vendor/requests", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Live Server Response:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error("HTTP Request failed:", err.message);
        if (err.response) {
            console.error("Error Response Data:", err.response.data);
        }
    }
};

run();
