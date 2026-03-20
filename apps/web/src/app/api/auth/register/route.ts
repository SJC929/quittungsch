import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@spezo/db/client";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const { email, password, name } = RegisterSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create tenant + user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const slug = email
        .split("@")[0]!
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);

      const tenant = await tx.tenant.create({
        data: {
          name: name ?? email.split("@")[0] ?? "My Business",
          slug: `${slug}-${Date.now()}`,
          plan: "TRIAL",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Seed default categories
      await tx.category.createMany({
        data: [
          { tenantId: tenant.id, name: "Essen & Getränke", color: "#F97316", icon: "utensils", isDefault: true },
          { tenantId: tenant.id, name: "Benzin / Transport", color: "#3B82F6", icon: "car", isDefault: true },
          { tenantId: tenant.id, name: "Büromaterial", color: "#8B5CF6", icon: "briefcase", isDefault: true },
          { tenantId: tenant.id, name: "Telefon / Internet", color: "#06B6D4", icon: "phone", isDefault: true },
          { tenantId: tenant.id, name: "Unterkunft", color: "#EC4899", icon: "home", isDefault: true },
          { tenantId: tenant.id, name: "Versicherung", color: "#10B981", icon: "shield", isDefault: true },
          { tenantId: tenant.id, name: "Weiterbildung", color: "#F59E0B", icon: "graduation-cap", isDefault: true },
          { tenantId: tenant.id, name: "Diverses", color: "#6B7280", icon: "tag", isDefault: true },
        ],
      });

      const user = await tx.user.create({
        data: {
          email,
          name: name ?? email.split("@")[0],
          hashedPassword,
          tenantId: tenant.id,
          role: "OWNER",
        },
      });

      return { user, tenant };
    });

    return NextResponse.json({
      message: "Account created successfully",
      userId: result.user.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[Register] Error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
