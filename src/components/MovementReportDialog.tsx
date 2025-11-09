import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { MovementLog } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FilePdf, Printer, Download, ClockCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateMovementsPDF } from '@/lib/pdfGenerator'
import { formatDate } from '@/lib/auth'

interface MovementReportDialogProps {
  open: boolean
  onClose: () => void
}

export function MovementReportDialog({ open, onClose }: MovementReportDialogProps) {
  const [logs, setLogs] = useState<MovementLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (open) {
      loadRecentMovements()
    }
  }, [open])

  const loadRecentMovements = async () => {
    setIsLoading(true)
    try {
      const allLogs = await dataService.getMovementLogs()
      const sixHoursAgo = new Date()
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6)

      const recentLogs = allLogs.filter(log => 
        new Date(log.timestamp) >= sixHoursAgo
      ).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setLogs(recentLogs)
    } catch (error) {
      toast.error('Error al cargar movimientos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePDF = async (print: boolean = false) => {
    setIsGenerating(true)
    try {
      await generateMovementsPDF(logs, print)
      toast.success(print ? 'Abriendo vista de impresión...' : 'PDF descargado exitosamente')
    } catch (error) {
      toast.error('Error al generar el PDF')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste'
    }
    return labels[type] || type
  }

  const getMovementTypeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      entrada: 'default',
      salida: 'secondary',
      ajuste: 'outline'
    }
    return variants[type] || 'default'
  }

  const totalEntradas = logs.filter(l => l.type === 'entrada').reduce((sum, l) => sum + l.quantityChange, 0)
  const totalSalidas = logs.filter(l => l.type === 'salida').reduce((sum, l) => sum + Math.abs(l.quantityChange), 0)
  const totalAjustes = logs.filter(l => l.type === 'ajuste').length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FilePdf size={28} className="text-destructive" weight="fill" />
            Reporte de Movimientos
          </DialogTitle>
          <DialogDescription>
            Movimientos de inventario de las últimas 6 horas
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Cargando movimientos...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Entradas</p>
                    <p className="text-3xl font-bold text-primary">+{totalEntradas}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {logs.filter(l => l.type === 'entrada').length} movimientos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Salidas</p>
                    <p className="text-3xl font-bold text-accent">-{totalSalidas}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {logs.filter(l => l.type === 'salida').length} movimientos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Ajustes</p>
                    <p className="text-3xl font-bold">{totalAjustes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      correcciones
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {logs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClockCounterClockwise size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay movimientos en las últimas 6 horas</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getMovementTypeVariant(log.type)}>
                              {getMovementTypeLabel(log.type)}
                            </Badge>
                            <span className="font-medium">{log.itemName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(log.timestamp)}</span>
                            <span>•</span>
                            <span>{log.username}</span>
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${
                          log.quantityChange > 0 ? 'text-primary' : 'text-destructive'
                        }`}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => handleGeneratePDF(false)}
                disabled={isGenerating || logs.length === 0}
                className="flex-1 gap-2"
              >
                <Download size={18} weight="bold" />
                Descargar PDF
              </Button>
              <Button
                onClick={() => handleGeneratePDF(true)}
                disabled={isGenerating || logs.length === 0}
                variant="secondary"
                className="flex-1 gap-2"
              >
                <Printer size={18} weight="bold" />
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
