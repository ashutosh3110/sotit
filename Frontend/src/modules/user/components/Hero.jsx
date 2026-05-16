import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Navigation, Car, Shield, User, ArrowRight, Star, Wrench, Briefcase, FileText, Truck, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroBanner from "../../../assets/images/hero_banner.png";

const AppHero = ({ user, onServiceSelect, activeRole }) => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchMainBanners = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/banners?type=main`);
                const data = await response.json();
                if (response.ok) setBanners(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMainBanners();
    }, []);

    // Auto-slide logic
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    const services = [
        { icon: Car, label: "Drivers", role: 'driver', color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
        { icon: Wrench, label: "Mechanics", role: 'mechanic', color: "#d97706", bg: "bg-amber-600", text: "text-white", border: "border-amber-700" },
        { icon: Truck, label: "Towing", role: 'towing', color: "#059669", bg: "bg-emerald-800", text: "text-white", border: "border-emerald-900" },
        { icon: FileText, label: "RTO Agent", role: 'rto', color: "#2563eb", bg: "bg-blue-800", text: "text-white", border: "border-blue-900" },
        { icon: Briefcase, label: "Legal Advisor", role: 'legal', color: "#ef4444", bg: "bg-stone-900", text: "text-white", border: "border-stone-800" },
    ];

    return (
        <div className="bg-transparent font-inter">
            {/* Bold Visual Banner / Slider */}
            <div className="px-5 pt-8 pb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-52 w-full bg-neutral-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 group border-4 border-white"
                >
                    <AnimatePresence mode="wait">
                        {banners.length > 0 ? (
                            <motion.img 
                                key={banners[currentIndex]._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                src={banners[currentIndex].imageUrl} 
                                className="absolute inset-0 h-full w-full object-cover"
                                alt="Banner"
                            />
                        ) : (
                            <img src={heroBanner} className="absolute inset-0 h-full w-full object-cover opacity-50" alt="Fallback" />
                        )}
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
                    
                    <div className="relative z-30 h-full flex flex-col justify-center pl-8 pr-4">
                        <span className="text-white/90 text-[9px] font-black uppercase tracking-[0.3em] mb-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">Premium Ecosystem</span>
                        <h2 className="text-3xl font-black text-white leading-[0.9] tracking-tighter mb-3">
                            {banners[currentIndex]?.title || "Professional Vehicle Experts."}
                        </h2>
                        
                        {/* Dot Indicators */}
                        {banners.length > 1 && (
                            <div className="flex gap-1.5 mt-2">
                                {banners.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-[#C44545]' : 'w-2 bg-white/30'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>


            {/* Prime Services List - Vertical Colorful Cards */}
            <div className="px-5 mb-10">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.25em] mb-6 pl-1 border-l-4 border-[#C44545]">Prime Services</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {services.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onServiceSelect(item.role)}
                                className={`group cursor-pointer flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-300 ${activeRole === item.role ? 'bg-[#C44545] border-[#C44545] shadow-2xl shadow-[#C44545]/20' : `${item.bg} ${item.border} hover:shadow-xl hover:shadow-black/5`}`}
                            >
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${activeRole === item.role ? 'bg-white text-[#C44545]' : 'bg-white shadow-sm'}`}>
                                    <item.icon size={26} strokeWidth={2.5} className={activeRole === item.role ? 'text-[#C44545]' : (item.text.includes('white') ? 'text-slate-900' : item.text)} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-black tracking-tighter uppercase leading-none transition-colors ${activeRole === item.role || item.role !== 'driver' ? 'text-white' : 'text-slate-900'}`}>
                                        {item.label}
                                    </h4>
                                </div>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${activeRole === item.role ? 'bg-white/10 text-white rotate-90' : 'bg-white/50 text-slate-400'}`}>
                                    <ArrowRight size={20} strokeWidth={3} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppHero;
