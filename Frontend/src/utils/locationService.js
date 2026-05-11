/**
 * Location Service for DriverFinder
 * Handles Geolocation, Reverse Geocoding, and Permission states.
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";

export const locationService = {
    /**
     * Get current coordinates
     */
    getCurrentPosition: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    },

    /**
     * Convert Lat/Lng to readable address using Nominatim (Free Reverse Geocoding)
     */
    getAddressFromCoords: async (lat, lng) => {
        try {
            const response = await fetch(`${NOMINATIM_BASE_URL}?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: {
                    'Accept-Language': 'en'
                }
            });
            const data = await response.json();
            
            if (data && data.address) {
                const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || "Unknown Area";
                const city = data.address.city || data.address.state_district || data.address.state || "";
                return {
                    fullAddress: data.display_name,
                    shortAddress: `${area}, ${city}`,
                    city: city,
                    area: area
                };
            }
            return null;
        } catch (error) {
            console.error("Reverse Geocoding failed", error);
            return null;
        }
    }
};
