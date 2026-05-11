const express = require('express');
const { 
    createTicket, 
    getAllTickets, 
    getMyTickets, 
    getTicketById,
    updateTicketStatus,
    addMessage,
    deleteTicket
} = require('../controllers/ticketController');

const router = express.Router();

router.post('/', createTicket);
router.get('/', getAllTickets);
router.get('/my', getMyTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicketStatus);
router.post('/:id/messages', addMessage);
router.delete('/:id', deleteTicket);

module.exports = router;
