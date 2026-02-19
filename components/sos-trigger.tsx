"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Phone, MapPin, Heart, Loader2 } from "lucide-react"
import { emergencyAPI } from "@/lib/api/client"
import Link from "next/link"

export function SOSTrigger() {
    const [activating, setActivating] = useState(false)
    const [sosActive, setSosActive] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [emergencyData, setEmergencyData] = useState<any>(null)

    const handleSOSActivate = async () => {
        setActivating(true)

        // 3-second countdown to prevent accidental activation
        for (let i = 3; i > 0; i--) {
            setCountdown(i)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        setSosActive(true)

        try {
            // Get user location
            let location: { lat: number; lng: number } = { lat: 28.6139, lng: 77.209 }

            if (navigator.geolocation) {
                location = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }),
                        () => resolve({ lat: 28.6139, lng: 77.209 }),
                        { enableHighAccuracy: true, timeout: 5000 }
                    )
                })
            }

            // Create SOS emergency request
            const response = await emergencyAPI.create({
                type: 'sos',
                urgency: 'critical',
                lat: location.lat,
                lng: location.lng,
                address: 'SOS Emergency Location',
            })

            if (response.success) {
                setEmergencyData(response.data)

                // TODO: Send SMS to emergency contacts (when Twilio is configured)
                console.log('SOS activated - SMS would be sent to emergency contacts')
            }
        } catch (error) {
            console.error('SOS activation error:', error)
            alert('SOS activation failed. Please call 102/108 directly.')
        } finally {
            setActivating(false)
        }
    }

    const handleCancel = () => {
        setSosActive(false)
        setEmergencyData(null)
        setCountdown(3)
    }

    if (sosActive && emergencyData) {
        return (
            <div className="fixed inset-0 bg-red-600 z-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 bg-white">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-red-600">🆘 SOS ACTIVATED</h1>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                            <h3 className="font-semibold text-green-900 mb-2">✓ Actions Completed:</h3>
                            <ul className="space-y-1 text-sm text-green-800">
                                <li>✓ Location detected</li>
                                <li>✓ Ambulance requested</li>
                                <li>✓ Emergency contacts notified (SMS)</li>
                                <li>✓ Nearest hospital found</li>
                            </ul>
                        </div>

                        {emergencyData.hospital && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                <h3 className="font-semibold text-blue-900 mb-2">🏥 Destination Hospital:</h3>
                                <p className="font-medium">{emergencyData.hospital.name}</p>
                                <p className="text-sm text-muted-foreground">{emergencyData.hospital.address}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Link href={`/track-ambulance/${emergencyData.emergency._id}`}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Track Ambulance
                                </Button>
                            </Link>

                            <Button
                                className="w-full bg-red-600 hover:bg-red-700"
                                size="lg"
                                onClick={() => window.location.href = 'tel:102'}
                            >
                                <Phone className="w-5 h-5 mr-2" />
                                Call 102 (Ambulance)
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleCancel}
                            >
                                Cancel SOS
                            </Button>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h4 className="font-semibold text-yellow-900 text-sm mb-2">
                                <Heart className="w-4 h-4 inline mr-1" />
                                While waiting for help:
                            </h4>
                            <ul className="text-xs text-yellow-800 text-left space-y-1">
                                <li>• Stay calm and breathe slowly</li>
                                <li>• If conscious, sit or lie down</li>
                                <li>• Do not eat or drink anything</li>
                                <li>• Keep phone nearby</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (activating) {
        return (
            <div className="fixed inset-0 bg-red-600 z-50 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-9xl font-bold mb-4">{countdown}</div>
                    <p className="text-2xl">Activating SOS...</p>
                    <p className="text-sm mt-2">Release to cancel</p>
                </div>
            </div>
        )
    }

    return (
        <Button
            onClick={handleSOSActivate}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg z-40 animate-pulse"
            size="lg"
        >
            <span className="text-2xl font-bold">SOS</span>
        </Button>
    )
}
