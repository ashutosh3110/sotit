import { motion } from "framer-motion";
import { LayoutDashboard, Users, ShieldCheck, Briefcase, Settings, LogOut, X, Globe, MessageCircle, HelpCircle, Wallet } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../../assets/logo.png";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Registered Vendors", path: "/admin/vendors", icon: ShieldCheck },
    { label: "Driver Ratings", path: "/admin/ratings", icon: Briefcase },
    { label: "Job Board", path: "/admin/jobs", icon: Briefcase },
    { label: "Manage Banners", path: "/admin/banners", icon: Globe },
    { label: "Help & Support", path: "/admin/support", icon: MessageCircle },
    { label: "Manage FAQs", path: "/admin/faqs", icon: HelpCircle },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        className={`fixed top-0 left-0 h-full bg-white w-72 z-50 shadow-2xl lg:shadow-none border-r border-slate-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#C44545] rounded-xl flex items-center justify-center p-2 shadow-lg shadow-[#C44545]/20">
              <img src={logo} alt="Logo" className="brightness-0 invert" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Sootit</span>
              <span className="text-[10px] font-black text-[#C44545] tracking-[0.3em] uppercase">Admin</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden h-8 w-8 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-400">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto min-h-0 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${isActive ? 'bg-[#C44545] text-white shadow-xl shadow-[#C44545]/20' : 'text-neutral-400 hover:bg-neutral-50'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2.5} className={isActive ? 'text-white' : 'text-neutral-300 group-hover:text-slate-900'} />
                <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={() => {
              toast.success("Admin Logged Out");
              localStorage.clear();
              setTimeout(() => {
                navigate('/admin/login');
                onClose();
              }, 1000);
            }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black uppercase tracking-widest text-[12px]"
          >
            <LogOut size={20} strokeWidth={3} />
            Logout
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;
