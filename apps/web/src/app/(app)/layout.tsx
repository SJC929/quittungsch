import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@quittungsch/db/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <Topbar currentLanguage={tenant?.preferredLanguage ?? "de"} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
