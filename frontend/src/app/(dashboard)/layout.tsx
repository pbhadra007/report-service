import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { Footer } from "@/components/common/Footer";
import { BackToTopButton } from "@/components/common/BackToTopButton";

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
          <main id="dashboard-scroll-area" className="flex-1 overflow-auto bg-[#F2F1EE] p-6 pb-20 lg:pb-6">
            {children}
            <Footer />
          </main>
          <BackToTopButton />
        </div>
      </div>
    </div>
  );
}
