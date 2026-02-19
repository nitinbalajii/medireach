"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  Users,
  Building2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { hospitals, bloodDonors, ambulances, emergencyAlerts } from "@/lib/delhi-data"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const hospitalsData = hospitals
  const donorsData = bloodDonors
  const ambulancesData = ambulances
  const alertsData = emergencyAlerts

  const pendingHospitals = hospitalsData.slice(0, 2)
  const pendingDonors = donorsData.slice(0, 2)

  const analyticsData = {
    totalHospitals: hospitalsData.length,
    totalDonors: donorsData.length,
    totalAmbulances: ambulancesData.length,
    activeRequests: 8,
    responseTime: "4.2 mins",
    successRate: "98.5%",
    bloodStockStatus: {
      "O+": 45,
      "O-": 12,
      "A+": 38,
      "A-": 15,
      "B+": 28,
      "B-": 8,
      "AB+": 10,
      "AB-": 5,
    },
  }

  const filteredHospitals = hospitalsData.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredDonors = donorsData.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredAmbulances = ambulancesData.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="text-2xl font-bold text-primary">MediReach Admin</span>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Logout</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Hospitals</p>
                <p className="text-3xl font-bold">{analyticsData.totalHospitals}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Donors</p>
                <p className="text-3xl font-bold">{analyticsData.totalDonors}</p>
              </div>
              <Users className="w-12 h-12 text-accent/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ambulances Active</p>
                <p className="text-3xl font-bold">{analyticsData.totalAmbulances}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Alerts</p>
                <p className="text-3xl font-bold">{alertsData.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500/20" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.responseTime}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Success Rate</p>
                <p className="text-2xl font-bold text-blue-900">{analyticsData.successRate}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Active Requests</p>
                <p className="text-2xl font-bold text-purple-900">{analyticsData.activeRequests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "hospitals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Hospitals ({analyticsData.totalHospitals})
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "donors"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Donors ({analyticsData.totalDonors})
          </button>
          <button
            onClick={() => setActiveTab("ambulances")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "ambulances"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Ambulances ({analyticsData.totalAmbulances})
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "alerts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab("blood-stock")}
            className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "blood-stock"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Blood Stock
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hospital Network Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ambulance Fleet Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Blood Bank Status</span>
                  <span className="text-yellow-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Low Stock Alert
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Donor Network Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Operational
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-muted-foreground">Emergency request processed</span>
                  <span className="text-xs text-muted-foreground">2 mins ago</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-muted-foreground">New donor verified</span>
                  <span className="text-xs text-muted-foreground">15 mins ago</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-muted-foreground">Hospital bed update</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ambulance dispatched</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === "hospitals" && (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hospital Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Beds</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ICU</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Oxygen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredHospitals.map((hospital) => (
                    <tr key={hospital.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{hospital.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            hospital.type === "Government"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {hospital.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{hospital.beds}</td>
                      <td className="px-4 py-3 text-sm">{hospital.icuBeds}</td>
                      <td className="px-4 py-3 text-sm">{hospital.oxygen}%</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === "donors" && (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Donor
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{donor.name}</h3>
                      <p className="text-sm text-muted-foreground">Area: {donor.area}</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">{donor.blood}</span>
                  </div>
                  <div className="flex gap-2 text-xs mb-3">
                    <span
                      className={`px-2 py-1 rounded ${donor.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {donor.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ambulances Tab */}
        {activeTab === "ambulances" && (
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search ambulances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Ambulance
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredAmbulances.map((ambulance) => (
                <Card key={ambulance.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{ambulance.name}</h3>
                      <p className="text-sm text-muted-foreground">Area: {ambulance.area}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        ambulance.status === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ambulance.status}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{ambulance.type}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alertsData.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <AlertCircle
                      className={`w-6 h-6 flex-shrink-0 mt-1 ${
                        alert.priority === "high"
                          ? "text-red-500"
                          : alert.priority === "medium"
                            ? "text-orange-500"
                            : "text-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mb-1">{alert.hospital}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Blood Stock Tab */}
        {activeTab === "blood-stock" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(analyticsData.bloodStockStatus).map(([bloodType, units]) => (
                <Card key={bloodType} className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary mb-1">{bloodType}</p>
                    <p className="text-3xl font-bold mb-2">{units}</p>
                    <p className="text-xs text-muted-foreground mb-3">units available</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${units < 15 ? "bg-red-500" : units < 30 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min((units / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Low Stock Alerts</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-red-900 font-medium">O- (Critical)</span>
                  <span className="text-red-600 font-semibold">12 units</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-900 font-medium">B- (Low)</span>
                  <span className="text-yellow-600 font-semibold">8 units</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
