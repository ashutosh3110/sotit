import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronLeft, 
    MessageCircle, 
    HelpCircle, 
    Plus, 
    History, 
    ChevronRight,
    Send,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Loader2,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorData } from "../utils/vendorStore";
import toast from "react-hot-toast";
import SupportChatModal from "../../admin/components/SupportChatModal";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const VendorSupport = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('menu'); // 'menu', 'create', 'history'
    const [user, setUser] = useState(getVendorData());
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [faqs, setFaqs] = useState([]);
    
    // Chat State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'Medium',
        message: ''
    });

    const fetchMyTickets = async () => {
        const currentUserId = user?.profile?.id || user?.profile?._id || user?.id || user?._id;
        if (!currentUserId) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets/my?userId=${currentUserId}`);
            const data = await response.json();
            if (Array.isArray(data)) setTickets(data);
        } catch (err) {
            console.error("Failed to fetch tickets");
        }
    };

    const fetchFAQs = async () => {
        const role = user?.profile?.role || user?.role || 'all';
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/faqs?type=vendor&role=${role}`);
            const data = await response.json();
            if (Array.isArray(data)) setFaqs(data);
        } catch (err) {
            console.error("Failed to fetch FAQs");
        }
    };

    useEffect(() => {
        const currentUserId = user?.profile?.id || user?.profile?._id || user?.id || user?._id;
        if (currentUserId) {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    userName: user?.profile?.name || user?.name || 'Vendor',
                    userEmail: user?.profile?.email || user?.email,
                    userRole: user?.profile?.role || user?.role || 'Partner',
                    subject: formData.subject,
                    priority: formData.priority,
                    userType: 'vendor'
                })
            });

            if (response.ok) {
                toast.success("Support ticket created!");
                setFormData({ subject: '', priority: 'Medium', message: '' });
                setView('history');
                fetchMyTickets();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to create ticket");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const MenuCard = ({ icon: Icon, title, desc, onClick, color }) => (
        <motion.button 
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 text-left"
        >
            <div className={`h-16 w-16 ${color} rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-current/10`}>
                <Icon size={28} className="text-white" />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">{desc}</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300" size={20} />
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-inter pb-20">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3.5rem] shadow-sm sticky top-0 z-50">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => view === 'menu' ? navigate(-1) : setView('menu')} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 active:scale-90 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Help Center</span>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter">Vendor Support.</h1>
                    </div>
                    <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545]">
                        <ShieldCheck size={24} />
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'menu' && (
                        <motion.div 
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <MenuCard 
                                icon={Plus}
                                title="Create New Ticket"
                                desc="Report an issue or ask for technical help"
                                onClick={() => setView('create')}
                                color="bg-slate-900"
                            />
                            <MenuCard 
                                icon={History}
                                title="Ticket History"
                                desc="View and track your previous support requests"
                                onClick={() => setView('history')}
                                color="bg-[#C44545]"
                            />
                        </motion.div>
                    )}

                    {view === 'create' && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic">Raise a Ticket</h2>
                                
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject / Issue</label>
                                        <input 
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            placeholder="What can we help you with?"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Priority Level</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Low', 'Medium', 'High'].map(p => (
                                                <button 
                                                    key={p}
                                                    onClick={() => setFormData({...formData, priority: p})}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSubmitTicket}
                                        disabled={loading}
                                        className="w-full h-16 bg-[#C44545] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-[#C44545]/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} strokeWidth={3} /> Submit Request</>}
                                    </button>
                                </div>
                            </div>
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
                                <div key={ticket._id} className="bg-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/40 border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{ticket.ticketId}</span>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                                            ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                                            'bg-rose-50 text-rose-600'
                                        }`}>
                                            {ticket.status}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-slate-900 tracking-tight mb-2">{ticket.subject}</h3>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
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
                    <h3 className="text-[13px] font-black uppercase text-neutral-400 tracking-[0.25em] mb-6 pl-1 border-l-4 border-[#C44545] h-4 flex items-center uppercase">Vendor FAQs</h3>
                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <span className="text-sm font-black text-slate-900 tracking-tight pr-4">{faq.question}</span>
                                    <ChevronDown size={18} className="text-slate-300 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-6 pb-6 text-slate-500 text-xs font-medium leading-relaxed italic border-l-4 border-rose-50 ml-6 mb-4">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChevronDown = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default VendorSupport;
