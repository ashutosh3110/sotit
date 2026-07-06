import { motion } from "framer-motion";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
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
                    Welcome to Sootit! Your privacy is of paramount importance to us. This Privacy Policy describes how Sootit ("we", "our", or "us") collects, uses, shares, and protects your information when you use our mobile application, website, and related on-demand vehicle services (collectively, the "Services").
                  </p>
                  <p>
                    By accessing or using our Services, you consent to the collection, transfer, storage, disclosure, and use of your information as described in this Privacy Policy.
                  </p>
                  
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">1. Information We Collect</h3>
                  <p>
                    We collect various types of information to provide and improve our Services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Information You Provide:</strong> This includes registration details such as your name, email address, phone number, and profile picture.</li>
                    <li><strong>Vehicle Information:</strong> To facilitate accurate repair, towing, and maintenance services, we collect vehicle details such as make, model, year of manufacture, and license plate/registration number.</li>
                    <li><strong>Payment Information:</strong> All payments are processed securely through external PCI-DSS compliant payment gateways (such as Razorpay). We do not store your raw credit/debit card numbers or CVV.</li>
                    <li><strong>Location Data:</strong> With your explicit permission, we collect precise or approximate location coordinates from your device when the app is running in the foreground or background. This is crucial for matching you with nearby technicians, verifying service locations, and tracking active service requests.</li>
                    <li><strong>Device & Usage Information:</strong> We collect details about the device you use to access the app, including IP address, hardware model, operating system, and app performance logs.</li>
                  </ul>
                  
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">2. How We Use Your Information</h3>
                  <p>
                    We use the information we collect to operate, maintain, and improve our services, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Connecting you with registered service experts, mechanics, and drivers.</li>
                    <li>Facilitating real-time tracking of technician arrival and service status.</li>
                    <li>Processing and verifying payments for completed bookings.</li>
                    <li>Sending transactional alerts, booking confirmations, and support communications via email, SMS, or WhatsApp.</li>
                    <li>Providing customer support, resolving disputes, and ensuring safety and fraud prevention.</li>
                  </ul>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">3. How We Share Your Information</h3>
                  <p>
                    We respect your privacy and only share your data under the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>With Service Vendors:</strong> To fulfill your booking, we share your name, phone number, vehicle details, and service location with the matched technician/vendor.</li>
                    <li><strong>With Payment Gateways:</strong> We share necessary transaction details with our secure payment partners (e.g., Razorpay) to process payments.</li>
                    <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law, regulation, or legal process, or to protect the safety and rights of Sootit, its users, or the public.</li>
                  </ul>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">4. Data Security and Retention</h3>
                  <p>
                    We implement robust administrative, technical, and physical security measures to safeguard your personal data from unauthorized access, loss, or alteration. We retain your personal information for as long as your account is active or as needed to provide you Services and satisfy legal compliance.
                  </p>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-6">5. Your Rights and Choices</h3>
                  <p>
                    You have control over your data:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Access:</strong> You can review and update your profile information anytime through the account settings.</li>
                    <li><strong>Location Permissions:</strong> You can enable or disable location services at any time through your device settings. Note that disabling location tracking may limit the core functionality of our on-demand services.</li>
                    <li><strong>Data Deletion:</strong> You can request the deletion of your account and personal data by reaching out to our support team at <a href="mailto:sootit3@gmail.com" className="text-[#C44545] hover:underline font-bold">sootit3@gmail.com</a>.</li>
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
