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
import { Note, NoteType } from '@/lib/types'

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (note: Omit<Note, 'id' | 'createdBy' | 'createdByUsername' | 'createdAt' | 'status'>) => void
}

export function NoteDialog({ open, onOpenChange, onSubmit }: NoteDialogProps) {
  const [type, setType] = useState<NoteType>('nota')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      return
    }

    onSubmit({
      type,
      title: title.trim(),
      message: message.trim(),
    })

    setType('nota')
    setTitle('')
    setMessage('')
  }

  const handleClose = () => {
    setType('nota')
    setTitle('')
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Nota</DialogTitle>
          <DialogDescription>
            Crea una nota o advertencia para que el personal de bodega la revise
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as NoteType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nota">Nota</SelectItem>
                  <SelectItem value="advertencia">Advertencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Problema con artículo X"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe el detalle de tu nota o advertencia..."
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear {type === 'nota' ? 'Nota' : 'Advertencia'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
