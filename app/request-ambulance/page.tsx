"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, AlertCircle, CheckCircle, Navigation, Zap, Phone, Locate, Loader2 } from "lucide-react"
import Link from "next/link"
import { AmbulanceMap, type AmbulanceLocation } from "@/components/ambulance-map"
import { ambulanceAPI, emergencyAPI } from "@/lib/api/client"
import { Navbar } from "@/components/navbar"


export default function RequestAmbulancePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    ambulanceType: "",
    notes: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [trackingActive, setTrackingActive] = useState(false)
  const [eta, setEta] = useState(5)
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)

  // Real ambulance data from backend
  const [ambulances, setAmbulances] = useState<AmbulanceLocation[]>([])
  const [ambulancesLoading, setAmbulancesLoading] = useState(true)
  const [ambulancesError, setAmbulancesError] = useState<string | null>(null)

  // Fetch available ambulances on mount
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        setAmbulancesLoading(true)
        const response = await ambulanceAPI.getAll('available')
        setAmbulances(response.data || [])
        setAmbulancesError(null)
      } catch (err) {
        console.error('Error fetching ambulances:', err)
        setAmbulancesError('Could not load ambulances. Is the backend running?')
      } finally {
        setAmbulancesLoading(false)
      }
    }
    fetchAmbulances()
  }, [])

  useEffect(() => {
    if (!trackingActive || eta <= 0) return

    const timer = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1))
    }, 60000) // Update every minute (simulated)

    return () => clearInterval(timer)
  }, [trackingActive, eta])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGetLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData({
            ...formData,
            latitude,
            longitude,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          })
          setLocationLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter manually.")
          setLocationLoading(false)
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
      setLocationLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Ambulance request:", formData)
    setSubmitted(true)
    setTrackingActive(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleRequestPickup = async (ambulanceId: string) => {
    setSelectedAmbulanceId(ambulanceId)
    const selectedAmbulance = ambulances.find((a) => a._id === ambulanceId)
    if (selectedAmbulance) {
      setFormData((prev) => ({ ...prev, ambulanceType: selectedAmbulance.type }))
    }
    // If user has coordinates, create emergency request immediately
    if (formData.latitude && formData.longitude) {
      try {
        await emergencyAPI.create({
          type: 'ambulance',
          urgency: 'high',
          patientName: formData.name || undefined,
          patientPhone: formData.phone || undefined,
          lat: formData.latitude,
          lng: formData.longitude,
          address: formData.location || undefined,
        })
        setSubmitted(true)
        setTrackingActive(true)
        setTimeout(() => setSubmitted(false), 5000)
      } catch (err) {
        console.error('Emergency request failed:', err)
      }
    }
  }

  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  const ambulanceTypes = [
    { value: "Basic", label: "Basic", icon: "🚐", description: "General medical transport" },
    { value: "Cardiac", label: "Cardiac", icon: "❤️", description: "Heart emergency equipped" },
    { value: "Advanced", label: "Advanced", icon: "🚑", description: "Advanced life support" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-8 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Emergency Request</p>
                  <p className="text-sm text-red-800">For life-threatening emergencies, call 102 or 108 immediately</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">Request an Ambulance</h1>
              <p className="text-muted-foreground mb-8">
                Provide your details and we'll dispatch the nearest ambulance
              </p>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-900 font-semibold">Ambulance Dispatched!</p>
                  </div>
                  {trackingActive && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Navigation className="w-4 h-4" />
                        <span>ETA: {eta} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Zap className="w-4 h-4" />
                        <span>Ambulance en route to your location</span>
                      </div>
                      {selectedAmbulanceId && (
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <Phone className="w-4 h-4" />
                          <span>
                            Driver:{" "}
                            {ambulances.find((a) => a._id === selectedAmbulanceId)?.driver?.name ?? "Assigned"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-8">
                <p className="text-sm font-medium mb-3">Select Ambulance Type:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ambulanceTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, ambulanceType: type.value })}
                      className={`p-4 rounded-lg border-2 transition text-left ${formData.ambulanceType === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium mb-1">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+91-XXXXX-XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Location *</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="location"
                      placeholder="Your current location or coordinates"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Locate className="w-4 h-4" />
                      {locationLoading ? "Getting..." : "GPS"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click GPS to auto-detect your location or enter manually
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Any additional information (symptoms, landmarks, etc.)..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600">
                  Request Ambulance Now
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar - Maps and Emergency Info */}
          <div className="space-y-6">
            {/* Ambulance Map */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Available Ambulances
              </h3>
              {ambulancesLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading ambulances...</span>
                </div>
              ) : ambulancesError ? (
                <p className="text-sm text-red-600 py-4">{ambulancesError}</p>
              ) : (
                <AmbulanceMap
                  ambulances={ambulances}
                  onRequestPickup={handleRequestPickup}
                />
              )}
            </Card>

            {/* Emergency Contacts */}
            <div className="space-y-3">
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-700 font-medium mb-2">Emergency Ambulance Service</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-red-900">102</p>
                    <p className="text-xs text-red-600 mt-1">National Ambulance Service</p>
                  </div>
                  <Button
                    onClick={() => handleEmergencyCall("102")}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </Card>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-2">Emergency Medical Service</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-900">108</p>
                    <p className="text-xs text-orange-600 mt-1">Free Emergency Service</p>
                  </div>
                  <Button
                    onClick={() => handleEmergencyCall("108")}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Nearby Hospitals Section */}
        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Hospitals Near You
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Need to find a hospital? Browse all hospitals in Delhi with specialty filters.
          </p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/find-hospital">Browse Hospitals →</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
