import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationService } from '../utils/locationService';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldAlert, Navigation, Loader2 } from 'lucide-react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'granted', 'denied', 'error'
    const [error, setError] = useState(null);

    const fetchLocation = async () => {
        setStatus('loading');
        try {
            const coords = await locationService.getCurrentPosition();
            const addressData = await locationService.getAddressFromCoords(coords.lat, coords.lng);
            
            if (addressData) {
                const finalData = { ...coords, ...addressData };
                setLocation(finalData);
                localStorage.setItem('userLocation', JSON.stringify(finalData));
                setStatus('granted');
            } else {
                throw new Error("Could not detect address");
            }
        } catch (err) {
            console.error("Location Error:", err);
            setError(err.message);
            setStatus(err.code === 1 ? 'denied' : 'error');
        }
    };

    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            setLocation(JSON.parse(savedLocation));
            setStatus('granted');
        } else {
            fetchLocation();
        }
    }, []);

    return (
        <LocationContext.Provider value={{ location, status, fetchLocation }}>
            {children}
            
            {/* Permission Denied UI Overlay */}
            <AnimatePresence>
                {status === 'denied' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center px-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 h-32 w-32 bg-[#C44545]/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                            
                            <div className="h-20 w-20 bg-[#C44545] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#C44545]/20">
                                <ShieldAlert size={40} strokeWidth={2.5} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Enable Location Access</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                                We need your location to find the nearest drivers, mechanics, and towing services for you.
                            </p>

                            <div className="space-y-4">
                                <button 
                                    onClick={fetchLocation}
                                    className="w-full h-16 bg-[#C44545] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C44545]/20 active:scale-95 transition-all"
                                >
                                    <Navigation size={18} fill="white" />
                                    Enable Location
                                </button>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="w-full h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Not Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center"
                    >
                        <div className="h-24 w-24 relative flex items-center justify-center mb-6">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-[#C44545] rounded-full blur-2xl"
                            />
                            <div className="bg-[#C44545] h-12 w-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#C44545]/40 relative z-10">
                                <MapPin size={24} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tighter animate-pulse">Detecting your location...</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Connecting to satellites</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
