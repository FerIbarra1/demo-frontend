"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
  Menu,
  Minus,
  Plus,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronRight,
  Store,
  LogOut,
  Package,
  CreditCard,
  LayoutDashboard,
  Boxes,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/lib/stores/cart";
import { useAuthStore } from "@/lib/stores/auth";
import { useKioskStore } from "@/lib/stores/kioskStore";
import { RoleBasedUserMenu } from "./UserMenu";
import { StoreLocationModal } from "./StoreLocationModal";
import { useTienda } from "@/lib/hooks";
import { UserRole } from "@/lib/types";

/* ============================================
   TYPES
   ============================================ */
interface NavLink {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CartItem {
  precioCOId: number;
  cantidad: number;
  producto?: { nombre: string; imagenPrincipal?: string };
  variante?: { talla: string; color: string };
  precio?: number;
}

/* ============================================
   ROLE-BASED NAVIGATION CONFIG
   ============================================ */

const NAV_CONFIG: Record<UserRole, NavLink[]> = {
  CLIENTE: [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/nosotros", label: "Nosotros" },
  ],
  // Empleados: solo un link a su sección principal
  BODEGA: [
    { href: "/bodega", label: "Bodega" },
  ],
  CAJERO: [
    { href: "/cajero", label: "Caja" },
  ],
  MOSTRADOR: [
    { href: "/mostrador", label: "Mostrador" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/tiendas", label: "Tiendas" },
    { href: "/admin/reportes", label: "Reportes" },
  ],
};

// Default nav for non-authenticated users (customer view)
const DEFAULT_NAV: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
];

/* ============================================
   ROLE CONFIG FOR UI ELEMENTS
   ============================================ */

interface RoleConfig {
  showCart: boolean;
  showStoreSelector: boolean;
  appName: string;
  appSubtitle: string;
  logoHref: string;
}

const ROLE_CONFIG: Record<UserRole | 'default', RoleConfig> = {
  CLIENTE: {
    showCart: true,
    showStoreSelector: true,
    appName: "Demo",
    appSubtitle: "Shop",
    logoHref: "/",
  },
  BODEGA: {
    showCart: false,
    showStoreSelector: false,
    appName: "Demo",
    appSubtitle: "Bodega",
    logoHref: "/bodega",
  },
  CAJERO: {
    showCart: false,
    showStoreSelector: false,
    appName: "Demo",
    appSubtitle: "Caja",
    logoHref: "/cajero",
  },
  MOSTRADOR: {
    showCart: false,
    showStoreSelector: false,
    appName: "Demo",
    appSubtitle: "Mostrador",
    logoHref: "/mostrador",
  },
  ADMIN: {
    showCart: false,
    showStoreSelector: false,
    appName: "Demo",
    appSubtitle: "Admin",
    logoHref: "/admin",
  },
  default: {
    showCart: true,
    showStoreSelector: true,
    appName: "Demo",
    appSubtitle: "Shop",
    logoHref: "/",
  },
};

/* ============================================
   MAIN NAVBAR COMPONENT
   ============================================ */
export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Store hooks
  const { isAuthenticated, user, selectedTiendaId } = useAuthStore();
  const { isKioskMode, tiendaNombre: kioskTiendaNombre } = useKioskStore();
  const { data: currentTienda } = useTienda(selectedTiendaId || 0);

