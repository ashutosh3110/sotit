import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_token', data.token);
        navigate('/admin');
      } else {
        setError(data.message || "Invalid credentials. Access Denied.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Admin Login error:", err);
      setError("Server connection failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 py-12 font-inter">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
        
        {/* Logo & Header */}
        <div className="text-center mb-10 relative z-10">
          <div className="h-20 w-20 bg-[#C44545] rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-[#C44545]/20 mb-6 border-4 border-white">
            <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Admin Console</h1>
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Sootit Control Center</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 mb-8"
            >
              <AlertCircle size={18} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-widest">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-[#C44545] transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sootit.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4">Master Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-[#C44545] transition-colors" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C44545] text-white py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-[#C44545]/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Verify Identity <ArrowRight size={18} strokeWidth={3} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-black text-neutral-300 uppercase tracking-widest">
          Secure Access Only • Powered by Deepmind
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
