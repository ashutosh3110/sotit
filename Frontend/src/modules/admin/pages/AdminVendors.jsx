import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Phone, Menu, Mail, ShieldCheck, ArrowLeft, ExternalLink, Filter, User, Briefcase, Landmark, CreditCard, Info, FileText, X, Clock, Zap, Wrench, AlertCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminVendors = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      console.log("CRITICAL: Selected Vendor Data ->", selectedEntity);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedEntity]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVendors(data);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v._id && v._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.role && v.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm shrink-0"><Icon size={16} /></div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-slate-700 leading-tight truncate">{value || 'N/A'}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h4 className="text-[11px] font-black uppercase text-[#C44545] tracking-[0.2em] border-l-4 border-[#C44545] pl-4 mb-4">{title}</h4>
  );

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex text-slate-900 overflow-x-hidden">
      <style>{`
        .force-scroll::-webkit-scrollbar { width: 4px; display: block !important; }
        .force-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-900 border border-black/5 shadow-sm"><Menu size={20} strokeWidth={2.5} /></button>
            <button onClick={() => navigate('/admin')} className="hidden lg:flex h-10 w-10 bg-neutral-50 rounded-xl items-center justify-center text-slate-900 border border-black/5 shadow-sm active:scale-90 transition-all"><ArrowLeft size={20} strokeWidth={2.5} /></button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Management</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Providers Directory.</h1>
            </div>
          </div>
        </header>

        <section className="px-6 py-8 flex-1 overflow-y-auto">
            <div className="relative group mb-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search size={14} className="text-neutral-400" /></div>
                <input 
                    type="text" placeholder="Search by name, role or ID..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-[13px] font-bold focus:border-[#C44545]/20 focus:outline-none transition-all shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 border-4 border-[#C44545]/20 border-t-[#C44545] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <motion.div key={vendor._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-[#C44545]/20 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-[#C44545] font-black border border-black/5 uppercase shadow-inner text-lg">{vendor.name?.[0]}</div>
                                        <div>
                                            <h3 className="text-sm font-black tracking-tight text-slate-900 truncate max-w-[120px]">{vendor.name}</h3>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border mt-1 block w-fit bg-emerald-50 text-emerald-600 border-emerald-100">{vendor.role}</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shrink-0">Verified</div>
                                </div>
                                <div className="space-y-3 mb-6 py-4 border-y border-slate-50">
                                    <div className="flex items-center gap-3"><MapPin size={12} className="text-[#C44545]" /><span className="text-[12px] font-bold text-slate-600 truncate">{vendor.address?.city || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><Phone size={12} className="text-[#C44545]" /><span className="text-[12px] font-bold text-slate-600">{vendor.mobile}</span></div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEntity(vendor)} className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2">Full Detail <ExternalLink size={12} /></button>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
      </div>

      {/* --- Bulletproof Scrolling Modal --- */}
      <AnimatePresence>
          {selectedEntity && (
              <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-slate-900/60 backdrop-blur-md overflow-hidden">
                  <motion.div 
                      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="bg-white w-full max-w-3xl h-[90vh] lg:h-[85vh] rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative"
                  >
                      {/* HEADER */}
                      <div className="px-6 lg:px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner"><ShieldCheck size={24} /></div>
                              <div className="flex flex-col">
                                  <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Partner Profile</h2>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">ID: {selectedEntity._id}</p>
                              </div>
                          </div>
                          <button onClick={() => setSelectedEntity(null)} className="h-10 w-10 lg:h-12 lg:w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm"><X size={24} /></button>
                      </div>

                      {/* SCROLLABLE WRAPPER (FORCED) */}
                      <div className="flex-1 relative min-h-0 bg-white">
                          <div className="absolute inset-0 overflow-y-scroll force-scroll p-6 lg:p-10 space-y-12 touch-pan-y">
                              {/* Top Profile Banner */}
                              <div className="flex items-center gap-6 pb-10 border-b border-slate-100">
                                  <div className="h-20 w-20 lg:h-24 lg:w-24 bg-rose-50 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center text-[#C44545] font-black text-3xl border-4 border-white shadow-xl uppercase shrink-0">{selectedEntity.name?.[0]}</div>
                                  <div className="space-y-2">
                                      <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">{selectedEntity.name}</h3>
                                      <div className="flex flex-wrap gap-2">
                                          <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedEntity.role}</span>
                                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">{selectedEntity.status}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Contact Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <DetailRow icon={User} label="Full Name" value={selectedEntity.name} />
                                  <DetailRow icon={Phone} label="Mobile" value={selectedEntity.mobile} />
                                  <DetailRow icon={Mail} label="Email Address" value={selectedEntity.email} />
                                  <DetailRow icon={MapPin} label="Service Area" value={`${selectedEntity.address?.city || ''} ${selectedEntity.address?.state || ''}`} />
                              </div>

                              {/* Experience Details */}
                              <div className="space-y-4">
                                  <SectionHeader title="Service Experience" />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {selectedEntity.role === 'mechanic' && (
                                          <>
                                              <DetailRow icon={Wrench} label="Garage Name" value={selectedEntity.mechanicDetails?.garageName} />
                                              <DetailRow icon={Clock} label="Working Hours" value={selectedEntity.mechanicDetails?.workingHours} />
                                              <DetailRow icon={Briefcase} label="Experience" value={selectedEntity.mechanicDetails?.experienceRange} />
                                          </>
                                      )}
                                      {(selectedEntity.role === 'driver' || selectedEntity.role === 'towing') && (
                                          <>
                                              <DetailRow icon={Briefcase} label="License No." value={selectedEntity.professionalDetails?.dlNumber} />
                                              <DetailRow icon={Clock} label="Exp. Years" value={selectedEntity.professionalDetails?.experience} />
                                              <DetailRow icon={Wrench} label="Vehicles" value={selectedEntity.professionalDetails?.vehicleClasses?.join(', ')} />
                                          </>
                                      )}
                                      {selectedEntity.role === 'rto' && (
                                          <>
                                              <DetailRow icon={FileText} label="RTO Office" value={selectedEntity.rtoDetails?.rtoOffice} />
                                              <DetailRow icon={Briefcase} label="Experience" value={selectedEntity.rtoDetails?.experience} />
                                          </>
                                      )}
                                  </div>
                              </div>

                              {/* Settlement Section */}
                              <div className="space-y-4">
                                  <SectionHeader title="Banking & Settlement" />
                                  {selectedEntity.bankDetails && Object.values(selectedEntity.bankDetails).some(v => v) ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <DetailRow icon={User} label="A/C Holder" value={selectedEntity.bankDetails.accountHolderName} />
                                          <DetailRow icon={Landmark} label="Bank Name" value={selectedEntity.bankDetails.bankName} />
                                          <DetailRow icon={CreditCard} label="A/C Number" value={selectedEntity.bankDetails.accountNumber} />
                                          <DetailRow icon={Info} label="IFSC Code" value={selectedEntity.bankDetails.ifscCode} />
                                          <DetailRow icon={Zap} label="UPI ID" value={selectedEntity.bankDetails.upiId} />
                                      </div>
                                  ) : (
                                      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center bg-slate-50/50">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Bank Details Provided</p>
                                      </div>
                                  )}
                              </div>

                              {/* Documents Section */}
                              <div className="space-y-4 pb-20">
                                  <SectionHeader title="KYC Documents" />
                                  {selectedEntity.kycDocuments && Object.values(selectedEntity.kycDocuments).some(v => v) ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {Object.entries(selectedEntity.kycDocuments).map(([key, path]) => {
                                              if (!path) return null;
                                              const fullPath = path.startsWith('http') ? path : `http://localhost:5000/${path}`;
                                              return (
                                                  <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group transition-all hover:border-[#C44545]/20">
                                                      <div className="flex items-center gap-3 min-w-0">
                                                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#C44545] shadow-sm shrink-0"><FileText size={18} /></div>
                                                          <span className="text-[11px] font-black uppercase text-slate-600 truncate">{key}</span>
                                                      </div>
                                                      <a href={fullPath} target="_blank" rel="noreferrer" className="h-9 w-9 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-[#C44545] hover:text-white shadow-md shrink-0 transition-all"><ExternalLink size={16} /></a>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  ) : (
                                      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center bg-slate-50/50">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No KYC Documents Uploaded</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* FOOTER */}
                      <div className="p-6 lg:px-10 py-6 bg-slate-50 border-t border-slate-100 shrink-0">
                          <button onClick={() => setSelectedEntity(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20 active:scale-95 transition-all">
                              Close Profile
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVendors;
