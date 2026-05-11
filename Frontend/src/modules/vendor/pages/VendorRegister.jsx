import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, Wrench, Shield, Briefcase, FileText, Truck, Phone, ArrowRight, Car, Camera, MapPin, CheckCircle2, ShieldCheck, CreditCard, Landmark, Info, Map, Clock, Zap, Hammer, Wind, Battery, Settings, Disc, Droplets, Building2, Scale, GraduationCap, Video, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { State, City } from "country-state-city";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('driver');
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);

  // --- Location Constants ---
  const allStates = useMemo(() => State.getStatesOfCountry('IN'), []);

  // --- States ---
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", state: "", isoCode: "", pincode: "" });
  const [liveLocation, setLiveLocation] = useState(null);
  const [capturedAddress, setCapturedAddress] = useState("");

  const [profData, setProfData] = useState({
    dlNumber: "", dlExpiry: "", dlFile: null, vehicleClasses: [], experience: "1-3 Years", bgCheck: false, availability: "Full Time", languages: ["Hindi"],
    serviceState: "", serviceStateCode: "", serviceDistricts: []
  });

  const [mechanicData, setMechanicData] = useState({
    specialties: [], serviceType: "Both", garageName: "", garageAddress: "", garageLocation: null,
    vehicleExpertise: [], experienceRange: "1-3 Years", workingHours: "9 AM - 7 PM", emergencySupport: false, serviceRadius: "10 KM"
  });

  const [rtoData, setRtoData] = useState({
    rtoOffice: "MH-12", services: [], experience: "1-3 Years", officeAddress: "", officeCity: "", officeLocation: null
  });

  const [legalData, setLegalData] = useState({
    barRegNumber: "", practiceAreas: [], experience: "1-3 Years", officeName: "", visitingAddress: "", city: "", gpsLocation: null, consultationType: "Both"
  });

  const [bankData, setBankData] = useState({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "" });
  const [kycFiles, setKycFiles] = useState({ 
    aadhaar: null, pan: null, selfie: null, policeVerification: null, dlFile: null, 
    garagePhoto: null, shopLicense: null, barCertificate: null, advocateId: null,
    regCertificate: null, officeProof: null
  });

  // --- Handlers ---
  const handleSendOTP = async () => {
    if (mobile.length !== 10) return toast.error("Enter valid 10-digit mobile");
    const tid = toast.loading("Sending OTP...");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setIsOtpSent(true);
        toast.success(data.message, { id: tid });
    } catch (error) {
        toast.error(error.message || "Failed to send OTP", { id: tid });
    }
  };

  const fetchLiveLocation = (type = 'personal') => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    const tid = toast.loading("Capturing precise location...");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      let fetchedAddress = "";
      let fetchedCity = "";

      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`);
          const data = await res.json();
          
          if (data && data.display_name) {
              fetchedAddress = data.display_name;
              fetchedCity = data.address?.city || data.address?.town || data.address?.village || "";
              
              if (type === 'personal') {
                setAddress(prev => ({
                    ...prev,
                    street: fetchedAddress,
                    city: fetchedCity,
                    state: data.address?.state || prev.state,
                    pincode: data.address?.postcode || prev.pincode
                }));
                setLiveLocation(loc);
              }
          }
          
          // Role-specific updates
          if (type === 'garage') {
              setMechanicData(prev => ({ 
                  ...prev, 
                  garageLocation: loc,
                  garageAddress: fetchedAddress,
                  garageCity: fetchedCity
              }));
          } else if (type === 'rto') {
              setRtoData(prev => ({ 
                  ...prev, 
                  officeLocation: loc,
                  officeAddress: fetchedAddress,
                  officeCity: fetchedCity
              }));
          } else if (type === 'legal') {
              setLegalData(prev => ({ 
                  ...prev, 
                  gpsLocation: loc,
                  visitingAddress: fetchedAddress,
                  city: fetchedCity
              }));
          }
          
          toast.dismiss(tid);
          toast.success("Location & Address Captured!");
      } catch (err) {
          console.error("Reverse Geocoding Error:", err);
          toast.dismiss(tid);
          toast.error("Failed to fetch address details");
      }
    }, () => { 
        toast.dismiss(tid); 
        toast.error("Location access denied"); 
    }, { enableHighAccuracy: true, timeout: 5000 });
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    const tid = toast.loading("Creating Partner Profile...");

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('mobile', mobile);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('address', JSON.stringify(address));
        formData.append('liveLocation', JSON.stringify(liveLocation));
        formData.append('profData', JSON.stringify(profData));
        formData.append('mechanicData', JSON.stringify(mechanicData));
        formData.append('rtoData', JSON.stringify(rtoData));
        formData.append('legalData', JSON.stringify(legalData));
        formData.append('bankData', JSON.stringify(bankData));

        if (profileFile) formData.append('profileImage', profileFile);
        Object.keys(kycFiles).forEach(key => {
            if (kycFiles[key]) formData.append(key, kycFiles[key]);
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/register`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Registration failed");

        toast.success(data.message || "Registration Successful!", { id: tid });
        navigate('/vendor/login');
    } catch (error) {
        toast.error(error.message || "Registration failed", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let totalSteps = 6;
    if (role === 'mechanic') totalSteps = 8;
    if (role === 'towing') totalSteps = 4;
    if (role === 'rto') totalSteps = 5;
    if (role === 'legal') totalSteps = 6;

    return (
      <div className="px-6 py-6 border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-black/5">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">Stage {step} of {totalSteps}</span>
            <span className="text-[12px] font-black tracking-tight text-slate-900 uppercase">{role} Registration</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(step / totalSteps) * 100}%` }} className="h-full bg-[#C44545]" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      {step > 0 && renderHeader()}
      <div className="flex-1 px-6 pb-12 overflow-y-auto hide-scrollbar max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            
            {step === 0 && (
              <div className="space-y-6 pt-4">
                <div className="px-2">
                  <h1 className="text-2xl font-black text-slate-900 mb-2 leading-none">Join Sootit Network.</h1>
                  <p className="text-sm font-bold text-neutral-500">Choose your area of expertise to begin.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'driver', label: 'Driver', icon: Navigation, desc: 'Professional chauffeur services' },
                    { id: 'mechanic', label: 'Mechanic', icon: Wrench, desc: 'Vehicle repair & maintenance' },
                    { id: 'towing', label: 'Towing', icon: Truck, desc: '24/7 recovery & towing' },
                    { id: 'rto', label: 'RTO Agent', icon: FileText, desc: 'Paperwork assistant' },
                    { id: 'legal', label: 'Legal Advisor', icon: Briefcase, desc: 'Vehicle law expert' },
                  ].map((r) => (
                    <div key={r.id} onClick={() => { setRole(r.id); setStep(1); }} className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 ${role === r.id ? 'border-[#C44545] bg-[#C44545] text-white' : 'border-neutral-200 bg-white'}`}>
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${role === r.id ? 'bg-white/10' : 'bg-neutral-100'}`}><r.icon size={22} /></div>
                      <div><p className="text-[15px] font-black uppercase">{r.label}</p><p className="text-[12px] opacity-70 font-bold">{r.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative h-28 w-28 bg-rose-50 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {profileImg ? <img src={profileImg} className="h-full w-full object-cover" /> : <Camera className="text-[#C44545]/30" size={32} />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files[0]; if(file) { setProfileFile(file); setProfileImg(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">Upload Photo</span>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  <div className="flex gap-2">
                    <input type="tel" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <button onClick={handleSendOTP} className="bg-[#C44545] text-white px-6 rounded-2xl text-[10px] font-black uppercase">Verify</button>
                  </div>
                  {isOtpSent && (
                    <div className="flex gap-3 justify-center py-2">
                      {otp.map((d, i) => (
                        <input key={i} type="tel" maxLength={1} value={d} onChange={(e) => {
                          const n = [...otp]; n[i] = e.target.value; setOtp(n);
                          if(e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                        }} className="w-12 h-14 bg-rose-50 border-2 border-[#C44545]/10 rounded-xl text-center text-xl font-black text-[#C44545]" />
                      ))}
                    </div>
                  )}
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  
                  {role !== 'rto' && role !== 'legal' && (
                    <div className="pt-4 space-y-4 border-t border-slate-100">
                      <button type="button" onClick={() => fetchLiveLocation()} className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] border transition-all ${liveLocation ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-[#C44545] border-[#C44545]/10'}`}>
                        <MapPin size={16} /> {liveLocation ? "Location Updated" : "Capture Live Location"}
                      </button>
                      <div className="space-y-4">
                        <input type="text" placeholder="Current Address" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                        
                        <div className="grid grid-cols-1 gap-4">
                          <select 
                            value={address.isoCode} 
                            onChange={(e) => {
                              const s = allStates.find(x => x.isoCode === e.target.value);
                              setAddress({...address, state: s?.name || "", isoCode: e.target.value, city: ""});
                            }} 
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold"
                          >
                            <option value="">Select State</option>
                            {allStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                          </select>

                          <select 
                            value={address.city} 
                            onChange={(e) => setAddress({...address, city: e.target.value})} 
                            disabled={!address.isoCode}
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold disabled:opacity-50"
                          >
                            <option value="">Select City/District</option>
                            {address.isoCode && City.getCitiesOfState('IN', address.isoCode).map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>

                          <input type="tel" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-6">Next Step <ArrowRight size={18} /></button>
              </div>
            )}

            {/* Towing & Driver Professional Details */}
            {(role === 'driver' || role === 'towing') && step === 2 && (
              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#C44545] ml-2">Step 2: Professional Details</h3>
                <div className="space-y-4">
                  <div className="px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Driving License Info</label>
                    <input type="text" placeholder="DL Number" value={profData.dlNumber} onChange={(e) => setProfData({...profData, dlNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold mb-3" />
                    <input type="date" value={profData.dlExpiry} onChange={(e) => setProfData({...profData, dlExpiry: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-400" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4">Vehicle Classes</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(role === 'towing' ? ['LMV', 'HMV', 'MCWG'] : ['2-wheeler', '4-wheeler', 'transport']).map(c => (
                        <div key={c} onClick={() => {
                          const n = profData.vehicleClasses.includes(c) ? profData.vehicleClasses.filter(x => x !== c) : [...profData.vehicleClasses, c];
                          setProfData({...profData, vehicleClasses: n});
                        }} className={`py-4 rounded-xl border-2 text-center text-[11px] font-black transition-all ${profData.vehicleClasses.includes(c) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400'}`}>{c}</div>
                      ))}
                    </div>
                  </div>

                  <div className="px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Experience</label>
                    <select value={profData.experience} onChange={(e) => setProfData({...profData, experience: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                      <option>0-1 Years</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                    </select>
                  </div>

                  <div onClick={() => setProfData({...profData, bgCheck: !profData.bgCheck})} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${profData.bgCheck ? 'bg-[#C44545] border-[#C44545] text-white' : 'border-slate-300'}`}>{profData.bgCheck && <CheckCircle2 size={12} />}</div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">I agree to background verification</span>
                  </div>

                  {/* Service Locations for Drivers */}
                  {role === 'driver' && (
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div className="px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545] mb-2">Operational Areas</h4>
                        <p className="text-[11px] font-bold text-slate-400 mb-4">Select districts where you can provide driving services.</p>
                      </div>
                      
                      <select 
                        value={profData.serviceStateCode} 
                        onChange={(e) => {
                          const s = allStates.find(x => x.isoCode === e.target.value);
                          setProfData({...profData, serviceState: s?.name || "", serviceStateCode: e.target.value, serviceDistricts: []});
                        }} 
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold"
                      >
                        <option value="">Select Service State</option>
                        {allStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                      </select>

                      {profData.serviceStateCode && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-4">Select Districts (Multiple)</label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-white no-scrollbar">
                            {City.getCitiesOfState('IN', profData.serviceStateCode).map(city => (
                              <div 
                                key={city.name}
                                onClick={() => {
                                  const n = profData.serviceDistricts.includes(city.name) 
                                    ? profData.serviceDistricts.filter(x => x !== city.name) 
                                    : [...profData.serviceDistricts, city.name];
                                  setProfData({...profData, serviceDistricts: n});
                                }}
                                className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${profData.serviceDistricts.includes(city.name) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                              >
                                {city.name}
                              </div>
                            ))}
                          </div>
                          {profData.serviceDistricts.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-2">
                              {profData.serviceDistricts.map(d => (
                                <span key={d} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase">{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(3)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
              </div>
            )}

            {/* Towing & Driver Documents */}
            {(role === 'driver' || role === 'towing') && step === 3 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step 3: Documents Upload.</h3>
                {['aadhaar', 'pan', 'dlFile', 'selfie'].map(k => (
                  <div key={k} className="relative p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kycFiles[k] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{kycFiles[k] ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                      <span className="text-[12px] font-black uppercase tracking-tight">{k === 'dlFile' ? 'DL Upload' : k.toUpperCase()}</span>
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFiles({...kycFiles, [k]: e.target.files[0]})} />
                  </div>
                ))}
                <button onClick={() => setStep(4)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-6">Next Step</button>
              </div>
            )}

            {/* Mechanic Flow */}
            {role === 'mechanic' && (
              <>
                {step === 2 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#C44545] ml-2">Step 2: Specialties & Shop</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Engine', 'Electrical', 'Body Work', 'AC Repair', 'Battery', 'Tyre/Puncture', 'Oil Service', 'General Service'].map(s => (
                        <div key={s} onClick={() => {
                          const n = mechanicData.specialties.includes(s) ? mechanicData.specialties.filter(x => x !== s) : [...mechanicData.specialties, s];
                          setMechanicData({...mechanicData, specialties: n});
                        }} className={`p-4 rounded-2xl border-2 text-[11px] font-black uppercase transition-all ${mechanicData.specialties.includes(s) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-500'}`}>{s}</div>
                      ))}
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <input type="text" placeholder="Garage / Shop Name" value={mechanicData.garageName} onChange={(e) => setMechanicData({...mechanicData, garageName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      <button onClick={() => fetchLiveLocation('garage')} className="w-full h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] border border-blue-100">
                        <MapPin size={16} /> {mechanicData.garageLocation ? "GPS Captured" : "Garage GPS Location"}
                      </button>
                    </div>
                    <button onClick={() => setStep(3)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-black text-slate-900 px-2 leading-tight">Step 3 — Vehicle Expertise</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {['2 Wheeler', '4 Wheeler', 'Heavy Vehicle', 'Truck', 'Bus'].map(v => (
                        <div key={v} onClick={() => {
                          const n = mechanicData.vehicleExpertise.includes(v) ? mechanicData.vehicleExpertise.filter(x => x !== v) : [...mechanicData.vehicleExpertise, v];
                          setMechanicData({...mechanicData, vehicleExpertise: n});
                        }} className={`p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer ${mechanicData.vehicleExpertise.includes(v) ? 'border-[#C44545] bg-rose-50' : 'border-slate-100'}`}><span className="font-black uppercase text-sm">{v}</span></div>
                      ))}
                    </div>
                    <button onClick={() => setStep(4)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-black text-slate-900 px-2 leading-tight">Step 4 — Experience Details</h3>
                    <select value={mechanicData.experienceRange} onChange={(e) => setMechanicData({...mechanicData, experienceRange: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                      <option>0-1 Years</option><option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                    </select>
                    <input type="text" placeholder="Working Hours" value={mechanicData.workingHours} onChange={(e) => setMechanicData({...mechanicData, workingHours: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <button onClick={() => setStep(5)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 5 && (
                  <div className="space-y-6 pt-4 text-center">
                    <h3 className="text-xl font-black text-slate-900 px-2">Step 5 — Service Radius</h3>
                    <select value={mechanicData.serviceRadius} onChange={(e) => setMechanicData({...mechanicData, serviceRadius: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                      <option>5 KM</option><option>10 KM</option><option>20 KM</option><option>50 KM</option>
                    </select>
                    <button onClick={() => setStep(6)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 6 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-black text-slate-900 px-2">Step 6 — Documents / KYC</h3>
                    {['aadhaar', 'pan', 'garagePhoto', 'shopLicense'].map(k => (
                      <div key={k} className="relative p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-between">
                        <span className="text-[12px] font-black uppercase tracking-tight">{k}</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFiles({...kycFiles, [k]: e.target.files[0]})} />
                      </div>
                    ))}
                    <button onClick={() => setStep(7)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-6">Next Step</button>
                  </div>
                )}
                {step === 7 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-black text-slate-900 px-2 leading-tight">Step 7 — Bank Details</h3>
                    <input type="text" placeholder="Account Holder Name" value={bankData.accountHolderName} onChange={(e) => setBankData({...bankData, accountHolderName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="Bank Name" value={bankData.bankName} onChange={(e) => setBankData({...bankData, bankName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="Account Number" value={bankData.accountNumber} onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="IFSC Code" value={bankData.ifscCode} onChange={(e) => setBankData({...bankData, ifscCode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <button onClick={() => setStep(8)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-6">Next Step</button>
                  </div>
                )}
                {step === 8 && (
                   <div className="space-y-6 pt-4 text-center">
                    <h3 className="text-xl font-black text-slate-900 px-2">Step 8 — Emergency Availability</h3>
                    <div onClick={() => setMechanicData({...mechanicData, emergencySupport: !mechanicData.emergencySupport})} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer ${mechanicData.emergencySupport ? 'border-[#C44545] bg-rose-50' : 'border-slate-100 bg-white'}`}>
                      <Zap className={mechanicData.emergencySupport ? 'text-[#C44545] mx-auto mb-2' : 'text-slate-300 mx-auto mb-2'} />
                      <p className="font-black uppercase text-[15px]">24x7 Emergency Support</p>
                    </div>
                    <button onClick={handleFinalSubmit} className="w-full bg-[#C44545] text-white h-20 rounded-[2.5rem] font-black uppercase mt-8">Finish Registration</button>
                  </div>
                )}
              </>
            )}

            {/* RTO Flow */}
            {role === 'rto' && (
              <>
                {step === 2 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#C44545] ml-2">Step 2: RTO Details</h3>
                    <div className="px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">RTO Office</label>
                        <select value={rtoData.rtoOffice} onChange={(e) => setRtoData({...rtoData, rtoOffice: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                            <option>MH-12</option><option>MP-04</option><option>DL-01</option>
                        </select>
                    </div>
                    <div className="space-y-3 px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block ml-2">Services</label>
                      <div className="flex flex-wrap gap-2">
                        {['RC Transfer', 'License Renewal', 'Vehicle Registration', 'NOC', 'Hypothecation Removal'].map(s => (
                          <div key={s} onClick={() => {
                            const n = rtoData.services.includes(s) ? rtoData.services.filter(x => x !== s) : [...rtoData.services, s];
                            setRtoData({...rtoData, services: n});
                          }} className={`px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase transition-all ${rtoData.services.includes(s) ? 'border-[#C44545] bg-[#C44545] text-white' : 'border-slate-100 bg-white text-slate-400'}`}>{s}</div>
                        ))}
                      </div>
                    </div>
                    <div className="px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Experience</label>
                        <select value={rtoData.experience} onChange={(e) => setRtoData({...rtoData, experience: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                            <option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                        </select>
                    </div>
                    <button onClick={() => setStep(3)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-8">Next Step</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step 3: Office Address.</h3>
                    <input type="text" placeholder="Office Address" value={rtoData.officeAddress} onChange={(e) => setRtoData({...rtoData, officeAddress: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="City" value={rtoData.officeCity} onChange={(e) => setRtoData({...rtoData, officeCity: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <button onClick={() => fetchLiveLocation('rto')} className="w-full h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] border border-indigo-100 mt-4">
                      <MapPin size={16} /> {rtoData.officeLocation ? "GPS Captured" : "Capture Office GPS"}
                    </button>
                    <button onClick={() => setStep(4)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-8">Next Step</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step 4: Documents Upload.</h3>
                    {['aadhaar', 'pan', 'regCertificate', 'officeProof'].map(k => (
                      <div key={k} className="relative p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kycFiles[k] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{kycFiles[k] ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                          <span className="text-[12px] font-black uppercase tracking-tight">{k === 'regCertificate' ? 'Registration Certificate' : k === 'officeProof' ? 'Office Proof' : k.toUpperCase()}</span>
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFiles({...kycFiles, [k]: e.target.files[0]})} />
                      </div>
                    ))}
                    <button onClick={() => setStep(5)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-6">Next Step</button>
                  </div>
                )}
              </>
            )}

            {/* Legal Flow */}
            {role === 'legal' && (
              <>
                {step === 2 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#C44545] ml-2">Step 2: Professional Details</h3>
                    <input type="text" placeholder="Bar Registration Number" value={legalData.barRegNumber} onChange={(e) => setLegalData({...legalData, barRegNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <div className="space-y-3 px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block ml-2">Practice Areas</label>
                      <div className="flex flex-wrap gap-2">
                        {['Traffic Violations', 'Accidental Claims', 'Insurance Cases', 'Motor Accident Cases', 'Vehicle Seizure Cases'].map(s => (
                          <div key={s} onClick={() => {
                            const n = legalData.practiceAreas.includes(s) ? legalData.practiceAreas.filter(x => x !== s) : [...legalData.practiceAreas, s];
                            setLegalData({...legalData, practiceAreas: n});
                          }} className={`px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase transition-all ${legalData.practiceAreas.includes(s) ? 'border-[#C44545] bg-[#C44545] text-white' : 'border-slate-100 bg-white text-slate-400'}`}>{s}</div>
                        ))}
                      </div>
                    </div>
                    <div className="px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Experience</label>
                        <select value={legalData.experience} onChange={(e) => setLegalData({...legalData, experience: e.target.value})} className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold">
                            <option>1-3 Years</option><option>3-5 Years</option><option>5+ Years</option>
                        </select>
                    </div>
                    <button onClick={() => setStep(3)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step 3: Office Address.</h3>
                    <input type="text" placeholder="Office Name" value={legalData.officeName} onChange={(e) => setLegalData({...legalData, officeName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="Visiting Address" value={legalData.visitingAddress} onChange={(e) => setLegalData({...legalData, visitingAddress: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <input type="text" placeholder="City" value={legalData.city} onChange={(e) => setLegalData({...legalData, city: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                    <button onClick={() => fetchLiveLocation('legal')} className="w-full h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] border border-emerald-100 mt-4">
                      <MapPin size={16} /> {legalData.gpsLocation ? "GPS Captured" : "Capture Office GPS"}
                    </button>
                    <button onClick={() => setStep(4)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-6 pt-4 text-center">
                    <h3 className="text-xl font-black text-slate-900">Step 4: Consultation Mode</h3>
                    {['Online', 'Offline', 'Both'].map(t => (
                      <div key={t} onClick={() => setLegalData({...legalData, consultationType: t})} className={`p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer ${legalData.consultationType === t ? 'border-[#C44545] bg-rose-50' : 'border-slate-100 bg-white'}`}>
                        <span className="font-black uppercase text-sm">{t} Consultation</span>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${legalData.consultationType === t ? 'bg-[#C44545] border-[#C44545] text-white' : 'border-slate-200'}`}>{legalData.consultationType === t && <CheckCircle2 size={12} />}</div>
                      </div>
                    ))}
                    <button onClick={() => setStep(5)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
                {step === 5 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step 5: Documents Upload.</h3>
                    {['aadhaar', 'pan', 'barCertificate', 'advocateId'].map(k => (
                      <div key={k} className="relative p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${kycFiles[k] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{kycFiles[k] ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                          <span className="text-[12px] font-black uppercase tracking-tight">{k === 'barCertificate' ? 'Bar Certificate' : k === 'advocateId' ? 'Advocate ID' : k.toUpperCase()}</span>
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFiles({...kycFiles, [k]: e.target.files[0]})} />
                      </div>
                    ))}
                    <button onClick={() => setStep(6)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase mt-4">Next Step</button>
                  </div>
                )}
              </>
            )}

            {/* Common Final Step for Roles with 4 or more steps */}
            {((role === 'rto' && step === 5) || (role === 'legal' && step === 6) || (role === 'driver' && step === 4) || (role === 'towing' && step === 4)) && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-black text-slate-900 mb-4 px-2">Step {step}: Bank Details.</h3>
                <input type="text" placeholder="Account Holder Name" value={bankData.accountHolderName} onChange={(e) => setBankData({...bankData, accountHolderName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                <input type="text" placeholder="Bank Name" value={bankData.bankName} onChange={(e) => setBankData({...bankData, bankName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                <input type="text" placeholder="Account Number" value={bankData.accountNumber} onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                <input type="text" placeholder="IFSC Code" value={bankData.ifscCode} onChange={(e) => setBankData({...bankData, ifscCode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                <input type="text" placeholder="UPI ID" value={bankData.upiId} onChange={(e) => setBankData({...bankData, upiId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                <button onClick={handleFinalSubmit} className="w-full bg-[#C44545] text-white h-20 rounded-[2.5rem] font-black uppercase mt-6 shadow-xl">Finish Registration</button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorRegister;
