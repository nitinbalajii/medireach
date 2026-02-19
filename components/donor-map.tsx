"use client"

import { useCallback } from "react"
import maplibregl from "maplibre-gl"
import { MapBase } from "@/components/map-base"

interface DonorLocation {
  id: string
  name: string
  blood: string
  lat: number
  lng: number
  available: boolean
}

interface DonorMapProps {
  donors: DonorLocation[]
}

export function DonorMap({ donors }: DonorMapProps) {
  const handleMapReady = useCallback(
    (map: maplibregl.Map) => {
      donors.forEach((donor) => {
        const el = document.createElement("div")
        el.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${donor.available ? "#dc2626" : "#9ca3af"};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        `
        el.innerHTML = "🩸"
        el.title = `${donor.name} — ${donor.blood}`

        const popupHTML = `
          <div style="font-family: system-ui; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #111;">
              ${donor.name}
            </div>
            <div style="font-size: 13px; margin-bottom: 4px;">
              🩸 Blood Group: <strong>${donor.blood}</strong>
            </div>
            <div style="
              display: inline-block;
              padding: 2px 10px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 600;
              background: ${donor.available ? "#dcfce7" : "#f3f4f6"};
              color: ${donor.available ? "#16a34a" : "#6b7280"};
            ">
              ${donor.available ? "✓ Available Now" : "✗ Unavailable"}
            </div>
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 18, closeButton: true })
          .setHTML(popupHTML)

        new maplibregl.Marker({ element: el })
          .setLngLat([donor.lng, donor.lat])
          .setPopup(popup)
          .addTo(map)
      })
    },
    [donors]
  )

  if (donors.length === 0) {
    return (
      <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🩸</div>
          <p>No donors to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      <MapBase
        onMapReady={handleMapReady}
        className="w-full rounded-lg border border-border overflow-hidden"
      />

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Unavailable</span>
        </div>
        <span className="ml-auto">{donors.length} donors shown</span>
      </div>
    </div>
  )
}
