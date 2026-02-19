// Utility functions for traffic-aware routing

import type { TrafficRoute, TrafficAlert } from "../types"

/**
 * Check if current time is during peak hours
 */
export function isPeakHour(time: Date = new Date()): boolean {
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const currentTime = hours + minutes / 60

    // Peak hours: 8-10 AM and 5-8 PM
    return (
        (currentTime >= 8 && currentTime < 10) || (currentTime >= 17 && currentTime < 20)
    )
}

/**
 * Get traffic level based on time and route
 */
export function getTrafficLevel(
    time: Date = new Date()
): "low" | "moderate" | "severe" {
    const hours = time.getHours()

    // Simulate traffic patterns for Delhi
    if (hours >= 8 && hours < 10) return "severe" // Morning rush
    if (hours >= 17 && hours < 20) return "severe" // Evening rush
    if (hours >= 10 && hours < 17) return "moderate" // Daytime
    if (hours >= 20 && hours < 22) return "moderate" // Early evening
    return "low" // Night time
}

/**
 * Calculate ETA with traffic consideration
 * Updated for realistic Delhi traffic speeds
 */
export function calculateETAWithTraffic(
    distance: number,
    trafficLevel: "low" | "moderate" | "severe"
): number {
    // Realistic Delhi traffic speeds (km/h)
    // Based on real-world data: 25km in 50-60 mins
    const speeds = {
        low: 40, // Off-peak: 25km in ~37 mins
        moderate: 25, // Normal Delhi traffic: 25km in ~60 mins
        severe: 15, // Peak hour congestion: 25km in ~100 mins
    }

    const speed = speeds[trafficLevel]
    const timeInHours = distance / speed
    const timeInMinutes = Math.ceil(timeInHours * 60)

    return timeInMinutes
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const straightLineDistance = R * c

    // Apply 1.4x multiplier to approximate road distance
    return straightLineDistance * 1.4
}

/**
 * Find fastest route considering traffic
 */
export function findFastestRoute(
    startLocation: { lat: number; lng: number },
    endLocation: { lat: number; lng: number },
    currentTime: Date = new Date()
): TrafficRoute {
    const distance = calculateDistance(
        startLocation.lat,
        startLocation.lng,
        endLocation.lat,
        endLocation.lng
    )

    const trafficLevel = getTrafficLevel(currentTime)
    const durationInTraffic = calculateETAWithTraffic(distance, trafficLevel)
    const normalDuration = calculateETAWithTraffic(distance, "low")

    // Simulate route polyline (in production, use Google Maps Directions API)
    const polyline = generateSimplePolyline(startLocation, endLocation)

    // Get relevant traffic alerts
    const alerts = getTrafficAlerts(startLocation, endLocation)

    return {
        routeId: `route_${Date.now()}`,
        startLocation,
        endLocation,
        distance: Number(distance.toFixed(2)),
        duration: normalDuration,
        durationInTraffic,
        trafficLevel,
        polyline,
        alerts,
        isFastest: true,
    }
}

/**
 * Generate simple polyline between two points (for demo)
 * In production, use Google Maps Directions API
 */
function generateSimplePolyline(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
): Array<{ lat: number; lng: number }> {
    const steps = 5
    const polyline: Array<{ lat: number; lng: number }> = []

    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps
        polyline.push({
            lat: start.lat + (end.lat - start.lat) * ratio,
            lng: start.lng + (end.lng - start.lng) * ratio,
        })
    }

    return polyline
}

/**
 * Get traffic alerts for a route (simulated)
 */
function getTrafficAlerts(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
): TrafficAlert[] {
    // In production, fetch real traffic alerts from API
    const { trafficData } = require("../delhi-data")

    // Return common alerts (in production, filter by route)
    return trafficData.commonAlerts || []
}

/**
 * Compare multiple routes and return the fastest
 */
export function compareRoutes(
    routes: TrafficRoute[]
): TrafficRoute[] {
    const sortedRoutes = [...routes].sort(
        (a, b) => a.durationInTraffic - b.durationInTraffic
    )

    // Mark the fastest route
    return sortedRoutes.map((route, index) => ({
        ...route,
        isFastest: index === 0,
    }))
}

/**
 * Check if rerouting is needed based on traffic changes
 */
export function shouldReroute(
    currentRoute: TrafficRoute,
    alternativeRoute: TrafficRoute
): boolean {
    // Reroute if alternative is at least 5 minutes faster
    const timeSaved = currentRoute.durationInTraffic - alternativeRoute.durationInTraffic
    return timeSaved >= 5
}

/**
 * Get traffic color for UI display
 */
export function getTrafficColor(
    trafficLevel: "low" | "moderate" | "severe"
): string {
    switch (trafficLevel) {
        case "low":
            return "green"
        case "moderate":
            return "yellow"
        case "severe":
            return "red"
        default:
            return "gray"
    }
}

/**
 * Format ETA display
 */
export function formatETA(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
}

/**
 * Get route with traffic for emergency
 */
export function getEmergencyRoute(
    startLocation: { lat: number; lng: number },
    hospitalLocation: { lat: number; lng: number }
): {
    route: TrafficRoute
    estimatedArrival: Date
    trafficWarning: boolean
} {
    const route = findFastestRoute(startLocation, hospitalLocation)
    const estimatedArrival = new Date(Date.now() + route.durationInTraffic * 60 * 1000)
    const trafficWarning = route.trafficLevel === "severe"

    return {
        route,
        estimatedArrival,
        trafficWarning,
    }
}
