import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
// Add this import at the top:
import type { Membership, User } from "@prisma/client";

// =======================================================
// GET /api/workspaces/[id]/members
// → Returns all members of a workspace + info about current user
// =======================================================
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const meId = (session.user as any).id;

  // Ensure requester is a member
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: meId, workspaceId: id } },
  });

  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Fetch all members for this workspace
  const rows = await prisma.membership.findMany({
    where: { workspaceId: id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const members = rows.map((m: Membership & { user: Pick<User, "id" | "name" | "email"> }) => ({
    membershipId: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: (m.role as any) ?? "member",
  }));

  return NextResponse.json({
    members,
    me: { userId: meId, role: (membership.role as any) ?? "member" },
  });
}

// =======================================================
// DELETE /api/workspaces/[id]/members
// → Admin/Owner removes another user from workspace
// =======================================================
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const meId = (session.user as any).id;

  const body = await req.json().catch(() => ({}));
  const targetUserId = body?.userId as string | undefined;

  if (!targetUserId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  // Verify current user membership
  const me = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: meId, workspaceId: id } },
  });

  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Must be owner or admin
  const isAdmin = me.role === "owner" || me.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (targetUserId === meId) return NextResponse.json({ error: "cannot remove yourself" }, { status: 400 });

  // Check target member exists
  const target = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId: id } },
  });

  if (!target) return NextResponse.json({ error: "not a member" }, { status: 404 });

  // Prevent removing another owner
  if (target.role === "owner") return NextResponse.json({ error: "cannot remove owner" }, { status: 400 });

  // Delete target membership
  await prisma.membership.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId: id } },
  });

  return NextResponse.json({ success: true });
}
