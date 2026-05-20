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
    const [activeTab, setActiveTab] = useState('customer'); // 'customer', 'vendor', or 'queries'
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chat / Query State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            if (activeTab === 'queries') {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`);
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setTickets(data.data);
                } else {
                    setTickets([]);
                }
            } else {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets?userType=${activeTab}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setTickets(data);
                } else {
                    setTickets([]);
                }
            }
        } catch (err) {
            toast.error("Failed to fetch support data");
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
            const url = activeTab === 'queries'
                ? `${import.meta.env.VITE_API_URL}/contact/${id}`
                : `${import.meta.env.VITE_API_URL}/tickets/${id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                toast.success(`Status updated to ${newStatus}`);
                if (activeTab !== 'queries') {
                    // Notify via Socket
                    socket.emit("update_status", { ticketId: id, status: newStatus });
                }
                fetchTickets();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteTicket = async (id) => {
        const label = activeTab === 'queries' ? 'query' : 'ticket';
        if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;
        try {
            const url = activeTab === 'queries'
                ? `${import.meta.env.VITE_API_URL}/contact/${id}`
                : `${import.meta.env.VITE_API_URL}/tickets/${id}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success(`${label === 'query' ? 'Query' : 'Ticket'} deleted`);
                fetchTickets();
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const StatusBadge = ({ status }) => {
        if (activeTab === 'queries') {
            const styles = {
                new: "bg-rose-100 text-rose-600 border-rose-200",
                read: "bg-blue-100 text-blue-600 border-blue-200",
                replied: "bg-amber-100 text-amber-600 border-amber-200",
                closed: "bg-emerald-100 text-emerald-600 border-emerald-200"
            };
            return (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
                    {status}
                </span>
            );
        }
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

    const filteredTickets = tickets.filter(t => {
        if (activeTab === 'queries') {
            return (
                (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.message || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return (
            (t.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter overflow-x-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activePage="support" />

            <div className="flex-1 lg:ml-72 p-4 md:p-8 w-full max-w-full overflow-hidden">
                <div className="max-w-[1400px] mx-auto w-full">
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
                                <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 tracking-tight">Manage user tickets and general website contact queries</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C44545] transition-colors" size={16} />
                                <input 
                                    type="text"
                                    placeholder={activeTab === 'queries' ? "Search name, email or subject..." : "Search ticket ID or name..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all w-full shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-xl w-fit mb-8 overflow-x-auto">
                        <button 
                            onClick={() => {
                                setActiveTab('customer');
                                setTickets([]);
                            }}
                            className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                            className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'vendor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                        <div className="flex items-center gap-2">
                            <Store size={14} />
                            Vendors
                        </div>
                    </button>
                        <button 
                            onClick={() => {
                                setActiveTab('queries');
                                setTickets([]);
                            }}
                            className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'queries' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <MessageCircle size={14} />
                                Contact Queries
                            </div>
                        </button>
                    </div>

                {/* Main Table Content */}
                <div className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 w-full max-w-full">
                    <div className="w-full overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px] border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {activeTab === 'queries' ? (
                                        <>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Sender Details</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Submitted At</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Ticket Details</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Priority</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                            <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                        </>
                                    )}
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
                                ) : filteredTickets.length > 0 ? filteredTickets.map((item) => {
                                    if (activeTab === 'queries') {
                                        return (
                                            <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 md:px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-black shadow-inner border border-slate-100 bg-[#C44545]/10 text-[#C44545]">
                                                            {item.name?.[0] || 'Q'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 tracking-tight">{item.name}</span>
                                                            <span className="text-[10px] font-medium text-slate-400 mt-1">{item.email}</span>
                                                            {item.phone && <span className="text-[9px] font-bold text-slate-400">{item.phone}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700 leading-relaxed">
                                                            {item.subject}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs">{item.message}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-6 text-center">
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 md:px-8 py-6 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <StatusBadge status={item.status} />
                                                        {item.status === 'new' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item._id, 'read')}
                                                                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                                                            >
                                                                Mark Read
                                                            </button>
                                                        )}
                                                        {item.status === 'read' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(item._id, 'closed')}
                                                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                                                            >
                                                                Close
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedQuery(item);
                                                                if (item.status === 'new') {
                                                                    handleUpdateStatus(item._id, 'read');
                                                                }
                                                            }}
                                                            className="px-3.5 py-1.5 bg-[#C44545]/10 text-[#C44545] font-black uppercase tracking-widest rounded-xl text-[9px] hover:bg-[#C44545] hover:text-white transition-all shadow-sm active:scale-95"
                                                        >
                                                            View Message
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTicket(item._id)}
                                                            className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-black shadow-inner border border-slate-100 ${activeTab === 'customer' ? 'bg-rose-50 text-[#C44545]' : 'bg-blue-50 text-blue-600'}`}>
                                                        {item.userName?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-slate-900 tracking-tight">{item.userName}</span>
                                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                                                activeTab === 'vendor' 
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                                            }`}>
                                                                {item.userRole || (activeTab === 'vendor' ? 'Partner' : 'Customer')}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-slate-400 mt-1">{item.userEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 leading-relaxed">
                                                        {item.subject.split(' ').length > 10 
                                                            ? item.subject.split(' ').slice(0, 10).join(' ') + '...' 
                                                            : item.subject}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-center">
                                                <div className="flex justify-center">
                                                    <PriorityBadge priority={item.priority} />
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <StatusBadge status={item.status} />
                                                    {item.status !== 'Resolved' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(item._id, 'Resolved')}
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
                                                            setSelectedTicket(item);
                                                            setIsChatOpen(true);
                                                        }}
                                                        className="h-9 w-9 md:h-10 md:w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] hover:bg-[#C44545] hover:text-white transition-all shadow-sm active:scale-90"
                                                    >
                                                        <MessageCircle size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteTicket(item._id)}
                                                        className="h-9 w-9 md:h-10 md:w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <MessageCircle size={48} strokeWidth={1} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">No entries found</span>
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
            </div>

            <SupportChatModal 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                    ticket={selectedTicket}
                    isAdmin={true}
                />

                {/* Custom Modal for viewing static Contact Query Details */}
                <AnimatePresence>
                    {selectedQuery && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedQuery(null)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />

                            {/* Modal Box */}
                            <motion.div
                                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                                className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl z-10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C44545]/5 rounded-full blur-2xl" />
                                
                                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-[#C44545]/10 rounded-xl flex items-center justify-center text-[#C44545]">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 tracking-tight">Contact Query Details</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Submitted via Web Page</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedQuery(null)}
                                        className="h-8 w-8 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 text-left">
                                    {/* Name and Email */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sender Name</span>
                                            <span className="text-sm font-black text-slate-800 mt-0.5 block">{selectedQuery.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                                            <span className="text-sm font-semibold text-slate-800 mt-0.5 block break-all">{selectedQuery.email}</span>
                                        </div>
                                    </div>

                                    {/* Phone and Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Phone Number</span>
                                            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                                                {selectedQuery.phone || <em className="text-slate-400 font-normal">Not Provided</em>}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Submitted On</span>
                                            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                                                {new Date(selectedQuery.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Subject</span>
                                        <span className="text-xs font-bold text-slate-800">{selectedQuery.subject}</span>
                                    </div>

                                    {/* Message */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Message Body</span>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto custom-scrollbar">
                                            {selectedQuery.message}
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        {selectedQuery.status !== 'closed' && (
                                            <button 
                                                onClick={() => {
                                                    handleUpdateStatus(selectedQuery._id, 'closed');
                                                    setSelectedQuery(null);
                                                }}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> Close Query
                                            </button>
                                        )}
                                        <a 
                                            href={`mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(selectedQuery.subject)}`}
                                            className="flex-1 bg-[#C44545] hover:bg-[#b03a3a] text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-[#C44545]/10 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                                        >
                                            <Mail size={14} /> Send Email Reply
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminSupport;
