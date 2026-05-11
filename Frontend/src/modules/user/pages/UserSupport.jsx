import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    MessageCircle, 
    ChevronRight, 
    ShieldCheck, 
    History, 
    Plus, 
    Send, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    User,
    Mail,
    Tag,
    ChevronDown,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../utils/userStore";
import toast from "react-hot-toast";
import SupportChatModal from "../../admin/components/SupportChatModal";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const UserSupport = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('menu'); // 'menu', 'create', 'history'
    const [user, setUser] = useState(getUserData());
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [faqs, setFaqs] = useState([]);
    
    // Chat State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'Medium'
    });

    useEffect(() => {
        const data = getUserData();
        if (data) setUser(data);
    }, []);

    const fetchMyTickets = async () => {
        const currentUserId = user?.profile?.id || user?.profile?._id || user?.id || user?._id;
        if (!currentUserId) return;
        try {
            const response = await fetch(`http://localhost:5000/api/tickets/my?userId=${currentUserId}`);
            const data = await response.json();
            if (Array.isArray(data)) setTickets(data);
        } catch (err) {
            console.error("Failed to fetch tickets");
        }
    };

    const fetchFAQs = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/faqs?type=customer`);
            const data = await response.json();
            if (Array.isArray(data)) setFaqs(data);
        } catch (err) {
            console.error("Failed to fetch FAQs");
        }
    };

    useEffect(() => {
        if (user?.profile?.id || user?.profile?._id || user?.id || user?._id) {
            fetchMyTickets();
        }
        fetchFAQs();

        // Listen for status updates
        socket.on("status_changed", (data) => {
            fetchMyTickets();
            toast.success(`Ticket ${data.ticketId} status updated to ${data.status}`);
        });

        return () => {
            socket.off("status_changed");
        };
    }, [user]);

    const handleSubmitTicket = async () => {
        if (!formData.subject) return toast.error("Please enter a subject");
        const currentUserId = user?.profile?.id || user?.profile?._id || user?.id || user?._id;
        
        if (!currentUserId) {
            return toast.error("User ID not found. Please log in again.");
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    userName: user?.profile?.name || user?.name || 'User',
                    userEmail: user?.profile?.email || user?.email,
                    subject: formData.subject,
                    priority: formData.priority,
                    userType: 'customer'
                })
            });
            if (response.ok) {
                toast.success("Ticket created successfully!");
                fetchMyTickets();
                setView('history');
                setFormData({ subject: '', priority: 'Medium' });
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to create ticket");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
            Pending: "bg-amber-50 text-amber-600 border-amber-100",
            Open: "bg-rose-50 text-rose-600 border-rose-100"
        };
        const Icon = status === 'Resolved' ? CheckCircle2 : status === 'Pending' ? Clock : AlertCircle;
        
        return (
            <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${styles[status]}`}>
                <Icon size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
            </div>
        );
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="bg-neutral-50 min-h-screen pb-24 font-inter text-slate-900">
            {/* Header */}
            <div className="px-5 pt-10 pb-12 bg-[#C44545] text-white rounded-b-[3rem] shadow-2xl shadow-[#C44545]/20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20" />
                <button 
                  onClick={() => view === 'menu' ? navigate(-1) : setView('menu')} 
                  className="absolute left-5 top-10 h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={18} strokeWidth={3} />
                </button>
                <h1 className="text-3xl font-black tracking-tighter mb-2">Support Hub.</h1>
                <p className="text-[14px] font-bold text-white/80 uppercase tracking-widest">
                    {view === 'menu' ? 'How can we help you today?' : view === 'create' ? 'Create a Help Ticket' : 'Your Ticket History'}
                </p>
            </div>

            <div className="px-6 -mt-8 relative z-20">
                <AnimatePresence mode="wait">
                    {view === 'menu' && (
                        <motion.div 
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button 
                                    whileTap={{ scale: 0.98 }} 
                                    onClick={() => setView('create')}
                                    className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/[0.02] flex flex-col items-center gap-3 active:bg-slate-50 transition-all"
                                >
                                    <div className="h-12 w-12 bg-[#C44545] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#C44545]/20">
                                        <Plus size={24} strokeWidth={3} />
                                    </div>
                                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-900 text-center">New Ticket</span>
                                </motion.button>
                                <motion.button 
                                    whileTap={{ scale: 0.98 }} 
                                    onClick={() => setView('history')}
                                    className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/[0.02] flex flex-col items-center gap-3 active:bg-slate-50 transition-all"
                                >
                                    <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <History size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-900 text-center">History</span>
                                </motion.button>
                            </div>

                            {/* Removed Common Topics */}
                        </motion.div>
                    )}

                    {view === 'create' && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-2xl shadow-black/[0.02] space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Your Identity</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="h-10 w-10 bg-[#C44545] text-white rounded-xl flex items-center justify-center font-black">
                                            {user?.profile?.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[14px] font-black text-slate-900">{user?.profile?.name || 'Guest User'}</span>
                                            <span className="text-[11px] font-bold text-slate-400">{user?.profile?.email || 'No email registered'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1 text-left block">What is your issue?</label>
                                    <div className="relative group">
                                        <div className="absolute top-5 left-5 text-[#C44545]">
                                            <Tag size={18} />
                                        </div>
                                        <textarea 
                                            rows="3"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            placeholder="Write your subject here..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1 text-left block">Set Priority</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Low', 'Medium', 'High'].map((p) => (
                                            <button 
                                                key={p}
                                                onClick={() => setFormData({...formData, priority: p})}
                                                className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${formData.priority === p ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmitTicket}
                                disabled={loading}
                                className="w-full h-16 bg-[#C44545] text-white rounded-[1.8rem] flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-[0.3em] shadow-xl shadow-[#C44545]/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
                            </motion.button>
                        </motion.div>
                    )}

                    {view === 'history' && (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {tickets.length > 0 ? tickets.map((ticket) => (
                                <div key={ticket._id} className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/[0.02] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                ID
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-[14px] font-black text-slate-900">{ticket.ticketId}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{timeAgo(ticket.createdAt)}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                    <div className="flex flex-col gap-1 text-left">
                                        <span className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Issue Subject</span>
                                        <p className="text-[14px] font-bold text-slate-700 leading-snug">{ticket.subject}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${ticket.priority === 'High' ? 'bg-rose-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{ticket.priority} Priority</span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setIsChatOpen(true);
                                            }}
                                            className="px-4 py-2 bg-rose-50 text-[#C44545] rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <MessageCircle size={14} />
                                            Chat Support
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-100">
                                    <History size={40} strokeWidth={1} className="mb-4" />
                                    <p className="text-[11px] font-black uppercase tracking-widest">No history found</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Support Chat Modal */}
                <SupportChatModal 
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    ticket={selectedTicket}
                    isAdmin={false}
                />

                {/* FAQs Section */}
                <div className="pt-10 pb-10">
                    <h3 className="text-[13px] font-black uppercase text-neutral-400 tracking-[0.25em] mb-6 pl-1 border-l-4 border-[#C44545] h-4 flex items-center uppercase">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                        {faqs.length > 0 ? faqs.map((faq, idx) => (
                            <details key={faq._id || idx} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300">
                                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                    <span className="text-[14px] font-black tracking-tight text-slate-800 text-left">{faq.question}</span>
                                    <ChevronDown size={16} className="text-slate-300 group-open:rotate-180 transition-transform duration-300" />
                                </summary>
                                <div className="px-5 pb-5 pt-0">
                                    <p className="text-[13px] font-bold text-slate-500 leading-relaxed border-t border-slate-50 pt-4 text-left">
                                        {faq.answer}
                                    </p>
                                </div>
                            </details>
                        )) : (
                            <p className="text-center py-10 text-[11px] font-black uppercase text-slate-400 tracking-widest">Loading FAQs...</p>
                        )}
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-slate-100/50 p-8 rounded-[3rem] mt-10 flex flex-col items-center text-center border border-slate-100">
                    <ShieldCheck size={32} className="text-[#C44545] mb-4" strokeWidth={2.5} />
                    <h5 className="text-[13px] font-black uppercase tracking-widest mb-1 text-slate-900">Secure Protocol</h5>
                    <p className="text-[12px] font-bold text-neutral-400 leading-relaxed max-w-[200px]">All communications are encrypted and private.</p>
                </div>
            </div>
        </div>
    );
};

export default UserSupport;
