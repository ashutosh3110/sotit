import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Navigation, Car, Shield, User, ArrowRight, Star, Wallet, Wrench, Briefcase, FileText, Truck, Zap, Loader2 } from "lucide-react";
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
                const response = await fetch('http://localhost:5000/api/banners?type=main');
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
        { icon: Car, label: "Drivers", role: 'driver' },
        { icon: Wrench, label: "Mechanics", role: 'mechanic' },
        { icon: Truck, label: "Towing", role: 'towing' },
        { icon: FileText, label: "RTO Help", role: 'rto' },
        { icon: Briefcase, label: "Legal", role: 'legal' },
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

            {/* Search & Services */}
            <div className="px-5 mb-8">
                <div className="relative group mb-8">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search size={18} className="text-[#C44545]" strokeWidth={2.5} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for mechanics, drivers..." 
                        className="w-full bg-white border border-rose-100 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-800 shadow-xl shadow-black/[0.02] focus:outline-none focus:border-[#C44545] focus:ring-4 focus:ring-rose-50 transition-all"
                    />
                </div>

                {/* Prime Services Micro-Scroll */}
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.25em] mb-5 pl-1 border-l-4 border-[#C44545]">Prime Services</h3>
                    <div className="flex overflow-x-auto gap-5 pb-2 hide-scrollbar">
                        {services.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.90 }}
                                onClick={() => onServiceSelect(item.role)}
                                className="flex flex-col items-center gap-3 group cursor-pointer min-w-[70px]"
                            >
                                <div className={`h-16 w-16 rounded-[1.8rem] flex items-center justify-center border transition-all duration-300 ${activeRole === item.role ? 'bg-[#C44545] text-white border-[#C44545] shadow-xl shadow-[#C44545]/30 scale-105' : 'bg-rose-50 text-[#C44545] border-rose-100 shadow-lg shadow-black/[0.02]'}`}>
                                    <item.icon size={22} strokeWidth={2.5} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeRole === item.role ? 'text-[#C44545]' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppHero;
