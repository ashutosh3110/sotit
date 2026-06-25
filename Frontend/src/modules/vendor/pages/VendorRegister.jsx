import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, Wrench, Shield, Briefcase, FileText, Truck, Phone, ArrowRight, Car, Camera, MapPin, CheckCircle2, ShieldCheck, CreditCard, Landmark, Info, Map, Clock, Zap, Hammer, Wind, Battery, Settings, Disc, Droplets, Building2, Scale, GraduationCap, Video, Users, ChevronDown, Search, Globe, Check, Square, CheckSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useMemo, useEffect } from "react";
import { initVendorState } from "../utils/vendorStore";
import toast from "react-hot-toast";
import { State } from "country-state-city";
import { indiaData } from '../../../utils/indiaData';
import ISO6391 from 'iso-639-1';

const VendorRegister = ({ isEmbedded = false, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('driver');
  const [step, setStep] = useState(0);
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

  // --- Constants ---
  const allStatesRaw = useMemo(() => State.getStatesOfCountry('IN'), []);
  const allStates = useMemo(() => Object.keys(indiaData).sort().map(name => ({
      name,
      isoCode: allStatesRaw.find(s => s.name === name)?.isoCode || name
  })), [allStatesRaw]);
  const [configLanguages, setConfigLanguages] = useState([]);
  const [customFieldsList, setCustomFieldsList] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/public`);
        const data = await res.json();
        if (data.success) {
          setConfigLanguages(data.languages || []);
          setCustomFieldsList(data.fields || []);
        }
      } catch (err) {
        console.error("Error fetching registration config:", err);
      }
    };
    fetchConfig();
  }, []);

  const indianLanguages = useMemo(() => {
    return ['hi', 'en', 'bn', 'mr', 'te', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ks', 'sd', 'ne', 'sa']
      .map(code => ISO6391.getName(code))
      .sort();
  }, []);

  const displayLanguages = useMemo(() => {
    if (configLanguages && configLanguages.length > 0) {
      return configLanguages.map(l => l.name).sort();
    }
    return indianLanguages;
  }, [configLanguages, indianLanguages]);

  const activeCustomFields = useMemo(() => {
    return customFieldsList.filter(f => f.role === 'all' || f.role === role);
  }, [customFieldsList, role]);
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
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", state: "", isoCode: "", pincode: "" });
  const [houseNo, setHouseNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [liveLocation, setLiveLocation] = useState(null);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customVehicleClass, setCustomVehicleClass] = useState("");
  const [showMechanicServices, setShowMechanicServices] = useState(false);
  const [customMechanicService, setCustomMechanicService] = useState("");
  const [showMechanicExpertise, setShowMechanicExpertise] = useState(false);
  const [customMechanicExpertise, setCustomMechanicExpertise] = useState("");
  const [remark, setRemark] = useState("");
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [driverStatus, setDriverStatus] = useState("free");

  useEffect(() => {
    const fullStreetAddress = [houseNo, streetName, landmark]
      .map(val => val ? val.trim() : "")
      .filter(Boolean)
      .join(", ");
    setAddress(prev => ({ ...prev, street: fullStreetAddress }));
  }, [houseNo, streetName, landmark]);

  const [profData, setProfData] = useState({
    dlNumber: "", dlExpiry: "", dlFile: null, vehicleClasses: [], experience: "1-3 Years", bgCheck: false, availability: "Permanent", languages: ["Hindi"],
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

  const formatDLNumber = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    let state = clean.slice(0, 2).replace(/[^A-Z]/g, "");
    let rto = clean.slice(2, 4).replace(/[^0-9]/g, "");
    let year = clean.slice(4, 8).replace(/[^0-9]/g, "");
    let num = clean.slice(8, 15).replace(/[^0-9]/g, "");
    
    let result = "";
    if (state) result += state;
    if (clean.length > 2) {
      if (rto) result += "-" + rto;
      if (clean.length > 4) {
        if (year) result += "-" + year;
        if (clean.length > 8) {
          if (num) result += "-" + num;
        }
      }
    }
    return result;
  };

  const formatAadhaarNumber = (value) => {
    const clean = value.replace(/[^0-9]/g, "");
    let result = "";
    if (clean.length > 0) {
      result += clean.slice(0, 4);
      if (clean.length > 4) {
        result += " " + clean.slice(4, 8);
        if (clean.length > 8) {
          result += " " + clean.slice(8, 12);
        }
      }
    }
    return result;
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
                    <span className={`text-lg font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
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
                                        className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold flex items-center justify-between transition-colors ${isSelected ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}
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
            body: JSON.stringify({ mobile, type: 'register' })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setIsOtpSent(true);
        toast.success(data.message, { id: tid });
    } catch (error) {
        toast.error(error.message || "Failed to send OTP", { id: tid });
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) return toast.error("Enter 4-digit OTP");
    const tid = toast.loading("Verifying OTP...");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/verify-register-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, otp: enteredOtp })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setIsOtpVerified(true);
        toast.success("OTP Verified Successfully!", { id: tid });
    } catch (error) {
        toast.error(error.message || "OTP verification failed", { id: tid });
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
                
                const hNo = data.address?.house_number || data.address?.building || "";
                const roadStr = data.address?.road || data.address?.suburb || fetchedAddress;
                const landmarkStr = data.address?.neighbourhood || "";

                setHouseNo(hNo);
                setStreetName(roadStr);
                setLandmark(landmarkStr);

                setAddress(prev => ({
                    ...prev,
                    street: [hNo, roadStr, landmarkStr].filter(Boolean).join(", "),
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

  const handleSelectRole = (roleId) => {
    setName("");
    setMobile("");
    setEmail("");
    setProfileImg(null);
    setProfileFile(null);
    setPassword("");
    setOtp(["", "", "", ""]);
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setAddress({ street: "", city: "", state: "", isoCode: "", pincode: "" });
    setHouseNo("");
    setStreetName("");
    setLandmark("");
    setLiveLocation(null);
    setCustomLanguage("");
    setCustomVehicleClass("");
    setRemark("");
    setDriverStatus("free");

    setShowLanguageList(false);
    setProfData({
      dlNumber: "", dlExpiry: "", dlFile: null, vehicleClasses: [], experience: "1-3 Years", bgCheck: false, availability: "Permanent", languages: ["Hindi"],
      serviceStates: [], 
      aadhaarNumber: ""
    });
    setMechanicData({
      specialties: [], serviceType: "Both", garageName: "", garageAddress: "", garageLocation: null,
      vehicleExpertise: [], experienceRange: "1-3 Years", workingHours: "9 AM - 7 PM", emergencySupport: false, serviceRadius: "10 KM"
    });
    setRtoData({
      rtoOffice: "", services: [], experience: "1-3 Years", officeAddress: "", officeCity: "", officeLocation: null
    });
    setLegalData({
      barRegNumber: "", practiceAreas: [], experience: "1-3 Years", officeName: "", visitingAddress: "", city: "", gpsLocation: null, consultationType: "Both"
    });
    setBankData({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "" });
    setKycFiles({ 
      aadhaar: null, pan: null, selfie: null, policeVerification: null, dlFile: null, 
      garagePhoto: null, shopLicense: null, barCertificate: null, advocateId: null,
      regCertificate: null, officeProof: null
    });

    setRole(roleId);
    setStep(1);
  };

  const handleNextStep = () => {
    if (!name.trim()) {
        return toast.error("Please enter your Full Name");
    }
    if (!mobile || mobile.length !== 10) {
        return toast.error("Please enter a valid 10-digit Mobile Number");
    }
    if (!isOtpVerified) {
        return toast.error("Please verify your mobile number OTP first");
    }
    if (!password) {
        return toast.error("Please set a secure password");
    }
    if (password.length < 6) {
        return toast.error("Password must be at least 6 characters long");
    }
    if (!houseNo.trim()) {
        return toast.error("Please enter House / Flat No.");
    }
    if (!streetName.trim()) {
        return toast.error("Please enter Street Address / Locality");
    }
    if (!address.state) {
        return toast.error("Please select State");
    }
    if (!address.city) {
        return toast.error("Please select City / District");
    }
    if (!address.pincode || address.pincode.length !== 6) {
        return toast.error("Please enter a valid 6-digit Pincode");
    }
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    // 1. Language validation
    if (!profData.languages || profData.languages.length === 0) {
        return toast.error("Please select at least one language");
    }

    // 2. Role-specific validation
    if (role === 'driver') {
        if (!profData.dlNumber) {
            return toast.error("Please enter your Driving License Number");
        }
        const cleanDL = profData.dlNumber.replace(/[^A-Za-z0-9]/g, "");
        if (cleanDL.length !== 15) {
            return toast.error("Driving License number must be exactly 15 characters (e.g. MH-12-2015-0001234)");
        }
        if (!profData.dlExpiry) {
            return toast.error("Please select DL Expiry Date");
        }
        if (!profData.availability) {
            return toast.error("Please select Service Type (Permanent / Temporary)");
        }
        if (!profData.vehicleClasses || profData.vehicleClasses.length === 0) {
            return toast.error("Please select at least one Vehicle Class");
        }
    }

    if (role === 'towing') {
        if (!profData.vehicleClasses || profData.vehicleClasses.length === 0) {
            return toast.error("Please select at least one Vehicle Class");
        }
    }

    if (role === 'mechanic') {
        if (!mechanicData.specialties || mechanicData.specialties.length === 0) {
            return toast.error("Please select at least one Service Offered / Specialty");
        }
        if (!mechanicData.vehicleExpertise || mechanicData.vehicleExpertise.length === 0) {
            return toast.error("Please select at least one Vehicle Expertise");
        }
    }

    if (role === 'rto') {
        if (!rtoData.rtoOffice || !rtoData.rtoOffice.trim()) {
            return toast.error("Please enter RTO Office Details");
        }
        if (!rtoData.services || rtoData.services.length === 0) {
            return toast.error("Please select at least one RTO Service Provided");
        }
    }

    if (role === 'legal') {
        if (!legalData.barRegNumber || !legalData.barRegNumber.trim()) {
            return toast.error("Please enter Bar Registration Number");
        }
        if (!legalData.officeName || !legalData.officeName.trim()) {
            return toast.error("Please enter Legal Office/Chamber Name");
        }
        if (!legalData.practiceAreas || legalData.practiceAreas.length === 0) {
            return toast.error("Please select at least one Practice Area");
        }
    }

    // 3. Custom Fields validation
    for (const field of activeCustomFields) {
        if (field.required) {
            const val = customFieldValues[field.name];
            if (val === undefined || val === null || val === '' || val === false) {
                return toast.error(`Please fill the required field: ${field.label}`);
            }
        }
    }

    // 4. Optional Aadhaar validation
    if (profData.aadhaarNumber) {
        const cleanAadhaar = profData.aadhaarNumber.replace(/[^0-9]/g, "");
        if (cleanAadhaar.length !== 12) {
            return toast.error("Aadhaar Number must be exactly 12 digits (e.g. 1234 5678 9012)");
        }
    }

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
        const enteredOtp = otp.join("");
        formData.append('otp', enteredOtp);
        formData.append('remark', remark);
        if (role === 'driver') {
            formData.append('isOnline', driverStatus === 'free');
        }
        formData.append('address', JSON.stringify(address));
        formData.append('liveLocation', JSON.stringify(liveLocation));
        formData.append('profData', JSON.stringify(profData));
        formData.append('mechanicData', JSON.stringify(mechanicData));
        formData.append('rtoData', JSON.stringify(rtoData));
        formData.append('legalData', JSON.stringify(legalData));
        formData.append('bankData', JSON.stringify(bankData));
        formData.append('customFields', JSON.stringify(customFieldValues));

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
        
        // Auto-login the vendor
        try {
            const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/vendors/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, password: password || mobile })
            });
            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                initVendorState({ ...loginData.vendor, token: loginData.token });
                navigate('/vendor');
            } else {
                navigate('/auth?tab=vendor');
            }
        } catch (err) {
            console.error("Auto login failed:", err);
            navigate('/auth?tab=vendor');
        }
    } catch (error) {
        toast.error(error.message || "Registration failed", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let totalSteps = 2;
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

  const isStep1Invalid = !name.trim() || mobile.length !== 10 || !isOtpVerified || !password || password.length < 6 || !streetName.trim() || !address.state || !address.city || !address.pincode;

  const isCustomFieldsValid = () => {
    return activeCustomFields.every(field => {
      if (!field.required) return true;
      const val = customFieldValues[field.name];
      return val !== undefined && val !== null && val !== '' && val !== false;
    });
  };

  const isStep2Invalid = 
    (!profData.languages || profData.languages.length === 0) ||
    (role === 'driver' && ((profData.dlNumber ? profData.dlNumber.replace(/[^A-Za-z0-9]/g, "").length : 0) !== 15 || !profData.dlExpiry || !profData.availability || !profData.vehicleClasses || profData.vehicleClasses.length === 0)) ||
    (role === 'towing' && (!profData.vehicleClasses || profData.vehicleClasses.length === 0)) ||
    (role === 'mechanic' && (!mechanicData.specialties || mechanicData.specialties.length === 0 || !mechanicData.vehicleExpertise || mechanicData.vehicleExpertise.length === 0)) ||
    (role === 'rto' && (!rtoData.rtoOffice.trim() || !rtoData.services || rtoData.services.length === 0)) ||
    (role === 'legal' && (!legalData.barRegNumber.trim() || !legalData.officeName.trim() || !legalData.practiceAreas || legalData.practiceAreas.length === 0)) ||
    !isCustomFieldsValid();

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
                    { id: 'owner', label: 'Vehicle Owner', icon: Car, desc: 'Car, Truck, Bus, Tempo owner' },
                  ].map((r) => (
                    <div 
                      key={r.id} 
                      onClick={() => {
                        if (r.id === 'owner') {
                          navigate('/vehicle-owner');
                        } else {
                          handleSelectRole(r.id);
                        }
                      }} 
                      className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 ${role === r.id ? 'border-[#C44545] bg-[#C44545] text-white' : 'border-neutral-200 bg-white'}`}
                    >
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

            {step === 1 && role !== 'owner' && (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative h-28 w-28 bg-rose-50 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {profileImg ? <img src={profileImg} className="h-full w-full object-cover" /> : <Camera className="text-[#C44545]/30" size={32} />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files[0]; if(file) { setProfileFile(file); setProfileImg(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">Upload Photo (Optional)</span>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" />
                  <input 
                    type="tel" 
                    placeholder="Mobile" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)} 
                    disabled={isOtpVerified} 
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold disabled:opacity-60 disabled:cursor-not-allowed" 
                  />
                  {!isOtpSent && !isOtpVerified && (
                    <button 
                      type="button" 
                      onClick={handleSendOTP} 
                      disabled={mobile.length !== 10}
                      className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Verify Mobile
                    </button>
                  )}
                  {isOtpSent && (
                    <div className="space-y-4">
                      <div className="flex gap-3 justify-center py-2">
                        {otp.map((d, i) => (
                          <input 
                            key={i} 
                            type="tel" 
                            maxLength={1} 
                            value={d} 
                            disabled={isOtpVerified}
                            onChange={(e) => {
                              const n = [...otp]; n[i] = e.target.value; setOtp(n);
                              if(e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                            }} 
                            className="w-12 h-14 bg-rose-50 border-2 border-[#C44545]/10 rounded-xl text-center text-xl font-black text-[#C44545] disabled:opacity-60" 
                          />
                        ))}
                      </div>
                      {!isOtpVerified && (
                        <button 
                          type="button" 
                          onClick={handleVerifyOTP} 
                          disabled={otp.join("").length !== 4}
                          className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Verify OTP
                        </button>
                      )}
                    </div>
                  )}
                  {isOtpVerified && (
                    <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-600 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" /> Mobile Number Verified
                      </span>
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

                  <div className="pt-6 space-y-4 border-t border-slate-100">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">Location Details</span>
                        <span className="text-sm font-black text-slate-800">Your Address</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => fetchLiveLocation('personal')}
                        className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-[#C44545] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 active:scale-95 transition-all shadow-sm"
                      >
                        <Navigation size={12} className="fill-[#C44545] text-white" /> Detect Location
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="House / Flat No, Building Name" 
                        value={houseNo} 
                        onChange={(e) => setHouseNo(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" 
                      />

                      <input 
                        type="text" 
                        placeholder="Street Address, Locality, Area" 
                        value={streetName} 
                        onChange={(e) => setStreetName(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" 
                      />

                      <input 
                        type="text" 
                        placeholder="Landmark (Optional)" 
                        value={landmark} 
                        onChange={(e) => setLandmark(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" 
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
                                  <div 
                                      key={state.isoCode}
                                      onClick={() => toggleStateSelection(state)}
                                      className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-600 hover:bg-slate-50'}`}
                                  >
                                      <span className="text-lg font-black uppercase">{state.name}</span>
                                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                  </div>
                              );
                          })}
                      </div>
                  </div>

                  {profData.serviceStates.length > 0 && (
                      <div className="space-y-4 mt-6">
                          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Select Districts for Chosen States</label>
                          <div className="space-y-4">
                              {profData.serviceStates.map(selectedState => {
                                  return (
                                      <div key={selectedState.isoCode} className="p-5 border border-slate-200 rounded-[2rem] bg-white shadow-sm">
                                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                                              <span className="text-lg font-black uppercase text-slate-900">{selectedState.name} Districts</span>
                                              <span className="text-[10px] font-black text-[#C44545] bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">{selectedState.districts.length} Selected</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                                              {(indiaData[selectedState.name] || []).map(district => { 
                                                  const isDistSelected = selectedState.districts.includes(district);
                                                  return (
                                                      <div 
                                                          key={district}
                                                          onClick={() => toggleDistrictSelection(selectedState.isoCode, district)}
                                                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isDistSelected ? 'border-[#C44545]/30 bg-rose-50/20 text-[#C44545]' : 'border-slate-100 text-slate-500 bg-slate-50/50'}`}
                                                      >
                                                          <span className="text-base font-bold truncate pr-1">{district}</span>
                                                          {isDistSelected ? <CheckCircle2 size={16} className="fill-[#C44545] text-white flex-shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200 flex-shrink-0" />}
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}
                </div>

                <button 
                  onClick={handleNextStep} 
                  disabled={isLoading}
                  className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
                >
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            )}



            {/* Step 2: Professional Details */}
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
                        <input 
                          type="text" 
                          placeholder="DL Number (e.g. MH-12-2015-0001234)" 
                          maxLength={18}
                          value={profData.dlNumber} 
                          onChange={(e) => setProfData({...profData, dlNumber: formatDLNumber(e.target.value)})} 
                          className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold uppercase" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Driving Licence Expiry Date</label>
                        <input type="date" value={profData.dlExpiry} onChange={(e) => setProfData({...profData, dlExpiry: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-400" />
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Service Type</label>
                        <div className="flex gap-3">
                          {['Permanent', 'Temporary'].map(type => (
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
                      <div className="px-2">
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                                Services Offered
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                                Multiple Select
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowMechanicServices(!showMechanicServices)}
                              className="text-xs font-black uppercase tracking-widest text-[#C44545] hover:bg-rose-100/50 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/70 transition-all active:scale-95 shadow-sm shadow-[#C44545]/5"
                            >
                              {showMechanicServices ? "Hide List" : "Select"}
                            </button>
                          </div>

                          {showMechanicServices && (
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all">
                              {mechanicServices.map(srv => {
                                const isSelected = mechanicData.specialties.includes(srv);
                                return (
                                  <div 
                                    key={srv}
                                    onClick={() => {
                                      const n = isSelected 
                                        ? mechanicData.specialties.filter(x => x !== srv) 
                                        : [...mechanicData.specialties, srv];
                                      setMechanicData({...mechanicData, specialties: n});
                                    }}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                  >
                                    <span className="text-[12px] font-black uppercase">{srv}</span>
                                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                  </div>
                                );
                              })}

                              {/* Render custom added specialties */}
                              {mechanicData.specialties.filter(s => !mechanicServices.includes(s)).map(srv => (
                                <div 
                                  key={srv}
                                  onClick={() => {
                                    const n = mechanicData.specialties.filter(x => x !== srv);
                                    setMechanicData({...mechanicData, specialties: n});
                                  }}
                                  className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                                >
                                  <span className="text-[12px] font-black uppercase">{srv}</span>
                                  <CheckSquare size={20} />
                                </div>
                              ))}

                              {/* Input box to add custom mechanic service */}
                              <input 
                                type="text" 
                                placeholder="Add Custom Service (e.g. Dent Painting)" 
                                value={customMechanicService} 
                                onChange={(e) => setCustomMechanicService(e.target.value)} 
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none mt-2"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (customMechanicService.trim()) {
                                    const srv = customMechanicService.trim();
                                    if (!mechanicData.specialties.includes(srv)) {
                                      setMechanicData({
                                        ...mechanicData,
                                        specialties: [...mechanicData.specialties, srv]
                                      });
                                    }
                                    setCustomMechanicService("");
                                  }
                                }}
                                className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm"
                              >
                                Add Service
                              </button>
                            </div>
                          )}

                          {!showMechanicServices && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {mechanicData.specialties && mechanicData.specialties.length > 0 ? (
                                mechanicData.specialties.map(srv => (
                                  <span key={srv} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                    {srv}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 font-bold text-xs">No services selected</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-2">
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                                Vehicle Expertise
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                                Multiple Select
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowMechanicExpertise(!showMechanicExpertise)}
                              className="text-xs font-black uppercase tracking-widest text-[#C44545] hover:bg-rose-100/50 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/70 transition-all active:scale-95 shadow-sm shadow-[#C44545]/5"
                            >
                              {showMechanicExpertise ? "Hide List" : "Select"}
                            </button>
                          </div>

                          {showMechanicExpertise && (
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all">
                              {['Bike', 'Car', 'Truck', 'Bus'].map(type => {
                                const isSelected = mechanicData.vehicleExpertise.includes(type);
                                return (
                                  <div 
                                    key={type}
                                    onClick={() => {
                                      const n = isSelected 
                                        ? mechanicData.vehicleExpertise.filter(x => x !== type) 
                                        : [...mechanicData.vehicleExpertise, type];
                                      setMechanicData({...mechanicData, vehicleExpertise: n});
                                    }}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                  >
                                    <span className="text-[12px] font-black uppercase">{type}</span>
                                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                  </div>
                                );
                              })}

                              {/* Render custom added expertise */}
                              {mechanicData.vehicleExpertise.filter(v => !['Bike', 'Car', 'Truck', 'Bus'].includes(v)).map(type => (
                                <div 
                                  key={type}
                                  onClick={() => {
                                    const n = mechanicData.vehicleExpertise.filter(x => x !== type);
                                    setMechanicData({...mechanicData, vehicleExpertise: n});
                                  }}
                                  className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                                >
                                  <span className="text-[12px] font-black uppercase">{type}</span>
                                  <CheckSquare size={20} />
                                </div>
                              ))}

                              {/* Input box to add custom expertise */}
                              <input 
                                type="text" 
                                placeholder="Add Custom Vehicle (e.g. Tractor, Crane)" 
                                value={customMechanicExpertise} 
                                onChange={(e) => setCustomMechanicExpertise(e.target.value)} 
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none mt-2"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (customMechanicExpertise.trim()) {
                                    const type = customMechanicExpertise.trim();
                                    if (!mechanicData.vehicleExpertise.includes(type)) {
                                      setMechanicData({
                                        ...mechanicData,
                                        vehicleExpertise: [...mechanicData.vehicleExpertise, type]
                                      });
                                    }
                                    setCustomMechanicExpertise("");
                                  }
                                }}
                                className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm"
                              >
                                Add Vehicle Type
                              </button>
                            </div>
                          )}

                          {!showMechanicExpertise && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {mechanicData.vehicleExpertise && mechanicData.vehicleExpertise.length > 0 ? (
                                mechanicData.vehicleExpertise.map(type => (
                                  <span key={type} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                    {type}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 font-bold text-xs">No vehicles selected</span>
                              )}
                            </div>
                          )}
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

                  {/* Custom Fields defined by Admin */}
                  {activeCustomFields.map((field) => {
                    if (field.type === 'checkbox') {
                      return (
                        <div className="px-2 flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm" key={field._id}>
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </span>
                            {field.placeholder && <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{field.placeholder}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomFieldValues({...customFieldValues, [field.name]: !customFieldValues[field.name]})}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${customFieldValues[field.name] ? 'bg-[#C44545]' : 'bg-slate-300'}`}
                          >
                            <div className={`h-4.5 w-4.5 bg-white rounded-full absolute top-[3px] transition-all duration-300 ${customFieldValues[field.name] ? 'left-[26px]' : 'left-[3px]'}`} />
                          </button>
                        </div>
                      );
                    }
                    if (field.type === 'select') {
                      return (
                        <div className="px-2" key={field._id}>
                          <CustomDropdown 
                            label={field.label + (field.required ? " *" : "")}
                            options={field.options || []}
                            value={customFieldValues[field.name] || ''}
                            placeholder={field.placeholder || `Select ${field.label}`}
                            onChange={(val) => setCustomFieldValues({...customFieldValues, [field.name]: val})}
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="px-2 space-y-1" key={field._id}>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input 
                          type={field.type === 'number' ? 'number' : 'text'} 
                          placeholder={field.placeholder || `Enter ${field.label}...`}
                          value={customFieldValues[field.name] || ''}
                          onChange={(e) => setCustomFieldValues({...customFieldValues, [field.name]: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold"
                        />
                      </div>
                    );
                  })}

                  <div className="px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Identity Proof (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Aadhaar Number (e.g. 1234 5678 9012)" 
                      maxLength={14}
                      value={profData.aadhaarNumber} 
                      onChange={(e) => setProfData({...profData, aadhaarNumber: formatAadhaarNumber(e.target.value)})} 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold" 
                    />
                  </div>

                  {role === 'towing' && (
                    <div className="space-y-3 px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Vehicle Classes (Multiple Select)</label>
                      <div className="flex flex-col gap-2">
                        {['Bike', 'Car', 'Truck'].map(c => {
                          const isSelected = profData.vehicleClasses.includes(c);
                          return (
                            <div 
                              key={c} 
                              onClick={() => {
                                const n = isSelected ? profData.vehicleClasses.filter(x => x !== c) : [...profData.vehicleClasses, c];
                                setProfData({...profData, vehicleClasses: n});
                              }} 
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{c}</span>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          );
                        })}

                        {/* Render custom added vehicle classes */}
                        {profData.vehicleClasses.filter(c => !['Bike', 'Car', 'Truck'].includes(c)).map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              const n = profData.vehicleClasses.filter(x => x !== c);
                              setProfData({...profData, vehicleClasses: n});
                            }}
                            className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                          >
                            <span className="text-[12px] font-black uppercase">{c}</span>
                            <CheckSquare size={20} />
                          </div>
                        ))}
                      </div>

                      {/* Input box to add custom vehicle class */}
                      <input 
                        type="text" 
                        placeholder="Add Custom Vehicle (e.g. Auto, Crane)" 
                        value={customVehicleClass} 
                        onChange={(e) => setCustomVehicleClass(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (customVehicleClass.trim()) {
                            const cVal = customVehicleClass.trim();
                            if (!profData.vehicleClasses.includes(cVal)) {
                              setProfData({
                                ...profData,
                                vehicleClasses: [...profData.vehicleClasses, cVal]
                              });
                            }
                            setCustomVehicleClass("");
                          }
                        }}
                        className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm"
                      >
                        Add Vehicle Class
                      </button>
                    </div>
                  )}

                  {role === 'driver' && (
                    <div className="space-y-3 px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Vehicle Classes (Multiple Select)</label>
                      <div className="flex flex-col gap-2">
                        {['Bike', 'Car', 'Truck'].map(c => {
                          const isSelected = profData.vehicleClasses.includes(c);
                          return (
                            <div 
                              key={c} 
                              onClick={() => {
                                const n = isSelected ? profData.vehicleClasses.filter(x => x !== c) : [...profData.vehicleClasses, c];
                                setProfData({...profData, vehicleClasses: n});
                              }} 
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{c}</span>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          );
                        })}

                        {/* Render custom added vehicle classes */}
                        {profData.vehicleClasses.filter(c => !['Bike', 'Car', 'Truck'].includes(c)).map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              const n = profData.vehicleClasses.filter(x => x !== c);
                              setProfData({...profData, vehicleClasses: n});
                            }}
                            className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                          >
                            <span className="text-[12px] font-black uppercase">{c}</span>
                            <CheckSquare size={20} />
                          </div>
                        ))}
                      </div>

                      {/* Input box to add custom vehicle class */}
                      <input 
                        type="text" 
                        placeholder="Add Custom Vehicle (e.g. Auto, Crane)" 
                        value={customVehicleClass} 
                        onChange={(e) => setCustomVehicleClass(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (customVehicleClass.trim()) {
                            const cVal = customVehicleClass.trim();
                            if (!profData.vehicleClasses.includes(cVal)) {
                              setProfData({
                                ...profData,
                                vehicleClasses: [...profData.vehicleClasses, cVal]
                              });
                            }
                            setCustomVehicleClass("");
                          }
                        }}
                        className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm"
                      >
                        Add Vehicle Class
                      </button>
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

                  <div className="px-2 mt-8">
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                            Languages Known
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            Multiple Select
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLanguageList(!showLanguageList)}
                          className="text-xs font-black uppercase tracking-widest text-[#C44545] hover:bg-rose-100/50 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/70 transition-all active:scale-95 shadow-sm shadow-[#C44545]/5"
                        >
                          {showLanguageList ? "Hide List" : "Select"}
                        </button>
                      </div>

                      {showLanguageList && (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all">
                          {displayLanguages.map(lang => {
                            const isSelected = profData.languages.includes(lang);
                            return (
                              <div 
                                key={lang}
                                onClick={() => {
                                  const n = isSelected 
                                    ? profData.languages.filter(x => x !== lang) 
                                    : [...profData.languages, lang];
                                  setProfData({...profData, languages: n});
                                }}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                              >
                                <span className="text-[12px] font-black uppercase">{lang}</span>
                                {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                              </div>
                            );
                          })}
                          
                          {/* Render custom added languages */}
                          {profData.languages.filter(l => !displayLanguages.includes(l)).map(lang => (
                            <div 
                              key={lang}
                              onClick={() => {
                                const n = profData.languages.filter(x => x !== lang);
                                setProfData({...profData, languages: n});
                              }}
                              className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                            >
                              <span className="text-[12px] font-black uppercase">{lang}</span>
                              <CheckSquare size={20} />
                            </div>
                          ))}

                          {/* Input box to add custom language */}
                          <input 
                            type="text" 
                            placeholder="Add Custom Language (e.g. French)" 
                            value={customLanguage} 
                            onChange={(e) => setCustomLanguage(e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none mt-2"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (customLanguage.trim()) {
                                const lang = customLanguage.trim();
                                if (!profData.languages.includes(lang)) {
                                  setProfData({
                                    ...profData,
                                    languages: [...profData.languages, lang]
                                  });
                                }
                                  setCustomLanguage("");
                                }
                              }}
                              className="w-full bg-[#C44545] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm"
                            >
                              Add Language
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                </div>

                {/* Driver Status selection */}
                {role === 'driver' && (
                  <div className="px-2 mt-6">
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block ml-1">Your Status</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setDriverStatus('free')}
                          className={`flex-1 flex items-center justify-between p-4 rounded-xl border transition-all ${driverStatus === 'free' ? 'border-[#C44545] bg-rose-50/30' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <span className={`text-xs font-black uppercase tracking-wider ${driverStatus === 'free' ? 'text-[#C44545]' : 'text-slate-500'}`}>Free</span>
                          <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${driverStatus === 'free' ? 'border-[#C44545]' : 'border-slate-300'}`}>
                            {driverStatus === 'free' && <div className="h-2 w-2 rounded-full bg-[#C44545]" />}
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setDriverStatus('busy')}
                          className={`flex-1 flex items-center justify-between p-4 rounded-xl border transition-all ${driverStatus === 'busy' ? 'border-[#C44545] bg-rose-50/30' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <span className={`text-xs font-black uppercase tracking-wider ${driverStatus === 'busy' ? 'text-[#C44545]' : 'text-slate-500'}`}>Busy</span>
                          <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${driverStatus === 'busy' ? 'border-[#C44545]' : 'border-slate-300'}`}>
                            {driverStatus === 'busy' && <div className="h-2 w-2 rounded-full bg-[#C44545]" />}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remark/Note section at the end of Step 2 */}
                <div className="px-2 mt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-2">Remark / Note</label>
                  <textarea 
                    placeholder="Add any remarks or notes here..." 
                    value={remark} 
                    onChange={(e) => setRemark(e.target.value)} 
                    rows={3} 
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 font-bold placeholder:text-slate-300 focus:outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading}
                  className="w-full bg-[#C44545] text-white h-20 rounded-[2.5rem] font-black uppercase mt-6 shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Finish Registration <Check size={20} strokeWidth={3} />
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {pages.length > 0 && (
          <div className="flex justify-center gap-6 mt-12 border-t border-slate-200 pt-6 pb-4">
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
      </div>
    </div>
  );
};

export default VendorRegister;
