import { motion } from "framer-motion";
import { ArrowLeft, User, Navigation, Wrench, Shield, Briefcase, FileText, Truck, CheckCircle2, Clock, MapPin, Zap, Star, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVendorData } from "../utils/vendorStore";
import toast from "react-hot-toast";

const VendorRoles = () => {
  const vendorData = getVendorData();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!vendorData?.profile?.id) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vendorData.profile.id}`);
        const data = await response.json();
        if (response.ok) {
            setProfile(data);
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    } finally {
        setLoading(false);
    }
  };

  const renderMechanicDetails = (details) => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4 flex items-center gap-2">
                <Wrench size={12} /> Garage Information
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Shop Name</span>
                    <span className="text-sm font-black text-slate-900">{details.garageName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Working Hours</span>
                    <span className="text-sm font-black text-slate-900">{details.workingHours || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Experience</span>
                    <span className="text-sm font-black text-slate-900">{details.experienceRange || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Specialties</h4>
            <div className="flex flex-wrap gap-2">
                {details.specialties?.map(s => (
                    <span key={s} className="bg-rose-50 text-[#C44545] text-[10px] font-black px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-tight">
                        {s}
                    </span>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Vehicle Expertise</h4>
            <div className="flex flex-wrap gap-2">
                {details.vehicleExpertise?.map(v => (
                    <span key={v} className="bg-slate-50 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-tight">
                        {v}
                    </span>
                ))}
            </div>
        </div>

        {details.emergencySupport && (
            <div className="bg-[#C44545] p-5 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-[#C44545]/20">
                <div className="flex items-center gap-3">
                    <Zap size={20} className="fill-white" />
                    <span className="text-[12px] font-black uppercase tracking-widest">24/7 Emergency Support Active</span>
                </div>
                <CheckCircle2 size={18} />
            </div>
        )}
    </div>
  );

  const renderRTODetails = (details) => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4 flex items-center gap-2">
                <FileText size={12} /> RTO Office Info
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Assigned Office</span>
                    <span className="text-sm font-black text-slate-900">{details.rtoOffice || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Experience</span>
                    <span className="text-sm font-black text-slate-900">{details.experience || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Services Offered</h4>
            <div className="space-y-3">
                {details.services?.map(s => (
                    <div key={s} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700">{s}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderLegalDetails = (details) => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4 flex items-center gap-2">
                <Briefcase size={12} /> Practice Information
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Bar Reg Number</span>
                    <span className="text-sm font-black text-slate-900">{details.barRegNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Experience</span>
                    <span className="text-sm font-black text-slate-900">{details.experience || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Consultation</span>
                    <span className="text-sm font-black text-slate-900">{details.consultationType || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
            <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Practice Areas</h4>
            <div className="flex flex-wrap gap-2">
                {details.practiceAreas?.map(s => (
                    <span key={s} className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-tight">
                        {s}
                    </span>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 text-neutral-900 font-inter">
      <div className="bg-white px-6 py-6 border-b border-neutral-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm shadow-black/[0.01]">
        <Link to="/vendor/settings" className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 active:scale-90 transition-transform"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-black tracking-tighter text-[#C44545]">Service Details.</h1>
      </div>

      <div className="px-6 py-8">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-10 w-10 border-4 border-[#C44545] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Syncing Role Data...</p>
            </div>
        ) : !profile ? (
            <div className="text-center py-20">
                <p className="text-neutral-400 font-bold">Failed to load role details.</p>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Active Role Header */}
                <div className="flex items-center gap-5 p-2 mb-4">
                    <div className="h-16 w-16 bg-[#C44545] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-[#C44545]/20">
                        {profile.role === 'mechanic' ? <Wrench size={32} /> : 
                         profile.role === 'rto' ? <FileText size={32} /> :
                         profile.role === 'legal' ? <Briefcase size={32} /> :
                         profile.role === 'towing' ? <Truck size={32} /> :
                         <Navigation size={32} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-slate-900 leading-none mb-2">
                            {profile.role?.toUpperCase()} PARTNER
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-100">
                                {profile.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Role Specific Details */}
                {profile.role === 'mechanic' && renderMechanicDetails(profile.mechanicDetails || {})}
                {profile.role === 'rto' && renderRTODetails(profile.rtoDetails || {})}
                {profile.role === 'legal' && renderLegalDetails(profile.legalDetails || {})}
                
                {/* Bank Details Section */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
                    <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4 flex items-center gap-2">
                        <CreditCard size={12} /> Settlement & Bank Details
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                            <span className="text-xs font-bold text-neutral-400 uppercase">Account Holder</span>
                            <span className="text-sm font-black text-slate-900">{profile.bankDetails?.accountHolderName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                            <span className="text-xs font-bold text-neutral-400 uppercase">Bank Name</span>
                            <span className="text-sm font-black text-slate-900">{profile.bankDetails?.bankName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                            <span className="text-xs font-bold text-neutral-400 uppercase">Account No.</span>
                            <span className="text-sm font-black text-slate-900">{profile.bankDetails?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                            <span className="text-xs font-bold text-neutral-400 uppercase">IFSC Code</span>
                            <span className="text-sm font-black text-slate-900">{profile.bankDetails?.ifscCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-xs font-bold text-neutral-400 uppercase">UPI ID</span>
                            <span className="text-sm font-black text-slate-900">{profile.bankDetails?.upiId || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Fallback for roles without specific details yet */}
                {(profile.role === 'driver' || profile.role === 'towing') && (
                    <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/[0.01]">
                        <h4 className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-4">Professional Overview</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                                <span className="text-xs font-bold text-neutral-400 uppercase">License No.</span>
                                <span className="text-sm font-black text-slate-900">{profile.professionalDetails?.dlNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                                <span className="text-xs font-bold text-neutral-400 uppercase">Experience</span>
                                <span className="text-sm font-black text-slate-900">{profile.professionalDetails?.experience || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-neutral-400 uppercase">Vehicle Types</span>
                                <span className="text-sm font-black text-slate-900">
                                    {profile.professionalDetails?.vehicleClasses?.join(', ') || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default VendorRoles;
