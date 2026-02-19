import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CheckSquare, 
  Users, 
  UserPlus,
  Wrench,
  FileText, 
  Calendar,
  Plane, 
  Receipt, 
  CalendarOff, 
  Banknote, 
  BarChart3, 
  Building, 
  Settings 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: CheckSquare, label: "Task Management", href: "/tasks" },
  { icon: Users, label: "CRM", href: "/crm" },
  { icon: UserPlus, label: "Lead Management", href: "/leads" },
  { icon: Wrench, label: "Service Management", href: "/service" },
  { icon: Calendar, label: "Meeting Management", href: "/meetings" },
  { icon: FileText, label: "Minutes of Meeting", href: "/mom" },
  { icon: Plane, label: "Business Trip Reports", href: "/trips" },
  { icon: Receipt, label: "Reimbursements", href: "/reimbursements" },
  { icon: CalendarOff, label: "Leave Management", href: "/leaves" },
  { icon: Banknote, label: "Salary Slip", href: "/salary" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Building, label: "Company Information", href: "/company" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden border-r bg-sidebar text-sidebar-foreground md:flex md:w-64 md:flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Building className="h-4 w-4" />
          </div>
          <span className="text-lg font-heading tracking-tight">Nexus</span>
        </div>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item, index) => {
            const isActive = location === item.href;
            return (
              <Link key={index} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/50 p-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary">{getInitials(user?.name)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "User"}</span>
            <span className="text-xs text-sidebar-foreground/60">{user?.role || "Employee"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
