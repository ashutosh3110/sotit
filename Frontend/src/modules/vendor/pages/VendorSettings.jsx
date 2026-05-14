import { User, Shield, Briefcase, FileText, Settings, LogOut, ChevronRight, Moon, HelpCircle, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVendorData, logoutVendor, setVendorData } from "../utils/vendorStore";
import OfflineOverlay from "../../../shared/components/OfflineOverlay";

const VendorSettings = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(getVendorData() || { profile: {} });
  const [isOnline, setIsOnline] = useState(vendor.profile.isOnline !== false);

  useEffect(() => {
    const handleUpdate = () => {
        const newData = getVendorData();
        setVendor(newData);
        setIsOnline(newData.profile.isOnline !== false);
    };
    window.addEventListener('vendor_data_updated', handleUpdate);
    return () => window.removeEventListener('vendor_data_updated', handleUpdate);
  }, []);

  const handleToggleOnline = async () => {
    const vendorId = vendor.profile.id || vendor.profile._id;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/${vendorId}/toggle-status`, {
            method: 'PUT'
        });
        const data = await response.json();
        if (response.ok) {
            const updatedStore = getVendorData();
            updatedStore.profile.isOnline = data.isOnline;
            setVendorData(updatedStore);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleLogout = () => {
    logoutVendor();
    navigate('/');
  };

  return (
    <div className={`min-h-screen pb-24 font-inter transition-colors duration-500 ${isOnline ? 'bg-neutral-50' : 'bg-slate-50'}`}>
      <OfflineOverlay isOnline={isOnline} onToggle={handleToggleOnline} />

      <div className={`transition-all duration-700 ${!isOnline ? 'blur-md grayscale pointer-events-none' : ''}`}>
          <div className={`px-6 pt-10 pb-10 flex items-center gap-5 sticky top-0 z-10 shadow-2xl rounded-b-[3rem] transition-all duration-700 ${isOnline ? 'bg-[#C44545] shadow-[#C44545]/20 text-white' : 'bg-slate-800 shadow-slate-900/40 text-slate-400'}`}>
             <div className="h-16 w-16 bg-white rounded-[2rem] flex items-center justify-center text-[#C44545] font-black text-xl shadow-xl border-4 border-white/20">
                {vendor.profile.name?.[0] || 'SG'}
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                    <h1 className="text-xl font-black tracking-tighter leading-none uppercase">{vendor.profile.name}</h1>
                    {!isOnline && <Moon size={14} className="text-slate-500" />}
                </div>
                <span className="text-[11px] font-bold opacity-50 uppercase tracking-widest leading-none">ID: VND-{vendor.profile.id?.slice(-6).toUpperCase() || 'XXXXXX'}</span>
                <div className={`flex items-center gap-1.5 mt-2.5 w-auto self-start px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md shadow-sm transition-all ${isOnline ? 'bg-white/10 text-white border-white/10' : 'bg-slate-700/50 text-slate-500 border-slate-700'}`}>
                   <Shield size={10} className={isOnline ? 'fill-white' : 'fill-slate-500'} /> KYC Verified
                </div>
             </div>
          </div>

          <div className="px-6 py-10 space-y-12">
             <section>
                <h3 className="text-[11px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-6 pl-1 border-l-4 border-[#C44545] flex items-center">Management Console</h3>
                <div className="bg-white border text-sm font-bold border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/[0.02]">
                   <Link to="/vendor/profile" className="flex items-center justify-between p-6 border-b border-slate-50 active:bg-neutral-50 transition-colors group">
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] shadow-inner"><User size={20} strokeWidth={2.5} /></div>
                         <span className="text-slate-700">My Profile</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" strokeWidth={3} />
                   </Link>
                   <Link to="/vendor/roles" className="flex items-center justify-between p-6 border-b border-slate-50 active:bg-neutral-50 transition-colors group">
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] shadow-inner"><Briefcase size={20} strokeWidth={2.5} /></div>
                         <span className="text-slate-700">Service Roles</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" strokeWidth={3} />
                   </Link>
                   <Link to="/vendor/kyc" className="flex items-center justify-between p-6 border-b border-slate-50 active:bg-neutral-50 transition-colors group">
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] shadow-inner"><FileText size={20} strokeWidth={2.5} /></div>
                         <span className="text-slate-700">KYC Documents</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" strokeWidth={3} />
                   </Link>
                   <Link to="/vendor/support" className="flex items-center justify-between p-6 active:bg-neutral-50 transition-colors group">
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] shadow-inner"><HelpCircle size={20} strokeWidth={2.5} /></div>
                         <span className="text-slate-700">Help & Support</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" strokeWidth={3} />
                   </Link>
                </div>
             </section>

             <section>
                <h3 className="text-[11px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-6 pl-1 border-l-4 border-[#C44545] flex items-center">Security & Session</h3>
                <div className="bg-white border text-sm font-bold border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/[0.02]">
                   <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-6 text-rose-500 hover:bg-rose-50 transition-colors group"
                   >
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shadow-inner"><LogOut size={20} strokeWidth={3} /></div>
                         <span className="font-black uppercase tracking-[0.2em] text-[11px]">Logout Session</span>
                      </div>
                      <ChevronRight size={16} className="text-rose-200" strokeWidth={3} />
                   </button>
                </div>
             </section>
          </div>
      </div>
    </div>
  );
};

export default VendorSettings;
