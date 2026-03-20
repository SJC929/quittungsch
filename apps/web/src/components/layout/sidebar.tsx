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
} from "lucide-react";
import { cn } from "@spezo/ui";
import { LogoWithText } from "@/components/logo";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses", icon: Receipt, label: "Belege" },
  { href: "/upload", icon: Upload, label: "Beleg erfassen" },
  { href: "/exports", icon: Download, label: "Exporte" },
  { href: "/settings", icon: Settings, label: "Einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-emerald-50/70 border-r border-emerald-100 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-emerald-100">
        <LogoWithText iconSize={34} textSize="md" />
        <p className="text-xs text-gray-400 mt-1 ml-11">Schweizer Buchhaltung</p>
      </div>

      {/* Quick add button */}
      <div className="px-4 py-3">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Beleg erfassen
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
              pathname === href
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className={cn("h-5 w-5 flex-shrink-0", pathname === href ? "text-emerald-600" : "text-gray-400")} />
            {label}
            {pathname === href && (
              <div className="ml-auto w-1.5 h-5 rounded-full bg-emerald-600" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-emerald-100">
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
