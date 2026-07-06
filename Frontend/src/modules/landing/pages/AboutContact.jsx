import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle,
  Shield, Star, Zap, Users, Car, Wrench, FileText, Truck,
  ChevronDown, ExternalLink, Heart, Award, Target, Globe,
  MessageSquare, ChevronRight, HelpCircle
} from 'lucide-react';
import logo from '../../../assets/logo.png';
import heroImage from '../../../assets/sootit_landing_hero.png';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

/* ───────── Section Header ───────── */
const SectionHeader = ({ tag, title, subtitle, align = 'center' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className={`max-w-2xl mb-12 ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
  >
    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#C44545] bg-[#C44545]/10 px-4.5 py-2 rounded-full border border-[#C44545]/20 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C44545] animate-pulse" />
      {tag}
    </span>
    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 leading-tight">
      {title}
    </h2>
    {subtitle && <p className="text-slate-500 text-sm md:text-base leading-relaxed">{subtitle}</p>}
  </motion.div>
);

/* ───────── FAQ Accordion Item ───────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0 py-3.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left gap-4 py-2 hover:text-[#C44545] transition-colors"
      >
        <span className="font-semibold text-slate-800 text-sm md:text-base">{q}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${open ? 'bg-[#C44545]/10 text-[#C44545]' : 'bg-slate-50 text-slate-400'}`}>
          <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed pt-2 pb-3 pl-1">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ════════════════ MAIN COMPONENT ════════════════ */
const AboutContact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [supportEmail, setSupportEmail] = useState('sootit3@gmail.com');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        if (data.success && data.data && data.data.supportEmail) {
          setSupportEmail(data.data.supportEmail);
        }
      } catch (error) {
        console.error("Error fetching support settings:", error);
      }
    };
    fetchSettings();
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
      const res = await fetch(`${API_URL}/contact`, {
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

  const services = [
    { icon: Car, title: 'Professional Drivers', desc: 'Verified & highly trained chauffeurs on-demand for secure and comfortable rides.' },
    { icon: Wrench, title: 'Expert Mechanics', desc: 'Certified professional mechanics arriving directly to your location for quick fixes.' },
    { icon: FileText, title: 'RTO Services', desc: 'Hassle-free vehicle registration, transfers, and documentation handled by experts.' },
    { icon: Shield, title: 'Legal Assistance', desc: 'Immediate, expert legal support and advice for vehicle or accident-related matters.' },
    { icon: Truck, title: 'Towing & Roadside', desc: '24/7 emergency towing, flat tire, and battery jumpstart services at your location.' },
    { icon: Star, title: 'Premium Car Care', desc: 'Top-tier vehicle detailing, washing, and deep cleaning services to preserve shine.' },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '2K+', label: 'Verified Experts' },
    { value: '50K+', label: 'Completed Jobs' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const faqs = [
    { q: 'What makes Sootit a premium platform?', a: 'Sootit carefully vets, interviews, and runs background checks on every single service provider. We combine reliable premium service quality with transparent upfront pricing.' },
    { q: 'How does vendor booking work?', a: 'Simply enter your location, select the vehicle service category you need, check provider profiles, ratings and reviews, and book directly. It is fully seamless.' },
    { q: 'Is my payment secure?', a: 'Yes, we process all digital transactions via the Razorpay payment gateway, supporting UPI, Cards, Net Banking, and Wallet payments.' },
    { q: 'How do I cancel a booking?', a: 'You can cancel any booking directly from your user dashboard. Full refunds are processed immediately if cancelled before vendor dispatch.' },
    { q: 'How can I join as a partner?', a: 'Go to our auth page, select the Vendor option, register, and complete your KYC details. Our team will review your profile and get back to you.' }
  ];



  const scrollSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#C44545]/20 selection:text-[#C44545]">
      
      {/* ─── DESKTOP HEADER/NAVBAR ─── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-[#C44545] rounded-xl flex items-center justify-center p-1.5 shadow-md shadow-[#C44545]/20">
              <img src={logo} alt="Sootit" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Sootit</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <button onClick={() => scrollSection('about-us')} className="hover:text-[#C44545] transition-colors">About Us</button>
            <button onClick={() => scrollSection('services')} className="hover:text-[#C44545] transition-colors">Our Services</button>
            <button onClick={() => scrollSection('how-it-works')} className="hover:text-[#C44545] transition-colors">How It Works</button>
            <button onClick={() => navigate('/support')} className="hover:text-[#C44545] transition-colors">FAQ & Support</button>
          </nav>

          {/* Nav CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#C44545] hover:bg-[#b03a3a] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-[#C44545]/20 transition-all transform active:scale-95"
            >
              LAUNCH APP
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative bg-slate-950 text-white py-16 md:py-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C44545]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C44545]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#C44545]/20 text-[#C44545] px-4.5 py-1.5 rounded-full border border-[#C44545]/30"
            >
              <span className="w-2 h-2 rounded-full bg-[#C44545] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium Automotive Partner</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white"
            >
              Revolutionizing <br />
              <span className="text-[#C44545]">Vehicle Services.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed"
            >
              Experience a premium service ecosystem tailored to your needs. Connect instantly with background-checked drivers, mechanics, towing services, and RTO or legal professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button
                onClick={() => scrollSection('faqs-contact')}
                className="bg-[#C44545] hover:bg-[#b03a3a] text-white font-bold text-sm px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl shadow-[#C44545]/35 transition-all transform hover:-translate-y-0.5"
              >
                Get in Touch <ChevronRight size={16} />
              </button>
              <button
                onClick={() => scrollSection('services')}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold text-sm px-8 py-3.5 rounded-2xl transition-all"
              >
                Explore Services
              </button>
            </motion.div>
          </div>

          {/* Hero Illustration/Image */}
          <div className="md:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={heroImage} alt="Premium Auto Services" className="w-full h-auto object-cover max-h-[420px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </motion.div>
            {/* Soft shadow background element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C44545]/30 to-rose-700/10 rounded-3xl filter blur-xl transform translate-x-4 translate-y-4 opacity-50 z-0" />
          </div>
        </div>
      </section>

      {/* ─── STATS BARRER ─── */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-[#C44545]">{stat.value}</p>
                <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / MISSION ─── */}
      <section id="about-us" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <SectionHeader tag="Who We Are" title="Connecting You to Trusted Service Experts" align="left" />
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Sootit is Indore’s leading premium service marketplace built strictly for vehicle owners and logistics businesses. We bridge the gap between skilled, verified vehicle experts and customers needing instant, reliable help.
            </p>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              We stand for trust. By executing thorough backgrounds, reference checks, and skill validations on all registered service partners, we promise peace of mind with premium deliverables.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: Shield, label: '100% Verified' },
                { icon: Award, label: 'Top-Rated' },
                { icon: Zap, label: 'Instant Connect' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
                  <item.icon size={22} className="mx-auto text-[#C44545] mb-2" />
                  <span className="text-xs font-bold text-slate-800">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-100/50"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#C44545]/10 flex items-center justify-center mb-4">
              <Target size={24} className="text-[#C44545]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Strategic Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To build a reliable digital framework where every motorist feels secure. From flat tires in the middle of the night, legal concerns during accidental situations, or booking a driver for a long weekend trip—Sootit is your single tap support.
            </p>
            <div className="border-t border-slate-100 pt-6">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100">
                  <div className="w-full h-full bg-[#C44545]/20 flex items-center justify-center font-bold text-[#C44545]">
                    SB
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Sootit Core Leadership</h4>
                  <p className="text-xs text-slate-500">Committed to Quality Solutions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICES GRID ─── */}
      <section id="services" className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            tag="Core Offerings"
            title="Premium Services Tailored For You"
            subtitle="Explore our comprehensive range of on-demand professional vehicle solutions."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#C44545]/10 group-hover:bg-[#C44545] text-[#C44545] group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300">
                  <srv.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{srv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="Process Flow"
          title="How Sootit Works"
          subtitle="A simple, transparent, and direct workflow to get your service ready."
        />

        <div className="grid md:grid-cols-3 gap-8 relative mt-12">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-slate-200/60 z-0" />
          
          {[
            { step: '01', title: 'Choose Service Category', desc: 'Select from our wide range of services including drivers, mechanics, or towing experts.' },
            { step: '02', title: 'Pick Your Service Partner', desc: 'Check dynamic list, ratings, pricing metrics and choose the vendor that matches your exact need.' },
            { step: '03', title: 'Confirm & Sit Back', desc: 'Make a secure payment via UPI/Cards and monitor the real-time progress on your dashboard.' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="relative z-10 bg-white border border-slate-100 p-6 rounded-3xl text-center shadow-sm"
            >
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#C44545] to-[#a33636] text-white font-black text-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#C44545]/20">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FAQ & CONTACT FORM ─── */}
      <section id="faqs-contact" className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
          
          {/* FAQ Column (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <SectionHeader tag="Got Questions?" title="Frequently Asked Questions" align="left" />
            <div className="border border-slate-100 bg-slate-50/50 p-6 rounded-3xl shadow-sm">
              {faqs.map((faq, idx) => (
                <FaqItem key={idx} q={faq.q} a={faq.a} />
              ))}
            </div>
            
            {/* Quick Contact Card */}
            <div className="pt-4">
              <div className="p-5 rounded-2xl border text-rose-600 bg-rose-50 border-rose-100 flex items-center gap-4 max-w-sm">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500 opacity-80">Email Support</p>
                  <a href={`mailto:${supportEmail}`} className="font-black text-xs md:text-sm mt-0.5 hover:underline break-all">{supportEmail}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column (Right) */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-lg shadow-slate-100/50">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Send Us a Message</h3>
              <p className="text-slate-500 text-xs md:text-sm mb-6">Fill out the quick form below and our team will connect with you within 24 business hours.</p>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Message Sent Successfully!</h4>
                  <p className="text-slate-500 text-xs md:text-sm mb-6">Our representative will call or email you soon.</p>
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
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Full Name *</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe"
                        className="w-full bg-white border border-slate-200 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Email Address *</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com"
                        className="w-full bg-white border border-slate-200 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Phone Number</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-white border border-slate-200 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Subject *</label>
                      <select
                        name="subject" value={formData.subject} onChange={handleChange} required
                        className="w-full bg-white border border-slate-200 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Your Message *</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} required rows={4} placeholder="Type details of your inquiry here..."
                      className="w-full bg-white border border-slate-200 focus:border-[#C44545]/40 focus:ring-2 focus:ring-[#C44545]/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full bg-[#C44545] hover:bg-[#b03a3a] disabled:opacity-75 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#C44545]/20 transition-all transform active:scale-95"
                  >
                    {submitting ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 mb-12">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#C44545] rounded-xl flex items-center justify-center p-1.5">
                <img src={logo} alt="Sootit" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="text-lg font-black tracking-tight">Sootit</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
              Connecting premium automotive service experts to vehicle owners across Central India with verification, convenience, and transparency.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#C44545]">Platform</h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-400">
              <li><button onClick={() => navigate('/auth?tab=user')} className="hover:text-white transition-colors">Book a Service</button></li>
              <li><button onClick={() => navigate('/auth?tab=vendor')} className="hover:text-white transition-colors">Become Partner Vendor</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Customer Dashboard</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#C44545]">Contact Support</h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-400">
              <li className="flex items-center gap-2"><Mail size={14} /> <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">{supportEmail}</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Sootit. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500 font-semibold">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/page/terms-of-service')} className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutContact;
