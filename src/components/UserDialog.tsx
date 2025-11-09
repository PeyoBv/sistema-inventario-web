import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import { useAuth } from '@/contexts/AuthContext'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldWarning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserDialogProps {
  user: User | null
  open: boolean
  onClose: (success: boolean) => void
}

export function UserDialog({ user, open, onClose }: UserDialogProps) {
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'usuario' as User['role']
  })
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])

  // Determinar si es el usuario actual
  const isCurrentUser = user?.id === currentUser?.id
  
  // Determinar si es el último admin
  const isLastAdmin = user?.role === 'admin' && allUsers.filter(u => u.role === 'admin').length === 1

  useEffect(() => {
    // Cargar todos los usuarios para validaciones
    const loadUsers = async () => {
      const users = await dataService.getUsers()
      setAllUsers(users)
    }
    loadUsers()

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
        // Validación: No permitir que el último admin cambie su rol
        if (isLastAdmin && formData.role !== 'admin') {
          toast.error('No se puede cambiar el rol del último administrador', {
            description: 'Debe haber al menos un administrador en el sistema',
            icon: <ShieldWarning size={20} />
          })
          setIsLoading(false)
          return
        }

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
            {isCurrentUser && (
              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <ShieldWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Estás editando tu propia cuenta. Ten cuidado al cambiar tu rol.
                </AlertDescription>
              </Alert>
            )}
            {isLastAdmin && (
              <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <ShieldWarning className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Este es el último administrador del sistema. No se puede cambiar su rol.
                </AlertDescription>
              </Alert>
            )}
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
                disabled={isLastAdmin}
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
              {isLastAdmin && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  No se puede cambiar el rol del último administrador
                </p>
              )}
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
