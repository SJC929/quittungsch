import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@quittungsch/db/client";
import { getSession } from "@/lib/auth";

const OnboardingSchema = z.object({
  businessName: z.string().min(1).optional(),
  uid: z.string().optional(),
  preferredExportFormat: z.enum(["EXCEL", "CSV", "PDF", "GOOGLE_SHEETS"]).optional(),
  language: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const data = OnboardingSchema.parse(body);

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      ...(data.businessName ? { name: data.businessName } : {}),
      ...(data.uid ? { uid: data.uid } : {}),
      ...(data.preferredExportFormat ? { preferredExportFormat: data.preferredExportFormat } : {}),
      ...(data.language ? { preferredLanguage: data.language } : {}),
    },
  });

  return NextResponse.json({ message: "Onboarding complete" });
}
