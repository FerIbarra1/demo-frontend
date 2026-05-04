import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal Header */}
      <header className="px-6 md:px-12 py-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Image
            src="/Logo.png"
            alt="Punto Textil Mayoreo"
            width={500}
            height={500}
            className="h-15 w-auto md:h-15 object-contain object-center transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 px-6 md:px-12">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Punto Textil Mayoreo. Todos los derechos reservados.
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
