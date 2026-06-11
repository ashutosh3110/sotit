import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, ShieldCheck, Mail, ArrowRight, Camera, MapPin, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { initUserState } from "../utils/userStore";
import toast from 'react-hot-toast';

import logo from "../../../assets/logo.png";

const UserRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Consolidating to 1 step flow
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
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  
  // Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  
  const [addressDetails, setAddressDetails] = useState({
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: ""
  });
  
  const fileInputRef = useRef(null);

  const containerClasses = isEmbedded 
    ? "px-6 pt-4 pb-8 flex-1 flex flex-col font-inter bg-white" 
    : "min-h-screen bg-slate-50 flex flex-col font-inter";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfileImg(URL.createObjectURL(file));
    }
  };

  const handleRegister = async () => {
    if (!name || !mobile || !password || !address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (mobile.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!isOtpSent) {
      const loadToast = toast.loading("Sending verification OTP...");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register-send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success(data.message || "OTP sent to your mobile number!", { id: loadToast });
          setIsOtpSent(true);
        } else {
          toast.error(data.message || "Failed to send OTP", { id: loadToast });
        }
      } catch (error) {
        console.error("OTP Send Error:", error);
        toast.error("Failed to send OTP. Try again.", { id: loadToast });
      }
      return;
    }

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    if (email && email.trim() !== "") {
      formData.append('email', email.trim());
    }
    formData.append('password', password);
    formData.append('location', address);
    formData.append('otp', enteredOtp);
    if (profileFile) {
      formData.append('profilePicture', profileFile);
    }

    const loadToast = toast.loading("Creating account...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        body: formData, 
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Registration Successful!", { id: loadToast });
        initUserState({ ...data.user, token: data.token }); 
        navigate('/user'); 
      } else {
        toast.error(data.message || "Registration Failed", { id: loadToast });
      }
    } catch (error) {
      console.error("Register Error:", error);
      toast.error("Registration failed. Try again.", { id: loadToast });
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails(prev => {
        const updated = { ...prev, [name]: value };
        setAddress(`${updated.house}${updated.house ? ', ' : ''}${updated.area}${updated.area ? ', ' : ''}${updated.city}${updated.city ? ', ' : ''}${updated.state} - ${updated.pincode}`);
        return updated;
    });
  };

  const isFormInvalid = !name.trim() || mobile.length !== 10 || password.length < 6 || !address.trim() || (isOtpSent && otp.join("").length !== 4);

  return (
    <div className={containerClasses}>
      {/* Top Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => {
            if (isEmbedded) onSwitchToLogin();
            else navigate('/auth');
          }} 
          className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">User Account</span>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-300">Registration</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-10 overflow-y-auto hide-scrollbar">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-sm mx-auto"
        >
          {!isEmbedded && (
            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-16 overflow-hidden mb-2">
                <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              Create Account.
            </h1>
            <p className="text-[13px] font-bold text-slate-400 leading-tight">
              Access premium vehicle services by joining our network.
            </p>
          </div>

          <AnimatePresence mode="wait">
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="h-24 w-24 rounded-[2rem] bg-rose-50 border-2 border-dashed border-rose-200 flex items-center justify-center relative cursor-pointer group overflow-hidden"
                  >
                    {profileImg ? (
                      <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-[#C44545]/40 group-hover:scale-110 transition-transform" />
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </div>
                  <span className="text-[10px] font-black text-[#C44545] uppercase tracking-widest mt-2">Upload Photo</span>
                </div>

                {/* Input Group: Name */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                  />
                </div>

                {/* Input Group: Phone */}
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
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number" 
                      className="w-full py-4 px-5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Input Group: Password */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set Secure Password" 
                    className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>

                {/* Location/Address Fields */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] pl-1 block ml-2">Location Details</label>
                  
                  {/* House No & Pincode */}
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      name="house"
                      value={addressDetails.house}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="House/Flat No." 
                      className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                    />
                    <input 
                      name="pincode"
                      value={addressDetails.pincode}
                      onChange={handleDetailChange}
                      type="tel"
                      maxLength={6}
                      placeholder="Pincode" 
                      className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                    />
                  </div>

                  {/* Area/Street/Landmark */}
                  <input 
                    name="area"
                    value={addressDetails.area}
                    onChange={handleDetailChange}
                    type="text" 
                    placeholder="Area / Street / Landmark" 
                    className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                  />

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      name="city"
                      value={addressDetails.city}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="City" 
                      className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                    />
                    <input 
                      name="state"
                      value={addressDetails.state}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="State" 
                      className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                    />
                  </div>
                </div>

                {isOtpSent && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">Enter Verification OTP</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          setIsOtpSent(false);
                          setOtp(["", "", "", ""]);
                          setTimeout(() => handleRegister(), 100);
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, idx) => (
                        <input 
                          key={idx} 
                          id={`otp-${idx}`}
                          type="tel" 
                          maxLength={1} 
                          value={digit} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const newOtp = [...otp];
                            newOtp[idx] = val;
                            setOtp(newOtp);
                            
                            if (val && idx < 3) {
                              document.getElementById(`otp-${idx + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                              document.getElementById(`otp-${idx - 1}`)?.focus();
                            }
                          }}
                          className="w-12 h-14 bg-rose-50 border-2 border-[#C44545]/10 rounded-2xl text-center text-xl font-black text-[#C44545] focus:border-[#C44545] focus:outline-none transition-all" 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                    <button 
                      type="button" 
                      onClick={handleRegister} 
                      disabled={isFormInvalid}
                      className="w-full bg-[#C44545] h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-[#C44545]/20 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-white/40" />
                        <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">
                          {isOtpSent ? "Verify & Register" : "Create Account"}
                        </span>
                      </div>
                      <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                        <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                      </div>
                    </button>
                </div>
              </motion.form>
          </AnimatePresence>

          {/* Footer Login */}
          <div className="mt-10 text-center">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? 
              <button 
                onClick={() => isEmbedded ? onSwitchToLogin() : navigate('/user/login')} 
                className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5"
              >
                Login
              </button>
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
    </div>
  );
};

export default UserRegister;

