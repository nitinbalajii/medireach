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
    // Build Google Maps directions embed URL
    const mapUrl = useMemo(() => {
        const origin = `${ambulanceLocation.lat},${ambulanceLocation.lng}`
        const destination = hospitalLocation
            ? `${hospitalLocation.lat},${hospitalLocation.lng}`
            : `${patientLocation.lat},${patientLocation.lng}`

        // If hospital exists, route through patient as a waypoint
        const waypoint = hospitalLocation
            ? `${patientLocation.lat},${patientLocation.lng}`
            : null

        let url = `https://www.google.com/maps/embed?pb=!1m0`

        // Use directions URL format for proper route display
        const dirUrl = new URL('https://www.google.com/maps/dir/')
        const originStr = `${ambulanceLocation.lat},${ambulanceLocation.lng}`
        const destStr = hospitalLocation
            ? `${hospitalLocation.lat},${hospitalLocation.lng}`
            : `${patientLocation.lat},${patientLocation.lng}`

        // Google Maps embed with directions
        // Format: /maps/dir/origin/waypoint/destination
        if (waypoint) {
            return `https://www.google.com/maps/embed/v1/directions?key=&origin=${originStr}&destination=${destStr}&waypoints=${waypoint}&mode=driving`
        }

        // Fallback: use the classic embed format that works without API key
        const embedUrl = `https://www.google.com/maps?saddr=${originStr}&daddr=${destStr}&dirflg=d&output=embed`
        return embedUrl
    }, [ambulanceLocation, patientLocation, hospitalLocation])

    // Classic Google Maps URL for the directions (non-embed, for fallback)
    const directionsUrl = useMemo(() => {
        const origin = `${ambulanceLocation.lat},${ambulanceLocation.lng}`
        const dest = hospitalLocation
            ? `${hospitalLocation.lat},${hospitalLocation.lng}`
            : `${patientLocation.lat},${patientLocation.lng}`
        const waypoint = hospitalLocation
            ? `${patientLocation.lat},${patientLocation.lng}`
            : null

        if (waypoint) {
            return `https://www.google.com/maps/dir/${origin}/${waypoint}/${dest}`
        }
        return `https://www.google.com/maps/dir/${origin}/${dest}`
    }, [ambulanceLocation, patientLocation, hospitalLocation])

    return (
        <div className="relative w-full">
            <iframe
                src={mapUrl}
                className="w-full h-96 rounded-lg border-0"
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ambulance Route Map"
            />

            {/* Legend overlay */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🚑</span>
                    <span className="font-medium">Ambulance Location</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="font-medium">Your Location</span>
                </div>
                {hospitalLocation && (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🏥</span>
                        <span className="font-medium">Hospital</span>
                    </div>
                )}
            </div>

            {/* Open in Google Maps button */}
            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 transition-colors"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open in Google Maps
            </a>
        </div>
    )
}
