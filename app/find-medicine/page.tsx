"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Search, MapPin, Phone, Clock, Package, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { pharmacyAPI } from "@/lib/api/client"

interface MatchedMedicine {
    name: string
    availability: "in_stock" | "low_stock" | "out_of_stock"
    price: number
}

interface Pharmacy {
    _id: string
    name: string
    address: string
    area?: string
    phone: string
    is24x7: boolean
    location?: { coordinates: [number, number] }
    matchedMedicines?: MatchedMedicine[]
    inventory?: { medicineName: string; availability: string; price: number }[]
}

const availabilityColor = (status: string) => {
    if (status === "in_stock") return "text-green-700 bg-green-100"
    if (status === "low_stock") return "text-yellow-700 bg-yellow-100"
    return "text-red-700 bg-red-100"
}

const availabilityLabel = (status: string) => {
    if (status === "in_stock") return "In Stock"
    if (status === "low_stock") return "Low Stock"
    return "Out of Stock"
}

export default function FindMedicine() {
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<Pharmacy[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setLoading(true)
        setError("")
        setSearched(true)
        try {
            const res = await pharmacyAPI.search(searchQuery.trim())
            setResults(res.data || [])
        } catch (err: any) {
            setError("Failed to search pharmacies. Please try again.")
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Find Medicine</h1>
                    <p className="text-muted-foreground">
                        Search for medicine availability across pharmacies in Delhi
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="p-6 mb-8">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search for medicine (e.g., Paracetamol, Insulin)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="text-lg"
                            />
                        </div>
                        <Button onClick={handleSearch} size="lg" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" />Search</>}
                        </Button>
                    </div>
                </Card>

                {error && (
                    <Card className="p-4 mb-4 flex items-center gap-2 text-red-600 bg-red-50 border-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </Card>
                )}

                {/* Results */}
                {results.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">
                            Found in {results.length} {results.length === 1 ? "pharmacy" : "pharmacies"}
                        </h2>

                        {results.map((pharmacy) => (
                            <Card key={pharmacy._id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{pharmacy.name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {pharmacy.address}
                                            {pharmacy.area && ` · ${pharmacy.area}`}
                                        </p>
                                    </div>
                                    {pharmacy.is24x7 && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                            24/7 Open
                                        </span>
                                    )}
                                </div>

                                {/* Matched medicines */}
                                {pharmacy.matchedMedicines && pharmacy.matchedMedicines.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2">Matching medicines:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pharmacy.matchedMedicines.map((med, i) => (
                                                <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${availabilityColor(med.availability)}`}>
                                                    <CheckCircle className="w-3 h-3" />
                                                    {med.name} — ₹{med.price} · {availabilityLabel(med.availability)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{pharmacy.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        <span>{pharmacy.inventory?.length || 0} medicines stocked</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>{pharmacy.is24x7 ? "Open Now (24/7)" : "9 AM – 9 PM"}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => window.location.href = `tel:${pharmacy.phone}`}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Pharmacy
                                    </Button>
                                    {pharmacy.location?.coordinates && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const [lng, lat] = pharmacy.location!.coordinates
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
                                            }}
                                        >
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Get Directions
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : searched && !loading ? (
                    <Card className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No pharmacies found</h3>
                        <p className="text-muted-foreground">
                            Try searching for a different medicine or check the spelling
                        </p>
                    </Card>
                ) : !loading && (
                    <Card className="p-12 text-center">
                        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Search for Medicine</h3>
                        <p className="text-muted-foreground">
                            Enter a medicine name to find availability across pharmacies
                        </p>
                    </Card>
                )}
            </div>
        </div>
    )
}
