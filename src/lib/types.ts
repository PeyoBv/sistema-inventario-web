export type UserRole = 'admin' | 'bodeguero' | 'usuario'

export type MovementType = 'entrada' | 'salida' | 'ajuste'

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  createdAt: string
}

export interface Item {
  id: string
  sku: string
  name: string
  description: string
  quantity: number
  locationId: string
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface MovementLog {
  id: string
  type: MovementType
  quantityChange: number
  timestamp: string
  userId: string
  itemId: string
  username: string
  itemName: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

export type NoteType = 'nota' | 'advertencia'

export type NoteStatus = 'pendiente' | 'revisada' | 'resuelta'

export interface Note {
  id: string
  type: NoteType
  title: string
  message: string
  status: NoteStatus
  createdBy: string
  createdByUsername: string
  createdAt: string
  reviewedBy?: string
  reviewedByUsername?: string
  reviewedAt?: string
  response?: string
}
