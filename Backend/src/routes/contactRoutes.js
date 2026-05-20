const express = require('express');
const router = express.Router();
const { submitContactQuery, getContactQueries, updateContactStatus, deleteContactQuery } = require('../controllers/contactController');

// Public - submit contact form
router.post('/', submitContactQuery);

// Admin - get, update and delete queries
router.get('/', getContactQueries);
router.put('/:id', updateContactStatus);
router.delete('/:id', deleteContactQuery);

module.exports = router;
