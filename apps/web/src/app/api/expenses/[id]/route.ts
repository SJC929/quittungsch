import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@quittungsch/db/client";
import { getSession } from "@/lib/auth";

const UpdateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  merchantName: z.string().optional(),
  date: z.string().datetime().optional(),
  category: z.enum(["RESTAURANT", "TANKSTELLE", "BUERO", "TELEFON", "TRANSPORT", "UNTERKUNFT", "VERSICHERUNG", "WEITERBILDUNG", "DIVERSES"]).optional(),
  vatAmount: z.number().optional(),
  vatRate: z.number().optional(),
  subtotal: z.number().optional(),
  receiptType: z.enum(["KASSENBON", "RECHNUNG", "TANKBELEG", "QR_RECHNUNG", "SONSTIGE"]).optional(),
  paymentMethod: z.enum(["CASH", "CARD", "TWINT", "BANK_TRANSFER", "UNKNOWN"]).optional(),
  notes: z.string().optional(),
  needsReview: z.boolean().optional(),
}).partial();

// GET /api/expenses/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await prisma.expense.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId },
  });

  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: expense });
}

// PATCH /api/expenses/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const existing = await prisma.expense.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json() as unknown;
    const data = UpdateExpenseSchema.parse(body);

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        entityType: "expense",
        entityId: params.id,
        action: "update",
        changes: data,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.expense.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "expense",
      entityId: params.id,
      action: "delete",
    },
  });

  return NextResponse.json({ message: "Deleted" });
}
