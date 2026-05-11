import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, ArrowLeft, Camera, Check, Loader2, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, setUserData } from "../utils/userStore";
import toast from "react-hot-toast";

const UserPersonalInfo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUserData());
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: ''
    });

    // Load data from store/backend on mount
    useEffect(() => {
        if (user) {
            const profile = user.profile || user.user || {};
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                mobile: profile.mobile || '',
                address: profile.location || ''
            });
        }
    }, [user]);

    const handleLiveLocation = () => {
        if (!navigator.geolocation) {
            return toast.error("Geolocation not supported");
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                        toast.success("Location detected!");
                    }
                } catch (err) {
                    toast.error("Reverse geocoding failed");
                } finally {
                    setLocating(false);
                }
            },
            () => {
                toast.error("Permission denied");
                setLocating(false);
            }
        );
    };

    const handleSave = async () => {
        if (!formData.name) return toast.error("Name is required");
        
        setLoading(true);
        try {
            const token = user?.token;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    location: formData.address
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage
                const updatedUser = { 
                    ...user, 
                    profile: { ...user.profile, ...data.user },
                    user: { ...user.user, ...data.user } 
                };
                setUserData(updatedUser);
                toast.success("Profile updated!");
                setTimeout(() => navigate('/user/profile'), 1500);
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-28 font-inter text-slate-900">
            {/* Minimalist Header */}
            <div className="px-6 pt-10 pb-6 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-800 border border-slate-100 active:scale-90 transition-transform">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-black tracking-tighter">Edit Profile.</h1>
            </div>

            <div className="px-6 flex flex-col items-center">
                {/* Centered Profile Image Section */}
                <div className="mt-4 mb-10 relative">
                    <div className="h-28 w-28 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] text-4xl font-black shadow-2xl shadow-[#C44545]/10 border-4 border-white overflow-hidden">
                        {formData.name?.[0] || 'U'}
                    </div>
                    <button className="absolute -bottom-1 -right-1 h-9 w-9 bg-slate-900 text-white rounded-xl border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                        <Camera size={14} />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-6 text-left">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] block ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[#C44545] transition-colors">
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] block ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[#C44545] transition-colors">
                                <Mail size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] block ml-1">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[#C44545] transition-colors">
                                <Phone size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="tel" 
                                value={formData.mobile}
                                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Service Address</label>
                            <button 
                                onClick={handleLiveLocation}
                                disabled={locating}
                                className="text-[10px] font-black text-[#C44545] uppercase tracking-widest flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 active:scale-95 transition-all shadow-sm"
                            >
                                {locating ? <Loader2 size={10} className="animate-spin" /> : <Target size={10} />}
                                Use Live
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute top-5 left-5 pointer-events-none group-focus-within:text-[#C44545] transition-colors">
                                <MapPin size={18} strokeWidth={2.5} />
                            </div>
                            <textarea 
                                rows="3"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all resize-none"
                                placeholder="Complete residence address"
                            />
                        </div>
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl mt-10 flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-[0.25em] active:scale-95 transition-all shadow-2xl shadow-black/20"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Update Details</>}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default UserPersonalInfo;
