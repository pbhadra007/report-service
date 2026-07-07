import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-[#F8F9FA] p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
