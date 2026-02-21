import { useState } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { Header } from "./header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-h-screen relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              top: '-10%',
              left: '-5%',
              animation: 'blob-float-1 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
              top: '40%',
              right: '-8%',
              animation: 'blob-float-2 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              bottom: '-5%',
              left: '30%',
              animation: 'blob-float-3 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
              top: '20%',
              left: '50%',
              animation: 'blob-float-2 25s ease-in-out infinite',
            }}
          />
        </div>
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative z-[1]">
          {children}
        </main>
      </div>
    </div>
  );
}
