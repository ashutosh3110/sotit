import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, 
    Users, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Search, 
    Filter, 
    Download, 
    MoreHorizontal, 
    Eye, 
    AlertCircle,
    CheckCircle2,
    Calendar,
    ArrowRight,
    TrendingUp,
    Shield,
    Plus,
    History,
    Briefcase,
    Menu,
    Loader2,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

const AdminWallet = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("users"); // "users" or "vendors"
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [data, setData] = useState({
        stats: {
            totalLiquidity: 0,
            totalUserBalance: 0,
            totalVendorBalance: 0,
            todayRechargeTotal: 0,
            systemRevenue: 0
        },
        users: [],
        vendors: [],
        transactions: []
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('http://localhost:5000/api/wallet/admin/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setData(result);
            } else {
                toast.error(result.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Server connection failed");
        } finally {
            setIsLoading(false);
        }
    };

    const [selectedAccount, setSelectedAccount] = useState(null); // For history modal

    const stats = [
        { label: "Platform Liquidity", value: `₹${data.stats.totalLiquidity.toLocaleString()}`, icon: Wallet, color: "text-[#C44545]", bg: "bg-rose-50" },
        { label: "Vendor Earnings", value: `₹${data.stats.totalVendorBalance.toLocaleString()}`, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Today's Volume", value: `₹${data.stats.todayRechargeTotal.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Refund Pool", value: "₹0", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const filteredList = (activeTab === 'users' ? data.users : data.vendors).filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.mobile?.includes(searchTerm)
    );

    const getAccountHistory = (accountId) => {
        return data.transactions.filter(tx => 
            (tx.userType === 'user' && tx.userId?._id === accountId) || 
            (tx.userType === 'vendor' && tx.vendorId?._id === accountId)
        );
    };

    return (
        <div className="bg-neutral-50 min-h-screen font-inter flex">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-72 flex flex-col">
                {/* Header */}
                <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-900 border border-black/5 shadow-sm"
                        >
                            <Menu size={20} strokeWidth={2.5} />
                        </button>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">System Console</span>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Wallet Hub.</h1>
                        </div>
                    </div>
                    {isLoading && <Loader2 className="animate-spin text-[#C44545]" size={20} />}
                </header>

                <div className="p-8">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Platform Liquidity.</h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Real-time revenue tracking</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-[#C44545]/20 transition-all"
                            >
                                <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</h3>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Directory */}
                        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                            <div className="p-8 border-b border-slate-50">
                                <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
                                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                        <button 
                                            onClick={() => setActiveTab('users')}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-[#C44545] shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Customer
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('vendors')}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vendors' ? 'bg-white text-[#C44545] shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Partner
                                        </button>
                                    </div>
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text"
                                            placeholder={`Search ${activeTab === 'users' ? 'customers' : 'partners'}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto px-4 pb-4">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Account Details</th>
                                            <th className="px-6 py-4">Balance</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right pr-10">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredList.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xs shadow-inner uppercase">
                                                            {item.name?.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-900 tracking-tight">{item.name}</span>
                                                                {activeTab === 'vendors' && (
                                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border shadow-sm ${
                                                                        item.role === 'mechanic' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                        item.role === 'driver' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                        item.role === 'towing' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                        item.role === 'rto' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                        item.role === 'legal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                        'bg-slate-100 text-slate-500 border-slate-200'
                                                                    }`}>
                                                                        {item.role || 'Partner'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.mobile || item.phone}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 tracking-tighter">₹{item.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Verified</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Approved' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {item.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right pr-10">
                                                    <button 
                                                        onClick={() => setSelectedAccount(item)}
                                                        className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#C44545] hover:border-rose-100 transition-all shadow-sm active:scale-90 ml-auto group-hover:shadow-lg"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* System Log */}
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">System Log.</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Platform-wide audit trail</p>
                                </div>
                                <div className="h-10 w-10 bg-rose-50 text-[#C44545] rounded-xl flex items-center justify-center group relative cursor-help">
                                    <History size={18} strokeWidth={3} />
                                    <div className="absolute bottom-full right-0 mb-3 w-48 bg-slate-900 text-white p-3 rounded-2xl text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                                        System Log tracks every financial movement (recharges, payouts, refunds) across the entire platform.
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
                                {data.transactions
                                    .filter(tx => activeTab === 'users' ? tx.userType === 'user' : tx.userType === 'vendor')
                                    .map((tx, i) => (
                                    <div key={i} className="flex gap-6 relative z-10">
                                        <div className={`h-12 w-12 shrink-0 ${tx.userType === 'user' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center shadow-lg shadow-white`}>
                                            {tx.userType === 'user' ? <Users size={18} /> : <Briefcase size={18} />}
                                        </div>
                                        <div className="flex-1 pb-2 min-w-0">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="text-[13px] font-black text-slate-900 tracking-tight truncate leading-none">{tx.actor}</h4>
                                                <span className={`text-sm font-black tracking-tighter ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.type} • {tx.status}</span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {selectedAccount && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-[#C44545] rounded-[2rem] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-[#C44545]/20">
                                        {selectedAccount.name?.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedAccount.name}</h3>
                                        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">{selectedAccount.mobile || selectedAccount.phone} • Account Ledger</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedAccount(null)}
                                    className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 hover:text-slate-900 transition-all active:scale-90"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₹{selectedAccount.walletBalance?.toLocaleString()}</h4>
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Transactions</p>
                                        <h4 className="text-2xl font-black text-emerald-700 tracking-tighter">
                                            {data.transactions.filter(tx => (tx.userType === 'user' ? tx.userId?._id : tx.vendorId?._id) === selectedAccount._id).length}
                                        </h4>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] pl-1 border-l-4 border-[#C44545]">Detailed Ledger</h5>
                                    <div className="space-y-4">
                                        {data.transactions
                                            .filter(tx => (tx.userType === 'user' ? tx.userId?._id : tx.vendorId?._id) === selectedAccount._id)
                                            .map((tx, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl group hover:border-[#C44545]/10 transition-all shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} rounded-xl flex items-center justify-center`}>
                                                        {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 capitalize">{tx.type}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(tx.date).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                        {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                                    Download Statement
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminWallet;
