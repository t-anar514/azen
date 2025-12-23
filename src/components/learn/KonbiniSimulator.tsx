"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, User, Store } from "lucide-react"
import { useTranslations } from "next-intl"

type Message = {
  id: string
  role: 'clerk' | 'user'
  text: string
  translation?: string
}

export function KonbiniSimulator() {
  const t = useTranslations("Learn.simulator")
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
        translation: t('conversations.welcome') 
      }
    ])
    setStep(1)
  }

  const handleUserAction = (action: string, responseJapanese: string, responseTranslationKey: string) => {
    // User response
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: responseJapanese,
      translation: t(`conversations.${responseTranslationKey}`)
    }
    setMessages(prev => [...prev, userMsg])
    
    // Clerk response logic
    setTimeout(() => {
        let clerkMsg: Message | null = null

        if (step === 1) {
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: '袋はいりますか？ (Fukuro wa irimasu ka?)',
                translation: t('conversations.needBag')
            }
            setStep(2)
        } else if (step === 2) {
             clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'ありがとうございます。またお越しください！',
                translation: t('conversations.thankYou')
            }
            setStep(3) // End
        }

        if (clerkMsg) {
             setMessages(prev => [...prev, clerkMsg!])
        }
    }, 800)
  }

  return (
    <div className="py-16 max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1c315e] mb-2">{t("title")}</h2>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="bg-gray-50 h-[400px] overflow-y-auto p-6 space-y-4"
        >
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <Store className="w-16 h-16 text-gray-300 mb-4" />
                    <button 
                        onClick={startSimulation}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#1c315e] transition-colors"
                    >
                        {t("enter")}
                    </button>
                </div>
            )}

            <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`
                            max-w-[80%] rounded-2xl p-4 shadow-sm relative
                            ${msg.role === 'user' ? 'bg-[#227c70] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
                        `}>
                            <div className="flex items-center gap-2 mb-1 opacity-75 text-xs font-bold uppercase tracking-wider">
                                {msg.role === 'clerk' ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {msg.role === 'clerk' ? t('roles.clerk') : t('roles.user')}
                            </div>
                            <p className="text-lg font-bold">{msg.text}</p>
                            {msg.translation && (
                                <p className={`text-sm mt-1 ${msg.role === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                                    {msg.translation}
                                </p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Action Area */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 min-h-[100px] flex items-center justify-center">
             {step === 1 && (
                 <button
                    onClick={() => handleUserAction('nod', '(Silently nods)', 'nod')}
                    className="bg-white border-2 border-[#1c315e] text-[#1c315e] px-6 py-3 rounded-xl font-bold hover:bg-[#1c315e] hover:text-white transition-colors"
                 >
                    {t("actions.nod")}
                 </button>
             )}

             {step === 2 && (
                 <div className="flex gap-4 flex-wrap justify-center">
                     <button
                        onClick={() => handleUserAction('yes', 'はい、お願いします (Hai, onegaishimasu)', 'yes')}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a5f56] transition-colors"
                     >
                        {t("actions.yes")}
                     </button>
                      <button
                        onClick={() => handleUserAction('no', 'いいえ、大丈夫です (Iie, daijoubu desu)', 'no')}
                        className="bg-white border-2 border-red-400 text-red-500 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
                     >
                        {t("actions.no")}
                     </button>
                 </div>
             )}

             {step === 3 && (
                 <div className="text-gray-500 font-medium flex items-center gap-2">
                     <MessageSquare className="w-4 h-4" />
                     {t("missionComplete")}
                 </div>
             )}
             
             {step === 0 && messages.length > 0 && (
                 <p className="text-gray-400 text-sm">{t("waiting")}</p>
             )}
        </div>
      </div>
    </div>
  )
}
