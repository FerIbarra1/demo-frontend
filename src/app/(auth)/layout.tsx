import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal Header */}
      <header className="py-6 px-6 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-tight text-foreground group-hover:text-foreground/70 transition-colors">
            Demo
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 px-6 md:px-12">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo. Todos los derechos reservados.
        </p>
      </footer>

      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
