const express = require('express');
const { getFAQs, createFAQ, deleteFAQ } = require('../controllers/faqController');

const router = express.Router();

router.get('/', getFAQs);
router.post('/', createFAQ);
router.delete('/:id', deleteFAQ);

module.exports = router;
