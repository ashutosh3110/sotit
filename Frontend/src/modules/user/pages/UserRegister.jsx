import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, ShieldCheck, Mail, ArrowRight, Camera, MapPin, CheckCircle2, Navigation } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { initUserState } from "../utils/userStore";
import toast from 'react-hot-toast';

import logo from "../../../assets/logo.png";

const UserRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOTP = async () => {
    if (mobile.length !== 10 || !name) {
      toast.error("Please enter Name and a 10-digit mobile number");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile, 
          email, 
          isRegistration: true 
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("OTP sent to terminal");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      toast.error("Failed to send OTP. Check backend.");
    }
  };

  const handleRegister = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('email', email); // Optional
    formData.append('location', address);
    formData.append('otp', otpValue);
    if (profileFile) {
      formData.append('profilePicture', profileFile);
    }

    const loadToast = toast.loading("Creating account...");

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setAddress("Fetching location..."); // Visual feedback

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Coords: ${latitude}, ${longitude}`);
        
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error("Google Maps API Key is missing in Frontend/.env");
          }

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          
          if (data.status === "OK" && data.results && data.results.length > 0) {
            const formattedAddress = data.results[0].formatted_address;
            setAddress(formattedAddress);
            
            const components = data.results[0].address_components;
            let city = "", state = "", pincode = "";
            
            components.forEach(c => {
              if (c.types.includes("locality")) city = c.long_name;
              if (c.types.includes("administrative_area_level_1")) state = c.long_name;
              if (c.types.includes("postal_code")) pincode = c.long_name;
            });

            setAddressDetails(prev => ({ ...prev, city, state, pincode }));
          } else {
            throw new Error(data.error_message || `Geocoding failed: ${data.status}`);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          toast.error(`Error: ${error.message}`);
          setAddress("");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Unable to retrieve your location";
        if (error.code === 1) msg = "Location access denied. Please enable it in browser settings.";
        toast.error(msg);
        setIsLocating(false);
        setAddress("");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails(prev => ({ ...prev, [name]: value }));
    // Update main address string as well
    const { house, area, city, state, pincode } = { ...addressDetails, [name]: value };
    setAddress(`${house}${house ? ', ' : ''}${area}${area ? ', ' : ''}${city}${city ? ', ' : ''}${state} - ${pincode}`);
  };

  return (
    <div className={containerClasses}>
      {/* Top Header/Progress */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => {
            if (showFullAddress) setShowFullAddress(false);
            else if (step > 1) setStep(step - 1);
            else if (isEmbedded) onSwitchToLogin();
            else navigate('/auth');
          }} 
          className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">User Account</span>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-300">Stage 0{step}/02</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-10 overflow-y-auto hide-scrollbar">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-sm mx-auto"
        >
          {/* Brand Logo - Centered */}
          {!isEmbedded && step === 1 && !showFullAddress && (
            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-16 overflow-hidden mb-2">
                <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              {step === 1 ? (showFullAddress ? "Full Address." : "Create Account.") : "Verify OTP."}
            </h1>
            <p className="text-[13px] font-bold text-slate-400 leading-tight">
              {step === 1 
                ? (showFullAddress ? "Please provide your detailed permanent address." : "Access premium vehicle services by joining our network.")
                : "Enter the 4-digit code sent to your mobile number."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {!showFullAddress ? (
                  <>
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

                    {/* Input Group: Email */}
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                        <Mail size={18} strokeWidth={2.5} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address (Optional)" 
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

                    {/* Input Group: Location */}
                    <div className="space-y-2">
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">
                          <MapPin size={18} strokeWidth={2.5} />
                        </div>
                        <input 
                          type="text" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Quick Address / Location" 
                          className="w-full bg-white border border-black/[0.03] rounded-3xl py-4 pl-14 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 focus:shadow-xl focus:shadow-black/[0.02] transition-all"
                        />
                        <button 
                          type="button"
                          onClick={fetchLiveLocation}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl flex items-center justify-center transition-all ${isLocating ? 'bg-slate-100' : 'bg-rose-50 text-[#C44545] active:scale-90'}`}
                        >
                          <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                         <button 
                            type="button"
                            onClick={() => setShowFullAddress(true)}
                            className="flex-1 bg-white border border-black/[0.03] rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                         >
                            Add Full Address
                         </button>
                         <button 
                            type="button"
                            onClick={fetchLiveLocation}
                            className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest text-[#C44545] hover:bg-rose-100 transition-colors"
                         >
                            Use Live Location
                         </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <input 
                      name="house"
                      value={addressDetails.house}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="House/Flat No." 
                      className="w-full bg-white border border-black/[0.03] rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 transition-all"
                    />
                    <input 
                      name="area"
                      value={addressDetails.area}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="Area/Street/Landmark" 
                      className="w-full bg-white border border-black/[0.03] rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 transition-all"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        name="city"
                        value={addressDetails.city}
                        onChange={handleDetailChange}
                        type="text" 
                        placeholder="City" 
                        className="w-full bg-white border border-black/[0.03] rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 transition-all"
                      />
                      <input 
                        name="state"
                        value={addressDetails.state}
                        onChange={handleDetailChange}
                        type="text" 
                        placeholder="State" 
                        className="w-full bg-white border border-black/[0.03] rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 transition-all"
                      />
                    </div>
                    <input 
                      name="pincode"
                      value={addressDetails.pincode}
                      onChange={handleDetailChange}
                      type="text" 
                      placeholder="Pincode" 
                      className="w-full bg-white border border-black/[0.03] rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-900/20 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowFullAddress(false)}
                      className="w-full bg-slate-900 text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all mb-2"
                    >
                      Save Address
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowFullAddress(false)}
                      className="w-full bg-white border border-black/[0.05] text-slate-500 rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Cancel / Go Back
                    </button>
                  </motion.div>
                )}

                {/* Action Area */}
                {!showFullAddress && (
                  <div className="pt-4">
                    <button 
                      type="button" 
                      onClick={handleSendOTP} 
                      className="w-full bg-[#C44545] h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-[#C44545]/20 active:scale-[0.98] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-white/40" />
                        <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Next Step</span>
                      </div>
                      <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                        <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                      </div>
                    </button>
                  </div>
                )}
              </motion.form>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between gap-3">
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      id={`reg-otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyUp={(e) => e.key === 'Backspace' && i > 0 && !digit && document.getElementById(`reg-otp-${i-1}`).focus()}
                      className="w-full h-16 bg-white border border-black/[0.03] rounded-2xl text-center text-xl font-black text-[#C44545] focus:outline-none focus:border-[#C44545]/20 focus:shadow-xl focus:shadow-[#C44545]/5 transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Didn't receive code? 
                    <button type="button" onClick={handleSendOTP} className="text-[#C44545] ml-2">Resend OTP</button>
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={handleRegister} 
                  className="w-full bg-slate-900 h-16 rounded-[1.8rem] flex items-center justify-between px-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-white/40" />
                    <span className="text-white text-[13px] font-black uppercase tracking-[0.2em]">Verify & Finish</span>
                  </div>
                  <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    <ArrowRight size={18} strokeWidth={3} className="text-white group-hover:text-slate-900" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Social/Login */}
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
        </motion.div>
      </div>
    </div>
  );
};

export default UserRegister;

