'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toNumber } from '@/lib/types';

interface ErrorDisplayProps {
  error?: Error | null;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
        </div>
        <CardDescription>
          {message || error?.message || 'Ocurrió un error al cargar la información. Por favor intenta de nuevo.'}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// Helper para validar que los datos sean un array
export function validateArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data === null || data === undefined) {
    return [];
  }
  // Si es un objeto con una propiedad data que es array
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }
  }
  return [];
}

// Hook para manejar datos de API de forma segura
export function useSafeData<T>(data: unknown): {
  items: T[];
  isEmpty: boolean;
  count: number;
} {
  const items = validateArray<T>(data);
  return {
    items,
    isEmpty: items.length === 0,
    count: items.length,
  };
}

// Helper para normalizar productos (convertir precios a números)
export function normalizeProducto(producto: any) {
  if (!producto) return null;
  return {
    ...producto,
    precioBase: toNumber(producto.precioBase),
    precioOferta: producto.precioOferta ? toNumber(producto.precioOferta) : undefined,
    variantes: Array.isArray(producto.variantes)
      ? producto.variantes.map((v: any) => ({
          ...v,
          precio: toNumber(v.precio),
        }))
      : [],
  };
}

// Helper para normalizar pedidos (convertir totales a números)
export function normalizePedido(pedido: any) {
  if (!pedido) return null;
  return {
    ...pedido,
    subtotal: toNumber(pedido.subtotal),
    descuento: toNumber(pedido.descuento),
    impuestos: toNumber(pedido.impuestos),
    total: toNumber(pedido.total),
    items: Array.isArray(pedido.items)
      ? pedido.items.map((item: any) => ({
          ...item,
          precioUnitario: toNumber(item.precioUnitario),
          subtotal: toNumber(item.subtotal),
        }))
      : [],
  };
}
