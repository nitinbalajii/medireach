"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

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
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const ambulanceMarker = useRef<maplibregl.Marker | null>(null)

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            center: [ambulanceLocation.lng, ambulanceLocation.lat],
            zoom: 13,
        })

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), "top-right")

        // Add patient location marker (blue)
        new maplibregl.Marker({ color: "#3b82f6" })
            .setLngLat([patientLocation.lng, patientLocation.lat])
            .setPopup(new maplibregl.Popup().setHTML("<strong>Your Location</strong>"))
            .addTo(map.current)

        // Add hospital marker (green) if provided
        if (hospitalLocation) {
            new maplibregl.Marker({ color: "#22c55e" })
                .setLngLat([hospitalLocation.lng, hospitalLocation.lat])
                .setPopup(new maplibregl.Popup().setHTML("<strong>Destination Hospital</strong>"))
                .addTo(map.current)
        }

        // Add ambulance marker (red, animated)
        const el = document.createElement("div")
        el.className = "ambulance-marker"
        el.style.width = "40px"
        el.style.height = "40px"
        el.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTYgMjFoLThjLTEuMSAwLTItLjktMi0ydi0yLjY2NmMwLS4zNTIuMTQtLjY4OS4zODktLjk0M2w0LjI0NC00LjM1MWMuMzg2LS4zOTUuOTI2LS42MTggMS40ODgtLjYxOGgyLjc1OGMuNTYyIDAgMS4xMDIuMjIzIDEuNDg4LjYxOGw0LjI0NCA0LjM1MWMuMjQ5LjI1NC4zODkuNTkxLjM4OS45NDN2Mi42NjZjMCAxLjEtLjkgMi0yIDJ6Ii8+PHBhdGggZD0iTTggMTBoOCIvPjxwYXRoIGQ9Ik04IDE0aDgiLz48Y2lyY2xlIGN4PSI3IiBjeT0iMTgiIHI9IjIiLz48Y2lyY2xlIGN4PSIxNyIgY3k9IjE4IiByPSIyIi8+PC9zdmc+')"
        el.style.backgroundSize = "contain"
        el.style.backgroundRepeat = "no-repeat"
        el.style.animation = "pulse 2s infinite"

        ambulanceMarker.current = new maplibregl.Marker({ element: el })
            .setLngLat([ambulanceLocation.lng, ambulanceLocation.lat])
            .setPopup(new maplibregl.Popup().setHTML("<strong>🚑 Ambulance</strong>"))
            .addTo(map.current)

        // Fit bounds to show all markers
        const bounds = new maplibregl.LngLatBounds()
        bounds.extend([patientLocation.lng, patientLocation.lat])
        bounds.extend([ambulanceLocation.lng, ambulanceLocation.lat])
        if (hospitalLocation) {
            bounds.extend([hospitalLocation.lng, hospitalLocation.lat])
        }
        map.current.fitBounds(bounds, { padding: 50 })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update ambulance location when it changes
    useEffect(() => {
        if (ambulanceMarker.current && map.current) {
            // Animate marker movement
            ambulanceMarker.current.setLngLat([ambulanceLocation.lng, ambulanceLocation.lat])

            // Pan map to keep ambulance in view
            map.current.panTo([ambulanceLocation.lng, ambulanceLocation.lat], {
                duration: 1000,
            })
        }
    }, [ambulanceLocation])

    return (
        <>
            <div ref={mapContainer} className="w-full h-96 rounded-lg" />
            <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .ambulance-marker {
          cursor: pointer;
        }
      `}</style>
        </>
    )
}
