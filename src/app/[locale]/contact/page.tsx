"use client"

import { useTranslations } from "next-intl"
import React, { useState } from "react"
import { Send, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

export default function ContactPage() {
  const t = useTranslations("Contact")
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

  const OFFICE_COORDS = { lat: 35.0116, lng: 135.7681 } // Kyoto City Central
  const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-12 rounded-[2.5rem] shadow-2xl text-center border-2 border-accent/20 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-accent animate-bounce" />
          </div>
          <h2 className="text-3xl font-playfair font-black text-primary mb-4">{t("success.title")}</h2>
          <p className="text-primary/70 mb-8 leading-relaxed">
            {t("success.message")}
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-primary text-white rounded-full h-12 font-bold uppercase tracking-widest"
          >
            {t("success.button")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <section className="bg-primary pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-playfair font-black text-secondary mb-4 italic">{t("title")}</h1>
            <p className="text-white/60 font-sans uppercase tracking-[0.3em] text-xs">{t("subtitle")}</p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-secondary/10 flex items-start gap-6 group hover:border-secondary transition-all">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="font-bold text-primary mb-1">{t("info.email.title")}</h3>
                   <p className="text-primary/60 text-sm mb-2 font-mono">support@azen.travel</p>
                   <p className="text-xs text-accent font-bold">{t("info.email.reply")}</p>
                </div>
            </div>

            <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-secondary/10 flex items-start gap-6 group hover:border-secondary transition-all">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="font-bold text-primary mb-1">{t("info.address.title")}</h3>
                   <p className="text-primary/60 text-sm mb-1">{t("info.address.city")}</p>
                   <p className="text-xs text-primary/40 uppercase tracking-widest">{t("info.address.country")}</p>
                </div>
            </div>

            {/* Stylized Map View */}
            <div className="h-[350px] rounded-[2rem] overflow-hidden shadow-2xl border border-secondary/10 relative group bg-muted">
                <Map
                  initialViewState={{
                    latitude: OFFICE_COORDS.lat,
                    longitude: OFFICE_COORDS.lng,
                    zoom: 14
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle={OPEN_FREE_MAP_STYLE}
                >
                  <NavigationControl position="top-right" />
                  <Marker latitude={OFFICE_COORDS.lat} longitude={OFFICE_COORDS.lng}>
                    <div className="p-2 bg-accent rounded-full border-4 border-white shadow-lg animate-pulse">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </Marker>
                </Map>
                <div className="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl z-10 border border-primary/10">
                    {t("info.map")} <span className="text-secondary ml-2 font-mono">Kyoto</span>
                </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-secondary/10">
             <h2 className="text-3xl font-playfair font-black text-primary mb-8">{t("form.title")}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-primary/40 ml-1">{t("form.name")}</label>
                      <Input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe" 
                        className="rounded-2xl border-secondary/20 h-14 px-6 focus:ring-accent"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-primary/40 ml-1">{t("form.email")}</label>
                      <Input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com" 
                        className="rounded-2xl border-secondary/20 h-14 px-6 focus:ring-accent"
                      />
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary/40 ml-1">{t("form.message")}</label>
                  <Textarea 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder={t("form.messagePlaceholder")} 
                    className="rounded-[2rem] border-secondary/20 min-h-[180px] p-6 focus:ring-accent resize-none"
                  />
                </div>

                <div className="p-4 bg-muted rounded-2xl flex items-center gap-4 text-xs text-primary/60 border-2 border-dashed border-secondary/20">
                   <div className="h-6 w-12 bg-white rounded border border-secondary/20 flex items-center justify-center opacity-50 font-mono">
                      CAPTCHA
                   </div>
                   <span>{t("form.captcha")}</span>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white rounded-full h-16 font-black uppercase tracking-[0.2em] transform transition active:scale-95 shadow-xl shadow-accent/20 flex gap-3"
                >
                   <Send className="h-5 w-5" /> {t("form.submit")}
                </Button>
             </form>
          </div>

        </div>
      </div>
    </div>
  )
}
