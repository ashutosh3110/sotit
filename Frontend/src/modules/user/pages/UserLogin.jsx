import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Lock, Phone, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { initUserState } from "../utils/userStore";
import toast from 'react-hot-toast';

import logo from "../../../assets/logo.png";

const UserLogin = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pages?target=customer`);
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

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (phoneNumber.length !== 10) return toast.error("Enter valid 10-digit number");

    setIsLoading(true);
    const loadToast = toast.loading("Sending OTP...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("OTP sent to your mobile", { id: loadToast });
        setIsOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP", { id: loadToast });
      }
    } catch (error) {
      toast.error("Error sending OTP", { id: loadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) return toast.error("Enter 4-digit OTP");

    setIsLoading(true);
    const loadToast = toast.loading("Verifying...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber, otp: otpValue }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.isRegistered === false) {
          toast.success("OTP Verified! Redirecting to registration...", { id: loadToast });
          navigate('/user/register', { state: { mobile: phoneNumber, otp: otpValue } });
        } else {
          toast.success("Login Successful!", { id: loadToast });
          initUserState({ ...data.user, token: data.token });
          navigate('/user');
        }
      } else {
        toast.error(data.message || "Invalid OTP", { id: loadToast });
      }
    } catch (error) {
      toast.error("Verification error", { id: loadToast });
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
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
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
          <div className="h-28 w-28 flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div key="otp-login-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="mb-8">
              <h1 className={`${isEmbedded ? 'text-3xl' : 'text-5xl'} font-black tracking-tighter leading-tight mb-2`}>
                {isEmbedded ? "Customer Login" : <>Welcome<br/>Back.</>}
              </h1>
              <p className="text-[15px] font-medium text-neutral-500 tracking-tight">
                {isOtpSent 
                  ? "Enter the 4-digit code sent to your mobile number" 
                  : "Enter your mobile number to receive login OTP"}
              </p>
            </div>

            <form onSubmit={isOtpSent ? handleVerifyAndLogin : handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1 block">
                    Mobile Number
                  </label>
                  {isOtpSent && (
                    <button 
                      type="button" 
                      onClick={() => { setIsOtpSent(false); setOtp(["", "", "", ""]); }} 
                      className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.1em] border-b border-[#C44545]/30"
                    >
                      Change Number
                    </button>
                  )}
                </div>
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
                      disabled={isOtpSent}
                      placeholder="00000 00000" 
                      className="w-full py-4 px-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {isOtpSent && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">
                      Enter Verification OTP
                    </label>
                    <button 
                      type="button" 
                      onClick={handleSendOTP}
                      className="text-[10px] font-black uppercase tracking-wider text-[#C44545] hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <div className="flex justify-between gap-3">
                    {otp.map((digit, i) => (
                      <input 
                        key={i} 
                        id={`login-otp-${i}`} 
                        type="text" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyUp={(e) => e.key === 'Backspace' && i > 0 && !digit && document.getElementById(`login-otp-${i-1}`).focus()}
                        className="w-full h-16 bg-white border border-black/[0.03] rounded-2xl text-center text-xl font-black text-[#C44545] focus:outline-none focus:border-[#C44545]/20 transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-slate-900 text-white h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all group mt-6 disabled:opacity-50"
              >
                <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">
                  {isOtpSent ? "Verify & Login" : "Send Login OTP"}
                </span>
                <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                  <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                </div>
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">
            New to Sootit? 
            <Link to="/user/register" className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5">Create Account</Link>
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

export default UserLogin;
