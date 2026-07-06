import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { CobStatusBanner } from "@/components/common/CobStatusBanner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="flex h-full flex-1 flex-col">
      <Header />
      <CobStatusBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
