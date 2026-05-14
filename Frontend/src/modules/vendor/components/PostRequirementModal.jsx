import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Wrench, Truck, Calendar, Info, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
    driver: {
        title: "Find a Driver",
        icon: Car,
        fields: [
            { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Commercial'], placeholder: 'Select Vehicle' },
            { name: 'tripType', label: 'Trip Type', type: 'select', options: ['Local (Hourly)', 'Outstation', 'One Way'], placeholder: 'Select Trip Type' },
            { name: 'duration', label: 'Duration (Hours/Days)', type: 'text', placeholder: 'e.g. 4 Hours' }
        ]
    },
    mechanic: {
        title: "Hire a Mechanic",
        icon: Wrench,
        fields: [
            { name: 'vehicleModel', label: 'Vehicle Model', type: 'text', placeholder: 'e.g. Maruti Swift' },
            { name: 'issue', label: 'What is the issue?', type: 'select', options: ['Engine Check', 'Break Service', 'Oil Change', 'General Repair', 'Electrical'], placeholder: 'Select Issue' },
            { name: 'urgency', label: 'How urgent?', type: 'select', options: ['Immediate', 'Same Day', 'Flexible'], placeholder: 'Select Urgency' }
        ]
    },
    towing: {
        title: "Request Towing",
        icon: Truck,
        fields: [
            { name: 'vehicleType', label: 'Vehicle to Tow', type: 'select', options: ['Two Wheeler', 'Car', 'Heavy Vehicle'], placeholder: 'Select Vehicle' },
            { name: 'distance', label: 'Approx Distance (KM)', type: 'number', placeholder: 'e.g. 10' }
        ]
    }
};

const PostRequirementModal = ({ isOpen, onClose, onSubmit, selectedRole }) => {
    const config = ROLE_CONFIG[selectedRole] || ROLE_CONFIG.driver;
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({});
        } catch (error) {
            console.error("Submit Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-[#C44545] p-8 text-white relative">
                        <button onClick={onClose} className="absolute top-6 right-6 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <config.icon size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{config.title}</h2>
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Requirement Post</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            {config.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select 
                                            required
                                            value={formData[field.name] || ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:border-[#C44545]/20 focus:outline-none transition-all appearance-none"
                                        >
                                            <option value="">{field.placeholder}</option>
                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input 
                                            type={field.type}
                                            required
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:border-[#C44545]/20 focus:outline-none transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Fee Warning */}
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
                            <div className="h-10 w-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                                <Zap size={18} />
                            </div>
                            <p className="text-[10px] font-black text-rose-800 leading-relaxed uppercase tracking-tight">
                                Posting a requirement will deduct <span className="text-rose-600 underline">₹5.00</span> from your wallet as a platform fee.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-16 bg-[#C44545] text-white rounded-[1.2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C44545]/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Processing..." : "Post Requirement"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PostRequirementModal;
