'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Users, Package, MessageSquare, AlertTriangle, Scale, Ban, RefreshCw, Mail } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: "Uso del Servicio",
      content: [
        "**Elegibilidad:** Debes tener al menos 13 años para usar FiguraCollect. Si eres menor de 18, necesitas permiso de un padre o tutor.",
        "**Cuenta:** Eres responsable de mantener la seguridad de tu cuenta y contraseña.",
        "**Uso personal:** El servicio es para uso personal y no comercial.",
        "**Una cuenta por persona:** Solo puedes tener una cuenta activa."
      ]
    },
    {
      icon: Package,
      title: "Contenido de la Plataforma",
      content: [
        "**Catálogo:** La información sobre figuras (precios, fechas, especificaciones) es proporcionada con fines informativos y puede variar.",
        "**Imágenes:** Las imágenes de figuras son propiedad de sus respectivos fabricantes y se usan con fines de referencia.",
        "**Precios:** Los precios mostrados son referenciales y pueden cambiar. No somos una tienda ni vendemos figuras directamente.",
        "**Precisión:** Nos esforzamos por mantener información precisa, pero no garantizamos que esté libre de errores."
      ]
    },
    {
      icon: MessageSquare,
      title: "Contenido del Usuario",
      content: [
        "**Propiedad:** Mantienes los derechos de las reseñas e imágenes que publicas.",
        "**Licencia:** Al publicar contenido, nos otorgas licencia para mostrarlo en la plataforma.",
        "**Responsabilidad:** Eres responsable del contenido que publicas.",
        "**Prohibiciones:** No publiques contenido ofensivo, ilegal, spam o que infrinja derechos de terceros.",
        "**Moderación:** Nos reservamos el derecho de eliminar contenido que viole estos términos."
      ]
    },
    {
      icon: Ban,
      title: "Conducta Prohibida",
      content: [
        "Usar la plataforma para actividades ilegales.",
        "Intentar acceder a cuentas de otros usuarios.",
        "Realizar scraping o extraer datos masivamente sin autorización.",
        "Publicar información falsa o engañosa.",
        "Acosar, intimidar o discriminar a otros usuarios.",
        "Crear múltiples cuentas para evadir restricciones.",
        "Usar bots o automatización no autorizada."
      ]
    },
    {
      icon: Scale,
      title: "Propiedad Intelectual",
      content: [
        "**Marcas:** FiguraCollect y su logo son marcas de nuestra propiedad.",
        "**Figuras:** Los nombres, imágenes y marcas de figuras pertenecen a sus respectivos fabricantes (Good Smile Company, Bandai, Kotobukiya, etc.).",
        "**Código:** El código y diseño de la plataforma son de nuestra propiedad.",
        "**Respeto:** Respetamos la propiedad intelectual de terceros y esperamos lo mismo de nuestros usuarios."
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitación de Responsabilidad",
      content: [
        "El servicio se proporciona \"tal cual\" sin garantías de ningún tipo.",
        "No somos responsables por decisiones de compra basadas en información de la plataforma.",
        "No garantizamos disponibilidad ininterrumpida del servicio.",
        "No somos responsables por pérdida de datos debido a circunstancias fuera de nuestro control.",
        "Nuestra responsabilidad máxima se limita al monto pagado por servicios premium (si aplica)."
      ]
    },
    {
      icon: RefreshCw,
      title: "Modificaciones y Terminación",
      content: [
        "**Cambios al servicio:** Podemos modificar o descontinuar funciones con previo aviso.",
        "**Cambios a términos:** Notificaremos cambios importantes a estos términos.",
        "**Suspensión:** Podemos suspender cuentas que violen estos términos.",
        "**Eliminación:** Puedes eliminar tu cuenta en cualquier momento desde tu perfil."
      ]
    }
  ]

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
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
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-title font-black text-white">
                Términos y Condiciones
              </h1>
              <p className="text-gray-400">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            Al usar FiguraCollect, aceptas estos términos. Por favor, léelos cuidadosamente.
            Si no estás de acuerdo, no uses nuestros servicios.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-uiBase/40 backdrop-blur-md border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                  <section.icon size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>

              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="text-gray-300 leading-relaxed pl-4 border-l-2 border-white/10">
                    {item.split('**').map((part, j) =>
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

        {/* Acceptance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Aceptación de Términos</h3>
              <p className="text-gray-400 mb-4">
                Al crear una cuenta o usar FiguraCollect, confirmas que has leído, entendido y aceptas
                estos términos y condiciones, así como nuestra Política de Privacidad.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                >
                  Crear Cuenta
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl transition-colors border border-white/10"
                >
                  Ver Privacidad
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 mb-3">
            ¿Preguntas sobre estos términos?
          </p>
          <a
            href="mailto:legal@figuracollect.com"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Mail size={18} />
            legal@figuracollect.com
          </a>
        </motion.div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
            Política de Privacidad
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
            Política de Cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
