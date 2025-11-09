import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { Location } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MapPin, Plus, Pencil } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { LocationDialog } from './LocationDialog'

export function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setIsLoading(true)
    try {
      const locationsData = await dataService.getLocations()
      setLocations(locationsData)
    } catch (error) {
      toast.error('Error al cargar ubicaciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingLocation(null)
    setDialogOpen(true)
  }

  const handleDialogClose = async (success: boolean) => {
    setDialogOpen(false)
    setEditingLocation(null)
    if (success) {
      await loadLocations()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Cargando ubicaciones...
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
                <MapPin size={24} />
                Gestión de Ubicaciones
              </CardTitle>
              <CardDescription>
                {locations.length} ubicaciones en el sistema
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus size={18} weight="bold" />
              Agregar Ubicación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay ubicaciones en el sistema
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {location.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(location)}
                          className="gap-1"
                        >
                          <Pencil size={16} />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <LocationDialog
          location={editingLocation}
          open={dialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </>
  )
}
