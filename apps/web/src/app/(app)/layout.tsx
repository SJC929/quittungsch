import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@spezo/db/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CameraPermissionGate } from "@/components/camera-permission-intro";
import type { SupportedLanguage } from "@spezo/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { preferredLanguage: true },
  });

  const lang = (tenant?.preferredLanguage ?? "de") as SupportedLanguage;

  return (
    <CameraPermissionGate language={lang}>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar – hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
          <Topbar currentLanguage={lang} />
          <main className="flex-1 overflow-auto pb-20 lg:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </CameraPermissionGate>
  );
}
