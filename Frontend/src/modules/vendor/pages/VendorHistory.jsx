import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle2, ChevronRight, Activity, Wallet, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getVendorData } from "../utils/vendorStore";
import { useNavigate } from "react-router-dom";

const VendorHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const vendor = getVendorData();

    const fetchHistory = async () => {
        const token = vendor?.profile?.token;
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/vendor/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (err) {
            console.error("History fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'hired': return 'text-blue-500 bg-blue-50 border-blue-100';
            case 'completed': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'cancelled': return 'text-rose-500 bg-rose-50 border-rose-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-32 font-inter">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-8 border-b border-slate-100 sticky top-0 z-20 shadow-sm shadow-slate-200/50">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-[#C44545]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Logs</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Job History.</h1>
                <p className="text-xs font-bold text-slate-400 mt-1">Review your past earnings and successful leads.</p>
            </div>

            <div className="p-6 space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                    ))
                ) : history.length > 0 ? (
                    history.map((job) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={job._id} 
                            className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 group hover:border-[#C44545]/20 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                                        {job.customer?.profilePicture?.url ? (
                                            <img src={job.customer.profilePicture.url} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-black text-slate-300 uppercase">{job.customer?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight">{job.customer?.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Wallet size={14} className="text-emerald-500" />
                                        <span className="text-xs font-black text-slate-900 tracking-tight">-₹5.00</span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-slate-100" />
                                    <div className="flex items-center gap-1.5">
                                        <Activity size={14} className="text-[#C44545]" />
                                        <span className="text-xs font-black text-slate-900 tracking-tight capitalize">{job.role}</span>
                                    </div>
                                </div>
                                <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-[#C44545] hover:text-white transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
                            <Clock size={40} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">No History Found</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 px-10">Start accepting marketplace leads to build your professional record.</p>
                        <button 
                            onClick={() => navigate('/vendor/jobs')}
                            className="mt-8 px-8 py-3.5 bg-[#C44545] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all"
                        >
                            Find New Jobs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorHistory;
