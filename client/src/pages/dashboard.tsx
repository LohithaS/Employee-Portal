import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  FileText, 
  MoreHorizontal, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Meeting, Client, Reimbursement, Task } from "@shared/schema";
import { useLocation } from "wouter";

const data = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 3200 },
  { name: "Jun", total: 4500 },
  { name: "Jul", total: 4100 },
];

function isTodayIST(dateStr: string): boolean {
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayStr = istNow.toISOString().slice(0, 10);

  const meetingDate = new Date(dateStr);
  const istMeeting = new Date(meetingDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const meetingStr = istMeeting.toISOString().slice(0, 10);

  return todayStr === meetingStr;
}

function getInitials(title: string): string {
  return title.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: reimbursements = [] } = useQuery<Reimbursement[]>({
    queryKey: ["/api/reimbursements"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  const pendingReimbursements = reimbursements.filter((r) => r.status === "Pending");

  const todayMeetings = meetings
    .filter((m) => isTodayIST(m.date))
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </Button>
          <Button size="sm">Download Report</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/crm")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} completed
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Reached</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">
              +4% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>
              Monthly revenue overview for the current fiscal year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>
              {todayMeetings.length > 0
                ? `You have ${todayMeetings.length} meeting${todayMeetings.length > 1 ? "s" : ""} scheduled for today.`
                : "No meetings scheduled for today."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {todayMeetings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No meetings today</p>
              ) : (
                todayMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center" data-testid={`dashboard-meeting-${meeting.id}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(meeting.title)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.time} IST {meeting.location ? `• ${meeting.location}` : ""}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">Today</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>Tasks requiring your attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      className="mt-1"
                      checked={task.status === "Completed"}
                      disabled
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm font-medium leading-none ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.description}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {task.status === "Completed" ? "Completed" : `Due ${task.deadline ? new Date(task.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "N/A"}`}
                      </p>
                      <Badge
                        variant={task.priority === "High" ? "secondary" : "outline"}
                        className={`w-fit text-[10px] px-1 py-0 h-5 ${task.priority === "High" ? "bg-red-100 text-red-800" : task.priority === "Medium" ? "bg-amber-100 text-amber-800" : ""}`}
                      >
                        {task.priority} Priority
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Pending Reimbursements</CardTitle>
            <CardDescription>Recent expense claims.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReimbursements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending reimbursements</p>
              ) : (
                pendingReimbursements.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date ? new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "No date"} • EXP-{String(item.id).padStart(3, "0")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">₹{Number(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>Reports waiting for approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Monthly Sales Report", author: "Sarah J.", status: "Review" },
                { name: "IT Infrastructure Audit", author: "Mike T.", status: "Pending" },
                { name: "Employee Satisfaction", author: "HR Dept", status: "Review" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-muted-foreground">By {item.author}</p>
                  </div>
                  <Badge variant={item.status === "Review" ? "secondary" : "outline"} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
