"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Phone, MapPin, Bed, Wind, Activity, Baby, Ambulance, Loader2 } from "lucide-react"
import Link from "next/link"
import { areaOptions, crowdReports } from "@/lib/delhi-data"
import { HospitalMapLibre } from "@/components/hospital-map-maplibre"
import { Navbar } from "@/components/navbar"
import { VerificationBadge } from "@/components/verification-badge"
import { AvailabilityFilters, type AvailabilityFilterState } from "@/components/availability-filters"
import { EmergencyButton } from "@/components/emergency-button"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { ReportHospitalStatus } from "@/components/report-hospital-status"
import { CrowdReportsDisplay } from "@/components/crowd-reports-display"
import { getTopRecommendations } from "@/lib/utils/recommendations"
import { sortByAvailability } from "@/lib/utils/recommendations"
import { DELHI_CENTER } from "@/lib/delhi-data"
import { hospitalAPI } from "@/lib/api/client"
import { initSocket, onAvailabilityUpdate } from "@/lib/api/socket"

export default function FindHospital() {
  const [selectedArea, setSelectedArea] = useState("All Delhi")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showMap, setShowMap] = useState(true)
  const [sortBy, setSortBy] = useState<"distance" | "icu" | "oxygen" | "ventilators" | "pediatric" | "trauma">("distance")
  const [availabilityFilters, setAvailabilityFilters] = useState<AvailabilityFilterState>({
    resources: {
      icu: false,
      oxygen: false,
      ventilators: false,
      pediatric: false,
      trauma: false,
    },
    minBeds: 0,
    onlyAvailable: false,
    recentlyVerified: false,
  })

  // Backend data state
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DELHI_CENTER)
  const [locationStatus, setLocationStatus] = useState<"detecting" | "detected" | "denied" | "error">("detecting")

  // Fetch hospitals from backend
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        const response = await hospitalAPI.getAll()

        // Transform MongoDB data to frontend format
        const transformedHospitals = (response.data || []).map((hospital: any) => {
          return {
            ...hospital,
            id: hospital._id,
            lat: hospital.location.coordinates[1], // GeoJSON is [lng, lat]
            lng: hospital.location.coordinates[0],
            type: hospital.type || 'Government',
            // Normalize field name: DB uses 'specialisations', keep both for compatibility
            specialists: hospital.specialisations || hospital.specialists || [],
            specialisations: hospital.specialisations || hospital.specialists || [],
            // Preserve location object for the new MapLibre map component
            location: hospital.location,
          }
        })

        setHospitals(transformedHospitals)
        setError(null)
      } catch (err) {
        console.error('Error fetching hospitals:', err)
        setError('Failed to load hospitals. Please check if backend is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()

    // Initialize Socket.io for real-time updates
    initSocket()
    const cleanup = onAvailabilityUpdate((updatedHospital) => {
      // Transform updated hospital data too
      const transformed = {
        ...updatedHospital,
        id: updatedHospital._id,
        lat: updatedHospital.location.coordinates[1],
        lng: updatedHospital.location.coordinates[0],
        type: 'Government',
      }

      setHospitals(prev =>
        prev.map(h => h._id === transformed._id ? transformed : h)
      )
    })

    return cleanup
  }, [])

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationStatus("detected")
        },
        (error) => {
          console.log("Geolocation error:", error.message)
          setLocationStatus(error.code === 1 ? "denied" : "error")
          // Keep using Delhi center as fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    } else {
      setLocationStatus("error")
    }
  }, [])

  // Filter hospitals
  const filteredHospitals = useMemo(() => {
    let filtered = hospitals.filter((hospital) => {
      const matchesArea = selectedArea === "All Delhi" || hospital.address.includes(selectedArea.split("(")[1])
      const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || hospital.type.toLowerCase() === filterType.toLowerCase()

      // Availability filters
      if (availabilityFilters.resources.icu && (!hospital.icuBeds || hospital.icuBeds === 0)) return false
      if (availabilityFilters.resources.oxygen && (!hospital.oxygen || hospital.oxygen < 30)) return false
      if (availabilityFilters.resources.ventilators && (!hospital.ventilators || hospital.ventilators === 0)) return false
      if (availabilityFilters.resources.pediatric && (!hospital.pediatricBeds || hospital.pediatricBeds === 0)) return false
      if (availabilityFilters.resources.trauma && (!hospital.traumaBeds || hospital.traumaBeds === 0)) return false

      if (availabilityFilters.minBeds > 0 && hospital.beds < availabilityFilters.minBeds) return false
      if (availabilityFilters.onlyAvailable && hospital.beds === 0) return false

      if (availabilityFilters.recentlyVerified && hospital.lastVerified) {
        const minutesAgo = (Date.now() - hospital.lastVerified.getTime()) / 60000
        if (minutesAgo > 30) return false
      }

      return matchesArea && matchesSearch && matchesType
    })

    // Sort hospitals
    if (sortBy === "distance") {
      // Keep default order (could add distance calculation here)
      return filtered
    } else {
      return sortByAvailability(filtered, sortBy)
    }
  }, [hospitals, selectedArea, searchQuery, filterType, availabilityFilters, sortBy])

  // Get recommendations
  const recommendations = useMemo(() => {
    return getTopRecommendations(hospitals, userLocation, "general", crowdReports, 3)
  }, [userLocation])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Button */}
        <div className="mb-6">
          <EmergencyButton />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Hospitals in Delhi</h1>
          <p className="text-muted-foreground">
            Search and locate hospitals with real-time bed and oxygen availability
          </p>
          {/* Location Status Indicator */}
          <div className="mt-3">
            {locationStatus === "detecting" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting your location...
              </p>
            )}
            {locationStatus === "detected" && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Using your current location for accurate distances
              </p>
            )}
            {(locationStatus === "denied" || locationStatus === "error") && (
              <p className="text-sm text-yellow-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Using Delhi center as location (enable location for accurate distances)
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-blue-800">Loading hospitals from backend...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">❌ {error}</p>
              <p className="text-sm text-red-600 mt-1">
                Make sure the backend server is running on http://localhost:5000
              </p>
            </div>
          )}
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations
          recommendations={recommendations}
          userLocation={userLocation}
          emergencyType="general"
          className="mb-8"
        />

        {/* Basic Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hospital Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="distance">Distance</option>
              <option value="icu">ICU Beds</option>
              <option value="oxygen">Oxygen Supply</option>
              <option value="ventilators">Ventilators</option>
              <option value="pediatric">Pediatric Beds</option>
              <option value="trauma">Trauma Beds</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">Search Hospital</label>
            <Input
              placeholder="Search hospital name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <AvailabilityFilters onFilterChange={setAvailabilityFilters} className="mb-6" />

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Interactive Map View</h2>
          </div>
          <button onClick={() => setShowMap(!showMap)} className="text-sm text-primary hover:underline">
            {showMap ? "Hide" : "Show"} Map
          </button>
        </div>

        {showMap && (
          <div className="mb-8">
            <HospitalMapLibre hospitals={filteredHospitals} />
          </div>
        )}

        {/* Hospitals List */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {filteredHospitals.length} Hospital{filteredHospitals.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital) => {
            const hospitalReports = crowdReports.filter((r) => r.hospitalId === hospital.id)

            return (
              <Card key={hospital.id} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hospital.address}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${hospital.type === "Government"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/10 text-accent"
                      }`}
                  >
                    {hospital.type}
                  </span>
                </div>

                {/* Verification Badge */}
                {hospital.lastVerified && (
                  <div className="mb-4">
                    <VerificationBadge lastVerified={hospital.lastVerified} />
                  </div>
                )}

                {/* Availability Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-y border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Bed className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">{hospital.beds}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Beds</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-accent" />
                      <span className="font-bold text-lg">{hospital.icuBeds}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ICU</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Wind className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">{hospital.oxygen}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Oxygen</p>
                  </div>
                </div>

                {/* Additional Resources */}
                {(hospital.ventilators || hospital.pediatricBeds || hospital.traumaBeds) && (
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
                    {hospital.ventilators && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Ventilators</p>
                        <p className="font-semibold">{hospital.ventilators}</p>
                      </div>
                    )}
                    {hospital.pediatricBeds && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                          <Baby className="w-3 h-3" />
                          Pediatric
                        </p>
                        <p className="font-semibold">{hospital.pediatricBeds}</p>
                      </div>
                    )}
                    {hospital.traumaBeds && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                          <Ambulance className="w-3 h-3" />
                          Trauma
                        </p>
                        <p className="font-semibold">{hospital.traumaBeds}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Crowd Reports */}
                {hospitalReports.length > 0 && (
                  <div className="mb-4">
                    <CrowdReportsDisplay reports={hospitalReports} />
                  </div>
                )}

                {/* Specialists */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Specialists</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialists.map((spec) => (
                        <span key={spec} className="text-xs bg-muted px-2 py-1 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" asChild>
                    <a href={`tel:${hospital.contact}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" size="sm" asChild>
                    <Link href="/request-ambulance">Request Ambulance</Link>
                  </Button>
                  <ReportHospitalStatus hospitalId={hospital.id} hospitalName={hospital.name} />
                </div>
              </Card>
            )
          })}
        </div>

        {filteredHospitals.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hospitals found matching your criteria</p>
          </Card>
        )}
      </div>
    </div>
  )
}
