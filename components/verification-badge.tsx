"use client"

import { formatTimeAgo, getVerificationStatus } from "@/lib/utils/emergency"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"

interface VerificationBadgeProps {
    lastVerified: Date | string
    className?: string
}

export function VerificationBadge({ lastVerified, className = "" }: VerificationBadgeProps) {
    // Convert string to Date if needed (from backend API)
    const dateObj = typeof lastVerified === 'string' ? new Date(lastVerified) : lastVerified

    const verification = getVerificationStatus(dateObj)
    const timeAgo = formatTimeAgo(dateObj)

    const colorClasses = {
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        red: "bg-red-50 text-red-700 border-red-200",
    }

    const IconComponent = {
        green: CheckCircle2,
        yellow: Clock,
        red: AlertTriangle,
    }[verification.color]

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[verification.color as keyof typeof colorClasses]} ${className}`}
            title={`Last verified: ${dateObj.toLocaleString()}`}
        >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{verification.label}</span>
            <span className="opacity-75">• {timeAgo}</span>
        </div>
    )
}
