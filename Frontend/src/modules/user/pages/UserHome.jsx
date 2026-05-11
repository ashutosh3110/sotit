import { motion, AnimatePresence } from "framer-motion";
import AppHero from "../components/Hero";
import { Star, Shield, Zap, TrendingUp, ArrowRight, Navigation, Clock, Wrench, User, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../utils/userStore";

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

  return (
    <div className="bg-white min-h-screen font-inter overflow-hidden pb-10">
      <AppHero 
        user={user} 
        activeRole={activeRole} 
        onServiceSelect={(role) => setActiveRole(role)} 
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

        {/* Emergency Grid - Compact */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[11px] font-black uppercase text-slate-600 tracking-[0.25em] leading-none border-l-4 border-[#C44545] pl-4">QUICK ASSIST</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <motion.div 
                whileTap={{scale:0.96}} 
                onClick={() => navigate('/user/support')}
                className="bg-white rounded-[2rem] p-6 flex flex-col gap-4 shadow-xl shadow-black/[0.02] border border-slate-100 cursor-pointer"
             >
                <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] shadow-inner">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-900 text-[14px] font-black tracking-tight leading-none uppercase mb-1">Support</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Help Center</span>
                </div>
             </motion.div>

             <motion.div 
                whileTap={{scale:0.96}} 
                onClick={() => navigate('/user/find')}
                className="bg-slate-900 rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl shadow-black/10 cursor-pointer"
             >
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-inner">
                  <Navigation size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-white text-[14px] font-black tracking-tight leading-none uppercase mb-1">Find Pro</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Map View</span>
                </div>
             </motion.div>
          </div>
        </section>

        {/* Tracking Module - Low Profile */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[11px] font-black uppercase text-slate-600 tracking-[0.25em] border-l-4 border-slate-900 pl-4">LIVE STATUS</h3>
          </div>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-5 flex items-center gap-5 shadow-2xl shadow-black/[0.03] active:scale-95 transition-all"
          >
            <div className="h-12 w-12 bg-[#C44545] text-white rounded-[1.4rem] flex items-center justify-center shadow-xl shadow-[#C44545]/20">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[13px] font-black text-slate-900 leading-none uppercase tracking-tighter">Service in progress</h4>
                <div className="flex gap-1 animate-pulse">
                    <div className="h-1.5 w-1.5 bg-[#C44545] rounded-full" />
                    <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                </div>
              </div>
              <span className="text-[10px] font-black text-[#C44545] uppercase tracking-widest leading-none">Arriving in 12 Mins</span>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;
