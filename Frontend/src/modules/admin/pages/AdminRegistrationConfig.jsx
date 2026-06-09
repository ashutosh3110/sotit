import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Trash2, 
    Globe, 
    FileText, 
    CheckCircle2, 
    X, 
    Menu, 
    ChevronDown, 
    Asterisk, 
    Eye, 
    Languages, 
    Settings,
    HelpCircle,
    Sliders,
    Type,
    Binary,
    List,
    CheckSquare,
    Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import toast from "react-hot-toast";

const standardIndianLanguages = [
  "Hindi", "English", "Bengali", "Marathi", "Telugu", "Tamil", "Urdu", 
  "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", 
  "Maithili", "Santali", "Kashmiri", "Nepali", "Sindhi", "Konkani", "Dogri", "Manipuri", "Bodo", "Sanskrit"
];

const AdminRegistrationConfig = () => {
    const [activeTab, setActiveTab] = useState('languages');
    const [languages, setLanguages] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Language forms
    const [newLangName, setNewLangName] = useState('');

    // Custom Field Modal and Form
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [optionsInput, setOptionsInput] = useState('');
    const [fieldForm, setFieldForm] = useState({
        label: '',
        name: '',
        type: 'text',
        options: [],
        role: 'all',
        required: false,
        placeholder: ''
    });

    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [showTypeMenu, setShowTypeMenu] = useState(false);

    // Fetch Configurations
    const fetchLanguages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/languages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLanguages(data.languages);
            }
        } catch (err) {
            toast.error("Failed to load languages");
        }
    };

    const fetchFields = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/fields`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFields(data.fields);
            }
        } catch (err) {
            toast.error("Failed to load custom fields");
        }
    };

    const initData = async () => {
        setLoading(true);
        await Promise.all([fetchLanguages(), fetchFields()]);
        setLoading(false);
    };

    useEffect(() => {
        initData();
    }, []);

    // Helper to auto camelCase label
    const handleLabelChange = (val) => {
        const camelCaseName = val
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, '');
        
        setFieldForm({
            ...fieldForm,
            label: val,
            name: camelCaseName.replace(/[^a-zA-Z0-9]/g, '')
        });
    };

    // Add Language
    const handleAddLanguage = async (name) => {
        const langName = name || newLangName;
        if (!langName.trim()) return toast.error("Enter a valid language name");

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/languages`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: langName.trim() })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${data.language.name} added!`);
                setNewLangName('');
                fetchLanguages();
            } else {
                toast.error(data.message || "Failed to add language");
            }
        } catch (err) {
            toast.error("Error adding language");
        }
    };

    // Delete Language
    const handleDeleteLanguage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this language?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/languages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Language deleted");
                fetchLanguages();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting language");
        }
    };

    // Add Custom Field
    const handleAddField = async (e) => {
        e.preventDefault();
        if (!fieldForm.label || !fieldForm.name) {
            return toast.error("Label and Name identifier are required");
        }

        // Parse options if select
        let finalOptions = [];
        if (fieldForm.type === 'select') {
            finalOptions = optionsInput
                .split(',')
                .map(o => o.trim())
                .filter(o => o.length > 0);
            
            if (finalOptions.length === 0) {
                return toast.error("Please provide comma-separated options for the select type field");
            }
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...fieldForm,
                    options: finalOptions
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Field "${data.field.label}" created!`);
                setIsFieldModalOpen(false);
                setFieldForm({
                    label: '',
                    name: '',
                    type: 'text',
                    options: [],
                    role: 'all',
                    required: false,
                    placeholder: ''
                });
                setOptionsInput('');
                fetchFields();
            } else {
                toast.error(data.message || "Failed to create field");
            }
        } catch (err) {
            toast.error("Error creating field");
        }
    };

    // Delete Custom Field
    const handleDeleteField = async (id) => {
        if (!window.confirm("Are you sure you want to delete this custom field?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/registration-config/fields/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Field deleted");
                fetchFields();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting field");
        }
    };

    // Unadded standard languages
    const activeLangNames = languages.map(l => l.name.toLowerCase());
    const unaddedLanguages = standardIndianLanguages.filter(l => !activeLangNames.includes(l.toLowerCase()));

    const getFieldTypeIcon = (type) => {
        switch (type) {
            case 'text': return Type;
            case 'number': return Binary;
            case 'select': return List;
            case 'checkbox': return CheckSquare;
            default: return FileText;
        }
    };

    const getRoleLabel = (role) => {
        if (role === 'all') return 'All Partners';
        if (role === 'driver') return 'Drivers only';
        if (role === 'mechanic') return 'Mechanics only';
        if (role === 'towing') return 'Towing only';
        if (role === 'rto') return 'RTO Agents only';
        if (role === 'legal') return 'Legal Advisors only';
        return role;
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activePage="registration-config" />

            <div className="flex-1 lg:ml-72 p-8">
                <div className="max-w-[1400px] mx-auto w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition-all shrink-0">
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Registration Settings.</h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">Manage active languages and custom partner fields</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {activeTab === 'languages' ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Type language name..."
                                        value={newLangName}
                                        onChange={(e) => setNewLangName(e.target.value)}
                                        className="pl-5 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#C44545]/5 focus:border-[#C44545] transition-all w-48 md:w-60 shadow-sm"
                                    />
                                    <button 
                                        onClick={() => handleAddLanguage()}
                                        className="bg-[#C44545] text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg shadow-[#C44545]/15 hover:scale-105 transition-all active:scale-95"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                        Add Custom
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsFieldModalOpen(true)}
                                    className="bg-[#C44545] text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg shadow-[#C44545]/15 hover:scale-105 transition-all active:scale-95"
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                    Add Custom Field
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-xl w-fit mb-8">
                        <button 
                            onClick={() => setActiveTab('languages')}
                            className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'languages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Languages size={14} />
                                Languages Configuration
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('fields')}
                            className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'fields' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Sliders size={14} />
                                Custom Registration Fields
                            </div>
                        </button>
                    </div>

                    {/* Content Panel */}
                    {activeTab === 'languages' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            {/* Active Languages */}
                            <div className="xl:col-span-2 space-y-4">
                                <h3 className="text-lg font-black text-slate-800 px-1">Active Languages</h3>
                                {languages.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {languages.map((lang) => (
                                            <motion.div 
                                                key={lang._id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-rose-50 text-[#C44545] rounded-xl flex items-center justify-center">
                                                        <Globe size={18} />
                                                    </div>
                                                    <span className="text-base font-black text-slate-800">{lang.name}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteLanguage(lang._id)}
                                                    className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                        <Globe className="text-slate-300 mb-4" size={40} />
                                        <h3 className="text-base font-black text-slate-800">No Custom Languages Added</h3>
                                        <p className="text-slate-400 text-xs mt-1">Partners will register with standard defaults unless you add options here.</p>
                                    </div>
                                )}
                            </div>

                            {/* Standard Indian Languages Recommendations */}
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-[#C44545]" />
                                    <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">Quick Add Indian Languages</h4>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mb-6">Click any language below to instantly add it to your active options on the registration form.</p>
                                
                                {unaddedLanguages.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                                        {unaddedLanguages.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => handleAddLanguage(lang)}
                                                className="bg-slate-50 hover:bg-rose-50 hover:text-[#C44545] border border-slate-100 hover:border-[#C44545]/20 text-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                            >
                                                <Plus size={12} />
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center border border-slate-100 rounded-2xl bg-slate-50 text-xs text-slate-400 font-bold">
                                        All Indian languages have been added.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Custom Fields Panel
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-800 px-1">Custom Registration Input Fields</h3>
                            {fields.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {fields.map((field) => {
                                        const TypeIcon = getFieldTypeIcon(field.type);
                                        return (
                                            <motion.div
                                                key={field._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center">
                                                                <TypeIcon size={18} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-black text-slate-800 flex items-center gap-1">
                                                                    {field.label}
                                                                    {field.required && <Asterisk size={12} className="text-red-500" />}
                                                                </h4>
                                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">key: {field.name}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteField(field._id)}
                                                            className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2.5 pt-2 border-t border-slate-50 text-xs font-bold text-slate-500">
                                                        <div className="flex items-center justify-between">
                                                            <span>Type:</span>
                                                            <span className="uppercase text-[10px] font-black text-slate-700 tracking-wider bg-slate-100 px-2 py-0.5 rounded">{field.type}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Target Role:</span>
                                                            <span className="uppercase text-[10px] font-black text-[#C44545] tracking-wider bg-rose-50 px-2 py-0.5 rounded">{getRoleLabel(field.role)}</span>
                                                        </div>
                                                        {field.placeholder && (
                                                            <div className="flex items-center justify-between">
                                                                <span>Placeholder:</span>
                                                                <span className="text-slate-400 italic">"{field.placeholder}"</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {field.type === 'select' && field.options && field.options.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-slate-50">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Dropdown Options</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {field.options.map((opt, i) => (
                                                                <span key={i} className="bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <Sliders className="text-slate-300 mb-4" size={40} />
                                    <h3 className="text-base font-black text-slate-800">No Custom Registration Fields</h3>
                                    <p className="text-slate-400 text-xs mt-1">Create additional partner information input forms fields here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Field Modal */}
            <AnimatePresence>
                {isFieldModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFieldModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="bg-[#C44545] p-8 text-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Add Custom Field</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Dynamic partner registration form input</p>
                                </div>
                                <button onClick={() => setIsFieldModalOpen(false)} className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddField} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Field Label (Display Name)</label>
                                    <input 
                                        type="text"
                                        value={fieldForm.label}
                                        onChange={(e) => handleLabelChange(e.target.value)}
                                        placeholder="e.g. Previous Aggregator Platform"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Database Identifier (Auto camelCase)</label>
                                    <input 
                                        type="text"
                                        value={fieldForm.name}
                                        onChange={(e) => setFieldForm({...fieldForm, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                                        placeholder="e.g. prevAggregatorPlatform"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                                        required
                                    />
                                </div>

                                {/* Type selection */}
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Input Field Type</label>
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            onClick={() => setShowTypeMenu(!showTypeMenu)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 flex items-center justify-between hover:bg-white transition-all"
                                        >
                                            <span className="uppercase tracking-widest text-xs font-black text-slate-600">
                                                {fieldForm.type}
                                            </span>
                                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showTypeMenu && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 right-0 z-[110] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2"
                                                >
                                                    {[
                                                        { id: 'text', label: 'Plain Text' },
                                                        { id: 'number', label: 'Numeric Value' },
                                                        { id: 'select', label: 'Select Options Dropdown' },
                                                        { id: 'checkbox', label: 'Single Checkbox (Yes/No)' }
                                                    ].map(type => (
                                                        <button 
                                                            key={type.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFieldForm({...fieldForm, type: type.id});
                                                                setShowTypeMenu(false);
                                                            }}
                                                            className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${fieldForm.type === type.id ? 'bg-rose-50 text-[#C44545]' : 'text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            {type.label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {fieldForm.type === 'select' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Dropdown Options (Comma-separated)</label>
                                        <input 
                                            type="text"
                                            value={optionsInput}
                                            onChange={(e) => setOptionsInput(e.target.value)}
                                            placeholder="e.g. Yes, No, Maybe  OR  Ola, Uber, Rapido"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Target Role */}
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">For Partner Role</label>
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            onClick={() => setShowRoleMenu(!showRoleMenu)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 flex items-center justify-between hover:bg-white transition-all"
                                        >
                                            <span className="uppercase tracking-widest text-xs font-black text-slate-600">
                                                {getRoleLabel(fieldForm.role)}
                                            </span>
                                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showRoleMenu && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 right-0 z-[110] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2"
                                                >
                                                    {[
                                                        { id: 'all', label: 'All Partners' },
                                                        { id: 'driver', label: 'Drivers' },
                                                        { id: 'mechanic', label: 'Mechanics' },
                                                        { id: 'towing', label: 'Towing' },
                                                        { id: 'rto', label: 'RTO Agents' },
                                                        { id: 'legal', label: 'Legal Advisors' }
                                                    ].map(role => (
                                                        <button 
                                                            key={role.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFieldForm({...fieldForm, role: role.id});
                                                                setShowRoleMenu(false);
                                                            }}
                                                            className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${fieldForm.role === role.id ? 'bg-rose-50 text-[#C44545]' : 'text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            {role.label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Placeholder Text (Optional)</label>
                                    <input 
                                        type="text"
                                        value={fieldForm.placeholder}
                                        onChange={(e) => setFieldForm({...fieldForm, placeholder: e.target.value})}
                                        placeholder="e.g. Enter details..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#C44545] transition-all"
                                    />
                                </div>

                                {/* Required Switch */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">Required Field</span>
                                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Enforce partners to fill this field</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFieldForm({...fieldForm, required: !fieldForm.required})}
                                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${fieldForm.required ? 'bg-[#C44545]' : 'bg-slate-300'}`}
                                    >
                                        <div className={`h-4.5 w-4.5 bg-white rounded-full absolute top-[3px] transition-all duration-300 ${fieldForm.required ? 'left-[26px]' : 'left-[3px]'}`} />
                                    </button>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full h-16 bg-[#C44545] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-[#C44545]/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                    <CheckCircle2 size={18} strokeWidth={3} />
                                    Add Input Field
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRegistrationConfig;
