import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../../assets/logo.png";

const UserRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();

  const containerClasses = isEmbedded 
    ? "px-6 pt-4 pb-8 flex-1 flex flex-col font-inter bg-white" 
    : "min-h-screen bg-slate-50 flex flex-col font-inter";

  return (
    <div className={containerClasses}>
      {/* Top Header/Progress */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/auth')} 
          className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-300">Stage 01/01</span>
      </div>

      <div className="flex-1 flex flex-col px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-sm mx-auto"
        >
          {/* Brand Logo - Centered */}
          {!isEmbedded && (
            <div className="flex flex-col items-center mb-10">
              <div className="h-24 w-24 overflow-hidden mb-2">
                <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Join Sootit.</h1>
            <p className="text-sm font-bold text-slate-400 leading-tight">Create your profile to access premium vehicle services.</p>
          </div>

          <form className="space-y-5">
            {/* Input Group: Name */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                <User size={18} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-white border border-black/[0.03] rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
              />
            </div>

            {/* Input Group: Phone */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                <Phone size={18} strokeWidth={2.5} />
              </div>
              <div className="flex bg-white border border-black/[0.03] rounded-3xl overflow-hidden focus-within:border-slate-900/20 focus-within:shadow-xl focus-within:shadow-black/[0.02] transition-all">
                <div className="pl-14 py-5 flex items-center pr-3 border-r border-black/[0.02]">
                  <span className="text-sm font-black text-slate-900">+91</span>
                </div>
                <input 
                  type="tel" 
                  maxLength={10}
                  placeholder="0000 0000" 
                  className="w-full py-5 px-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-4">
              <button 
                type="button" 
                onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/user/login')} 
                className="w-full bg-[#C44545] h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-[#C44545]/20 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-white/40" />
                  <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Secure Sign Up</span>
                </div>
                <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                  <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                </div>
              </button>
            </div>
          </form>

          {/* Footer Social/Login */}
          <div className="mt-12 text-center">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? 
              <button 
                onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/user/login')} 
                className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5"
              >
                Login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserRegister;
