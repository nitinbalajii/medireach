"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  Users,
  Target,
  Zap,
  Globe,
  Award,
  Ambulance,
  Lightbulb,
  ShieldAlert,
  Code,
  Database,
  Cpu,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function AboutPage() {
  const provisions = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Location-based Discovery",
      description: "Instantly find hospitals and trauma centers nearest to your current location.",
    },
    {
      icon: <Award className="w-8 h-8 text-accent" />,
      title: "Verified Listings",
      description: "Structured hospital and specialty information sourced from official healthcare platforms.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Doctor Directory",
      description: "Comprehensive information on specialists available across city hospitals.",
    },
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: "One-tap SOS",
      description: "Direct emergency triggering system that connects you to immediate aid.",
    },
    {
      icon: <Ambulance className="w-8 h-8 text-primary" />,
      title: "Ambulance Interface",
      description: "Simplified request system for coordinated emergency transport services.",
    },
    {
      icon: <Cpu className="w-8 h-8 text-accent" />,
      title: "Scalable Infrastructure",
      description: "Built on a robust backend designed for real-time healthcare integration.",
    },
  ]

  const technicalStack = [
    { icon: <Globe className="w-5 h-5" />, label: "Secure Backend APIs" },
    { icon: <Cpu className="w-5 h-5" />, label: "Cloud Infrastructure" },
    { icon: <Database className="w-5 h-5" />, label: "Structured Data Modeling" },
    { icon: <Target className="w-5 h-5" />, label: "Geolocation Services" },
    { icon: <Code className="w-5 h-5" />, label: "RESTful Communication" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-6 border border-primary/30">
            <Ambulance size={14} />
            About MediReach
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Bridging Technology and <span className="text-primary italic font-serif text-3xl block md:inline">Emergency Healthcare</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
            MediReach is a city-focused emergency healthcare platform designed to make critical medical support faster, smarter, and more accessible.
          </p>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Solving the Gap</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  In emergency situations, people often struggle to quickly locate nearby hospitals, identify available specialists, or coordinate ambulance services.
                </p>
                <p className="font-semibold text-slate-800">
                  MediReach was built to solve that gap using technology.
                </p>
                <p>
                  The platform centralizes verified hospital information, specialty listings, emergency contact access, and SOS functionality into a single, unified system designed for real-world usability.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Lightbulb size={120} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">🎯 Our Mission</h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-6 italic">
                "To reduce confusion and response time during medical emergencies by building a reliable digital bridge between individuals and healthcare services."
              </p>
              <p className="text-slate-600">
                By integrating maps, structured hospital data, and emergency-trigger systems, MediReach aims to create a streamlined emergency response experience at a city level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">💡 What MediReach Provides</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              More than a hospital directory—a full-stack healthcare support system.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {provisions.map((item, index) => (
              <Card key={index} className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 p-2 bg-slate-50 inline-block rounded-xl">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real World Architecture */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-primary/20">
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <Cpu size={300} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Code />
                Built With Real-World Architecture
              </h2>
              <p className="text-lg text-white/90 mb-10 max-w-2xl">
                MediReach is built using modern full-stack development practices to simulate real-world healthcare coordination challenges.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {technicalStack.map((tech, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                    {tech.icon}
                    <span className="font-medium text-sm">{tech.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">👨‍💻 About the Team</h2>
            <p className="text-muted-foreground text-lg">The developers behind the MediReach vision.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Nitin */}
            <Card className="p-10 border-slate-200 overflow-hidden relative">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                  NB
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Nitin Balajee</h3>
                  <p className="text-primary font-semibold text-sm">Full-Stack Developer | CSE</p>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Project Lead</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                MediReach was conceptualized and developed as a comprehensive final-year engineering project focused on combining technical depth with real-world social impact.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Backend Arch", "API Design", "Cloud Deploy", "Mobile Sync"].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-500 uppercase">{tag}</span>
                ))}
              </div>
            </Card>

            {/* Talha */}
            <Card className="p-10 border-slate-200">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                  TS
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Talha Siddiqui</h3>
                  <p className="text-slate-700 font-semibold text-sm">Full-Stack Developer | CSE</p>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">UI & Data Specialist</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-800 underline decoration-primary underline-offset-4">Key Contributions:</p>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    UI layout & visual consistency
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Frontend component styling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Hospital data compilation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Functional testing & feedback
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision & Disclaimer */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Globe className="text-primary" />
              🌍 Vision
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The long-term vision of MediReach is to evolve into a scalable emergency healthcare coordination platform capable of supporting city-wide response systems and community-driven healthcare accessibility.
            </p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
            <ShieldAlert className="text-red-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">⚠ Disclaimer</h4>
              <p className="text-sm text-red-700 leading-relaxed">
                MediReach aggregates publicly available hospital and doctor information and is continuously evolving. While the platform assists users in locating emergency services, it does not replace official emergency systems. In life-threatening situations, users are advised to contact official emergency services directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold tracking-tight">MediReach</span>
          </div>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Emergency health resources at your fingertips. Reducing response time, saving lives.
          </p>
          <div className="flex justify-center gap-8 mb-12">
            <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-slate-500 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors">Support</Link>
          </div>
          <div className="text-slate-600 text-xs tracking-widest uppercase">
            &copy; 2026 MediReach Delhi. Final Year Engineering Project.
          </div>
        </div>
      </footer>
    </div>
  )
}
