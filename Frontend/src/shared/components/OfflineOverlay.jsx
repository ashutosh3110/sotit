import { motion } from "framer-motion";
import { ZapOff, Power } from "lucide-react";

const OfflineOverlay = ({ isOnline, onToggle }) => {
  if (isOnline) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl text-center border-4 border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="h-20 w-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] mx-auto mb-6 shadow-inner relative z-10">
          <ZapOff size={32} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 relative z-10">You are Offline.</h2>
        <p className="text-[13px] font-bold text-slate-400 mb-8 leading-relaxed px-2 relative z-10">
          Your profile is currently hidden from clients. Toggle back online to receive new service requests.
        </p>
        
        <button 
          onClick={onToggle}
          className="w-full bg-[#C44545] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Power size={16} strokeWidth={3} /> Go Online Now
        </button>
      </div>
    </motion.div>
  );
};

export default OfflineOverlay;
