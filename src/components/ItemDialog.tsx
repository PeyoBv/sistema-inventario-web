import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { Item, Location } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ItemDialogProps {
  item: Item | null
  locations: Location[]
  open: boolean
  onClose: (success: boolean) => void
}

export function ItemDialog({ item, locations, open, onClose }: ItemDialogProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    locationId: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        locationId: item.locationId
      })
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        quantity: 0,
        locationId: locations[0]?.id || ''
      })
    }
  }, [item, locations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (item) {
        await dataService.updateItem(item.id, formData)
        toast.success('Item actualizado exitosamente')
      } else {
        await dataService.createItem(formData)
        toast.success('Item creado exitosamente')
      }
      onClose(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Nuevo Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Modifique los datos del item' : 'Complete los datos del nuevo item'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ej: PROD-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del producto"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad Inicial</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                disabled={!!item}
              />
              {item && (
                <p className="text-xs text-muted-foreground">
                  Use el módulo de movimientos para ajustar la cantidad
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                required
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Seleccione una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
