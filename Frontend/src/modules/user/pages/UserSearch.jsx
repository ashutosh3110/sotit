import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    MapPin, 
    Navigation, 
    Star, 
    ArrowRight, 
    Bell, 
    Wrench, 
    FileText, 
    Truck, 
    Briefcase, 
    Zap, 
    AlertTriangle,
    CheckCircle2,
    Plus,
    ChevronRight,
    Search as SearchIcon
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../../context/LocationContext";

const UserSearch = () => {
    const navigate = useNavigate();
    const { location, fetchLocation } = useLocation();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const categories = [
        { id: 'Drivers', label: "Drivers", sub: "Professional drivers nearby", icon: Navigation, count: 24, clr: "text-rose-500", bg: "bg-rose-50" },
        { id: 'Mechanics', label: "Mechanics", sub: "On-site repair experts", icon: Wrench, count: 12, clr: "text-blue-500", bg: "bg-blue-50" },
        { id: 'Towing', label: "Towing", sub: "24/7 roadside assistance", icon: Truck, count: 5, clr: "text-[#C44545]", bg: "bg-rose-50" },
        { id: 'RTO', label: "RTO Help", sub: "RC & license assistance", icon: FileText, count: 8, clr: "text-emerald-500", bg: "bg-emerald-50" },
        { id: 'Legal', label: "Legal Advisor", sub: "Traffic & accident support", icon: Briefcase, count: 3, clr: "text-indigo-500", bg: "bg-indigo-50" },
    ];

    const smartSuggestions = [
        "Driver near me",
        "Emergency towing",
        "Swift Dzire mechanic",
        "RC transfer help"
    ];

    const trendingSearches = [
        "Expert Driver For Highway",
        "Swift Dzire Service",
        "Need Emergency Towing",
        "RTO Transfer Help"
    ];

    const handleCategoryClick = (id) => {
        // Navigate to Find Experts with pre-selected category
        navigate(`/user/find?category=${id}`);
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-32 font-inter overflow-x-hidden pt-4">
            {/* COMPACT LOCATION & TITLE SECTION */}
            <div className="px-6 pb-6">
                <button 
                    onClick={fetchLocation}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 w-fit mb-4 shadow-sm active:scale-95 transition-all"
                >
                    <MapPin size={12} className="text-[#C44545]" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {location?.shortAddress || 'Detecting Location...'}
                    </span>
                </button>

                <div className="">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">What service do you need today?</h2>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="px-6 mt-2 relative z-20">
                <div className="relative group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-[#C44545]' : 'text-slate-400'}`} size={20} />
                    <input 
                        type="text"
                        placeholder="Search experts or services..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-8 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all shadow-2xl shadow-slate-200/50"
                    />
                </div>

                {/* Smart Suggestions Dropdown */}
                <AnimatePresence>
                    {isFocused && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 10 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden py-4 z-50"
                        >
                            <p className="px-6 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Smart Suggestions</p>
                            {smartSuggestions.map((s, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setQuery(s)}
                                    className="w-full px-6 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <Zap size={14} className="text-[#C44545]" />
                                    {s}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 mt-10 space-y-8">
                {/* EMERGENCY SECTION */}
                <motion.section
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick('Towing')}
                    className="relative bg-gradient-to-br from-rose-600 to-[#C44545] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-200 overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                            <AlertTriangle size={32} className="fill-white text-[#C44545]" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter mb-2">Vehicle Breakdown?</h3>
                        <p className="text-white/80 text-sm font-medium max-w-[200px] leading-relaxed mb-6">Get instant roadside assistance and towing nearby.</p>
                        <button className="bg-white text-[#C44545] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 group-hover:gap-4 transition-all">
                            Emergency Help <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </motion.section>

                {/* NEARBY AVAILABILITY PREVIEW */}
                <section className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 whitespace-nowrap">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">24 Drivers Online</span>
                    </div>
                    <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 whitespace-nowrap">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">12 Mechanics Near You</span>
                    </div>
                    <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 whitespace-nowrap">
                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">5 Trucks Ready</span>
                    </div>
                </section>

                {/* CATEGORY GRID SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Explore Services</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 group cursor-pointer hover:border-[#C44545]/20 transition-all"
                            >
                                <div className={`h-16 w-16 ${cat.bg} ${cat.clr} rounded-[1.8rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    <cat.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1.5">{cat.label}</h4>
                                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Go</span>
                                            <ArrowRight size={14} className="text-[#C44545]" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">{cat.sub}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{cat.count} Available Nearby</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* TRENDING SEARCH SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Trending Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {trendingSearches.map((tag, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleCategoryClick('Drivers')}
                                className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm hover:border-[#C44545] hover:text-[#C44545] transition-all active:scale-95"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* POST REQUIREMENT CTA */}
                <section className="pt-6 pb-10">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-2xl -mr-10 -mb-10" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-12 w-12 bg-[#C44545] rounded-xl flex items-center justify-center mb-4">
                                <Plus size={24} strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-2">Can't find the right expert?</h3>
                            <p className="text-white/60 text-xs font-medium mb-6">Post your specific requirement and let experts reach out to you.</p>
                            <button className="w-full h-14 bg-white text-slate-900 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                                Post Your Requirement
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserSearch;
