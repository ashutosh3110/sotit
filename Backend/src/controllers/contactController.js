const ContactQuery = require('../models/ContactQuery');

// @desc    Submit a contact query
// @route   POST /api/contact
// @access  Public
const submitContactQuery = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    const query = await ContactQuery.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: query,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// @desc    Get all contact queries (Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getContactQueries = async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queries',
    });
  }
};

// @desc    Update query status (Admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const query = await ContactQuery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: query,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// @desc    Delete a contact query (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactQuery = async (req, res) => {
  try {
    const query = await ContactQuery.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Query deleted successfully',
    });
  } catch (error) {
    console.error('Delete query error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete query' });
  }
};

module.exports = { submitContactQuery, getContactQueries, updateContactStatus, deleteContactQuery };
