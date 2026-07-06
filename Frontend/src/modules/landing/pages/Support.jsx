import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Phone, Send, CheckCircle2, ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Support = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSupportData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/faqs?type=customer`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchSupportData();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success('Your message has been sent successfully!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeFaqs = [
    { question: 'What makes Sootit a premium platform?', answer: 'Sootit carefully vets, interviews, and runs background checks on every single service provider. We combine reliable premium service quality with transparent upfront pricing.' },
    { question: 'How does vendor booking work?', answer: 'Simply enter your location, select the vehicle service category you need, check provider profiles, ratings and reviews, and book directly. It is fully seamless.' },
    { question: 'Is my payment secure?', answer: 'Yes, we process all digital transactions via the Razorpay payment gateway, supporting UPI, Cards, Net Banking, and Wallet payments.' },
    { question: 'How do I cancel a booking?', answer: 'You can cancel any booking directly from your user dashboard. Full refunds are processed immediately if cancelled before vendor dispatch.' },
    { question: 'How can I join as a partner?', answer: 'Go to our auth page, select the Vendor option, register, and complete your KYC details. Our team will review your profile and get back to you.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col text-slate-900">
      {/* Top Header */}
      <div className="px-6 py-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-200/50">
        <button 
          onClick={() => navigate(-1)} 
          className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-black/[0.03] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C44545]">Support Hub</span>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-300">Get Help</span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="animate-spin text-[#C44545]" size={36} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Support Center...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Intro Header */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 text-center">
              <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">How can we help?</h1>
              <p className="text-sm font-semibold text-slate-400">Connect with our support executives or browse through popular topics.</p>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-lg shadow-slate-200/20 flex items-center gap-4 text-left">
                <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#C44545] border border-rose-100 shadow-inner shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-rose-500 opacity-80 leading-none mb-1.5">Email Support</p>
                  <a href="mailto:sootit3@gmail.com" className="font-black text-sm text-slate-800 hover:text-[#C44545] hover:underline break-all leading-tight block">
                    sootit3@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-lg shadow-slate-200/20 flex items-center gap-4 text-left">
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-100 shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 opacity-80 leading-none mb-1.5">Phone Support</p>
                  <a href="tel:9437153203" className="font-black text-sm text-slate-800 hover:text-[#C44545] hover:underline leading-tight block">
                    9437153203
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-900 mb-2">Send Us a Message</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">Our support team will connect with you within 24 business hours.</p>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Message Sent Successfully!</h4>
                  <p className="text-slate-500 text-xs md:text-sm mb-6">Our representative will get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[#C44545] text-sm font-bold underline hover:text-[#a33636] transition-colors"
                  >
                    Send another query
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 pl-1">Full Name *</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-100 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 pl-1">Email Address *</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-100 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 pl-1">Phone Number</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-slate-50 border border-slate-100 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 pl-1">Subject *</label>
                      <select
                        name="subject" value={formData.subject} onChange={handleChange} required
                        className="w-full bg-slate-50 border border-slate-100 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-all"
                      >
                        <option value="">Select Option</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Partnership">Business Partnership</option>
                        <option value="Vendor Inquiry">Become a Partner Vendor</option>
                        <option value="Support/Complaint">Support & Complaint</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 pl-1">Your Message *</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} required rows={4} placeholder="Type details of your inquiry here..."
                      className="w-full bg-slate-50 border border-slate-100 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full bg-[#C44545] hover:bg-[#b03a3a] disabled:opacity-75 text-white font-black text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#C44545]/20 transition-all transform active:scale-95 uppercase tracking-widest"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQs */}
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><HelpCircle className="text-[#C44545]" /> Frequently Asked Questions</h3>
              <div className="space-y-3">
                {activeFaqs.map((faq, idx) => (
                  <details key={faq._id || idx} className="group border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                      <span className="text-sm font-black tracking-tight text-slate-800 text-left">{faq.question}</span>
                      <ChevronDown size={16} className="text-slate-300 group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed border-t border-slate-50 pt-4 text-left">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-slate-100/50 p-8 rounded-[2.5rem] flex flex-col items-center text-center border border-slate-100">
              <ShieldCheck size={32} className="text-[#C44545] mb-2" strokeWidth={2.5} />
              <h5 className="text-xs font-black uppercase tracking-widest mb-1 text-slate-900">Secure Protocol</h5>
              <p className="text-[11px] font-semibold text-neutral-400 leading-relaxed max-w-[200px]">All communications are encrypted and private.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Support;
