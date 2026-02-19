"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Navigation, Star, TrendingUp } from "lucide-react"
import type { Recommendation } from "@/lib/types"

interface SmartRecommendationsProps {
    recommendations: Recommendation[]
    userLocation?: { lat: number; lng: number }
    emergencyType?: "trauma" | "cardiac" | "pediatric" | "general"
    className?: string
}

export function SmartRecommendations({
    recommendations,
    emergencyType = "general",
    className = "",
}: SmartRecommendationsProps) {
    if (recommendations.length === 0) {
        return null
    }

    const emergencyLabels = {
        trauma: "Trauma Emergency",
        cardiac: "Cardiac Emergency",
        pediatric: "Pediatric Emergency",
        general: "General Emergency",
    }

    return (
        <div className={className}>
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Recommended for You</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Top {recommendations.length} hospitals for {emergencyLabels[emergencyType]} based on distance,
                    availability, and ratings
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {recommendations.map((rec, index) => (
                    <Card
                        key={rec.hospital.id}
                        className={`p-5 relative overflow-hidden ${index === 0 ? "border-primary border-2" : ""}`}
                    >
                        {index === 0 && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                BEST MATCH
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="font-bold text-lg mb-1">{rec.hospital.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {rec.hospital.address}
                            </p>
                            {rec.hospital.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-semibold">{rec.hospital.rating}</span>
                                    <span className="text-xs text-muted-foreground">/5</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Distance:</span>
                                <span className="font-semibold">{rec.hospital.distance?.toFixed(1) || "N/A"} km</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">ETA:</span>
                                <span className="font-semibold text-orange-600">{rec.estimatedTime} min</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Match Score:</span>
                                <span className="font-semibold text-primary">
                                    {Math.round(rec.score.totalScore)}/40
                                </span>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded p-3 mb-4">
                            <p className="text-xs font-medium mb-2">Why this hospital?</p>
                            <ul className="space-y-1">
                                {rec.reasons.slice(0, 3).map((reason, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${rec.hospital.contact}`}>
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call
                                </a>
                            </Button>
                            <Button size="sm" asChild>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${rec.hospital.lat},${rec.hospital.lng}&travelmode=driving`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Navigation className="w-3 h-3 mr-1" />
                                    Navigate
                                </a>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
