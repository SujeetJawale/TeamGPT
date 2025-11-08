import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pusherServer } from "@/lib/pusher";

/* -------------------------- GET -------------------------- */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json([], { status: 200 });

  const messages = await prisma.message.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(messages);
}

/* -------------------------- POST -------------------------- */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { role, content, workspaceId } = await req.json();
  const userId = (session.user as any)?.id ?? null;

  // 1️⃣  Save message in DB
  const message = await prisma.message.create({
    data: {
      role,
      content,
      workspaceId,
      userId: role === "user" ? userId : null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  // 2️⃣  Broadcast event to all clients in this workspace
  try {
    await pusherServer.trigger(`workspace-${workspaceId}`, "new-message", {
      id: message.id,
      role: message.role,
      content: message.content,
      workspaceId: message.workspaceId,
      user: message.user ? { id: message.user.id, name: message.user.name, image: message.user.image } : null,
    });
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }

  // 3️⃣  Return to sender
  return NextResponse.json(message);
}
