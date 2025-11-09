import { useState, useEffect } from 'react'
import { dataService } from '@/lib/dataService'
import type { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Plus, Pencil, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatRole, formatDate } from '@/lib/auth'
import { UserDialog } from './UserDialog'

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const usersData = await dataService.getUsers()
      setUsers(usersData)
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return

    try {
      await dataService.deleteUser(id)
      await loadUsers()
      toast.success('Usuario eliminado exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleDialogClose = async (success: boolean) => {
    setDialogOpen(false)
    setEditingUser(null)
    if (success) {
      await loadUsers()
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      bodeguero: 'secondary',
      usuario: 'outline'
    }
    return (
      <Badge variant={variants[role] || 'outline'}>
        {formatRole(role)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Cargando usuarios...
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
                <Users size={24} />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                {users.length} usuarios en el sistema
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus size={18} weight="bold" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay usuarios en el sistema
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="gap-1"
                          >
                            <Pencil size={16} />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </Button>
                        </div>
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
        <UserDialog
          user={editingUser}
          open={dialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </>
  )
}
