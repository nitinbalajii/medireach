"use client"

import { useCallback } from "react"
import maplibregl from "maplibre-gl"
import { MapBase } from "@/components/map-base"

// What this file does:
// Takes an array of hospitals (from the API) and renders them as
// color-coded markers on a real MapLibre map centered on Delhi.
// Green = emergency ward open, Red = closed.
// Clicking a marker shows a popup with hospital details.

export interface HospitalLocation {
  _id: string
  name: string
  address: string
  area: string
  contact: string
  emergencyWardOpen: boolean
  specialisations?: string[]
  rating?: number
  location: {
    coordinates: [number, number] // [longitude, latitude]
  }
}

interface HospitalMapLibreProps {
  hospitals: HospitalLocation[]
}

export function HospitalMapLibre({ hospitals }: HospitalMapLibreProps) {
  // onMapReady is called by MapBase once the map tiles have loaded
  // This is where we add our markers — doing it before 'load' fires causes silent failures
  const handleMapReady = useCallback(
    (map: maplibregl.Map) => {
      hospitals.forEach((hospital) => {
        const [lng, lat] = hospital.location.coordinates

        // Create a custom HTML element for the marker
        // Why custom HTML instead of default marker? We want color-coding
        const el = document.createElement("div")
        el.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${hospital.emergencyWardOpen ? "#16a34a" : "#dc2626"};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        `
        el.innerHTML = "🏥"
        el.title = hospital.name

        // Build popup HTML — shown when user clicks the marker
        // We include specialisations, contact, and emergency status
        const specialties = hospital.specialisations?.slice(0, 3).join(", ") || "General"
        const popupHTML = `
          <div style="font-family: system-ui; min-width: 200px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #111;">
              ${hospital.name}
            </div>
            <div style="font-size: 12px; color: #555; margin-bottom: 4px;">
              📍 ${hospital.area}
            </div>
            <div style="font-size: 12px; color: #555; margin-bottom: 4px;">
              🏷️ ${specialties}
            </div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              📞 <a href="tel:${hospital.contact}" style="color: #2563eb;">${hospital.contact}</a>
            </div>
            <div style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 600;
              background: ${hospital.emergencyWardOpen ? "#dcfce7" : "#fee2e2"};
              color: ${hospital.emergencyWardOpen ? "#16a34a" : "#dc2626"};
            ">
              ${hospital.emergencyWardOpen ? "✓ Emergency Open" : "✗ Emergency Closed"}
            </div>
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 18, closeButton: true })
          .setHTML(popupHTML)

        // Attach marker to map
        new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map)
      })
    },
    [hospitals]
  )

  if (hospitals.length === 0) {
    return (
      <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🏥</div>
          <p>No hospitals to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Map */}
      <MapBase
        onMapReady={handleMapReady}
        className="w-full rounded-lg border border-border overflow-hidden"
      />

      {/* Legend — explains the color coding */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Emergency Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span>Emergency Closed</span>
        </div>
        <span className="ml-auto">{hospitals.length} hospitals shown</span>
      </div>
    </div>
  )
}
