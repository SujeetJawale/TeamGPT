import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const meId = (session.user as any).id;

  const me = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: meId, workspaceId: id } },
  });
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // If owner, ensure there's another owner/admin before leaving
  if (me.role === "owner") {
    const owners = await prisma.membership.count({
      where: { workspaceId: id, role: "owner" },
    });
    if (owners <= 1) {
      return NextResponse.json(
        { error: "You are the only owner. Transfer ownership before leaving." },
        { status: 400 }
      );
    }
  }

  await prisma.membership.delete({
    where: { userId_workspaceId: { userId: meId, workspaceId: id } },
  });

  return NextResponse.json({ success: true });
}
