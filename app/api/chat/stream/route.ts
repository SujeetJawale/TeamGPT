import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
// export const runtime = "edge"; // optional

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, workspaceId, aiTempId } = await req.json();

  const chatMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

      // Save final assistant message
      let saved = null;
      try {
        saved = await prisma.message.create({
          data: {
            role: "assistant",
            content: aiReply,
            workspaceId,
          },
          include: {
            user: { select: { id: true, name: true, image: true } }, // will be null for assistant
          },
        });
      } catch (err) {
        console.error("Failed to save AI reply:", err);
      }

      // Broadcast final assistant message to everyone (including sender)
      // Include aiTempId so clients can replace optimistic stream bubble
      try {
        if (saved) {
          await pusherServer.trigger(`workspace-${workspaceId}`, "new-message", {
            ...saved,
            tempId: aiTempId, // 👈 critical for replacement
          });
        }
      } catch (err) {
        console.error("Pusher trigger (assistant) failed:", err);
      }

      controller.close();
    },
  });

  return new NextResponse(readableStream);
}
