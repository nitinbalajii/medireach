"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTimeAgo } from "@/lib/utils/emergency"
import { AlertCircle, Clock, XCircle, Users, Droplet, UserX, ThumbsUp, CheckCircle2 } from "lucide-react"
import type { CrowdReport } from "@/lib/types"

interface CrowdReportsDisplayProps {
    reports: CrowdReport[]
    className?: string
}

export function CrowdReportsDisplay({ reports, className = "" }: CrowdReportsDisplayProps) {
    if (reports.length === 0) {
        return null
    }

    // Filter out expired reports
    const activeReports = reports.filter((r) => new Date(r.expiresAt) > new Date())

    if (activeReports.length === 0) {
        return null
    }

    const reportIcons = {
        long_queue: Clock,
        emergency_closed: XCircle,
        beds_full: Users,
        oxygen_shortage: Droplet,
        no_doctors: UserX,
        other: AlertCircle,
    }

    const reportColors = {
        long_queue: "text-yellow-600 bg-yellow-50 border-yellow-200",
        emergency_closed: "text-red-600 bg-red-50 border-red-200",
        beds_full: "text-orange-600 bg-orange-50 border-orange-200",
        oxygen_shortage: "text-blue-600 bg-blue-50 border-blue-200",
        no_doctors: "text-purple-600 bg-purple-50 border-purple-200",
        other: "text-gray-600 bg-gray-50 border-gray-200",
    }

    const reportLabels = {
        long_queue: "Long Queue",
        emergency_closed: "Emergency Closed",
        beds_full: "Beds Full",
        oxygen_shortage: "Oxygen Shortage",
        no_doctors: "No Doctors",
        other: "Other Issue",
    }

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-sm">Recent User Reports</h4>
                <Badge variant="secondary" className="text-xs">
                    {activeReports.length}
                </Badge>
            </div>

            <div className="space-y-2">
                {activeReports.map((report) => {
                    const Icon = reportIcons[report.reportType] || AlertCircle
                    const colorClass = reportColors[report.reportType] || reportColors.other
                    const label = reportLabels[report.reportType] || "Other"

                    return (
                        <Card key={report.id} className={`p-3 border ${colorClass}`}>
                            <div className="flex items-start gap-3">
                                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{label}</span>
                                        {report.verified && (
                                            <Badge variant="secondary" className="text-xs gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    {report.description && (
                                        <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{formatTimeAgo(report.timestamp)}</span>
                                        {(report.upvotes > 0 || report.downvotes > 0) && (
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                {report.upvotes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
                Reports are crowdsourced and expire after 2 hours. Always verify with the hospital directly.
            </p>
        </div>
    )
}
