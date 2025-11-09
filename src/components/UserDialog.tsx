import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { User } from '@/lib/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface UserDialogProps {
  user: User | null
  open: boolean
  onClose: (success: boolean) => void
}

export function UserDialog({ user, open, onClose }: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'usuario' as User['role']
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        role: user.role
      })
    } else {
      setFormData({
        username: '',
        password: '',
        role: 'usuario'
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user) {
        const updates: Partial<User> = { role: formData.role }
        if (formData.password) {
          updates.password = formData.password
        }
        await dataService.updateUser(user.id, updates)
        toast.success('Usuario actualizado exitosamente')
      } else {
        if (!formData.password) {
          toast.error('La contraseña es requerida')
          setIsLoading(false)
          return
        }
        await dataService.createUser(formData.username, formData.password, formData.role)
        toast.success('Usuario creado exitosamente')
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
          <DialogTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifique los datos del usuario' : 'Complete los datos del nuevo usuario'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario123"
                required
                disabled={!!user}
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  El nombre de usuario no se puede modificar
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {user ? '' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={user ? 'Dejar vacío para mantener' : 'Ingrese contraseña'}
                required={!user}
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para mantener la contraseña actual
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="bodeguero">Bodeguero</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
