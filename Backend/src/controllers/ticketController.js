const Ticket = require('../models/Ticket');

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    console.log("Creating Ticket with Body:", req.body);
    const { subject, priority, userType, userName, userEmail, userId, userRole } = req.body;
    
    // Generate a unique Ticket ID
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const mongoose = require('mongoose');
    const ticket = await Ticket.create({
      ticketId,
      user: new mongoose.Types.ObjectId(userId),
      userName,
      userEmail,
      userRole,
      subject,
      priority,
      userType: userType || 'customer'
    });

    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tickets (Admin only)
// @route   GET /api/tickets
// @access  Private/Admin
exports.getAllTickets = async (req, res, next) => {
  try {
    const { userType } = req.query;
    const query = userType ? { userType } : {};
    let tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    
    // Dynamically fetch roles for vendors if userRole is missing
    if (userType === 'vendor') {
      const Vendor = require('../models/Vendor');
      tickets = await Promise.all(tickets.map(async (ticket) => {
        if (!ticket.userRole || ticket.userRole === 'Partner') {
          console.log(`Searching role for Vendor: ${ticket.userEmail} or ${ticket.userName}`);
          const vendor = await Vendor.findOne({ 
            $or: [
              { email: { $regex: new RegExp(`^${ticket.userEmail}$`, 'i') } },
              { name: { $regex: new RegExp(`^${ticket.userName}$`, 'i') } }
            ] 
          });
          
          if (vendor) {
            console.log(`Found role: ${vendor.role} for ${ticket.userName}`);
            return { ...ticket, userRole: vendor.role };
          } else {
            console.log(`No vendor found for ${ticket.userName}`);
          }
        }
        return ticket;
      }));
    }

    res.status(200).json(tickets);
  } catch (err) {
    next(err);
  }
};

// @desc    Get user tickets
// @route   GET /api/tickets/my
// @access  Private
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.query.userId }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id
// @access  Private/Admin
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
};

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
exports.addMessage = async (req, res, next) => {
  try {
    const { sender, text } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({ sender, text });
    await ticket.save();

    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    next(err);
  }
};
