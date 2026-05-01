"use client"

import { useMemo } from "react"

interface AmbulanceLiveTrackerProps {
    ambulanceLocation: { lat: number; lng: number }
    patientLocation: { lat: number; lng: number }
    hospitalLocation?: { lat: number; lng: number }
}

export default function AmbulanceLiveTracker({
    ambulanceLocation,
    patientLocation,
    hospitalLocation,
}: AmbulanceLiveTrackerProps) {
    // Generate the "pb" string for Google Maps Directions Embed (No API key required)
    // Format: origin (amb) -> waypoint (patient) -> destination (hospital)
    const mapEmbedUrl = useMemo(() => {
        const amb = ambulanceLocation
        const pat = patientLocation
        const hosp = hospitalLocation || patientLocation

        // Build the Directions URL using the consumer maps format which provides the best UI
        // saddr = source, daddr = destination + waypoints
        let url = `https://maps.google.com/maps?saddr=${amb.lat},${amb.lng}&daddr=${pat.lat},${pat.lng}`
        
        if (hospitalLocation) {
            url += `+to:${hosp.lat},${hosp.lng}`
        }

        url += `&hl=en&t=&z=14&ie=UTF8&iwloc=&output=embed`
        
        return url
    }, [ambulanceLocation, patientLocation, hospitalLocation])

    const directionsUrl = useMemo(() => {
        const amb = `${ambulanceLocation.lat},${ambulanceLocation.lng}`
        const pat = `${patientLocation.lat},${patientLocation.lng}`
        const hosp = hospitalLocation ? `${hospitalLocation.lat},${hospitalLocation.lng}` : null

        if (hosp) {
            return `https://www.google.com/maps/dir/${amb}/${pat}/${hosp}`
        }
        return `https://www.google.com/maps/dir/${amb}/${pat}`
    }, [ambulanceLocation, patientLocation, hospitalLocation])

    return (
        <div className="relative w-full group">
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg -z-10" />
            <iframe
                src={mapEmbedUrl}
                className="w-full h-[500px] rounded-lg border-2 border-gray-100 shadow-inner"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ambulance Live Tracking"
            />

            {/* Premium Legend Overlay */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-4 space-y-3 transition-all group-hover:shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-lg">🚑</div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Ambulance</p>
                        <p className="text-xs font-semibold text-gray-900">En Route</p>
                    </div>
                </div>
                <div className="h-4 w-[2px] bg-gray-200 ml-4" />
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">📍</div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pickup</p>
                        <p className="text-xs font-semibold text-gray-900">Your Location</p>
                    </div>
                </div>
                {hospitalLocation && (
                    <>
                        <div className="h-4 w-[2px] bg-gray-200 ml-4" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-lg">🏥</div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Destination</p>
                                <p className="text-xs font-semibold text-gray-900">{hospitalLocation.lat.toString().slice(0, 5)}...</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Action Button */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View in Maps App
                </a>
            </div>
        </div>
    )
}
