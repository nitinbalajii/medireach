"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api/client"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "patient" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await authAPI.register(formData)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          <span className="text-2xl font-bold text-primary">MediReach</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-muted-foreground mb-8">Join our emergency response network</p>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="patient">Patient</option>
              <option value="donor">Blood Donor</option>
              <option value="hospital_staff">Hospital Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
