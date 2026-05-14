import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, 
    ArrowLeft, 
    Plus, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    ShieldCheck, 
    History,
    CreditCard,
    ChevronRight,
    Search,
    Filter,
    Smartphone,
    Building
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../utils/userStore";
import toast from "react-hot-toast";

const UserWallet = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [addAmount, setAddAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const fetchWalletData = async () => {
        try {
            const userData = getUserData();
            const token = userData?.profile?.token;
            
            if (!token) {
                setIsInitialLoading(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                // Token invalid or expired
                setTransactions([]);
                setBalance(0);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setBalance(data.balance);
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleAddMoney = async () => {
        if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsLoading(true);
        try {
            const userData = getUserData();
            const token = userData?.profile?.token;
            
            // 1. Create Order on Backend
            const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ amount: parseFloat(addAmount) })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) throw new Error("Order creation failed");

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Sootit Wallet",
                description: "Wallet Recharge",
                order_id: orderData.order.id,
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/wallet/verify-payment`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        toast.success("Recharge successful!");
                        setAddAmount("");
                        fetchWalletData(); // Refresh balance and history
                    } else {
                        toast.error("Payment verification failed");
                    }
                    setIsLoading(false);
                },
                prefill: {
                    name: userData?.profile?.name || "User",
                    email: userData?.profile?.email || "",
                    contact: userData?.profile?.mobile || ""
                },
                theme: { color: "#C44545" },
                modal: {
                    ondismiss: function() {
                        setIsLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="h-8 w-8 border-4 border-[#C44545] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!getUserData()?.profile?.token) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
                <div className="h-24 w-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] mb-8 shadow-2xl shadow-rose-100">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Re-login Required.</h2>
                <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">Your session has expired or you haven't logged in properly. Please login again to access your wallet.</p>
                <button 
                    onClick={() => navigate('/user/login')}
                    className="w-full h-16 bg-[#C44545] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    Go to Login
                </button>
                <button 
                    onClick={() => navigate(-1)}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const quickAmounts = [100, 500, 1000, 2000];

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-32 font-inter overflow-x-hidden">
            {/* Header */}
            <div className="bg-[#C44545] px-6 pt-12 pb-24 rounded-b-[3.5rem] shadow-2xl shadow-[#C44545]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-11 w-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white active:scale-90 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Sootit Wallet.</h1>
                </div>

                <div className="relative z-10">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Available Balance</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-white/60 text-2xl font-black">₹</span>
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Add Money */}
            <div className="px-6 -mt-14 relative z-20">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-rose-50 text-[#C44545] rounded-xl flex items-center justify-center">
                            <Plus size={20} strokeWidth={3} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Add Money</h3>
                    </div>

                    <div className="relative mb-6">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                        <input 
                            type="number"
                            placeholder="Enter amount"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] py-6 pl-12 pr-6 text-xl font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-[#C44545]/5 focus:border-[#C44545]/20 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {quickAmounts.map((amt) => (
                            <button 
                                key={amt}
                                onClick={() => setAddAmount(amt.toString())}
                                className="px-6 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:border-[#C44545] hover:text-[#C44545] transition-all active:scale-95 whitespace-nowrap"
                            >
                                + ₹{amt}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleAddMoney}
                        disabled={isLoading}
                        className="w-full h-16 bg-[#C44545] text-white rounded-[1.2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <History size={20} />
                            </motion.div>
                        ) : (
                            <>
                                <Plus size={18} strokeWidth={3} />
                                Proceed to Recharge
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="px-6 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Transactions</h3>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Recent Activity</p>
                    </div>
                    <button className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Filter size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {transactions.length > 0 ? transactions.map((tx) => (
                        <motion.div 
                            key={tx._id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between group cursor-pointer hover:border-[#C44545]/10 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} rounded-2xl flex items-center justify-center shrink-0`}>
                                    {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight truncate pr-2 leading-tight">
                                        {tx.description || (tx.transactionType === 'recharge' ? 'Wallet Recharge' : 'Service Payment')}
                                    </h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-900'} tracking-tight`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{Math.abs(tx.amount).toFixed(2)}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'success' ? 'text-emerald-500/60' : 'text-amber-500/60'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                            <History size={48} className="text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-400">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Extra Security Badge */}
            <div className="px-6 mt-12 pb-10">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Secure Payments</p>
                        <p className="text-[9px] font-bold text-emerald-600 leading-none mt-1">128-bit SSL Encrypted Transactions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserWallet;
