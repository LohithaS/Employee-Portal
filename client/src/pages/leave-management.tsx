import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const leaveTypes = [
  { id: "sl", name: "Sick Leave", total: 5 },
  { id: "cl", name: "Casual Leave", total: 8 },
  { id: "el", name: "Earned Leave", total: 12 },
  { id: "ml", name: "Maternity Leave", total: 180 },
  { id: "co", name: "Compensatory Off", total: 2 },
];

export default function LeaveManagement() {
  const [selectedLeave, setSelectedLeave] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const requestsQuery = useQuery<any[]>({ queryKey: ["/api/leave-requests"] });
  const requests = requestsQuery.data ?? [];

  const usedDaysByType: Record<string, number> = {};
  requests.forEach((req: any) => {
    const days = Number(req.days) || 0;
    usedDaysByType[req.type] = (usedDaysByType[req.type] || 0) + days;
  });

  const leaveBalances = leaveTypes.map(lt => ({
    ...lt,
    used: usedDaysByType[lt.name] || 0,
    balance: Math.max(0, lt.total - (usedDaysByType[lt.name] || 0)),
  }));

  const addRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/leave-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      setSelectedLeave("");
      setFromDate("");
      setToDate("");
      setReason("");
      setErrors({});
      toast({ title: "Leave request submitted successfully" });
    },
  });

  const handleSubmitRequest = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedLeave) newErrors.type = "Leave type is required";
    if (!fromDate) newErrors.fromDate = "From date is required";
    if (!toDate) newErrors.toDate = "To date is required";
    if (!reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const today = new Date().toISOString().split("T")[0];
    if (fromDate <= today || toDate <= today) {
      toast({ title: "Dates must be future dates", variant: "destructive" });
      return;
    }
    if (toDate < fromDate) {
      toast({ title: "To Date cannot be before From Date", variant: "destructive" });
      return;
    }

    const leaveType = leaveBalances.find(l => l.id === selectedLeave);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (leaveType && days > leaveType.balance) {
      toast({ title: `Insufficient ${leaveType.name} balance. Available: ${leaveType.balance} days`, variant: "destructive" });
      return;
    }

    addRequestMutation.mutate({
      type: leaveType?.name || selectedLeave,
      fromDate,
      toDate,
      days,
      reason,
      status: "Pending"
    });
  };

  if (requestsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading leave requests...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Management</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {leaveBalances.map(leave => (
                <Card key={leave.id}>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{leave.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{leave.balance}</div>
                        <p className="text-xs text-muted-foreground mt-1">Used: {leave.used} / {leave.total}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[400px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle>Apply for Leave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Leave Type <span className="text-red-500">*</span></Label>
                        <Select value={selectedLeave} onValueChange={setSelectedLeave}>
                            <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveBalances.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.balance} left)</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label>From Date <span className="text-red-500">*</span></Label>
                        <Input type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={errors.fromDate ? "border-red-500" : ""} />
                        {errors.fromDate && <span className="text-xs text-red-500">{errors.fromDate}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label>To Date <span className="text-red-500">*</span></Label>
                        <Input type="date" min={fromDate || new Date(Date.now() + 86400000).toISOString().split("T")[0]} value={toDate} onChange={(e) => setToDate(e.target.value)} className={errors.toDate ? "border-red-500" : ""} />
                        {errors.toDate && <span className="text-xs text-red-500">{errors.toDate}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label>Reason <span className="text-red-500">*</span></Label>
                        <Textarea placeholder="Reason for leave..." value={reason} onChange={(e) => setReason(e.target.value)} className={errors.reason ? "border-red-500" : ""} />
                        {errors.reason && <span className="text-xs text-red-500">{errors.reason}</span>}
                    </div>
                    <Button className="w-full" onClick={handleSubmitRequest} disabled={addRequestMutation.isPending}>Submit Request</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.type}</TableCell>
                                    <TableCell>{req.fromDate} - {req.toDate}</TableCell>
                                    <TableCell>{req.days}</TableCell>
                                    <TableCell>{req.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
