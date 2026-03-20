"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Download,
  Settings,
  LogOut,
  Plus,
  MapPin,
  Calculator,
  UserCheck,
} from "lucide-react";
import { cn } from "@spezo/ui";
import { LogoWithText } from "@/components/logo";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses", icon: Receipt, label: "Belege" },
  { href: "/upload", icon: Upload, label: "Beleg erfassen" },
  { href: "/exports", icon: Download, label: "Exporte" },
  { href: "/km-log", icon: MapPin, label: "Kilometer-Log" },
  { href: "/mwst", icon: Calculator, label: "MwSt-Abrechnung" },
  { href: "/treuhander", icon: UserCheck, label: "Treuhänder" },
  { href: "/settings", icon: Settings, label: "Einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-emerald-300 flex flex-col h-screen fixed left-0 top-0 z-30" style={{ background: "linear-gradient(180deg, #6ee7b7 0%, #a7f3d0 40%, #d1fae5 100%)" }}>
      {/* Logo */}
      <div className="p-5 border-b border-emerald-300">
        <LogoWithText iconSize={34} textSize="md" />
        <p className="text-xs text-emerald-700 mt-1 ml-11">Schweizer Buchhaltung</p>
      </div>

      {/* Quick add button */}
      <div className="px-4 py-3">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Beleg erfassen
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
              pathname === href
                ? "bg-emerald-500 text-white font-semibold"
                : "text-emerald-900 hover:bg-emerald-200/60 hover:text-emerald-900"
            )}
          >
            <Icon className={cn("h-5 w-5 flex-shrink-0", pathname === href ? "text-white" : "text-emerald-700")} />
            {label}
            {pathname === href && (
              <div className="ml-auto w-1.5 h-5 rounded-full bg-white" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-emerald-300">
        <button
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
