import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from './DashboardLayout'
import { InventoryTable } from './InventoryTable'
import { WarehouseDashboard } from './WarehouseDashboard'
import { UserManagement } from './UserManagement'
import { LocationManagement } from './LocationManagement'
import { NotesManagement } from './NotesManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, ArrowsLeftRight, MapPin, Users, ChatCircle } from '@phosphor-icons/react'

export function Dashboard() {
  const { hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('inventory')

  const canManageWarehouse = hasRole(['admin', 'bodeguero'])
  const isAdmin = hasRole(['admin'])

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
          <TabsTrigger value="inventory" className="gap-2 py-3">
            <Package size={18} />
            <span className="hidden sm:inline">Inventario</span>
          </TabsTrigger>
          {canManageWarehouse && (
            <TabsTrigger value="movements" className="gap-2 py-3">
              <ArrowsLeftRight size={18} />
              <span className="hidden sm:inline">Movimientos</span>
            </TabsTrigger>
          )}
          {canManageWarehouse && (
            <TabsTrigger value="locations" className="gap-2 py-3">
              <MapPin size={18} />
              <span className="hidden sm:inline">Ubicaciones</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="notes" className="gap-2 py-3">
            <ChatCircle size={18} />
            <span className="hidden sm:inline">Notas</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2 py-3">
              <Users size={18} />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryTable />
        </TabsContent>

        {canManageWarehouse && (
          <TabsContent value="movements" className="space-y-6">
            <WarehouseDashboard />
          </TabsContent>
        )}

        {canManageWarehouse && (
          <TabsContent value="locations" className="space-y-6">
            <LocationManagement />
          </TabsContent>
        )}

        <TabsContent value="notes" className="space-y-6">
          <NotesManagement />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </DashboardLayout>
  )
}
