import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@spezo/db/client";
import { getSession } from "@/lib/auth";
import { generateExcel } from "@/lib/exports/excel";
import { generateCsv } from "@/lib/exports/csv";
import { generatePdf } from "@/lib/exports/pdf";

const ExportSchema = z.object({
  format: z.enum(["EXCEL", "CSV", "PDF", "GOOGLE_SHEETS"]),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  includeKmLogs: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as unknown;
    const { format, dateFrom, dateTo, includeKmLogs } = ExportSchema.parse(body);

    const expenses = await prisma.expense.findMany({
      where: {
        tenantId: session.user.tenantId,
        date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
      },
      orderBy: { date: "asc" },
    });

    const kmLogs = includeKmLogs
      ? await prisma.kilometerLog.findMany({
          where: {
            tenantId: session.user.tenantId,
            date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
          },
          orderBy: { date: "asc" },
        })
      : [];

    let fileBuffer: Buffer;
    let contentType: string;
    let fileName: string;

    const dateLabel = `${dateFrom.slice(0, 10)}_${dateTo.slice(0, 10)}`;

    switch (format) {
      case "EXCEL": {
        fileBuffer = await generateExcel(expenses, kmLogs);
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = `Spezo_${dateLabel}.xlsx`;
        break;
      }
      case "CSV": {
        fileBuffer = generateCsv(expenses);
        contentType = "text/csv; charset=utf-8";
        fileName = `Spezo_${dateLabel}.csv`;
        break;
      }
      case "PDF": {
        fileBuffer = await generatePdf(expenses, kmLogs, { dateFrom, dateTo });
        contentType = "application/pdf";
        fileName = `Spezo_${dateLabel}.pdf`;
        break;
      }
      case "GOOGLE_SHEETS": {
        return NextResponse.json(
          { error: "Google Sheets export requires OAuth setup. See docs." },
          { status: 501 }
        );
      }
    }

    // Log export
    await prisma.export.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        format,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        status: "done",
        fileName,
      },
    });

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[Export] Error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
