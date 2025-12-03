import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me'

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'

export interface TokenPayload {
  userId: string
  email: string
  username: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      country: true,
      bio: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    }
  })

  return user
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPERADMIN'
}

export function isSuperAdmin(role: string): boolean {
  return role === 'SUPERADMIN'
}

export function generateVerifyToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
