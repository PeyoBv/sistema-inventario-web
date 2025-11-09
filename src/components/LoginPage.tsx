import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { dataService } from '@/lib/dataService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { token, user } = await dataService.login(username, password)
      login(token, user)
      toast.success('Inicio de sesión exitoso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user)
    setPassword(pass)
    setIsLoading(true)

    try {
      const { token, user: userData } = await dataService.login(user, pass)
      login(token, userData)
      toast.success('Inicio de sesión exitoso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-lg">
              <Package size={32} className="text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema de Inventario</CardTitle>
            <CardDescription>Ingrese sus credenciales para continuar</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-accent/10 border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium text-foreground">Credenciales de demostración:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span>
                    <strong>Admin:</strong> admin / admin123
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleQuickLogin('admin', 'admin123')}
                  >
                    Usar
                  </Button>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>
                    <strong>Bodeguero:</strong> bodeguero / bodega123
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleQuickLogin('bodeguero', 'bodega123')}
                  >
                    Usar
                  </Button>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>
                    <strong>Usuario:</strong> usuario / user123
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleQuickLogin('usuario', 'user123')}
                  >
                    Usar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
