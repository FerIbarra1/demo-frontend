'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
