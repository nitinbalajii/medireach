"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Users, Target, Zap, Globe, Award } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Rajesh Singh",
      role: "Founder & CEO",
      bio: "Healthcare technology innovator with 15+ years in emergency medical services",
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      bio: "Led emergency response systems for Delhi hospitals for 10 years",
    },
    {
      name: "Amit Kumar",
      role: "Chief Technology Officer",
      bio: "Building scalable health tech platforms that save lives",
    },
    {
      name: "Dr. Neha Gupta",
      role: "Medical Director",
      bio: "AIIMS Delhi specialist ensuring clinical excellence in our platform",
    },
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Life-Saving Impact",
      description: "Every decision is driven by our mission to save lives and reduce emergency response times.",
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Community First",
      description: "We believe in empowering communities to care for their own during medical emergencies.",
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Transparency",
      description: "Real-time data ensures hospitals, donors, and patients have complete information.",
    },
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: "Speed & Reliability",
      description: "Our technology ensures fastest response times for critical medical emergencies.",
    },
  ]

  const achievements = [
    { number: "15,284+", label: "Lives Helped" },
    { number: "98%", label: "Response Rate" },
    { number: "5 min", label: "Avg Response Time" },
    { number: "50+", label: "Hospitals Partnered" },
    { number: "10,000+", label: "Verified Donors" },
    { number: "24/7", label: "Support Available" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="text-2xl font-bold text-primary">MediReach</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About MediReach Delhi</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revolutionizing emergency healthcare access in Delhi through technology, transparency, and community
            collaboration
          </p>
          <div className="w-12 h-1 bg-primary mx-auto" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To provide instant access to emergency healthcare resources for every resident of Delhi by connecting
                hospitals, ambulances, blood donors, and patients through a seamless digital platform.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that no life should be lost due to lack of information or delayed access to critical
                resources.
              </p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-8 flex items-center justify-center min-h-80">
              <div className="text-center">
                <Globe className="w-24 h-24 text-primary mx-auto mb-4" />
                <p className="font-semibold text-foreground">Connected Healthcare Ecosystem</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-accent/10 rounded-2xl p-8 flex items-center justify-center min-h-80 order-last md:order-first">
              <div className="text-center">
                <Award className="w-24 h-24 text-accent mx-auto mb-4" />
                <p className="font-semibold text-foreground">Excellence & Innovation</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-lg text-muted-foreground mb-6">
                A future where every medical emergency in Delhi is met with instant response, complete transparency, and
                coordinated care across all healthcare providers.
              </p>
              <p className="text-lg text-muted-foreground">
                We envision a healthcare system where technology empowers patients, healthcare workers, and donors to
                save lives together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Impact</h2>
          <div className="grid md:grid-cols-6 gap-8 text-center">
            {achievements.map((achievement, index) => (
              <div key={index}>
                <p className="text-4xl font-bold mb-2">{achievement.number}</p>
                <p className="text-white/80">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {member.name.split(" ")[0][0]}
                  {member.name.split(" ")[1][0]}
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're a healthcare provider, blood donor, or community member, we need your support to build a
            better emergency healthcare system for Delhi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Get In Touch</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register-donor">Become a Donor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6" fill="currentColor" />
            <span className="font-bold">MediReach Delhi</span>
          </div>
          <p className="text-white/60 mb-4">Emergency health resources at your fingertips for Delhi.</p>
          <p className="text-white/60 text-sm">&copy; 2025 MediReach Delhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
