"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// Why these coordinates? Delhi city center — Connaught Place area
// [longitude, latitude] — note MapLibre uses lng first, then lat (opposite of Google Maps)
const DELHI_CENTER: [number, number] = [77.209, 28.613]
const DEFAULT_ZOOM = 11

export interface MapBaseProps {
    onMapReady?: (map: maplibregl.Map) => void
    className?: string
    center?: [number, number]
    zoom?: number
}

export function MapBase({
    onMapReady,
    className = "w-full h-96 rounded-lg",
    center = DELHI_CENTER,
    zoom = DEFAULT_ZOOM,
}: MapBaseProps) {
    // useRef holds the DOM element MapLibre attaches to
    // and the map instance itself — we don't want re-renders when these change
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)

    useEffect(() => {
        // Guard: don't init if container isn't mounted yet
        if (!mapContainerRef.current) return
        // Guard: don't init twice (React StrictMode runs effects twice in dev)
        if (mapRef.current) return

        // Initialize the MapLibre map
        // style: OpenStreetMap tiles via a free public style — no API key needed
        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    "osm-tiles": {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [
                    {
                        id: "osm-tiles-layer",
                        type: "raster",
                        source: "osm-tiles",
                        minzoom: 0,
                        maxzoom: 19,
                    },
                ],
            },
            center,
            zoom,
        })

        // Add navigation controls (zoom in/out, compass)
        map.addControl(new maplibregl.NavigationControl(), "top-right")

        // Wait for map to fully load before letting parent add markers
        // This is important — adding markers before 'load' fires causes silent failures
        map.on("load", () => {
            if (onMapReady) onMapReady(map)
        })

        mapRef.current = map

        // Cleanup function — runs when component unmounts
        // Without this, the WebGL context leaks memory every time you navigate away
        return () => {
            map.remove()
            mapRef.current = null
        }
    }, []) // Empty deps: run once on mount only

    return (
        <div
            ref={mapContainerRef}
            className={className}
            // MapLibre needs explicit dimensions — it won't render in a zero-height container
            style={{ minHeight: "350px" }}
        />
    )
}
