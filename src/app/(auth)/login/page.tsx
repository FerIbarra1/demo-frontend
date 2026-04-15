"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { loginSchema, LoginFormData } from "@/lib/schemas/auth";
import { useLogin } from "@/lib/hooks";
import { getDashboardPath } from "@/lib/hooks/useProtectedRoute";
import { useAuthStore } from "@/lib/stores/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "";
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error } = useLogin();
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (redirect) {
      localStorage.setItem("redirectAfterLogin", redirect);
    }
  }, [redirect]);

  // Handle redirect if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      // Priority: 1. URL search param, 2. localStorage, 3. Dashboard based on role
      const searchRedirect = searchParams.get("redirect");
      const storedRedirect = localStorage.getItem("redirectAfterLogin");

      let targetPath = searchRedirect || storedRedirect || "/";

      // If target is root or login, use role-based dashboard
      if (targetPath === "/" || targetPath === "/login") {
        const dashboard = getDashboardPath(user.rol);
        if (dashboard) targetPath = dashboard;
      }

      localStorage.removeItem("redirectAfterLogin");
      router.push(targetPath);
    }
  }, [_hasHydrated, isAuthenticated, user, router, searchParams]);

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

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
          Bienvenido de nuevo
        </h1>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            className="h-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              className="h-12 pr-12 bg-card border-border/50 focus:border-foreground focus:ring-foreground/20 transition-all"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20"
          >
            <AlertDescription>
              {(error as unknown as Error)?.message || "Error al iniciar sesión"}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium text-base transition-all group"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
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

      {/* Register Link */}
      <div className="text-center">
        <p className="text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link
            href={
              redirect
                ? `/registro?redirect=${encodeURIComponent(redirect)}`
                : "/registro"
            }
            className="font-medium text-foreground hover:text-foreground/70 underline underline-offset-4 transition-colors"
          >
            Crear cuenta
          </Link>
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="pt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Conexión segura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Datos protegidos</span>
        </div>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
          Bienvenido de nuevo
        </h1>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
