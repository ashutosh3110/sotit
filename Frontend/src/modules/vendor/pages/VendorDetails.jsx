import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const VendorDetails = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('temp_vendor_role') || 'driver';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license: '',
  });
  const [nativeLanguages, setNativeLanguages] = useState([]);
  const [operatingState, setOperatingState] = useState('');
  const [operatingCities, setOperatingCities] = useState([]);

  const languages = ['Tamil', 'Marathi', 'Hindi', 'English', 'Bengali', 'Gujarati', 'Kannada', 'Telugu'];
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

  const toggleCity = (city) => {
    setOperatingCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('temp_vendor_languages', JSON.stringify(nativeLanguages));
    localStorage.setItem('temp_vendor_state', operatingState);
    localStorage.setItem('temp_vendor_cities', JSON.stringify(operatingCities));
    navigate('/vendor/login');
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
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#C44545]">Final Step</span>
          <span className="text-[13px] font-bold text-slate-900">Step 02 of 02</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 overflow-y-auto hide-scrollbar">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="mb-8 px-2 pt-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3">Expert Details.</h1>
            <p className="text-[15px] font-bold text-neutral-600">Tell us more about your expertise and area of operation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Personal Information</span>
              <div className="space-y-3">
                <div className="bg-white border border-black/[0.03] rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                  <User size={18} className="text-[#C44545]" strokeWidth={2.5} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-transparent text-[15px] font-bold text-slate-900 w-full focus:outline-none placeholder:text-neutral-400"
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

                {role === 'driver' && (
                  <div className="bg-white border border-rose-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                    <FileText size={18} className="text-[#C44545]" strokeWidth={2.5} />
                    <input
                      type="text"
                      placeholder="Driving License Number"
                      className="bg-transparent text-[15px] font-bold text-slate-800 w-full focus:outline-none placeholder:text-neutral-400 uppercase"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {role === 'driver' && (
              <>
                {/* Languages */}
                <div className="space-y-4">
                  <span className="text-[13px] font-black uppercase tracking-widest text-neutral-700 pl-2">Native Languages</span>
                  <div className="flex flex-wrap gap-2">
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
                <div className="space-y-4">
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
                        className="flex flex-wrap gap-2 pt-2"
                      >
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
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            )}

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

export default VendorDetails;
