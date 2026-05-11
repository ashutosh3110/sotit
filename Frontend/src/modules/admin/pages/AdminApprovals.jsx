import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle2, XCircle, MapPin, Phone, Menu, Loader2, FileText, Info, X, ExternalLink, Mail, User, Briefcase, Landmark, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

const AdminApprovals = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      console.log("Fetching from: http://localhost:5000/api/admin/vendors/pending");
      const response = await fetch("http://localhost:5000/api/admin/vendors/pending", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      });
      console.log("Response Status:", response.status);
      const data = await response.json();
      console.log("Data Received:", data);
      
      if (response.ok && Array.isArray(data)) {
        setPendingVendors(data);
      } else {
        setPendingVendors([]);
        toast.error(data.message || "Failed to fetch pending vendors");
      }
    } catch (error) {
      toast.error("Failed to fetch pending vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (vendorId, status) => {
    const tid = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} vendor...`);
    try {
        const response = await fetch(`http://localhost:5000/api/admin/vendors/${vendorId}/status`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        toast.success(data.message, { id: tid });
        setPendingVendors(prev => prev.filter(v => v._id !== vendorId));
        setShowDetailsModal(false);
        setShowDocsModal(false);
    } catch (error) {
        toast.error(error.message, { id: tid });
    }
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm shrink-0"><Icon size={14} /></div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</span>
        <span className="text-xs font-bold text-slate-700 leading-tight">{value || 'N/A'}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col">
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-black/5">
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Verification Queue</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Pending Approvals.</h1>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-[#C44545] uppercase tracking-[0.2em]">Awaiting Review</h2>
            <span className="text-[12px] font-bold text-neutral-500">{pendingVendors.length} requests</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#C44545]" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                {pendingVendors.map((vendor) => (
                <motion.div
                    key={vendor._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-[#C44545]/20 transition-all"
                >
                    <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] font-black border border-rose-100 shadow-inner text-lg uppercase">
                            {vendor.name[0]}
                        </div>
                        <div className="flex flex-col leading-tight">
                            <h3 className="text-[15px] font-black tracking-tight text-slate-900 truncate max-w-[140px]">{vendor.name}</h3>
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{vendor.role}</span>
                        </div>
                        </div>
                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100">
                        Pending
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button 
                            onClick={() => { setSelectedVendor(vendor); setShowDetailsModal(true); }}
                            className="bg-slate-50 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-100 hover:bg-white hover:border-[#C44545]/20 hover:text-[#C44545] transition-all"
                        >
                            <Info size={14} /> Full Details
                        </button>
                        <button 
                            onClick={() => { setSelectedVendor(vendor); setShowDocsModal(true); }}
                            className="bg-slate-50 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-100 hover:bg-white hover:border-[#C44545]/20 hover:text-[#C44545] transition-all"
                        >
                            <FileText size={14} /> Documents
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mb-6 py-4 border-y border-slate-50">
                        <div className="flex items-center gap-3">
                        <MapPin size={12} className="text-[#C44545]" />
                        <span className="text-[12px] font-bold text-slate-600">{vendor.address?.city || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                        <Phone size={12} className="text-[#C44545]" />
                        <span className="text-[12px] font-bold text-slate-600">{vendor.mobile}</span>
                        </div>
                    </div>
                    </div>

                    <div className="flex gap-2">
                    <button 
                        onClick={() => handleStatusUpdate(vendor._id, 'approved')}
                        className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 active:scale-95 transition-all"
                    >
                        <CheckCircle2 size={14} /> Approve
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate(vendor._id, 'rejected')}
                        className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 active:scale-95 transition-all"
                    >
                        <XCircle size={14} /> Reject
                    </button>
                    </div>
                </motion.div>
                ))}
                </AnimatePresence>

                {pendingVendors.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No pending applications</p>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedVendor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545]"><Info size={20} /></div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-none mb-1">Vendor Details</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{selectedVendor.role} Profile</p>
                            </div>
                        </div>
                        <button onClick={() => setShowDetailsModal(false)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
                        {/* Profile Photo Display Section */}
                        {selectedVendor.documents?.profileImage && (
                            <div className="flex justify-center">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#C44545] rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <img 
                                        src={selectedVendor.documents.profileImage.startsWith('http') ? selectedVendor.documents.profileImage : `http://localhost:5000/${selectedVendor.documents.profileImage}`} 
                                        alt="Profile" 
                                        className="h-40 w-40 object-cover rounded-[3rem] border-4 border-white shadow-2xl relative z-10"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg z-20 border-2 border-white">
                                        <CheckCircle2 size={16} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow icon={User} label="Full Name" value={selectedVendor.name} />
                            <DetailRow icon={Phone} label="Mobile" value={selectedVendor.mobile} />
                            <DetailRow icon={Mail} label="Email" value={selectedVendor.email} />
                            <DetailRow icon={Briefcase} label="Role" value={selectedVendor.role} />
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545] border-l-4 border-[#C44545] pl-3">Location Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailRow icon={MapPin} label="City" value={selectedVendor.address?.city} />
                                <DetailRow icon={MapPin} label="State" value={selectedVendor.address?.state} />
                                <DetailRow icon={MapPin} label="Street" value={selectedVendor.address?.street} />
                                <DetailRow icon={MapPin} label="Pincode" value={selectedVendor.address?.pincode} />
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545] border-l-4 border-[#C44545] pl-3">Banking Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailRow icon={Landmark} label="Bank Name" value={selectedVendor.bankDetails?.bankName} />
                                <DetailRow icon={User} label="A/C Holder" value={selectedVendor.bankDetails?.accountHolderName} />
                                <DetailRow icon={CreditCard} label="A/C Number" value={selectedVendor.bankDetails?.accountNumber} />
                                <DetailRow icon={Info} label="IFSC Code" value={selectedVendor.bankDetails?.ifscCode} />
                                <DetailRow icon={Info} label="UPI ID" value={selectedVendor.bankDetails?.upiId} />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 flex gap-4">
                        <button 
                            onClick={() => handleStatusUpdate(selectedVendor._id, 'approved')}
                            className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                        >
                            <CheckCircle2 size={16} /> Approve Account
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(selectedVendor._id, 'rejected')}
                            className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                        >
                            <XCircle size={16} /> Reject
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Documents Modal */}
      <AnimatePresence>
        {showDocsModal && selectedVendor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FileText size={20} /></div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-none mb-1">KYC Documents</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Identity Verification</p>
                            </div>
                        </div>
                        <button onClick={() => setShowDocsModal(false)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 hide-scrollbar">
                        {Object.entries(selectedVendor.kycDocuments || {}).map(([key, path]) => {
                            if (!path) return null;
                            const fullPath = path.startsWith('http') ? path : `http://localhost:5000/${path}`;
                            return (
                                <div key={key} className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-blue-600 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Document Type</span>
                                            <span className="text-xs font-black text-slate-700 uppercase">{key}</span>
                                        </div>
                                    </div>
                                    <a 
                                        href={fullPath} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            );
                        })}
                        {(Object.keys(selectedVendor.kycDocuments || {}).length === 0) && (
                            <div className="text-center py-10">
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">No documents uploaded</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-slate-100">
                        <button 
                            onClick={() => setShowDocsModal(false)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] active:scale-95 transition-all"
                        >
                            Close Viewer
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApprovals;
