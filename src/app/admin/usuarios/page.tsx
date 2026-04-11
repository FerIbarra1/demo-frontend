'use client';

import { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual API call
const mockUsers = [
  { id: 1, nombre: 'Admin Principal', email: 'admin@demo.com', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Juan Bodega', email: 'bodega@tienda.com', rol: 'BODEGA', activo: true },
  { id: 3, nombre: 'Maria Cajero', email: 'cajero@tienda.com', rol: 'CAJERO', activo: true },
  { id: 4, nombre: 'Pedro Mostrador', email: 'mostrador@tienda.com', rol: 'MOSTRADOR', activo: true },
  { id: 5, nombre: 'Cliente Demo', email: 'cliente@demo.com', rol: 'CLIENTE', activo: true },
];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  BODEGA: 'bg-blue-100 text-blue-700',
  CAJERO: 'bg-green-100 text-green-700',
  MOSTRADOR: 'bg-purple-100 text-purple-700',
  CLIENTE: 'bg-gray-100 text-gray-700',
};

export default function AdminUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter((u) =>
    u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.nombre}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={roleColors[user.rol]}>{user.rol}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
