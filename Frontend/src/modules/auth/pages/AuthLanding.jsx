import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, ShieldCheck, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import UserLogin from '../../user/pages/UserLogin';
import UserRegister from '../../user/pages/UserRegister';
import VendorLogin from '../../vendor/pages/VendorLogin';
import VendorRegister from '../../vendor/pages/VendorRegister';

import logo from "../../../assets/logo.png";

const AuthLanding = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'vendor' ? 'vendor' : 'user';

  const [activeTab, setActiveTab] = useState(initialTab); // 'user' or 'vendor'
  const [formType, setFormType] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const tab = queryParams.get('tab');
    const role = queryParams.get('role');
    if (tab === 'vendor' || tab === 'user') {
      setActiveTab(tab);
    }
    if (role === 'owner') {
      setFormType('register');
    }
    if (location.state && location.state.redirectToRegister) {
      setFormType('register');
    }
  }, [location.search, location.state]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormType('login'); // Reset to login when switching tabs
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">

      {/* ── Hero / Branding Area ─────────────────────────────── */}
      <div className="relative bg-[#C44545] px-8 pt-12 pb-10 overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-10 -right-10 h-48 w-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Logo on white card */}
          <div className="h-20 w-20 bg-white rounded-[1.6rem] shadow-2xl shadow-black/25 flex items-center justify-center overflow-hidden mb-4">
            <img src={logo} alt="Sootit Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight leading-none mb-1.5">
            Sootit
          </h1>
          <p className="text-white/90 font-bold text-[12px] uppercase tracking-[0.25em] text-center">
            Premium Vehicle Services Ecosystem
          </p>
        </motion.div>
      </div>

      {/* ── Tab Switcher — floats over the join line ──────────── */}
      <div className="px-5 -mt-5 relative z-20">
        <div className="bg-white rounded-[1.8rem] shadow-xl shadow-black/10 p-1.5 flex border border-neutral-100">
          <button
            onClick={() => handleTabChange('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.4rem] font-inter transition-all duration-300 ${
              activeTab === 'user'
                ? 'bg-[#C44545] text-white'
                : 'text-neutral-400'
            }`}
          >
            <User size={15} strokeWidth={activeTab === 'user' ? 3 : 2} />
            <span className="text-[13px] font-black uppercase tracking-widest">Customer</span>
          </button>

          <button
            onClick={() => handleTabChange('vendor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.4rem] font-inter transition-all duration-300 ${
              activeTab === 'vendor'
                ? 'bg-[#C44545] text-white'
                : 'text-neutral-400'
            }`}
          >
            <Briefcase size={15} strokeWidth={activeTab === 'vendor' ? 3 : 2} />
            <span className="text-[13px] font-black uppercase tracking-widest">Partner</span>
          </button>
        </div>
      </div>

      {/* ── Form Area ────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden flex flex-col mt-1">
        <AnimatePresence mode="wait">
          {activeTab === 'user' ? (
            <motion.div
              key={`user-${formType}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {formType === 'login' ? (
                <UserLogin isEmbedded={true} onSwitchToRegister={() => setFormType('register')} />
              ) : (
                <UserRegister isEmbedded={true} onSwitchToLogin={() => setFormType('login')} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`vendor-${formType}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {formType === 'login' ? (
                <VendorLogin isEmbedded={true} onSwitchToRegister={() => setFormType('register')} />
              ) : (
                <VendorRegister isEmbedded={true} onSwitchToLogin={() => setFormType('login')} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="px-8 py-5 flex justify-between items-center border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-[#C44545]" />
          <span className="text-[12px] font-black uppercase tracking-widest text-neutral-600">
            Secure Entry
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={13} className="text-[#C44545] fill-[#C44545]" />
          <span className="text-[12px] font-black uppercase tracking-widest text-neutral-600">
            4.9/5 Trust
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
