import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Note, NoteStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface NoteReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: Note
  onSubmit: (noteId: string, status: NoteStatus, response?: string) => void
}

export function NoteReviewDialog({ open, onOpenChange, note, onSubmit }: NoteReviewDialogProps) {
  const [status, setStatus] = useState<NoteStatus>('revisada')
  const [response, setResponse] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit(note.id, status, response.trim() || undefined)

    setStatus('revisada')
    setResponse('')
  }

  const handleClose = () => {
    setStatus('revisada')
    setResponse('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Revisar Nota</DialogTitle>
          <DialogDescription>
            Actualiza el estado de la nota y agrega una respuesta
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="bg-muted rounded-md p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{note.title}</h3>
                <Badge variant={note.type === 'advertencia' ? 'destructive' : 'default'}>
                  {note.type === 'advertencia' ? 'Advertencia' : 'Nota'}
                </Badge>
              </div>
              <p className="text-sm">{note.message}</p>
              <p className="text-xs text-muted-foreground">
                Creado por: {note.createdByUsername} • {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Nuevo Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as NoteStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revisada">Revisada</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">Respuesta (Opcional)</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Agrega una respuesta o comentario..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar Nota</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
