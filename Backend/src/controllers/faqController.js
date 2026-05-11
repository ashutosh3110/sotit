const FAQ = require('../models/FAQ');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getFAQs = async (req, res, next) => {
  try {
    const { type, role } = req.query;
    let query = type ? { type } : {};
    
    // If role is provided, fetch FAQs for that role or 'all'
    if (role && type === 'vendor') {
      query = { 
        ...query, 
        $or: [{ role: role }, { role: 'all' }] 
      };
    }

    const faqs = await FAQ.find(query).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (err) {
    next(err);
  }
};

// @desc    Create an FAQ
// @route   POST /api/faqs
// @access  Private/Admin
exports.createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json({ message: 'FAQ deleted' });
  } catch (err) {
    next(err);
  }
};
