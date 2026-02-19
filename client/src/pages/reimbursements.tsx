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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function Reimbursements() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isManager = user?.role === "Manager";

  const [newClaim, setNewClaim] = useState({
    type: "",
    amount: "",
    date: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billFile, setBillFile] = useState<File | null>(null);

  const claimsQuery = useQuery<any[]>({ queryKey: ["/api/reimbursements"] });
  const claims = claimsQuery.data ?? [];

  const totalPending = claims
    .filter((c: any) => c.status === "Pending")
    .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);
  const totalApproved = claims
    .filter((c: any) => c.status === "Approved")
    .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);
  const totalRejected = claims
    .filter((c: any) => c.status === "Rejected")
    .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

  const addClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      await apiRequest("POST", "/api/reimbursements", claimData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reimbursements"] });
      setIsAddOpen(false);
      setNewClaim({ type: "", amount: "", date: "", description: "" });
      setBillFile(null);
      setErrors({});
      toast({ title: "Claim submitted successfully" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/reimbursements/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reimbursements"] });
      toast({ title: "Claim status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const validateClaim = () => {
    const newErrors: Record<string, string> = {};
    if (!newClaim.type) newErrors.type = "Expense type is required";
    if (!newClaim.amount) newErrors.amount = "Amount is required";
    if (!newClaim.date) {
      newErrors.date = "Date is required";
    } else if (newClaim.date > new Date().toISOString().split("T")[0]) {
      newErrors.date = "Date cannot be in the future";
    }
    if (!newClaim.description) newErrors.description = "Description is required";
    if (!billFile) newErrors.billFile = "Please upload a bill";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClaim = () => {
    if (!validateClaim()) return;

    addClaimMutation.mutate({
      type: newClaim.type,
      amount: newClaim.amount,
      date: newClaim.date,
      description: newClaim.description,
      status: "Pending"
    });
  };

  if (claimsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reimbursements...</p>
        </div>
      </DashboardLayout>
    );
  }

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
                  <Label>Expense Type <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. Travel, Food"
                    value={newClaim.type}
                    onChange={(e) => setNewClaim({...newClaim, type: e.target.value})}
                    className={errors.type ? "border-red-500" : ""}
                  />
                  {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Amount <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="₹0.00"
                    value={newClaim.amount}
                    onChange={(e) => setNewClaim({...newClaim, amount: e.target.value})}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && <span className="text-xs text-red-500">{errors.amount}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={newClaim.date}
                    onChange={(e) => setNewClaim({...newClaim, date: e.target.value})}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && <span className="text-xs text-red-500">{errors.date}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Description <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Details..."
                    value={newClaim.description}
                    onChange={(e) => setNewClaim({...newClaim, description: e.target.value})}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Upload Bills <span className="text-red-500">*</span></Label>
                  <label className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer ${errors.billFile ? "border-red-500" : ""}`}>
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm">{billFile ? billFile.name : "Click to upload or drag and drop"}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setBillFile(file);
                        if (file && errors.billFile) {
                          setErrors((prev) => { const next = { ...prev }; delete next.billFile; return next; });
                        }
                      }}
                    />
                  </label>
                  {errors.billFile && <span className="text-xs text-red-500">{errors.billFile}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitClaim} disabled={addClaimMutation.isPending}>Submit Claim</Button>
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
                    <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Approved (This Month)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">₹{totalApproved.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">₹{totalRejected.toFixed(2)}</div>
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
                {isManager && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim: any) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.type}</TableCell>
                  <TableCell>{claim.description}</TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>₹{Number(claim.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={claim.status === "Approved" ? "secondary" : "outline"} className={claim.status === "Approved" ? "bg-green-100 text-green-800" : claim.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                        {claim.status}
                    </Badge>
                  </TableCell>
                  {isManager && (
                    <TableCell>
                      {claim.status === "Pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            onClick={() => updateStatusMutation.mutate({ id: claim.id, status: "Approved" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            onClick={() => updateStatusMutation.mutate({ id: claim.id, status: "Rejected" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
