import Sidebar from "@/app/components/SideBar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-[calc(100vh-70px)]'>
      <Sidebar />
      <div className='flex-1'>{children}</div>
    </div>
  );
}
