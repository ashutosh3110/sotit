import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Filter, Briefcase, Clock, Wallet, ShieldCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { applyForJob, getVendorData, setVendorData } from "../utils/vendorStore";
import { getVendorConfig } from "../utils/vendorConfig";
import OfflineOverlay from "../../../shared/components/OfflineOverlay";
import toast from "react-hot-toast";
import { socket, connectSocket, disconnectSocket } from "../../../utils/socket";

const VendorJobs = () => {
  const [success, setSuccess] = useState(null);
  const [vendor, setVendor] = useState(getVendorData() || {
    profile: { name: "Guest", role: "driver", id: '' },
    wallet: 0
  });

  const [requests, setRequests] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const config = getVendorConfig(vendor.profile.role);

  const fetchRequests = useCallback(async () => {
    const token = vendor?.profile?.token;
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/vendor/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [vendor?.profile?.token]);

  const [isOnline, setIsOnline] = useState(vendor.profile.isOnline !== false);

  useEffect(() => {
    if (isOnline) {
      fetchRequests();

      // Request Notification Permission
      if ("Notification" in window && Notification.permission === "default") {
        try {
          Notification.requestPermission();
        } catch (err) {
          console.warn("Notification.requestPermission failed:", err);
        }
      }

      // Socket Connection
      const vendorId = vendor?.profile?.id || vendor?.profile?._id;
      if (vendorId) {
        connectSocket(vendorId);
        
        socket.on('new_lead', (data) => {
          console.log("New Lead in Jobs:", data);
          
          // Audio Alert
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(e => console.log("Audio play failed:", e));

          toast.success(`New Marketplace Lead from ${data.customerName}!`, { 
            icon: '💼',
            duration: 6000,
            style: {
                borderRadius: '1.5rem',
                background: '#0f172a',
                color: '#fff',
                fontWeight: '900',
                fontSize: '11px',
                padding: '16px 20px'
            }
          });

          // Browser Push
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("New Lead Available! 💼", {
                body: `${data.customerName} is looking for a ${data.role}.`,
              });
            } catch (err) {
              console.warn("Could not show browser push notification:", err);
            }
          }

          fetchRequests();
        });
      }
    } else {
      disconnectSocket();
    }

    return () => {
      socket.off('new_lead');
      disconnectSocket();
    };
  }, [isOnline, vendor?.profile?.id, fetchRequests]);

  useEffect(() => {
    const handleUpdate = () => {
        const newData = getVendorData();
        setVendor(newData);
        setIsOnline(newData.profile.isOnline !== false);
    };
    window.addEventListener('vendor_data_updated', handleUpdate);
    return () => window.removeEventListener('vendor_data_updated', handleUpdate);
  }, []);

  const handleApply = async (requestId) => {
    const token = vendor?.profile?.token;
    if (!token) {
        toast.error("Session expired. Please login again.");
        return;
    }

    const tid = toast.loading("Initiating application fee...");

    try {
      // 1. Create Acceptance Order (Reuse the acceptance fee logic)
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/services/create-acceptance-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
          throw new Error(orderData.message || "Failed to initiate payment");
      }

      toast.dismiss(tid);

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Sootit Partner",
        description: "Job Application Fee",
        order_id: orderData.order.id,
        handler: async (response) => {
            const vtid = toast.loading("Verifying payment & applying...");
            try {
                const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/services/verify-acceptance-payment`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...response,
                        requestId
                    })
                });
                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    toast.success("Hired Successfully!", { id: vtid });
                    setSuccess(requestId);
                    setTimeout(() => {
                        setSuccess(null);
                        fetchRequests();
                    }, 2000);
                } else {
                    toast.error(verifyData.message || "Verification failed", { id: vtid });
                }
            } catch (err) {
                console.error("Verification Error:", err);
                toast.error("Failed to verify payment", { id: vtid });
            }
        },
        prefill: {
            name: vendor.profile.name,
            contact: vendor.profile.mobile,
        },
        theme: {
            color: "#C44545",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
          toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error("Apply Error:", err);
      toast.error(err.message || "Server error", { id: tid });
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

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 font-inter relative">
      <OfflineOverlay isOnline={isOnline} onToggle={handleToggleOnline} />

      <AnimatePresence>
        {success && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-0 left-0 w-full px-4 z-[100]">
            <div className="bg-[#C44545] text-white rounded-[2rem] p-5 shadow-2xl shadow-black/20 text-center font-black uppercase text-[12px] tracking-widest border border-white/10 backdrop-blur-md">
              Application Submitted! Professional Notified.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-500 ${!isOnline ? 'blur-sm grayscale' : ''}`}>
          <div className="bg-white px-6 pt-6 pb-6 border-b border-neutral-100 sticky top-0 z-10 shadow-sm shadow-black/[0.02]">
             <div className="flex items-center gap-2 mb-3">
                <div className={`h-2 w-2 rounded-full bg-[#C44545] animate-pulse`} />
                <span className="text-[13px] font-black uppercase text-neutral-600 tracking-[0.2em]">{config.label} Marketplace</span>
             </div>
             <h1 className="text-2xl font-black mb-3 text-neutral-900 tracking-tighter">Job Board.</h1>
             <div className="flex gap-2">
                <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                   <Search size={18} className="text-[#C44545]" strokeWidth={2.5} />
                   <input type="text" placeholder={`Search leads...`} className="bg-transparent text-sm font-bold w-full focus:outline-none placeholder:text-[#C44545]/50" />
                </div>
                 <button className="h-12 w-12 bg-[#C44545] rounded-2xl flex items-center justify-center text-white active:scale-95 transition-transform">
                    <Filter size={20} />
                 </button>
             </div>
          </div>

          <div className="p-6 space-y-5">
            {requests.length > 0 ? requests.map((job, i) => (
              <motion.div 
                key={job._id} 
                className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-5 shadow-xl shadow-black/[0.01] relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 h-20 w-20 bg-white/40 rounded-bl-[3rem] -mr-10 -mt-10" />
                 <div className="flex justify-between items-start mb-2 relative z-10">
                     <div className="flex items-center gap-2">
                       <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-xl shadow-sm ${i === 0 ? 'bg-[#C44545] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {i === 0 ? 'New Lead' : 'Available'}
                       </span>
                    </div>
                     <span className="text-[12px] font-bold text-neutral-400 flex items-center gap-1">
                       <Clock size={12} /> {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-lg font-black tracking-tight leading-tight mb-1 uppercase">{job.role} Required</h3>
                    <p className="text-[14px] font-medium text-neutral-600 mb-3 leading-relaxed tracking-tight">Lead from {job.details?.name || job.requesterId?.name || 'Customer'}.</p>
                    <div className="flex items-center gap-2 text-neutral-500 mb-4 pb-4 border-b border-neutral-50">
                       <MapPin size={14} className="text-neutral-400" />
                       <span className="text-[14px] font-bold">Verified Lead • <span className="text-[#C44545] font-black">₹9 Application Fee</span></span>
                    </div>
                    {job.details && Object.keys(job.details).length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-2">
                            {Object.entries(job.details).map(([k, v]) => (
                                <div key={k} className="bg-white/80 p-2 rounded-xl border border-rose-100/50">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{k}</p>
                                    <p className="text-[10px] font-bold text-slate-700 truncate">{v}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-2xl border border-rose-100">
                          <ShieldCheck size={14} className="text-[#C44545]" />
                          <span className="text-[12px] font-bold uppercase text-[#C44545] tracking-tight">Active</span>
                       </div>
                       <button onClick={() => handleApply(job._id)} className="bg-[#C44545] text-white px-8 py-3 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-[#C44545]/20">
                          {success === job._id ? 'Accepted!' : 'Apply Now'}
                      </button>
                   </div>
                 </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Briefcase size={32} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No marketplace leads available</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default VendorJobs;
