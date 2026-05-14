import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, User, ChevronRight, Activity, Wallet, ShieldCheck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const UserHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const token = userData?.profile?.token;

        if (!token) {
            toast.error("Please login to see history");
            navigate('/user/login');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/user/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error("History Error:", error);
            toast.error("Failed to load history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'hired': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-32 font-inter">
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/user')} className="h-10 w-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                        <ArrowLeft size={18} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">My Requests.</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Track your service history</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-5">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                    ))
                ) : history.length > 0 ? (
                    history.map((req) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={req._id} 
                            className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                    {req.vendor?.profileImage?.url ? (
                                        <img src={req.vendor.profileImage.url} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-black text-slate-300 uppercase">{req.vendor?.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">{req.vendor?.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{req.role}</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-bold">{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                                    <Wallet size={12} className="text-[#C44545]" />
                                    <span className="text-[11px] font-black text-[#C44545] tracking-tight">₹{req.customerDeduction}.00 Paid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {req.status === 'hired' && (
                                        <a href={`tel:${req.vendor?.mobile}`} className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95 transition-all">
                                            Contact Now
                                        </a>
                                    )}
                                    <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Activity size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">No Requests Yet</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2 px-10">Your hiring history will appear here once you send a request to an expert.</p>
                        <button onClick={() => navigate('/user/find')} className="mt-8 px-8 py-3.5 bg-[#C44545] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all">
                            Hire Expert Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserHistory;
