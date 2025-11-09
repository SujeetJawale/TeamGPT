import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// ✅ DELETE workspace (for all members)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 1️⃣ Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { memberships: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "workspace not found" }, { status: 404 });
    }

    // 2️⃣ Check if the current user is the owner
    const membership = workspace.memberships.find(
      (m: { userId: string; role?: string }) => m.userId === userId
    );
    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // 3️⃣ Delete the workspace
    await prisma.workspace.delete({
      where: { id },
    });
    // 4️⃣ Optionally, broadcast deletion event via Pusher (if needed)
    await pusherServer.trigger("workspaces", "workspace-deleted", { id });

    // Prisma will cascade delete messages + memberships automatically
    // because of `onDelete: Cascade`

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
