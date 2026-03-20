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
    <aside
      className="w-64 flex flex-col h-screen fixed left-0 top-0 z-30"
      style={{ background: "linear-gradient(180deg, #0a1f14 0%, #0d2318 100%)" }}
    >
      {/* Logo section */}
      <div className="px-5 py-6 border-b border-white/10">
        <LogoWithText iconSize={36} textSize="md" variant="white" />
        <p className="text-xs text-emerald-400/80 mt-1.5 ml-[calc(36px+12px)] font-medium tracking-wide uppercase">
          Schweizer Buchhaltung
        </p>
      </div>

      {/* Quick add button */}
      <div className="px-4 py-4">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg shadow-emerald-900/40"
        >
          <Plus className="h-4 w-4" />
          Beleg erfassen
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === href
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-gray-400 hover:bg-white/8 hover:text-gray-200"
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] flex-shrink-0",
                pathname === href ? "text-emerald-400" : "text-gray-500"
              )}
            />
            {label}
            {pathname === href && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom: plan badge + logout */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400">Plan</p>
          <p className="text-sm font-semibold text-emerald-400">Free Trial</p>
        </div>
        <button
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
