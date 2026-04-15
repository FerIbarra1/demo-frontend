"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "@/lib/hooks";
import { getDashboardPath } from "@/lib/hooks/useProtectedRoute";
import { useAuthStore } from "@/lib/stores/auth";
import { ApiError } from "@/lib/types";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, _hasHydrated, user } = useAuthStore();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const register = useRegister();

  // Handle redirect if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      // Priority: 1. URL search param, 2. localStorage, 3. Dashboard based on role
      const searchRedirect = searchParams.get("redirect");
      const storedRedirect = localStorage.getItem("redirectAfterLogin");

      let targetPath = searchRedirect || storedRedirect || "/";

      // If target is root or login, use role-based dashboard
      if (targetPath === "/" || targetPath === "/login" || targetPath === "/registro") {
        const dashboard = getDashboardPath(user.rol);
        if (dashboard) targetPath = dashboard;
      }

      localStorage.removeItem("redirectAfterLogin");
      router.push(targetPath);
    }
  }, [_hasHydrated, isAuthenticated, user, router, searchParams]);

  // Backend requiere mínimo 6 caracteres (ajustado a los requisitos reales)
  const passwordRequirements = [
    { label: "Mínimo 6 caracteres", met: formData.password.length >= 6 },
    { label: "Al menos una letra", met: /[a-zA-Z]/.test(formData.password) },
    { label: "Al menos un número", met: /[0-9]/.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.nombre || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("La contraseña no cumple con los requisitos mínimos");
      return;
    }

    // Llamada a la API
    register.mutate(
      {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        password: formData.password,
      },
      {
        onError: (err: ApiError | any) => {
          // Manejar errores específicos del backend
          const message = err?.message || err?.response?.data?.message || "Error al crear cuenta";
          if (message.includes("email") && message.includes("registrado")) {
            setError("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
          } else if (message.includes("password") || message.includes("contraseña")) {
            setError("La contraseña no cumple con los requisitos. Debe tener al menos 6 caracteres.");
          } else {
            setError(message);
          }
        },
      }
    );
  };

  const isLoading = register.isPending;

  if (!_hasHydrated || (isAuthenticated && user)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-serif text-lg italic"
        >
          Preparando tu sesión...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
          Crear cuenta
        </h1>
        <p className="text-muted-foreground">
          Únete y comienza a descubrir nuestro catálogo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre Field */}
        <div className="space-y-2">
          <Label
            htmlFor="nombre"
            className="text-sm font-medium text-foreground"
          >
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nombre: e.target.value }))
            }
            className="h-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Apellido Field */}
        <div className="space-y-2">
          <Label
            htmlFor="apellido"
            className="text-sm font-medium text-foreground"
          >
            Apellido <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="apellido"
            placeholder="Tu apellido"
            value={formData.apellido}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, apellido: e.target.value }))
            }
            className="h-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Correo electrónico <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="h-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {/* Teléfono Field */}
        <div className="space-y-2">
          <Label
            htmlFor="telefono"
            className="text-sm font-medium text-foreground"
          >
            Teléfono <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="+1 234 567 890"
            value={formData.telefono}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, telefono: e.target.value }))
            }
            className="h-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
            disabled={isLoading}
            autoComplete="tel"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="h-12 pr-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="pt-2 space-y-1.5">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    req.met ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                      req.met ? "bg-green-600 text-white" : "bg-muted"
                    }`}
                  >
                    {req.met && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirmar contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="h-12 pr-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium text-base transition-all group"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          Al crear una cuenta, aceptas nuestros{" "}
          <Link
            href="/terminos"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Términos de servicio
          </Link>{" "}
          y{" "}
          <Link
            href="/privacidad"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Política de privacidad
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground">o</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="font-medium text-foreground hover:text-foreground/70 underline underline-offset-4 transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function RegisterSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
          Crear cuenta
        </h1>
        <p className="text-muted-foreground">
          Únete y comienza a descubrir nuestro catálogo
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}
