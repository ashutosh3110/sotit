import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, setUserData } from "../utils/userStore";
import toast from "react-hot-toast";

const UserPersonalInfo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUserData());
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Profile image states
    const [profileImgPreview, setProfileImgPreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: ''
    });

    // Load data from store/backend on mount - pre-fill from login data
    useEffect(() => {
        if (user) {
            // Data can be at user.profile or user.user (depending on how initUserState was called)
            const profile = user.profile || user.user || {};
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                mobile: profile.mobile || '',
                address: profile.location || ''
            });
            // Pre-load profile picture if exists
            if (profile.profilePicture?.url) {
                setProfileImgPreview(profile.profilePicture.url);
            }
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file");
            return;
        }
        setProfileFile(file);
        setProfileImgPreview(URL.createObjectURL(file));
    };



    const handleSave = async () => {
        if (!formData.name) return toast.error("Name is required");
        
        setLoading(true);
        try {
            // Token can be stored at different locations depending on login time
            const token = user?.token || user?.profile?.token || user?.user?.token;

            // Use FormData to support both text and image upload
            const fd = new FormData();
            fd.append('name', formData.name);
            if (formData.email) fd.append('email', formData.email);
            if (formData.mobile) fd.append('mobile', formData.mobile);
            fd.append('location', formData.address);
            if (profileFile) {
                fd.append('profilePicture', profileFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type manually - browser sets it with boundary for FormData
                },
                body: fd
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage with new profile data
                const updatedUser = { 
                    ...user, 
                    profile: { ...(user.profile || {}), ...data.user },
                    user: { ...(user.user || {}), ...data.user } 
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

    // Get initials for avatar fallback
    const initials = formData.name?.[0]?.toUpperCase() || 'U';

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
                {/* Centered Profile Image Section - Functional */}
                <div className="mt-4 mb-10 relative">
                    <div
                        className="h-28 w-28 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] text-4xl font-black shadow-2xl shadow-[#C44545]/10 border-4 border-white overflow-hidden cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profileImgPreview ? (
                            <img
                                src={profileImgPreview}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-9 w-9 bg-slate-900 text-white rounded-xl border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    >
                        <Camera size={14} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
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
                                placeholder="Your full name"
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
                                placeholder="Email (optional)"
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
                                placeholder="10-digit mobile number"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center px-1">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Service Address</label>
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
