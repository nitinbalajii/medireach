// Centralized TypeScript types for MediReach Phase 2

// ===== Feature 1: Hospital Availability =====
export interface HospitalAvailability {
    hospitalId: number
    beds: number
    icuBeds: number
    oxygen: number
    ventilators: number
    pediatricBeds: number
    traumaBeds: number
    emergencyWardOpen: boolean
    lastVerified: Date
    verifiedBy?: string
}

export interface VerificationStatus {
    timestamp: Date
    status: 'recent' | 'moderate' | 'outdated'
    minutesAgo: number
}

// ===== Feature 2: Emergency =====
export interface EmergencyContact {
    id: number
    name: string
    phone: string
    relationship: string
    isPrimary: boolean
}

export interface EmergencyRequest {
    id: string
    patientName: string
    phone: string
    location: {
        lat: number
        lng: number
        address: string
    }
    emergencyType: 'trauma' | 'cardiac' | 'respiratory' | 'general'
    timestamp: Date
    status: 'pending' | 'dispatched' | 'arrived' | 'completed'
    assignedAmbulanceId?: number
    nearestHospitalId?: number
}

// ===== Feature 3: Ambulance Tracking =====
export interface AmbulanceTracking {
    ambulanceId: number
    currentLocation: {
        lat: number
        lng: number
    }
    destination: {
        lat: number
        lng: number
        address: string
    }
    eta: number // minutes
    route: Array<{ lat: number; lng: number }>
    lastUpdated: Date
    speed: number // km/h
    distance: number // km
}

export interface TrackingLink {
    id: string
    ambulanceId: number
    requestId: string
    url: string
    expiresAt: Date
    createdAt: Date
}

// ===== Feature 4: Crowdsourcing =====
export interface CrowdReport {
    id: number
    hospitalId: number
    reportType: 'long_queue' | 'emergency_closed' | 'beds_full' | 'oxygen_shortage' | 'no_doctors' | 'other'
    description?: string
    reportedBy?: string
    timestamp: Date
    upvotes: number
    downvotes: number
    verified: boolean
    expiresAt: Date
}

// ===== Feature 5: Recommendations =====
export interface HospitalScore {
    hospitalId: number
    totalScore: number
    distanceScore: number
    availabilityScore: number
    ratingScore: number
    crowdReportScore: number
    explanation: string
}

export interface Recommendation {
    hospital: any // Hospital type from delhi-data
    score: HospitalScore
    reasons: string[]
    estimatedTime: number // minutes
}

// ===== Feature 6: SOS Mode =====
export interface SOSActivation {
    id: string
    timestamp: Date
    location: {
        lat: number
        lng: number
    }
    actions: {
        locationDetected: boolean
        ambulanceRequested: boolean
        smsSent: boolean
        hospitalFound: boolean
    }
    status: 'active' | 'cancelled' | 'completed'
    emergencyContactNotified: string[]
}

export interface FirstAidStep {
    id: number
    scenario: string
    steps: string[]
    warnings: string[]
    imageUrl?: string
}

// ===== Feature 7: Medicine Availability =====
export interface Medicine {
    id: number
    name: string
    genericName: string
    category: 'emergency' | 'chronic' | 'general'
    description: string
}

export interface Pharmacy {
    id: number
    name: string
    address: string
    lat: number
    lng: number
    phone: string
    is24x7: boolean
    type: 'government' | 'private'
    inventory: PharmacyInventory[]
}

export interface PharmacyInventory {
    medicineId: number
    medicineName: string
    availability: 'in_stock' | 'low_stock' | 'out_of_stock'
    price: number
    lastUpdated: Date
}

// ===== Feature 8: Doctor Listings =====
export interface Doctor {
    id: number
    name: string
    specialty: string
    qualifications: string[]
    experience: number // years
    hospitalId: number
    hospitalName: string
    photo?: string
    rating: number
    schedule: DoctorSchedule[]
    availableForTeleconsult: boolean
    consultationFee: number
}

export interface DoctorSchedule {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
    startTime: string // "09:00"
    endTime: string // "17:00"
    isOnDuty: boolean
}

// ===== Feature 9: Traffic Routing =====
export interface TrafficRoute {
    routeId: string
    startLocation: { lat: number; lng: number }
    endLocation: { lat: number; lng: number }
    distance: number // km
    duration: number // minutes
    durationInTraffic: number // minutes
    trafficLevel: 'low' | 'moderate' | 'heavy' | 'severe'
    polyline: Array<{ lat: number; lng: number }>
    alerts: TrafficAlert[]
    isFastest: boolean
}

export interface TrafficAlert {
    id: number
    type: 'accident' | 'road_closure' | 'heavy_traffic' | 'construction'
    location: string
    severity: 'low' | 'medium' | 'high'
    description: string
}

// ===== Feature 10: Patient Profile =====
export interface PatientProfile {
    id: string
    personalInfo: {
        name: string
        age: number
        gender: 'male' | 'female' | 'other'
        bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
        phone: string
        email?: string
    }
    emergencyContacts: EmergencyContact[]
    healthInfo: {
        conditions: string[] // ["Diabetes", "Asthma", etc.]
        allergies: string[]
        currentMedications: string[]
        pastSurgeries: string[]
        chronicDiseases: string[]
    }
    insurance?: {
        provider: string
        policyNumber: string
        validUntil: Date
    }
    qrCode?: string
    createdAt: Date
    updatedAt: Date
}

// ===== Extended Hospital Type =====
export interface Hospital {
    id: number
    name: string
    address: string
    lat: number
    lng: number
    beds: number
    icuBeds: number
    oxygen: number
    contact: string
    emergency: string
    type: 'Government' | 'Private'
    specialists: string[]
    // Phase 2 additions
    ventilators?: number
    pediatricBeds?: number
    traumaBeds?: number
    emergencyWardOpen?: boolean
    lastVerified?: Date
    rating?: number
    crowdReports?: CrowdReport[]
}

// ===== Extended Ambulance Type =====
export interface Ambulance {
    id: number
    name: string
    status: 'Available' | 'Busy' | 'Offline'
    area: string
    lat: number
    lng: number
    driver: string
    contact: string
    type: 'Normal' | 'Cardiac' | 'Oxygen'
    vehicleNumber: string
    experience: string
    // Phase 2 additions
    currentSpeed?: number
    heading?: number
    lastLocationUpdate?: Date
}
