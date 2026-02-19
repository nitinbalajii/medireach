// Utility functions for smart hospital recommendations

import type { Hospital, CrowdReport, HospitalScore, Recommendation } from "./types"

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns approximate road distance (not straight-line)
 */
export function calculateDistance(
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
    // (roads are not straight lines, especially in cities)
    return straightLineDistance * 1.4
}

/**
 * Calculate hospital score based on multiple factors
 */
export function calculateHospitalScore(
    hospital: any,
    userLocation: { lat: number; lng: number },
    emergencyType?: "trauma" | "cardiac" | "pediatric" | "general",
    crowdReports?: CrowdReport[]
): HospitalScore {
    // Distance score (closer is better, max 10 points)
    const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.lat,
        hospital.lng
    )
    const distanceScore = Math.max(0, 10 - distance) // 0-10 points

    // Availability score (more beds = better, max 10 points)
    let availabilityScore = 0
    if (emergencyType === "trauma" && hospital.traumaBeds) {
        availabilityScore = Math.min(10, (hospital.traumaBeds / 15) * 10)
    } else if (emergencyType === "cardiac" && hospital.icuBeds) {
        availabilityScore = Math.min(10, (hospital.icuBeds / 15) * 10)
    } else if (emergencyType === "pediatric" && hospital.pediatricBeds) {
        availabilityScore = Math.min(10, (hospital.pediatricBeds / 15) * 10)
    } else {
        availabilityScore = Math.min(10, (hospital.beds / 35) * 10)
    }

    // Rating score (max 10 points)
    const ratingScore = hospital.rating ? (hospital.rating / 5) * 10 : 5

    // Crowd report score (negative reports reduce score, max 10 points)
    let crowdReportScore = 10
    if (crowdReports) {
        const hospitalReports = crowdReports.filter(
            (r) => r.hospitalId === hospital.id && new Date(r.expiresAt) > new Date()
        )
        const negativeReports = hospitalReports.filter(
            (r) =>
                r.reportType === "beds_full" ||
                r.reportType === "emergency_closed" ||
                r.reportType === "long_queue"
        )
        crowdReportScore = Math.max(0, 10 - negativeReports.length * 3)
    }

    const totalScore = distanceScore + availabilityScore + ratingScore + crowdReportScore

    return {
        hospitalId: hospital.id,
        totalScore,
        distanceScore,
        availabilityScore,
        ratingScore,
        crowdReportScore,
        explanation: generateScoreExplanation(
            distanceScore,
            availabilityScore,
            ratingScore,
            crowdReportScore,
            distance
        ),
    }
}

/**
 * Generate human-readable explanation for score
 */
function generateScoreExplanation(
    distanceScore: number,
    availabilityScore: number,
    ratingScore: number,
    crowdReportScore: number,
    distance: number
): string {
    const reasons = []

    if (distanceScore >= 7) reasons.push("Very close to your location")
    else if (distanceScore >= 4) reasons.push("Moderate distance")
    else reasons.push("Further away")

    if (availabilityScore >= 7) reasons.push("Good bed availability")
    else if (availabilityScore >= 4) reasons.push("Limited bed availability")
    else reasons.push("Low bed availability")

    if (ratingScore >= 8) reasons.push("Highly rated")
    else if (ratingScore >= 6) reasons.push("Well rated")

    if (crowdReportScore < 7) reasons.push("Recent crowding reports")

    return reasons.join(" • ")
}

/**
 * Find best hospital for trauma cases
 */
export function findBestHospitalForTrauma(
    hospitals: any[],
    userLocation: { lat: number; lng: number },
    crowdReports?: CrowdReport[]
): Recommendation[] {
    const traumaHospitals = hospitals.filter(
        (h) =>
            h.traumaBeds &&
            h.traumaBeds > 0 &&
            h.emergencyWardOpen &&
            h.specialists.some((s: string) => s.toLowerCase().includes("trauma"))
    )

    return traumaHospitals
        .map((hospital) => {
            const score = calculateHospitalScore(hospital, userLocation, "trauma", crowdReports)
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hospital.lat,
                hospital.lng
            )
            const estimatedTime = Math.ceil(distance * 2.5) // Realistic Delhi traffic: ~2.5 min per km

            return {
                hospital: { ...hospital, distance }, // Add distance to hospital object
                score,
                reasons: [
                    `${hospital.traumaBeds} trauma beds available`,
                    `${distance.toFixed(1)} km away`,
                    `Trauma specialists on-site`,
                    score.explanation,
                ],
                estimatedTime,
            }
        })
        .sort((a, b) => b.score.totalScore - a.score.totalScore)
}

/**
 * Find least busy emergency ward
 */
