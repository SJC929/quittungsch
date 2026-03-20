/**
 * KilometerLog API – Phase 2 (scaffold)
 * UI not yet built, API is functional.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@spezo/db/client";
import { getSession } from "@/lib/auth";

const CreateKmLogSchema = z.object({
  date: z.string().datetime(),
  fromLocation: z.string().min(1),
  toLocation: z.string().min(1),
  distanceKm: z.number().positive(),
  purpose: z.string().optional(),
  ratePerKm: z.number().positive().default(0.70),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const logs = await prisma.kilometerLog.findMany({
    where: {
      tenantId: session.user.tenantId,
      ...(dateFrom || dateTo ? { date: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      }} : {}),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ data: logs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as unknown;
    const data = CreateKmLogSchema.parse(body);

    const log = await prisma.kilometerLog.create({
      data: {
        ...data,
        date: new Date(data.date),
        totalAmount: data.distanceKm * data.ratePerKm,
        tenantId: session.user.tenantId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create KM log" }, { status: 500 });
  }
}
