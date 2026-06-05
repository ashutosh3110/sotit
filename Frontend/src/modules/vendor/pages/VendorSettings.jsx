import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Briefcase, FileText, Settings, LogOut, ChevronRight, Moon, HelpCircle, Wallet, Trash2, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVendorData, logoutVendor, setVendorData } from "../utils/vendorStore";
import OfflineOverlay from "../../../shared/components/OfflineOverlay";
import toast from "react-hot-toast";
import axios from "axios";

const VendorSettings = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(getVendorData() || { profile: {} });
  const [isOnline, setIsOnline] = useState(vendor.profile.isOnline !== false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    try {
        setIsDeleting(true);
        const token = vendor?.token;
        if (!token) throw new Error("Authentication error");

        await axios.delete(`${import.meta.env.VITE_API_URL}/vendors/delete-account`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success("Account deleted successfully");
        setTimeout(() => {
            logoutVendor();
            navigate('/auth?tab=vendor');
        }, 1000);
    } catch (error) {
        console.error("Delete account error:", error);
        toast.error(error.response?.data?.message || "Failed to delete account");
        setIsDeleting(false);
        setShowDeleteModal(false);
    }
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
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-between p-6 border-b border-slate-50 text-red-500 hover:bg-red-50 transition-colors group"
                   >
                      <div className="flex items-center gap-5">
                         <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shadow-inner"><Trash2 size={20} strokeWidth={3} /></div>
                         <span className="font-black uppercase tracking-[0.2em] text-[11px]">Delete Account</span>
                      </div>
                      <ChevronRight size={16} className="text-red-200" strokeWidth={3} />
                   </button>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
          {showDeleteModal && (
              <>
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                      onClick={() => !isDeleting && setShowDeleteModal(false)}
                  />
                  <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="fixed left-6 right-6 top-[30%] z-[101] bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-red-100 dark:border-red-900/30"
                  >
                      <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 flex items-center justify-center mb-6">
                              <AlertTriangle size={32} strokeWidth={2.5} />
                          </div>
                          <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2">
                              Delete Account?
                          </h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-4">
                              This action cannot be undone. All your data, history, and active jobs will be permanently removed.
                          </p>
                          <div className="flex flex-col gap-3 w-full">
                              <button
                                  onClick={handleDeleteAccount}
                                  disabled={isDeleting}
                                  className="w-full h-14 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-colors flex items-center justify-center gap-2"
                              >
                                  {isDeleting ? (
                                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                      "Yes, Delete My Account"
                                  )}
                              </button>
                              <button
                                  onClick={() => setShowDeleteModal(false)}
                                  disabled={isDeleting}
                                  className="w-full h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-colors"
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                  </motion.div>
              </>
          )}
      </AnimatePresence>
    </div>
  );
};

export default VendorSettings;
