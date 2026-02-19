"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, AlertCircle, Bell, Droplet, Wind, TrendingUp, Clock, MapPin, CheckCircle, X, Activity } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { emergencyAPI } from "@/lib/api/client"

interface EmergencyEvent {
  _id: string
  type: string
  urgency: string
  status: string
  patientName?: string
  address?: string
  hospitalName?: string
  createdAt: string
}

interface StaticAlert {
  id: string
  type: "blood" | "oxygen" | "health" | "icu"
  title: string
  description: string
  hospital?: string
  severity: "critical" | "high" | "medium" | "low"
  timestamp: string
  status: "active" | "resolved"
  actionRequired?: string
}

const STATIC_ALERTS: StaticAlert[] = [
  { id: "s1", type: "blood", title: "O- Blood Donors Needed", description: "Universal donor blood type in high demand across multiple Delhi hospitals.", hospital: "Multiple Facilities", severity: "high", timestamp: "2 hours ago", status: "active", actionRequired: "Donation campaign" },
  { id: "s2", type: "health", title: "Seasonal Flu Alert", description: "Increased respiratory infections reported across Delhi. Practice precautions.", hospital: "Delhi Health Department", severity: "medium", timestamp: "3 hours ago", status: "active", actionRequired: "Public awareness" },
  { id: "s3", type: "oxygen", title: "Oxygen Levels Normalized", description: "Safdarjung Hospital oxygen levels restored to normal after supply delivery.", hospital: "Safdarjung Hospital", severity: "low", timestamp: "5 hours ago", status: "resolved" },
]

export default function AlertsPage() {
  const [subscribedAlerts, setSubscribedAlerts] = useState<string[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [filterType, setFilterType] = useState("all")
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([])
  const [loadingEmergencies, setLoadingEmergencies] = useState(true)

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await emergencyAPI.getAll()
        setEmergencies(res.data || [])
      } catch {
        // silently fall back to static alerts only
      } finally {
        setLoadingEmergencies(false)
      }
    }
    fetchEmergencies()
  }, [])

  // Convert recent emergency requests into alert cards
  const liveAlerts: StaticAlert[] = emergencies
    .filter((e) => e.status === "active" || e.status === "dispatched")
    .slice(0, 5)
    .map((e) => ({
      id: e._id,
      type: e.type === "ambulance" ? "icu" : "health",
      title: `🆘 ${e.urgency === "critical" ? "Critical" : "Active"} Emergency — ${e.type === "ambulance" ? "Ambulance Requested" : "SOS Triggered"}`,
      description: `${e.patientName || "Anonymous"} at ${e.address || "location not shared"}. Status: ${e.status}.`,
      hospital: e.hospitalName,
      severity: e.urgency === "critical" ? "critical" : e.urgency === "high" ? "high" : "medium",
      timestamp: new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "active" as const,
      actionRequired: "Emergency active",
    }))

  const allAlerts = [...liveAlerts, ...STATIC_ALERTS]

  const filteredAlerts = allAlerts.filter((alert) => {
    if (dismissedAlerts.includes(alert.id)) return false
    if (filterType === "all") return true
    if (filterType === "active") return alert.status === "active"
    if (filterType === "resolved") return alert.status === "resolved"
    if (filterType === "critical") return alert.severity === "critical"
    if (filterType === "live") return liveAlerts.some((l) => l.id === alert.id)
    return true
  })

  const toggleSubscribe = (alertId: string) => {
    setSubscribedAlerts((prev) => prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId])
  }

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId])
  }

  const getSeverityColor = (severity: StaticAlert["severity"]) => {
    switch (severity) {
      case "critical": return "bg-red-100 border-red-300 text-red-900"
      case "high": return "bg-orange-100 border-orange-300 text-orange-900"
      case "medium": return "bg-yellow-100 border-yellow-300 text-yellow-900"
      case "low": return "bg-green-100 border-green-300 text-green-900"
    }
  }

  const getSeverityIcon = (severity: StaticAlert["severity"]) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-5 h-5 text-red-600" />
      case "high": return <TrendingUp className="w-5 h-5 text-orange-600" />
      case "medium": return <Bell className="w-5 h-5 text-yellow-600" />
      case "low": return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getAlertIcon = (type: StaticAlert["type"]) => {
    switch (type) {
      case "blood": return <Droplet className="w-5 h-5" />
      case "oxygen": return <Wind className="w-5 h-5" />
      case "icu": return <Heart className="w-5 h-5" />
      case "health": return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Alerts &amp; Notifications</h1>
          <p className="text-muted-foreground">
            Stay informed about critical health updates, resource shortages, and live emergency events across Delhi
          </p>
        </div>

        {/* Live Emergency Banner */}
        {liveAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-600 animate-pulse" />
            <p className="text-red-800 font-semibold">
              {liveAlerts.length} live emergency event{liveAlerts.length > 1 ? "s" : ""} happening right now in Delhi
            </p>
          </div>
        )}

        {/* Alert Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Active Alerts</div>
            <p className="text-3xl font-bold text-red-600">{filteredAlerts.filter((a) => a.status === "active").length}</p>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Live Emergencies</div>
            <p className="text-3xl font-bold text-orange-600">{loadingEmergencies ? "—" : liveAlerts.length}</p>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Subscribed</div>
            <p className="text-3xl font-bold text-primary">{subscribedAlerts.length}</p>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Resolved</div>
            <p className="text-3xl font-bold text-green-600">{allAlerts.filter((a) => a.status === "resolved").length}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-4">Filter Alerts</h3>
          <div className="flex flex-wrap gap-2">
            {["all", "live", "active", "resolved", "critical"].map((filter) => (
              <Button key={filter} variant={filterType === filter ? "default" : "outline"} onClick={() => setFilterType(filter)} className="capitalize">
                {filter === "all" ? "All Alerts" : filter === "live" ? "🔴 Live" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`p-6 border-l-4 ${getSeverityColor(alert.severity)} ${alert.status === "resolved" ? "opacity-75" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.status === "active" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{alert.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {alert.hospital && (
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{alert.hospital}</span></div>
                      )}
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{alert.timestamp}</span></div>
                      {alert.actionRequired && (
                        <div className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /><span className="font-medium">{alert.actionRequired}</span></div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {alert.type === "blood" && alert.status === "active" && (
                        <Button size="sm" asChild><Link href="/donors">Find Donors</Link></Button>
                      )}
                      {(alert.type === "icu" || alert.type === "oxygen") && alert.status === "active" && (
                        <Button size="sm" asChild><Link href="/find-hospital">Find Hospital</Link></Button>
                      )}
                      <Button size="sm" variant={subscribedAlerts.includes(alert.id) ? "default" : "outline"} onClick={() => toggleSubscribe(alert.id)}>
                        {subscribedAlerts.includes(alert.id) ? "Subscribed" : "Subscribe"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)} className="ml-auto">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No alerts matching your filters</p>
              <Button variant="outline" onClick={() => setFilterType("all")}>View All Alerts</Button>
            </Card>
          )}
        </div>

        {/* Emergency Contacts */}
        <Card className="mt-12 p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold mb-4 text-red-900">Emergency Contacts</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><p className="text-sm text-red-800 mb-1">Ambulance</p><p className="text-2xl font-bold text-red-900">102 / 108</p></div>
            <div><p className="text-sm text-red-800 mb-1">Police</p><p className="text-2xl font-bold text-red-900">100</p></div>
            <div><p className="text-sm text-red-800 mb-1">Fire Services</p><p className="text-2xl font-bold text-red-900">101</p></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
