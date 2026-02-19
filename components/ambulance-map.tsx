"use client"

import { useCallback } from "react"
import maplibregl from "maplibre-gl"
import { MapBase } from "@/components/map-base"

// What this file does:
// Renders ambulances as markers on a real map.
// Available ambulances pulse (CSS animation via a wrapper div).
// Clicking shows driver name, vehicle number, contact, and a call button.

export interface AmbulanceLocation {
  _id: string
  vehicleNumber: string
  type: "Basic" | "Advanced" | "Cardiac" | "Neonatal"
  status: "available" | "busy" | "offline"
  currentLocation: {
    coordinates: [number, number] // [longitude, latitude]
  }
  driver?: {
    name: string
    phone: string
  }
}

interface AmbulanceMapProps {
  ambulances: AmbulanceLocation[]
  onRequestPickup?: (ambulanceId: string) => void
}

// Maps ambulance type to an emoji for the marker
function getTypeEmoji(type: string): string {
  switch (type) {
    case "Cardiac": return "❤️"
    case "Neonatal": return "👶"
    case "Advanced": return "🚑"
    default: return "🚐"
  }
}

export function AmbulanceMap({ ambulances, onRequestPickup }: AmbulanceMapProps) {
  const handleMapReady = useCallback(
    (map: maplibregl.Map) => {
      ambulances.forEach((ambulance) => {
        const [lng, lat] = ambulance.currentLocation.coordinates
        const isAvailable = ambulance.status === "available"

        // Outer wrapper — used for the pulse animation on available ambulances
        // We use a wrapper because CSS animations on the marker element itself
        // conflict with MapLibre's positioning transforms
        const wrapper = document.createElement("div")
        wrapper.style.cssText = "position: relative; width: 36px; height: 36px;"

        // Pulse ring — only shown for available ambulances
        if (isAvailable) {
          const pulse = document.createElement("div")
          pulse.style.cssText = `
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: rgba(249, 115, 22, 0.3);
            animation: pulse 2s ease-in-out infinite;
          `
          wrapper.appendChild(pulse)

          // Inject keyframes once into the document
          if (!document.getElementById("ambulance-pulse-style")) {
            const style = document.createElement("style")
            style.id = "ambulance-pulse-style"
            style.textContent = `
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.4); opacity: 0.1; }
              }
            `
            document.head.appendChild(style)
          }
        }

        // Main marker circle
        const el = document.createElement("div")
        el.style.cssText = `
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: ${isAvailable ? "#f97316" : "#6b7280"};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        `
        el.innerHTML = getTypeEmoji(ambulance.type)
        wrapper.appendChild(el)

        // Popup content
        // The "Request Pickup" button uses a data attribute + event delegation
        // because we can't directly call React state from vanilla DOM
        const popupHTML = `
          <div style="font-family: system-ui; min-width: 190px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">
              ${getTypeEmoji(ambulance.type)} ${ambulance.vehicleNumber}
            </div>
            <div style="font-size: 12px; color: #555; margin-bottom: 3px;">
              Type: ${ambulance.type}
            </div>
            ${ambulance.driver ? `
              <div style="font-size: 12px; color: #555; margin-bottom: 3px;">
                👤 ${ambulance.driver.name}
              </div>
              <div style="font-size: 12px; margin-bottom: 8px;">
                📞 <a href="tel:${ambulance.driver.phone}" style="color: #2563eb;">
                  ${ambulance.driver.phone}
                </a>
              </div>
            ` : ""}
            <div style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 600;
              margin-bottom: ${isAvailable ? "10px" : "0"};
              background: ${isAvailable ? "#fff7ed" : "#f3f4f6"};
              color: ${isAvailable ? "#ea580c" : "#6b7280"};
            ">
              ${isAvailable ? "● Available" : "● Busy"}
            </div>
            ${isAvailable ? `
              <br/>
              <button
                data-ambulance-id="${ambulance._id}"
                onclick="window.__medireach_requestPickup && window.__medireach_requestPickup('${ambulance._id}')"
                style="
                  width: 100%;
                  padding: 6px 12px;
                  background: #f97316;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                "
              >
                Request Pickup
              </button>
            ` : ""}
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 20, closeButton: true })
          .setHTML(popupHTML)

        new maplibregl.Marker({ element: wrapper })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map)
      })

      // Expose the pickup callback to the window so the popup button can call it
      // This is the bridge between MapLibre's vanilla DOM and React
      if (onRequestPickup) {
        (window as any).__medireach_requestPickup = onRequestPickup
      }
    },
    [ambulances, onRequestPickup]
  )

  const available = ambulances.filter((a) => a.status === "available").length

  return (
    <div className="w-full space-y-3">
      <MapBase
        onMapReady={handleMapReady}
        className="w-full rounded-lg border border-border overflow-hidden"
      />

      {/* Status summary */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Available ({available})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span>Busy ({ambulances.length - available})</span>
        </div>
        <span className="ml-auto text-xs">Click markers for details</span>
      </div>
    </div>
  )
}
