import { motion, AnimatePresence } from "framer-motion";
import { Image, Plus, Trash2, Upload, Menu, X, Check, Loader2, ChevronDown, Layers, Target } from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminBanners = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newBanner, setNewBanner] = useState({
      title: '',
      type: 'main',
      role: 'none',
      file: null,
      preview: null
  });

  const fetchBanners = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/banners`);
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
            setBanners(data);
        } else {
            setBanners([]);
        }
    } catch (err) {
        console.error(err);
        setBanners([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setNewBanner({
              ...newBanner,
              file: file,
              preview: URL.createObjectURL(file)
          });
      }
  };

  const handleUpload = async () => {
      if (!newBanner.file) return alert("Please select an image");
      setUploading(true);
      const formData = new FormData();
      formData.append('banner', newBanner.file);
      formData.append('type', newBanner.type);
      formData.append('role', newBanner.type === 'service' ? newBanner.role : 'none');
      formData.append('title', newBanner.title);

      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/banners`, {
              method: 'POST',
              body: formData
          });
          if (response.ok) {
              setShowUploadModal(false);
              setNewBanner({ title: '', type: 'main', role: 'none', file: null, preview: null });
              fetchBanners();
          }
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this banner?")) return;
      try {
          await fetch(`${import.meta.env.VITE_API_URL}/banners/${id}`, { method: 'DELETE' });
          fetchBanners();
      } catch (err) {
          console.error(err);
      }
  };

  const BannerCard = ({ banner }) => (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group overflow-hidden relative">
        <div className="flex items-center gap-4 flex-1">
            <div className="h-16 w-28 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] border border-rose-100 overflow-hidden shrink-0">
                <img src={banner.imageUrl} className="h-full w-full object-cover" alt="B" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black tracking-tight text-slate-900 truncate">{banner.title || 'Untitled Banner'}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${banner.type === 'main' ? 'bg-[#C44545] text-white' : 'bg-slate-800 text-white'}`}>
                        {banner.type}
                    </span>
                    {banner.type === 'service' && (
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Role: {banner.role}</span>
                    )}
                </div>
            </div>
        </div>
        <button 
            onClick={() => handleDelete(banner._id)}
            className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#C44545] hover:bg-red-500 hover:text-white transition-all shrink-0 ml-4 shadow-sm"
        >
            <Trash2 size={16} />
        </button>
    </div>
  );

  const mainBanners = Array.isArray(banners) ? banners.filter(b => b.type === 'main') : [];
  const serviceBanners = Array.isArray(banners) ? banners.filter(b => b.type === 'service') : [];

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col">
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-black/[0.01]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition-all shrink-0">
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">Marketing Control</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Manage Banners.</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-[#C44545] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#C44545]/20 active:scale-95 transition-all"
          >
            <Plus size={14} /> New Banner
          </button>
        </header>

        {loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[#C44545]" /></div>
        ) : (
            <div className="p-6 space-y-12">
                {/* Main Slider Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Layers size={18} className="text-[#C44545]" />
                        <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Main Home Slider</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {mainBanners.map(banner => <BannerCard key={banner._id} banner={banner} />)}
                        {mainBanners.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">No main banners active</div>
                        )}
                    </div>
                </section>

                {/* Service Specific Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Target size={18} className="text-slate-800" />
                        <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Service-Specific Banners</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {serviceBanners.map(banner => <BannerCard key={banner._id} banner={banner} />)}
                        {serviceBanners.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">No service banners active</div>
                        )}
                    </div>
                </section>
            </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
          {showUploadModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                    className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-slate-100"
                  >
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                          <h2 className="text-xl font-black text-slate-900 tracking-tighter">Add New Banner.</h2>
                          <button onClick={() => setShowUploadModal(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><X size={20} /></button>
                      </div>

                      <div className="p-8 space-y-6">
                          {/* Banner Type Selection */}
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setNewBanner({...newBanner, type: 'main'})}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${newBanner.type === 'main' ? 'bg-[#C44545] text-white border-[#C44545] shadow-lg shadow-[#C44545]/20' : 'bg-white border-slate-200 text-slate-500'}`}
                              >
                                Main Slider
                              </button>
                              <button 
                                onClick={() => setNewBanner({...newBanner, type: 'service'})}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${newBanner.type === 'service' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-black/20' : 'bg-white border-slate-200 text-slate-500'}`}
                              >
                                Service Specific
                              </button>
                          </div>

                          {/* Role Selection (If Service) */}
                          <AnimatePresence>
                              {newBanner.type === 'service' && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="visible">
                                      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2 block ml-1">Target Service Role</label>
                                      
                                      <div className="relative">
                                          <div 
                                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold flex items-center justify-between cursor-pointer hover:border-[#C44545]/30 transition-all"
                                          >
                                              <span className={newBanner.role === 'none' ? 'text-slate-400' : 'text-slate-900'}>
                                                  {newBanner.role === 'none' ? 'Select Role' : 
                                                   newBanner.role === 'driver' ? 'Expert Drivers' :
                                                   newBanner.role === 'mechanic' ? 'Mechanic Services' :
                                                   newBanner.role === 'towing' ? 'Towing Help' :
                                                   newBanner.role === 'rto' ? 'RTO Solutions' :
                                                   newBanner.role === 'legal' ? 'Legal Advisors' : 'Select Role'}
                                              </span>
                                              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                          </div>

                                          <AnimatePresence>
                                              {isRoleDropdownOpen && (
                                                  <motion.div 
                                                    initial={{ opacity: 0, y: 10 }} 
                                                    animate={{ opacity: 1, y: 0 }} 
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                                  >
                                                      {[
                                                          { id: 'driver', label: 'Expert Drivers' },
                                                          { id: 'mechanic', label: 'Mechanic Services' },
                                                          { id: 'towing', label: 'Towing Help' },
                                                          { id: 'rto', label: 'RTO Solutions' },
                                                          { id: 'legal', label: 'Legal Advisors' }
                                                      ].map((item) => (
                                                          <div 
                                                            key={item.id}
                                                            onClick={() => {
                                                                setNewBanner({...newBanner, role: item.id});
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className="px-5 py-4 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-[#C44545] cursor-pointer transition-colors border-b border-slate-50 last:border-none flex items-center justify-between group"
                                                          >
                                                              {item.label}
                                                              {newBanner.role === item.id && <Check size={14} className="text-[#C44545]" />}
                                                          </div>
                                                      ))}
                                                  </motion.div>
                                              )}
                                          </AnimatePresence>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>

                          <div>
                              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2 block ml-1">Banner Title</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Summer Promo 2024" 
                                value={newBanner.title}
                                onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                              />
                          </div>

                          <div className="relative group">
                              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                              <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-all group-hover:border-[#C44545]/20 group-hover:bg-rose-50/30">
                                  {newBanner.preview ? (
                                      <img src={newBanner.preview} className="h-24 w-40 object-cover rounded-xl shadow-lg mb-2" alt="Preview" />
                                  ) : (
                                      <>
                                          <div className="h-14 w-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] mb-4 shadow-inner">
                                              <Upload size={24} />
                                          </div>
                                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Tap to upload banner image</span>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="p-8 bg-slate-50 flex gap-3">
                          <button 
                            onClick={() => setShowUploadModal(false)}
                            className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 bg-[#C44545] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save Banner</>}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBanners;
