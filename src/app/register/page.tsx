'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Globe, AlignLeft, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
    country: '',
    bio: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        return
      }

      // Auto login
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      router.push('/')
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const countries = [
    'México', 'Estados Unidos', 'España', 'Argentina', 'Colombia',
    'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Guatemala', 'Japón', 'Otro'
  ]

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background relative">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Left Side - Visual / Banner (Desktop) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 z-10 order-2 lg:order-1">
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
              Únete a la<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Élite del Coleccionismo.
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              Comienza hoy mismo a documentar tu pasión. Organiza, comparte y conecta con otros entusiastas.
            </p>
          </motion.div>

          <div className="flex gap-4 text-sm text-gray-500 font-medium">
             <span>© 2025 FiguraCollect</span>
             <span>•</span>
             <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
             <Link href="#" className="hover:text-white transition-colors">Términos</Link>
          </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 order-1 lg:order-2 overflow-y-auto py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-uiBase/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl my-auto"
          >
              <div className="text-center mb-8">
                  <div className="lg:hidden flex justify-center mb-6">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/30">
                        F
                      </div>
                  </div>
                  <h3 className="text-3xl font-title font-bold text-white mb-2">Crear Cuenta</h3>
                  <p className="text-gray-400">Completa tus datos para comenzar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium"
                    >
                        {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Usuario *</label>
                          <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                              <input 
                                  type="text" 
                                  name="username"
                                  value={formData.username}
                                  onChange={handleChange}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                  placeholder="NeoCollector"
                                  required
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">País *</label>
                           <div className="relative group">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                              <select 
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                                required
                              >
                                <option value="" className="bg-[#1a1a1a] text-gray-500">Seleccionar</option>
                                {countries.map(c => (
                                  <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                ))}
                              </select>
                           </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email *</label>
                      <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              placeholder="usuario@ejemplo.com"
                              required
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña *</label>
                      <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              placeholder="Mínimo 6 caracteres"
                              minLength={6}
                              required
                          />
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors focus:outline-none"
                          >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                  </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre (Opcional)</label>
                      <div className="relative group">
                          <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              placeholder="Tu nombre real"
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Bio (Opcional)</label>
                      <div className="relative group">
                          <AlignLeft className="absolute left-4 top-4 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                          <textarea 
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                              placeholder="Cuéntanos sobre tu colección..."
                              rows={3}
                          />
                      </div>
                  </div>

                  <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group mt-4"
                  >
                      {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                          <>
                            Crear Cuenta
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                      )}
                  </button>
              </form>

              <div className="mt-8 text-center">
                  <p className="text-gray-400">
                      ¿Ya tienes cuenta?{' '}
                      <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                          Inicia sesión
                      </Link>
                  </p>
              </div>
          </motion.div>
      </div>
    </div>
  )
}
