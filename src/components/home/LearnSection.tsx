"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, User, Store, ArrowRight, Languages, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: 'clerk' | 'user'
  text: string
  translation?: string
}

export function LearnSection() {
  const t = useTranslations("Learn")
  const tSim = useTranslations("Learn.simulator")
  
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const startSimulation = () => {
    setMessages([
      { 
        id: '1', 
        role: 'clerk', 
        text: 'いらっしゃいませ！ (Irasshaimase!)', 
        translation: tSim('conversations.welcome') 
      }
    ])
    setStep(1)
  }

  const handleUserAction = (action: string, responseJapanese: string, responseTranslationKey: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: responseJapanese,
      translation: tSim(`conversations.${responseTranslationKey}`)
    }
    setMessages(prev => [...prev, userMsg])
    
    setTimeout(() => {
        let clerkMsg: Message | null = null

        if (step === 1) {
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'ポイントカードはお持ちですか? (Pointo ka-do wa omochi desuka?)',
                translation: tSim('conversations.pointCard')
            }
            setStep(2)
        } else if (step === 2) {
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: '袋はいりますか？ (Fukuro wa irimasu ka?)',
                translation: tSim('conversations.needBag')
            }
            setStep(4)
        } else if (step === 4) {
             clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'ありがとうございます！',
                translation: tSim('conversations.thankYou')
            }
            setStep(7)
        }

        if (clerkMsg) {
             setMessages(prev => [...prev, clerkMsg!])
        }
    }, 800)
  }

  return (
    <section className="py-24 bg-[#f9f8f0] overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#227c70]/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1c315e]/5 rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content: Intro & Collections */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <Badge className="bg-[#227c70] text-white hover:bg-[#227c70] px-4 py-1.5 rounded-full flex items-center gap-2 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("hero.subtitle")}</span>
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1c315e] font-serif">
                {t("hero.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                {t("description")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {['daily', 'survival', 'golden', 'vibes'].map((id) => (
                <Link key={id} href="/learn" className="group">
                  <Card className="p-5 border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-[#227c70] group-hover:text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-[#227c70]/10 text-[#227c70] group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Languages className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{t(`phrasebook.collections.${id}.title`)}</h3>
                    <p className="text-sm text-gray-500 group-hover:text-white/80 line-clamp-1">
                      {t(`phrasebook.collections.${id}.description`)}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full bg-[#1c315e] hover:bg-[#1c315e]/90 h-14 px-8 text-lg font-bold shadow-xl shadow-[#1c315e]/20">
                <Link href="/learn">
                  Суралцаж эхлэх <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content: Interactive Simulator */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#227c70]/20 to-transparent blur-3xl -z-10 scale-150 rotate-12" />
            
            <Card className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col h-[550px] relative">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#227c70] flex items-center justify-center text-white font-bold">
                    AZ
                  </div>
                  <div>
                    <div className="font-bold text-[#1c315e] leading-tight">{tSim("title")}</div>
                    <div className="text-[10px] text-[#227c70] font-black uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#227c70] animate-pulse" />
                      LIVE PRACTICE
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-[#227c70]/10 rounded-full flex items-center justify-center mb-6">
                      <Store className="w-10 h-10 text-[#227c70]" />
                    </div>
                    <h3 className="font-bold text-[#1c315e] mb-2">{tSim("subtitle")}</h3>
                    <p className="text-gray-500 text-sm mb-6">{tSim("enter")}</p>
                    <Button 
                      onClick={startSimulation}
                      className="bg-[#227c70] text-white hover:bg-[#1c315e] rounded-full px-8 py-6 h-auto font-bold text-lg shadow-lg"
                    >
                      {tSim("enter")}
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl shadow-sm",
                          msg.role === 'user' 
                            ? "bg-[#227c70] text-white rounded-tr-none" 
                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                        )}>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-1">
                            {msg.role === 'clerk' ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {msg.role === 'clerk' ? tSim('roles.clerk') : tSim('roles.user')}
                          </div>
                          <p className="font-bold text-sm md:text-base leading-snug">{msg.text}</p>
                          {msg.translation && (
                            <div className={cn(
                              "text-xs mt-1.5 pt-1.5 border-t",
                              msg.role === 'user' ? "text-white/70 border-white/20" : "text-gray-400 border-gray-100"
                            )}>
                              {msg.translation}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Action Area */}
              <div className="p-4 bg-white/80 border-t border-gray-100 min-h-[100px] flex items-center justify-center">
                <div className="flex gap-2 flex-wrap justify-center">
                  {step === 1 && (
                    <Button
                      onClick={() => handleUserAction('nod', '(Silently nods)', 'nod')}
                      className="bg-[#1c315e] text-white rounded-full hover:bg-[#1c315e]/90 font-bold px-6"
                    >
                      {tSim("actions.nod")}
                    </Button>
                  )}

                  {step === 2 && (
                    <>
                      <Button
                        onClick={() => handleUserAction('no', 'ありません (Arimasen)', 'noPointCard')}
                        variant="ghost"
                        className="rounded-full text-gray-500 font-bold px-6"
                      >
                        {tSim("actions.pointCardNo")}
                      </Button>
                      <Button
                        onClick={() => handleUserAction('yes', 'はい、あります (Hai, arimasu)', 'yes')}
                        className="bg-[#227c70] text-white rounded-full hover:bg-[#227c70]/90 font-bold px-6"
                      >
                        {tSim("actions.pointCardYes")}
                      </Button>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <Button
                        onClick={() => handleUserAction('no', 'いいえ、大丈夫です (Iie, daijoubu desu)', 'no')}
                        variant="ghost"
                        className="rounded-full text-gray-500 font-bold px-6"
                      >
                        {tSim("actions.bagNo")}
                      </Button>
                      <Button
                        onClick={() => handleUserAction('yes', 'はい、お願いします (Hai, onegaishimasu)', 'bagYes')}
                        className="bg-[#227c70] text-white rounded-full hover:bg-[#227c70]/90 font-bold px-6"
                      >
                        {tSim("actions.bagYes")}
                      </Button>
                    </>
                  )}

                  {step === 7 && (
                    <div className="w-full flex flex-col items-center gap-2">
                       <div className="text-[#227c70] font-black text-xs uppercase tracking-[0.2em] animate-bounce">
                          MISSION COMPLETE!
                       </div>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => { setMessages([]); setStep(0); }}
                         className="text-gray-400 hover:text-[#1c315e]"
                       >
                         RETRY
                       </Button>
                    </div>
                  )}
                  
                  {step === 0 && messages.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>

              {/* Float Card Info */}
              {messages.length > 0 && messages.slice(-1)[0].role === 'clerk' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-[#1c315e] text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-2xl flex items-center gap-2 whitespace-nowrap z-20 pointer-events-none"
                 >
                   <MessageSquare className="w-3 h-3 text-[#227c70]" />
                   SAY SOMETHING IN RESPONSE!
                 </motion.div>
              )}
            </Card>
          </div>

        </div>
      </div>
    </section>
  )
}
