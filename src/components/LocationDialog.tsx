import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { Location } from '@/lib/types'
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
import { toast } from 'sonner'

interface LocationDialogProps {
  location: Location | null
  open: boolean
  onClose: (success: boolean) => void
}

export function LocationDialog({ location, open, onClose }: LocationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        description: location.description
      })
    } else {
      setFormData({
        name: '',
        description: ''
      })
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (location) {
        await dataService.updateLocation(location.id, formData)
        toast.success('Ubicación actualizada exitosamente')
      } else {
        await dataService.createLocation(formData)
        toast.success('Ubicación creada exitosamente')
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
          <DialogTitle>{location ? 'Editar Ubicación' : 'Nueva Ubicación'}</DialogTitle>
          <DialogDescription>
            {location ? 'Modifique los datos de la ubicación' : 'Complete los datos de la nueva ubicación'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Bodega Central, Estante A-01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional de la ubicación"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : location ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
