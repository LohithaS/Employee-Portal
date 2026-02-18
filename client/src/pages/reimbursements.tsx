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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialClaims = [
  { id: 1, type: "Travel", amount: "$350.00", date: "2026-02-10", status: "Pending", description: "Flight tickets to NYC" },
  { id: 2, type: "Food", amount: "$120.00", date: "2026-02-11", status: "Approved", description: "Client Dinner" },
];

export default function Reimbursements() {
  const [claims, setClaims] = useState(initialClaims);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reimbursements</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Claim</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Expense Type</Label>
                  <Input placeholder="e.g. Travel, Food" />
                </div>
                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <Input placeholder="$0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input placeholder="Details..." />
                </div>
                <div className="grid gap-2">
                  <Label>Upload Bills</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm">Click to upload or drag and drop</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsAddOpen(false)}>Submit Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$350.00</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Approved (This Month)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">$120.00</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">$0.00</div>
                </CardContent>
            </Card>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.type}</TableCell>
                  <TableCell>{claim.description}</TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>{claim.amount}</TableCell>
                  <TableCell>
                    <Badge variant={claim.status === "Approved" ? "secondary" : "outline"} className={claim.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {claim.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
