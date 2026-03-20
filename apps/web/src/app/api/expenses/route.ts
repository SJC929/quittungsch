import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@spezo/db/client";
import { getSession } from "@/lib/auth";
import { apiRateLimit, checkRateLimit } from "@/lib/rate-limit";

const CreateExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("CHF"),
  merchantName: z.string().optional(),
  date: z.string().datetime(),
  category: z.enum([
    "RESTAURANT", "TANKSTELLE", "BUERO", "TELEFON",
    "TRANSPORT", "UNTERKUNFT", "VERSICHERUNG", "WEITERBILDUNG", "DIVERSES",
  ]),
  vatAmount: z.number().optional(),
  vatRate: z.number().optional(),
  subtotal: z.number().optional(),
  receiptType: z.enum(["KASSENBON", "RECHNUNG", "TANKBELEG", "QR_RECHNUNG", "SONSTIGE"]).default("KASSENBON"),
  paymentMethod: z.enum(["CASH", "CARD", "TWINT", "BANK_TRANSFER", "UNKNOWN"]).default("UNKNOWN"),
  lineItems: z.array(z.object({ description: z.string(), amount: z.number() })).optional(),
  notes: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  ocrRawText: z.string().optional(),
  ocrConfidence: z.number().min(0).max(1).optional(),
  ocrProvider: z.enum(["GOOGLE_VISION", "AWS_TEXTRACT", "CLAUDE", "TESSERACT", "QR", "MANUAL"]).optional(),
  needsReview: z.boolean().default(false),
});

// GET /api/expenses – list expenses for the current tenant
export async function GET(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, apiRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const category = searchParams.get("category");
  const needsReview = searchParams.get("needsReview");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");

  const where = {
    tenantId: session.user.tenantId,
    ...(category ? { category: category as "RESTAURANT" } : {}),
    ...(needsReview === "true" ? { needsReview: true } : {}),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { merchantName: { contains: search, mode: "insensitive" as const } },
            { notes: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({
    data: expenses,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/expenses – create a new expense
export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, apiRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const data = CreateExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        ...data,
        date: new Date(data.date),
        tenantId: session.user.tenantId,
        userId: session.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        entityType: "expense",
        entityId: expense.id,
        action: "create",
        changes: { amount: { after: data.amount } },
      },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[Expenses] POST error:", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
