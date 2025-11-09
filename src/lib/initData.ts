import { dataService } from './dataService'

declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
    delete: (key: string) => Promise<void>
  }
}

export async function initializeDefaultData() {
  try {
    const users = await dataService.getUsers()
    
    if (users.length === 0) {
      console.log('🔄 Creando usuarios por defecto...')
      await dataService.createUser('admin', 'admin123', 'admin')
      await dataService.createUser('bodeguero', 'bodega123', 'bodeguero')
      await dataService.createUser('usuario', 'user123', 'usuario')
      
      console.log('✅ Usuarios por defecto creados exitosamente')
      console.log('👤 admin / admin123')
      console.log('👤 bodeguero / bodega123')
      console.log('👤 usuario / user123')
    } else {
      console.log(`✅ ${users.length} usuarios ya existen en el sistema`)
    }
    
    const locations = await dataService.getLocations()
    if (locations.length === 0) {
      await dataService.createLocation({
        name: 'Almacén Principal',
        description: 'Bodega principal de productos'
      })
      await dataService.createLocation({
        name: 'Estante A1',
        description: 'Primera sección del almacén'
      })
      await dataService.createLocation({
        name: 'Zona de Recepción',
        description: 'Área de entrada de mercancías'
      })
      
      console.log('✅ Ubicaciones por defecto creadas exitosamente')
    }
  } catch (error) {
    console.error('❌ Error al inicializar datos:', error)
  }
}

export async function resetDefaultUsers() {
  try {
    console.log('🔄 Reiniciando usuarios...')
    await spark.kv.delete('users')
    
    await dataService.createUser('admin', 'admin123', 'admin')
    await dataService.createUser('bodeguero', 'bodega123', 'bodeguero')
    await dataService.createUser('usuario', 'user123', 'usuario')
    
    console.log('✅ Usuarios reiniciados correctamente')
    console.log('👤 admin / admin123')
    console.log('👤 bodeguero / bodega123')
    console.log('👤 usuario / user123')
    
    return true
  } catch (error) {
    console.error('❌ Error al reiniciar usuarios:', error)
    return false
  }
}
