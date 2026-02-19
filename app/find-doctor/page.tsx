"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import {
    Search, User, Phone, MapPin, Clock, Stethoscope,
    Video, Star, IndianRupee, Loader2, AlertCircle, CheckCircle2
} from "lucide-react"

interface Doctor {
    _id: string
    name: string
    specialty: string
    qualifications: string[]
    experience: number
    hospitalName: string
    rating: number
    schedule: { day: string; startTime: string; endTime: string; isOnDuty: boolean }[]
    teleconsultationAvailable: boolean
    consultationFee: number
    phone?: string
    email?: string
    isOnDuty: boolean
}

const SPECIALTY_CHIPS = [
    "All", "Cardiology", "Pediatrics", "Neurology",
    "Orthopedics", "Emergency Medicine", "Oncology",
    "Dermatology", "Gynecology", "Psychiatry"
]

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

function formatSchedule(schedule: Doctor["schedule"]) {
    const onDutyDays = schedule.filter(s => s.isOnDuty)
    if (!onDutyDays.length) return "Not scheduled"
    // Group consecutive days
    const dayAbbr: Record<string, string> = {
        monday: "Mon", tuesday: "Tue", wednesday: "Wed",
        thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun"
    }
    const times = onDutyDays[0].startTime + " – " + onDutyDays[0].endTime
    const days = onDutyDays.map(s => dayAbbr[s.day]).join(", ")
    return `${days}: ${times}`
}

export default function FindDoctor() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSpecialty, setSelectedSpecialty] = useState("All")
    const [filterOnDuty, setFilterOnDuty] = useState(false)
    const [filterTeleconsult, setFilterTeleconsult] = useState(false)

    const fetchDoctors = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append("search", searchQuery)
            if (selectedSpecialty !== "All") params.append("specialty", selectedSpecialty)
            if (filterOnDuty) params.append("onDuty", "true")
            if (filterTeleconsult) params.append("teleconsult", "true")

            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
            const res = await fetch(`${apiBase}/doctors?${params.toString()}`)
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setDoctors(data.data)
        } catch (err: any) {
            setError(err.message || "Failed to load doctors")
        } finally {
            setLoading(false)
        }
    }

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchDoctors()
    }, [selectedSpecialty, filterOnDuty, filterTeleconsult])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchDoctors()
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Find Doctors</h1>
                    <p className="text-muted-foreground">
                        Search for on-duty doctors across hospitals in Delhi
                    </p>
                </div>

                {/* Search bar */}
                <Card className="p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Search by name, specialty, or hospital…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-base"
                            />
                            <Button type="submit" size="lg">
                                <Search className="w-5 h-5 mr-2" />
                                Search
                            </Button>
                        </div>

                        {/* Specialty chips */}
                        <div className="flex flex-wrap gap-2">
                            {SPECIALTY_CHIPS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedSpecialty(s)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${selectedSpecialty === s
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Toggle filters */}
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filterOnDuty}
                                    onChange={(e) => setFilterOnDuty(e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm font-medium">On-Duty Now</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filterTeleconsult}
                                    onChange={(e) => setFilterTeleconsult(e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm font-medium">Teleconsultation Available</span>
                            </label>
                        </div>
                    </form>
                </Card>

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading doctors…</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} found
                        </p>

                        {doctors.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground">
                                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">No doctors found</p>
                                <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                            </Card>
                        ) : (
                            doctors.map((doctor) => (
                                <Card key={doctor._id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">{doctor.name}</h3>
                                                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                                                    <Stethoscope className="w-4 h-4" />
                                                    {doctor.specialty}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {doctor.qualifications.join(" • ")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status badges */}
                                        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                                            {doctor.isOnDuty ? (
                                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    On-Duty Now
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    Off-Duty
                                                </span>
                                            )}
                                            {doctor.teleconsultationAvailable && (
                                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    <Video className="w-3 h-3" />
                                                    Teleconsult
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{doctor.hospitalName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{doctor.experience} yrs exp</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Star className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                                            <span>{doctor.rating.toFixed(1)} rating</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <IndianRupee className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {doctor.consultationFee === 0 ? "Free (Emergency)" : `₹${doctor.consultationFee}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatSchedule(doctor.schedule)}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                        {doctor.phone && (
                                            <a href={`tel:${doctor.phone}`}>
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    disabled={!doctor.isOnDuty && doctor.specialty !== "Emergency Medicine"}
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Call Hospital
                                                </Button>
                                            </a>
                                        )}
                                        {doctor.teleconsultationAvailable && (
                                            <Button variant="outline">
                                                <Video className="w-4 h-4 mr-2" />
                                                Book Teleconsult
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
