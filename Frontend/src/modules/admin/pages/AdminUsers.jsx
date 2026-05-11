import { motion, AnimatePresence } from "framer-motion";
import { User, ShieldCheck, Mail, Phone, MapPin, Search, Filter, Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import AdminSidebar from "../components/AdminSidebar";

/**
 * Admin Users List Page
 * Displays detailed information about users.
 */
const AdminUsers = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm)
  );

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col">
        {/* Header */}
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-900 border border-black/5 shadow-sm"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <button 
                onClick={() => navigate('/admin')}
                className="hidden lg:flex h-10 w-10 bg-neutral-50 rounded-xl items-center justify-center text-slate-900 border border-black/5 shadow-sm active:scale-90 transition-all"
            >
                <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Management</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Directory Console.</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] font-black text-xs border border-rose-100">
              AD
            </div>
          </div>
        </header>

        <section className="px-6 py-8 flex-1">
            {/* Search Bar */}
            <div className="relative group mb-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={14} className="text-neutral-400 group-focus-within:text-[#C44545] transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search users or providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-[13px] font-bold focus:border-[#C44545]/20 focus:outline-none transition-all placeholder:text-neutral-300 shadow-sm"
                />
            </div>

            {/* Users List */}
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xs font-black text-[#C44545] uppercase tracking-[0.2em]">Platform Members</h2>
                <span className="text-[12px] font-bold text-neutral-500">{filteredUsers.length} total</span>
            </div>

            <div className="space-y-3">
                {filteredUsers.map((user) => (
                    <motion.div 
                        key={user._id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedEntity(user)}
                        className="bg-white py-2 px-4 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-2 hover:border-[#C44545]/20 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-900 border border-black/5 flex-shrink-0">
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-black tracking-tight text-[#C44545] truncate">{user.name}</h3>
                                        <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-md inline-block w-fit ${
                                            user.role === 'customer' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-[#C44545] border border-rose-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex-shrink-0 ${
                                        user.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-neutral-400">
                                    <MapPin size={10} className="flex-shrink-0" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">{user.city || user.currentAddress || 'Location N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
      </div>

      {/* --- Details Modal --- */}
      <AnimatePresence>
          {selectedEntity && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center lg:justify-end p-4 lg:p-10">
                  <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedEntity(null)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                  />
                  <motion.div 
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={{ type: "spring", damping: 30, stiffness: 300 }}
                      className="relative w-full max-w-lg h-[85vh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden shadow-black/20"
                  >
                      {/* Fixed Header */}
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
                          <div>
                              <span className="text-[10px] font-black text-[#C44545] uppercase tracking-[0.2em] mb-1 block">Profile Review</span>
                              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Member Details</h2>
                          </div>
                          <button onClick={() => setSelectedEntity(null)} className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                              <ArrowLeft size={20} className="rotate-180" />
                          </button>
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-8 space-y-8 overflow-x-hidden">
                          {/* Profile Header */}
                          <div className="flex items-center gap-6">
                              <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-[#C44545] font-black text-2xl border-2 border-rose-100 shadow-inner uppercase">
                                  {selectedEntity.name[0]}
                              </div>
                              <div className="space-y-1">
                                  <h3 className="text-xl font-black tracking-tight text-slate-900">{selectedEntity.name}</h3>
                                  <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-1 bg-[#C44545] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                          {selectedEntity.role}
                                      </span>
                                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                                          selectedEntity.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                      }`}>
                                          {selectedEntity.isBlocked ? 'Blocked' : 'Active'}
                                      </span>
                                  </div>
                              </div>
                          </div>

                          {/* Data Grid */}
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100">
                                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Member ID</span>
                                  <p className="text-sm font-bold text-slate-900 break-all">{selectedEntity._id}</p>
                              </div>
                              <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                      <Mail size={18} />
                                  </div>
                                  <div className="flex-1">
                                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Email Address</span>
                                      <p className="text-sm font-bold text-slate-900">{selectedEntity.email || 'Not Provided'}</p>
                                  </div>
                              </div>
                              <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                      <Phone size={18} />
                                  </div>
                                  <div className="flex-1">
                                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Contact Number</span>
                                      <p className="text-sm font-bold text-slate-900">{selectedEntity.mobile || selectedEntity.phone || 'N/A'}</p>
                                  </div>
                              </div>
                              <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-4">
                                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                      <MapPin size={18} />
                                  </div>
                                  <div className="flex-1">
                                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Current Location</span>
                                      <p className="text-sm font-bold text-slate-900">{selectedEntity.city || selectedEntity.currentAddress || 'Location N/A'}</p>
                                  </div>
                              </div>

                              {/* Dynamic Vendor Details */}
                              {selectedEntity.role?.toLowerCase() !== 'customer' && (
                                  <>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100">
                                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Experience</span>
                                              <p className="text-sm font-bold text-slate-900">{selectedEntity.professionalDetails?.experience || 'Not Mentioned'}</p>
                                          </div>
                                          <div className="bg-neutral-50 p-5 rounded-3xl border border-slate-100">
                                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Availability</span>
                                              <p className="text-sm font-bold text-slate-900">{selectedEntity.professionalDetails?.availability || 'N/A'}</p>
                                          </div>
                                      </div>

                                      {/* Settlement Section */}
                                      <div className="bg-rose-50/50 p-6 rounded-[2.5rem] border border-rose-100/50 mt-4">
                                          <h4 className="text-[11px] font-black text-[#C44545] uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                              <ShieldCheck size={14} /> Settlement Details
                                          </h4>
                                          <div className="space-y-3">
                                              <div className="flex justify-between items-center py-2 border-b border-[#C44545]/10">
                                                  <span className="text-[10px] font-black text-neutral-400 uppercase">Bank Name</span>
                                                  <span className="text-xs font-black text-slate-900">{selectedEntity.bankDetails?.bankName || 'N/A'}</span>
                                              </div>
                                              <div className="flex justify-between items-center py-2 border-b border-[#C44545]/10">
                                                  <span className="text-[10px] font-black text-neutral-400 uppercase">Account No.</span>
                                                  <span className="text-xs font-black text-slate-900">{selectedEntity.bankDetails?.accountNumber || 'N/A'}</span>
                                              </div>
                                              <div className="flex justify-between items-center py-2">
                                                  <span className="text-[10px] font-black text-neutral-400 uppercase">IFSC Code</span>
                                                  <span className="text-xs font-black text-slate-900">{selectedEntity.bankDetails?.ifscCode || 'N/A'}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Fixed Footer */}
                      <div className="p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                          <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 active:scale-95 transition-all">
                              Send Message
                          </button>
                          <button className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 transition-all active:scale-95 ${
                              selectedEntity.isBlocked 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                              {selectedEntity.isBlocked ? 'Unblock' : 'Block User'}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
