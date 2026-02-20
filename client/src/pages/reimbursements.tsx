import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
import { Plus, Upload, Download, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseItem {
  expenseType: string;
  description: string;
  amount: string;
  refBillName: string;
  refBillDate: string;
  billFileName?: string;
}

const emptyExpense: ExpenseItem = {
  expenseType: "",
  description: "",
  amount: "",
  refBillName: "",
  refBillDate: "",
  billFileName: "",
};

export default function Reimbursements() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewClaim, setViewClaim] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([{ ...emptyExpense }]);
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>[]>([{}]);
  const [billFiles, setBillFiles] = useState<(File | null)[]>([null]);

  const handleDownloadForm = () => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short", timeZone: "Asia/Kolkata" }).toUpperCase();
    const year = String(now.getFullYear()).slice(-2);
    const employeeName = user?.name || "Employee";
    const fileName = `Reimbursement-${employeeName}-${month}-${year}.xlsx`;

    const link = document.createElement("a");
    link.href = "/Reimbursement-Template.xlsx";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      resetForm();
      toast({ title: "Claim submitted successfully" });
    },
  });

  const resetForm = () => {
    setExpenses([{ ...emptyExpense }]);
    setExpenseErrors([{}]);
    setBillFiles([null]);
  };

  const addExpenseRow = () => {
    setExpenses([...expenses, { ...emptyExpense }]);
    setExpenseErrors([...expenseErrors, {}]);
    setBillFiles([...billFiles, null]);
  };

  const removeExpenseRow = (index: number) => {
    if (expenses.length <= 1) return;
    setExpenses(expenses.filter((_, i) => i !== index));
    setExpenseErrors(expenseErrors.filter((_, i) => i !== index));
    setBillFiles(billFiles.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: keyof ExpenseItem, value: string) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
    if (expenseErrors[index]?.[field]) {
      const updatedErrors = [...expenseErrors];
      const err = { ...updatedErrors[index] };
      delete err[field];
      updatedErrors[index] = err;
      setExpenseErrors(updatedErrors);
    }
  };

  const validateExpenses = () => {
    const today = new Date().toISOString().split("T")[0];
    let valid = true;
    const newErrors: Record<string, string>[] = expenses.map((exp, i) => {
      const err: Record<string, string> = {};
      if (!exp.expenseType.trim()) { err.expenseType = "Required"; valid = false; }
      if (!exp.description.trim()) { err.description = "Required"; valid = false; }
      if (!exp.amount.trim() || isNaN(Number(exp.amount)) || Number(exp.amount) <= 0) { err.amount = "Enter valid amount"; valid = false; }
      if (!exp.refBillName.trim()) { err.refBillName = "Required"; valid = false; }
      if (!exp.refBillDate) { err.refBillDate = "Required"; valid = false; }
      else if (exp.refBillDate > today) { err.refBillDate = "Cannot be future date"; valid = false; }
      if (!billFiles[i]) { err.billFile = "Upload a bill"; valid = false; }
      return err;
    });
    setExpenseErrors(newErrors);
    return valid;
  };

  const handleSubmitClaim = () => {
    if (!validateExpenses()) return;

    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const expensesWithBills = expenses.map((exp, i) => ({
      ...exp,
      billFileName: billFiles[i]?.name || "",
    }));
    const now = new Date();
    const claimDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const claimMonth = now.toLocaleString("en-US", { month: "long", timeZone: "Asia/Kolkata" });
    const claimYear = now.getFullYear().toString();

    addClaimMutation.mutate({
      type: `Monthly Claim - ${claimMonth} ${claimYear}`,
      amount: totalAmount.toFixed(2),
      date: claimDate,
      description: `${expenses.length} expense(s) totalling ₹${totalAmount.toFixed(2)}`,
      expenses: JSON.stringify(expensesWithBills),
      status: "Pending",
    });
  };

  const parseExpenses = (claim: any): ExpenseItem[] => {
    try {
      if (claim.expenses) return JSON.parse(claim.expenses);
    } catch {}
    return [];
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadForm} data-testid="button-download-form">
              <Download className="mr-2 h-4 w-4" /> Download Form
            </Button>
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-claim">
                  <Plus className="mr-2 h-4 w-4" /> New Claim
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Reimbursement Claim</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Add all expenses for the month. All fields are mandatory.</p>
                    <Button type="button" variant="outline" size="sm" onClick={addExpenseRow} data-testid="button-add-expense">
                      <Plus className="mr-1 h-3 w-3" /> Add Expense
                    </Button>
                  </div>

                  {expenses.map((exp, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3 relative bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Expense #{idx + 1}</span>
                        {expenses.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => removeExpenseRow(idx)} data-testid={`button-remove-expense-${idx}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <Label className="text-xs">Expense Type <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="e.g. Travel, Food, Accommodation"
                            value={exp.expenseType}
                            onChange={(e) => updateExpense(idx, "expenseType", e.target.value)}
                            className={expenseErrors[idx]?.expenseType ? "border-red-500" : ""}
                            data-testid={`input-expense-type-${idx}`}
                          />
                          {expenseErrors[idx]?.expenseType && <span className="text-xs text-red-500">{expenseErrors[idx].expenseType}</span>}
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Amount (₹) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            placeholder="₹0.00"
                            value={exp.amount}
                            onChange={(e) => updateExpense(idx, "amount", e.target.value)}
                            className={expenseErrors[idx]?.amount ? "border-red-500" : ""}
                            data-testid={`input-expense-amount-${idx}`}
                          />
                          {expenseErrors[idx]?.amount && <span className="text-xs text-red-500">{expenseErrors[idx].amount}</span>}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Brief description of the expense"
                          value={exp.description}
                          onChange={(e) => updateExpense(idx, "description", e.target.value)}
                          className={expenseErrors[idx]?.description ? "border-red-500" : ""}
                          data-testid={`input-expense-desc-${idx}`}
                        />
                        {expenseErrors[idx]?.description && <span className="text-xs text-red-500">{expenseErrors[idx].description}</span>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <Label className="text-xs">Ref Bill Name/No. <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="e.g. INV-2026-001"
                            value={exp.refBillName}
                            onChange={(e) => updateExpense(idx, "refBillName", e.target.value)}
                            className={expenseErrors[idx]?.refBillName ? "border-red-500" : ""}
                            data-testid={`input-ref-bill-${idx}`}
                          />
                          {expenseErrors[idx]?.refBillName && <span className="text-xs text-red-500">{expenseErrors[idx].refBillName}</span>}
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Ref Bill Date <span className="text-red-500">*</span></Label>
                          <Input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={exp.refBillDate}
                            onChange={(e) => updateExpense(idx, "refBillDate", e.target.value)}
                            className={expenseErrors[idx]?.refBillDate ? "border-red-500" : ""}
                            data-testid={`input-ref-date-${idx}`}
                          />
                          {expenseErrors[idx]?.refBillDate && <span className="text-xs text-red-500">{expenseErrors[idx].refBillDate}</span>}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Upload Bill <span className="text-red-500">*</span></Label>
                        <label className={`border-2 border-dashed rounded-md p-3 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer ${expenseErrors[idx]?.billFile ? "border-red-500" : ""}`}>
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="text-xs">{billFiles[idx] ? billFiles[idx]!.name : "Click to upload bill (.pdf, .jpg, .png, .xlsx)"}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                            data-testid={`input-bill-file-${idx}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              const updated = [...billFiles];
                              updated[idx] = file;
                              setBillFiles(updated);
                              if (file && expenseErrors[idx]?.billFile) {
                                const updatedErrors = [...expenseErrors];
                                const err = { ...updatedErrors[idx] };
                                delete err.billFile;
                                updatedErrors[idx] = err;
                                setExpenseErrors(updatedErrors);
                              }
                            }}
                          />
                        </label>
                        {expenseErrors[idx]?.billFile && <span className="text-xs text-red-500">{expenseErrors[idx].billFile}</span>}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-indigo-600">₹{expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0).toFixed(2)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmitClaim} disabled={addClaimMutation.isPending} data-testid="button-submit-claim">Submit Claim</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                <TableHead>Claim</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim: any) => {
                const expList = parseExpenses(claim);
                return (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.type}</TableCell>
                    <TableCell>{claim.date}</TableCell>
                    <TableCell>{expList.length > 0 ? `${expList.length} item(s)` : "1 item"}</TableCell>
                    <TableCell>₹{Number(claim.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={claim.status === "Approved" ? "secondary" : "outline"} className={claim.status === "Approved" ? "bg-green-100 text-green-800" : claim.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {claim.status === "Rejected" && claim.rejectionReason ? (
                        <span className="text-sm text-red-600">{claim.rejectionReason}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expList.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => { setViewClaim(claim); setIsViewOpen(true); }} data-testid={`button-view-claim-${claim.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewClaim?.type || "Claim Details"}</DialogTitle>
            </DialogHeader>
            {viewClaim && (
              <div className="space-y-3 py-2">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Expense Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Ref Bill Name/No.</TableHead>
                        <TableHead>Ref Bill Date</TableHead>
                        <TableHead>Bill File</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseExpenses(viewClaim).map((exp, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{exp.expenseType}</TableCell>
                          <TableCell>{exp.description}</TableCell>
                          <TableCell>₹{Number(exp.amount || 0).toFixed(2)}</TableCell>
                          <TableCell>{exp.refBillName}</TableCell>
                          <TableCell>{exp.refBillDate}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{exp.billFileName || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <span className="text-sm font-semibold">Total: <span className="text-indigo-600">₹{Number(viewClaim.amount || 0).toFixed(2)}</span></span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
