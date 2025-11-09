import { dataService } from './dataService'

export async function initializeDefaultData() {
  try {
    const users = await dataService.getUsers()
    
    if (users.length === 0) {
      await dataService.createUser('admin', 'admin123', 'admin')
      await dataService.createUser('bodeguero', 'bodega123', 'bodeguero')
      await dataService.createUser('usuario', 'user123', 'usuario')
      
      console.log('✅ Usuarios por defecto creados exitosamente')
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
    console.error('Error al inicializar datos:', error)
  }
}
