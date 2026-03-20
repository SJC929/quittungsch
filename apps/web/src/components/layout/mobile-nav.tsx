"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Upload, Download, Settings } from "lucide-react";
import { cn } from "@spezo/ui";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/expenses", icon: Receipt, label: "Belege" },
  { href: "/upload", icon: Upload, label: "Erfassen", primary: true },
  { href: "/exports", icon: Download, label: "Export" },
  { href: "/settings", icon: Settings, label: "Einst." },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href;

          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-5"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                  isActive
                    ? "bg-emerald-800 shadow-emerald-200"
                    : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200"
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-700 mt-1">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-0"
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-emerald-700" : "text-gray-400"
              )} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive ? "text-emerald-700" : "text-gray-400"
              )}>
                {label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
