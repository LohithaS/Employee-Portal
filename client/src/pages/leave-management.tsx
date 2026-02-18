import { useState } from "react";
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
  { id: "sl", name: "Sick Leave", balance: 5 },
  { id: "cl", name: "Casual Leave", balance: 8 },
  { id: "el", name: "Earned Leave", balance: 12 },
  { id: "ml", name: "Maternity Leave", balance: 180 },
  { id: "co", name: "Compensatory Off", balance: 2 },
];

const initialRequests = [
  { id: 1, type: "Sick Leave", dates: "Feb 15, 2026", days: 1, reason: "Viral Fever", status: "Approved" },
];

export default function LeaveManagement() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedLeave, setSelectedLeave] = useState("");
  const [leaveBalances, setLeaveBalances] = useState(leaveTypes);

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
                        <Label>Leave Type</Label>
                        <Select value={selectedLeave} onValueChange={setSelectedLeave}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveBalances.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>From Date</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>To Date</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea placeholder="Reason for leave..." />
                    </div>
                    <Button className="w-full">Submit Request</Button>
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
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.type}</TableCell>
                                    <TableCell>{req.dates}</TableCell>
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