export function findLeastBusyEmergencyWard(
    hospitals: any[],
    userLocation: { lat: number; lng: number },
    crowdReports?: CrowdReport[]
): Recommendation[] {
    return hospitals
        .filter((h) => h.emergencyWardOpen)
        .map((hospital) => {
            const score = calculateHospitalScore(hospital, userLocation, "general", crowdReports)
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hospital.lat,
                hospital.lng
            )
            const estimatedTime = Math.ceil(distance * 2.5) // Realistic Delhi traffic: ~2.5 min per km

            // Boost score for hospitals with no crowd reports
            const hospitalReports = crowdReports?.filter(
                (r) => r.hospitalId === hospital.id && new Date(r.expiresAt) > new Date()
            ) || []
            const busyScore = hospitalReports.length === 0 ? 10 : Math.max(0, 10 - hospitalReports.length * 2)

            return {
                hospital: { ...hospital, distance }, // Add distance to hospital object
                score: { ...score, totalScore: score.totalScore + busyScore },
                reasons: [
                    hospitalReports.length === 0 ? "No crowding reports" : `${hospitalReports.length} recent reports`,
                    `${hospital.beds} beds available`,
                    `${distance.toFixed(1)} km away`,
                ],
                estimatedTime,
            }
        })
        .sort((a, b) => b.score.totalScore - a.score.totalScore)
}

/**
 * Find best pediatric hospital
 */
export function findBestPediatricHospital(
    hospitals: any[],
    userLocation: { lat: number; lng: number },
    crowdReports?: CrowdReport[]
): Recommendation[] {
    const pediatricHospitals = hospitals.filter(
        (h) =>
            h.pediatricBeds &&
            h.pediatricBeds > 0 &&
            h.specialists.some((s: string) => s.toLowerCase().includes("pediatric"))
    )

    return pediatricHospitals
        .map((hospital) => {
            const score = calculateHospitalScore(hospital, userLocation, "pediatric", crowdReports)
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hospital.lat,
                hospital.lng
            )
            const estimatedTime = Math.ceil(distance * 2.5) // Realistic Delhi traffic: ~2.5 min per km

            return {
                hospital: { ...hospital, distance }, // Add distance to hospital object
                score,
                reasons: [
                    `${hospital.pediatricBeds} pediatric beds available`,
                    `${distance.toFixed(1)} km away`,
                    `Pediatric specialists available`,
                ],
                estimatedTime,
            }
        })
        .sort((a, b) => b.score.totalScore - a.score.totalScore)
}

/**
 * Sort hospitals by specific availability type
 */
export function sortByAvailability(
    hospitals: any[],
    availabilityType: "icu" | "oxygen" | "ventilators" | "pediatric" | "trauma"
): any[] {
    return [...hospitals].sort((a, b) => {
        switch (availabilityType) {
            case "icu":
                return (b.icuBeds || 0) - (a.icuBeds || 0)
            case "oxygen":
                return (b.oxygen || 0) - (a.oxygen || 0)
            case "ventilators":
                return (b.ventilators || 0) - (a.ventilators || 0)
            case "pediatric":
                return (b.pediatricBeds || 0) - (a.pediatricBeds || 0)
            case "trauma":
                return (b.traumaBeds || 0) - (a.traumaBeds || 0)
            default:
                return 0
        }
    })
}

export function getTopRecommendations(
    hospitals: any[],
    userLocation: { lat: number; lng: number },
    emergencyType: "trauma" | "cardiac" | "pediatric" | "general",
    crowdReports?: CrowdReport[],
    limit: number = 3
): Recommendation[] {
    let recommendations: Recommendation[]

    switch (emergencyType) {
        case "trauma":
            recommendations = findBestHospitalForTrauma(hospitals, userLocation, crowdReports)
            break
        case "pediatric":
            recommendations = findBestPediatricHospital(hospitals, userLocation, crowdReports)
            break
        case "cardiac":
        case "general":
        default:
            recommendations = hospitals
                .map((hospital) => {
                    const score = calculateHospitalScore(hospital, userLocation, emergencyType, crowdReports)
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        hospital.lat,
                        hospital.lng
                    )
                    const estimatedTime = Math.ceil(distance * 2.5) // Realistic Delhi traffic: ~2.5 min per km

                    return {
                        hospital: { ...hospital, distance }, // Add distance to hospital object
                        score,
                        reasons: [
                            `${hospital.beds} beds available`,
                            `${distance.toFixed(1)} km away`,
                            `Rating: ${hospital.rating || "N/A"}`,
                        ],
                        estimatedTime,
                    }
                })
                .sort((a, b) => b.score.totalScore - a.score.totalScore)
    }

    return recommendations.slice(0, limit)
}

