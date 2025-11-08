import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// export const runtime = "edge"; // ✅ faster streaming performance

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, workspaceId } = await req.json();

  // Convert messages for OpenAI format
  const chatMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini", // fast, streaming-optimized model
    messages: chatMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      let aiReply = "";

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          aiReply += content;
          controller.enqueue(encoder.encode(content));
        }
      }

      // ✅ Save assistant message in DB
      await prisma.message.create({
        data: {
          role: "assistant",
          content: aiReply,
          workspaceId,
        },
      });

      // ✅ Broadcast via Pusher for real-time sync
      await pusherServer.trigger(`workspace-${workspaceId}`, "new-message", {
        role: "assistant",
        content: aiReply,
        user: null,
      });

      controller.close();
    },
  });

  return new NextResponse(readableStream);
}
