'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.login.loginError)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError(t.login.connectionError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background relative">

      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Left Side - Visual / Banner (Desktop) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 z-10">
          <div className="relative">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/30">
                  F
                </div>
                <span className="font-title text-3xl font-bold text-white tracking-tight">
                  Figura<span className="text-primary">Collect</span>
                </span>
              </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <h2 className="text-6xl font-title font-black text-white leading-tight mb-6">
              {t.login.yourCollection}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                {t.login.yourLegacy}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              {t.login.description}
            </p>
          </motion.div>

          <div className="flex gap-4 text-sm text-gray-500 font-medium">
             <span>&copy; 2025 FiguraCollect</span>
             <span>&bull;</span>
             <Link href="#" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
             <Link href="#" className="hover:text-white transition-colors">{t.footer.terms}</Link>
          </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-uiBase/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
          >
              <div className="text-center mb-8">
                  <div className="lg:hidden flex justify-center mb-6">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/30">
                        F
                      </div>
                  </div>
                  <h3 className="text-3xl font-title font-bold text-white mb-2">{t.login.welcomeBack}</h3>
                  <p className="text-gray-400">{t.login.enterCredentials}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                  {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium"
                    >
                        {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t.login.email}</label>
                      <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                          <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              placeholder={t.login.emailPlaceholder}
                              required
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t.login.password}</label>
                          {/* TODO: Implementar recuperación de contraseña
                          <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">{t.login.forgotPassword}</Link>
                          */}
                      </div>
                      <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                          <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              placeholder={t.login.passwordPlaceholder}
                              required
                          />
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors focus:outline-none"
                          >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                      </div>
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                  >
                      {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                          <>
                            {t.login.loginButton}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                      )}
                  </button>
              </form>

              <div className="mt-8 text-center">
                  <p className="text-gray-400">
                      {t.login.noAccount}{' '}
                      <Link href="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                          {t.login.registerFree}
                      </Link>
                  </p>
              </div>
          </motion.div>
      </div>
    </div>
  )
}
