import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Phone, Menu, Mail, ShieldCheck, ArrowLeft, ExternalLink, Filter, User, Briefcase, Landmark, CreditCard, Info, FileText, X, Clock, Zap, Wrench, AlertCircle, HelpCircle, Star, Navigation, Truck, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";
import { indiaData } from "../../../utils/indiaData";


const AdminVendors = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  // Custom Filtering States
  const [selectedRole, setSelectedRole] = useState(null); // 'driver', 'mechanic', 'towing', 'rto', 'legal'
  const [selectedAvailability, setSelectedAvailability] = useState("all"); // 'Permanent', 'Temporary', 'all'
  const [selectedStatus, setSelectedStatus] = useState("all"); // 'free', 'busy', 'all'
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [selectedWorkOffered, setSelectedWorkOffered] = useState(null);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      console.log("CRITICAL: Selected Vendor Data ->", selectedEntity);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsEditing(false);
      setEditForm(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedEntity]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/vendors`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVendors(data);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    // 1. Role Filter
    if (!selectedRole || v.role !== selectedRole) return false;

    // 2. Driver Availability Type (Permanent vs Temporary)
    if (selectedRole === 'driver' && selectedAvailability !== 'all') {
      if (v.professionalDetails?.availability !== selectedAvailability) return false;
    }

    // 3. Online Status (Free/Online vs Busy/Offline)
    if (selectedStatus !== 'all') {
      const isFree = v.isOnline === true;
      if (selectedStatus === 'free' && !isFree) return false;
      if (selectedStatus === 'busy' && isFree) return false;
    }

    // State Filter
    if (selectedState && v.address?.state !== selectedState) return false;

    // District Filter
    if (selectedDistrict && v.address?.city !== selectedDistrict) return false;

    // Mechanic vehicle type filter
    if (selectedRole === 'mechanic' && selectedVehicleType) {
      if (!v.mechanicDetails?.vehicleExpertise || !v.mechanicDetails.vehicleExpertise.includes(selectedVehicleType)) return false;
    }

    // Mechanic work offered/specialties filter
    if (selectedRole === 'mechanic' && selectedWorkOffered) {
      if (!v.mechanicDetails?.specialties || !v.mechanicDetails.specialties.includes(selectedWorkOffered)) return false;
    }

    // 4. Search Filter
    const term = searchTerm.toLowerCase();
    const searchMatch = 
      v.name.toLowerCase().includes(term) || 
      (v._id && v._id.toLowerCase().includes(term)) ||
      (v.mobile && v.mobile.toLowerCase().includes(term));
      
    return searchMatch;
  });

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm shrink-0"><Icon size={16} /></div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-slate-700 leading-tight truncate">{value || 'N/A'}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h4 className="text-[11px] font-black uppercase text-[#C44545] tracking-[0.2em] border-l-4 border-[#C44545] pl-4 mb-4">{title}</h4>
  );

  const CustomDropdown = ({ label, options, value, onChange, placeholder, disabled, compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(opt => 
        (opt.name || opt || "").toString().toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${compact ? 'min-w-[200px]' : 'w-full'}`} ref={dropdownRef}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block ml-1">
                    {label}
                </label>
            )}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-50 border ${isOpen ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-200'} transition-all disabled:opacity-50 text-left ${compact ? 'rounded-xl py-2 px-3 text-xs font-black uppercase tracking-wider text-slate-500 h-[38px]' : 'rounded-2xl py-3 px-4 text-sm font-bold text-slate-800'}`}
            >
                <span className="truncate text-slate-700">{value || placeholder}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[#C44545]' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                    >
                        <div className="p-2 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-bold focus:ring-0 focus:outline-none text-slate-800"
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto no-scrollbar p-1">
                            {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => {
                                const name = opt.name || opt;
                                const isSelected = value === name;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            onChange(name);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${isSelected ? 'bg-rose-50 text-[#C44545]' : 'text-slate-650 hover:bg-slate-50'}`}
                                    >
                                        <span className="truncate">{name}</span>
                                        {isSelected && <Check size={12} className="text-[#C44545]" />}
                                    </button>
                                );
                            }) : (
                                <div className="p-3 text-center text-[10px] font-bold text-slate-400">No results found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };


  const startEditing = () => {
    setEditForm({
      name: selectedEntity.name || "",
      mobile: selectedEntity.mobile || "",
      email: selectedEntity.email || "",
      password: "",
      address: {
        street: selectedEntity.address?.street || "",
        city: selectedEntity.address?.city || "",
        state: selectedEntity.address?.state || "",
        pincode: selectedEntity.address?.pincode || ""
      },
      bankDetails: {
        accountHolderName: selectedEntity.bankDetails?.accountHolderName || "",
        bankName: selectedEntity.bankDetails?.bankName || "",
        accountNumber: selectedEntity.bankDetails?.accountNumber || "",
        ifscCode: selectedEntity.bankDetails?.ifscCode || "",
        upiId: selectedEntity.bankDetails?.upiId || ""
      },
      professionalDetails: {
        dlNumber: selectedEntity.professionalDetails?.dlNumber || "",
        dlExpiry: selectedEntity.professionalDetails?.dlExpiry ? new Date(selectedEntity.professionalDetails.dlExpiry).toISOString().split('T')[0] : "",
        experience: selectedEntity.professionalDetails?.experience || "1-3 Years",
        availability: selectedEntity.professionalDetails?.availability || "Permanent",
        vehicleClasses: selectedEntity.professionalDetails?.vehicleClasses || []
      },
      mechanicDetails: {
        specialties: selectedEntity.mechanicDetails?.specialties || [],
        garageName: selectedEntity.mechanicDetails?.garageName || "",
        experienceRange: selectedEntity.mechanicDetails?.experienceRange || "1-3 Years",
        workingHours: selectedEntity.mechanicDetails?.workingHours || "9 AM - 7 PM"
      },
      rtoDetails: {
        rtoOffice: selectedEntity.rtoDetails?.rtoOffice || "",
        services: selectedEntity.rtoDetails?.services || [],
        experience: selectedEntity.rtoDetails?.experience || "1-3 Years"
      },
      legalDetails: {
        barRegNumber: selectedEntity.legalDetails?.barRegNumber || "",
        officeName: selectedEntity.legalDetails?.officeName || "",
        practiceAreas: selectedEntity.legalDetails?.practiceAreas || [],
        experience: selectedEntity.legalDetails?.experience || "1-3 Years"
      },
      isOnline: selectedEntity.isOnline !== undefined ? selectedEntity.isOnline : true
    });
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!editForm.name.trim()) return toast.error("Full Name is required");
    if (!editForm.mobile.trim() || editForm.mobile.length !== 10) return toast.error("Valid 10-digit mobile number is required");
    if (editForm.address.state && !editForm.address.city) return toast.error("Please select a City/District for the selected State");

    const tid = toast.loading("Saving changes...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vendors/${selectedEntity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Vendor updated successfully!", { id: tid });
        setSelectedEntity(data.vendor);
        setVendors(prev => prev.map(v => v._id === data.vendor._id ? data.vendor : v));
        setIsEditing(false);
      } else {
        toast.error(data.message || "Failed to update vendor", { id: tid });
      }
    } catch (err) {
      console.error("Error updating vendor:", err);
      toast.error("Failed to save changes", { id: tid });
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex text-slate-900 overflow-x-hidden">
      <style>{`
        .force-scroll::-webkit-scrollbar { width: 4px; display: block !important; }
        .force-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-900 border border-black/5 shadow-sm"><Menu size={20} strokeWidth={2.5} /></button>
            <button onClick={() => navigate('/admin')} className="hidden lg:flex h-10 w-10 bg-neutral-50 rounded-xl items-center justify-center text-slate-900 border border-black/5 shadow-sm active:scale-90 transition-all"><ArrowLeft size={20} strokeWidth={2.5} /></button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Management</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Providers Directory.</h1>
            </div>
          </div>
        </header>

        <section className="px-6 py-8 flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto w-full">
                
                {/* Category Grid Selection */}
                <div className="mb-8 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Select Provider Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { id: 'driver', label: 'Drivers', icon: Navigation, desc: 'Chauffeur services' },
                      { id: 'mechanic', label: 'Mechanics', icon: Wrench, desc: 'Repair & maintenance' },
                      { id: 'towing', label: 'Towing', icon: Truck, desc: 'Recovery services' },
                      { id: 'rto', label: 'RTO Agents', icon: FileText, desc: 'RTO assistant' },
                      { id: 'legal', label: 'Legal Advisors', icon: Briefcase, desc: 'Legal advisory' }
                    ].map((c) => {
                      const isSelected = selectedRole === c.id;
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            setSelectedRole(c.id);
                            setSelectedAvailability("all");
                            setSelectedStatus("all");
                            setSelectedState(null);
                            setSelectedDistrict(null);
                            setSelectedVehicleType(null);
                            setSelectedWorkOffered(null);
                          }}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-36 ${isSelected ? 'border-[#C44545] bg-[#C44545] text-white shadow-xl shadow-[#C44545]/20' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
                        >
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/10 text-white' : 'bg-white border border-slate-100 text-slate-500 shadow-sm'}`}><c.icon size={20} /></div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">{c.label}</p>
                            <p className={`text-[10px] font-bold leading-none ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{c.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Conditional Sub-Filters */}
                {selectedRole && (
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-sm">
                    <div className="flex flex-wrap gap-8 items-end">
                      {/* Driver Specific Type Filter */}
                      {selectedRole === 'driver' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.15em] pl-1 block">Driver Type</label>
                          <div className="flex gap-2">
                            {['all', 'Permanent', 'Temporary'].map((type) => (
                              <button 
                                key={type}
                                onClick={() => setSelectedAvailability(type)}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${selectedAvailability === type ? 'bg-[#C44545] border-[#C44545] text-white shadow-md shadow-[#C44545]/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Filter (Busy vs Free) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.15em] pl-1 block">
                          {selectedRole === 'driver' ? 'Availability Status' : 'Online Status'}
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: 'all', label: 'All Status' },
                            { id: 'free', label: selectedRole === 'driver' ? 'Free (Online)' : 'Online' },
                            { id: 'busy', label: selectedRole === 'driver' ? 'Busy (Offline)' : 'Offline' }
                          ].map((status) => (
                            <button 
                              key={status.id}
                              onClick={() => setSelectedStatus(status.id)}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${selectedStatus === status.id ? 'bg-[#C44545] border-[#C44545] text-white shadow-md shadow-[#C44545]/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* State Filter */}
                      <CustomDropdown
                        label="State"
                        options={["All States", ...Object.keys(indiaData).sort()]}
                        value={selectedState || "All States"}
                        onChange={(val) => {
                          if (val === "All States") {
                            setSelectedState(null);
                            setSelectedDistrict(null);
                          } else {
                            setSelectedState(val);
                            setSelectedDistrict(null);
                          }
                        }}
                        placeholder="All States"
                        compact={true}
                      />

                      {/* District Filter */}
                      <CustomDropdown
                        label="District / City"
                        options={["All Districts", ...(selectedState ? indiaData[selectedState] || [] : [])]}
                        value={selectedDistrict || "All Districts"}
                        onChange={(val) => {
                          if (val === "All Districts") {
                            setSelectedDistrict(null);
                          } else {
                            setSelectedDistrict(val);
                          }
                        }}
                        disabled={!selectedState}
                        placeholder="All Districts"
                        compact={true}
                      />

                      {/* Mechanic Specific Filters */}
                      {selectedRole === 'mechanic' && (
                        <>
                          <CustomDropdown
                            label="Vehicle Type"
                            options={["All Vehicle Types", "Bike", "Car", "Truck", "Bus"]}
                            value={selectedVehicleType || "All Vehicle Types"}
                            onChange={(val) => {
                              if (val === "All Vehicle Types") {
                                setSelectedVehicleType(null);
                              } else {
                                setSelectedVehicleType(val);
                              }
                            }}
                            placeholder="All Vehicle Types"
                            compact={true}
                          />

                          <CustomDropdown
                            label="Work Offered"
                            options={[
                              "All Works",
                              "General Service",
                              "Engine Repair",
                              "Brake Service",
                              "Electrical Work",
                              "AC Service",
                              "Suspension & Steering",
                              "Oil & Filter Change",
                              "Body Work & Paint",
                              "Clutch & Gearbox",
                              "Battery & Charging"
                            ]}
                            value={selectedWorkOffered || "All Works"}
                            onChange={(val) => {
                              if (val === "All Works") {
                                setSelectedWorkOffered(null);
                              } else {
                                setSelectedWorkOffered(val);
                              }
                            }}
                            placeholder="All Works"
                            compact={true}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Search Bar inside Selected Category */}
                {selectedRole && (
                  <div className="relative group mb-8">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Search size={16} className="text-slate-400" />
                      </div>
                      <input 
                          type="text" 
                          placeholder={`Search ${selectedRole}s by name or mobile...`} 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:border-[#C44545]/20 focus:outline-none transition-all shadow-sm"
                      />
                  </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 border-4 border-[#C44545]/20 border-t-[#C44545] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                      {!selectedRole ? (
                        <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center bg-white shadow-sm mt-8">
                          <div className="h-16 w-16 bg-[#C44545]/5 rounded-3xl flex items-center justify-center text-[#C44545] mb-4 border border-[#C44545]/10">
                            <Info size={28} />
                          </div>
                          <h4 className="text-base font-black text-slate-800 uppercase tracking-tight mb-1">Select a Category</h4>
                          <p className="text-xs font-bold text-slate-400 max-w-sm">Aapko jis category ke providers ki list dekhni hai, use upar se select karein.</p>
                        </div>
                      ) : (
                        filteredVendors.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredVendors.map((vendor) => (
                                  <motion.div 
                                      key={vendor._id} 
                                      layout 
                                      initial={{ opacity: 0 }} 
                                      animate={{ opacity: 1 }} 
                                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#C44545]/20 transition-all flex flex-col justify-between"
                                  >
                                      <div>
                                          <div className="flex justify-between items-start mb-6">
                                              <div className="flex items-center gap-4">
                                                  <div className="h-12 w-12 bg-rose-50/50 rounded-xl flex items-center justify-center text-[#C44545] font-bold border border-rose-100 uppercase shadow-inner text-lg">
                                                      {vendor.name?.[0]}
                                                  </div>
                                                  <div>
                                                      <h3 className="text-base font-bold tracking-tight text-slate-800 truncate max-w-[140px]">{vendor.name}</h3>
                                                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border mt-1 block w-fit bg-[#C44545]/5 text-[#C44545] border-[#C44545]/10 capitalize">{vendor.role}</span>
                                                  </div>
                                              </div>
                                              <div className="flex flex-col items-end gap-1 shrink-0">
                                                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${vendor.isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                    {vendor.isOnline ? 'Free / Online' : 'Busy / Offline'}
                                                  </div>
                                                  {vendor.isBlocked && <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-red-100">Blocked</div>}
                                              </div>
                                          </div>
                                          <div className="space-y-3 mb-6 py-4 border-y border-slate-50">
                                              <div className="flex items-center gap-3">
                                                  <MapPin size={14} className="text-[#C44545]" />
                                                  <span className="text-sm font-medium text-slate-600 truncate">{vendor.address?.city || 'N/A'}</span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                  <Phone size={14} className="text-[#C44545]" />
                                                  <span className="text-sm font-medium text-slate-600">{vendor.mobile}</span>
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => setSelectedEntity(vendor)} 
                                          className="w-full bg-slate-900 hover:bg-[#C44545] text-white py-3 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                                      >
                                          View Profile Details <ExternalLink size={14} />
                                      </button>
                                  </motion.div>
                              ))}
                          </div>
                        ) : (
                          <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center bg-white shadow-sm">
                            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                              <AlertCircle size={28} />
                            </div>
                            <h4 className="text-base font-black text-slate-800 uppercase tracking-tight mb-1">No Providers Found</h4>
                            <p className="text-xs font-bold text-slate-400 max-w-sm font-inter">Is category or filter criteria ke koi bhi providers nahi mile.</p>
                          </div>
                        )
                      )}
                    </>
                )}
            </div>
        </section>
      </div>

      {/* --- Bulletproof Scrolling Modal --- */}
      <AnimatePresence>
          {selectedEntity && (
              <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-slate-900/60 backdrop-blur-md overflow-hidden">
                  <motion.div 
                      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="bg-white w-full max-w-3xl h-[90vh] lg:h-[85vh] rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative"
                  >
                      {/* HEADER */}
                      <div className="px-6 lg:px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner"><ShieldCheck size={24} /></div>
                              <div className="flex flex-col">
                                  <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Partner Profile</h2>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">ID: {selectedEntity._id}</p>
                              </div>
                          </div>
                          <button onClick={() => setSelectedEntity(null)} className="h-10 w-10 lg:h-12 lg:w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm"><X size={24} /></button>
                      </div>

                      {/* SCROLLABLE WRAPPER (FORCED) */}
                      <div className="flex-1 relative min-h-0 bg-white">
                          <div className="absolute inset-0 overflow-y-scroll force-scroll p-6 lg:p-10 space-y-12 touch-pan-y">
                              {isEditing && editForm ? (
                                  <div className="space-y-6 pb-20">
                                      <SectionHeader title="Edit Personal Information" />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
                                              <input
                                                  type="text"
                                                  value={editForm.name}
                                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Mobile</label>
                                              <input
                                                  type="text"
                                                  value={editForm.mobile}
                                                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email</label>
                                              <input
                                                  type="email"
                                                  value={editForm.email}
                                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">New Password (leave empty to keep current)</label>
                                              <input
                                                  type="password"
                                                  placeholder="Enter new password"
                                                  value={editForm.password || ""}
                                                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          {selectedEntity.role === 'driver' && (
                                              <div className="space-y-1 md:col-span-2">
                                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Availability Status</label>
                                                  <div className="flex gap-3">
                                                      <button
                                                          type="button"
                                                          onClick={() => setEditForm({ ...editForm, isOnline: true })}
                                                          className={`flex-1 py-3 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-wider ${editForm.isOnline ? 'border-[#C44545] bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}
                                                      >
                                                          Free (Online)
                                                      </button>
                                                      <button
                                                          type="button"
                                                          onClick={() => setEditForm({ ...editForm, isOnline: false })}
                                                          className={`flex-1 py-3 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-wider ${!editForm.isOnline ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}
                                                      >
                                                          Busy (Offline)
                                                      </button>
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      <SectionHeader title="Edit Address & Location" />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <CustomDropdown
                                              label="State"
                                              options={Object.keys(indiaData).sort()}
                                              value={editForm.address?.state || ""}
                                              onChange={(val) => {
                                                  setEditForm({
                                                      ...editForm,
                                                      address: {
                                                          ...editForm.address,
                                                          state: val,
                                                          city: ""
                                                      }
                                                  });
                                              }}
                                              placeholder="Select State"
                                          />
                                          <CustomDropdown
                                              label="City / District"
                                              options={editForm.address?.state ? indiaData[editForm.address.state] || [] : []}
                                              value={editForm.address?.city || ""}
                                              onChange={(val) => {
                                                  setEditForm({
                                                      ...editForm,
                                                      address: {
                                                          ...editForm.address,
                                                          city: val
                                                      }
                                                  });
                                              }}
                                              disabled={!editForm.address?.state}
                                              placeholder="Select District"
                                          />
                                          <div className="space-y-1 md:col-span-2">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Street Address</label>
                                              <input
                                                  type="text"
                                                  value={editForm.address?.street || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      address: { ...editForm.address, street: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Pincode</label>
                                              <input
                                                  type="text"
                                                  value={editForm.address?.pincode || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      address: { ...editForm.address, pincode: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                      </div>

                                      <SectionHeader title="Edit Bank Details" />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">A/C Holder Name</label>
                                              <input
                                                  type="text"
                                                  value={editForm.bankDetails?.accountHolderName || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      bankDetails: { ...editForm.bankDetails, accountHolderName: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Bank Name</label>
                                              <input
                                                  type="text"
                                                  value={editForm.bankDetails?.bankName || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      bankDetails: { ...editForm.bankDetails, bankName: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Account Number</label>
                                              <input
                                                  type="text"
                                                  value={editForm.bankDetails?.accountNumber || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      bankDetails: { ...editForm.bankDetails, accountNumber: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">IFSC Code</label>
                                              <input
                                                  type="text"
                                                  value={editForm.bankDetails?.ifscCode || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      bankDetails: { ...editForm.bankDetails, ifscCode: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                          <div className="space-y-1 md:col-span-2">
                                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">UPI ID</label>
                                              <input
                                                  type="text"
                                                  value={editForm.bankDetails?.upiId || ""}
                                                  onChange={(e) => setEditForm({
                                                      ...editForm,
                                                      bankDetails: { ...editForm.bankDetails, upiId: e.target.value }
                                                  })}
                                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                              />
                                          </div>
                                      </div>

                                      <SectionHeader title="Edit Role Specific Details" />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {selectedEntity.role === 'mechanic' && (
                                              <>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Garage Name</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.mechanicDetails?.garageName || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              mechanicDetails: { ...editForm.mechanicDetails, garageName: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Working Hours</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.mechanicDetails?.workingHours || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              mechanicDetails: { ...editForm.mechanicDetails, workingHours: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Experience</label>
                                                      <select
                                                          value={editForm.mechanicDetails?.experienceRange || "1-3 Years"}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              mechanicDetails: { ...editForm.mechanicDetails, experienceRange: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      >
                                                          <option value="1-3 Years">1-3 Years</option>
                                                          <option value="3-5 Years">3-5 Years</option>
                                                          <option value="5-10 Years">5-10 Years</option>
                                                          <option value="10+ Years">10+ Years</option>
                                                      </select>
                                                  </div>
                                              </>
                                          )}
                                          {(selectedEntity.role === 'driver' || selectedEntity.role === 'towing') && (
                                              <>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">License No.</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.professionalDetails?.dlNumber || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              professionalDetails: { ...editForm.professionalDetails, dlNumber: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Exp. Years</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.professionalDetails?.experience || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              professionalDetails: { ...editForm.professionalDetails, experience: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  {selectedEntity.role === 'driver' && (
                                                      <div className="space-y-1">
                                                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">DL Expiry</label>
                                                          <input
                                                              type="date"
                                                              value={editForm.professionalDetails?.dlExpiry || ""}
                                                              onChange={(e) => setEditForm({
                                                                  ...editForm,
                                                                  professionalDetails: { ...editForm.professionalDetails, dlExpiry: e.target.value }
                                                              })}
                                                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                          />
                                                      </div>
                                                  )}
                                              </>
                                          )}
                                          {selectedEntity.role === 'rto' && (
                                              <>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">RTO Office</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.rtoDetails?.rtoOffice || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              rtoDetails: { ...editForm.rtoDetails, rtoOffice: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Experience</label>
                                                      <select
                                                          value={editForm.rtoDetails?.experience || "1-3 Years"}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              rtoDetails: { ...editForm.rtoDetails, experience: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      >
                                                          <option value="1-3 Years">1-3 Years</option>
                                                          <option value="3-5 Years">3-5 Years</option>
                                                          <option value="5-10 Years">5-10 Years</option>
                                                          <option value="10+ Years">10+ Years</option>
                                                      </select>
                                                  </div>
                                              </>
                                          )}
                                          {selectedEntity.role === 'legal' && (
                                              <>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Bar Reg Number</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.legalDetails?.barRegNumber || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              legalDetails: { ...editForm.legalDetails, barRegNumber: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                                  <div className="space-y-1">
                                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Office/Chamber Name</label>
                                                      <input
                                                          type="text"
                                                          value={editForm.legalDetails?.officeName || ""}
                                                          onChange={(e) => setEditForm({
                                                              ...editForm,
                                                              legalDetails: { ...editForm.legalDetails, officeName: e.target.value }
                                                          })}
                                                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C44545]"
                                                      />
                                                  </div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      {/* Top Profile Banner */}
                                      <div className="flex items-center gap-6 pb-10 border-b border-slate-100">
                                          <div className="h-20 w-20 lg:h-24 lg:w-24 bg-rose-50 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center text-[#C44545] font-black text-3xl border-4 border-white shadow-xl uppercase shrink-0">{selectedEntity.name?.[0]}</div>
                                          <div className="space-y-2">
                                              <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">{selectedEntity.name}</h3>
                                              <div className="flex flex-wrap gap-2">
                                                  <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedEntity.role}</span>
                                                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">{selectedEntity.status}</span>
                                              </div>
                                          </div>
                                      </div>

                                      {/* Contact Info */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <DetailRow icon={User} label="Full Name" value={selectedEntity.name} />
                                          <DetailRow icon={Phone} label="Mobile" value={selectedEntity.mobile} />
                                          <DetailRow icon={Mail} label="Email Address" value={selectedEntity.email} />
                                          <DetailRow icon={MapPin} label="Service Area" value={`${selectedEntity.address?.city || ''} ${selectedEntity.address?.state || ''}`} />
                                      </div>

                                      {/* Rating Management (Non-Drivers) */}
                                      {selectedEntity.role !== 'driver' && (
                                          <div className="p-6 bg-[#C44545]/5 border border-[#C44545]/10 rounded-[2rem] space-y-4">
                                              <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                      <Star size={16} className="text-[#C44545] fill-[#C44545]" />
                                                      <h4 className="text-[11px] font-black uppercase tracking-widest text-[#C44545]">Manual Rating Control</h4>
                                                  </div>
                                                  <span className="text-xl font-black text-[#C44545]">{selectedEntity.rating || '0.0'}</span>
                                              </div>
                                              <div className="flex gap-2">
                                                  {[1, 2, 3, 4, 5].map((star) => (
                                                      <button 
                                                        key={star}
                                                        onClick={async () => {
                                                            const tid = toast.loading("Updating rating...");
                                                            try {
                                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vendors/${selectedEntity._id}/update-rating`, {
                                                                    method: 'PUT',
                                                                    headers: { 
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
                                                                    },
                                                                    body: JSON.stringify({ rating: star })
                                                                });
                                                                const data = await res.json();
                                                                if (res.ok) {
                                                                    toast.success("Rating updated!", { id: tid });
                                                                    setSelectedEntity(data.vendor);
                                                                    setVendors(prev => prev.map(v => v._id === data.vendor._id ? data.vendor : v));
                                                                } else {
                                                                    toast.error(data.message, { id: tid });
                                                                }
                                                            } catch (err) {
                                                                toast.error("Failed to update rating", { id: tid });
                                                            }
                                                        }}
                                                        className={`flex-1 py-3 rounded-xl border-2 transition-all font-black text-xs ${selectedEntity.rating === star ? 'bg-[#C44545] border-[#C44545] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-[#C44545]/20'}`}
                                                      >
                                                          {star}
                                                      </button>
                                                  ))}
                                              </div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase text-center tracking-wider">Note: Driver ratings are automated after 1 month of service.</p>
                                          </div>
                                      )}

                                      {/* Experience Details */}
                                      <div className="space-y-4">
                                          <SectionHeader title="Service Experience" />
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              {selectedEntity.role === 'mechanic' && (
                                                  <>
                                                      <DetailRow icon={Wrench} label="Garage Name" value={selectedEntity.mechanicDetails?.garageName} />
                                                      <DetailRow icon={Clock} label="Working Hours" value={selectedEntity.mechanicDetails?.workingHours} />
                                                      <DetailRow icon={Briefcase} label="Experience" value={selectedEntity.mechanicDetails?.experienceRange} />
                                                  </>
                                              )}
                                              {(selectedEntity.role === 'driver' || selectedEntity.role === 'towing') && (
                                                  <>
                                                      <DetailRow icon={Briefcase} label="License No." value={selectedEntity.professionalDetails?.dlNumber} />
                                                      <DetailRow icon={Clock} label="Exp. Years" value={selectedEntity.professionalDetails?.experience} />
                                                      <DetailRow icon={Wrench} label="Vehicles" value={selectedEntity.professionalDetails?.vehicleClasses?.join(', ')} />
                                                  </>
                                              )}
                                              {selectedEntity.role === 'rto' && (
                                                  <>
                                                      <DetailRow icon={FileText} label="RTO Office" value={selectedEntity.rtoDetails?.rtoOffice} />
                                                      <DetailRow icon={Briefcase} label="Experience" value={selectedEntity.rtoDetails?.experience} />
                                                  </>
                                              )}
                                          </div>
                                      </div>

                                      {/* Settlement Section */}
                                      <div className="space-y-4">
                                          <SectionHeader title="Banking & Settlement" />
                                          {selectedEntity.bankDetails && Object.values(selectedEntity.bankDetails).some(v => v) ? (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <DetailRow icon={User} label="A/C Holder" value={selectedEntity.bankDetails.accountHolderName} />
                                                  <DetailRow icon={Landmark} label="Bank Name" value={selectedEntity.bankDetails.bankName} />
                                                  <DetailRow icon={CreditCard} label="A/C Number" value={selectedEntity.bankDetails.accountNumber} />
                                                  <DetailRow icon={Info} label="IFSC Code" value={selectedEntity.bankDetails.ifscCode} />
                                                  <DetailRow icon={Zap} label="UPI ID" value={selectedEntity.bankDetails.upiId} />
                                              </div>
                                          ) : (
                                              <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center bg-slate-50/50">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Bank Details Provided</p>
                                              </div>
                                          )}
                                      </div>

                                      {/* Documents Section */}
                                      <div className="space-y-4 pb-20">
                                          <SectionHeader title="KYC Documents" />
                                          {selectedEntity.kycDocuments && Object.values(selectedEntity.kycDocuments).some(v => v) ? (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {Object.entries(selectedEntity.kycDocuments).map(([key, path]) => {
                                                      if (!path) return null;
                                                      const fullPath = path.startsWith('http') ? path : `http://localhost:5000/${path}`;
                                                      return (
                                                          <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group transition-all hover:border-[#C44545]/20">
                                                              <div className="flex items-center gap-3 min-w-0">
                                                                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#C44545] shadow-sm shrink-0"><FileText size={18} /></div>
                                                                  <span className="text-[11px] font-black uppercase text-slate-600 truncate">{key}</span>
                                                              </div>
                                                              <a href={fullPath} target="_blank" rel="noreferrer" className="h-9 w-9 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-[#C44545] hover:text-white shadow-md shrink-0 transition-all"><ExternalLink size={16} /></a>
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          ) : (
                                              <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center bg-slate-50/50">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No KYC Documents Uploaded</p>
                                              </div>
                                          )}
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* FOOTER */}
                      <div className="p-6 lg:px-10 py-6 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-4">
                          {isEditing ? (
                              <>
                                  <button 
                                      onClick={handleSaveChanges}
                                      className="flex-1 bg-emerald-600 shadow-xl shadow-emerald-600/20 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all"
                                  >
                                      Save Changes
                                  </button>
                                  <button 
                                      onClick={() => setIsEditing(false)}
                                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20 active:scale-95 transition-all"
                                  >
                                      Cancel
                                  </button>
                              </>
                          ) : (
                              <>
                                  <button 
                                    onClick={async () => {
                                        const tid = toast.loading(`${selectedEntity.isBlocked ? 'Unblocking' : 'Blocking'} vendor...`);
                                        try {
                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/vendors/${selectedEntity._id}/toggle-block`, {
                                                method: 'PUT',
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                toast.success(data.message, { id: tid });
                                                setSelectedEntity(data.vendor);
                                                setVendors(prev => prev.map(v => v._id === data.vendor._id ? data.vendor : v));
                                            } else {
                                                toast.error(data.message, { id: tid });
                                            }
                                        } catch (err) {
                                            toast.error("Action failed", { id: tid });
                                        }
                                    }}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl active:scale-95 transition-all ${selectedEntity.isBlocked ? 'bg-emerald-600 shadow-emerald-600/20 text-white' : 'bg-red-600 shadow-red-600/20 text-white'}`}
                                  >
                                      {selectedEntity.isBlocked ? 'Unblock Partner' : 'Block Partner'}
                                  </button>
                                  <button 
                                    onClick={startEditing}
                                    className="flex-1 bg-[#C44545] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all"
                                  >
                                      Edit Profile
                                  </button>
                                  <button onClick={() => setSelectedEntity(null)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20 active:scale-95 transition-all">
                                      Close Profile
                                  </button>
                              </>
                          )}
                      </div>

                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVendors;
