import { motion } from "framer-motion";
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    RefreshCw, 
    ChevronLeft, 
    Plus,
    History,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorData } from "../utils/vendorStore";
import toast from "react-hot-toast";

const VendorWallet = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [addAmount, setAddAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchWalletData = async () => {
        try {
            const vendorData = getVendorData();
            const token = vendorData?.profile?.token;
            
            if (!token) {
                setIsInitialLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/wallet/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
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
            const vendorData = getVendorData();
            const token = vendorData?.profile?.token;
            
            // 1. Create Order on Backend
            const orderRes = await fetch('http://localhost:5000/api/wallet/create-order', {
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
                name: "Sootit Partner",
                description: "Wallet Recharge",
                order_id: orderData.order.id,
                handler: async (response) => {
                    const verifyRes = await fetch('http://localhost:5000/api/wallet/verify-payment', {
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
                        toast.success("Wallet Recharged Successfully!");
                        setAddAmount("");
                        fetchWalletData();
                    } else {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: vendorData.profile.name,
                    email: vendorData.profile.email,
                    contact: vendorData.profile.mobile
                },
                theme: { color: "#C44545" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("Payment initiation failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#C44545] animate-spin" />
            </div>
        );
    }

    if (!getVendorData()?.profile?.token) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
                <div className="h-24 w-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] mb-8 shadow-2xl shadow-rose-100">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Re-login Required.</h2>
                <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">Please login again as a partner to access your wallet features.</p>
                <button 
                    onClick={() => navigate('/vendor/login')}
                    className="w-full h-16 bg-[#C44545] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const quickAmounts = [500, 1000, 2000, 5000];

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 font-inter overflow-x-hidden">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-[#C44545] to-[#a83a3a] pt-12 pb-24 px-6 rounded-b-[3rem] shadow-2xl shadow-[#C44545]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl" />
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 active:scale-90 transition-all"
                    >
                        <ChevronLeft className="text-white" size={20} />
                    </button>
                    <h1 className="text-white font-black text-lg uppercase tracking-widest">Partner Wallet.</h1>
                </div>

                <div className="text-center relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 block">Total Available Balance</span>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-black text-white/50">₹</span>
                        <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                            {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Actions Card */}
            <div className="px-6 -mt-12 relative z-20">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545]">
                            <Plus size={20} strokeWidth={3} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recharge Balance</h3>
                    </div>

                    <div className="relative group mb-6">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-[#C44545] transition-colors">₹</span>
                        <input 
                            type="number"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full h-20 bg-slate-50 rounded-3xl pl-12 pr-6 text-2xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all border border-transparent focus:border-[#C44545]/20"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {quickAmounts.map(amount => (
                            <button 
                                key={amount}
                                onClick={() => setAddAmount(amount.toString())}
                                className={`py-3 rounded-2xl text-[11px] font-black transition-all ${addAmount === amount.toString() ? 'bg-[#C44545] text-white shadow-lg shadow-[#C44545]/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                + ₹{amount}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleAddMoney}
                        disabled={isLoading}
                        className="w-full h-16 bg-[#C44545] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Plus size={18} strokeWidth={3} />
                                Proceed to Recharge
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Transactions Feed */}
            <div className="px-6 py-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <History size={18} className="text-[#C44545]" />
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Transaction History</h3>
                    </div>
                    <button className="h-8 w-8 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                        <RefreshCw size={12} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {transactions.length > 0 ? transactions.map((tx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={tx._id}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-black/[0.02] flex items-center justify-between group hover:border-[#C44545]/20 transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-[#C44545]'}`}>
                                    {tx.type === 'credit' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-black text-slate-900 leading-none mb-2 uppercase tracking-tight">{tx.description}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(tx.createdAt).toLocaleString()}</span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-black tracking-tighter ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                                </span>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <Wallet className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                                No transactions found yet.<br/>Your recharge activity will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorWallet;
