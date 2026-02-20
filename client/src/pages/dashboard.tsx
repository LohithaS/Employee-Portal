import { useState, useCallback, useMemo } from "react";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  FileText, 
  MoreHorizontal, 
  TrendingUp, 
  Users,
  Check,
  X,
  ClipboardList,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Meeting, Client, Reimbursement, Task } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

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

type PendingApprovals = {
  leaves: (any & { employeeName: string })[];
  reimbursements: (any & { employeeName: string })[];
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const isManager = user?.role === "Manager";
  const [dashboardTab, setDashboardTab] = useState("overview");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: approvals } = useQuery<PendingApprovals>({
    queryKey: ["/api/pending-approvals"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isManager,
  });

  const approveRejectLeaveMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      await apiRequest("PATCH", `/api/leave-requests/${id}`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({ title: "Leave request updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveRejectReimbursementMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      await apiRequest("PATCH", `/api/reimbursements/${id}`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reimbursements"] });
      toast({ title: "Reimbursement claim updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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

  const pendingLeaveCount = approvals?.leaves?.length || 0;
  const pendingReimbursementCount = approvals?.reimbursements?.length || 0;
  const totalPendingApprovals = pendingLeaveCount + pendingReimbursementCount;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your workspace today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-lg border-border/60 shadow-sm cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors" data-testid="button-date-calendar" onClick={() => setCalendarOpen(true)}>
            <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
            <span className="font-medium">{calendarDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
          </Button>
          <Button size="sm" className="rounded-lg gradient-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">Download Report</Button>
        </div>

        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden rounded-xl gap-0 [&>button]:text-white [&>button]:hover:text-white/80">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">{calendarDate.toLocaleDateString("en-IN", { weekday: "long" })}</p>
                  <p className="text-3xl font-bold mt-1">{calendarDate.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-indigo-200 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                    <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full">IST</span>
                  </div>
                  {(() => { const dayMeetings = meetings?.filter((m: Meeting) => { const md = new Date(m.date); const cd = calendarDate; return md.getFullYear() === cd.getFullYear() && md.getMonth() === cd.getMonth() && md.getDate() === cd.getDate(); }) || []; return dayMeetings.length > 0 ? <Badge className="bg-white/20 text-white border-0 text-xs px-3 mt-2">{dayMeetings.length} meeting{dayMeetings.length > 1 ? "s" : ""} scheduled</Badge> : null; })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-[420px]">
              <div className="p-6 border-r border-border/40 flex items-start justify-center">
                <CalendarWidget
                  mode="single"
                  selected={calendarDate}
                  onSelect={(date) => date && setCalendarDate(date)}
                  className="!p-0 w-full [--cell-size:3rem]"
                  modifiers={{
                    hasMeeting: meetings?.map((m: Meeting) => new Date(m.date)) || [],
                  }}
                  modifiersClassNames={{
                    hasMeeting: "!bg-indigo-100 !text-indigo-700 font-semibold ring-1 ring-indigo-300 ring-inset",
                  }}
                />
              </div>

              <div className="flex flex-col bg-slate-50/80">
                <div className="px-5 py-3.5 border-b border-border/40 bg-white/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {calendarDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} — Schedule
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {(() => {
                    const dayMeetings = meetings?.filter((m: Meeting) => {
                      const md = new Date(m.date);
                      const cd = calendarDate;
                      return md.getFullYear() === cd.getFullYear() && md.getMonth() === cd.getMonth() && md.getDate() === cd.getDate();
                    }) || [];
                    if (dayMeetings.length === 0) return (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No meetings scheduled</p>
                        <p className="text-xs mt-1 text-muted-foreground/70">Select a date to view schedule</p>
                      </div>
                    );
                    return (
                      <div className="space-y-3">
                        {dayMeetings.map((m: Meeting) => (
                          <div key={m.id} className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-1 self-stretch rounded-full bg-indigo-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{m.title}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span>
                              </div>
                              {m.agenda && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{m.agenda}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="px-5 py-3 border-t border-border/40 bg-white/60 flex justify-between items-center">
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setCalendarDate(new Date())} data-testid="button-calendar-today">
                    Today
                  </Button>
                  <Button variant="default" size="sm" className="text-xs h-8 gradient-primary" onClick={() => setCalendarOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isManager ? (
        <Tabs value={dashboardTab} onValueChange={setDashboardTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              Approvals
              {totalPendingApprovals > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] rounded-full">
                  {totalPendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <DashboardOverview
              meetings={meetings}
              clients={clients}
              reimbursements={reimbursements}
              tasks={tasks}
              todayMeetings={todayMeetings}
              pendingTasks={pendingTasks}
              completedTasks={completedTasks}
              pendingReimbursements={pendingReimbursements}
              setLocation={setLocation}
            />
          </TabsContent>
          <TabsContent value="approvals" className="mt-4">
            <ApprovalsTab
              approvals={approvals}
              onLeaveAction={(id, status, rejectionReason) => approveRejectLeaveMutation.mutate({ id, status, rejectionReason })}
              onReimbursementAction={(id, status, rejectionReason) => approveRejectReimbursementMutation.mutate({ id, status, rejectionReason })}
              isLeaveLoading={approveRejectLeaveMutation.isPending}
              isReimbursementLoading={approveRejectReimbursementMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DashboardOverview
          meetings={meetings}
          clients={clients}
          reimbursements={reimbursements}
          tasks={tasks}
          todayMeetings={todayMeetings}
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          pendingReimbursements={pendingReimbursements}
          setLocation={setLocation}
        />
      )}
    </div>
  );
}

function ApprovalsTab({
  approvals,
  onLeaveAction,
  onReimbursementAction,
  isLeaveLoading,
  isReimbursementLoading,
}: {
  approvals: PendingApprovals | undefined;
  onLeaveAction: (id: number, status: string, rejectionReason?: string) => void;
  onReimbursementAction: (id: number, status: string, rejectionReason?: string) => void;
  isLeaveLoading: boolean;
  isReimbursementLoading: boolean;
}) {
  const pendingLeaves = approvals?.leaves || [];
  const pendingReimbursements = approvals?.reimbursements || [];
  const [rejectDialog, setRejectDialog] = useState<{ type: "leave" | "reimbursement"; id: number; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [commentDialog, setCommentDialog] = useState<{ id: number; name: string; existing: string } | null>(null);
  const [commentText, setCommentText] = useState("");

  const commentMutation = useMutation({
    mutationFn: async ({ id, managerComment }: { id: number; managerComment: string }) => {
      await apiRequest("PATCH", `/api/reimbursements/${id}`, { managerComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-approvals"] });
      setCommentDialog(null);
      setCommentText("");
    },
  });

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      setReasonError("Rejection reason is required");
      return;
    }
    if (rejectDialog) {
      if (rejectDialog.type === "leave") {
        onLeaveAction(rejectDialog.id, "Rejected", rejectionReason.trim());
      } else {
        onReimbursementAction(rejectDialog.id, "Rejected", rejectionReason.trim());
      }
      setRejectDialog(null);
      setRejectionReason("");
      setReasonError("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Dialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(null); setRejectionReason(""); setReasonError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectDialog?.type === "leave" ? "Leave Request" : "Reimbursement Claim"}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {rejectDialog?.name}'s {rejectDialog?.type === "leave" ? "leave request" : "reimbursement claim"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for Rejection <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); setReasonError(""); }}
              className={reasonError ? "border-red-500" : ""}
              data-testid="input-rejection-reason"
            />
            {reasonError && <span className="text-xs text-red-500">{reasonError}</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectionReason(""); setReasonError(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={isLeaveLoading || isReimbursementLoading} data-testid="button-confirm-reject">Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!commentDialog} onOpenChange={(open) => { if (!open) { setCommentDialog(null); setCommentText(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Comment</DialogTitle>
            <DialogDescription>
              Add a comment for {commentDialog?.name}'s reimbursement claim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              data-testid="input-manager-comment"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCommentDialog(null); setCommentText(""); }}>Cancel</Button>
            <Button onClick={() => { if (commentDialog) commentMutation.mutate({ id: commentDialog.id, managerComment: commentText }); }} disabled={commentMutation.isPending} data-testid="button-save-comment">Save Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Leave Requests
            {pendingLeaves.length > 0 && (
              <Badge variant="secondary" className="text-xs">{pendingLeaves.length} pending</Badge>
            )}
          </CardTitle>
          <CardDescription>Employee leave requests awaiting your approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No pending leave requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((leave: any) => (
                  <TableRow key={leave.id} data-testid={`approval-leave-${leave.id}`}>
                    <TableCell className="font-medium">{leave.employeeName}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>{leave.fromDate}</TableCell>
                    <TableCell>{leave.toDate}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          onClick={() => onLeaveAction(leave.id, "Approved")}
                          disabled={isLeaveLoading}
                          data-testid={`approve-leave-${leave.id}`}
                        >
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          onClick={() => setRejectDialog({ type: "leave", id: leave.id, name: leave.employeeName })}
                          disabled={isLeaveLoading}
                          data-testid={`reject-leave-${leave.id}`}
                        >
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            Reimbursement Claims
            {pendingReimbursements.length > 0 && (
              <Badge variant="secondary" className="text-xs">{pendingReimbursements.length} pending</Badge>
            )}
          </CardTitle>
          <CardDescription>Employee reimbursement claims awaiting your approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReimbursements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No pending reimbursement claims</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Expense Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReimbursements.map((claim: any) => (
                  <TableRow key={claim.id} data-testid={`approval-reimbursement-${claim.id}`}>
                    <TableCell className="font-medium">{claim.employeeName}</TableCell>
                    <TableCell>{claim.type}</TableCell>
                    <TableCell>₹{Number(claim.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{claim.date ? new Date(claim.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{claim.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          onClick={() => onReimbursementAction(claim.id, "Approved")}
                          disabled={isReimbursementLoading}
                          data-testid={`approve-reimbursement-${claim.id}`}
                        >
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                          onClick={() => setRejectDialog({ type: "reimbursement", id: claim.id, name: claim.employeeName })}
                          disabled={isReimbursementLoading}
                          data-testid={`reject-reimbursement-${claim.id}`}
                        >
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => { setCommentDialog({ id: claim.id, name: claim.employeeName, existing: claim.managerComment || "" }); setCommentText(claim.managerComment || ""); }}
                          data-testid={`comment-reimbursement-${claim.id}`}
                        >
                          <ClipboardList className="h-3 w-3 mr-1" /> Comment
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.managerComment ? (
                        <span className="text-sm text-muted-foreground">{claim.managerComment}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardOverview({
  meetings,
  clients,
  reimbursements,
  tasks,
  todayMeetings,
  pendingTasks,
  completedTasks,
  pendingReimbursements,
  setLocation,
}: {
  meetings: Meeting[];
  clients: Client[];
  reimbursements: Reimbursement[];
  tasks: Task[];
  todayMeetings: Meeting[];
  pendingTasks: Task[];
  completedTasks: Task[];
  pendingReimbursements: Reimbursement[];
  setLocation: (path: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover shadow-sm border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2.5 stat-gradient-emerald rounded-xl">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+20.1%</span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-sm border-border/50 cursor-pointer overflow-hidden relative" onClick={() => setLocation("/crm")}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            <div className="p-2.5 stat-gradient-blue rounded-xl">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">Click to manage</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-sm border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <div className="p-2.5 stat-gradient-amber rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{completedTasks.length}</span>
              <span className="text-xs text-muted-foreground">completed</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover shadow-sm border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-violet-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target Reached</CardTitle>
            <div className="p-2.5 stat-gradient-purple rounded-xl">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">+4%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Revenue Growth</CardTitle>
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

        <Card className="col-span-3 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Meetings</CardTitle>
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

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Task Management</CardTitle>
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

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Pending Reimbursements</CardTitle>
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

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Pending Reports</CardTitle>
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
