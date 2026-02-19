"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Ambulance, Droplet, Search, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { hospitals, bloodDonors } from "@/lib/delhi-data"
import { Navbar } from "@/components/navbar"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("hospitals")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const data = searchType === "hospitals" ? hospitals : bloodDonors
    const filtered = data.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    setSearchResults(filtered)
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Saving Lives Digitally — Healthcare Access for Every Delhiite
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Connect instantly with verified hospitals, ambulances, and blood donors across Delhi. Get real-time
                availability and emergency support when you need it most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/find-hospital">Find Nearby Hospital</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/request-ambulance">Need an Ambulance</Link>
                </Button>
              </div>
              <div className="mt-8 flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Emergency: 102 / 108</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{hospitals.length} Hospitals Online</p>
                      <p className="text-sm text-white/80">Real-time availability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">12 Ambulances Available</p>
                      <p className="text-sm text-white/80">Average response: 5 mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{bloodDonors.length} Verified Donors</p>
                      <p className="text-sm text-white/80">All blood types available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What do you need?</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${searchType}...`}
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value)
                  setSearchQuery("")
                  setShowResults(false)
                }}
                className="h-12 px-3 border border-border rounded-md bg-background"
              >
                <option value="hospitals">Hospitals</option>
                <option value="donors">Blood Donors</option>
              </select>
            </div>

            {showResults && searchResults.length > 0 && (
              <Card className="p-4">
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-3 hover:bg-muted rounded-lg cursor-pointer transition">
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.area || result.address}
                        {result.beds && ` • ${result.beds} beds available`}
                        {result.blood && ` • Blood Type: ${result.blood}`}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {showResults && searchResults.length === 0 && searchQuery && (
              <Card className="p-4 text-center text-muted-foreground">No results found for "{searchQuery}"</Card>
            )}

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button className="flex-1" asChild>
                <Link href="/find-hospital">Find Hospital</Link>
              </Button>
              <Button className="flex-1 bg-transparent" variant="outline" asChild>
                <Link href="/request-ambulance">Request Ambulance</Link>
              </Button>
              <Button className="flex-1 bg-transparent" variant="outline" asChild>
                <Link href="/donors">Find Donor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hospital Finder</h3>
              <p className="text-muted-foreground">
                Locate nearby hospitals with real-time bed availability, oxygen levels, and specialist doctors available
                in Delhi.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Ambulance className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ambulance Service</h3>
              <p className="text-muted-foreground">
                Request an ambulance instantly with GPS tracking and real-time updates on arrival time across Delhi.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Droplet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blood Donor Network</h3>
              <p className="text-muted-foreground">
                Connect with verified blood donors filtered by blood type, location, and availability in your area.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">15,284+</p>
              <p className="text-white/80">Lives Helped</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">98%</p>
              <p className="text-white/80">Response Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">5 min</p>
              <p className="text-white/80">Avg Response Time</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-white/80">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Help Save Lives?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of healthcare providers, donors, and citizens making a difference in Delhi's emergency
            response system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register-donor">Become a Donor</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/hospital-login">Hospital Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6" fill="currentColor" />
                <span className="font-bold">MediReach Delhi</span>
              </div>
              <p className="text-white/60">Emergency health resources at your fingertips for Delhi.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-white/60">
                <li>
                  <Link href="/find-hospital" className="hover:text-white transition">
                    Hospital Finder
                  </Link>
                </li>
                <li>
                  <Link href="/request-ambulance" className="hover:text-white transition">
                    Ambulance Request
                  </Link>
                </li>
                <li>
                  <Link href="/donors" className="hover:text-white transition">
                    Blood Donors
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/60">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <p className="text-white/60 mb-2">Call: 102 / 108</p>
              <p className="text-white/60">Available 24/7</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>&copy; 2025 MediReach Delhi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
