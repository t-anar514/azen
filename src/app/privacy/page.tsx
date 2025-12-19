"use client"

import React, { useState } from "react"
import { Shield, Lock, Eye, Trash2, Cpu, ChevronDown, ChevronUp, MapPin } from "lucide-react"

// Simple Accordion Component for the Layered Privacy Design
function PrivacySection({ title, summary, children, icon: Icon }: { title: string, summary: string, children: React.ReactNode, icon: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-secondary/20 bg-card rounded-[2rem] overflow-hidden transition-all duration-300 mb-6 shadow-sm hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-8 flex items-start gap-6 hover:bg-muted/30 transition-colors"
      >
        <div className={`p-4 rounded-2xl transition-all ${isOpen ? 'bg-primary text-secondary' : 'bg-secondary/10 text-secondary'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
           <h3 className="text-xl font-bold text-primary font-playfair mb-1">{title}</h3>
           <p className="text-sm text-primary/60 font-sans leading-relaxed">{summary}</p>
        </div>
        <div className="mt-2 text-primary/30">
          {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
          <div className="h-px bg-secondary/10 w-full mb-6" />
          <div className="prose prose-slate max-w-none text-primary/80 text-sm leading-relaxed space-y-4 font-sans">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full pb-32">
      {/* Header */}
      <section className="bg-background pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-black text-primary mb-6">Security & Transparency</h1>
            <p className="text-secondary font-bold tracking-[0.2em] text-xs uppercase mb-12">How Azen protects your journey</p>
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-primary text-white rounded-full text-sm font-bold shadow-2xl">
              <Shield className="h-5 w-5 text-secondary" />
              <span>We never sell your personal data. Period.</span>
            </div>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4">
        
        <PrivacySection 
            title="Data Collection & Usage" 
            summary="Understanding what we collect and why we need it for your Japan trip." 
            icon={Eye}
        >
            <p>To provide a seamless travel experience, we collect specific information including:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Identity Information:</strong> We store your name and email address when you create an itinerary or contact us.</li>
                <li><strong>Identification (Optional):</strong> For specific guide bookings or transport services, we may require passport details as mandated by Japanese law for short-term visitors.</li>
                <li><strong>Travel Preferences:</strong> Interests, dietary restrictions, and physical accessibility needs to tailor your recommendations.</li>
            </ul>
            <p>This data is used exclusively to optimize your itinerary and facilitate bookings with local partners.</p>
        </PrivacySection>

        <PrivacySection 
            title="Third-Party Sharing" 
            summary="How we communicate with local guides and service providers." 
            icon={MapPin}
        >
            <p>Azen acts as a bridge. To fulfill your requests, we share limited data with:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Local Guides:</strong> Verified guides receive your name, travel dates, and preferred activities to prepare for your experience.</li>
                <li><strong>Transport & Essentials:</strong> When you book eSIMs or JR Passes through our partners, necessary shipping and identification data is transmitted securely.</li>
            </ul>
            <p>All partners are bound by confidentiality agreements that align with our strict privacy standards.</p>
        </PrivacySection>

        <PrivacySection 
            title="AI & Data Processing" 
            summary="Transparency regarding our itinerary generation algorithms." 
            icon={Cpu}
        >
            <p>Our platform utilizes localized AI models to generate travel suggestions.</p>
            <p>Your trip preferences are processed by our "Zen Engine" to find the most efficient and culturally authentic routes. This data is anonymized before being used to train our general recommendation systems to protect your individual identity.</p>
        </PrivacySection>

        <PrivacySection 
            title="Your Rights & Data Portability" 
            summary="How you can control, download, or delete your information." 
            icon={Trash2}
        >
            <p>You have full control over your digital footprint on Azen:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Right to Deletion:</strong> You can request immediate deletion of your entire account and all associated itineraries by emailing <strong>privacy@azen.travel</strong> or using the "Clear All Data" button in your dashboard.</li>
                <li><strong>Data Export:</strong> You can download your itineraries in PDF or JSON format at any time.</li>
            </ul>
            <p>We process all deletion requests within 48 hours.</p>
        </PrivacySection>

        <PrivacySection 
            title="Contact Information" 
            summary="Direct access to our privacy officer in Kyoto." 
            icon={Lock}
        >
            <p>If you have questions about our data practices, please reach out to our dedicated privacy concierge:</p>
            <p className="bg-muted p-4 rounded-xl font-mono text-primary/80 border border-secondary/10">
                Azen Security Team<br />
                privacy@azen.travel<br />
                Nakagyo Ward, Kyoto, Japan
            </p>
            <p className="mt-4 text-xs italic">Last updated: December 19, 2025</p>
        </PrivacySection>

      </div>
    </div>
  )
}
