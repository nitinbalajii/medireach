"use client"

import { MapPin, Hospital } from "lucide-react"

interface HospitalLocation {
  id: number
  name: string
  lat: number
  lng: number
  beds: number
  icuBeds: number
  oxygen: number
  type: string
}

interface HospitalMapProps {
  hospitals: HospitalLocation[]
  selectedHospitals?: number[]
}

export function HospitalMap({ hospitals, selectedHospitals }: HospitalMapProps) {
  const availableBedCount = hospitals.reduce((sum, h) => sum + h.beds, 0)

  return (
    <div className="w-full h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-border overflow-hidden relative">
      {/* Map SVG background */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        {/* Delhi map background pattern */}
        <defs>
          <pattern id="grid-hospital" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dcfce7" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid-hospital)" />

        {/* Stylized Delhi map area */}
        <circle cx="400" cy="300" r="180" fill="#bbf7d0" opacity="0.3" />
        <path
          d="M 350 250 Q 380 240 420 245 T 460 260 L 450 320 Q 420 340 380 345 Q 350 342 340 310 Z"
          fill="#86efac"
          opacity="0.2"
        />
      </svg>

      {/* Hospital markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {hospitals.map((hospital) => {
            // Delhi roughly: lat 28.4-28.8, lng 77.0-77.4
            const x = ((hospital.lng - 76.8) / 0.7) * 100
            const y = ((28.9 - hospital.lat) / 0.7) * 100

            const isSelected = selectedHospitals?.includes(hospital.id)
            const bedStatus = hospital.beds > 15 ? "good" : hospital.beds > 8 ? "fair" : "critical"
            const bedColor =
              bedStatus === "good" ? "bg-green-500" : bedStatus === "fair" ? "bg-yellow-500" : "bg-red-500"

            return (
              <div
                key={hospital.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${hospital.name} - ${hospital.beds} beds`}
              >
                <div
                  className={`relative group cursor-pointer transition-transform hover:scale-125 ${
                    isSelected ? "scale-125" : ""
                  }`}
                >
                  {/* Outer ring animation */}
                  <div
                    className={`absolute inset-0 rounded-full animate-pulse ${bedColor}`}
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "-20px",
                      left: "-20px",
                      opacity: 0.3,
                    }}
                  />

                  {/* Main marker */}
                  <div
                    className={`flex items-center justify-center rounded-full shadow-lg transition-all ring-2 ${bedColor} ring-offset-1`}
                    style={{
                      width: "40px",
                      height: "40px",
                      ringColor: bedColor,
                    }}
                  >
                    <Hospital className="w-5 h-5 text-white" fill="white" />
                  </div>

                  {/* Hospital name badge */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {hospital.name}
                  </div>

                  {/* Detailed tooltip on hover */}
                  <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    <div className="font-semibold">{hospital.name}</div>
                    <div className="text-gray-300 text-xs">{hospital.type}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      <div>Beds: {hospital.beds}</div>
                      <div>ICU: {hospital.icuBeds}</div>
                      <div>O₂: {hospital.oxygen}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend and info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 border border-border text-sm space-y-2 z-10">
        <div className="font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          Hospital Map
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Good Availability (&gt;15)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Fair (9-15)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Critical (&lt;8)</span>
        </div>
        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
          {hospitals.length} hospitals | {availableBedCount} beds available
        </div>
      </div>

      {/* Info message */}
      <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 max-w-xs">
        Hover over markers to see hospital details
      </div>
    </div>
  )
}
