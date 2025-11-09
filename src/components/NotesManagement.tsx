import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Note, NoteStatus } from '@/lib/types'
import { NoteDialog } from './NoteDialog'
import { NoteReviewDialog } from './NoteReviewDialog'
import { Plus, Warning, NotePencil, CheckCircle, Clock, ChatCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export function NotesManagement() {
  const { user, hasRole } = useAuth()
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', [])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const canReview = hasRole(['admin', 'bodeguero'])

  const filteredNotes = (notes || []).filter(note => {
    if (filterStatus !== 'all' && note.status !== filterStatus) return false
    if (filterType !== 'all' && note.type !== filterType) return false
    return true
  })

  const handleCreateNote = (noteData: Omit<Note, 'id' | 'createdBy' | 'createdByUsername' | 'createdAt' | 'status'>) => {
    if (!user) return

    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdBy: user.id,
      createdByUsername: user.username,
      createdAt: new Date().toISOString(),
      status: 'pendiente'
    }

    setNotes(currentNotes => [...(currentNotes || []), newNote])
    toast.success(noteData.type === 'nota' ? 'Nota creada exitosamente' : 'Advertencia creada exitosamente')
    setIsCreateOpen(false)
  }

  const handleReviewNote = (noteId: string, status: NoteStatus, response?: string) => {
    if (!user) return

    setNotes(currentNotes =>
      (currentNotes || []).map(note =>
        note.id === noteId
          ? {
              ...note,
              status,
              reviewedBy: user.id,
              reviewedByUsername: user.username,
              reviewedAt: new Date().toISOString(),
              response
            }
          : note
      )
    )

    toast.success('Nota actualizada exitosamente')
    setIsReviewOpen(false)
    setSelectedNote(null)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(currentNotes => (currentNotes || []).filter(note => note.id !== noteId))
    toast.success('Nota eliminada')
  }

  const getStatusBadge = (status: NoteStatus) => {
    const variants = {
      pendiente: { variant: 'secondary' as const, icon: Clock, label: 'Pendiente' },
      revisada: { variant: 'default' as const, icon: ChatCircle, label: 'Revisada' },
      resuelta: { variant: 'outline' as const, icon: CheckCircle, label: 'Resuelta' }
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={14} weight="fill" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: 'nota' | 'advertencia') => {
    if (type === 'advertencia') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Warning size={14} weight="fill" />
          Advertencia
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1">
        <NotePencil size={14} />
        Nota
      </Badge>
    )
  }

  const pendingCount = (notes || []).filter(n => n.status === 'pendiente').length
  const warningCount = (notes || []).filter(n => n.type === 'advertencia' && n.status === 'pendiente').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Notas y Advertencias</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de comunicación entre usuarios y personal de bodega
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={18} weight="bold" />
          Nueva Nota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(notes || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Advertencias Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{warningCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lista de Notas</CardTitle>
              <CardDescription>Todas las notas y advertencias del sistema</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="revisada">Revisada</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nota">Notas</SelectItem>
                  <SelectItem value="advertencia">Advertencias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <NotePencil size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay notas que mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map(note => (
                <Card key={note.id} className={note.type === 'advertencia' && note.status === 'pendiente' ? 'border-destructive' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="flex gap-2 flex-wrap">
                          {getTypeBadge(note.type)}
                          {getStatusBadge(note.status)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{note.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Creado por: <span className="font-medium">{note.createdByUsername}</span>
                        </p>
                      </div>

                      {note.response && (
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-sm font-medium mb-1">Respuesta:</p>
                          <p className="text-sm">{note.response}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Por: <span className="font-medium">{note.reviewedByUsername}</span> • {note.reviewedAt && new Date(note.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        {canReview && note.status === 'pendiente' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedNote(note)
                              setIsReviewOpen(true)
                            }}
                          >
                            Revisar
                          </Button>
                        )}
                        {(user?.id === note.createdBy || hasRole(['admin'])) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NoteDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateNote}
      />

      {selectedNote && (
        <NoteReviewDialog
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          note={selectedNote}
          onSubmit={handleReviewNote}
        />
      )}
    </div>
  )
}
