"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { X, Filter } from "lucide-react"

interface AvailabilityFiltersProps {
    onFilterChange: (filters: AvailabilityFilterState) => void
    className?: string
}

export interface AvailabilityFilterState {
    resources: {
        icu: boolean
        oxygen: boolean
        ventilators: boolean
        pediatric: boolean
        trauma: boolean
    }
    minBeds: number
    onlyAvailable: boolean
    recentlyVerified: boolean
}

export function AvailabilityFilters({ onFilterChange, className = "" }: AvailabilityFiltersProps) {
    const [filters, setFilters] = useState<AvailabilityFilterState>({
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

    const [isExpanded, setIsExpanded] = useState(false)

    const handleResourceChange = (resource: keyof typeof filters.resources, checked: boolean) => {
        const newFilters = {
            ...filters,
            resources: {
                ...filters.resources,
                [resource]: checked,
            },
        }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleMinBedsChange = (value: number[]) => {
        const newFilters = {
            ...filters,
            minBeds: value[0],
        }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleToggleChange = (key: "onlyAvailable" | "recentlyVerified", checked: boolean) => {
        const newFilters = {
            ...filters,
            [key]: checked,
        }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const clearFilters = () => {
        const defaultFilters: AvailabilityFilterState = {
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
        }
        setFilters(defaultFilters)
        onFilterChange(defaultFilters)
    }

    const hasActiveFilters =
        Object.values(filters.resources).some((v) => v) ||
        filters.minBeds > 0 ||
        filters.onlyAvailable ||
        filters.recentlyVerified

    return (
        <Card className={`p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <h3 className="font-semibold">Advanced Filters</h3>
                    {hasActiveFilters && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                            <X className="w-3 h-3 mr-1" />
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-8 text-xs"
                    >
                        {isExpanded ? "Hide" : "Show"}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-6">
                    {/* Resource Filters */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Required Resources</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: "icu", label: "ICU Beds" },
                                { key: "oxygen", label: "Oxygen Supply" },
                                { key: "ventilators", label: "Ventilators" },
                                { key: "pediatric", label: "Pediatric Beds" },
                                { key: "trauma", label: "Trauma Care" },
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={filters.resources[key as keyof typeof filters.resources]}
                                        onCheckedChange={(checked) =>
                                            handleResourceChange(key as keyof typeof filters.resources, checked as boolean)
                                        }
                                    />
                                    <Label htmlFor={key} className="text-sm cursor-pointer">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Beds Slider */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">
                            Minimum Beds Available: {filters.minBeds}
                        </Label>
                        <Slider
                            value={[filters.minBeds]}
                            onValueChange={handleMinBedsChange}
                            max={50}
                            step={5}
                            className="w-full"
                        />
                    </div>

                    {/* Toggle Filters */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="onlyAvailable"
                                checked={filters.onlyAvailable}
                                onCheckedChange={(checked) => handleToggleChange("onlyAvailable", checked as boolean)}
                            />
                            <Label htmlFor="onlyAvailable" className="text-sm cursor-pointer">
                                Only show hospitals with available beds
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="recentlyVerified"
                                checked={filters.recentlyVerified}
                                onCheckedChange={(checked) =>
                                    handleToggleChange("recentlyVerified", checked as boolean)
                                }
                            />
                            <Label htmlFor="recentlyVerified" className="text-sm cursor-pointer">
                                Only recently verified (last 30 mins)
                            </Label>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}