  // Atomic selectors for cart to avoid re-renders on unrelated cart changes
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.cantidad, 0),
    [cartItems]
  );
  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + (item.variante?.precio || 0) * item.cantidad, 0),
    [cartItems]
  );

  // Determine user role and config
  const userRole = user?.rol || null;
  let roleConfig = userRole ? ROLE_CONFIG[userRole] : ROLE_CONFIG.default;
  let navLinks = userRole ? NAV_CONFIG[userRole] : DEFAULT_NAV;

  // Kiosk Mode Overrides
  if (isKioskMode) {
    roleConfig = {
      ...roleConfig,
      showStoreSelector: false, // Bloqueado a la tienda configurada
      appSubtitle: kioskTiendaNombre || "Kiosko",
      logoHref: "/",
    };

    // Simplificar navegación en kiosko
    navLinks = [
      { href: "/", label: "Inicio" },
      { href: "/catalogo", label: "Catálogo" },
    ];
  }

  /* ==========================================
     EFFECTS
     ========================================== */
  // Scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* ==========================================
     HANDLERS
     ========================================== */
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Search in appropriate section based on role
        const searchBase = userRole === 'CLIENTE' || !userRole ? '/catalogo' : pathname;
        window.location.href = `${searchBase}?q=${encodeURIComponent(searchQuery)}`;
        setIsSearchOpen(false);
      }
    },
    [searchQuery, userRole, pathname],
  );

  /* ==========================================
     RENDER HELPERS
     ========================================== */
  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ========================================
          MAIN NAVBAR
          ======================================== */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/50 py-3"
            : "bg-transparent py-5",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile Menu + Nav Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "lg:hidden relative w-10 h-10",
                  "inline-flex items-center justify-center",
                  "rounded-full hover:bg-secondary/80 transition-colors duration-300",
                )}
                aria-label="Abrir menú"
                type="button"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-sm font-medium tracking-wide transition-colors duration-300 group",
                      isActive(link.href)
                        ? "text-foreground"
                        : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                        isActive(link.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full",
                      )}
                    />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center - Logo */}
            <Link
              href={roleConfig.logoHref}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group"
            >
              <Image
                src="/Logo.png"
                alt="Punto Textil Mayoreo"
                width={500}
                height={500}
                className="h-10 w-auto md:h-12 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                priority
              />
              {/* {(userRole && userRole !== "CLIENTE") || isKioskMode ? (
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-foreground-muted -mt-0.5 max-w-[220px] truncate text-center">
                  {roleConfig.appSubtitle}
                </span>
              ) : null} */}
            </Link>

            {/* Right side - Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search Button - Only for CLIENTE or non-authenticated users AND NOT in Kiosk Mode */}
              {(!userRole || userRole === 'CLIENTE') && !isKioskMode && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={cn(
                    "p-2.5 md:p-3 rounded-full transition-all duration-300 cursor-pointer",
                    "hover:bg-secondary/80 active:scale-95",
                    "inline-flex items-center justify-center",
                  )}
                  aria-label="Buscar"
                  type="button"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Store Selector - Show when has store selected and role allows it */}
              {roleConfig.showStoreSelector && selectedTiendaId && (
                <button
                  onClick={() => setIsStoreSelectorOpen(true)}
                  className={cn(
                    "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer",
                    "bg-secondary hover:bg-secondary/80 transition-colors",
                    "text-sm font-medium",
                  )}
                >
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="max-w-[100px] truncate">
                    {currentTienda?.nombre || "Tienda"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              )}

              {/* User Account - Show RoleBasedUserMenu when authenticated */}
              {isAuthenticated ? (
                <RoleBasedUserMenu />
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "hidden sm:inline-flex p-2.5 md:p-3 rounded-full transition-all duration-300",
                    "hover:bg-secondary/80 active:scale-95 items-center justify-center",
                  )}
                  aria-label="Mi cuenta"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart - Only for CLIENTE or non-authenticated (default) */}
              {roleConfig.showCart && (
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                  <SheetTrigger
                    className={cn(
                      "relative p-2.5 md:p-3 rounded-full transition-all duration-300",
                      "hover:bg-secondary/80 active:scale-95",
                      "inline-flex items-center justify-center",
                    )}
                    aria-label="Carrito de compras"
                  >
                    <ShoppingCart className="w-5 h-5 cursor-pointer" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-medium bg-foreground text-background rounded-full">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </SheetTrigger>

                  <SheetContent className="w-full sm:max-w-md flex flex-col">
                    <SheetHeader className="space-y-2.5 pb-4">
                      <SheetTitle className="font-serif text-xl">
                        Tu Carrito
                      </SheetTitle>
                      <p className="text-sm text-muted-foreground">
                        {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
                      </p>
                    </SheetHeader>

                    <Separator />

                    {cartItems.length === 0 ? (
                      <EmptyCart onContinue={() => setIsCartOpen(false)} />
                    ) : (
                      <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                          <div className="space-y-4 py-4">
                            {cartItems.map((item) => (
                              <CartItemRow
                                key={item.precioCOId}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                              />
                            ))}
                          </div>
                        </ScrollArea>

                        <div className="border-t pt-4 mt-auto space-y-4 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span className="text-lg font-semibold price">
                              ${Number(totalPrice).toFixed(2)}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Envío calculado en el checkout
                          </p>

                          <Link
                            href="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="block"
                          >
                            <Button
                              className="w-full rounded-full h-12 text-base font-medium btn-shine"
                              size="lg"
                            >
                              {isAuthenticated
                                ? "Proceder al pago"
                                : "Iniciar sesión para comprar"}
                            </Button>
                          </Link>

                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Continuar comprando
                          </button>
                        </div>
                      </>
                    )}
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================
          SEARCH OVERLAY
          ======================================== */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
        userRole={userRole}
      />

      {/* ========================================
          MOBILE MENU OVERLAY
          ======================================== */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        userName={user?.nombre}
        userRole={userRole}
        selectedTiendaId={selectedTiendaId}
        onOpenStoreSelector={() => setIsStoreSelectorOpen(true)}
        onLogout={() => useAuthStore.getState().logout()}
        showCart={roleConfig.showCart}
      />

      {/* ========================================
          STORE LOCATION MODAL
          ======================================== */}
      <StoreLocationModal
        isOpen={isStoreSelectorOpen}
        onComplete={() => setIsStoreSelectorOpen(false)}
      />
    </>
  );
}

/* ============================================
   CART ITEM ROW COMPONENT
   ============================================ */
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.precioCOId), 200);
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-3 rounded-xl bg-secondary/50 transition-all duration-200",
        isRemoving && "opacity-0 scale-95",
      )}
    >
      {/* Product Image */}
      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
        {item.producto?.imagenPrincipal ? (
          <img
            src={item.producto.imagenPrincipal}
            alt={item.producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {item.producto?.nombre || "Producto"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.variante?.talla} · {item.variante?.color}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdateQuantity(item.precioCOId, item.cantidad - 1)
              }
              className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-50"
              disabled={item.cantidad <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="w-6 text-center text-sm font-medium">
              {item.cantidad}
            </span>

            <button
              onClick={() =>
                onUpdateQuantity(item.precioCOId, item.cantidad + 1)
              }
              className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-medium price">
            ${((item.precio || 0) * item.cantidad).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors self-start"
        aria-label="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ============================================
   EMPTY CART COMPONENT
   ============================================ */
function EmptyCart({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
      </div>

      <h3 className="font-serif text-xl mb-2">Tu carrito está vacío</h3>
      <p className="text-muted-foreground text-center max-w-xs mb-6">
        Descubre nuestro catálogo de camisetas premium y encuentra tu estilo.
      </p>

      <Button variant="outline" className="rounded-full" onClick={onContinue}>
        Explorar productos
      </Button>
    </div>
  );
}

/* ============================================
   SEARCH OVERLAY COMPONENT
   ============================================ */
function SearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSubmit,
  userRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  userRole: UserRole | null;
}) {
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById("search-input");
      input?.focus();
    }
  }, [isOpen]);

  // Role-based search suggestions
  const getSearchSuggestions = () => {
    if (userRole === 'BODEGA') {
      return ["Pedido #1234", "Stock bajo", "Producto XYZ"];
    }
    if (userRole === 'CAJERO') {
      return ["Pago pendiente", "Transferencia", "Efectivo"];
    }
    if (userRole === 'MOSTRADOR') {
      return ["Pedido listo", "Entrega hoy", "Cliente Juan"];
    }
    return ["Camisetas básicas", "Polos", "Edición limitada", "Ofertas"];
  };

  const suggestions = getSearchSuggestions();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-background/98 backdrop-blur-md transition-all duration-500",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl">Buscar</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={onSubmit}>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              id="search-input"
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border focus:border-foreground py-4 pl-10 pr-4 text-2xl sm:text-3xl font-light outline-none transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Presiona{" "}
            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
              Enter
            </kbd>{" "}
            para buscar o{" "}
            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
              ESC
            </kbd>{" "}
            para cerrar
          </p>
        </form>

        {/* Quick Links */}
        <div className="mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Búsquedas populares
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((term) => (
              <button
                key={term}
                onClick={() => onSearchChange(term)}
                className="px-4 py-2 rounded-full bg-secondary text-sm hover:bg-secondary/80 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MOBILE MENU COMPONENT
   ============================================ */
function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  isActive,
  isAuthenticated,
  userName,
  userRole,
  selectedTiendaId,
  onOpenStoreSelector,
  onLogout,
  showCart,
}: {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  userName?: string;
  userRole?: UserRole | null;
  selectedTiendaId?: number | null;
  onOpenStoreSelector?: () => void;
  onLogout?: () => void;
  showCart?: boolean;
}) {
  // Role-specific footer items
  const getRoleIcon = (role?: UserRole | null) => {
    switch (role) {
      case 'BODEGA':
        return Boxes;
      case 'CAJERO':
        return CreditCard;
      case 'MOSTRADOR':
        return Package;
      case 'ADMIN':
        return LayoutDashboard;
      default:
        return Store;
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] bg-background transition-all duration-500 lg:hidden",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex flex-col h-full pt-20 px-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-4 p-2.5 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className={cn(
                  "transform transition-all duration-500",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0",
                )}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center justify-between py-4 border-b border-border/50",
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-foreground-secondary",
                  )}
                >
                  <span className="font-serif text-3xl sm:text-4xl font-light">
                    {link.label}
                  </span>
                  <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="py-6 border-t border-border/50 space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* Store Selector Button - Only for roles that need it */}
              {selectedTiendaId && userRole !== 'ADMIN' && onOpenStoreSelector && (
                <button
                  onClick={() => {
                    onOpenStoreSelector();
                    onClose();
                  }}
                  className="flex items-center gap-3 text-foreground-secondary hover:text-foreground transition-colors w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <RoleIcon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs text-muted-foreground">
                      {userRole === 'CLIENTE' ? 'Sucursal' : 'Tienda asignada'}
                    </p>
                    <span className="font-medium">Cambiar tienda</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* User Account */}
              <Link
                href="/configuracion"
                onClick={onClose}
                className="flex items-center gap-3 text-foreground-secondary hover:text-foreground transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">{userName || "Mi Cuenta"}</span>
                  <p className="text-xs text-muted-foreground">Configuración</p>
                </div>
              </Link>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center gap-3 text-destructive hover:text-destructive/80 transition-colors w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={onClose}>
                <Button
                  variant="outline"
                  className="w-full rounded-full h-12 text-base"
                  size="lg"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={onClose}>
                <Button
                  className="w-full rounded-full h-12 text-base"
                  size="lg"
                >
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
