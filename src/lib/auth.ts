import { v4 as uuidv4 } from 'uuid'

export const generateId = (): string => {
  return uuidv4()
}

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export const createToken = (userId: string, username: string, role: string): string => {
  const payload = {
    userId,
    username,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000
  }
  return btoa(JSON.stringify(payload))
}

export const verifyToken = (token: string): { userId: string; username: string; role: string } | null => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null
    }
    return { userId: payload.userId, username: payload.username, role: payload.role }
  } catch {
    return null
  }
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatMovementType = (type: string): string => {
  const labels: Record<string, string> = {
    entrada: 'Entrada',
    salida: 'Salida',
    ajuste: 'Ajuste'
  }
  return labels[type] || type
}

export const formatRole = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    bodeguero: 'Bodeguero',
    usuario: 'Usuario'
  }
  return labels[role] || role
}
