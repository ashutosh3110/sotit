import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Navigation, Wrench, Shield, Briefcase, FileText, Truck, Phone, ArrowRight, Car } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../../../assets/logo.png";

const VendorRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('driver');

  const roles = [
    { id: 'driver', label: 'Driver', icon: Navigation, desc: 'Professional chauffeur' },
    { id: 'mechanic', label: 'Mechanic', icon: Wrench, desc: 'Vehicle repair expert' },
    { id: 'towing', label: 'Towing', icon: Truck, desc: '24/7 recovery service' },
    { id: 'rto', label: 'RTO Agent', icon: FileText, desc: 'Paperwork assistant' },
    { id: 'legal', label: 'Legal Advisor', icon: Briefcase, desc: 'Vehicle law expert' },
    { id: 'owner', label: 'Owner', icon: Car, desc: 'Hire drivers for your vehicles' },
  ];

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('temp_vendor_role', role);
    navigate('/vendor/register/personal');
  };

  const containerClasses = isEmbedded 
    ? "px-6 pt-4 pb-8 flex-1 flex flex-col font-inter bg-white" 
    : "min-h-screen bg-slate-50 flex flex-col font-inter";

  return (
    <div className={containerClasses}>
      {/* Dynamic Header */}
      <div className="px-6 py-3 flex items-center justify-between sticky top-0 bg-inherit z-30">
        <button 
          onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/auth')} 
          className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#C44545]">Partner Program</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sootit Network</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 overflow-y-auto hide-scrollbar">
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-sm mx-auto"
        >

          <div className="mb-5 px-2 pt-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Join as Partner.</h1>
            <p className="text-[15px] font-bold text-neutral-600">Select your expertise and build your business with Sootit.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-12">
            {/* Roles Micro-Grid */}
            <div className="space-y-4">
                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">What is your role?</span>
                <div className="grid grid-cols-1 gap-3">
                {roles.map((r) => (
                    <motion.div 
                        key={r.id} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setRole(r.id);
                            localStorage.setItem('temp_vendor_role', r.id);
                            navigate('/vendor/register/personal');
                        }}
                        className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 ${role === r.id ? 'border-[#C44545] bg-[#C44545] text-white' : 'border-neutral-200 bg-white text-neutral-800 shadow-sm'}`}
                    >
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                            <r.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-black uppercase tracking-tight">{r.label}</span>
                            <span className={`text-[12px] font-bold ${role === r.id ? 'text-white/70' : 'text-neutral-500'}`}>{r.desc}</span>
                        </div>
                    </motion.div>
                ))}
                </div>
            </div>
            
            <button 
                type="submit" 
                className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] py-4 font-black uppercase tracking-[0.2em] text-[15px] flex items-center justify-between px-8 active:scale-95 transition-all group"
            >
              <span>Next Stage</span>
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                <ArrowRight size={20} className="text-white group-hover:text-slate-900" strokeWidth={3} />
              </div>
            </button>
          </form>

          <footer className="mt-12 text-center pb-10">
            <p className="text-[14px] font-bold text-neutral-600 uppercase tracking-[0.1em]">
               Already a partner? 
               <button 
                onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/vendor/login')} 
                className="text-[#C44545] font-black border-b-2 border-[#C44545]/30 pb-0.5 ml-2"
              >
                Login Account
              </button>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorRegister;
