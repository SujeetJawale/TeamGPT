import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const updated = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name },
  });
  return NextResponse.json(updated);
}
