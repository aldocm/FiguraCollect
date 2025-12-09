import { prisma } from './db'

/**
 * Obtiene una configuración del sistema por su clave
 */
export async function getSystemConfig(key: string): Promise<boolean | string | null> {
  const config = await prisma.systemConfiguration.findUnique({
    where: { key }
  })

  if (!config) return null

  try {
    return JSON.parse(config.value)
  } catch {
    return config.value
  }
}

/**
 * Establece una configuración del sistema
 */
export async function setSystemConfig(key: string, value: unknown): Promise<void> {
  await prisma.systemConfiguration.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) }
  })
}

/**
 * Verifica si se deben mostrar las figuras pendientes en el catálogo público
 */
export async function shouldShowPendingFigures(): Promise<boolean> {
  const value = await getSystemConfig('SHOW_PENDING_FIGURES')
  return value === true
}

/**
 * Claves de configuración válidas
 */
export const CONFIG_KEYS = {
  SHOW_PENDING_FIGURES: 'SHOW_PENDING_FIGURES'
} as const

export type ConfigKey = keyof typeof CONFIG_KEYS
