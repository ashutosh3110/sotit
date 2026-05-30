import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Wallet, ChevronRight, Settings, LogOut, Star, Bell, Lock, HelpCircle, ArrowLeft, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserData, logoutUser } from "../utils/userStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUserData() || { profile: { name: "Guest" }, wallet: 0 });
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const handleUpdate = () => setUser(getUserData());
        window.addEventListener('user_data_updated', handleUpdate);
        return () => window.removeEventListener('user_data_updated', handleUpdate);
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        toast.success(`${!isDarkMode ? 'Dark' : 'Light'} Mode Enabled`);
    };

    const MenuButton = ({ icon: Icon, label, sublabel, onClick, color = "text-[#C44545]", bg = "bg-white", isLast = false, isDark = false }) => (
        <>
            <button 
                onClick={onClick}
                className={`w-full flex items-center justify-between p-5 transition-colors group ${isDark ? 'active:bg-slate-800' : 'active:bg-rose-50'}`}
            >
                <div className="flex items-center gap-5">
                    <div className={`h-11 w-11 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner group-active:scale-90 transition-transform border ${isDark ? 'border-slate-700' : 'border-rose-100/50'}`}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className={`text-[14px] font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{label}</span>
                        {sublabel && <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sublabel}</span>}
                    </div>
                </div>
                <ChevronRight size={16} className={`${isDark ? 'text-slate-700' : 'text-slate-300'} group-hover:text-[#C44545] transition-colors`} strokeWidth={3} />
            </button>
            {!isLast && <div className={`mx-6 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-50'}`} />}
        </>
    );

    return (
        <div className={`min-h-screen pb-28 font-inter transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-neutral-50'}`}>
            {/* Header */}
            <div className="bg-[#C44545] px-6 pt-10 pb-12 flex items-center justify-between shadow-2xl shadow-[#C44545]/20 rounded-b-[3.5rem]">
                <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    <div
                        className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-white/30 flex items-center justify-center bg-white/20 text-white text-xl font-black flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate('/user/profile/edit')}
                    >
                        {(user?.profile?.profilePicture?.url || user?.user?.profilePicture?.url) ? (
                            <img
                                src={user?.profile?.profilePicture?.url || user?.user?.profilePicture?.url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (user?.profile?.name || user?.user?.name || 'U')[0].toUpperCase()
                        )}
                    </div>
                    <div>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Welcome back</p>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-tight">
                            {user?.profile?.name || user?.user?.name || 'My Account'}.
                        </h1>
                    </div>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="h-12 w-12 bg-white/15 rounded-[1.4rem] flex items-center justify-center border border-white/10 backdrop-blur-md active:scale-90 transition-transform text-white"
                >
                    {isDarkMode ? <Sun size={20} className="fill-white" /> : <Moon size={20} />}
                </button>
            </div>

            <div className="px-6 pt-10 pb-6">
                {/* Menu box centered vertically with margin */}
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[3rem] overflow-hidden shadow-2xl shadow-black/[0.03] mb-10 transition-colors duration-500`}>
                    <MenuButton 
                        icon={User} 
                        label="Personal Details" 
                        sublabel="Edit Info & Address" 
                        onClick={() => navigate('/user/profile/edit')}
                        color={isDarkMode ? 'text-rose-400' : 'text-[#C44545]'}
                        bg={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                        isDark={isDarkMode}
                    />
                    <MenuButton 
                        icon={Star} 
                        label="Rated Experts" 
                        sublabel="Your Feedback" 
                        onClick={() => navigate('/user/reviews')}
                        color={isDarkMode ? 'text-rose-400' : 'text-[#C44545]'}
                        bg={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                        isDark={isDarkMode}
                    />
                    <MenuButton 
                        icon={HelpCircle} 
                        label="Help & Support" 
                        sublabel="Get Assistance" 
                        isLast={true}
                        onClick={() => navigate('/user/support')}
                        color={isDarkMode ? 'text-rose-400' : 'text-[#C44545]'}
                        bg={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                        isDark={isDarkMode}
                    />
                </div>

                {/* Unified Logout Button */}
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        toast.success("Logged out successfully");
                        setTimeout(() => logoutUser(), 1000);
                    }}
                    className={`w-full h-16 rounded-[2rem] border flex items-center justify-center gap-4 font-black uppercase text-[11px] tracking-[0.3em] active:scale-95 transition-all shadow-xl ${
                        isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-rose-400 shadow-black/20' 
                        : 'bg-rose-50 border-rose-100 text-[#C44545] shadow-[#C44545]/5'
                    }`}
                >
                    <LogOut size={16} strokeWidth={3} />
                    Logout Session
                </motion.button>
            </div>
        </div>
    );
};

export default UserProfile;
