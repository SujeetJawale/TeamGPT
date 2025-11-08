import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Sidebar from "../components/SideBar";
import Header from "../components/WorkspaceHeader";
import ChatWindow from "@/app/components/ChatWindow";

export default async function WorkspaceDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className='p-8'>
        <p>Please sign in to access your workspace.</p>
      </main>
    );
  }

  return (
    <main className='flex h-full'>
      {/* Main area */}
      <section className='flex-1 flex flex-col'>
        <Header id={session.user?.email ?? "unknown"} userName={session.user?.name} />
        <div className='flex-1 overflow-hidden'>
          <ChatWindow workspaceId={""} />
        </div>
      </section>
    </main>
  );
}
