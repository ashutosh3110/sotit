import { motion } from "framer-motion";
import { Star, Shield, Zap, TrendingUp, Settings, DollarSign, Activity, Briefcase, Wallet, MapPin, CheckCircle2, Wrench, Truck, FileText, Navigation, ArrowRight, Loader2, Moon, Sun, ZapOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getVendorData, setVendorData } from "../utils/vendorStore";
import { getVendorConfig } from "../utils/vendorConfig";

const VendorHome = () => {
  const [vendor, setVendor] = useState(getVendorData() || {
    profile: { name: "Partner", role: "mechanic", id: '' },
    wallet: 0
  });

  const [isOnline, setIsOnline] = useState(vendor.profile.isOnline !== false);
  const [isToggling, setIsToggling] = useState(false);

  const config = getVendorConfig(vendor.profile.role);

  useEffect(() => {
    const handleUpdate = () => {
        const newData = getVendorData();
        setVendor(newData);
        setIsOnline(newData.profile.isOnline !== false);
    };
    window.addEventListener('vendor_data_updated', handleUpdate);
    return () => window.removeEventListener('vendor_data_updated', handleUpdate);
  }, []);

  const toggleStatus = async () => {
      if (isToggling) return;
      const vId = vendor.profile.id || vendor.profile._id;
      setIsToggling(true);
      try {
          const response = await fetch(`http://localhost:5000/api/vendors/${vId}/toggle-status`, {
              method: 'PUT'
          });
          const data = await response.json();
          if (response.ok) {
              setIsOnline(data.isOnline);
              const currentData = getVendorData();
              currentData.profile.isOnline = data.isOnline;
              setVendorData(currentData);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsToggling(false);
      }
  };

  const serviceRoles = [
    { id: 'driver', label: "Driver Service", icon: Navigation, color: "text-slate-900", bg: "bg-slate-50", status: isOnline ? 'ACTIVE' : 'INACTIVE' },
    { id: 'mechanic', label: "Mechanic Shop", icon: Wrench, color: "text-slate-700", bg: "bg-slate-100", status: isOnline ? 'ACTIVE' : 'INACTIVE' },
    { id: 'towing', label: "Towing Help", icon: Truck, color: "text-slate-800", bg: "bg-neutral-100", status: isOnline ? 'ACTIVE' : 'INACTIVE' },
    { id: 'rto', label: "RTO Agent", icon: FileText, color: "text-slate-900", bg: "bg-slate-50", status: isOnline ? 'ACTIVE' : 'INACTIVE' },
    { id: 'legal', label: "Legal Advisor", icon: Briefcase, color: "text-slate-700", bg: "bg-slate-100", status: isOnline ? 'ACTIVE' : 'INACTIVE' },
  ].filter(role => role.id === vendor.profile.role);

  return (
    <div className={`min-h-screen pb-24 font-inter transition-colors duration-700 ${isOnline ? 'bg-white' : 'bg-slate-50'}`}>
      {/* Earnings & Success Rate (Top Bar) */}
      <section className={`px-4 pt-6 pb-12 rounded-b-[3rem] shadow-2xl relative overflow-hidden transition-all duration-700 ${isOnline ? 'bg-[#C44545] shadow-[#C44545]/20' : 'bg-slate-800 shadow-slate-900/40'}`}>
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-20" />
        
        <div className="flex items-center justify-between mb-8 relative z-10 px-2">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 text-white">Daily Stats</span>
                <h2 className="text-lg font-black text-white tracking-tighter">Performance Hub.</h2>
            </div>
            {!isOnline && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
                    <Moon size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sleep Mode</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className={`p-5 rounded-[2.5rem] border backdrop-blur-md transition-all duration-500 ${isOnline ? 'bg-white/10 border-white/20' : 'bg-slate-700/30 border-white/5 opacity-50 grayscale'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={12} className={isOnline ? 'text-white/80' : 'text-slate-500'} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">Response</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">Instant</span>
          </div>
          <div className={`p-5 rounded-[2.5rem] border backdrop-blur-md transition-all duration-500 ${isOnline ? 'bg-white/10 border-white/20' : 'bg-slate-700/30 border-white/5 opacity-50 grayscale'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className={isOnline ? 'text-white/80' : 'text-slate-500'} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">Success</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">98.4%</span>
          </div>
        </div>
      </section>

      {/* ONLINE / OFFLINE TOGGLE - Fixed Floating Card */}
      <section className="px-4 -mt-8 relative z-30">
         <div className={`p-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl transition-all duration-500 border-2 ${isOnline ? 'bg-white border-white shadow-[#C44545]/20' : 'bg-slate-900 border-slate-700 shadow-black/40'}`}>
            <div className="flex items-center gap-4">
               <div className={`h-14 w-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${isOnline ? 'bg-rose-50 text-[#C44545]' : 'bg-slate-800 text-slate-500 shadow-inner'}`}>
                  {isOnline ? <Zap size={24} strokeWidth={2.5} className="animate-pulse" /> : <ZapOff size={24} strokeWidth={2.5} />}
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
                      <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </h3>
                  </div>
                  <p className={`text-[11px] font-bold ${isOnline ? 'text-slate-500' : 'text-slate-600'}`}>
                    {isOnline ? 'Receiving leads now' : 'Sleep mode: Not visible'}
                  </p>
               </div>
            </div>
            
            <div 
                onClick={toggleStatus}
                className={`h-8 w-14 rounded-full relative cursor-pointer transition-all flex items-center px-1.5 ${isOnline ? 'bg-[#C44545]' : 'bg-slate-700'}`}
            >
               <motion.div 
                    animate={{ x: isOnline ? 24 : 0 }}
                    className="h-5 w-5 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden"
               >
                   {isToggling ? <Loader2 size={12} className="text-[#C44545] animate-spin" /> : (isOnline ? <Sun size={12} className="text-[#C44545]" /> : <Moon size={12} className="text-slate-400" />)}
               </motion.div>
            </div>
         </div>
      </section>

      {/* Main Content Area with Blur when Offline */}
      <div className={`transition-all duration-700 px-4 mt-8 space-y-10 ${isOnline ? 'opacity-100' : 'opacity-60 blur-[2px] pointer-events-none'}`}>
          {/* Active Services */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.3em] border-l-4 border-[#C44545] pl-4">Active Services</h2>
                <span className="text-[10px] font-bold text-slate-400">Manage Tools</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {serviceRoles.map((role, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-black/[0.02] flex flex-col gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${role.bg} ${role.color} shadow-inner`}>
                    <role.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black tracking-tight text-neutral-900 mb-1">{role.label}</h3>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">ACTIVE</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hire Requests */}
          <section>
            <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.3em] border-l-4 border-[#C44545] pl-4 mb-6">Marketplace Leads</h2>
            {config.directRequests.map((req, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-7 rounded-[3rem] relative shadow-2xl shadow-black/[0.03] mb-5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-5">
                   <span className="text-[11px] font-black text-slate-300">{req.time}</span>
                </div>
                <div className="mb-5">
                   <div className="flex items-center gap-2 mb-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                       <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Live Request</span>
                   </div>
                   <h3 className="text-xl font-black tracking-tighter text-slate-900">{req.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-slate-500 mb-6 bg-slate-50 p-3 rounded-2xl">
                   <MapPin size={14} className="text-[#C44545]" />
                   <span className="text-[12px] font-bold">{req.location} • <span className="text-slate-900">{req.service}</span></span>
                </div>
                <button className="w-full bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                   Accept Direct Booking
                </button>
              </div>
            ))}
          </section>
      </div>

      {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-28 left-6 right-6 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl z-40 border border-white/10 text-center"
          >
              <div className="flex items-center justify-center gap-3 mb-2">
                  <Moon size={16} className="text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest">Dashboard Sleeping</p>
              </div>
              <p className="text-[11px] font-medium text-slate-500 px-4">Go online to start receiving real-time leads from vehicle owners.</p>
          </motion.div>
      )}
    </div>
  );
};

export default VendorHome;
