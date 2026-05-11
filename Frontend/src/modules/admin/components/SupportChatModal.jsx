import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Initialize socket outside component to prevent multiple connections
const socket = io("http://localhost:5000");

const SupportChatModal = ({ isOpen, onClose, ticket, isAdmin = false }) => {
    const [messages, setMessages] = useState(ticket?.messages || []);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && ticket?._id) {
            // Join the ticket room
            socket.emit("join_ticket", ticket._id);
            setMessages(ticket.messages || []);
        }
    }, [isOpen, ticket?._id]);

    useEffect(() => {
        // Listen for new messages
        socket.on("receive_message", (data) => {
            if (data.ticketId === ticket?._id) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [ticket?._id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            ticketId: ticket._id,
            sender: isAdmin ? 'admin' : 'user',
            text: newMessage,
            createdAt: new Date().toISOString()
        };

        setSending(true);
        try {
            // 1. Save to Database
            const response = await fetch(`http://localhost:5000/api/tickets/${ticket._id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: messageData.sender,
                    text: messageData.text
                })
            });

            if (response.ok) {
                // 2. Emit to Socket for real-time delivery
                socket.emit("send_message", messageData);
                
                // 3. Update local state
                setMessages((prev) => [...prev, messageData]);
                setNewMessage("");
            }
        } catch (err) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 md:px-0">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-lg h-[600px] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-[#C44545] p-6 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                {isAdmin ? <User size={24} /> : <ShieldCheck size={24} />}
                            </div>
                            <div>
                                <h3 className="font-black tracking-tight text-lg leading-tight">
                                    {isAdmin ? ticket.userName : "Admin Support"}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                                    Ticket ID: {ticket.ticketId}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
                    >
                        {messages.length > 0 ? messages.map((msg, idx) => {
                            const isMe = (isAdmin && msg.sender === 'admin') || (!isAdmin && msg.sender === 'user');
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-[#C44545] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                        <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                        <p className={`text-[9px] mt-1 font-black uppercase opacity-60 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                                <MessageCircle size={48} strokeWidth={1} className="mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">No messages yet</span>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex items-center gap-3">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="h-14 w-14 bg-[#C44545] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#C44545]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SupportChatModal;
