import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../../../assets/logo.png";
import bgImage from "../../../assets/welcome_bg.png";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-slate-900 overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Premium Service" 
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-20 pb-12">
        {/* Top Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="h-24 w-24 bg-white rounded-3xl shadow-2xl shadow-black/50 flex items-center justify-center p-4 mb-6">
            <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white text-4xl font-black tracking-tight mb-2">
            Sootit
          </h1>
          <div className="h-1 w-12 bg-[#C44545] rounded-full" />
        </motion.div>

        {/* Value Proposition */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-[#C44545]/20 text-[#C44545] px-4 py-1.5 rounded-full border border-[#C44545]/30 mb-4 self-start"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Welcome to Sootit</span>
            </motion.div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4 text-balance">
              Welcome to your <br />
              <span className="text-[#C44545]">Premium Vehicle Partner.</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Experience the pinnacle of vehicle services. From professional drivers to expert maintenance, we've got you covered.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: ShieldCheck, text: "Verified Pros" },
              { icon: Star, text: "Premium Quality" },
              { icon: Zap, text: "Instant Service" },
              { icon: Star, text: "4.9+ Trust" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3"
              >
                <feature.icon className="text-[#C44545]" size={18} />
                <span className="text-white/80 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-auto"
        >
          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-[#C44545] hover:bg-[#b03a3a] text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-[#C44545]/40 transition-all active:scale-[0.98]"
          >
            GET STARTED
            <ArrowRight size={20} />
          </button>
          
          <p className="text-center text-slate-500 text-xs mt-6 uppercase tracking-widest font-bold">
            Secure • Professional • Reliable
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;
