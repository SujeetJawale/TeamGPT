export const revalidate = 0; // disable static cache for this page
export const dynamic = "force-dynamic"; // always render fresh
import ChatWindow from "@/app/components/ChatWindow";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import WorkspaceHeader from "@/app/components/WorkspaceHeader";

export default async function WorkspaceChat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    select: { name: true, inviteCode: true },
  });

  return (
    <main className='h-[calc(100vh-180px)] flex flex-col scrollbar-hide'>
      <WorkspaceHeader
        id={id}
        name={workspace?.name}
        inviteCode={workspace?.inviteCode}
        userName={session?.user?.name ?? "User"}
      />
      <ChatWindow workspaceId={id} />
    </main>
  );
}
