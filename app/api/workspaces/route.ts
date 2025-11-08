import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const workspaces = await prisma.workspace.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || name.trim().length < 2) return NextResponse.json({ error: "invalid name" }, { status: 400 });

  const userId = (session.user as any).id;
  const code = randomBytes(6).toString("hex"); // 12-char invite code
  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      inviteCode: code,
      memberships: { create: { userId, role: "owner" } },
    },
  });

  return NextResponse.json(workspace);
}
