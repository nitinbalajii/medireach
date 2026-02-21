"use client"

import { useState } from "react"
import { Heart, Menu, X, ChevronDown, Pill, Stethoscope } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [servicesOpen, setServicesOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Heart className="w-8 h-8 text-primary" fill="currentColor" />
                        <span className="text-xl font-bold text-primary">MediReach Delhi</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8 items-center">
                        <Link href="/" className="text-foreground hover:text-primary transition font-medium">
                            Home
                        </Link>
                        <Link href="/find-hospital" className="text-foreground hover:text-primary transition">
                            Hospitals
                        </Link>
                        <Link href="/request-ambulance" className="text-foreground hover:text-primary transition">
                            Ambulance
                        </Link>
                        <Link href="/about" className="text-foreground hover:text-primary transition">
                            About
                        </Link>

                        {/* Services Dropdown */}
                        <div
                            className="relative py-2"
                            onMouseEnter={() => setServicesOpen(true)}
                            onMouseLeave={() => setServicesOpen(false)}
                        >
                            <button className="text-foreground hover:text-primary transition flex items-center gap-1">
                                Services
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {servicesOpen && (
                                <div className="absolute top-full left-0 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                                    <Link
                                        href="/find-medicine"
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        <Pill className="w-4 h-4" />
                                        Find Medicine
                                    </Link>
                                    <Link
                                        href="/find-doctor"
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        <Stethoscope className="w-4 h-4" />
                                        Find Doctors
                                    </Link>
                                    <Link
                                        href="/donors"
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Blood Donors
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link href="/profile" className="text-foreground hover:text-primary transition">
                            Profile
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Register as Donor</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link href="/" className="block py-2 text-foreground hover:text-primary">
                            Home
                        </Link>
                        <Link href="/find-hospital" className="block py-2 text-foreground hover:text-primary">
                            Hospitals
                        </Link>
                        <Link href="/request-ambulance" className="block py-2 text-foreground hover:text-primary">
                            Ambulance
                        </Link>
                        <Link href="/about" className="block py-2 text-foreground hover:text-primary">
                            About
                        </Link>
                        <Link href="/find-medicine" className="block py-2 text-foreground hover:text-primary">
                            Find Medicine
                        </Link>
                        <Link href="/find-doctor" className="block py-2 text-foreground hover:text-primary">
                            Find Doctors
                        </Link>
                        <Link href="/donors" className="block py-2 text-foreground hover:text-primary">
                            Blood Donors
                        </Link>
                        <Link href="/profile" className="block py-2 text-foreground hover:text-primary">
                            My Profile
                        </Link>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1 bg-transparent" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button className="flex-1" asChild>
                                <Link href="/signup">Register</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
