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
    navigate('/auth?tab=vendor');
  };

  return (
    <div className={`min-h-screen pb-24 font-inter transition-colors duration-500 ${isOnline ? 'bg-neutral-50' : 'bg-slate-50'}`}>
      <OfflineOverlay isOnline={isOnline} onToggle={handleToggleOnline} />

      <div className={`transition-all duration-700 ${!isOnline ? 'blur-md grayscale pointer-events-none' : ''}`}>


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
