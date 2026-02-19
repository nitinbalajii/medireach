"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Ambulance, Droplet, Phone, Clock, Users, Map } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("map")

  const hospitals = [
    {
      id: 1,
      name: "City General Hospital",
      beds: 12,
      distance: "2.3 km",
      phone: "555-0101",
      rating: 4.8,
      lat: 40.7128,
      lng: -74.006,
    },
    {
      id: 2,
      name: "St. Mary Medical Center",
      beds: 8,
      distance: "3.1 km",
      phone: "555-0102",
      rating: 4.6,
      lat: 40.758,
      lng: -73.9855,
    },
    {
      id: 3,
      name: "Emergency Care Clinic",
      beds: 5,
      distance: "1.8 km",
      phone: "555-0103",
      rating: 4.9,
      lat: 40.7489,
      lng: -73.968,
    },
  ]

  const ambulances = [
    {
      id: 1,
      status: "Available",
      distance: "1.2 km",
      eta: "4 mins",
      type: "Advanced Life Support",
      lat: 40.72,
      lng: -74.005,
    },
    {
      id: 2,
      status: "Available",
      distance: "2.5 km",
      eta: "7 mins",
      type: "Basic Life Support",
      lat: 40.75,
      lng: -73.99,
    },
    { id: 3, status: "Busy", distance: "3.1 km", eta: "N/A", type: "Advanced Life Support", lat: 40.74, lng: -73.975 },
  ]

  const donors = [
    { id: 1, name: "Alex Johnson", blood: "O+", distance: "1.5 km", available: true, lat: 40.715, lng: -74.01 },
    { id: 2, name: "Sarah Williams", blood: "A+", distance: "2.2 km", available: true, lat: 40.755, lng: -73.99 },
    { id: 3, name: "Mike Chen", blood: "B+", distance: "3.0 km", available: false, lat: 40.745, lng: -73.97 },
  ]

  const MapVisualization = () => {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-border relative overflow-hidden">
        {/* Map background with grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 w-full h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Map content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="text-sm font-semibold text-blue-900">Emergency Response Map</div>

          {/* Hospitals markers */}
          {hospitals.map((hospital) => (
            <div
              key={`h-${hospital.id}`}
              className="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition"
              style={{
                left: `${(hospital.lng + 74.1) * 10}%`,
                top: `${(40.8 - hospital.lat) * 20}%`,
              }}
              title={hospital.name}
            >
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
          ))}

          {/* Ambulances markers */}
          {ambulances.map((ambulance) => (
            <div
              key={`a-${ambulance.id}`}
              className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition ${
                ambulance.status === "Available" ? "bg-yellow-500" : "bg-gray-400"
              }`}
              style={{
                left: `${(ambulance.lng + 74.1) * 10}%`,
                top: `${(40.8 - ambulance.lat) * 20}%`,
              }}
              title={ambulance.type}
            >
              <Ambulance className="w-4 h-4 text-white" />
            </div>
          ))}

          {/* Donors markers */}
          {donors.map((donor) => (
            <div
              key={`d-${donor.id}`}
              className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition ${
                donor.available ? "bg-green-500" : "bg-gray-400"
              }`}
              style={{
                left: `${(donor.lng + 74.1) * 10}%`,
                top: `${(40.8 - donor.lat) * 20}%`,
              }}
              title={donor.name}
            >
              <Droplet className="w-4 h-4 text-white" />
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Hospitals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Ambulances</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Donors</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="text-2xl font-bold text-primary">MediReach</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Logout</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Emergency Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Hospitals Online</p>
                <p className="text-3xl font-bold text-primary">23</p>
              </div>
              <Heart className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ambulances Available</p>
                <p className="text-3xl font-bold text-accent">12</p>
              </div>
              <Ambulance className="w-12 h-12 text-accent/20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Verified Donors</p>
                <p className="text-3xl font-bold text-primary">156</p>
              </div>
              <Droplet className="w-12 h-12 text-primary/20" />
            </div>
          </Card>
        </div>

        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "map"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="w-4 h-4" />
            Map View
          </button>
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "hospitals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => setActiveTab("ambulances")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "ambulances"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Ambulances
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "donors"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Blood Donors
          </button>
        </div>

        {activeTab === "map" && (
          <div className="space-y-6">
            <MapVisualization />
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Map Information</h3>
              <p className="text-muted-foreground text-sm mb-4">
                This map shows real-time locations of nearby hospitals, ambulances, and blood donors in your area. Click
                on any marker to view more details.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-red-600">Hospitals</p>
                  <p className="text-muted-foreground">{hospitals.length} available</p>
                </div>
                <div>
                  <p className="font-medium text-yellow-600">Ambulances</p>
                  <p className="text-muted-foreground">
                    {ambulances.filter((a) => a.status === "Available").length} available
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-600">Donors</p>
                  <p className="text-muted-foreground">{donors.filter((d) => d.available).length} available</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === "hospitals" && (
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{hospital.name}</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>{hospital.beds} beds available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>{hospital.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{hospital.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="ml-4">Call Now</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Ambulances Tab */}
        {activeTab === "ambulances" && (
          <div className="space-y-4">
            {ambulances.map((ambulance) => (
              <Card key={ambulance.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Ambulance className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-semibold">{ambulance.type}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ambulance.status === "Available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ambulance.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{ambulance.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>ETA: {ambulance.eta}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="ml-4" disabled={ambulance.status !== "Available"}>
                    Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === "donors" && (
          <div className="space-y-4">
            {donors.map((donor) => (
              <Card key={donor.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{donor.name}</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-primary" />
                        <span>Blood Type: {donor.blood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>{donor.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{donor.available ? "Available" : "Not Available"}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="ml-4" disabled={!donor.available}>
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
