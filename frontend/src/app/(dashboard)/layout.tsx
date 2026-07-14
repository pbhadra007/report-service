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
          <main
            id="dashboard-scroll-area"
            className="flex-1 overflow-auto p-6 pb-20 lg:pb-6"
            style={{ background: "linear-gradient(135deg, #fef5f5 0%, #fce8e8 50%, #fef5f5 100%)" }}
          >
            {children}
            <Footer />
          </main>
          <BackToTopButton />
        </div>
      </div>
    </div>
  );
}
