import { motion, AnimatePresence } from "framer-motion";
import AppHero from "../components/Hero";
import { Star, Shield, Zap, TrendingUp, ArrowRight, Navigation, Clock, Wrench, User, Loader2, Info, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../utils/userStore";
import { requestForToken, onMessageListener } from "../../../utils/firebase";
import toast from "react-hot-toast";
import logo from "../../../assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserData() || { profile: { name: "Guest" }, wallet: 0 });
  const [activeRole, setActiveRole] = useState('driver'); // Default to driver or none
  const [roleBanners, setRoleBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setUser(getUserData());
    window.addEventListener('user_data_updated', handleUpdate);
    return () => window.removeEventListener('user_data_updated', handleUpdate);
  }, []);

  const fetchRoleBanners = async (role) => {
      setLoading(true);
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/banners?type=service&role=${role}`);
          const data = await response.json();
          if (response.ok) setRoleBanners(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      if (activeRole) {
          fetchRoleBanners(activeRole);
      }
  }, [activeRole]);

  // Fetch User Profile for Subscription
  const [profile, setProfile] = useState(null);
  const fetchProfile = async () => {
      const userData = getUserData();
      if (!userData?.profile?.token) return;
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/services/profile-data`, {
              headers: { 'Authorization': `Bearer ${userData.profile.token}` }
          });
          const data = await response.json();
          if (response.ok) setProfile(data.user);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      fetchProfile();
  }, [user?.profile?.token]);

  // Razorpay Upgrade Logic
  const handleUpgrade = async (planType) => {
    const userData = getUserData();
    if (!userData?.profile?.token) return toast.error("Please login first");

    const tid = toast.loading(`Initiating ${planType} Upgrade...`);
    try {
        // 1. Create Order
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/create-order`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.profile.token}`
            },
            body: JSON.stringify({ planType })
        });
        const orderData = await orderRes.json();
        
        if (!orderRes.ok) throw new Error(orderData.message || "Failed to create order");

        // 2. Open Razorpay
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: `Sootit ${planType}`,
            description: `${planType} Membership Plan`,
            image: logo,
            order_id: orderData.order.id,
            handler: async (response) => {
                const verifyTid = toast.loading("Verifying Payment...", { id: tid });
                try {
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/verify-payment`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userData.profile.token}`
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planType
                        })
                    });
                    const verifyData = await verifyRes.json();
                    
                    if (verifyRes.ok && verifyData.success) {
                        toast.success(`Welcome to Sootit ${planType}! 🚀`, { id: verifyTid });
                        fetchProfile(); // Refresh profile data
                    } else {
                        toast.error(verifyData.message || "Verification failed", { id: verifyTid });
                    }
                } catch (err) {
                    toast.error("Payment verification failed", { id: verifyTid });
                }
            },
            prefill: {
                name: user.profile.name,
                contact: user.profile.mobile
            },
            theme: { color: "#C44545" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (error) {
        toast.error(error.message || "Upgrade failed", { id: tid });
    }
  };

  useEffect(() => {
    const userToken = user?.profile?.token;
    console.log("[FCM] Checking for setup. User logged in:", !!userToken);
    
    if (userToken) {
        // 1. Request Browser Permission
        if ("Notification" in window) {
            console.log("[FCM] Current Permission:", Notification.permission);
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    console.log("[FCM] Permission Response:", permission);
                });
            }
        }

        // 2. Request FCM Token and Save
        requestForToken().then(token => {
            if (token) {
                console.log("[FCM] Syncing token with server...");
                fetch(`${import.meta.env.VITE_API_URL}/services/update-fcm`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ fcmToken: token })
                })
                .then(res => res.json())
                .then(data => console.log("[FCM] Server Sync Response:", data))
                .catch(err => console.error("[FCM] Token Sync Error:", err));
            } else {
                console.warn("[FCM] No token received from Firebase.");
            }
        });

        // 3. Foreground Listener
        onMessageListener().then(payload => {
            console.log("[FCM] Foreground Notification Received:", payload);
            toast.success(payload.notification.title, { 
                description: payload.notification.body,
                icon: '🚀',
                duration: 5000
            });
        }).catch(err => console.log('[FCM] Listener failed: ', err));
    }
  }, [user?.profile?.token]);

  return (
    <div className="bg-white min-h-screen font-inter overflow-hidden pb-10">
      <AppHero 
        user={user} 
        activeRole={activeRole} 
        onServiceSelect={(role) => {
          setActiveRole(role);
          navigate(`/user/find?role=${role}`);
        }} 
      />

      <div className="px-5 py-4 space-y-12">
        {/* Banner Card Grid - Dynamic Based on Active Role */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-[0.3em] flex items-center gap-2">
              <TrendingUp size={12} className="text-[#C44545]" /> 
              {activeRole ? `${activeRole} Selection` : 'Premium Selection'}
            </h3>
            <button 
              onClick={() => navigate(`/user/category/${activeRole}`)}
              className="text-[11px] font-black text-[#C44545] uppercase tracking-widest active:scale-95 transition-all"
            >
              SEE ALL
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2 snap-x snap-mandatory min-h-[160px]">
            {loading ? (
                <div className="w-full flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-[#C44545]" />
                </div>
            ) : roleBanners.length > 0 ? (
                roleBanners.map((banner, i) => (
                    <motion.div
                        key={banner._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.96 }}
                        className="min-w-[280px] snap-center h-44 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-black/5 border border-slate-100"
                    >
                        <img src={banner.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="B" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                        
                        <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                                    <Star size={18} className="text-white fill-white" />
                                </div>
                                <div className="bg-[#C44545] px-3 py-1 rounded-full shadow-lg">
                                    <span className="text-white text-[10px] font-black tracking-widest uppercase">Verified</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white text-xl font-black tracking-tighter leading-none mb-1">{banner.title}</h4>
                                <span className="text-white/70 text-[11px] font-black uppercase tracking-[0.15em] leading-none">Expert {activeRole} Selection</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="w-full bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
                    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                        <Info size={24} />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">No Banners for {activeRole}</h4>
                    <p className="text-[10px] font-bold text-slate-300 mt-1">Check back later for exclusive deals!</p>
                </div>
            )}
          </div>
        </section>

        {/* Sootit Membership Section */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.25em] leading-none flex items-center gap-2">
               <Zap size={12} className="text-amber-500 fill-amber-500" /> Exclusive Membership
            </h3>
          </div>
          {['Daily', 'Monthly', 'Yearly'].includes(profile?.subscription?.plan) && new Date(profile.subscription.expiresAt) > new Date() ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/5"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Status: Active</p>
                                <h4 className="text-white text-2xl font-black tracking-tight uppercase">Sootit {profile.subscription.plan}</h4>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between border-t border-white/5 pt-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Membership Validity</p>
                            <p className="text-white text-sm font-black flex items-center gap-2">
                                <Clock size={14} className="text-emerald-400" />
                                {new Date(profile.subscription.expiresAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
              </motion.div>
          ) : (
              <div className="space-y-4">
                  {[
                      { type: 'Single', price: '9', period: 'Expert', desc: 'Unlock any one expert contact', isNav: true },
                      { type: 'Daily', price: '99', period: 'Day', desc: 'Unlimited access for 24 hours' },
                      { type: 'Monthly', price: '999', period: 'Month', desc: 'Unlimited access for 30 days' },
                      { type: 'Yearly', price: '9999', period: 'Year', desc: 'Unlimited access for 365 days' }
                  ].map((plan) => (
                    <motion.div 
                      key={plan.type}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => plan.isNav ? navigate(`/user/find`) : null}
                      className="bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden group border border-white/5"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">{plan.type === 'Single' ? 'Pay Per View' : `${plan.type} Pass`}</span>
                            </div>
                            <h4 className="text-white text-xl font-black tracking-tighter leading-none mb-1">{plan.type === 'Single' ? 'Single Unlock' : `${plan.type} Access`}</h4>
                            <p className="text-slate-400 text-[10px] font-bold leading-relaxed">{plan.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <span className="text-white text-2xl font-black tracking-tighter">₹{plan.price}</span>
                                <span className="text-slate-500 text-[8px] font-black uppercase ml-1">/ {plan.period}</span>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    plan.isNav ? navigate(`/user/find`) : handleUpgrade(plan.type);
                                }}
                                className="px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest"
                            >
                                {plan.isNav ? 'Find Experts' : 'Upgrade'}
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
          )}
        </section>

        {/* Emergency Grid - Compact */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[11px] font-black uppercase text-slate-600 tracking-[0.25em] leading-none border-l-4 border-[#C44545] pl-4">QUICK ASSIST</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <motion.div 
                whileTap={{scale:0.96}} 
                onClick={() => navigate('/user/support')}
                className="bg-white rounded-[2rem] p-6 flex items-center gap-6 shadow-xl shadow-black/[0.02] border border-slate-100 cursor-pointer"
             >
                <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] shadow-inner shrink-0">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-900 text-[16px] font-black tracking-tight leading-none uppercase mb-1">Help & Support</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Connect with our team</span>
                </div>
                <div className="ml-auto">
                    <ArrowRight size={18} className="text-slate-300" />
                </div>
             </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
