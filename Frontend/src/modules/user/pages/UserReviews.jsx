import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, User, Loader2, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserData } from "../utils/userStore";

const roleLabel = (role) => {
    const map = {
        driver: "Expert Driver",
        mechanic: "Mechanic",
        rto: "RTO Agent",
        legal: "Legal Advisor",
        owner: "Vehicle Owner",
    };
    return map[role?.toLowerCase()] || role || "Expert";
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusColor = (status) => {
    if (status === "completed") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "hired") return "bg-blue-50 text-blue-600 border-blue-100";
    if (status === "accepted") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-slate-50 text-slate-500 border-slate-100";
};

const avatarColors = [
    "bg-slate-900 text-white",
    "bg-[#C44545] text-white",
    "bg-indigo-600 text-white",
    "bg-emerald-700 text-white",
    "bg-amber-600 text-white",
];

const UserReviews = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const userData = getUserData();
                const token =
                    userData?.token ||
                    userData?.profile?.token ||
                    userData?.user?.token;

                if (!token) {
                    setError("Please login to view your expert history.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/services/user/reviews`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews);
                } else {
                    setError(data.message || "Failed to load reviews.");
                }
            } catch (err) {
                console.error(err);
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="bg-[#FAFBFD] min-h-screen pb-24 font-inter text-neutral-900">
            {/* Header */}
            <div className="px-5 pt-10 pb-5 flex items-center gap-3 border-b border-black/[0.03] sticky top-0 bg-[#FAFBFD]/80 backdrop-blur-md z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="h-9 w-9 bg-white border border-black/5 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                >
                    <ArrowLeft size={16} strokeWidth={3} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-black tracking-tighter">Rated Experts</h1>
                    {reviews.length > 0 && (
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                            {reviews.length} service{reviews.length !== 1 ? "s" : ""} found
                        </p>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 size={32} className="animate-spin text-[#C44545]" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                            Loading your experts...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-28 gap-3">
                        <div className="h-16 w-16 bg-rose-50 rounded-3xl flex items-center justify-center text-[#C44545] border border-rose-100">
                            <User size={28} />
                        </div>
                        <p className="text-sm font-black text-neutral-400 text-center">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 gap-4">
                        <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 border border-slate-100">
                            <PackageOpen size={32} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-base font-black text-neutral-700 tracking-tight">No Experts Yet</h3>
                            <p className="text-[11px] font-bold text-neutral-400 mt-1 tracking-wide">
                                Book a service to see your expert history here.
                            </p>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                {!loading && !error && reviews.map((rev, idx) => (
                    <motion.div
                        key={rev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-black/5 rounded-[2rem] p-5 shadow-xl shadow-black/[0.02] flex flex-col gap-4"
                    >
                        {/* Expert Info Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-11 w-11 ${avatarColors[idx % avatarColors.length]} rounded-2xl flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0`}>
                                    {rev.vendorName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[15px] font-black text-neutral-900 leading-none mb-1">
                                        {rev.vendorName}
                                    </h4>
                                    <span className="text-[11px] font-black uppercase text-neutral-400 tracking-widest leading-none">
                                        {roleLabel(rev.vendorRole)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColor(rev.status)}`}>
                                    {rev.status}
                                </span>
                                <span className="text-[10px] font-black text-neutral-400 flex items-center gap-1">
                                    <Clock size={9} />
                                    {timeAgo(rev.date)}
                                </span>
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={12}
                                        className={
                                            i < Math.round(rev.vendorRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-neutral-100 text-neutral-200"
                                        }
                                    />
                                ))}
                            </div>
                            {rev.vendorRating > 0 ? (
                                <span className="text-[11px] font-black text-neutral-500">
                                    {rev.vendorRating.toFixed(1)}{" "}
                                    <span className="font-bold text-neutral-300">
                                        ({rev.vendorTotalReviews} review{rev.vendorTotalReviews !== 1 ? "s" : ""})
                                    </span>
                                </span>
                            ) : (
                                <span className="text-[11px] font-bold text-neutral-300">No rating yet</span>
                            )}
                        </div>

                        {/* Service Details (if any) */}
                        {(rev.details?.vehicleNumber || rev.details?.from || rev.details?.city) && (
                            <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                                {rev.details.vehicleNumber && (
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        Vehicle: <span className="text-slate-700">{rev.details.vehicleNumber}</span>
                                    </p>
                                )}
                                {rev.details.from && (
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        From: <span className="text-slate-700">{rev.details.from}</span>
                                    </p>
                                )}
                                {rev.details.city && (
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        City: <span className="text-slate-700">{rev.details.city}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserReviews;
