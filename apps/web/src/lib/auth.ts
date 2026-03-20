import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@spezo/db/client";
import type { Role } from "@spezo/db/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  providers: [
    // Email / Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        });

        if (!user?.hashedPassword) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role as Role,
        };
      },
    }),

    // Magic link
    EmailProvider({
      server: process.env.EMAIL_SERVER ?? "",
      from: process.env.EMAIL_FROM ?? "noreply@spezo.ch",
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as { tenantId: string }).tenantId;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  events: {
    // Create tenant automatically on first sign-up via magic link
    async createUser({ user }) {
      if (!user.email) return;

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { tenant: true },
      });

      if (existingUser?.tenantId) return; // already has tenant

      // Create default tenant
      const slug = user.email
        .split("@")[0]!
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);

      const tenant = await prisma.tenant.create({
        data: {
          name: user.name ?? user.email.split("@")[0] ?? "My Business",
          slug: `${slug}-${Date.now()}`,
          plan: "TRIAL",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id, role: "OWNER" },
      });
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
