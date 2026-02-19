"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Mail, Phone, MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "general",
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
    setSubmitted(true)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "", type: "general" })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const contactMethods = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone",
      description: "Call us during business hours",
      value: "+91-11-XXXX-XXXX",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email",
      description: "Send us a detailed message",
      value: "contact@medireach.delhi",
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Office",
      description: "Visit us in person",
      value: "New Delhi, Delhi, India",
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Hours",
      description: "Our operating hours",
      value: "24/7 Emergency Support",
      color: "bg-orange-50 border-orange-200",
    },
  ]

  const faqs = [
    {
      question: "How do I find a hospital near me?",
      answer:
        "Visit our Hospital Finder page and search by location or hospital name. You'll see real-time bed availability, oxygen levels, and specialists.",
    },
    {
      question: "How can I request an ambulance?",
      answer:
        "Go to Request Ambulance page and fill in your emergency details. We'll dispatch the nearest available ambulance and track it in real-time.",
    },
    {
      question: "How do I donate blood?",
      answer:
        "Register as a blood donor through our Blood Donor Network. You can then accept donation requests when blood is needed in your area.",
    },
    {
      question: "Is my personal data secure?",
      answer:
        "Yes, we use industry-standard encryption and follow all healthcare data protection regulations to ensure your privacy and security.",
    },
    {
      question: "What is the coverage area?",
      answer:
        "Currently, we serve the Delhi NCR region with coverage of all major hospitals, ambulance services, and blood donation networks.",
    },
    {
      question: "How can I become a hospital partner?",
      answer:
        "Email us at hospital@medireach.delhi or call our business development team to discuss integration and partnership opportunities.",
    },
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have questions or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Methods</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className={`p-6 ${method.color}`}>
                <div className="text-primary mb-4">{method.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <p className="font-medium text-foreground">{method.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
            <p className="text-muted-foreground mb-8">Fill out the form below and we'll get back to you soon.</p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Thank you for your message!</p>
                  <p className="text-sm text-green-800">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+91-9XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Inquiry Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  placeholder="Message subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-4xl mx-auto flex items-start gap-4 p-6 bg-red-100 border border-red-300 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">For Emergencies</h3>
            <p className="text-red-800">
              For life-threatening emergencies, please call <strong>102</strong> or <strong>108</strong> directly. Do
              not wait for email responses.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
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
          <p className="text-white/60">&copy; 2025 MediReach Delhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
