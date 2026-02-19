"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Droplet, MapPin, Calendar, Star, Phone, Mail, CheckCircle, Loader2 } from "lucide-react"
import { DonorMap } from "@/components/donor-map"
import { Navbar } from "@/components/navbar"
import { donorAPI } from "@/lib/api/client"

interface Donor {
  _id: string
  name: string
  bloodGroup: string
  phone: string
  email?: string
  area: string
  available: boolean
  lastDonation?: string
  totalDonations: number
  verified: boolean
  location?: { coordinates: [number, number] }
}

export default function DonorsPage() {
  const [bloodType, setBloodType] = useState("")
  const [area, setArea] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDonors = async () => {
    setLoading(true)
    setError("")
    try {
      const filters: any = {}
      if (bloodType) filters.bloodGroup = bloodType
      if (area) filters.area = area
      if (availabilityFilter === "available") filters.available = true
      if (availabilityFilter === "unavailable") filters.available = false

      const res = await donorAPI.getAll(filters)
      setDonors(res.data || [])
    } catch (err: any) {
      setError("Failed to load donors. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDonors() }, [])

  const formatLastDonation = (date?: string) => {
    if (!date) return "No record"
    const d = new Date(date)
    const months = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (months === 0) return "This month"
    if (months === 1) return "1 month ago"
    return `${months} months ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Blood Donor Network</h1>
        <p className="text-muted-foreground mb-8">Find verified blood donors in your area</p>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">All Blood Types</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Area</label>
              <Input
                type="text"
                placeholder="e.g. South Delhi"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Donors</option>
                <option value="available">Available Now</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={fetchDonors} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Map */}
        {donors.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Donor Locations in Delhi</h2>
            <DonorMap
              donors={donors
                .filter(d => d.location?.coordinates)
                .map(d => ({
                  id: d._id,
                  name: d.name,
                  blood: d.bloodGroup,
                  lat: d.location!.coordinates[1],
                  lng: d.location!.coordinates[0],
                  available: d.available,
                }))}
            />
          </Card>
        )}

        <div className="mb-6 text-sm text-muted-foreground">
          {loading ? "Loading donors..." : `Showing ${donors.length} donor${donors.length !== 1 ? "s" : ""}`}
        </div>

        {error && (
          <Card className="p-6 text-center text-red-600 mb-4">{error}</Card>
        )}

        {/* Donors List */}
        <div className="space-y-4">
          {!loading && donors.length > 0 ? (
            donors.map((donor) => (
              <Card key={donor._id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Droplet className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{donor.name}</h3>
                          {donor.verified && <CheckCircle className="w-5 h-5 text-green-600" fill="currentColor" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            {donor.bloodGroup}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${donor.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {donor.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{donor.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Last: {formatLastDonation(donor.lastDonation)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                        <span>{donor.totalDonations} donations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{donor.phone}</span>
                      </div>
                    </div>

                    {donor.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span>{donor.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      disabled={!donor.available}
                      className="whitespace-nowrap"
                      onClick={() => window.location.href = `tel:${donor.phone}`}
                    >
                      Contact Donor
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : !loading && (
            <Card className="p-8 text-center">
              <Droplet className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No donors found matching your criteria</p>
              <Button variant="outline" onClick={() => { setBloodType(""); setArea(""); setAvailabilityFilter("all"); fetchDonors(); }}>
                Clear Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Become a Donor CTA */}
        <BecomeDonorModal onSuccess={fetchDonors} />
      </div>
    </div>
  )
}

// ── Become a Donor Modal ─────────────────────────────────────────────────────
function BecomeDonorModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", phone: "", email: "", bloodGroup: "", area: "",
  })

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const areas = ["North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"]

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.bloodGroup || !form.area) {
      setError("Name, phone, blood group, and area are required.")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      await donorAPI.register({ ...form, available: true, totalDonations: 0 })
      setDone(true)
      onSuccess()
      setTimeout(() => { setOpen(false); setDone(false); setForm({ name: "", phone: "", email: "", bloodGroup: "", area: "" }) }, 2000)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="text-center">
        <Droplet className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Become a Blood Donor</h2>
        <p className="text-muted-foreground mb-6">
          Join our network of verified donors and help save lives in your community. Every donation can save up to 3 lives.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">Register as Donor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-500" /> Register as Blood Donor
              </DialogTitle>
              <DialogDescription>
                Your details will appear in the donor network so people can contact you during emergencies.
              </DialogDescription>
            </DialogHeader>
            {done ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <p className="font-semibold text-green-700">You&apos;re registered!</p>
                <p className="text-sm text-muted-foreground">You now appear in the donor list.</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium mb-1 block">Full Name *</label>
                    <Input placeholder="Rajesh Kumar" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Phone *</label>
                    <Input placeholder="9876543210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Email (optional)</label>
                    <Input placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Blood Group *</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={form.bloodGroup}
                      onChange={(e) => set("bloodGroup", e.target.value)}
                    >
                      <option value="">Select</option>
                      {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Area *</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={form.area}
                      onChange={(e) => set("area", e.target.value)}
                    >
                      <option value="">Select area</option>
                      {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registering...</> : "Register Now"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
