// Utility functions for emergency features

/**
 * Trigger SOS mode with all emergency actions
 */
export async function triggerEmergencySOS(
    userLocation: { lat: number; lng: number },
    emergencyContacts: Array<{ name: string; phone: string }>,
    patientName?: string
): Promise<{
    success: boolean
    actions: {
        locationDetected: boolean
        ambulanceRequested: boolean
        smsSent: boolean
        hospitalFound: boolean
    }
    nearestHospital?: any
    error?: string
}> {
    const actions = {
        locationDetected: !!userLocation,
        ambulanceRequested: false,
        smsSent: false,
        hospitalFound: false,
    }

    try {
        // Simulate ambulance request
        actions.ambulanceRequested = true

        // Simulate SMS sending
        if (emergencyContacts.length > 0) {
            actions.smsSent = await sendEmergencySMS(
                emergencyContacts[0].phone,
                userLocation,
                patientName
            )
        }

        // Find nearest hospital
        const nearestHospital = await findNearestWithCapacity(userLocation)
        actions.hospitalFound = !!nearestHospital

        return {
            success: true,
            actions,
            nearestHospital,
        }
    } catch (error) {
        return {
            success: false,
            actions,
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}

/**
 * Send emergency SMS (simulated - requires Twilio in production)
 */
export async function sendEmergencySMS(
    phoneNumber: string,
    location: { lat: number; lng: number },
    patientName?: string
): Promise<boolean> {
    // In production, this would use Twilio API
    console.log("Sending emergency SMS to:", phoneNumber)
    console.log("Location:", location)
    console.log("Patient:", patientName || "Unknown")

    // Simulate SMS sending
    const message = `🚨 EMERGENCY ALERT: ${patientName || "Someone"} needs help at location: ${location.lat}, ${location.lng}. An ambulance has been requested. Please respond immediately.`

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("SMS sent:", message)
    return true
}

/**
 * Find nearest hospital with available capacity
 */
export async function findNearestWithCapacity(
    userLocation: { lat: number; lng: number },
    requiredResource?: "icu" | "oxygen" | "ventilators" | "trauma"
): Promise<any | null> {
    // Import hospitals dynamically to avoid circular dependency
    const { hospitals } = await import("../delhi-data")

    const hospitalsWithDistance = hospitals
        .filter((h) => {
            if (!requiredResource) return h.emergencyWardOpen

            switch (requiredResource) {
                case "icu":
                    return h.icuBeds && h.icuBeds > 0
                case "oxygen":
                    return h.oxygen && h.oxygen > 30
                case "ventilators":
                    return h.ventilators && h.ventilators > 0
                case "trauma":
                    return h.traumaBeds && h.traumaBeds > 0
                default:
                    return true
            }
        })
        .map((hospital) => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hospital.lat,
                hospital.lng
            )
            return { ...hospital, distance }
        })
        .sort((a, b) => a.distance - b.distance)

    return hospitalsWithDistance[0] || null
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns approximate road distance (not straight-line)
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
 * Generate shareable tracking link for ambulance
 */
export function generateTrackingLink(ambulanceId: number, requestId: string): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    return `${baseUrl}/track-ambulance/${requestId}?ambulance=${ambulanceId}`
}

/**
 * Auto-dial phone number (opens phone app)
 */
export function autoDialNumber(phoneNumber: string): void {
    if (typeof window !== "undefined") {
        window.location.href = `tel:${phoneNumber}`
    }
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<{
    lat: number
    lng: number
    address?: string
} | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
            },
            (error) => {
                console.error("Error getting location:", error)
                resolve(null)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // Increased to 10 seconds for better GPS lock
                maximumAge: 0,
            }
        )
    })
}

/**
 * Format time ago (e.g., "5 minutes ago")
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

/**
 * Get verification status based on last verified time
 */
export function getVerificationStatus(lastVerified: Date): {
    status: "recent" | "moderate" | "outdated"
    minutesAgo: number
    color: string
    label: string
} {
    const now = new Date()
    const diffMs = now.getTime() - lastVerified.getTime()
    const minutesAgo = Math.floor(diffMs / 60000)

    if (minutesAgo < 15) {
        return {
            status: "recent",
            minutesAgo,
            color: "green",
            label: "Recently Verified",
        }
    } else if (minutesAgo < 60) {
        return {
            status: "moderate",
            minutesAgo,
            color: "yellow",
            label: "Verified Recently",
        }
    } else {
        return {
            status: "outdated",
            minutesAgo,
            color: "red",
            label: "Needs Update",
        }
    }
}
