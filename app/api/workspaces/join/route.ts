import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const userId = (session.user as any).id;

  const workspace = await prisma.workspace.findUnique({ where: { inviteCode: code } });
  if (!workspace) return NextResponse.json({ error: "invalid code" }, { status: 404 });

  // Avoid duplicate membership
  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId, workspaceId: workspace.id } },
    update: {},
    create: { userId, workspaceId: workspace.id, role: "member" },
  });

  return NextResponse.json(workspace);
}
