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
import { cn } from "@quittungsch/ui";

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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-emerald-700">QuittungsCH</h1>
        <p className="text-xs text-gray-400 mt-0.5">Schweizer Buchhaltung</p>
      </div>

      {/* Quick add button */}
      <div className="px-4 py-3">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Beleg erfassen
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
