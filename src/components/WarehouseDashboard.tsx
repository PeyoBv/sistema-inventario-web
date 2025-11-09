import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import { useAuth } from '@/contexts/AuthContext'
import type { Item, MovementLog } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Wrench, ClockCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDate, formatMovementType } from '@/lib/auth'

export function WarehouseDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [logs, setLogs] = useState<MovementLog[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [itemsData, logsData] = await Promise.all([
        dataService.getItems(),
        dataService.getMovementLogs()
      ])
      setItems(itemsData)
      setLogs(logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    } catch (error) {
      toast.error('Error al cargar datos')
    }
  }

  const handleMovement = async (type: 'entrada' | 'salida' | 'ajuste') => {
    if (!selectedItemId) {
      toast.error('Seleccione un item')
      return
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    try {
      await dataService.createMovement(
        type,
        selectedItemId,
        type === 'ajuste' ? quantity : quantity,
        user!.id,
        user!.username
      )
      
      await loadData()
      setQuantity(1)
      
      const typeLabels = {
        entrada: 'Entrada registrada',
        salida: 'Salida registrada',
        ajuste: 'Ajuste realizado'
      }
      toast.success(typeLabels[type])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar movimiento')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedItem = items.find(i => i.id === selectedItemId)

  const getMovementBadge = (type: string) => {
    const variants: Record<string, { icon: typeof ArrowUp; variant: 'default' | 'secondary' | 'outline' }> = {
      entrada: { icon: ArrowUp, variant: 'default' },
      salida: { icon: ArrowDown, variant: 'secondary' },
      ajuste: { icon: Wrench, variant: 'outline' }
    }
    const config = variants[type] || variants.entrada
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={14} weight="bold" />
        {formatMovementType(type)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp size={20} className="text-primary" weight="bold" />
              Entrada
            </CardTitle>
            <CardDescription>Agregar stock al inventario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-entrada">Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger id="item-entrada">
                  <SelectValue placeholder="Seleccione un item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-entrada">Cantidad</Label>
              <Input
                id="quantity-entrada"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            {selectedItem && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Stock actual: {selectedItem.quantity}</p>
                <p className="text-muted-foreground">Nuevo stock: {selectedItem.quantity + quantity}</p>
              </div>
            )}
            <Button
              onClick={() => handleMovement('entrada')}
              disabled={isLoading || !selectedItemId}
              className="w-full"
            >
              Registrar Entrada
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown size={20} className="text-accent" weight="bold" />
              Salida
            </CardTitle>
            <CardDescription>Retirar stock del inventario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-salida">Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger id="item-salida">
                  <SelectValue placeholder="Seleccione un item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-salida">Cantidad</Label>
              <Input
                id="quantity-salida"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            {selectedItem && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Stock actual: {selectedItem.quantity}</p>
                <p className="text-muted-foreground">
                  Nuevo stock: {Math.max(0, selectedItem.quantity - quantity)}
                </p>
                {quantity > selectedItem.quantity && (
                  <p className="text-destructive font-medium mt-1">⚠️ Stock insuficiente</p>
                )}
              </div>
            )}
            <Button
              onClick={() => handleMovement('salida')}
              disabled={isLoading || !selectedItemId}
              className="w-full"
              variant="secondary"
            >
              Registrar Salida
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench size={20} weight="bold" />
              Ajuste
            </CardTitle>
            <CardDescription>Corregir cantidad de stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-ajuste">Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger id="item-ajuste">
                  <SelectValue placeholder="Seleccione un item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-ajuste">Nueva Cantidad</Label>
              <Input
                id="quantity-ajuste"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            {selectedItem && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Stock actual: {selectedItem.quantity}</p>
                <p className="text-muted-foreground">Diferencia: {quantity - selectedItem.quantity}</p>
              </div>
            )}
            <Button
              onClick={() => handleMovement('ajuste')}
              disabled={isLoading || !selectedItemId}
              className="w-full"
              variant="outline"
            >
              Aplicar Ajuste
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockCounterClockwise size={24} />
            Historial de Movimientos
          </CardTitle>
          <CardDescription>Últimos movimientos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay movimientos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Cambio</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{getMovementBadge(log.type)}</TableCell>
                      <TableCell className="font-medium">{log.itemName}</TableCell>
                      <TableCell className={log.quantityChange > 0 ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                        {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.username}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
