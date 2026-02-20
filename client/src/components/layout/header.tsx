import { useState } from "react";
import { Bell, Menu, CheckCircle, Clock, Calendar, AlertTriangle, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: string;
  link?: string;
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return "Today";
    if (futureDays === 1) return "Tomorrow";
    return `In ${futureDays} days`;
  }
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "task": return <Clock className="h-3.5 w-3.5 text-blue-500" />;
    case "meeting": return <Calendar className="h-3.5 w-3.5 text-purple-500" />;
    case "leave": return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    case "reimbursement": return <FileText className="h-3.5 w-3.5 text-amber-500" />;
    case "approval": return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
    default: return <Briefcase className="h-3.5 w-3.5 text-slate-500" />;
  }
}

export function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const processedNotifications = notifications.map(n => ({
    ...n,
    read: n.read || readIds.has(n.id),
  }));

  const unreadCount = processedNotifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const markRead = (id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  const handleNotificationClick = (n: Notification) => {
    markRead(n.id);
    if (n.link) {
      setLocation(n.link);
    }
  };

  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 gradient-header px-6">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-muted/80" data-testid="button-notifications">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-xl shadow-xl border-border/50" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-primary hover:text-primary" onClick={markAllRead} data-testid="button-mark-all-read">
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {processedNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">You'll see updates here as they happen</p>
                </div>
              ) : (
                processedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/[0.04]" : ""}`}
                    onClick={() => handleNotificationClick(n)}
                    data-testid={`notification-${n.id}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                      <div className="flex items-start gap-2 flex-1">
                        <span className="mt-0.5 flex-shrink-0">{getNotificationIcon(n.type)}</span>
                        <div className={!n.read ? "" : "ml-0"}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                          <p className="text-[11px] text-muted-foreground/70 mt-1">{formatTimeAgo(n.time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {processedNotifications.length > 0 && (
              <div className="border-t px-4 py-2 text-center">
                <span className="text-xs text-muted-foreground">{processedNotifications.length} notification{processedNotifications.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                <AvatarFallback className="gradient-primary text-white font-semibold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="gradient-primary text-white font-semibold text-sm">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user?.role || "Employee"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation("/settings?tab=profile")} data-testid="menu-profile" className="cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings" className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
