'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-primary transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`text-gray-500 group-hover:text-primary transition-colors`}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 pb-6 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AboutClient() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 pb-20">
      {/* Hero Section - Moved from Home */}
      <motion.section
        className="relative py-24 md:py-32 text-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-title text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Figura<span className="text-primary">Collect</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-body text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t.about.description}
          </motion.p>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-uiBase rounded-lg border border-white/5 text-primary">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-3xl font-title font-bold text-white">{t.about.faq}</h2>
        </div>

        <div className="bg-uiBase/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8">
          <FaqItem
            question={t.about.q1}
            answer={t.about.a1}
          />
          <FaqItem
            question={t.about.q2}
            answer={t.about.a2}
          />
          <FaqItem
            question={t.about.q3}
            answer={t.about.a3}
          />
          <FaqItem
            question={t.about.q4}
            answer={t.about.a4}
          />
          <FaqItem
            question={t.about.q5}
            answer={t.about.a5}
          />
        </div>
      </section>
    </div>
  )
}
