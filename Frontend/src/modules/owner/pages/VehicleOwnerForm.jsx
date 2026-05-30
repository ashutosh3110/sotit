import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, Wrench, FileText, Truck, Briefcase, ArrowRight, CheckCircle2, Globe, MapPin, ChevronDown, Search, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { State } from "country-state-city";
import { indiaData } from '../../../utils/indiaData';

const VehicleOwnerForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- States ---
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [ownerSubRole, setOwnerSubRole] = useState("driver");

  // Shared conditional states
  const [language, setLanguage] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  // Driver-specific states
  const [vehicleType, setVehicleType] = useState("");
  const [jobType, setJobType] = useState("Permanent");

  // Mechanic-specific states
  const [mechanicType, setMechanicType] = useState("");

  // --- Constants for Dropdown ---
  const allStatesRaw = useMemo(() => State.getStatesOfCountry('IN'), []);
  const allStates = useMemo(() => Object.keys(indiaData).sort().map(name => ({
      name,
      isoCode: allStatesRaw.find(s => s.name === name)?.isoCode || name
  })), [allStatesRaw]);

  // Autofill name and mobile if query param is set and user is logged in
  useEffect(() => {
    const isAutofill = searchParams.get('autofill') === 'true';
    if (isAutofill) {
      try {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        if (userData && userData.profile) {
          setName(userData.profile.name || "");
          setMobile(userData.profile.mobile || "");
        }
      } catch (e) {
        console.error("Failed to parse user_data", e);
      }
    }
    const roleParam = searchParams.get('role');
    if (roleParam && ['driver', 'mechanic', 'towing', 'rto', 'legal'].includes(roleParam.toLowerCase())) {
      setOwnerSubRole(roleParam.toLowerCase());
    }
  }, [searchParams]);

  // Reset fields on role change
  const handleRoleChange = (roleId) => {
    setOwnerSubRole(roleId);
    setLanguage("");
    setState("");
    setDistrict("");
    setVehicleType("");
    setJobType("Permanent");
    setMechanicType("");
  };

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!ownerSubRole) return toast.error("Please select a service type first");
    if (!name || !mobile) return toast.error("Please fill Name and Mobile");
    if (mobile.length !== 10) return toast.error("Please enter a valid 10-digit mobile number");

    if (ownerSubRole === 'driver') {
      if (!vehicleType) return toast.error("Please select Vehicle Type");
      if (!language) return toast.error("Please select Language");
      if (!state) return toast.error("Please select State");
      if (!district) return toast.error("Please select City/District");
      if (!jobType) return toast.error("Please select Driver Type");
    }

    if (ownerSubRole === 'mechanic') {
      if (!mechanicType) return toast.error("Please select Mechanic Type");
      if (!language) return toast.error("Please select Language");
      if (!state) return toast.error("Please select State");
      if (!district) return toast.error("Please select City/District");
    }

    if (ownerSubRole === 'towing' || ownerSubRole === 'rto' || ownerSubRole === 'legal') {
      if (!language) return toast.error("Please select Language");
      if (!state) return toast.error("Please select State");
      if (!district) return toast.error("Please select City/District");
    }

    const userData = JSON.parse(localStorage.getItem('user_data'));
    const token = userData?.profile?.token;
    if (!token) {
      toast.error("Please login to submit requirement");
      navigate('/auth?tab=user');
      return;
    }

    setIsLoading(true);
    const tid = toast.loading("Submitting requirement...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: ownerSubRole,
          details: {
            name,
            mobile,
            ...(ownerSubRole === 'driver' && {
              vehicleType,
              language,
              state,
              district,
              jobType
            }),
            ...(ownerSubRole === 'mechanic' && {
              mechanicType,
              language,
              state,
              district
            }),
            ...((ownerSubRole === 'towing' || ownerSubRole === 'rto' || ownerSubRole === 'legal') && {
              language,
              state,
              district
            })
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");

      toast.success("Submitted successfully!", { id: tid });
      setIsSubmittedSuccessfully(true);
    } catch (error) {
      toast.error(error.message || "Submission failed", { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmittedSuccessfully) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6">
          <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-xl border border-emerald-100">
            <CheckCircle2 size={48} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Your request is submitted successfully</h2>
            <p className="text-sm font-bold text-slate-500 max-w-sm leading-relaxed">
              Aapki requirement successfully register ho gayi hai. Hamare expert jald hi aapse connect karenge.
            </p>
          </div>
          <button 
            onClick={() => navigate('/user/find')} 
            className="w-full py-4 bg-[#C44545] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      <header className="px-6 py-6 border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-black/5">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">Requirement</span>
            <span className="text-[12px] font-black tracking-tight text-slate-900 uppercase">Vehicle Owner Form</span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 pb-12 overflow-y-auto hide-scrollbar max-w-xl mx-auto w-full">
        <div className="space-y-6 pt-6">
          <div className="px-2">
            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-none">Vehicle Owner.</h2>
            <p className="text-sm font-bold text-neutral-500">Apni zaroorat select karein aur submit karein.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Sub-role chip selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Mujhe Chahiye (Service Select Karein)</label>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 text-neutral-500">
                {[
                  { id: 'driver', label: 'Driver', icon: Navigation },
                  { id: 'mechanic', label: 'Mechanic', icon: Wrench },
                  { id: 'towing', label: 'Towing', icon: Truck },
                  { id: 'rto', label: 'RTO Agent', icon: FileText },
                  { id: 'legal', label: 'Legal Advisor', icon: Briefcase },
                ].map((sr) => (
                  <button
                    key={sr.id}
                    type="button"
                    onClick={() => handleRoleChange(sr.id)}
                    className={`flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${
                      ownerSubRole === sr.id
                        ? 'border-[#C44545] bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20'
                        : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <sr.icon size={20} />
                    <span>{sr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              {/* Field 1: Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-[#C44545]"
              />

              {/* Field 2: Mobile Number */}
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                required
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-[#C44545]"
              />

              {/* Driver Specific Fields */}
              {ownerSubRole === 'driver' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 overflow-visible"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Vehicle Type</label>
                    <select 
                      value={vehicleType}
                      required
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-850 focus:border-[#C44545] focus:outline-none transition-all"
                    >
                      <option value="">Select Vehicle Type</option>
                      {['2 Wheeler', '4 Wheeler', 'Truck'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Language</label>
                    <select 
                      value={language}
                      required
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-850 focus:border-[#C44545] focus:outline-none transition-all"
                    >
                      <option value="">Select Language</option>
                      {['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <CustomDropdown 
                      label="State"
                      options={allStates}
                      value={state}
                      placeholder="Select State"
                      icon={Globe}
                      onChange={(s) => {
                        setState(s.name);
                        setDistrict("");
                      }}
                    />

                    <CustomDropdown 
                      label="City / District"
                      options={state ? indiaData[state] || [] : []}
                      value={district}
                      placeholder="Select City/District"
                      icon={MapPin}
                      disabled={!state}
                      onChange={(c) => {
                        setDistrict(c);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Driver Type</label>
                    <div className="flex gap-3">
                      {['Permanent', 'Temporary'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setJobType(type)}
                          className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[11px] transition-all ${jobType === type ? 'border-[#C44545] bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mechanic Specific Fields */}
              {ownerSubRole === 'mechanic' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 overflow-visible"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Mechanic Type</label>
                    <select 
                      value={mechanicType}
                      required
                      onChange={(e) => setMechanicType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-850 focus:border-[#C44545] focus:outline-none transition-all"
                    >
                      <option value="">Select Mechanic Type</option>
                      {['General Service', 'Engine Repair', 'Brake Service', 'Electrical Work', 'AC Service', 'Suspension & Steering', 'Oil & Filter Change', 'Clutch & Gearbox', 'Battery & Charging'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Language</label>
                    <select 
                      value={language}
                      required
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-850 focus:border-[#C44545] focus:outline-none transition-all"
                    >
                      <option value="">Select Language</option>
                      {['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <CustomDropdown 
                      label="State"
                      options={allStates}
                      value={state}
                      placeholder="Select State"
                      icon={Globe}
                      onChange={(s) => {
                        setState(s.name);
                        setDistrict("");
                      }}
                    />

                    <CustomDropdown 
                      label="City / District"
                      options={state ? indiaData[state] || [] : []}
                      value={district}
                      placeholder="Select City/District"
                      icon={MapPin}
                      disabled={!state}
                      onChange={(c) => {
                        setDistrict(c);
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Towing, RTO Agent, & Legal Advisor Specific Fields */}
              {(ownerSubRole === 'towing' || ownerSubRole === 'rto' || ownerSubRole === 'legal') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 overflow-visible"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Language</label>
                    <select 
                      value={language}
                      required
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-850 focus:border-[#C44545] focus:outline-none transition-all"
                    >
                      <option value="">Select Language</option>
                      {['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <CustomDropdown 
                      label="State"
                      options={allStates}
                      value={state}
                      placeholder="Select State"
                      icon={Globe}
                      onChange={(s) => {
                        setState(s.name);
                        setDistrict("");
                      }}
                    />

                    <CustomDropdown 
                      label="City / District"
                      options={state ? indiaData[state] || [] : []}
                      value={district}
                      placeholder="Select City/District"
                      icon={MapPin}
                      disabled={!state}
                      onChange={(c) => {
                        setDistrict(c);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-6 disabled:opacity-60 active:scale-95 transition-all"
            >
              Submit Requirement <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleOwnerForm;
