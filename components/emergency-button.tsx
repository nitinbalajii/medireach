"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, MapPin, Phone, Navigation, Loader2, ExternalLink, Copy } from "lucide-react"
import { emergencyAPI } from "@/lib/api/client"
import Link from "next/link"

export function EmergencyButton() {
    const [isActivating, setIsActivating] = useState(false)
    const [emergencyData, setEmergencyData] = useState<{
        emergency: any
        ambulance: any
        hospital: any
        trackingLink: string
    } | null>(null)
    const [showLocationFallback, setShowLocationFallback] = useState(false)

    const handleEmergencyClick = async () => {
        setIsActivating(true)
        setShowLocationFallback(false)

        try {
            // Step 1: Get user location
            let location: { lat: number; lng: number } | null = null

            if (navigator.geolocation) {
                location = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            })
                        },
                        (error) => {
                            console.log("Geolocation error:", error)
                            resolve(null)
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0,
                        }
                    )
                })
            }

            // Fallback to Delhi center if location detection fails
            if (!location) {
                console.log("Geolocation failed, using Delhi center as fallback")
                location = { lat: 28.6139, lng: 77.209 } // Delhi center
                setShowLocationFallback(true)
            }

            // Step 2: Create emergency request via backend API
            const response = await emergencyAPI.create({
                type: 'ambulance',
                urgency: 'critical',
                lat: location.lat,
                lng: location.lng,
                address: 'Emergency location',
            })

            if (response.success) {
                const trackingLink = `/track-ambulance/${response.data.emergency._id}`

                setEmergencyData({
                    emergency: response.data.emergency,
                    ambulance: response.data.ambulance,
                    hospital: response.data.hospital,
                    trackingLink,
                })
            } else {
                alert("Failed to create emergency request. Please try again.")
            }
        } catch (error) {
            console.error("Emergency activation error:", error)
            alert("An error occurred. Please try again or call 102/108 directly.")
        } finally {
            setIsActivating(false)
        }
    }

    const handleCallHospital = () => {
        if (emergencyData?.hospital?.contact) {
            window.location.href = `tel:${emergencyData.hospital.contact}`
        }
    }

    const handleCallAmbulance = () => {
        if (emergencyData?.ambulance?.driver?.phone) {
            window.location.href = `tel:${emergencyData.ambulance.driver.phone}`
        } else {
            window.location.href = `tel:102`
        }
    }

    const handleCopyTrackingLink = () => {
        if (emergencyData?.trackingLink) {
            const fullUrl = `${window.location.origin}${emergencyData.trackingLink}`
            navigator.clipboard.writeText(fullUrl)
            alert('Tracking link copied to clipboard!')
        }
    }

    if (emergencyData) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-red-900 text-lg mb-1">🚨 Emergency Request Created!</h3>
                            <p className="text-sm text-red-700">Ambulance dispatched to your location</p>
                            {showLocationFallback && (
                                <p className="text-xs text-red-600 mt-1">
                                    ⚠️ Using Delhi center as location (geolocation unavailable)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tracking Link */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            Track Your Ambulance
                        </h4>
                        <div className="flex gap-2">
                            <Link href={emergencyData.trackingLink} className="flex-1">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Tracking Page
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={handleCopyTrackingLink}
                                className="border-blue-300"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Hospital Info */}
                    {emergencyData.hospital && (
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <h4 className="font-semibold mb-2">Destination Hospital</h4>
                            <p className="font-medium">{emergencyData.hospital.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {emergencyData.hospital.address}
                            </p>

                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Beds</p>
                                    <p className="font-semibold">{emergencyData.hospital.beds}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">ICU</p>
                                    <p className="font-semibold">{emergencyData.hospital.icuBeds}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Oxygen</p>
                                    <p className="font-semibold">{emergencyData.hospital.oxygen}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ambulance Info */}
                    {emergencyData.ambulance && (
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <h4 className="font-semibold mb-2">Ambulance Details</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Vehicle</span>
                                    <span className="font-medium">{emergencyData.ambulance.vehicleNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Type</span>
                                    <span className="font-medium">{emergencyData.ambulance.type}</span>
                                </div>
                                {emergencyData.ambulance.driver && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Driver</span>
                                        <span className="font-medium">{emergencyData.ambulance.driver.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleCallHospital} className="bg-blue-600 hover:bg-blue-700">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Hospital
                        </Button>
                        <Button onClick={handleCallAmbulance} className="bg-red-600 hover:bg-red-700">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Ambulance
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setEmergencyData(null)}
                        className="w-full text-xs"
                    >
                        Close
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Button
            onClick={handleEmergencyClick}
            disabled={isActivating}
            className="w-full h-16 text-lg font-bold bg-red-600 hover:bg-red-700 relative overflow-hidden group"
        >
            {isActivating ? (
                <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Activating Emergency...
                </>
            ) : (
                <>
                    <div className="absolute inset-0 bg-red-500 animate-pulse opacity-50" />
                    <Zap className="w-6 h-6 mr-2 relative z-10" />
                    <span className="relative z-10">EMERGENCY HELP NOW</span>
                </>
            )}
        </Button>
    )
}
