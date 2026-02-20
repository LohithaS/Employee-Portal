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
            radial-gradient(ellipse 80% 60% at 0% 0%, rgba(30, 27, 75, 0.25), transparent 50%),
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(88, 28, 135, 0.20), transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(15, 23, 42, 0.18), transparent 50%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(67, 56, 202, 0.12), transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #1a1a2e 50%, #16213e 75%, #0f172a 100%)
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
