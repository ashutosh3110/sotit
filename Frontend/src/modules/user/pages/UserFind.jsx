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
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // UI States
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showRequirementModal, setShowRequirementModal] = useState(false);
    const dropdownRef = useRef(null);

    const handlePostRequirement = async (details) => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const token = userData?.profile?.token;

        if (!token) {
            toast.error("Please login to post a requirement");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/services/hire`,
                { 
                    role: selectedCategory.toLowerCase().replace(/s$/, ''), // convert Drivers -> driver
                    details 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Requirement broadcasted to all experts!");
                setShowRequirementModal(false);
            }
        } catch (error) {
            console.error("Post Error:", error);
            toast.error(error.response?.data?.message || "Failed to post requirement");
        }
    };

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

    // Fetch User Profile for Subscription Check
    const fetchUserProfile = async () => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const token = userData?.profile?.token;
        if (!token) return;

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/services/profile-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(response.data.user);
        } catch (err) {
            console.error("Profile Fetch Error:", err);
        }
    };

    // Fetch Vendors from Backend
    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user_data'));
            const token = userData?.profile?.token;

            const params = new URLSearchParams();
            if (selectedCategory) params.append('role', selectedCategory);
            if (selectedState) params.append('state', selectedState.name);
            if (selectedDistrict) params.append('district', selectedDistrict);

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/all?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
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

    // --- Subscription Logic ---
    const handleSubscribe = async (planType) => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const token = userData?.profile?.token;

        if (!token) {
            toast.error("Please login first");
            navigate('/login');
            return;
        }

        const tid = toast.loading(`Initiating ${planType} Plan...`);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/subscriptions/create-order`,
                { planType },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.dismiss(tid);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: `Sootit ${planType}`,
                description: `${planType} Membership Access`,
                order_id: data.order.id,
                handler: async (response) => {
                    const vtid = toast.loading("Activating Access...");
                    try {
                        const verifyRes = await axios.post(
                            `${import.meta.env.VITE_API_URL}/subscriptions/verify-payment`,
                            { ...response, planType },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (verifyRes.data.success) {
                            toast.success("Access Activated! All details unlocked.", { id: vtid });
                            fetchUserProfile();
                            fetchVendors();
                        }
                    } catch (err) {
                        toast.error("Activation failed", { id: vtid });
                    }
                },
                prefill: { name: userData.profile.name, contact: userData.profile.mobile },
                theme: { color: "#C44545" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Process failed", { id: tid });
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [selectedCategory, selectedState, selectedDistrict]);

    // Fetch Full Profile for Modal
    const handleViewProfile = async (vendorId) => {
        setIsFetchingProfile(true);
        setShowProfileModal(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/profile/${vendorId}`);
            setSelectedVendor(response.data);
        } catch (error) {
            console.error("Error fetching vendor profile:", error);
            toast.error("Failed to load expert details");
            setShowProfileModal(false);
        } finally {
            setIsFetchingProfile(false);
        }
    };

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

    // --- Profile Modal Component ---
    const VendorProfileModal = () => {
        if (!showProfileModal) return null;
        
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowProfileModal(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
                    >
                        {/* Drag Handle for Mobile */}
                        <div className="h-1.5 w-12 bg-slate-200 rounded-full mx-auto mt-4 sm:hidden" />

                        {isFetchingProfile ? (
                            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                                <Loader2 size={32} className="animate-spin text-[#C44545]" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Profile...</span>
                            </div>
                        ) : selectedVendor && (
                            <>
                                <div className="p-8 overflow-y-auto no-scrollbar">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-24 w-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50">
                                                {selectedVendor.profileImage?.url ? (
                                                    <img src={selectedVendor.profileImage.url} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-3xl font-black text-slate-200 uppercase">
                                                        {selectedVendor.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedVendor.name}</h2>
                                                    {selectedVendor.status === 'approved' && <ShieldCheck size={20} className="text-blue-500" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-rose-50 text-[#C44545] rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                                                        {selectedVendor.role} Expert
                                                    </span>
                                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-black">
                                                        <Star size={10} className="fill-emerald-600" />
                                                        {selectedVendor.rating || '4.0'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowProfileModal(false)}
                                            className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Experience</p>
                                            <p className="text-sm font-black text-slate-900">
                                                {selectedVendor.professionalDetails?.experience || 
                                                 selectedVendor.mechanicDetails?.experienceRange || 
                                                 selectedVendor.rtoDetails?.experience || 
                                                 selectedVendor.legalDetails?.experience || '1-3 Years'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Verified</p>
                                            <p className="text-sm font-black text-emerald-600">Yes</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Reviews</p>
                                            <p className="text-sm font-black text-slate-900">{selectedVendor.totalReviews || '0'}</p>
                                        </div>
                                    </div>

                                    {/* Languages Known Section */}
                                    {selectedVendor.professionalDetails?.languages?.length > 0 && (
                                        <div className="mb-8 px-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Globe size={14} className="text-[#C44545]" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Languages Known</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedVendor.professionalDetails.languages.map(lang => (
                                                    <span key={lang} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-600 shadow-sm uppercase">{lang}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {selectedVendor.role === 'driver' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C44545] mb-2">Driving Expertise</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedVendor.professionalDetails?.vehicleClasses?.map(v => (
                                                            <span key={v} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{v}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C44545] mb-2">Operational Areas</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedVendor.professionalDetails?.serviceDistricts?.map(d => (
                                                            <span key={d} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-tight">{d}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedVendor.role === 'mechanic' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C44545] mb-2">Mechanic Specialties</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedVendor.mechanicDetails?.specialties?.map(s => (
                                                            <span key={s} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock size={14} className="text-blue-500" />
                                                        <h5 className="text-[10px] font-black uppercase text-blue-600">Garage Info</h5>
                                                    </div>
                                                    <p className="text-xs font-bold text-blue-900">{selectedVendor.mechanicDetails?.garageName}</p>
                                                    <p className="text-[10px] font-bold text-blue-700/70 mt-1">{selectedVendor.mechanicDetails?.garageAddress}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C44545] mb-2">Member Since</h4>
                                            <p className="text-xs font-bold text-slate-500">
                                                {new Date(selectedVendor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 pt-0 mt-auto">
                                    <button 
                                        onClick={() => handleHireExpert(selectedVendor._id, selectedVendor.role)}
                                        className="w-full py-5 bg-[#C44545] text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#C44545]/30 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {selectedVendor.isUnlocked || (['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) && new Date(userProfile.subscription.expiresAt) > new Date()) ? "Connect Now" : "Unlock Contact (₹9)"}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    };

    // Handle Hiring/Unlocking Expert with Razorpay (₹9)
    const handleHireExpert = async (vendorId, role) => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const token = userData?.profile?.token;

        if (!token) {
            toast.error("Please login to unlock contact");
            navigate('/login');
            return;
        }

        const tid = toast.loading("Initiating Unlock...");
        try {
            // 1. Create Order for Single Unlock (₹9)
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/subscriptions/create-order`,
                { planType: 'Single', vendorId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!data.success) throw new Error(data.message);

            toast.dismiss(tid);

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Sootit Expert Unlock",
                description: `Unlock ${role} Contact`,
                order_id: data.order.id,
                handler: async (response) => {
                    const vtid = toast.loading("Verifying...");
                    try {
                        const verifyRes = await axios.post(
                            `${import.meta.env.VITE_API_URL}/subscriptions/verify-payment`,
                            {
                                ...response,
                                planType: 'Single',
                                vendorId
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (verifyRes.data.success) {
                            toast.success("Contact Unlocked!", { id: vtid });
                            setShowProfileModal(false);
                            fetchVendors(); // Refresh list
                        } else {
                            toast.error("Verification failed", { id: vtid });
                        }
                    } catch (err) {
                        toast.error("Verification failed", { id: vtid });
                    }
                },
                prefill: { name: userData.profile.name, contact: userData.profile.mobile },
                theme: { color: "#C44545" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error(error.message || "Unlock failed", { id: tid });
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-inter pb-32 overflow-x-hidden">
            <VendorProfileModal />
            
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Experts near you.</h1>
                    {isLoading && <Loader2 className="animate-spin text-[#C44545]" size={18} />}
                </div>
            </div>

            {/* MEMBERSHIP BANNER */}
            {!['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) || new Date(userProfile.subscription.expiresAt) < new Date() ? (
                <div className="px-6 mt-4">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        {[
                            { type: 'Daily', price: '99', period: 'Day' },
                            { type: 'Monthly', price: '999', period: 'Month' },
                            { type: 'Yearly', price: '9999', period: 'Year' }
                        ].map(plan => (
                            <motion.div 
                                key={plan.type}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleSubscribe(plan.type)}
                                className="min-w-[200px] bg-slate-900 rounded-3xl p-5 relative overflow-hidden group cursor-pointer shadow-xl border border-white/5"
                            >
                                <div className="absolute top-0 right-0 h-20 w-20 bg-[#C44545] rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap size={12} className="text-[#C44545] fill-[#C44545]" />
                                        <span className="text-[8px] font-black text-[#C44545] uppercase tracking-widest">{plan.type} Access</span>
                                    </div>
                                    <h3 className="text-white text-base font-black tracking-tight mb-3">Unlimited Details</h3>
                                    <div className="flex items-end gap-1">
                                        <span className="text-white text-xl font-black">₹{plan.price}</span>
                                        <span className="text-white/40 text-[8px] font-black uppercase mb-1">/ {plan.period}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="px-6 mt-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-5 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sootit {userProfile.subscription.plan}</p>
                            <p className="text-sm font-black text-slate-900 tracking-tight">Unlimited Access Active</p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Valid Until</p>
                            <p className="text-[11px] font-black text-slate-900">{new Date(userProfile.subscription.expiresAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="relative">
                    <button onClick={() => { setShowStateDropdown(!showStateDropdown); setShowDistrictDropdown(false); }} className={`w-full flex items-center justify-between bg-white border ${showStateDropdown ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-100'} rounded-2xl py-4 px-5 shadow-sm group`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Globe size={16} className={showStateDropdown ? 'text-[#C44545]' : 'text-slate-400'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedState ? 'text-slate-900' : 'text-slate-400'}`}>
                                {selectedState?.name || 'All States'}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${showStateDropdown ? 'rotate-180 text-[#C44545]' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {showStateDropdown && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] max-h-64 overflow-y-auto no-scrollbar p-2 space-y-1">
                                <button onClick={() => { setSelectedState(null); setSelectedDistrict(''); setShowStateDropdown(false); }} className="w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 flex items-center justify-between">
                                    All States {!selectedState && <Check size={14} className="text-[#C44545]" />}
                                </button>
                                {allStates.map((state) => (
                                    <button key={state.isoCode} onClick={() => { setSelectedState(state); setSelectedDistrict(''); setShowStateDropdown(false); }} className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${selectedState?.isoCode === state.isoCode ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        {state.name} {selectedState?.isoCode === state.isoCode && <Check size={14} />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="relative">
                    <button onClick={() => selectedState && setShowDistrictDropdown(!showDistrictDropdown)} disabled={!selectedState} className={`w-full flex items-center justify-between bg-white border ${showDistrictDropdown ? 'border-[#C44545] ring-4 ring-[#C44545]/5' : 'border-slate-100'} rounded-2xl py-4 px-5 shadow-sm disabled:opacity-50 group`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MapPin size={16} className={showDistrictDropdown ? 'text-[#C44545]' : 'text-slate-400'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedDistrict ? 'text-slate-900' : 'text-slate-400'}`}>
                                {selectedDistrict || 'All Districts'}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${showDistrictDropdown ? 'rotate-180 text-[#C44545]' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {showDistrictDropdown && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] max-h-64 overflow-y-auto no-scrollbar p-2 space-y-1">
                                <button onClick={() => { setSelectedDistrict(''); setShowDistrictDropdown(false); }} className="w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 flex items-center justify-between">
                                    All Districts {!selectedDistrict && <Check size={14} className="text-[#C44545]" />}
                                </button>
                                {availableDistricts.map((city) => (
                                    <button key={city.name} onClick={() => { setSelectedDistrict(city.name); setShowDistrictDropdown(false); }} className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${selectedDistrict === city.name ? 'bg-rose-50 text-[#C44545]' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        {city.name} {selectedDistrict === city.name && <Check size={14} />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CATEGORY SECTION */}
            <div className="mt-8 overflow-x-auto no-scrollbar px-6 flex gap-3 pb-4">
                {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-[#C44545] text-white shadow-xl shadow-[#C44545]/20 scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}>
                        {cat.icon} {cat.id}
                    </button>
                ))}
            </div>

            {/* MAIN VENDOR LIST */}
            <div className="px-6 space-y-5 mt-6">
                <AnimatePresence mode="wait">
                    <motion.div key={selectedCategory + (selectedState?.isoCode || '') + selectedDistrict + isLoading} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                        {!isLoading ? filteredVendors.map((vendor) => (
                            <div key={vendor._id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-2xl shadow-slate-200/50 group hover:border-[#C44545]/30 relative overflow-hidden transition-all">
                                <div className="flex items-start gap-5">
                                    <div className="relative">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] overflow-hidden border-2 border-white shadow-lg bg-slate-50 flex items-center justify-center">
                                            {vendor.profileImage?.url ? <img src={vendor.profileImage.url} className="h-full w-full object-cover" /> : <span className="text-xl font-black text-slate-300 uppercase">{vendor.name.charAt(0)}</span>}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 ${vendor.isOnline ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full border-4 border-white shadow-md`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">{vendor.name}</h3>
                                                {vendor.status === 'approved' && <ShieldCheck size={16} className="text-blue-500" />}
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs font-black text-slate-900">{vendor.rating || '4.0'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-slate-400">
                                            <div className="flex items-center gap-1.5"><Navigation size={14} className="text-[#C44545]" /><span className="text-xs font-bold">{vendor.address?.city}</span></div>
                                            <div className="flex items-center gap-1.5"><Clock size={14} /><span className="text-xs font-bold uppercase">{vendor.isOnline ? 'Online' : 'Offline'}</span></div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${vendor.isUnlocked || (['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) && new Date(userProfile.subscription.expiresAt) > new Date()) ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                                {vendor.isUnlocked || (['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) && new Date(userProfile.subscription.expiresAt) > new Date()) ? (
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                ) : (
                                                    <Zap size={14} className="text-slate-400" />
                                                )}
                                                <span className={`text-xs font-black tracking-widest ${vendor.isUnlocked || (['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) && new Date(userProfile.subscription.expiresAt) > new Date()) ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                    {vendor.mobile}
                                                </span>
                                            </div>
                                            {!vendor.isUnlocked && !(['Daily', 'Monthly', 'Yearly'].includes(userProfile?.subscription?.plan) && new Date(userProfile.subscription.expiresAt) > new Date()) && (
                                                <span className="text-[9px] font-black uppercase text-[#C44545] tracking-tighter">Pay ₹9 to View Contact</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <span className="px-3 py-1.5 bg-rose-50 text-[#C44545] rounded-xl text-[10px] font-black uppercase border border-rose-100">{vendor.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-50">
                                    <button onClick={() => handleViewProfile(vendor._id)} className="py-4 bg-slate-100 text-slate-900 rounded-[1.2rem] text-[11px] font-black uppercase hover:bg-slate-200 transition-all">View Profile</button>
                                    <button 
                                        onClick={() => handleHireExpert(vendor._id, vendor.role)}
                                        className="py-4 bg-[#C44545] text-white rounded-[1.2rem] text-[11px] font-black uppercase shadow-xl hover:scale-[1.02] transition-all"
                                    >
                                        Hire Expert
                                    </button>
                                </div>
                            </div>
                        )) : Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 animate-pulse h-40" />
                        ))}
                        {!isLoading && filteredVendors.length === 0 && (
                            <div className="py-20 text-center px-10 flex flex-col items-center">
                                <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-xl"><Search size={48} strokeWidth={1} /></div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No experts found.</h3>
                                <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
                                    <button 
                                        onClick={() => setShowRequirementModal(true)}
                                        className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                    >
                                        Post Requirement
                                    </button>
                                    <button onClick={() => { setSelectedState(null); setSelectedDistrict(''); setSearchQuery(''); }} className="w-full px-8 py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <PostRequirementModal 
                isOpen={showRequirementModal} 
                onClose={() => setShowRequirementModal(false)} 
                role={selectedCategory}
                onPost={handlePostRequirement}
            />
        </div>
    );
};

// Requirement Modal Component
const PostRequirementModal = ({ isOpen, onClose, role, onPost }) => {
    const [details, setDetails] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onPost(details);
            setDetails({});
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFields = () => {
        switch(role.toLowerCase()) {
            case 'drivers':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="From Location" icon={<MapPin size={14}/>} placeholder="Pickup city" onChange={v => setDetails({...details, from: v})} />
                            <InputField label="To Location" icon={<Navigation size={14}/>} placeholder="Destination" onChange={v => setDetails({...details, to: v})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Date" icon={<Clock size={14}/>} type="date" onChange={v => setDetails({...details, date: v})} />
                            <InputField label="Time" icon={<Clock size={14}/>} type="time" onChange={v => setDetails({...details, time: v})} />
                        </div>
                        <select onChange={e => setDetails({...details, tripType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-[#C44545]/20">
                            <option value="">Select Trip Type</option>
                            <option value="One-way">One-way</option>
                            <option value="Round-trip">Round-trip</option>
                        </select>
                    </div>
                );
            case 'mechanics':
                return (
                    <div className="space-y-4">
                        <InputField label="Vehicle Type" icon={<Wrench size={14}/>} placeholder="e.g. Maruti Swift, Honda Activa" onChange={v => setDetails({...details, vehicle: v})} />
                        <InputField label="Your Location" icon={<MapPin size={14}/>} placeholder="Area / City" onChange={v => setDetails({...details, location: v})} />
                        <textarea 
                            placeholder="Describe the problem..."
                            onChange={e => setDetails({...details, problem: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-[#C44545]/20 min-h-[100px]"
                        />
                    </div>
                );
            case 'towing':
                return (
                    <div className="space-y-4">
                        <InputField label="Pickup Point" icon={<MapPin size={14}/>} placeholder="Where is the vehicle?" onChange={v => setDetails({...details, pickup: v})} />
                        <InputField label="Drop Point" icon={<Navigation size={14}/>} placeholder="Destination" onChange={v => setDetails({...details, drop: v})} />
                        <InputField label="Vehicle Type" icon={<Truck size={14}/>} placeholder="e.g. Car, Bike, SUV" onChange={v => setDetails({...details, vehicle: v})} />
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <InputField label="Location" icon={<MapPin size={14}/>} placeholder="City / District" onChange={v => setDetails({...details, location: v})} />
                        <textarea 
                            placeholder="Provide details about the service needed..."
                            onChange={e => setDetails({...details, details: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-[#C44545]/20 min-h-[120px]"
                        />
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Post Requirement</h2>
                            <p className="text-[10px] font-black text-[#C44545] uppercase tracking-[0.2em] mt-1">{role} Specialist Needed</p>
                        </div>
                        <button onClick={onClose} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><X size={20}/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderFields()}
                        <button 
                            disabled={isSubmitting}
                            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Posting...' : 'Broadcast Requirement'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const InputField = ({ label, icon, type = "text", placeholder, onChange }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C44545] transition-colors">{icon}</div>
            <input 
                type={type} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-10 pr-4 text-[11px] font-bold focus:outline-none focus:border-[#C44545]/20 transition-all"
            />
        </div>
    </div>
);

export default UserFind;
