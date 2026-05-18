import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, Wrench, Shield, Briefcase, FileText, Truck, Phone, ArrowRight, Car, Camera, MapPin, CheckCircle2, ShieldCheck, CreditCard, Landmark, Info, Map, Clock, Zap, Hammer, Wind, Battery, Settings, Disc, Droplets, Building2, Scale, GraduationCap, Video, Users, ChevronDown, Search, Globe, Check, Square, CheckSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { State } from "country-state-city";
import { indiaData } from '../../../utils/indiaData';

const VendorRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('driver');
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);

  // --- Constants ---
  const allStatesRaw = useMemo(() => State.getStatesOfCountry('IN'), []);
  const allStates = useMemo(() => Object.keys(indiaData).sort().map(name => ({
      name,
      isoCode: allStatesRaw.find(s => s.name === name)?.isoCode || name
  })), [allStatesRaw]);
  const mechanicServices = ['General Service', 'Engine Repair', 'Brake Service', 'Electrical Work', 'AC Service', 'Suspension & Steering', 'Oil & Filter Change', 'Body Work & Paint', 'Clutch & Gearbox', 'Battery & Charging'];
  const rtoServices = ['RC Transfer', 'Driving License', 'Vehicle Insurance', 'Hypothecation Addition/Removal', 'NOC Certificate', 'Fitness Certificate', 'Permit Work', 'Address Change', 'Duplicate RC', 'Tax Payment'];
  const legalPractices = ['Criminal Law', 'Civil Law', 'Property Law', 'Family Law', 'Corporate Law', 'Accident Claims', 'Taxation Law', 'Consumer Court', 'Cyber Law', 'Labor Law'];

  // --- States ---
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", state: "", isoCode: "", pincode: "" });
  const [liveLocation, setLiveLocation] = useState(null);

  const [profData, setProfData] = useState({
    dlNumber: "", dlExpiry: "", dlFile: null, vehicleClasses: [], experience: "1-3 Years", bgCheck: false, availability: "Full Time", languages: ["Hindi"],
    serviceStates: [], 
    aadhaarNumber: ""
  });

  const [mechanicData, setMechanicData] = useState({
    specialties: [], serviceType: "Both", garageName: "", garageAddress: "", garageLocation: null,
    vehicleExpertise: [], experienceRange: "1-3 Years", workingHours: "9 AM - 7 PM", emergencySupport: false, serviceRadius: "10 KM"
  });

  const [rtoData, setRtoData] = useState({
    rtoOffice: "", services: [], experience: "1-3 Years", officeAddress: "", officeCity: "", officeLocation: null
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

  // --- Custom Dropdown Component ---
  const CustomDropdown = ({ label, options, value, onChange, placeholder, icon: Icon, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(opt => 
        (opt.name || opt).toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">{label}</label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white border ${isOpen ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-200'} rounded-2xl py-4 px-6 transition-all disabled:opacity-50`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon size={18} className={value ? 'text-[#C44545]' : 'text-slate-400'} />}
                    <span className={`text-sm font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
                        {value || placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#C44545]' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                    >
                        <div className="p-3 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:ring-0"
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto no-scrollbar p-1">
                            {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => {
                                const name = opt.name || opt;
                                const isSelected = value === name;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${isSelected ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {name}
                                        {isSelected && <Check size={14} />}
                                    </button>
                                );
                            }) : (
                                <div className="p-4 text-center text-xs font-bold text-slate-400">No results found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

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
                const fetchedStateName = data.address?.state || "";
                const stateObj = allStates.find(s => s.name === fetchedStateName);
                
                setAddress(prev => ({
                    ...prev,
                    street: fetchedAddress,
                    city: fetchedCity,
                    state: fetchedStateName,
                    isoCode: stateObj?.isoCode || prev.isoCode,
                    pincode: data.address?.postcode || prev.pincode
                }));
                setLiveLocation(loc);
              }
          }
          
          if (type === 'garage') {
              setMechanicData(prev => ({ ...prev, garageLocation: loc, garageAddress: fetchedAddress }));
          } else if (type === 'rto') {
              setRtoData(prev => ({ ...prev, officeLocation: loc, officeAddress: fetchedAddress }));
          } else if (type === 'legal') {
              setLegalData(prev => ({ ...prev, gpsLocation: loc, visitingAddress: fetchedAddress }));
          }
          
          toast.dismiss(tid);
          toast.success("Location & Address Captured!");
      } catch (err) {
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
        if (email && email.trim() !== "") {
            formData.append('email', email.trim());
        }
        formData.append('password', password || mobile);
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
        navigate('/auth?tab=vendor');
    } catch (error) {
        toast.error(error.message || "Registration failed", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let totalSteps = 2; // All roles consolidated to 2 steps now
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

  const toggleStateSelection = (state) => {
    const isSelected = profData.serviceStates.some(s => s.isoCode === state.isoCode);
    let newStates;
    if (isSelected) {
        newStates = profData.serviceStates.filter(s => s.isoCode !== state.isoCode);
    } else {
        newStates = [...profData.serviceStates, { name: state.name, isoCode: state.isoCode, districts: [] }];
    }
    setProfData({ ...profData, serviceStates: newStates });
  };

  const toggleDistrictSelection = (stateCode, districtName) => {
    const newStates = profData.serviceStates.map(s => {
        if (s.isoCode === stateCode) {
            const isDistSelected = s.districts.includes(districtName);
            return {
                ...s,
                districts: isDistSelected 
                    ? s.districts.filter(d => d !== districtName) 
                    : [...s.districts, districtName]
            };
        }
        return s;
    });
    setProfData({ ...profData, serviceStates: newStates });
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
                {onSwitchToLogin && (
                  <div className="text-center mt-6">
                    <p className="text-[13px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                      Already a member? 
                      <button onClick={onSwitchToLogin} className="text-[#C44545] ml-2 border-b-2 border-[#C44545]/30 pb-0.5">Login Here</button>
                    </p>
                  </div>
                )}
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
                  <input type="email" placeholder="Email Address (Optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  
                  <div className="relative group">
                    <input 
                      type="password" 
                      placeholder="Set Secure Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold focus:border-[#C44545] transition-all" 
                    />
                  </div>

                  <div className="pt-4 space-y-4 border-t border-slate-100">
                    <div className="space-y-4">
                      <textarea 
                        placeholder="Full Address (House No, Street, Landmark)" 
                        rows={3}
                        value={address.street} 
                        onChange={(e) => setAddress({...address, street: e.target.value})} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold resize-none"
                      />
                      
                      <div className="grid grid-cols-1 gap-4">
                        <CustomDropdown 
                          label="State"
                          options={allStates}
                          value={address.state}
                          placeholder="Select State"
                          icon={Globe}
                          onChange={(s) => setAddress({...address, state: s.name, isoCode: s.isoCode, city: ""})}
                        />

                        <CustomDropdown 
                          label="City / District"
                          options={address.state ? indiaData[address.state] || [] : []}
                          value={address.city}
                          placeholder="Select City/District"
                          icon={MapPin}
                          disabled={!address.state}
                          onChange={(c) => setAddress({...address, city: c})}
                        />

                        <input type="tel" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Locations (For All Roles now) */}
                <div className="pt-8 mt-4 border-t-2 border-slate-100 space-y-6">
                  <div className="px-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Map size={18} className="text-[#C44545]" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Service Locations</h4>
                    </div>
                    <p className="text-[12px] font-bold text-slate-400">Select multiple states and their districts.</p>
                  </div>
                  
                  <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Available States</label>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-4 border border-slate-200 rounded-[2rem] bg-white no-scrollbar shadow-inner">
                          {allStates.map(state => {
                              const isSelected = profData.serviceStates.some(s => s.isoCode === state.isoCode);
                              return (
                                  <div key={state.isoCode} className="space-y-3">
                                      <div 
                                          onClick={() => toggleStateSelection(state)}
                                          className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-600 hover:bg-slate-50'}`}
                                      >
                                          <span className="text-[12px] font-black uppercase">{state.name}</span>
                                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                      </div>

                                      {isSelected && (
                                          <div className="pl-6 space-y-2 pb-4 border-l-2 border-rose-100 ml-4">
                                              <div className="flex items-center justify-between mb-2 pr-2">
                                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Select Districts</span>
                                                  <span className="text-[9px] font-black text-[#C44545]">{profData.serviceStates.find(s => s.isoCode === state.isoCode)?.districts.length || 0} Picked</span>
                                              </div>
                                              <div className="grid grid-cols-1 gap-2">
                                                  {(indiaData[state.name] || []).map(district => { 
                                                      const isDistSelected = profData.serviceStates.find(s => s.isoCode === state.isoCode)?.districts.includes(district);
                                                      return (
                                                          <div 
                                                              key={district}
                                                              onClick={() => toggleDistrictSelection(state.isoCode, district)}
                                                              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isDistSelected ? 'border-[#C44545]/30 bg-white text-[#C44545]' : 'border-slate-100 text-slate-500 bg-slate-50/50'}`}
                                                          >
                                                              <span className="text-[11px] font-bold">{district}</span>
                                                              {isDistSelected ? <CheckCircle2 size={16} className="fill-[#C44545] text-white" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200" />}
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-6">Next Step <ArrowRight size={18} /></button>
              </div>
            )}

            {/* Step 2: Professional Details (Unified for all roles) */}
            {step === 2 && (
              <div className="space-y-6 pt-4 pb-20">
                <div className="px-2">
                  <h3 className="text-xl font-black text-slate-900 mb-1">Final Step.</h3>
                  <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Professional Details</p>
                </div>
                <div className="space-y-4">
                  {role === 'driver' && (
                    <div className="px-2 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Driving License Info</label>
                        <input type="text" placeholder="DL Number" value={profData.dlNumber} onChange={(e) => setProfData({...profData, dlNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Driving Licence Expiry Date</label>
                        <input type="date" value={profData.dlExpiry} onChange={(e) => setProfData({...profData, dlExpiry: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-400" />
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Service Type</label>
                        <div className="flex gap-3">
                          {['Full Time', 'Part Time'].map(type => (
                            <button 
                              key={type}
                              type="button"
                              onClick={() => setProfData({...profData, availability: type})}
                              className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[11px] transition-all ${profData.availability === type ? 'border-[#C44545] bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'mechanic' && (
                    <div className="space-y-6">
                      <div className="space-y-3 px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Services Offered (Multiple Select)</label>
                        <div className="flex flex-col gap-2">
                          {mechanicServices.map(srv => (
                            <div 
                              key={srv}
                              onClick={() => {
                                const n = mechanicData.specialties.includes(srv) 
                                  ? mechanicData.specialties.filter(x => x !== srv) 
                                  : [...mechanicData.specialties, srv];
                                setMechanicData({...mechanicData, specialties: n});
                              }}
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${mechanicData.specialties.includes(srv) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{srv}</span>
                              {mechanicData.specialties.includes(srv) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Vehicle Expertise (Multiple Select)</label>
                        <div className="flex flex-col gap-2">
                          {['Bike', 'Car', 'Truck', 'Bus', 'Other'].map(type => (
                            <div 
                              key={type}
                              onClick={() => {
                                const n = mechanicData.vehicleExpertise.includes(type) 
                                  ? mechanicData.vehicleExpertise.filter(x => x !== type) 
                                  : [...mechanicData.vehicleExpertise, type];
                                setMechanicData({...mechanicData, vehicleExpertise: n});
                              }}
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${mechanicData.vehicleExpertise.includes(type) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{type}</span>
                              {mechanicData.vehicleExpertise.includes(type) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'rto' && (
                    <div className="space-y-4 px-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">RTO Office Details</label>
                        <input type="text" placeholder="RTO Office (e.g. MH-12 Pune)" value={rtoData.rtoOffice} onChange={(e) => setRtoData({...rtoData, rtoOffice: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">RTO Services Provided</label>
                        <div className="flex flex-col gap-2">
                          {rtoServices.map(srv => (
                            <div 
                              key={srv}
                              onClick={() => {
                                const n = rtoData.services.includes(srv) ? rtoData.services.filter(x => x !== srv) : [...rtoData.services, srv];
                                setRtoData({...rtoData, services: n});
                              }}
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${rtoData.services.includes(srv) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{srv}</span>
                              {rtoData.services.includes(srv) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'legal' && (
                    <div className="space-y-4 px-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Bar Registration Info</label>
                        <input type="text" placeholder="Bar Reg Number" value={legalData.barRegNumber} onChange={(e) => setLegalData({...legalData, barRegNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Office Name</label>
                        <input type="text" placeholder="Legal Office/Chamber Name" value={legalData.officeName} onChange={(e) => setLegalData({...legalData, officeName: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Practice Areas</label>
                        <div className="flex flex-col gap-2">
                          {legalPractices.map(srv => (
                            <div 
                              key={srv}
                              onClick={() => {
                                const n = legalData.practiceAreas.includes(srv) ? legalData.practiceAreas.filter(x => x !== srv) : [...legalData.practiceAreas, srv];
                                setLegalData({...legalData, practiceAreas: n});
                              }}
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${legalData.practiceAreas.includes(srv) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{srv}</span>
                              {legalData.practiceAreas.includes(srv) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Identity Proof (Optional)</label>
                    <input type="text" placeholder="Aadhaar Number" value={profData.aadhaarNumber} onChange={(e) => setProfData({...profData, aadhaarNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  </div>

                  {role === 'driver' && (
                    <div className="space-y-3 px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Vehicle Classes (Multiple Select)</label>
                      <div className="flex flex-col gap-2">
                        {['Bike', 'Car', 'Truck', 'Other'].map(c => (
                          <div 
                            key={c} 
                            onClick={() => {
                              const n = profData.vehicleClasses.includes(c) ? profData.vehicleClasses.filter(x => x !== c) : [...profData.vehicleClasses, c];
                              setProfData({...profData, vehicleClasses: n});
                            }} 
                            className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${profData.vehicleClasses.includes(c) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                          >
                            <span className="text-[12px] font-black uppercase">{c}</span>
                            {profData.vehicleClasses.includes(c) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="px-2">
                    <CustomDropdown 
                      label="Experience"
                      options={['0-1 Years', '1-3 Years', '3-5 Years', '5+ Years']}
                      value={role === 'mechanic' ? mechanicData.experienceRange : (role === 'rto' ? rtoData.experience : (role === 'legal' ? legalData.experience : profData.experience))}
                      placeholder="Select Experience"
                      icon={Clock}
                      onChange={(val) => {
                        if (role === 'mechanic') setMechanicData({...mechanicData, experienceRange: val});
                        else if (role === 'rto') setRtoData({...rtoData, experience: val});
                        else if (role === 'legal') setLegalData({...legalData, experience: val});
                        else setProfData({...profData, experience: val});
                      }}
                    />
                  </div>

                  <div className="space-y-3 px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Languages Known (Multiple Select)</label>
                    <div className="flex flex-col gap-2">
                      {['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(lang => (
                        <div 
                          key={lang}
                          onClick={() => {
                            const n = profData.languages.includes(lang) 
                              ? profData.languages.filter(x => x !== lang) 
                              : [...profData.languages, lang];
                            setProfData({...profData, languages: n});
                          }}
                          className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${profData.languages.includes(lang) ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                          <span className="text-[12px] font-black uppercase">{lang}</span>
                          {profData.languages.includes(lang) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleFinalSubmit} className="w-full bg-[#C44545] text-white h-20 rounded-[2.5rem] font-black uppercase mt-6 shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3">Finish Registration <Check size={20} strokeWidth={3} /></button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorRegister;
