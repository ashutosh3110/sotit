import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save, Navigation, Globe, ChevronDown, Check, Square, CheckSquare, Search, Briefcase, FileText, Truck, Wrench, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { getVendorData, setVendorData } from "../utils/vendorStore";
import toast from "react-hot-toast";
import OfflineOverlay from "../../../shared/components/OfflineOverlay";

const VendorProfile = () => {
  const navigate = useNavigate();
  const vendorData = getVendorData();
  const [vendor, setVendor] = useState(vendorData || { profile: {} });
  const [isOnline, setIsOnline] = useState(vendorData?.profile?.isOnline !== false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", pincode: "" },
    liveLocation: null
  });

  const [role, setRole] = useState("");
  const [professionalDetails, setProfessionalDetails] = useState({ languages: ["Hindi"], vehicleClasses: [] });
  const [mechanicDetails, setMechanicDetails] = useState({ specialties: [], vehicleExpertise: [] });
  const [rtoDetails, setRtoDetails] = useState({ rtoOffice: "", services: [] });
  const [legalDetails, setLegalDetails] = useState({ barRegNumber: "", practiceAreas: [], officeName: "" });
  const [customFields, setCustomFields] = useState({});
  const [remark, setRemark] = useState("");
  const [configLanguages, setConfigLanguages] = useState([]);
  const [configVehicleTypes, setConfigVehicleTypes] = useState([]);
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customVehicleClass, setCustomVehicleClass] = useState("");
  const [showMechanicServices, setShowMechanicServices] = useState(false);
  const [customMechanicService, setCustomMechanicService] = useState("");
  const [showMechanicExpertise, setShowMechanicExpertise] = useState(false);
  const [customMechanicExpertise, setCustomMechanicExpertise] = useState("");

  const mechanicServices = ['General Service', 'Engine Repair', 'Brake Service', 'Electrical Work', 'AC Service', 'Suspension & Steering', 'Oil & Filter Change', 'Body Work & Paint', 'Clutch & Gearbox', 'Battery & Charging'];

  const displayLanguages = useMemo(() => {
    if (configLanguages && configLanguages.length > 0) {
      return configLanguages.map(l => l.name).sort();
    }
    return ['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].sort();
  }, [configLanguages]);

  const displayVehicleTypes = useMemo(() => {
    if (configVehicleTypes && configVehicleTypes.length > 0) {
      return configVehicleTypes.map(v => v.name).sort();
    }
    return ['Bike', 'Car', 'Truck', 'Bus'].sort();
  }, [configVehicleTypes]);

  useEffect(() => {
    if (vendorData?.profile) {
        setFormData(prev => ({
            ...prev,
            name: vendorData.profile.name || "",
            email: vendorData.profile.email || "",
            phone: vendorData.profile.mobile || "",
            address: vendorData.profile.address || prev.address
        }));
    }
    fetchProfile();

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/public`);
        const data = await res.json();
        if (data.success) {
          setConfigLanguages(data.languages || []);
          setConfigVehicleTypes(data.vehicleTypes || []);
        }
      } catch (err) {
        console.error("Error fetching registration config:", err);
      }
    };
    fetchConfig();

    const handleUpdate = () => {
        const newData = getVendorData();
        setVendor(newData);
        setIsOnline(newData.profile.isOnline !== false);
    };
    window.addEventListener('vendor_data_updated', handleUpdate);
    return () => window.removeEventListener('vendor_data_updated', handleUpdate);
  }, []);

  const fetchProfile = async () => {
    const vId = vendorData?.profile?.id || vendorData?.profile?._id;
    if (!vId) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vId}`);
        const data = await response.json();
        if (response.ok) {
            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.mobile || "",
                address: data.address || { street: "", city: "", state: "", pincode: "" },
                liveLocation: data.liveLocation || null
            });
            setRole(data.role || "");
            setProfessionalDetails(data.professionalDetails || { languages: ["Hindi"], vehicleClasses: [] });
            setMechanicDetails(data.mechanicDetails || { specialties: [], vehicleExpertise: [] });
            setRtoDetails(data.rtoDetails || { rtoOffice: "", services: [] });
            setLegalDetails(data.legalDetails || { barRegNumber: "", practiceAreas: [], officeName: "" });
            setCustomFields(data.customFields || {});
            setRemark(data.remark || "");
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    }
  };

  const handleToggleOnline = async () => {
    const vendorId = vendor.profile.id || vendor.profile._id;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/${vendorId}/toggle-status`, {
            method: 'PUT'
        });
        const data = await response.json();
        if (response.ok) {
            const updatedStore = getVendorData();
            updatedStore.profile.isOnline = data.isOnline;
            setVendorData(updatedStore);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    const tid = toast.loading("Capturing precise location...");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`);
          const data = await res.json();
          
          if (data && data.display_name) {
              const addr = data.address;
              setFormData(prev => ({
                  ...prev,
                  liveLocation: loc,
                  address: {
                      ...prev.address,
                      street: data.display_name,
                      city: addr.city || addr.town || addr.village || prev.address.city,
                      state: addr.state || prev.address.state,
                      pincode: addr.postcode || prev.address.pincode
                  }
              }));
              toast.success("Location Updated!", { id: tid });
          }
      } catch (err) {
          toast.error("Failed to fetch address", { id: tid });
      }
    }, () => { toast.error("Access denied", { id: tid }); });
  };

  const handleSave = async () => {
    const vId = vendorData?.profile?.id || vendorData?.profile?._id;
    const tid = toast.loading("Updating Profile...");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                address: formData.address,
                liveLocation: formData.liveLocation,
                professionalDetails,
                mechanicDetails,
                rtoDetails,
                legalDetails,
                customFields
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const updatedStore = { ...vendorData };
        updatedStore.profile.name = formData.name;
        setVendorData(updatedStore);

        toast.success("Profile Updated Successfully!", { id: tid });
        setTimeout(() => navigate('/vendor/settings'), 1500);
    } catch (error) {
        toast.error(error.message || "Failed to update profile", { id: tid });
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 text-neutral-900 font-inter relative">
      <OfflineOverlay isOnline={isOnline} onToggle={handleToggleOnline} />

      <div className={`transition-all duration-500 ${!isOnline ? 'blur-md grayscale pointer-events-none' : ''}`}>
          <div className="bg-white px-6 py-3 border-b border-neutral-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm shadow-black/[0.01]">
            <Link to="/vendor/settings" className="h-9 w-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 active:scale-90 transition-transform"><ArrowLeft size={18} /></Link>
            <h1 className="text-xl font-black tracking-tighter text-[#C44545]">My Profile.</h1>
          </div>

          <div className="px-6 py-8">
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="h-24 w-24 bg-[#C44545] rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-2xl shadow-[#C44545]/20">
                  {formData.name?.[0] || 'SG'}
                </div>
                <div className="absolute bottom-0 right-0 h-9 w-9 bg-[#A33636] rounded-2xl flex items-center justify-center text-white border-2 border-white cursor-pointer active:scale-90 transition-transform shadow-lg">
                  <Camera size={14} />
                </div>
              </div>
              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900 uppercase">{formData.name}</h2>
              <span className="text-[12px] font-black uppercase text-[#C44545] tracking-widest bg-rose-50 px-3 py-1 rounded-xl mt-2 border border-rose-100">Partner Account</span>
            </div>

            <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Full Name</label>
                 <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl shadow-black/[0.01]">
                    <User size={18} className="text-neutral-300" />
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Email Address</label>
                   <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl shadow-black/[0.01]">
                      <Mail size={18} className="text-neutral-300" />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Phone Number</label>
                   <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 opacity-60 shadow-xl shadow-black/[0.01]">
                      <Phone size={18} className="text-neutral-300" />
                      <input type="tel" value={formData.phone} disabled className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Service Address</label>
                    <button onClick={fetchLiveLocation} className="flex items-center gap-1 text-[10px] font-black text-[#C44545] uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                      <Navigation size={10} /> GPS
                    </button>
                 </div>
                 <div className="space-y-4">
                    <textarea rows={2} value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none resize-none shadow-xl shadow-black/[0.01]" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="City" value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none shadow-xl shadow-black/[0.01]" />
                       <input type="text" placeholder="Pincode" value={formData.address.pincode} onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none shadow-xl shadow-black/[0.01]" />
                    </div>
                 </div>
              </div>

              {/* Professional & Registration Details */}
              {role && (
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2">
                    Service & Registration Profile
                  </h3>

                  {/* Common Registration Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-white border border-black/5 rounded-2xl">
                      <span className="text-[10px] font-bold text-neutral-400 block mb-1">ROLE</span>
                      <span className="font-black text-slate-800 uppercase">{role}</span>
                    </div>
                    <div className="p-4 bg-white border border-black/5 rounded-2xl">
                      <span className="text-[10px] font-bold text-neutral-400 block mb-1">EXPERIENCE</span>
                      <span className="font-black text-slate-800">
                        {role === 'mechanic' ? mechanicDetails.experienceRange :
                         role === 'rto' ? rtoDetails.experience :
                         role === 'legal' ? legalDetails.experience :
                         professionalDetails.experience || 'Not Specified'}
                      </span>
                    </div>
                  </div>

                  {/* Role Specific Fields Display */}
                  {role === 'driver' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-white border border-black/5 rounded-2xl">
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">DL NUMBER</span>
                          <span className="font-black text-slate-800 uppercase">{professionalDetails.dlNumber || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-white border border-black/5 rounded-2xl">
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">DL EXPIRY</span>
                          <span className="font-black text-slate-800">
                            {professionalDetails.dlExpiry ? new Date(professionalDetails.dlExpiry).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 block mb-1">SERVICE TYPE (AVAILABILITY)</span>
                        <span className="font-black text-slate-800 uppercase">{professionalDetails.availability || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {role === 'mechanic' && (
                    <div className="space-y-4">
                      {mechanicDetails.garageName && (
                        <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">GARAGE NAME</span>
                          <span className="font-black text-slate-800">{mechanicDetails.garageName}</span>
                        </div>
                      )}
                      <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 block mb-1">SPECIALTIES / SERVICES</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mechanicDetails.specialties && mechanicDetails.specialties.length > 0 ? (
                            mechanicDetails.specialties.map(spec => (
                              <span key={spec} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-bold">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'rto' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 block mb-1">RTO OFFICE</span>
                        <span className="font-black text-slate-800 uppercase">{rtoDetails.rtoOffice || 'N/A'}</span>
                      </div>
                      <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 block mb-1">SERVICES OFFERED</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {rtoDetails.services && rtoDetails.services.length > 0 ? (
                            rtoDetails.services.map(s => (
                              <span key={s} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-bold">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'legal' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-white border border-black/5 rounded-2xl">
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">BAR REG NUMBER</span>
                          <span className="font-black text-slate-800 uppercase">{legalDetails.barRegNumber || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-white border border-black/5 rounded-2xl">
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">OFFICE/CHAMBER</span>
                          <span className="font-black text-slate-800 uppercase">{legalDetails.officeName || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                        <span className="text-[10px] font-bold text-neutral-400 block mb-1">PRACTICE AREAS</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {legalDetails.practiceAreas && legalDetails.practiceAreas.length > 0 ? (
                            legalDetails.practiceAreas.map(pa => (
                              <span key={pa} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                {pa}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-bold">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service States and Districts */}
                  {professionalDetails.serviceStates && professionalDetails.serviceStates.length > 0 && (
                    <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                      <span className="text-[10px] font-bold text-neutral-400 block mb-2">SERVICE LOCATIONS</span>
                      <div className="space-y-2">
                        {professionalDetails.serviceStates.map(st => (
                          <div key={st.isoCode} className="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                            <span className="font-black text-slate-800 text-[11px] block uppercase">{st.name}</span>
                            <span className="text-neutral-400 text-[10px] font-bold">
                              {st.districts && st.districts.length > 0 ? st.districts.join(', ') : 'All Districts'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {customFields && Object.keys(customFields).length > 0 && (
                    <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 block mb-2 uppercase">Other Details</span>
                      {Object.entries(customFields).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                          <span className="font-bold text-slate-500 uppercase text-[10px]">{key.replace(/_/g, ' ')}</span>
                          <span className="font-black text-slate-800">{val === true ? 'Yes' : val === false ? 'No' : String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {remark && (
                    <div className="p-4 bg-white border border-black/5 rounded-2xl text-xs">
                      <span className="text-[10px] font-bold text-neutral-400 block mb-1">REMARKS / NOTES</span>
                      <span className="font-bold text-slate-600 italic">"{remark}"</span>
                    </div>
                  )}

                  {/* Editable Section 1: Languages Known */}
                  <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-xl shadow-black/[0.01]">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                          Languages Known
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                          Multiple Select (Tap Select to modify)
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
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all max-h-60 overflow-y-auto no-scrollbar">
                        {displayLanguages.map(lang => {
                          const currentLanguages = professionalDetails.languages || [];
                          const isSelected = currentLanguages.includes(lang);
                          return (
                            <div 
                              key={lang}
                              onClick={() => {
                                const n = isSelected 
                                  ? currentLanguages.filter(x => x !== lang) 
                                  : [...currentLanguages, lang];
                                setProfessionalDetails({...professionalDetails, languages: n});
                              }}
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{lang}</span>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          );
                        })}
                        
                        {/* Render custom added languages */}
                        {(professionalDetails.languages || []).filter(l => !displayLanguages.includes(l)).map(lang => (
                          <div 
                            key={lang}
                            onClick={() => {
                              const n = (professionalDetails.languages || []).filter(x => x !== lang);
                              setProfessionalDetails({...professionalDetails, languages: n});
                            }}
                            className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                          >
                            <span className="text-[12px] font-black uppercase">{lang}</span>
                            <CheckSquare size={20} />
                          </div>
                        ))}

                        {/* Input box to add custom language */}
                        <div className="flex gap-2 mt-2">
                          <input 
                            type="text" 
                            placeholder="Add Custom Language (e.g. French)" 
                            value={customLanguage} 
                            onChange={(e) => setCustomLanguage(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (customLanguage.trim()) {
                                const lang = customLanguage.trim();
                                const currentLanguages = professionalDetails.languages || [];
                                if (!currentLanguages.includes(lang)) {
                                  setProfessionalDetails({
                                    ...professionalDetails,
                                    languages: [...currentLanguages, lang]
                                  });
                                }
                                setCustomLanguage("");
                              }
                            }}
                            className="bg-[#C44545] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {!showLanguageList && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {professionalDetails.languages && professionalDetails.languages.length > 0 ? (
                          professionalDetails.languages.map(lang => (
                            <span key={lang} className="bg-rose-50 text-[#C44545] border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">No languages selected</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Editable Section 2: Vehicle Classes / Expertise */}
                  {(role === 'driver' || role === 'towing') && (
                    <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-xl shadow-black/[0.01] space-y-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                          Vehicle Type / Classes
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                          Multiple Select (Select vehicles you can operate)
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {displayVehicleTypes.map(c => {
                          const currentVehicles = professionalDetails.vehicleClasses || [];
                          const isSelected = currentVehicles.includes(c);
                          return (
                            <div 
                              key={c} 
                              onClick={() => {
                                const n = isSelected ? currentVehicles.filter(x => x !== c) : [...currentVehicles, c];
                                setProfessionalDetails({...professionalDetails, vehicleClasses: n});
                              }} 
                              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-500 hover:bg-slate-50'}`}
                            >
                              <span className="text-[12px] font-black uppercase">{c}</span>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                            </div>
                          );
                        })}

                        {/* Render custom added vehicle classes */}
                        {(professionalDetails.vehicleClasses || []).filter(c => !displayVehicleTypes.includes(c)).map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              const n = (professionalDetails.vehicleClasses || []).filter(x => x !== c);
                              setProfessionalDetails({...professionalDetails, vehicleClasses: n});
                            }}
                            className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                          >
                            <span className="text-[12px] font-black uppercase">{c}</span>
                            <CheckSquare size={20} />
                          </div>
                        ))}
                      </div>

                      {/* Input box to add custom vehicle class */}
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add Custom Vehicle (e.g. Auto, Crane)" 
                          value={customVehicleClass} 
                          onChange={(e) => setCustomVehicleClass(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (customVehicleClass.trim()) {
                              const cVal = customVehicleClass.trim();
                              const currentVehicles = professionalDetails.vehicleClasses || [];
                              if (!currentVehicles.includes(cVal)) {
                                setProfessionalDetails({
                                  ...professionalDetails,
                                  vehicleClasses: [...currentVehicles, cVal]
                                });
                              }
                              setCustomVehicleClass("");
                            }
                          }}
                          className="bg-[#C44545] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {role === 'mechanic' && (
                    <>
                      <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-xl shadow-black/[0.01] space-y-4">
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
                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all max-h-60 overflow-y-auto no-scrollbar">
                            {mechanicServices.map(srv => {
                              const currentSpecialties = mechanicDetails.specialties || [];
                              const isSelected = currentSpecialties.includes(srv);
                              return (
                                <div 
                                  key={srv}
                                  onClick={() => {
                                    const n = isSelected 
                                      ? currentSpecialties.filter(x => x !== srv) 
                                      : [...currentSpecialties, srv];
                                    setMechanicDetails({...mechanicDetails, specialties: n});
                                  }}
                                  className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                                >
                                  <span className="text-[12px] font-black uppercase">{srv}</span>
                                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                </div>
                              );
                            })}
                            
                            {/* Render custom added specialties */}
                            {(mechanicDetails.specialties || []).filter(s => !mechanicServices.includes(s)).map(srv => (
                              <div 
                                key={srv}
                                onClick={() => {
                                  const n = (mechanicDetails.specialties || []).filter(x => x !== srv);
                                  setMechanicDetails({...mechanicDetails, specialties: n});
                                }}
                                className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                              >
                                <span className="text-[12px] font-black uppercase">{srv}</span>
                                <CheckSquare size={20} />
                              </div>
                            ))}

                            {/* Input box to add custom specialty */}
                            <div className="flex gap-2 mt-2">
                              <input 
                                type="text" 
                                placeholder="Add Custom Service (e.g. Dent Painting)" 
                                value={customMechanicService} 
                                onChange={(e) => setCustomMechanicService(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (customMechanicService.trim()) {
                                    const srv = customMechanicService.trim();
                                    const currentSpecialties = mechanicDetails.specialties || [];
                                    if (!currentSpecialties.includes(srv)) {
                                      setMechanicDetails({
                                        ...mechanicDetails,
                                        specialties: [...currentSpecialties, srv]
                                      });
                                    }
                                    setCustomMechanicService("");
                                  }
                                }}
                                className="bg-[#C44545] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {!showMechanicServices && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {mechanicDetails.specialties && mechanicDetails.specialties.length > 0 ? (
                              mechanicDetails.specialties.map(srv => (
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

                      <div className="p-5 bg-white border border-black/5 rounded-2xl shadow-xl shadow-black/[0.01] space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                              Vehicle Expertise
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                              Multiple Select (Select vehicles you repair)
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
                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 transition-all max-h-60 overflow-y-auto no-scrollbar">
                            {displayVehicleTypes.map(type => {
                              const currentExpertise = mechanicDetails.vehicleExpertise || [];
                              const isSelected = currentExpertise.includes(type);
                              return (
                                <div 
                                  key={type}
                                  onClick={() => {
                                    const n = isSelected ? currentExpertise.filter(x => x !== type) : [...currentExpertise, type];
                                    setMechanicDetails({...mechanicDetails, vehicleExpertise: n});
                                  }}
                                  className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isSelected ? 'border-[#C44545] bg-rose-50 text-[#C44545]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                                >
                                  <span className="text-[12px] font-black uppercase">{type}</span>
                                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-200" />}
                                </div>
                              );
                            })}

                            {/* Render custom added expertise */}
                            {(mechanicDetails.vehicleExpertise || []).filter(v => !displayVehicleTypes.includes(v)).map(type => (
                              <div 
                                key={type}
                                onClick={() => {
                                  const n = (mechanicDetails.vehicleExpertise || []).filter(x => x !== type);
                                  setMechanicDetails({...mechanicDetails, vehicleExpertise: n});
                                }}
                                className="p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer border-[#C44545] bg-rose-50 text-[#C44545]"
                              >
                                <span className="text-[12px] font-black uppercase">{type}</span>
                                <CheckSquare size={20} />
                              </div>
                            ))}

                            {/* Input box to add custom vehicle expertise */}
                            <div className="flex gap-2 mt-2">
                              <input 
                                type="text" 
                                placeholder="Add Custom Vehicle (e.g. Tractor, Crane)" 
                                value={customMechanicExpertise} 
                                onChange={(e) => setCustomMechanicExpertise(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (customMechanicExpertise.trim()) {
                                    const type = customMechanicExpertise.trim();
                                    const currentExpertise = mechanicDetails.vehicleExpertise || [];
                                    if (!currentExpertise.includes(type)) {
                                      setMechanicDetails({
                                        ...mechanicDetails,
                                        vehicleExpertise: [...currentExpertise, type]
                                      });
                                    }
                                    setCustomMechanicExpertise("");
                                  }
                                }}
                                className="bg-[#C44545] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#C44545]/90 active:scale-95 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {!showMechanicExpertise && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {mechanicDetails.vehicleExpertise && mechanicDetails.vehicleExpertise.length > 0 ? (
                              mechanicDetails.vehicleExpertise.map(type => (
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
                    </>
                  )}
                </div>
              )}

              <button onClick={handleSave} className="w-full bg-[#C44545] text-white rounded-[1.8rem] py-5 font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 shadow-2xl shadow-[#C44545]/20">
                 Save Profile <Save size={18} />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default VendorProfile;
