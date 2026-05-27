import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationService } from '../utils/locationService';


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
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
