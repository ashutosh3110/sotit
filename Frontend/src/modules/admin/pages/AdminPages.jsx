import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Globe, FileText, Menu, X, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

const AdminPages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null); // null means creating new page

  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("customer");
  const [filterTab, setFilterTab] = useState("all");

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pages`);
      const data = await response.json();
      if (data.success) {
        setPages(data.pages);
      } else {
        toast.error(data.message || "Failed to load pages");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading pages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenEdit = async (page) => {
    setSelectedPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setTarget(page.target || "customer");
    
    // Fetch full page details including content
    const tid = toast.loading("Loading page content...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/pages/${page.slug}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.page.content);
        setTarget(data.page.target || "customer");
        setIsModalOpen(true);
        toast.dismiss(tid);
      } else {
        toast.error(data.message || "Failed to load page content", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching content", { id: tid });
    }
  };

  const handleOpenCreate = () => {
    setSelectedPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setTarget("customer");
    setIsModalOpen(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      return toast.error("Please fill all fields");
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    const token = localStorage.getItem("admin_token");

    setIsSubmitting(true);
    const tid = toast.loading("Saving page...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pages/${cleanSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, target })
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Page saved successfully!", { id: tid });
        setIsModalOpen(false);
        fetchPages();
      } else {
        toast.error(data.message || "Failed to save page", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error saving page", { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePage = async (slugToDelete) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    const token = localStorage.getItem("admin_token");
    const tid = toast.loading("Deleting page...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pages/${slugToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Page deleted successfully!", { id: tid });
        fetchPages();
      } else {
        toast.error(data.message || "Failed to delete page", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error deleting page", { id: tid });
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen font-inter flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 flex flex-col">
        {/* Header */}
        <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 bg-neutral-50 rounded-xl flex items-center justify-center text-slate-900 border border-black/5"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-[#C44545] tracking-[0.2em] mb-1">System Content</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Dynamic Pages.</h1>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#C44545] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#A33434] transition-colors shadow-lg shadow-[#C44545]/15"
          >
            <Plus size={14} strokeWidth={3} /> Create Page
          </button>
        </header>

        {/* Content Area */}
        <main className="p-6 space-y-6 max-w-[1400px] mx-auto w-full flex-1">
          {/* Target Filter Tabs */}
          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 max-w-sm">
            {['all', 'customer', 'vendor'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterTab === tab
                    ? 'bg-[#C44545] text-white shadow-lg shadow-[#C44545]/15'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab === 'all' ? 'All Pages' : tab === 'customer' ? 'Customer' : 'Partner'}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-[#C44545]" size={36} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading dynamic pages...</p>
            </div>
          ) : pages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.filter(page => filterTab === 'all' || (page.target || 'customer') === filterTab).map((page) => (
                <div
                  key={page.slug}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40 hover:border-[#C44545]/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] border border-rose-100">
                        <FileText size={20} />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        page.target === 'vendor'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        {page.target === 'vendor' ? 'Partner/Vendor' : 'Customer'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1">{page.title}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">slug: {page.slug}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-6 pt-6 border-t border-slate-50">
                    <button
                      onClick={() => handleOpenEdit(page)}
                      className="flex-1 py-3.5 bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C44545] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-slate-100"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.slug)}
                      className="h-11 w-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">No Dynamic Pages Found</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm">Create privacy policy or terms pages to display them on user login pages.</p>
              <button
                onClick={handleOpenCreate}
                className="mt-8 px-6 py-3.5 bg-[#C44545] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C44545]/15"
              >
                Create First Page
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Save Page Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl overflow-hidden border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">
                    {selectedPage ? "Edit Page" : "Create Page"}
                  </h2>
                  <p className="text-[10px] font-black text-[#C44545] uppercase tracking-widest mt-0.5">
                    Save Terms or Privacy Policy details
                  </p>
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePage} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1 block">Page Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!selectedPage) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"));
                      }
                    }}
                    placeholder="e.g. Privacy Policy"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C44545]/20 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1 block">Slug (URL identifier)</label>
                  <input
                    type="text"
                    disabled={!!selectedPage}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. privacy-policy"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C44545]/20 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1 block">Target Audience</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${target === 'customer' ? 'border-[#C44545] bg-rose-50/20 text-[#C44545]' : 'border-slate-200 bg-white text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="target"
                          value="customer"
                          checked={target === 'customer'}
                          onChange={() => setTarget('customer')}
                          className="hidden"
                        />
                        <span className="text-xs font-black uppercase tracking-wider">Customer</span>
                      </div>
                      {target === 'customer' && <Check size={16} strokeWidth={3} className="text-[#C44545]" />}
                    </label>

                    <label className={`flex-1 flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${target === 'vendor' ? 'border-[#C44545] bg-rose-50/20 text-[#C44545]' : 'border-slate-200 bg-white text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="target"
                          value="vendor"
                          checked={target === 'vendor'}
                          onChange={() => setTarget('vendor')}
                          className="hidden"
                        />
                        <span className="text-xs font-black uppercase tracking-wider">Partner / Vendor</span>
                      </div>
                      {target === 'vendor' && <Check size={16} strokeWidth={3} className="text-[#C44545]" />}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1 block">Page Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type page policy content here..."
                    rows={10}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C44545]/20 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-[#C44545] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#A33434] transition-colors flex items-center gap-2 shadow-lg shadow-[#C44545]/15"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} strokeWidth={3} /> Save Page
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPages;
