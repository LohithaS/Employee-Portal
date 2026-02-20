import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className="flex flex-col flex-1 min-h-screen"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 0% 0%, rgba(99, 102, 241, 0.18), transparent 50%),
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(139, 92, 246, 0.15), transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(59, 130, 246, 0.12), transparent 50%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(236, 72, 153, 0.08), transparent 50%),
            linear-gradient(135deg, #ffffff 0%, #eef2ff 25%, #f5f3ff 50%, #fdf2f8 75%, #eff6ff 100%)
          `,
        }}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
