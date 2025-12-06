'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Mail, Database, Eye, Lock, UserCheck, Globe, Bell } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Información que Recopilamos",
      content: [
        "**Información de cuenta:** Cuando te registras, recopilamos tu nombre de usuario, correo electrónico, país y contraseña (encriptada).",
        "**Información de perfil:** Nombre, biografía y preferencias de visualización (como unidad de medida).",
        "**Datos de colección:** Las figuras que agregas a tu inventario, listas de deseos y el estado de cada una.",
        "**Opiniones y contenido:** Las reseñas que publicas, calificaciones e imágenes que compartes.",
        "**Datos de uso:** Información sobre cómo interactúas con la plataforma para mejorar tu experiencia."
      ]
    },
    {
      icon: Eye,
      title: "Cómo Usamos tu Información",
      content: [
        "Proporcionar y mantener los servicios de FiguraCollect.",
        "Gestionar tu cuenta y personalizar tu experiencia.",
        "Mostrar tu colección y permitir interacción con otros coleccionistas.",
        "Enviar notificaciones sobre lanzamientos de figuras que te interesan.",
        "Mejorar nuestros servicios mediante análisis de uso agregado.",
        "Prevenir fraude y garantizar la seguridad de la plataforma."
      ]
    },
    {
      icon: UserCheck,
      title: "Compartir Información",
      content: [
        "**Perfil público:** Tu nombre de usuario, colección y reseñas pueden ser visibles para otros usuarios según tu configuración.",
        "**No vendemos datos:** Nunca vendemos tu información personal a terceros.",
        "**Proveedores de servicio:** Podemos compartir datos con servicios que nos ayudan a operar (hosting, análisis), siempre bajo acuerdos de confidencialidad.",
        "**Requisitos legales:** Podemos divulgar información si es requerido por ley."
      ]
    },
    {
      icon: Lock,
      title: "Seguridad de Datos",
      content: [
        "Utilizamos encriptación para proteger contraseñas y datos sensibles.",
        "Implementamos medidas de seguridad estándar de la industria.",
        "Realizamos copias de seguridad regulares para prevenir pérdida de datos.",
        "Limitamos el acceso a datos personales solo al personal autorizado."
      ]
    },
    {
      icon: Globe,
      title: "Tus Derechos",
      content: [
        "**Acceso:** Puedes solicitar una copia de tus datos personales.",
        "**Rectificación:** Puedes corregir información inexacta desde tu perfil.",
        "**Eliminación:** Puedes solicitar la eliminación de tu cuenta y datos asociados.",
        "**Portabilidad:** Puedes exportar tu colección en formatos estándar.",
        "**Oposición:** Puedes optar por no recibir comunicaciones promocionales."
      ]
    },
    {
      icon: Bell,
      title: "Cambios a esta Política",
      content: [
        "Podemos actualizar esta política ocasionalmente.",
        "Te notificaremos cambios significativos por correo o mediante aviso en la plataforma.",
        "El uso continuado después de cambios implica aceptación de la política actualizada."
      ]
    }
  ]

  return (
    <div className="flex-1 bg-background pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
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
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-title font-black text-white">
                Política de Privacidad
              </h1>
              <p className="text-gray-400">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            En FiguraCollect nos tomamos muy en serio la privacidad de nuestros usuarios.
            Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
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
                <div className="p-2 bg-white/5 rounded-lg text-primary">
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

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 text-center"
        >
          <Mail className="mx-auto mb-3 text-primary" size={28} />
          <h3 className="text-lg font-bold text-white mb-2">¿Tienes preguntas?</h3>
          <p className="text-gray-400 mb-4">
            Si tienes dudas sobre nuestra política de privacidad, contáctanos.
          </p>
          <a
            href="mailto:privacidad@figuracollect.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
          >
            <Mail size={18} />
            privacidad@figuracollect.com
          </a>
        </motion.div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
            Términos y Condiciones
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/cookies" className="text-gray-400 hover:text-primary transition-colors">
            Política de Cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
