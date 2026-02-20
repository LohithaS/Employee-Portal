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
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "hidden gradient-sidebar text-sidebar-foreground md:flex md:flex-col transition-all duration-300 relative",
        collapsed ? "md:w-[68px]" : "md:w-64"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

        <div className={cn(
          "flex h-16 items-center border-b border-white/[0.08] relative z-10",
          collapsed ? "px-3 justify-center" : "px-5 justify-between"
        )}>
          <div className="flex items-center gap-2.5 font-semibold overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!collapsed && <span className="text-lg font-heading tracking-tight text-white whitespace-nowrap">Nexus</span>}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-white/50 hover:text-white hover:bg-white/10"
              onClick={onToggle}
              data-testid="button-toggle-sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center py-3 border-b border-white/[0.08] relative z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
              onClick={onToggle}
              data-testid="button-toggle-sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 py-3 relative z-10">
          <nav className="grid gap-0.5 px-2">
            {sidebarItems.map((item, index) => {
              const isActive = location === item.href;
              const linkContent = (
                <Link key={index} href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    isActive 
                      ? "bg-white/[0.12] text-white shadow-sm shadow-black/10" 
                      : "text-white/60 hover:text-white hover:bg-white/[0.07]",
                    collapsed && "justify-center px-2"
                  )}>
                    <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-indigo-300")} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </a>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/[0.08] p-3 relative z-10">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <div>
                  <div className="font-medium">{user?.name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{user?.role || "Employee"}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.06] p-3">
              <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate text-white">{user?.name || "User"}</span>
                <span className="text-xs text-white/50">{user?.role || "Employee"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
