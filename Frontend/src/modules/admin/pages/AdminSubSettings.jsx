import { motion } from "framer-motion";
import { ArrowLeft, Menu, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminSubSettings = ({ title, description, children, onSave, isLoading }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col">
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-black/5">
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <button onClick={() => navigate('/admin/settings')} className="hidden lg:flex h-10 w-10 bg-neutral-50 rounded-xl items-center justify-center border border-black/5 active:scale-90 transition-all">
                <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Settings / {title}</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">{title}.</h1>
            </div>
          </div>
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="bg-[#C44545] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#C44545]/20 disabled:opacity-50"
          >
            <Save size={14} /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </header>

        <div className="p-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm max-w-2xl">
                <p className="text-sm font-bold text-neutral-500 mb-8">{description}</p>
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSecurity = () => (
    <AdminSubSettings 
        title="Account Security" 
        description="Manage your two-factor authentication, password policies, and active sessions." 
    >
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" />
            </div>
        </div>
    </AdminSubSettings>
);

export const AdminNotifications = () => (
    <AdminSubSettings 
        title="Notifications" 
        description="Configure how you receive system alerts, email reports, and push notifications." 
    >
        <div className="space-y-4">
            {['Email Alerts', 'System Notifications', 'Provider Activity Updates'].map((label, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[12px] font-bold text-slate-700">{label}</span>
                    <div className="h-6 w-12 bg-[#C44545] rounded-full flex items-center justify-end px-1 cursor-pointer">
                        <div className="h-4 w-4 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
            ))}
        </div>
    </AdminSubSettings>
);

export const AdminPlatform = () => (
    <AdminSubSettings 
        title="Platform Settings" 
        description="Update general platform information, currency settings, and system maintenance windows." 
    >
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Platform Name</label>
                <input type="text" defaultValue="Sootit Admin" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">System Currency</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                </select>
            </div>
        </div>
    </AdminSubSettings>
);

import toast from "react-hot-toast";

export const AdminProfile = () => {
    const [name, setName] = useState("Super Admin");
    const [email, setEmail] = useState("admin@gmail.com");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('http://localhost:5000/api/admin/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, oldPassword, newPassword }),
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Profile updated successfully!");
                setOldPassword("");
                setNewPassword("");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Server connection failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminSubSettings 
            title="Profile Details" 
            description="Update your administrative information including name, email, and password security." 
            onSave={handleSave}
            isLoading={isLoading}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 bg-rose-50 rounded-[2rem] border-2 border-dashed border-[#C44545]/30 flex items-center justify-center text-[#C44545] font-black text-xl">
                        AD
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#C44545] hover:underline">Change Avatar</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Admin Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#C44545]">Security Update</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Old Password</label>
                            <input 
                                type="password" 
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Required for password change"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-[#C44545]/20 focus:outline-none transition-all" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminSubSettings>
    );
};
