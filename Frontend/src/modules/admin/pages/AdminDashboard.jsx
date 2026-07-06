import { motion } from "framer-motion";
import { Users, Briefcase, Activity, ShieldCheck, TrendingUp, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";
import { useEffect } from "react";

/**
 * Super Admin Panel (Ultra Compact Desktop/Mobile Hybrid)
 * Focuses on high-level system metrics.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



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
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">System Console</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Dashboard.</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] font-black text-xs border border-rose-100">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Quick Stats Grid */}
          <section>
            <h2 className="text-[11px] font-bold text-[#C44545] uppercase tracking-[0.2em] mb-4 pl-1 border-l-4 border-[#C44545] h-4 flex items-center">System Vitality</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Nodes", val: "124", icon: TrendingUp, clr: "text-[#C44545]" },
                { label: "System Uptime", val: "99.98%", icon: Activity, clr: "text-blue-500" },
                { label: "Growth", val: "+24%", icon: Activity, clr: "text-orange-500" },
              ].map((stat, i) => (
                <div key={i} className="py-4 px-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-center shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={12} className={stat.clr} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold text-slate-500">{stat.label}</span>
                  </div>
                  <span className="text-xl font-bold leading-none text-slate-800 tracking-tighter">{stat.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Module Health Section */}
          <section>
            <h2 className="text-[11px] font-bold text-[#C44545] uppercase tracking-[0.2em] mb-4 pl-1 border-l-4 border-[#C44545] h-4 flex items-center">Module Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "User Management", count: "14.2k Users", icon: Users, path: '/admin/users' },
                { label: "Vendor Verification", count: "152 Pending", icon: ShieldCheck, alert: true, path: '/admin/approvals' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => item.path && navigate(item.path)}
                  className="bg-white py-4 px-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative cursor-pointer hover:border-[#C44545]/20 transition-colors"
                >
                  <div className="h-11 w-11 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] border border-rose-100 shadow-inner">
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold tracking-tight text-slate-800">{item.label}</h3>
                    <span className="text-xs font-semibold text-slate-400">{item.count}</span>
                  </div>
                  {item.alert && (
                    <div className="absolute top-4 right-4 h-2 w-2 bg-[#C44545] rounded-full animate-ping" />
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Real-time Monitor (Original) */}
          <section className="bg-[#C44545] p-6 rounded-xl shadow-lg shadow-[#C44545]/15 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <h2 className="text-lg font-bold tracking-tighter mb-1">Live Monitor</h2>
              <p className="text-white/60 text-xs font-medium max-w-xs mb-5">Real-time system logs and traffic analysis.</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white text-[#C44545] py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-black/5 active:scale-95 transition-all">Launch Console</button>
                <button className="flex-1 bg-white/10 border border-white/10 py-2.5 rounded-lg text-xs font-bold active:scale-95 transition-all">View Logs</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
