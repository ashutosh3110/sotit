import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    MapPin, 
    Navigation, 
    Star, 
    Filter, 
    Bell, 
    Clock, 
    ShieldCheck, 
    Wrench, 
    Truck, 
    Briefcase, 
    FileText,
    ChevronRight,
    Zap,
    CheckCircle2,
    ChevronDown,
    Globe,
    X,
    Check,
    Loader2
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../../context/LocationContext";
import { State, City } from "country-state-city";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserFind = () => {
    const navigate = useNavigate();
    const { location: userLoc, fetchLocation } = useLocation();
    const [selectedCategory, setSelectedCategory] = useState('Drivers');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Location States
    const [selectedState, setSelectedState] = useState(null); // Stores { name, isoCode }
    const [selectedDistrict, setSelectedDistrict] = useState('');
    
    // Data States
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI States
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Get all Indian States
    const allStates = useMemo(() => State.getStatesOfCountry('IN'), []);
    
    // Get districts of selected state
    const availableDistricts = useMemo(() => {
        if (!selectedState) return [];
        return City.getCitiesOfState('IN', selectedState.isoCode);
    }, [selectedState]);

    const categories = [
        { id: 'Drivers', icon: <Navigation size={18} />, placeholder: 'Search drivers nearby...' },
        { id: 'Mechanics', icon: <Wrench size={18} />, placeholder: 'Search expert mechanics...' },
        { id: 'Towing', icon: <Truck size={18} />, placeholder: 'Search towing service...' },
        { id: 'Legal', icon: <Briefcase size={18} />, placeholder: 'Search legal advisors...' },
        { id: 'RTO', icon: <FileText size={18} />, placeholder: 'Search RTO agents...' }
    ];

    // Fetch Vendors from Backend
    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('role', selectedCategory);
            if (selectedState) params.append('state', selectedState.name);
            if (selectedDistrict) params.append('district', selectedDistrict);

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/all?${params.toString()}`);
            if (response.data.success) {
                setVendors(response.data.vendors);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast.error("Failed to load experts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [selectedCategory, selectedState, selectedDistrict]);

    // Local Search Filtering
    const filteredVendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowStateDropdown(false);
                setShowDistrictDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getPlaceholder = () => {
        return categories.find(c => c.id === selectedCategory)?.placeholder || "Search...";
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-inter pb-32 overflow-x-hidden">
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={fetchLocation}
                        className="flex flex-col text-left active:opacity-70 transition-opacity"
                    >
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={12} className="text-[#C44545]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Current Location</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none truncate max-w-[150px]">
                                {userLoc?.shortAddress || 'Detecting...'}
                            </h2>
                            <ChevronRight size={14} className="text-slate-300" />
                        </div>
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-slate-100">
                            <Bell size={18} />
                        </button>
                        <div className="h-10 w-10 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                            <img src="https://i.pravatar.cc/150?u=user1" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Experts near you.</h1>
                    {isLoading && <Loader2 className="animate-spin text-[#C44545]" size={18} />}
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="px-6 mt-6">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C44545] transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder={getPlaceholder()}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all shadow-xl shadow-slate-200/40"
                    />
                </div>
            </div>

            {/* CUSTOM LOCATION FILTERS */}
            <div className="px-6 mt-6 grid grid-cols-2 gap-4 relative" ref={dropdownRef}>
                {/* State Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowStateDropdown(!showStateDropdown);
                            setShowDistrictDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between bg-white border ${showStateDropdown ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-100'} rounded-2xl py-4 px-5 transition-all shadow-sm group`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Globe size={16} className={showStateDropdown ? 'text-[#C44545]' : 'text-slate-400'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedState ? 'text-slate-900' : 'text-slate-400'}`}>
                                {selectedState?.name || 'All States'}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showStateDropdown ? 'rotate-180 text-[#C44545]' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showStateDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
                            >
                                <div className="p-2 space-y-1">
                                    <button 
                                        onClick={() => { setSelectedState(null); setSelectedDistrict(''); setShowStateDropdown(false); }}
                                        className="w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between"
                                    >
                                        All States
                                        {!selectedState && <Check size={14} className="text-[#C44545]" />}
                                    </button>
                                    {allStates.map((state) => (
                                        <button 
                                            key={state.isoCode}
                                            onClick={() => { setSelectedState(state); setSelectedDistrict(''); setShowStateDropdown(false); }}
                                            className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${selectedState?.isoCode === state.isoCode ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {state.name}
                                            {selectedState?.isoCode === state.isoCode && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* District Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            if (!selectedState) return;
                            setShowDistrictDropdown(!showDistrictDropdown);
                            setShowStateDropdown(false);
                        }}
                        disabled={!selectedState}
                        className={`w-full flex items-center justify-between bg-white border ${showDistrictDropdown ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-100'} rounded-2xl py-4 px-5 transition-all shadow-sm disabled:opacity-50 group`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MapPin size={16} className={showDistrictDropdown ? 'text-[#C44545]' : 'text-slate-400'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedDistrict ? 'text-slate-900' : 'text-slate-400'}`}>
                                {selectedDistrict || 'All Districts'}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showDistrictDropdown ? 'rotate-180 text-[#C44545]' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showDistrictDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
                            >
                                <div className="p-2 space-y-1">
                                    <button 
                                        onClick={() => { setSelectedDistrict(''); setShowDistrictDropdown(false); }}
                                        className="w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between"
                                    >
                                        All Districts
                                        {!selectedDistrict && <Check size={14} className="text-[#C44545]" />}
                                    </button>
                                    {availableDistricts.map((city) => (
                                        <button 
                                            key={city.name}
                                            onClick={() => { setSelectedDistrict(city.name); setShowDistrictDropdown(false); }}
                                            className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${selectedDistrict === city.name ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {city.name}
                                            {selectedDistrict === city.name && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CATEGORY SECTION */}
            <div className="mt-8">
                <div className="flex items-center gap-3 px-6 overflow-x-auto no-scrollbar pb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                selectedCategory === cat.id 
                                ? 'bg-[#C44545] text-white shadow-xl shadow-[#C44545]/20 scale-105' 
                                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            {cat.icon}
                            {cat.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN VENDOR LIST */}
            <div className="px-6 space-y-5 mt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory + (selectedState?.isoCode || '') + selectedDistrict + isLoading}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                    >
                        {!isLoading ? filteredVendors.map((vendor) => (
                            <div key={vendor._id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-2xl shadow-slate-200/50 group hover:border-[#C44545]/30 transition-all relative overflow-hidden">
                                <div className="flex items-start gap-5">
                                    {/* Profile Image & Status */}
                                    <div className="relative">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] overflow-hidden border-2 border-white shadow-lg relative z-10 bg-slate-50 flex items-center justify-center">
                                            {vendor.profileImage?.url ? (
                                                <img src={vendor.profileImage.url} className="h-full w-full object-cover" alt={vendor.name} />
                                            ) : (
                                                <span className="text-xl font-black text-slate-300 uppercase">{vendor.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 ${vendor.isOnline ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full border-4 border-white z-20 shadow-md`} />
                                    </div>

                                    {/* Vendor Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">{vendor.name}</h3>
                                                {vendor.status === 'approved' && <ShieldCheck size={16} className="text-blue-500" />}
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs font-black text-slate-900">{vendor.rating || '4.0'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Navigation size={14} className="text-[#C44545]" />
                                                <span className="text-xs font-bold truncate max-w-[150px]">
                                                    {vendor.address?.city}, {vendor.address?.state}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock size={14} />
                                                <span className="text-xs font-bold uppercase tracking-widest">{vendor.isOnline ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </div>

                                        {/* Dynamic Role Tags */}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <span className="px-3 py-1.5 bg-rose-50 text-[#C44545] rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 capitalize">
                                                {vendor.role} Expert
                                            </span>
                                            {vendor.totalReviews > 0 && (
                                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                    {vendor.totalReviews} Reviews
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-50">
                                    <button className="py-4 bg-slate-100 text-slate-900 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                                        View Profile
                                    </button>
                                    <button 
                                        className={`py-4 bg-[#C44545] shadow-[#C44545]/20 text-white rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2`}
                                    >
                                        {vendor.role === 'towing' ? 'Emergency SOS' : 
                                         vendor.role === 'driver' ? 'Hire Driver' : 
                                         vendor.role === 'mechanic' ? 'Request Fix' : 'Hire Expert'}
                                    </button>
                                </div>
                            </div>
                        )) : (
                            // SKELETON LOADING
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 animate-pulse">
                                    <div className="flex gap-5">
                                        <div className="h-20 w-20 bg-slate-100 rounded-[2rem]" />
                                        <div className="flex-1 space-y-4">
                                            <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                                            <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                                            <div className="flex gap-2">
                                                <div className="h-6 bg-slate-100 rounded-xl w-20" />
                                                <div className="h-6 bg-slate-100 rounded-xl w-24" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {!isLoading && filteredVendors.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 border-4 border-white shadow-xl">
                                    <Search size={48} strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No experts found.</h3>
                                <p className="text-slate-400 text-sm mt-2 font-medium">Try adjusting your filters or selecting another location.</p>
                                <button 
                                    onClick={() => {
                                        setSelectedState(null);
                                        setSelectedDistrict('');
                                        setSearchQuery('');
                                    }}
                                    className="mt-6 px-8 py-3 bg-[#C44545] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#C44545]/20"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserFind;

