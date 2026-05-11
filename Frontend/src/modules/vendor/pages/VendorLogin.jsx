import { motion } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { initVendorState } from "../utils/vendorStore";
import { useState } from "react";
import toast from "react-hot-toast";

import logo from "../../../assets/logo.png";

const VendorLogin = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      const tid = toast.loading("Sending OTP...");
      try {
        const response = await fetch('http://localhost:5000/api/vendors/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: phoneNumber })
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("OTP Sent Successfully", { id: tid });
          setStep(2);
        } else {
          toast.error(data.message, { id: tid });
        }
      } catch (err) {
        toast.error("Failed to send OTP. Is server running?", { id: tid });
      }
    } else {
      toast.error("Please enter a valid 10-digit number");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const tid = toast.loading("Verifying...");
    try {
      const response = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber, otp: otp.join('') })
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Login Successful", { id: tid });
        initVendorState({ ...data.vendor, token: data.token });
        navigate('/vendor');
      } else {
        toast.error(data.message, { id: tid });
      }
    } catch (err) {
      toast.error("Login failed. Check connection.", { id: tid });
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`vendor-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const containerClasses = isEmbedded 
    ? "px-6 py-4 text-neutral-900 font-inter" 
    : "h-screen bg-white px-6 flex flex-col justify-center overflow-hidden text-neutral-900 font-inter";

  return (
    <div className={containerClasses}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm mx-auto">
        {!isEmbedded && (
          <div className="h-20 w-20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
          </div>
        )}
        <h1 className={`${isEmbedded ? 'text-2xl' : 'text-3xl'} font-black tracking-tighter leading-tight mb-2 uppercase text-slate-900`}>
          {isEmbedded ? "Partner Login" : <>Partner<br/>Login.</>}
        </h1>
        <p className={`${isEmbedded ? 'text-[15px]' : 'text-sm'} font-bold text-neutral-600 mb-8 tracking-tight leading-snug`}>
           {step === 1 ? "Enter your phone number to receive OTP" : `Enter the 4-digit code sent to +91 ${phoneNumber}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-black uppercase text-neutral-600 tracking-[0.15em] pl-1 block">Phone Number</label>
              <div className="flex bg-neutral-50/50 border-2 border-neutral-100 rounded-[1.2rem] px-5 py-4 focus-within:border-[#C44545] focus-within:bg-white transition-all shadow-sm">
                 <span className="text-base font-black text-neutral-700 mr-3">+91</span>
                 <input 
                   type="tel" 
                   maxLength={10}
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   placeholder="00000 00000" 
                   className="bg-transparent text-base font-bold w-full focus:outline-none placeholder:text-neutral-400 text-neutral-900"
                 />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-[#C44545] text-white rounded-[1.2rem] py-4 font-black uppercase tracking-widest text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all mt-6">
              GET OTP <ArrowRight size={16} strokeWidth={3} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-center gap-4">
              {otp.map((digit, idx) => (
                <input 
                  key={idx}
                  id={`vendor-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyUp={(e) => e.key === 'Backspace' && idx > 0 && !digit && document.getElementById(`vendor-otp-${idx-1}`).focus()}
                  className="w-14 h-16 bg-white border-2 border-slate-300 rounded-xl text-center text-2xl font-black focus:outline-none focus:border-[#C44545] transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="text-center">
               <button type="button" onClick={() => setStep(1)} className="text-[13px] font-black uppercase text-slate-600 tracking-widest border-b-2 border-slate-200 pb-0.5">Resend OTP ?</button>
            </div>

            <button type="submit" className="w-full bg-[#C44545] text-white rounded-[1.2rem] py-4 font-black uppercase tracking-widest text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all mt-4">
              VERIFY & LOGIN
            </button>
          </form>
        )}

        <div className="text-center mt-10">
          <p className="text-[14px] font-bold text-neutral-600">
             Not a registered vendor? <Link to="/vendor/register" className="text-[#C44545] font-black border-b-2 border-[#C44545]/30 pb-0.5 ml-1">Apply here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
