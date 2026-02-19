"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { User, Heart, Phone, FileText, QrCode, Save, Download, Loader2, CheckCircle, ExternalLink } from "lucide-react"
import QRCodeLib from "qrcode"
import { patientAPI } from "@/lib/api/client"
import Link from "next/link"

export default function PatientProfile() {
    const [profile, setProfile] = useState({
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        emergencyContact: "",
        emergencyContactName: "",
        allergies: "",
        medications: "",
        conditions: [] as string[],
        insuranceId: "",
    })

    const [qrCode, setQrCode] = useState("")
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    // patientDbId: the MongoDB _id returned after first save — used to build the QR URL
    const [patientDbId, setPatientDbId] = useState<string | null>(null)
    const [scanUrl, setScanUrl] = useState<string | null>(null)

    const conditions = [
        "Diabetes",
        "Hypertension",
        "Heart Disease",
        "Asthma",
        "Kidney Disease",
        "Epilepsy",
    ]

    const handleConditionToggle = (condition: string) => {
        setProfile(prev => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter(c => c !== condition)
                : [...prev.conditions, condition]
        }))
    }

    const handleSave = async () => {
        if (!profile.name || !profile.bloodGroup || !profile.phone) {
            setSaveError('Name, blood group, and phone are required')
            return
        }
        setSaving(true)
        setSaveError(null)

        try {
            // Get or create a stable clientId for this device
            let clientId = localStorage.getItem('medireach_client_id')
            if (!clientId) {
                clientId = crypto.randomUUID()
                localStorage.setItem('medireach_client_id', clientId)
            }

            // Save to backend (upsert by clientId)
            const response = await patientAPI.saveProfile({
                clientId,
                name: profile.name,
                age: Number(profile.age),
                gender: profile.gender,
                bloodGroup: profile.bloodGroup,
                phone: profile.phone,
                emergencyContact: profile.emergencyContactName ? {
                    name: profile.emergencyContactName,
                    phone: profile.emergencyContact,
                    relation: 'Emergency Contact',
                } : undefined,
                medicalHistory: {
                    conditions: profile.conditions,
                    allergies: profile.allergies ? profile.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
                    medications: profile.medications ? profile.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
                },
                insuranceId: profile.insuranceId || undefined,
            })

            const dbId = response.data._id
            setPatientDbId(dbId)

            // Also save to localStorage as a cache
            localStorage.setItem('medireach_patient_profile', JSON.stringify({ ...profile, dbId }))

            // Generate QR code linking to the public scan page
            const publicUrl = `${window.location.origin}/scan/${dbId}`
            setScanUrl(publicUrl)

            const qr = await QRCodeLib.toDataURL(publicUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#0f172a', light: '#ffffff' }
            })
            setQrCode(qr)
            setSaved(true)
            setTimeout(() => setSaved(false), 4000)
        } catch (err: any) {
            setSaveError(err.message || 'Failed to save profile. Is the backend running?')
        } finally {
            setSaving(false)
        }
    }

    const handleDownloadQR = () => {
        const link = document.createElement('a')
        link.href = qrCode
        link.download = 'medireach-health-profile.png'
        link.click()
    }

    // Load saved profile and patientDbId on mount
    useEffect(() => {
        const saved = localStorage.getItem('medireach_patient_profile')
        if (saved) {
            const parsed = JSON.parse(saved)
            setProfile(parsed)
            // If we have a saved dbId, rebuild the scan URL and QR
            if (parsed.dbId) {
                setPatientDbId(parsed.dbId)
                const publicUrl = `${window.location.origin}/scan/${parsed.dbId}`
                setScanUrl(publicUrl)
                QRCodeLib.toDataURL(publicUrl, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
                    .then(setQrCode)
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Patient Profile</h1>
                    <p className="text-muted-foreground">
                        Save your health information for faster emergency response
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Form */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="age">Age *</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={profile.age}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="gender">Gender *</Label>
                                    <select
                                        id="gender"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={profile.gender}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                                    <select
                                        id="bloodGroup"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={profile.bloodGroup}
                                        onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+91-9876543210"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Emergency Contact */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Emergency Contact
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emergencyContactName">Contact Name *</Label>
                                    <Input
                                        id="emergencyContactName"
                                        value={profile.emergencyContactName}
                                        onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="emergencyContact">Contact Phone *</Label>
                                    <Input
                                        id="emergencyContact"
                                        type="tel"
                                        value={profile.emergencyContact}
                                        onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                        placeholder="+91-9876543211"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Health Information */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                Health Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <Label>Medical Conditions</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {conditions.map((condition) => (
                                            <label key={condition} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={profile.conditions.includes(condition)}
                                                    onChange={() => handleConditionToggle(condition)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{condition}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Input
                                        id="allergies"
                                        value={profile.allergies}
                                        onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                                        placeholder="Penicillin, Peanuts, etc."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="medications">Current Medications</Label>
                                    <Input
                                        id="medications"
                                        value={profile.medications}
                                        onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                                        placeholder="Aspirin, Metformin, etc."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="insuranceId">Insurance ID (Optional)</Label>
                                    <Input
                                        id="insuranceId"
                                        value={profile.insuranceId}
                                        onChange={(e) => setProfile({ ...profile, insuranceId: e.target.value })}
                                        placeholder="INS123456789"
                                    />
                                </div>
                            </div>
                        </Card>

                        {saveError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {saveError}
                            </p>
                        )}

                        <Button onClick={handleSave} className="w-full" size="lg" disabled={saving}>
                            {saving ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving to MediReach...</>
                            ) : saved ? (
                                <><CheckCircle className="w-5 h-5 mr-2" />Profile Saved!</>
                            ) : (
                                <><Save className="w-5 h-5 mr-2" />Save Profile to MediReach</>
                            )}
                        </Button>
                    </div>

                    {/* QR Code Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                Health QR Code
                            </h2>

                            {qrCode ? (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg border">
                                        <img src={qrCode} alt="Health Profile QR" className="w-full" />
                                    </div>

                                    {scanUrl && (
                                        <div className="text-xs bg-muted rounded-lg p-3 break-all">
                                            <p className="text-muted-foreground mb-1">Public scan URL:</p>
                                            <Link
                                                href={scanUrl}
                                                target="_blank"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                {scanUrl}
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </Link>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Scan this QR to view your health profile. Share with doctors during emergencies.
                                    </p>

                                    <Button onClick={handleDownloadQR} variant="outline" className="w-full">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download QR Code
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Save your profile to generate QR code</p>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">💡 Benefits</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Faster emergency admission</li>
                                <li>• No form filling during crisis</li>
                                <li>• Accurate medical history</li>
                                <li>• Auto-notify emergency contacts</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
