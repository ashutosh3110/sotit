import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { initVendorState } from "../utils/vendorStore";
import toast from 'react-hot-toast';

import logo from "../../../assets/logo.png";

const VendorLogin = ({ isEmbedded = false, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pages?target=vendor`);
        const data = await response.json();
        if (data.success) {
          setPages(data.pages);
        }
      } catch (err) {
        console.error("Error fetching policy pages:", err);
      }
    };
    fetchPages();
  }, []);
  
  // Forgot Password States
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Mobile, 2: OTP, 3: New Password
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const toggleForgot = (val) => {
    setIsForgot(val);
    setForgotStep(1);
    setOtp(["", "", "", ""]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return toast.error("Enter valid 10-digit number");
    if (!password) return toast.error("Enter password");

    setIsLoading(true);
    const loadToast = toast.loading("Verifying Partner...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber, password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Login Successful!", { id: loadToast });
        initVendorState({ ...data.vendor, token: data.token });
        navigate('/vendor');
      } else {
        toast.error(data.message || "Invalid credentials", { id: loadToast });
      }
    } catch (error) {
      toast.error("Login error", { id: loadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgotOTP = async () => {
    if (phoneNumber.length !== 10) return toast.error("Enter valid mobile number");
    setIsLoading(true);
    console.log("Sending Forgot OTP for:", phoneNumber);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/vendors/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phoneNumber })
        });
        const data = await res.json();
        console.log("Send OTP Response:", data);
        if (res.ok && data.success) {
            toast.success("OTP sent to terminal");
            setForgotStep(2);
        } else {
            toast.error(data.message || "Failed to send OTP");
        }
    } catch (error) {
        console.error("Forgot OTP Error:", error);
        toast.error("Error sending OTP");
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyForgotOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) return toast.error("Enter 4-digit OTP");
    setIsLoading(true);
    console.log("Verifying OTP:", otpValue);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/vendors/verify-reset-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phoneNumber, otp: otpValue })
        });
        const data = await res.json();
        console.log("Verify OTP Response:", data);
        if (res.ok && data.success) {
            toast.success("OTP Verified");
            setForgotStep(3);
        } else {
            toast.error(data.message || "Invalid OTP");
        }
    } catch (error) {
        console.error("Verify OTP Error:", error);
        toast.error("Error verifying OTP");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) return toast.error("Password must be 6+ chars");
    setIsLoading(true);
    console.log("Resetting password for:", phoneNumber);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/vendors/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: phoneNumber, otp: otp.join(""), password: newPassword })
        });
        const data = await res.json();
        console.log("Reset Response:", data);
        if (res.ok && data.success) {
            toast.success("Password Reset Success! Please login.");
            setIsForgot(false);
            setForgotStep(1);
            setOtp(["", "", "", ""]);
            setPassword("");
        } else {
            toast.error(data.message || "Failed to reset");
        }
    } catch (error) {
        console.error("Reset Error:", error);
        toast.error("Error resetting password");
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`vendor-forgot-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const containerClasses = isEmbedded 
    ? "px-6 py-4 text-neutral-900 font-inter bg-white" 
    : "min-h-screen bg-slate-50 px-6 flex flex-col justify-center overflow-hidden text-neutral-900 font-inter";

  return (
    <div className={containerClasses}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm mx-auto">
        {!isEmbedded && (
          <div className="h-20 w-20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {!isForgot ? (
            <motion.div key="vendor-login-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-8">
                    <h1 className={`${isEmbedded ? 'text-3xl' : 'text-5xl'} font-black tracking-tighter leading-tight mb-2 uppercase text-slate-900`}>
                        {isEmbedded ? "Partner Login" : <>Partner<br/>Login.</>}
                    </h1>
                    <p className="text-[14px] font-bold text-neutral-500 tracking-tight leading-snug">
                        Access your partner dashboard to manage jobs
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1 block ml-2">Registered Mobile</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                                <Phone size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex bg-white border border-black/[0.03] rounded-3xl overflow-hidden focus-within:border-slate-900/20 focus-within:shadow-xl focus-within:shadow-black/[0.02] transition-all">
                                <div className="pl-14 py-4 flex items-center pr-3 border-r border-black/[0.02]">
                                    <span className="text-sm font-black text-slate-900">+91</span>
                                </div>
                                <input 
                                    type="tel" 
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="00000 00000" 
                                    className="w-full py-4 px-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Secret Password</label>
                            <button type="button" onClick={() => toggleForgot(true)} className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.1em] border-b border-[#C44545]/30">Forgot?</button>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                                <Lock size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                            />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all group mt-6 disabled:opacity-50">
                        <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Authorize Partner</span>
                        <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                            <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                        </div>
                    </button>
                </form>
            </motion.div>
          ) : (
            <motion.div key="vendor-forgot-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => toggleForgot(false)} className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <ArrowLeft size={14} /> Back to Login
                </button>
                
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tighter leading-tight mb-2 uppercase">Reset Account.</h1>
                    <p className="text-[14px] font-bold text-neutral-500 tracking-tight leading-snug">
                        {forgotStep === 1 ? "Enter your mobile to receive recovery OTP" : forgotStep === 2 ? "Verify the 4-digit code sent to terminal" : "Create a new secure password"}
                    </p>
                </div>

                {forgotStep === 1 && (
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                                <Phone size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="tel" 
                                maxLength={10}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Mobile Number" 
                                className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                            />
                        </div>
                        <button onClick={handleSendForgotOTP} disabled={isLoading} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-[#C44545]/20 active:scale-[0.98] transition-all group mt-4">
                            <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Send Recovery OTP</span>
                            <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                            </div>
                        </button>
                    </div>
                )}

                {forgotStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between gap-3">
                            {otp.map((digit, i) => (
                                <input 
                                    key={i} id={`vendor-forgot-otp-${i}`} type="text" maxLength={1} value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyUp={(e) => e.key === 'Backspace' && i > 0 && !digit && document.getElementById(`vendor-forgot-otp-${i-1}`).focus()}
                                    className="w-full h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-[#C44545] focus:outline-none focus:border-[#C44545]/40 focus:bg-rose-50/50 transition-all shadow-sm"
                                />
                            ))}
                        </div>
                        <button onClick={handleVerifyForgotOTP} disabled={isLoading} className="w-full bg-slate-900 text-white h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all group">
                            <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Verify OTP Code</span>
                            <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                            </div>
                        </button>
                    </div>
                )}

                {forgotStep === 3 && (
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                                <Lock size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter New Password" 
                                className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                            />
                        </div>
                        <button onClick={handleResetPassword} disabled={isLoading} className="w-full bg-slate-900 text-white h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all group mt-4">
                            <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Reset Password</span>
                            <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                <CheckCircle2 size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                            </div>
                        </button>
                    </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-10">
          <p className="text-[14px] font-bold text-neutral-600 uppercase tracking-widest">
             Not a registered vendor? 
             {onSwitchToRegister ? (
               <button onClick={onSwitchToRegister} className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5">Apply here</button>
             ) : (
               <Link to="/vendor/register" className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5">Apply here</Link>
             )}
          </p>
        </div>

        {pages.length > 0 && (
          <div className="flex justify-center gap-6 mt-8 border-t border-slate-100 pt-6">
            {pages.map((p) => (
              <Link
                key={p.slug}
                to={`/page/${p.slug}`}
                className="text-[10px] font-black uppercase text-neutral-400 tracking-widest hover:text-[#C44545] transition-colors"
              >
                {p.title}
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VendorLogin;
