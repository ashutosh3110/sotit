import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getVendorData, setVendorData } from "../utils/vendorStore";
import toast from "react-hot-toast";
import OfflineOverlay from "../../../shared/components/OfflineOverlay";

const VendorProfile = () => {
  const navigate = useNavigate();
  const vendorData = getVendorData();
  const [vendor, setVendor] = useState(vendorData || { profile: {} });
  const [isOnline, setIsOnline] = useState(vendorData?.profile?.isOnline !== false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", pincode: "" },
    liveLocation: null
  });

  useEffect(() => {
    if (vendorData?.profile) {
        setFormData(prev => ({
            ...prev,
            name: vendorData.profile.name || "",
            email: vendorData.profile.email || "",
            phone: vendorData.profile.mobile || "",
            address: vendorData.profile.address || prev.address
        }));
    }
    fetchProfile();

    const handleUpdate = () => {
        const newData = getVendorData();
        setVendor(newData);
        setIsOnline(newData.profile.isOnline !== false);
    };
    window.addEventListener('vendor_data_updated', handleUpdate);
    return () => window.removeEventListener('vendor_data_updated', handleUpdate);
  }, []);

  const fetchProfile = async () => {
    const vId = vendorData?.profile?.id || vendorData?.profile?._id;
    if (!vId) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vId}`);
        const data = await response.json();
        if (response.ok) {
            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.mobile || "",
                address: data.address || { street: "", city: "", state: "", pincode: "" },
                liveLocation: data.liveLocation || null
            });
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    }
  };

  const handleToggleOnline = async () => {
    const vendorId = vendor.profile.id || vendor.profile._id;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/${vendorId}/toggle-status`, {
            method: 'PUT'
        });
        const data = await response.json();
        if (response.ok) {
            const updatedStore = getVendorData();
            updatedStore.profile.isOnline = data.isOnline;
            setVendorData(updatedStore);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    const tid = toast.loading("Capturing precise location...");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`);
          const data = await res.json();
          
          if (data && data.display_name) {
              const addr = data.address;
              setFormData(prev => ({
                  ...prev,
                  liveLocation: loc,
                  address: {
                      ...prev.address,
                      street: data.display_name,
                      city: addr.city || addr.town || addr.village || prev.address.city,
                      state: addr.state || prev.address.state,
                      pincode: addr.postcode || prev.address.pincode
                  }
              }));
              toast.success("Location Updated!", { id: tid });
          }
      } catch (err) {
          toast.error("Failed to fetch address", { id: tid });
      }
    }, () => { toast.error("Access denied", { id: tid }); });
  };

  const handleSave = async () => {
    const vId = vendorData?.profile?.id || vendorData?.profile?._id;
    const tid = toast.loading("Updating Profile...");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/profile/${vId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                address: formData.address,
                liveLocation: formData.liveLocation
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const updatedStore = { ...vendorData };
        updatedStore.profile.name = formData.name;
        setVendorData(updatedStore);

        toast.success("Profile Updated Successfully!", { id: tid });
        setTimeout(() => navigate('/vendor/settings'), 1500);
    } catch (error) {
        toast.error(error.message || "Failed to update profile", { id: tid });
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 text-neutral-900 font-inter relative">
      <OfflineOverlay isOnline={isOnline} onToggle={handleToggleOnline} />

      <div className={`transition-all duration-500 ${!isOnline ? 'blur-md grayscale pointer-events-none' : ''}`}>
          <div className="bg-white px-6 py-3 border-b border-neutral-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm shadow-black/[0.01]">
            <Link to="/vendor/settings" className="h-9 w-9 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 active:scale-90 transition-transform"><ArrowLeft size={18} /></Link>
            <h1 className="text-xl font-black tracking-tighter text-[#C44545]">My Profile.</h1>
          </div>

          <div className="px-6 py-8">
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="h-24 w-24 bg-[#C44545] rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-2xl shadow-[#C44545]/20">
                  {formData.name?.[0] || 'SG'}
                </div>
                <div className="absolute bottom-0 right-0 h-9 w-9 bg-[#A33636] rounded-2xl flex items-center justify-center text-white border-2 border-white cursor-pointer active:scale-90 transition-transform shadow-lg">
                  <Camera size={14} />
                </div>
              </div>
              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900 uppercase">{formData.name}</h2>
              <span className="text-[12px] font-black uppercase text-[#C44545] tracking-widest bg-rose-50 px-3 py-1 rounded-xl mt-2 border border-rose-100">Partner Account</span>
            </div>

            <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Full Name</label>
                 <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl shadow-black/[0.01]">
                    <User size={18} className="text-neutral-300" />
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Email Address</label>
                   <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl shadow-black/[0.01]">
                      <Mail size={18} className="text-neutral-300" />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Phone Number</label>
                   <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3 opacity-60 shadow-xl shadow-black/[0.01]">
                      <Phone size={18} className="text-neutral-300" />
                      <input type="tel" value={formData.phone} disabled className="bg-transparent text-sm font-bold w-full focus:outline-none" />
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Service Address</label>
                    <button onClick={fetchLiveLocation} className="flex items-center gap-1 text-[10px] font-black text-[#C44545] uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                      <Navigation size={10} /> GPS
                    </button>
                 </div>
                 <div className="space-y-4">
                    <textarea rows={2} value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none resize-none shadow-xl shadow-black/[0.01]" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="City" value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none shadow-xl shadow-black/[0.01]" />
                       <input type="text" placeholder="Pincode" value={formData.address.pincode} onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none shadow-xl shadow-black/[0.01]" />
                    </div>
                 </div>
              </div>

              <button onClick={handleSave} className="w-full bg-[#C44545] text-white rounded-[1.8rem] py-5 font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 shadow-2xl shadow-[#C44545]/20">
                 Save Profile <Save size={18} />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default VendorProfile;
