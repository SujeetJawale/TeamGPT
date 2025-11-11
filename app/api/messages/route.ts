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

  const socketId = req.headers.get("x-socket-id") ?? undefined;
  const body = await req.json();
  const { role, content, workspaceId, tempId } = body;
  const userId = (session.user as any)?.id ?? null;

  if (!workspaceId || !content?.trim()) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // 1️⃣ Save message in DB
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

  // 2️⃣ Broadcast to others (not sender)

  try {
    // ✅ Only broadcast human/user messages
    if (role === "user") {
      await pusherServer.trigger(
        `workspace-${workspaceId}`,
        "new-message",
        {
          ...message,
          tempId,
        },
        { socket_id: socketId }
      );
    }
  } catch (err) {
    console.error("❌ Pusher trigger failed:", err);
  }

  // 3️⃣ Return message to sender
  return NextResponse.json({ ...message, tempId });
}
