'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, ToggleLeft, HelpCircle, Mail } from 'lucide-react'

export default function CookiesPage() {
  const cookieTypes = [
    {
      name: "Esenciales",
      required: true,
      icon: Shield,
      color: "emerald",
      description: "Necesarias para el funcionamiento básico del sitio.",
      examples: [
        "**Sesión:** Mantener tu sesión iniciada mientras navegas.",
        "**Seguridad:** Proteger contra ataques CSRF y mantener la seguridad.",
        "**Preferencias básicas:** Recordar tu idioma y configuración esencial."
      ]
    },
    {
      name: "Funcionales",
      required: false,
      icon: Settings,
      color: "blue",
      description: "Mejoran tu experiencia recordando tus preferencias.",
      examples: [
        "**Preferencias de visualización:** Unidad de medida (cm/pulgadas).",
        "**Filtros:** Recordar tus filtros favoritos en el catálogo.",
        "**Tema:** Preferencias de apariencia (si se implementa modo claro)."
      ]
    },
    {
      name: "Analíticas",
      required: false,
      icon: BarChart3,
      color: "amber",
      description: "Nos ayudan a entender cómo usas la plataforma para mejorarla.",
      examples: [
        "**Páginas visitadas:** Qué secciones son más populares.",
        "**Tiempo en página:** Cuánto tiempo pasas en cada sección.",
        "**Flujos de navegación:** Cómo te mueves por la plataforma.",
        "**Errores:** Detectar problemas técnicos para solucionarlos."
      ]
    }
  ]

  const faqs = [
    {
      question: "¿Qué son las cookies?",
      answer: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde información sobre tu visita."
    },
    {
      question: "¿Por qué usamos cookies?",
      answer: "Usamos cookies para mantener tu sesión activa, recordar tus preferencias, y entender cómo podemos mejorar FiguraCollect para ti."
    },
    {
      question: "¿Puedo usar FiguraCollect sin cookies?",
      answer: "Las cookies esenciales son necesarias para funciones básicas como iniciar sesión. Sin ellas, algunas funciones no estarán disponibles."
    },
    {
      question: "¿Cuánto tiempo duran las cookies?",
      answer: "Las cookies de sesión se eliminan al cerrar el navegador. Las cookies persistentes pueden durar desde días hasta un año, dependiendo de su propósito."
    },
    {
      question: "¿Comparten mis datos las cookies?",
      answer: "No compartimos datos de cookies con terceros para publicidad. Solo usamos servicios de análisis propios o de confianza bajo estrictos acuerdos de privacidad."
    }
  ]

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Cookie size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-title font-black text-white">
                Política de Cookies
              </h1>
              <p className="text-gray-400">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            Esta política explica cómo FiguraCollect utiliza cookies y tecnologías similares
            para brindarte la mejor experiencia posible.
          </p>
        </motion.div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Tipos de Cookies que Usamos</h2>

          {cookieTypes.map((cookie, index) => (
            <motion.div
              key={cookie.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-uiBase/40 backdrop-blur-md border rounded-2xl p-6 ${
                cookie.color === 'emerald' ? 'border-emerald-500/20' :
                cookie.color === 'blue' ? 'border-blue-500/20' :
                'border-amber-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    cookie.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    cookie.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    <cookie.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{cookie.name}</h3>
                    <p className="text-sm text-gray-400">{cookie.description}</p>
                  </div>
                </div>

                {cookie.required ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                    Requeridas
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-bold rounded-full border border-white/10">
                    Opcionales
                  </span>
                )}
              </div>

              <ul className="space-y-2">
                {cookie.examples.map((example, i) => (
                  <li key={i} className="text-gray-300 text-sm pl-4 border-l-2 border-white/10">
                    {example.split('**').map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-white font-semibold">{part}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* How to Manage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-uiBase/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg text-gray-400">
              <ToggleLeft size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Cómo Gestionar las Cookies</h2>
          </div>

          <div className="space-y-4 text-gray-300">
            <p>
              Puedes controlar y gestionar las cookies de varias maneras:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="font-bold text-white mb-2">Configuración del navegador</h4>
                <p className="text-sm text-gray-400">
                  La mayoría de navegadores te permiten bloquear o eliminar cookies desde su configuración.
                  Busca "cookies" en la ayuda de tu navegador.
                </p>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="font-bold text-white mb-2">Modo incógnito</h4>
                <p className="text-sm text-gray-400">
                  Navegar en modo privado/incógnito evita que se guarden cookies permanentes en tu dispositivo.
                </p>
              </div>
            </div>

            <p className="text-sm text-amber-400/80 bg-amber-500/10 px-4 py-3 rounded-lg border border-amber-500/20">
              <strong>Nota:</strong> Bloquear cookies esenciales puede afectar el funcionamiento de FiguraCollect,
              incluyendo la capacidad de iniciar sesión y guardar tu colección.
            </p>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-lg text-gray-400">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-uiBase/40 backdrop-blur-md border border-white/5 rounded-xl p-5"
              >
                <h3 className="font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-3">
            ¿Más preguntas sobre cookies?
          </p>
          <a
            href="mailto:privacidad@figuracollect.com"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Mail size={18} />
            privacidad@figuracollect.com
          </a>
        </motion.div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/privacy" className="text-gray-400 hover:text-amber-400 transition-colors">
            Política de Privacidad
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms" className="text-gray-400 hover:text-amber-400 transition-colors">
            Términos y Condiciones
          </Link>
        </div>
      </div>
    </div>
  )
}
