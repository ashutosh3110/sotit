import { motion, AnimatePresence } from "framer-motion";
import { Bell, MapPin, Search, ChevronDown, User, ShieldCheck, Globe, LogOut, Wallet, X, CheckCircle2, Clock, Zap, AlertCircle, Info } from "lucide-react";
import { useLocation as useRouteLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getUserData } from "../../modules/user/utils/userStore";
import { getVendorData } from "../../modules/vendor/utils/vendorStore";
import { useLocation } from "../../context/LocationContext";
import logo from "../../assets/logo.png";

const AppHeader = () => {
  const routeLocation = useRouteLocation();
  const currentPath = routeLocation.pathname;
  const isVendor = currentPath.startsWith('/vendor');
  const isAdmin = currentPath.startsWith('/admin');

  const { location, fetchLocation } = useLocation();
  const [data, setData] = useState(isVendor ? getVendorData() : getUserData());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!data?.profile?._id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${data.profile._id}`);
      const notes = await response.json();
      if (response.ok) {
        setNotifications(notes);
        setUnreadCount(notes.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [data]);

  useEffect(() => {
    const handleUpdate = () => {
      setData(isVendor ? getVendorData() : getUserData());
    };
    window.addEventListener('user_data_updated', handleUpdate);
    window.addEventListener('vendor_data_updated', handleUpdate);
    
    if (data?.profile?._id) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener('user_data_updated', handleUpdate);
      window.removeEventListener('vendor_data_updated', handleUpdate);
    };
  }, [isVendor, data, fetchNotifications]);

  const markAsRead = async (id) => {
      try {
          await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, { method: 'PUT' });
          fetchNotifications();
      } catch (err) {
          console.error(err);
      }
  };

  const clearAll = async () => {
      if (!data?.profile?._id) return;
      try {
          await fetch(`${import.meta.env.VITE_API_URL}/notifications/${data.profile._id}/clear`, { method: 'DELETE' });
          setNotifications([]);
          setUnreadCount(0);
      } catch (err) {
          console.error(err);
      }
  };

  const getIcon = (type) => {
      switch(type) {
          case 'success': return ShieldCheck;
          case 'warning': return AlertCircle;
          case 'error': return AlertCircle;
          default: return Info;
      }
  };

  // Hide Top Header on Auth & Profile Pages
  const hideHeaderRoutes = ['/', '/vendor/login', '/vendor/register', '/user/login', '/user/register', '/user/profile', '/user/orders', '/user/reviews', '/user/preferences', '/user/history'];
  const shouldHideHeader = hideHeaderRoutes.includes(currentPath) || currentPath.startsWith('/user/category/');
  if (shouldHideHeader) return null;

  return (
    <>
      <motion.header 
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-[#C44545] shadow-lg py-2 px-3 flex items-center justify-between h-20 font-inter"
      >
        <div className="flex items-center gap-3 group">
          <div className="h-14 w-14 overflow-hidden flex items-center justify-center transition-transform active:scale-95">
            <img src={logo} alt="Sootit" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">
                {isAdmin ? 'System' : isVendor ? 'Partner' : 'Current Location'}
            </span>
            <div 
                onClick={() => !isAdmin && fetchLocation()}
                className="flex items-center gap-1 cursor-pointer active:opacity-70 transition-opacity"
            >
              <span className="text-[13px] font-black text-white tracking-tight leading-none">
                {isAdmin ? 'DeepMind' : (location?.shortAddress || 'Detecting...')}
              </span>
              {!isAdmin && <ChevronDown size={12} className="text-white/70" strokeWidth={3} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl cursor-pointer active:scale-90 transition-transform"
          >
            <Bell size={20} className="text-white" strokeWidth={2.5} />
            {unreadCount > 0 && (
                <div className="absolute top-2.5 right-2.5 h-2 w-2 bg-white rounded-full border-2 border-[#C44545]" />
            )}
          </div>
          
          <div className="h-10 w-10 overflow-hidden rounded-2xl border-2 border-rose-100 ring-2 ring-rose-50 shadow-md">
            <img src={`https://i.pravatar.cc/80?u=${isAdmin ? 'admin' : isVendor ? 'vendor' : 'user'}`} alt="P" className="w-full h-full object-cover" />
          </div>
        </div>
      </motion.header>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNotificationsOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-neutral-50/50 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter">Notifications.</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C44545]">{unreadCount} New Updates</p>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 hover:text-slate-900 transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/20">
                {notifications.map((note) => {
                    const Icon = getIcon(note.type);
                    return (
                        <motion.div 
                            key={note._id}
                            onClick={() => !note.isRead && markAsRead(note._id)}
                            className={`p-5 rounded-[2rem] border transition-all cursor-pointer relative ${
                                note.isRead ? 'bg-white/60 border-slate-100' : 'bg-white border-slate-200 shadow-sm border-l-4 border-l-[#C44545]'
                            }`}
                        >
                            <div className="flex gap-4">
                                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                                    note.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    note.type === 'info' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-black leading-tight truncate pr-2 ${note.isRead ? 'text-slate-400' : 'text-slate-900'}`}>{note.title}</h3>
                                        {!note.isRead && <div className="h-2 w-2 bg-[#C44545] rounded-full shrink-0" />}
                                    </div>
                                    <p className={`text-xs font-bold leading-relaxed ${note.isRead ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {note.message}
                                    </p>
                                    <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest mt-2">{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {notifications.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                        <div className="h-20 w-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-[#C44545] mb-4"><Bell size={32} /></div>
                        <h3 className="text-sm font-black text-slate-900 mb-1">No Notifications</h3>
                        <p className="text-xs font-bold text-slate-400">We'll alert you when something important happens.</p>
                    </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 shrink-0">
                <button onClick={clearAll} className="w-full border-2 border-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-rose-50 hover:text-[#C44545] hover:border-rose-100 transition-all active:scale-95">
                    Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppHeader;
