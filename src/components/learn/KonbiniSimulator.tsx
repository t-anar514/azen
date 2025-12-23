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

        if (step === 1) { // After Welcome (User Nods)
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'ポイントカードはお持ちですか? (Pointo ka-do wa omochi desuka?)',
                translation: t('conversations.pointCard')
            }
            setStep(2)
        } else if (step === 2) { // After Point Card
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'お温めしますか？ (O-atatame shimasu ka?)',
                translation: t('conversations.warmUp')
            }
            setStep(3)
        } else if (step === 3) { // After Warm Up
             clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: '袋はいりますか？ (Fukuro wa irimasu ka?)',
                translation: t('conversations.needBag')
            }
            setStep(4)
        } else if (step === 4) { // After Bag Question
            if (action === 'yes') {
                clerkMsg = {
                    id: Date.now().toString() + 'c',
                    role: 'clerk',
                    text: '袋はお分けしますか? (Fukuro wo owake shimasu ka?)',
                    translation: t('conversations.separateBag')
                }
                setStep(5)
            } else {
                clerkMsg = {
                    id: Date.now().toString() + 'c',
                    role: 'clerk',
                    text: '他に何かお付けしますか？ (Hoka ni nanika otsuke shimasu ka?)',
                    translation: t('conversations.anythingElse')
                }
                setStep(6)
            }
        } else if (step === 5) { // After Separate Bag
            clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: '他に何かお付けしますか？ (Hoka ni nanika otsuke shimasu ka?)',
                translation: t('conversations.anythingElse')
            }
            setStep(6)
        } else if (step === 6) { // After Utensils/Anything else
             clerkMsg = {
                id: Date.now().toString() + 'c',
                role: 'clerk',
                text: 'ありがとうございます。またお越しください！',
                translation: t('conversations.thankYou')
            }
            setStep(7) // End
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
        <div className="p-4 bg-gray-100 border-t border-gray-200 min-h-[120px] flex items-center justify-center">
             <div className="flex gap-3 flex-wrap justify-center">
             {step === 1 && (
                 <button
                    onClick={() => handleUserAction('nod', '(Silently nods)', 'nod')}
                    className="bg-white border-2 border-[#1c315e] text-[#1c315e] px-6 py-3 rounded-xl font-bold hover:bg-[#1c315e] hover:text-white transition-colors"
                 >
                    {t("actions.nod")}
                 </button>
             )}

             {step === 2 && (
                 <>
                    <button
                        onClick={() => handleUserAction('no', 'ありません (Arimasen)', 'noPointCard')}
                        className="bg-white border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        {t("actions.pointCardNo")}
                    </button>
                    <button
                        onClick={() => handleUserAction('yes', 'はい、あります (Hai, arimasu)', 'yes')}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a5f56] transition-colors"
                    >
                        {t("actions.pointCardYes")}
                    </button>
                 </>
             )}

             {step === 3 && (
                 <>
                    <button
                        onClick={() => handleUserAction('no', '大丈夫です (Daijoubu desu)', 'warmNo')}
                        className="bg-white border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        {t("actions.warmNo")}
                    </button>
                    <button
                        onClick={() => handleUserAction('yes', 'はい、お願いします (Hai, onegaishimasu)', 'warmYes')}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a5f56] transition-colors"
                    >
                        {t("actions.warmYes")}
                    </button>
                 </>
             )}

             {step === 4 && (
                 <>
                     <button
                        onClick={() => handleUserAction('no', 'いいえ、大丈夫です (Iie, daijoubu desu)', 'no')}
                        className="bg-white border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                     >
                        {t("actions.bagNo")}
                     </button>
                     <button
                        onClick={() => handleUserAction('yes', 'はい、お願いします (Hai, onegaishimasu)', 'bagYes')}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a5f56] transition-colors"
                     >
                        {t("actions.bagYes")}
                     </button>
                 </>
             )}

             {step === 5 && (
                 <>
                    <button
                        onClick={() => handleUserAction('no', '一緒で大丈夫です (Issho de daijoubu desu)', 'bagSeparateNo')}
                        className="bg-white border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        {t("actions.separateNo")}
                    </button>
                    <button
                        onClick={() => handleUserAction('yes', 'はい、お願いします (Hai, onegaishimasu)', 'bagSeparateYes')}
                        className="bg-[#227c70] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a5f56] transition-colors"
                    >
                        {t("actions.separateYes")}
                    </button>
                 </>
             )}

             {step === 6 && (
                 <>
                    <button
                        onClick={() => handleUserAction('chopsticks', 'お箸をお願いします (Ohashi wo onegaishimasu)', 'chopsticks')}
                        className="bg-white border-2 border-[#88a47c] text-[#1c315e] px-4 py-3 rounded-xl font-bold hover:bg-[#fcfaf2] transition-colors text-sm"
                    >
                        {t("actions.chopsticks")}
                    </button>
                    <button
                        onClick={() => handleUserAction('spoon', 'スプーンをお願いします (Supu-n wo onegaishimasu)', 'spoon')}
                        className="bg-white border-2 border-[#88a47c] text-[#1c315e] px-4 py-3 rounded-xl font-bold hover:bg-[#fcfaf2] transition-colors text-sm"
                    >
                        {t("actions.spoon")}
                    </button>
                    <button
                        onClick={() => handleUserAction('fork', 'フォークをお願いします (Fo-ku wo onegaishimasu)', 'fork')}
                        className="bg-white border-2 border-[#88a47c] text-[#1c315e] px-4 py-3 rounded-xl font-bold hover:bg-[#fcfaf2] transition-colors text-sm"
                    >
                        {t("actions.fork")}
                    </button>
                    <button
                        onClick={() => handleUserAction('none', '大丈夫です (Daijoubu desu)', 'noneeded')}
                        className="bg-white border-2 border-gray-300 text-gray-400 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
                    >
                        {t("actions.noneeded")}
                    </button>
                 </>
             )}

             {step === 7 && (
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
    </div>
  )
}
