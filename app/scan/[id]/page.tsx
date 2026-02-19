"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { patientAPI } from "@/lib/api/client"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import {
    User, Droplets, Phone, AlertTriangle, Pill,
    Stethoscope, Heart, ShieldCheck, Loader2
} from "lucide-react"

interface PatientProfile {
    _id: string
    name: string
    age: number
    gender: string
    bloodGroup: string
    emergencyContact?: {
        name: string
        phone: string
        relation: string
    }
    medicalHistory?: {
        conditions?: string[]
        allergies?: string[]
        medications?: string[]
        surgeries?: string[]
    }
    insuranceId?: string
    createdAt: string
}

export default function ScanPage() {
    const params = useParams()
    const id = params?.id as string

    const [profile, setProfile] = useState<PatientProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        const fetchProfile = async () => {
            try {
                const response = await patientAPI.getById(id)
                setProfile(response.data)
            } catch (err: any) {
                setError(err.message || "Profile not found")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Loading patient profile...</p>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                    <p className="text-muted-foreground">
                        {error || "This QR code does not link to a valid patient profile."}
                    </p>
                </div>
            </div>
        )
    }

    const bloodGroupColor: Record<string, string> = {
        "A+": "bg-red-100 text-red-800 border-red-200",
        "A-": "bg-red-100 text-red-800 border-red-200",
        "B+": "bg-orange-100 text-orange-800 border-orange-200",
        "B-": "bg-orange-100 text-orange-800 border-orange-200",
        "AB+": "bg-purple-100 text-purple-800 border-purple-200",
        "AB-": "bg-purple-100 text-purple-800 border-purple-200",
        "O+": "bg-blue-100 text-blue-800 border-blue-200",
        "O-": "bg-blue-100 text-blue-800 border-blue-200",
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Emergency banner */}
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                        <strong>Medical Emergency Profile</strong> — This page is for authorised medical personnel only.
                    </span>
                </div>

                {/* Patient header */}
                <Card className="p-6 mb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{profile.name}</h1>
                                <p className="text-muted-foreground">
                                    {profile.age} years • {profile.gender}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 font-bold text-lg ${bloodGroupColor[profile.bloodGroup] || "bg-gray-100 text-gray-800"}`}>
                            <Droplets className="w-4 h-4 inline mr-1" />
                            {profile.bloodGroup}
                        </div>
                    </div>
                </Card>

                {/* Emergency Contact */}
                {profile.emergencyContact?.name && (
                    <Card className="p-5 mb-4 border-orange-200 bg-orange-50">
                        <h2 className="font-semibold text-orange-900 flex items-center gap-2 mb-3">
                            <Phone className="w-4 h-4" />
                            Emergency Contact
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-orange-900">{profile.emergencyContact.name}</p>
                                <p className="text-sm text-orange-700">{profile.emergencyContact.relation}</p>
                            </div>
                            <a
                                href={`tel:${profile.emergencyContact.phone}`}
                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                            >
                                <Phone className="w-4 h-4" />
                                {profile.emergencyContact.phone}
                            </a>
                        </div>
                    </Card>
                )}

                {/* Medical History */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Conditions */}
                    {(profile.medicalHistory?.conditions?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                                <Heart className="w-4 h-4 text-red-500" />
                                Medical Conditions
                            </h2>
                            <ul className="space-y-1">
                                {profile.medicalHistory!.conditions!.map((c, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Allergies */}
                    {(profile.medicalHistory?.allergies?.length ?? 0) > 0 && (
                        <Card className="p-5 border-yellow-200">
                            <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm text-yellow-800">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Allergies
                            </h2>
                            <ul className="space-y-1">
                                {profile.medicalHistory!.allergies!.map((a, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2 text-yellow-900">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Medications */}
                    {(profile.medicalHistory?.medications?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                                <Pill className="w-4 h-4 text-blue-500" />
                                Current Medications
                            </h2>
                            <ul className="space-y-1">
                                {profile.medicalHistory!.medications!.map((m, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Surgeries */}
                    {(profile.medicalHistory?.surgeries?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                                <Stethoscope className="w-4 h-4 text-purple-500" />
                                Past Surgeries
                            </h2>
                            <ul className="space-y-1">
                                {profile.medicalHistory!.surgeries!.map((s, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                {/* Insurance */}
                {profile.insuranceId && (
                    <Card className="p-5 mb-4">
                        <h2 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            Insurance
                        </h2>
                        <p className="text-sm font-mono text-muted-foreground">{profile.insuranceId}</p>
                    </Card>
                )}

                {/* Footer */}
                <p className="text-xs text-center text-muted-foreground mt-6">
                    Profile ID: {profile._id} • Last updated: {new Date(profile.createdAt).toLocaleDateString("en-IN")}
                    <br />
                    Powered by MediReach — medireach.org
                </p>
            </div>
        </div>
    )
}
