import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-col flex-1 min-h-screen elegant-bg">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative z-[1]">
          {children}
        </main>
      </div>
    </div>
  );
}
