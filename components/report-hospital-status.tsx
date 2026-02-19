"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Users, Clock, XCircle, Droplet, UserX } from "lucide-react"

interface ReportHospitalStatusProps {
    hospitalId: number
    hospitalName: string
    onReportSubmit?: (report: {
        hospitalId: number
        reportType: string
        description: string
    }) => void
}

export function ReportHospitalStatus({
    hospitalId,
    hospitalName,
    onReportSubmit,
}: ReportHospitalStatusProps) {
    const [open, setOpen] = useState(false)
    const [selectedType, setSelectedType] = useState<string>("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const reportTypes = [
        {
            value: "long_queue",
            label: "Long Queue",
            icon: Clock,
            description: "30+ minute wait time",
            color: "text-yellow-600",
        },
        {
            value: "emergency_closed",
            label: "Emergency Closed",
            icon: XCircle,
            description: "Emergency ward not accepting patients",
            color: "text-red-600",
        },
        {
            value: "beds_full",
            label: "Beds Full",
            icon: Users,
            description: "No beds available",
            color: "text-orange-600",
        },
        {
            value: "oxygen_shortage",
            label: "Oxygen Shortage",
            icon: Droplet,
            description: "Low oxygen supply",
            color: "text-blue-600",
        },
        {
            value: "no_doctors",
            label: "No Doctors Available",
            icon: UserX,
            description: "Specialists not available",
            color: "text-purple-600",
        },
    ]

    const handleSubmit = async () => {
        if (!selectedType) {
            alert("Please select a report type")
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const report = {
            hospitalId,
            reportType: selectedType,
            description,
        }

        console.log("Report submitted:", report)

        if (onReportSubmit) {
            onReportSubmit(report)
        }

        setIsSubmitting(false)
        setOpen(false)
        setSelectedType("")
        setDescription("")

        // Show success message
        alert("Thank you for your report! It will help others make informed decisions.")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Report Status
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report Hospital Status</DialogTitle>
                    <DialogDescription>
                        Help others by reporting current conditions at {hospitalName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label className="text-sm font-medium mb-3 block">What would you like to report?</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {reportTypes.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedType(type.value)}
                                        className={`p-3 rounded-lg border-2 text-left transition ${selectedType === type.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 mb-2 ${type.color}`} />
                                        <div className="font-medium text-sm mb-1">{type.label}</div>
                                        <div className="text-xs text-muted-foreground">{type.description}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                            Additional Details (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Provide any additional information that might be helpful..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="bg-muted/50 rounded p-3 text-xs text-muted-foreground">
                        <p>
                            Your report will be visible to other users for the next 2 hours. Reports help the community
                            make informed decisions during emergencies.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedType} className="flex-1">
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
