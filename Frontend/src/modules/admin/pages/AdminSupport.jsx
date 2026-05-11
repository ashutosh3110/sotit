import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Filter, 
    Menu, 
    User, 
    Store, 
    MessageCircle, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    Mail,
    Phone,
    Loader2,
    Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";
import SupportChatModal from "../components/SupportChatModal";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const AdminSupport = () => {
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'vendor'
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chat State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets?userType=${activeTab}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setTickets(data);
            } else {
                setTickets([]);
            }
        } catch (err) {
            toast.error("Failed to fetch tickets");
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                toast.success(`Status updated to ${newStatus}`);
                // Notify via Socket
                socket.emit("update_status", { ticketId: id, status: newStatus });
                fetchTickets();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteTicket = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success("Ticket deleted");
                fetchTickets();
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Open: "bg-rose-100 text-rose-600 border-rose-200",
            Pending: "bg-amber-100 text-amber-600 border-amber-200",
            Resolved: "bg-emerald-100 text-emerald-600 border-emerald-200"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            High: "text-rose-500",
            Medium: "text-amber-500",
            Low: "text-emerald-500"
        };
        return (
            <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full bg-current ${styles[priority]}`} />
                <span className={`text-[11px] font-bold ${styles[priority]}`}>{priority}</span>
            </div>
        );
    };

    const filteredTickets = tickets.filter(t => 
        t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter overflow-x-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activePage="support" />

            <div className="flex-1 lg:ml-64 p-4 md:p-8 w-full max-w-full overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition-all shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Help & Support.</h1>
                            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 tracking-tight">Manage user and vendor inquiries</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C44545] transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search ticket ID or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all w-full shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit mb-8 overflow-x-auto">
                    <button 
                        onClick={() => {
                            setActiveTab('customer');
                            setTickets([]);
                        }}
                        className={`px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'customer' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <User size={14} />
                            Customers
                        </div>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('vendor');
                            setTickets([]);
                        }}
                        className={`px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'vendor' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Store size={14} />
                            Vendors
                        </div>
                    </button>
                </div>

                {/* Main Table Content */}
                <div className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 w-full max-w-full">
                    <div className="w-full overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px] border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Ticket Details</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Priority</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-[#C44545]" size={32} />
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fetching Real Data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-black shadow-inner border border-slate-100 ${activeTab === 'customer' ? 'bg-rose-50 text-[#C44545]' : 'bg-blue-50 text-blue-600'}`}>
                                                    {ticket.userName?.[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-900 tracking-tight">{ticket.userName}</span>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                                            activeTab === 'vendor' 
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                        }`}>
                                                            {ticket.userRole || (activeTab === 'vendor' ? 'Partner' : 'Customer')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400 mt-1">{ticket.userEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 leading-relaxed">
                                                    {ticket.subject.split(' ').length > 10 
                                                        ? ticket.subject.split(' ').slice(0, 10).join(' ') + '...' 
                                                        : ticket.subject}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-center">
                                            <div className="flex justify-center">
                                                <PriorityBadge priority={ticket.priority} />
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <StatusBadge status={ticket.status} />
                                                {ticket.status !== 'Resolved' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(ticket._id, 'Resolved')}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setIsChatOpen(true);
                                                    }}
                                                    className="h-9 w-9 md:h-10 md:w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] hover:bg-[#C44545] hover:text-white transition-all shadow-sm active:scale-90"
                                                >
                                                    <MessageCircle size={18} strokeWidth={2.5} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTicket(ticket._id)}
                                                    className="h-9 w-9 md:h-10 md:w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <MessageCircle size={48} strokeWidth={1} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">No tickets found</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 md:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredTickets.length} entries</span>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed shadow-sm">Prev</button>
                            <button className="px-4 py-2 bg-[#C44545] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C44545]/20 hover:scale-105 active:scale-95 transition-all">Next</button>
                        </div>
                    </div>
                </div>

                <SupportChatModal 
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    ticket={selectedTicket}
                    isAdmin={true}
                />
            </div>
        </div>
    );
};

export default AdminSupport;
