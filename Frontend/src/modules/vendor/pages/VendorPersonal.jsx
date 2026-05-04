import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, CheckCircle2, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const VendorPersonal = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('temp_vendor_role') || 'driver';
  
  const [nativeLanguages, setNativeLanguages] = useState([]);
  const [operatingState, setOperatingState] = useState('');
  const [operatingCities, setOperatingCities] = useState([]);
  const [drivePreference, setDrivePreference] = useState('Permanent');
  const [mechanicTypes, setMechanicTypes] = useState([]);
  const [ownerVehicleType, setOwnerVehicleType] = useState('Sedan/SUV');
  const [ownerSalary, setOwnerSalary] = useState('');
  const [driverVehicleTypes, setDriverVehicleTypes] = useState(['Car']);

  const languages = ['Tamil', 'Marathi', 'Hindi', 'English', 'Bengali', 'Gujarati', 'Kannada', 'Telugu'];
  const mechanicOptions = [
    'Car Mechanic', 'Bike Mechanic', 'Truck Mechanic', 
    'Electric Vehicle (EV) Mechanic', 'Tyre Specialist', 
    'Engine Specialist', 'AC Repair'
  ];

  const citiesMap = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nasik', 'Aurangabad'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur']
  };

  const toggleLanguage = (lang) => {
    setNativeLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleMechanicType = (type) => {
    setMechanicTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleCity = (city) => {
    setOperatingCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };
  
  const toggleDriverVehicleType = (type) => {
    setDriverVehicleTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (nativeLanguages.length === 0) {
        alert("Please select or enter at least one language");
        return;
    }

    if (role === 'mechanic' && mechanicTypes.length === 0) {
        alert("Please select at least one Expertise type");
        return;
    }

    localStorage.setItem('temp_vendor_languages', JSON.stringify(nativeLanguages));
    localStorage.setItem('temp_vendor_state', operatingState);
    localStorage.setItem('temp_vendor_cities', JSON.stringify(operatingCities));
    localStorage.setItem('temp_vendor_mechanic_types', JSON.stringify(mechanicTypes));
    
    // Simulate successful registration & login
    localStorage.setItem('vendor_data', JSON.stringify({
        profile: { name: "Expert Partner", role: role },
        wallet: 0
    }));
    window.dispatchEvent(new Event('vendor_data_updated'));
    
    if (role === 'owner') {
        navigate('/owner-dashboard');
    } else {
        navigate('/vendor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between sticky top-0 bg-inherit z-30">
        <button 
          onClick={() => navigate(-1)} 
          className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#C44545]">Expert Details</span>
            <span className="text-[13px] font-bold text-slate-900 tracking-tight">Final Step</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 overflow-y-auto hide-scrollbar">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-sm mx-auto"
        >
          <div className="mb-8 px-2 pt-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">About You.</h1>
            <p className="text-[15px] font-bold text-neutral-600">Enter your details to complete your professional profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Personal Information</span>
                <div className="space-y-3">
                    <div className="bg-white border border-black/[0.03] rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                        <User size={18} className="text-[#C44545]" strokeWidth={2.5} />
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            className="bg-transparent text-[15px] font-bold text-slate-900 w-full focus:outline-none placeholder:text-neutral-400 capitalize"
                            required
                        />
                    </div>
                    <div className="bg-white border border-black/[0.03] rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                        <Phone size={18} className="text-[#C44545]" strokeWidth={2.5} />
                        <div className="flex items-center">
                            <span className="text-[15px] font-black text-slate-900 mr-2">+91</span>
                            <div className="h-4 w-[1px] bg-slate-200 mr-3" />
                            <input 
                                type="tel" 
                                maxLength={10} 
                                placeholder="Mobile Number" 
                                className="bg-transparent text-[15px] font-bold text-slate-900 w-full focus:outline-none placeholder:text-neutral-400"
                                required
                            />
                        </div>
                    </div>
                    <AnimatePresence>
                        {role === 'driver' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white border border-rose-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm overflow-hidden"
                            >
                                <FileText size={18} className="text-[#C44545]" strokeWidth={2.5} />
                                <input 
                                    type="text" 
                                    placeholder="Driving License Number" 
                                    className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400 uppercase"
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {role === 'driver' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-2 overflow-hidden"
                            >
                                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Vehicle Type</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Car', 'Bus', 'Truck', 'Tempo'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleDriverVehicleType(type)}
                                            className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${driverVehicleTypes.includes(type) ? 'bg-[#C44545] text-white border-[#C44545] shadow-lg shadow-[#C44545]/20' : 'bg-white text-neutral-400 border-neutral-100 shadow-sm'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Permanent / Temporary Preference for Drivers */}
                    <AnimatePresence>
                        {role === 'driver' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-2 overflow-hidden"
                            >
                                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Service Preference</span>
                                <div className="flex gap-3">
                                    {['Permanent', 'Temporary'].map((pref) => (
                                        <button
                                            key={pref}
                                            type="button"
                                            onClick={() => setDrivePreference(pref)}
                                            className={`flex-1 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all border ${drivePreference === pref ? 'bg-[#C44545] text-white border-[#C44545] shadow-lg shadow-[#C44545]/20' : 'bg-white text-neutral-400 border-neutral-100 shadow-sm'}`}
                                        >
                                            {pref}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Owner Specific Fields */}
                    <AnimatePresence>
                        {role === 'owner' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 pt-2 overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Vehicle Type</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Sedan/SUV', 'Luxury', 'Truck/LCV', 'Bus/Tempo'].map(type => (
                                            <button 
                                                key={type} 
                                                type="button" 
                                                onClick={() => setOwnerVehicleType(type)}
                                                className={`py-4 border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${ownerVehicleType === type ? 'bg-[#C44545] text-white border-[#C44545] shadow-lg shadow-[#C44545]/20' : 'border-slate-100 bg-white text-slate-400'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Monthly Salary (Budget)</span>
                                    <div className="bg-white border border-rose-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                                        <span className="text-lg font-black text-[#C44545]">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="e.g. 15000" 
                                            value={ownerSalary}
                                            onChange={(e) => setOwnerSalary(e.target.value)}
                                            className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400"
                                            required={role === 'owner'}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Reporting Address</span>
                                    <div className="bg-white border border-rose-100 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                                        <MapPin size={18} className="text-[#C44545] mt-1" strokeWidth={2.5} />
                                        <textarea 
                                            placeholder="Enter full address where driver should report..." 
                                            className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400 min-h-[80px] resize-none"
                                            required={role === 'owner'}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mechanic Expertise Selection */}
                    <AnimatePresence>
                        {role === 'mechanic' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-2 overflow-hidden"
                            >
                                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Select Your Expertise</span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {mechanicOptions.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleMechanicType(type)}
                                            className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mechanicTypes.includes(type) ? 'bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'bg-white text-neutral-500 border border-black/5 shadow-sm'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest pl-2">You can select multiple specialties</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
                <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Native Languages</span>
                <div className="bg-white border border-rose-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                    <User size={18} className="text-[#C44545]" strokeWidth={2.5} />
                    <input 
                        type="text" 
                        value={nativeLanguages.join(', ')}
                        onChange={(e) => setNativeLanguages(e.target.value.split(',').map(l => l.trim()).filter(l => l !== ''))}
                        placeholder="Enter languages (e.g. Tamil, Marathi, Hindi...)" 
                        className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400"
                    />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                    <span className="w-full text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1 pl-2">Quick Suggestions</span>
                    {languages.map(lang => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${nativeLanguages.includes(lang) ? 'bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'bg-white text-neutral-500 border border-black/5 shadow-sm'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            {/* Operating Locations */}
            <AnimatePresence>
                {role === 'driver' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                    >
                        <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Operating Zone</span>
                        <div className="space-y-3">
                            <div className="bg-white border border-black/[0.03] rounded-3xl p-5 shadow-sm">
                                <select 
                                    value={operatingState}
                                    onChange={(e) => {
                                        setOperatingState(e.target.value);
                                        setOperatingCities([]);
                                    }}
                                    className="w-full bg-transparent text-[15px] font-bold text-slate-900 focus:outline-none"
                                    required
                                >
                                    <option value="">Select Operating State</option>
                                    {Object.keys(citiesMap).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {operatingState && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 pt-2"
                                >
                                    <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Preferred Cities in {operatingState}</span>
                                    <div className="bg-white border border-rose-100 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                                        <MapPin size={18} className="text-[#C44545] mt-1" strokeWidth={2.5} />
                                        <div className="flex-1">
                                            <textarea 
                                                placeholder="Enter specific cities or areas (e.g. Mumbai, Pune, Navi Mumbai...)" 
                                                className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400 min-h-[80px] resize-none"
                                                required
                                            />
                                            <p className="text-[10px] font-bold text-neutral-400 mt-2 uppercase tracking-widest">Separate multiple places with commas</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="w-full text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1 pl-2">Quick Suggestions</span>
                                        {citiesMap[operatingState].map(city => (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => toggleCity(city)}
                                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${operatingCities.includes(city) ? 'bg-[#C44545] text-white shadow-lg shadow-[#C44545]/20' : 'bg-white text-neutral-500 border border-black/5 shadow-sm'}`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                type="submit" 
                className="w-full bg-[#C44545] text-white h-16 rounded-[1.8rem] py-4 font-black uppercase tracking-[0.2em] text-[15px] flex items-center justify-between px-8 active:scale-95 transition-all group shadow-2xl shadow-[#C44545]/20"
            >
              <span>Complete Registration</span>
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#C44545] transition-colors">
                <CheckCircle2 size={20} className="text-white group-hover:text-[#C44545]" strokeWidth={3} />
              </div>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorPersonal;
