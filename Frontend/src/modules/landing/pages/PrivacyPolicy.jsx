import { motion } from "framer-motion";
import { ArrowLeft, Loader2, FileText, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [policyContent, setPolicyContent] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pages/privacy-policy`);
        const data = await response.json();
        if (data.success && data.page) {
          setPolicyContent(data.page.content);
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchPolicy();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      {/* Top Header */}
      <div className="px-6 py-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-200/50">
        <button 
          onClick={() => navigate(-1)} 
          className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">Legal Document</span>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-300">Privacy Policy</span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="animate-spin text-[#C44545]" size={36} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Privacy Policy...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 space-y-8"
          >
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-14 w-14 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-[#C44545] border border-rose-100 shadow-inner">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Privacy Policy</h1>
                <p className="text-[10px] font-black text-[#C44545] uppercase tracking-widest">Sootit Official Privacy Statement</p>
              </div>
            </div>

            <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-6 whitespace-pre-wrap">
              {policyContent ? (
                policyContent
              ) : (
                <>
                  <p className="font-bold text-slate-800 text-base">Effective Date: July 6, 2026</p>
                  <p>
                    Welcome to Sootit. Your privacy is critical to us. This Privacy Policy documents the types of personal information that is collected and recorded by Sootit and how we use it.
                  </p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">1. Information We Collect</h3>
                  <p>
                    We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us, or when you contact us. This may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personal identification details (Name, Email Address, Phone Number, Profile Picture).</li>
                    <li>Vehicle information and location coordinates to facilitate on-demand services.</li>
                    <li>Payment information securely processed via external gateways (Razorpay).</li>
                  </ul>
                  
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">2. How We Use Your Information</h3>
                  <p>
                    We use the information we collect to operate and maintain our application, verify identity, facilitate connection between customers and service experts, and notify users of important events.
                  </p>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">3. Information Sharing</h3>
                  <p>
                    We do not sell, trade, or rent user personal identification information to third parties. We share location and name information with registered vendors only to deliver the service you booked.
                  </p>
                </>
              )}
            </div>

            {/* Contact Info Box */}
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-3">
              <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50 flex items-center gap-4 text-left">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-[#C44545] shadow-sm shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500 opacity-80 leading-none mb-1.5">Email Support</p>
                  <a href="mailto:sootit3@gmail.com" className="font-black text-xs md:text-sm text-slate-800 hover:text-[#C44545] hover:underline break-all leading-tight block">
                    sootit3@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 opacity-80 leading-none mb-1.5">Phone Support</p>
                  <a href="tel:9437153203" className="font-black text-xs md:text-sm text-slate-800 hover:text-[#C44545] hover:underline leading-tight block">
                    9437153203
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
