import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { Item, Location } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MagnifyingGlass, Plus, Pencil, Trash, Package } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ItemDialog } from './ItemDialog'

export function InventoryTable() {
  const { hasRole } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const canEdit = hasRole(['admin', 'bodeguero'])
  const canDelete = hasRole(['admin'])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [itemsData, locationsData] = await Promise.all([
        dataService.getItems(),
        dataService.getLocations()
      ])
      setItems(itemsData)
      setLocations(locationsData)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este item?')) return

    try {
      await dataService.deleteItem(id)
      await loadData()
      toast.success('Item eliminado exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleDialogClose = async (success: boolean) => {
    setDialogOpen(false)
    setEditingItem(null)
    if (success) {
      await loadData()
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    return location?.name || 'Sin ubicación'
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">Sin stock</Badge>
    if (quantity < 10) return <Badge variant="outline" className="border-accent text-accent">Bajo</Badge>
    return <Badge variant="secondary">Normal</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Cargando inventario...
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package size={24} />
                Inventario
              </CardTitle>
              <CardDescription>
                {filteredItems.length} items en el sistema
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:min-w-[300px]">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {canEdit && (
                <Button onClick={handleAdd} className="gap-2">
                  <Plus size={18} weight="bold" />
                  Agregar Item
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'No se encontraron items' : 'No hay items en el inventario'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                    {(canEdit || canDelete) && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                        {item.description || '—'}
                      </TableCell>
                      <TableCell className="font-semibold">{item.quantity}</TableCell>
                      <TableCell>{getStockBadge(item.quantity)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getLocationName(item.locationId)}</TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="gap-1"
                              >
                                <Pencil size={16} />
                                <span className="hidden sm:inline">Editar</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash size={16} />
                                <span className="hidden sm:inline">Eliminar</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <ItemDialog
          item={editingItem}
          locations={locations}
          open={dialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </>
  )
}
