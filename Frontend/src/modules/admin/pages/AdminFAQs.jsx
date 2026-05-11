import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Trash2, 
    HelpCircle, 
    User, 
    Store, 
    Search,
    ChevronDown,
    Loader2,
    CheckCircle2,
    X,
    Menu
} from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

const AdminFAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [activeTab, setActiveTab] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showRoleMenu, setShowRoleMenu] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        type: 'customer',
        role: 'all'
    });

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/faqs?type=${activeTab}`);
            const data = await response.json();
            setFaqs(data);
        } catch (err) {
            toast.error("Failed to load FAQs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, [activeTab]);

    const handleAddFAQ = async (e) => {
        e.preventDefault();
        if (!formData.question || !formData.answer) return toast.error("Please fill all fields");

        try {
            const response = await fetch('http://localhost:5000/api/faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success("FAQ added successfully!");
                setIsAddModalOpen(false);
                setFormData({ question: '', answer: '', type: 'customer' });
                fetchFAQs();
            }
        } catch (err) {
            toast.error("Failed to add FAQ");
        }
    };

    const handleDeleteFAQ = async (id) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success("FAQ removed");
                fetchFAQs();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activePage="faqs" />

            <div className="flex-1 lg:ml-64 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition-all shrink-0">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Manage FAQs.</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Configure support content for users and vendors</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C44545] transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all w-full md:w-80 shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#C44545] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#C44545]/20 hover:scale-105 transition-all active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Add FAQ
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit mb-8">
                    <button 
                        onClick={() => setActiveTab('customer')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'customer' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <User size={14} />
                            Customers
                        </div>
                    </button>
                    <button 
                        onClick={() => setActiveTab('vendor')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vendor' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Store size={14} />
                            Vendors
                        </div>
                    </button>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Loading FAQs...</span>
                            </div>
                        ) : filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <motion.div 
                                    key={faq._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 flex items-start justify-between group"
                                >
                                    <div className="flex-1 pr-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-6 w-6 bg-rose-50 text-[#C44545] rounded-lg flex items-center justify-center">
                                                <HelpCircle size={14} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{faq.question}</h3>
                                        </div>
                                        <p className="text-slate-500 font-medium text-[14px] leading-relaxed pl-8 border-l-2 border-slate-100 italic">
                                            "{faq.answer}"
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteFAQ(faq._id)}
                                        className="h-12 w-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <HelpCircle size={40} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">No FAQs Found</h3>
                                <p className="text-slate-400 text-sm max-w-xs mt-2">Start adding common questions to help your users.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add FAQ Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="bg-[#C44545] p-8 text-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Add New FAQ</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Configure automated support</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddFAQ} className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['customer', 'vendor'].map(type => (
                                            <button 
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({...formData, type})}
                                                className={`py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${formData.type === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                                            >
                                                {type}s
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.type === 'vendor' && (
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Vendor Role</label>
                                        <div className="relative">
                                            <button 
                                                type="button"
                                                onClick={() => setShowRoleMenu(!showRoleMenu)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 flex items-center justify-between hover:bg-white transition-all"
                                            >
                                                <span className="uppercase tracking-widest text-xs">
                                                    {formData.role === 'all' ? 'All Vendors' : 
                                                     formData.role === 'driver' ? 'Drivers' : 
                                                     formData.role === 'mechanic' ? 'Mechanics' : 
                                                     formData.role === 'towing' ? 'Towing Partners' : 
                                                     formData.role === 'rto' ? 'RTO Consultants' : 'Legal Advisors'}
                                                </span>
                                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {showRoleMenu && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 5, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute top-full left-0 right-0 z-[110] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2"
                                                    >
                                                        {[
                                                            { id: 'all', label: 'All Vendors' },
                                                            { id: 'driver', label: 'Drivers' },
                                                            { id: 'mechanic', label: 'Mechanics' },
                                                            { id: 'towing', label: 'Towing Partners' },
                                                            { id: 'rto', label: 'RTO Consultants' },
                                                            { id: 'legal', label: 'Legal Advisors' }
                                                        ].map(role => (
                                                            <button 
                                                                key={role.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({...formData, role: role.id});
                                                                    setShowRoleMenu(false);
                                                                }}
                                                                className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${formData.role === role.id ? 'bg-rose-50 text-[#C44545]' : 'text-slate-500 hover:bg-slate-50'}`}
                                                            >
                                                                {role.label}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Question</label>
                                    <input 
                                        type="text"
                                        value={formData.question}
                                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                                        placeholder="What is the common question?"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Answer</label>
                                    <textarea 
                                        rows="4"
                                        value={formData.answer}
                                        onChange={(e) => setFormData({...formData, answer: e.target.value})}
                                        placeholder="Provide a clear and helpful answer..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full h-16 bg-[#C44545] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-[#C44545]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <CheckCircle2 size={18} strokeWidth={3} />
                                    Publish FAQ
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminFAQs;
