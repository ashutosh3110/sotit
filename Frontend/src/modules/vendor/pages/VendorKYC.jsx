import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Upload, ChevronRight, ExternalLink, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVendorData } from "../utils/vendorStore";
import { getVendorConfig } from "../utils/vendorConfig";
import toast from "react-hot-toast";

const VendorKYC = () => {
  const vendorData = getVendorData();
  const config = getVendorConfig(vendorData?.profile?.role || 'driver');
  const [kycDocs, setKycDocs] = useState({});
  const [newFiles, setNewFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    if (!vendorData?.profile?.id) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vendorData.profile.id}`);
        const data = await response.json();
        if (response.ok) {
            setKycDocs(data.kycDocuments || {});
        }
    } catch (err) {
        console.error("Error fetching KYC data:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (key, file) => {
    setNewFiles(prev => ({ ...prev, [key]: file }));
    toast.success(`${key.toUpperCase()} selected! Click Update to save.`);
  };

  const handleUpdate = async () => {
    if (Object.keys(newFiles).length === 0) return toast.error("No new files selected");
    
    setUpdating(true);
    const tid = toast.loading("Uploading documents...");
    
    try {
        const formData = new FormData();
        Object.keys(newFiles).forEach(key => {
            formData.append(key, newFiles[key]);
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/kyc/${vendorData.profile.id}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setKycDocs(data.kycDocuments);
        setNewFiles({});
        toast.success("Documents updated successfully!", { id: tid });
    } catch (err) {
        toast.error(err.message || "Failed to update documents", { id: tid });
    } finally {
        setUpdating(false);
    }
  };

  const getDocStatus = (key) => {
    if (newFiles[key]) return { label: 'Ready to Update', color: 'text-blue-500', icon: RefreshCcw };
    if (kycDocs[key]) return { label: 'Uploaded', color: 'text-emerald-500', icon: CheckCircle2 };
    return { label: 'Not Uploaded', color: 'text-neutral-300', icon: FileText };
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 text-neutral-900 font-inter">
      <div className="bg-white px-6 py-6 border-b border-neutral-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm shadow-black/[0.01]">
        <Link to="/vendor/settings" className="h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black tracking-tighter text-[#C44545]">KYC Documents.</h1>
      </div>

      <div className="px-6 py-8">
        <div className="bg-[#C44545] text-white rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-[#C44545]/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <CheckCircle2 size={24} className="text-white/80" />
                 </div>
                 <div>
                    <span className="text-[12px] font-black uppercase text-white/40 tracking-[0.2em] mb-0.5 block">Verification Hub</span>
                    <h2 className="text-2xl font-black tracking-tight">Trust Center</h2>
                 </div>
              </div>
              <p className="text-xs font-medium text-white/60 mb-6 leading-relaxed">Ensure all your documents are valid and up-to-date to maintain your <span className="text-white font-black">Verified Partner</span> status.</p>
           </div>
        </div>

        <div className="space-y-4">
           {config.kycDocs.map((doc, idx) => {
              const status = getDocStatus(doc.key);
              return (
                <div 
                  key={idx} 
                  className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between shadow-xl shadow-black/[0.01] transition-all"
                >
                    <div className="flex items-center gap-4 flex-1">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${kycDocs[doc.key] ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-50 text-neutral-300'}`}>
                          <status.icon size={22} strokeWidth={2.5} />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-black tracking-tight leading-none mb-1.5">{doc.title}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                             {status.label}
                          </span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {kycDocs[doc.key] && (
                            <a href={kycDocs[doc.key]} target="_blank" rel="noreferrer" className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-slate-100">
                                <ExternalLink size={14} />
                            </a>
                        )}
                        <div className="relative h-10 w-10 bg-[#C44545] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#C44545]/20 active:scale-95 transition-transform cursor-pointer">
                            <Upload size={16} strokeWidth={3} />
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                            />
                        </div>
                    </div>
                </div>
              );
           })}
        </div>

        <button 
            onClick={handleUpdate}
            disabled={updating || Object.keys(newFiles).length === 0}
            className={`w-full h-16 rounded-[1.8rem] font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 mt-10 transition-all shadow-2xl ${
                Object.keys(newFiles).length > 0 
                ? 'bg-[#C44545] text-white shadow-[#C44545]/20' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
        >
            {updating ? "Uploading..." : "Update Documents"} <CheckCircle2 size={18} />
        </button>

        <div className="mt-12 p-8 border-2 border-dashed border-neutral-100 rounded-[3rem] flex flex-col items-center text-center bg-white/50">
           <AlertCircle size={32} className="text-neutral-200 mb-4" strokeWidth={2.5} />
           <p className="text-[11px] font-bold text-neutral-400 leading-relaxed max-w-[200px]">Any document change will put your profile back into the <span className="text-[#C44545]">Verification Pool</span> for admin review.</p>
        </div>
      </div>
    </div>
  );
};

export default VendorKYC;
