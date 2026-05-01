"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Share2, MapPin, Clock, User, Loader2, Navigation } from "lucide-react"
import { emergencyAPI } from "@/lib/api/client"
import { trackAmbulance } from "@/lib/api/socket"
import { Navbar } from "@/components/navbar"
import dynamic from "next/dynamic"

// Dynamically import map component (client-side only)
const AmbulanceLiveTracker = dynamic(
    () => import("@/components/ambulance-live-tracker"),
    { ssr: false, loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" /> }
)

// Haversine distance between two points in km
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth radius in km
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Calculate ETA in minutes from two GeoJSON points
function calculateETA(ambulanceLoc: any, patientLoc: any): number {
    if (!ambulanceLoc?.coordinates || !patientLoc?.coordinates) return 0
    const straightDist = haversineDistance(
        ambulanceLoc.coordinates[1], ambulanceLoc.coordinates[0],
        patientLoc.coordinates[1], patientLoc.coordinates[0]
    )
    const roadDist = straightDist * 1.4 // road distance multiplier
    const avgSpeed = 40 // km/h average city speed
    return Math.max(1, Math.round((roadDist / avgSpeed) * 60))
}

export default function TrackAmbulance() {
    const params = useParams()
    const requestId = params.id as string

    const [emergency, setEmergency] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ambulanceLocation, setAmbulanceLocation] = useState<any>(null)
    const [eta, setEta] = useState<number | null>(null)

    // Fetch emergency request details
    useEffect(() => {
        const fetchEmergency = async () => {
            try {
                setLoading(true)
                const response = await emergencyAPI.getById(requestId)
                setEmergency(response.data)

                // Set initial ambulance location and compute ETA
                const amb = response.data.assignedAmbulance
                const patLoc = response.data.location

                if (amb?.currentLocation) {
                    setAmbulanceLocation(amb.currentLocation)
                }

                // Priority: backend ETA > computed from coordinates > sensible default
                if (amb?.eta) {
                    setEta(amb.eta)
                } else if (amb?.currentLocation && patLoc) {
                    setEta(calculateETA(amb.currentLocation, patLoc))
                } else if (patLoc) {
                    // No ambulance location available — estimate from a typical Delhi distance
                    setEta(8)
                }

                setError(null)
            } catch (err) {
                console.error('Error fetching emergency:', err)
                setError('Failed to load tracking information')
            } finally {
                setLoading(false)
            }
        }

        if (requestId) {
            fetchEmergency()
        }
    }, [requestId])

    // Subscribe to real-time location updates
    useEffect(() => {
        if (!requestId) return

        const cleanup = trackAmbulance(requestId, (data: any) => {
            console.log('Ambulance location update:', data)
            setAmbulanceLocation(data.location)
            if (data.eta) {
                setEta(data.eta)
            } else if (data.location && emergency?.location) {
                setEta(calculateETA(data.location, emergency.location))
            }
        })

        return cleanup
    }, [requestId, emergency])

    // Share tracking link
    const handleShare = async () => {
        const url = window.location.href

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Track Ambulance',
                    text: 'Track my ambulance in real-time',
                    url: url,
                })
            } catch (err) {
                console.log('Share failed:', err)
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url)
            alert('Tracking link copied to clipboard!')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading tracking information...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !emergency) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Card className="p-8 text-center">
                        <p className="text-red-600 font-semibold mb-2">❌ {error || 'Emergency request not found'}</p>
                        <p className="text-sm text-muted-foreground">Please check the tracking link and try again.</p>
                    </Card>
                </div>
            </div>
        )
    }

    const ambulance = emergency.assignedAmbulance
    const hospital = emergency.assignedHospital
    const patientLocation = emergency.location

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-2">Track Your Ambulance</h1>
                    <p className="text-muted-foreground">
                        Real-time location and ETA for your emergency request
                    </p>
                </div>

                {/* Status Banner */}
                <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-blue-900">
                                    {emergency.status === 'ambulance_dispatched' && 'Ambulance Dispatched'}
                                    {emergency.status === 'in_transit' && 'Ambulance En Route'}
                                    {emergency.status === 'arrived' && 'Ambulance Arrived'}
                                    {emergency.status === 'completed' && 'Journey Completed'}
                                </h2>
                                <p className="text-sm text-blue-700">
                                    Request ID: {requestId.slice(0, 8)}...
                                </p>
                            </div>
                        </div>

                        {emergency.status !== 'arrived' && emergency.status !== 'completed' && (
                            <div className="text-right">
                                <div className="text-3xl font-bold text-blue-900">{eta !== null ? `${eta} min` : 'Calculating...'}</div>
                                <p className="text-sm text-blue-700">Estimated Arrival</p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Tracking Map */}
                    <div className="md:col-span-2">
                        <Card className="p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Live Location
                            </h3>

                            {ambulanceLocation && patientLocation ? (
                                <AmbulanceLiveTracker
                                    ambulanceLocation={{
                                        lat: ambulanceLocation.coordinates[1],
                                        lng: ambulanceLocation.coordinates[0],
                                    }}
                                    patientLocation={{
                                        lat: patientLocation.coordinates[1],
                                        lng: patientLocation.coordinates[0],
                                    }}
                                    hospitalLocation={hospital ? {
                                        lat: hospital.location.coordinates[1],
                                        lng: hospital.location.coordinates[0],
                                    } : undefined}
                                />
                            ) : (
                                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-muted-foreground">Waiting for ambulance location...</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Ambulance Info */}
                        {ambulance && (
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Navigation className="w-5 h-5 text-primary" />
                                    Ambulance Details
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                        <p className="font-semibold">{ambulance.vehicleNumber}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Type</p>
                                        <p className="font-semibold">{ambulance.type}</p>
                                    </div>

                                    {ambulance.driver && (
                                        <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Driver</p>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    {ambulance.driver.name}
                                                </p>
                                            </div>

                                            <Button
                                                className="w-full"
                                                onClick={() => window.location.href = `tel:${ambulance.driver.phone}`}
                                            >
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Driver
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Hospital Info */}
                        {hospital && (
                            <Card className="p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Destination Hospital
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <p className="font-semibold">{hospital.name}</p>
                                        <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.location.href = `tel:${hospital.contact}`}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Hospital
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Share Button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleShare}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Tracking Link
                        </Button>

                        {/* Timeline */}
                        <Card className="p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Timeline
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-semibold text-sm">Request Received</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(emergency.requestedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {emergency.dispatchedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                        <div>
                                            <p className="font-semibold text-sm">Ambulance Dispatched</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(emergency.dispatchedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {emergency.arrivedAt ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                        <div>
                                            <p className="font-semibold text-sm">Arrived at Location</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(emergency.arrivedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 animate-pulse" />
                                        <div>
                                            <p className="font-semibold text-sm text-muted-foreground">En Route...</p>
                                            <p className="text-xs text-muted-foreground">ETA: {eta !== null ? `${eta} minutes` : 'Calculating...'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
