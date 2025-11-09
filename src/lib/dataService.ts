import type { User, Item, Location, MovementLog } from '@/lib/types'
import { generateId, hashPassword, verifyPassword, createToken } from '@/lib/auth'

declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
    delete: (key: string) => Promise<void>
  }
}

class DataService {
  async getUsers(): Promise<User[]> {
    const users = await spark.kv.get<User[]>('users')
    return users || []
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers()
    return users.find(u => u.id === id)
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.getUsers()
    return users.find(u => u.username === username)
  }

  async createUser(username: string, password: string, role: string): Promise<User> {
    const users = await this.getUsers()
    
    if (users.some(u => u.username === username)) {
      throw new Error('El nombre de usuario ya existe')
    }

    const hashedPassword = await hashPassword(password)
    const newUser: User = {
      id: generateId(),
      username,
      password: hashedPassword,
      role: role as User['role'],
      createdAt: new Date().toISOString()
    }

    await spark.kv.set('users', [...users, newUser])
    return newUser
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers()
    const index = users.findIndex(u => u.id === id)
    
    if (index === -1) {
      throw new Error('Usuario no encontrado')
    }

    if (updates.password) {
      updates.password = await hashPassword(updates.password)
    }

    const updatedUser = { ...users[index], ...updates }
    users[index] = updatedUser
    await spark.kv.set('users', users)
    return updatedUser
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers()
    const filtered = users.filter(u => u.id !== id)
    await spark.kv.set('users', filtered)
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.getUserByUsername(username)
    
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid) {
      throw new Error('Credenciales inválidas')
    }

    const token = createToken(user.id, user.username, user.role)
    return { token, user }
  }

  async getItems(): Promise<Item[]> {
    const items = await spark.kv.get<Item[]>('items')
    return items || []
  }

  async getItemById(id: string): Promise<Item | undefined> {
    const items = await this.getItems()
    return items.find(i => i.id === id)
  }

  async createItem(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    const items = await this.getItems()
    
    if (items.some(i => i.sku === data.sku)) {
      throw new Error('El SKU ya existe')
    }

    const newItem: Item = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await spark.kv.set('items', [...items, newItem])
    return newItem
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const items = await this.getItems()
    const index = items.findIndex(i => i.id === id)
    
    if (index === -1) {
      throw new Error('Item no encontrado')
    }

    if (updates.sku && updates.sku !== items[index].sku) {
      if (items.some(i => i.sku === updates.sku)) {
        throw new Error('El SKU ya existe')
      }
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    items[index] = updatedItem
    await spark.kv.set('items', items)
    return updatedItem
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.getItems()
    const filtered = items.filter(i => i.id !== id)
    await spark.kv.set('items', filtered)
  }

  async getLocations(): Promise<Location[]> {
    const locations = await spark.kv.get<Location[]>('locations')
    return locations || []
  }

  async getLocationById(id: string): Promise<Location | undefined> {
    const locations = await this.getLocations()
    return locations.find(l => l.id === id)
  }

  async createLocation(data: Omit<Location, 'id' | 'createdAt'>): Promise<Location> {
    const locations = await this.getLocations()
    
    const newLocation: Location = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    }

    await spark.kv.set('locations', [...locations, newLocation])
    return newLocation
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    const locations = await this.getLocations()
    const index = locations.findIndex(l => l.id === id)
    
    if (index === -1) {
      throw new Error('Ubicación no encontrada')
    }

    const updatedLocation = { ...locations[index], ...updates }
    locations[index] = updatedLocation
    await spark.kv.set('locations', locations)
    return updatedLocation
  }

  async getMovementLogs(): Promise<MovementLog[]> {
    const logs = await spark.kv.get<MovementLog[]>('movement-logs')
    return logs || []
  }

  async createMovement(
    type: MovementLog['type'],
    itemId: string,
    quantity: number,
    userId: string,
    username: string
  ): Promise<{ item: Item; log: MovementLog }> {
    const items = await this.getItems()
    const itemIndex = items.findIndex(i => i.id === itemId)
    
    if (itemIndex === -1) {
      throw new Error('Item no encontrado')
    }

    const item = items[itemIndex]
    let newQuantity = item.quantity

    if (type === 'entrada') {
      newQuantity += quantity
    } else if (type === 'salida') {
      if (item.quantity < quantity) {
        throw new Error('Stock insuficiente')
      }
      newQuantity -= quantity
    } else if (type === 'ajuste') {
      newQuantity = quantity
    }

    const updatedItem = {
      ...item,
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    }

    items[itemIndex] = updatedItem

    const newLog: MovementLog = {
      id: generateId(),
      type,
      quantityChange: type === 'salida' ? -quantity : quantity,
      timestamp: new Date().toISOString(),
      userId,
      itemId,
      username,
      itemName: item.name
    }

    const logs = await this.getMovementLogs()
    
    await spark.kv.set('items', items)
    await spark.kv.set('movement-logs', [...logs, newLog])

    return { item: updatedItem, log: newLog }
  }
}

export const dataService = new DataService()
