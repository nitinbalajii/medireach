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

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        // Use CARTO Voyager — closest free style to Google Maps
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            center: [
                (ambulanceLocation.lng + patientLocation.lng) / 2,
                (ambulanceLocation.lat + patientLocation.lat) / 2,
            ],
            zoom: 12,
            attributionControl: false,
        })

        map.current.addControl(new maplibregl.NavigationControl(), "top-right")
        map.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right")

        const m = map.current

        // ----- Custom marker helper -----
        function createMarker(emoji: string, label: string, color: string, size: number): HTMLDivElement {
            const container = document.createElement("div")
            container.style.display = "flex"
            container.style.flexDirection = "column"
            container.style.alignItems = "center"
            container.style.cursor = "pointer"

            const icon = document.createElement("div")
            icon.style.width = `${size}px`
            icon.style.height = `${size}px`
            icon.style.borderRadius = "50%"
            icon.style.background = color
            icon.style.display = "flex"
            icon.style.alignItems = "center"
            icon.style.justifyContent = "center"
            icon.style.fontSize = `${size * 0.5}px`
            icon.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
            icon.style.border = "3px solid white"
            icon.textContent = emoji

            const tag = document.createElement("div")
            tag.style.marginTop = "4px"
            tag.style.padding = "2px 8px"
            tag.style.borderRadius = "4px"
            tag.style.background = "white"
            tag.style.boxShadow = "0 1px 4px rgba(0,0,0,0.2)"
            tag.style.fontSize = "11px"
            tag.style.fontWeight = "600"
            tag.style.color = "#1f2937"
            tag.style.whiteSpace = "nowrap"
            tag.textContent = label

            container.appendChild(icon)
            container.appendChild(tag)
            return container
        }

        // ----- Add markers -----
        const ambEl = createMarker("🚑", "Ambulance", "#dc2626", 44)
        ambEl.style.animation = "ambPulse 2s infinite"
        new maplibregl.Marker({ element: ambEl, anchor: "bottom" })
            .setLngLat([ambulanceLocation.lng, ambulanceLocation.lat])
            .addTo(m)

        new maplibregl.Marker({
            element: createMarker("📍", "You", "#2563eb", 40),
            anchor: "bottom",
        })
            .setLngLat([patientLocation.lng, patientLocation.lat])
            .addTo(m)

        if (hospitalLocation) {
            new maplibregl.Marker({
                element: createMarker("🏥", "Hospital", "#16a34a", 40),
                anchor: "bottom",
            })
                .setLngLat([hospitalLocation.lng, hospitalLocation.lat])
                .addTo(m)
        }

        // ----- Fit bounds -----
        const bounds = new maplibregl.LngLatBounds()
        bounds.extend([ambulanceLocation.lng, ambulanceLocation.lat])
        bounds.extend([patientLocation.lng, patientLocation.lat])
        if (hospitalLocation) {
            bounds.extend([hospitalLocation.lng, hospitalLocation.lat])
        }
        m.fitBounds(bounds, { padding: 80 })

        // ----- Fetch actual road route from OSRM (free) -----
        m.on("load", async () => {
            if (!map.current) return

            // Build waypoints: ambulance → patient → hospital
            const waypoints: [number, number][] = [
                [ambulanceLocation.lng, ambulanceLocation.lat],
                [patientLocation.lng, patientLocation.lat],
            ]
            if (hospitalLocation) {
                waypoints.push([hospitalLocation.lng, hospitalLocation.lat])
            }

            const coordsStr = waypoints.map((w) => `${w[0]},${w[1]}`).join(";")
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`

            try {
                const res = await fetch(osrmUrl)
                const data = await res.json()

                if (data.code === "Ok" && data.routes?.[0]) {
                    const route = data.routes[0]

                    // Add route shadow (thick, semi-transparent)
                    map.current!.addSource("route-shadow", {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: route.geometry,
                        },
                    })
                    map.current!.addLayer({
                        id: "route-shadow",
                        type: "line",
                        source: "route-shadow",
                        layout: { "line-join": "round", "line-cap": "round" },
                        paint: {
                            "line-color": "#1d4ed8",
                            "line-width": 10,
                            "line-opacity": 0.25,
                        },
                    })

                    // Add main route line (thick blue, like Google Maps)
                    map.current!.addSource("route", {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: route.geometry,
                        },
                    })
                    map.current!.addLayer({
                        id: "route-line",
                        type: "line",
                        source: "route",
                        layout: { "line-join": "round", "line-cap": "round" },
                        paint: {
                            "line-color": "#4285F4",
                            "line-width": 5,
                        },
                    })

                    // Add route border for depth
                    map.current!.addLayer({
                        id: "route-border",
                        type: "line",
                        source: "route",
                        layout: { "line-join": "round", "line-cap": "round" },
                        paint: {
                            "line-color": "#1a73e8",
                            "line-width": 7,
                            "line-opacity": 0.4,
                        },
                    }, "route-line")

                    // Fit to the route geometry bounds
                    const coords = route.geometry.coordinates as [number, number][]
                    const routeBounds = new maplibregl.LngLatBounds()
                    coords.forEach((c) => routeBounds.extend(c))
                    map.current!.fitBounds(routeBounds, { padding: 80 })
                }
            } catch (err) {
                console.error("OSRM routing failed, drawing straight line fallback:", err)
                // Fallback: straight line
                const fallbackCoords: [number, number][] = [
                    [ambulanceLocation.lng, ambulanceLocation.lat],
                    [patientLocation.lng, patientLocation.lat],
                ]
                if (hospitalLocation) {
                    fallbackCoords.push([hospitalLocation.lng, hospitalLocation.lat])
                }

                map.current!.addSource("route", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: { type: "LineString", coordinates: fallbackCoords },
                    },
                })
                map.current!.addLayer({
                    id: "route-line",
                    type: "line",
                    source: "route",
                    layout: { "line-join": "round", "line-cap": "round" },
                    paint: {
                        "line-color": "#4285F4",
                        "line-width": 5,
                        "line-dasharray": [2, 2],
                    },
                })
            }
        })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [ambulanceLocation, patientLocation, hospitalLocation])

    return (
        <>
            <div ref={mapContainer} className="w-full h-96 rounded-lg" />
            <style jsx global>{`
                @keyframes ambPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
            `}</style>
        </>
    )
}
