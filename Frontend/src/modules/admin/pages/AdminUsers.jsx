import { motion, AnimatePresence } from "framer-motion";
import { User, ShieldCheck, Mail, Phone, MapPin, Search, Filter, Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

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

  // Disable background scroll when modal is open
  useEffect(() => {
      if (selectedEntity) {
          document.body.style.overflow = 'hidden';
          if (window.lenis) {
              window.lenis.stop();
          }
      } else {
          document.body.style.overflow = 'unset';
          if (window.lenis) {
              window.lenis.start();
          }
      }
      return () => {
          document.body.style.overflow = 'unset';
          if (window.lenis) {
              window.lenis.start();
          }
      };
  }, [selectedEntity]);

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
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Customer Directory.</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] font-black text-xs border border-rose-100">
              AD
            </div>
          </div>
        </header>

        <section className="px-6 py-8 flex-1">
            <div className="max-w-[1400px] mx-auto w-full">
                {/* Search Bar */}
                <div className="relative group mb-8">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:border-[#C44545]/20 focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>

                {/* Users List */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-xs font-bold text-[#C44545] uppercase tracking-[0.2em]">Registered Customers</h2>
                    <span className="text-xs font-semibold text-slate-500">{filteredUsers.length} total</span>
                </div>

                <div className="space-y-3">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user._id}
                            className="bg-white py-3.5 px-5 rounded-xl border border-slate-200 shadow-sm space-y-2 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4 w-full">
                                <div className="h-10 w-10 bg-rose-50/50 text-[#C44545] rounded-xl flex items-center justify-center border border-rose-100 flex-shrink-0 font-bold uppercase">
                                    {user.name?.[0] || <User size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">{user.name}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md inline-block w-fit bg-[#C44545]/10 text-[#C44545] border border-[#C44545]/10">
                                                Customer
                                            </span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize flex-shrink-0 border ${
                                            user.isBlocked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                        <Phone size={12} className="flex-shrink-0" />
                                        <span className="text-[11px] font-semibold">{user.mobile || user.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>

    </div>
  );
};

export default AdminUsers;
