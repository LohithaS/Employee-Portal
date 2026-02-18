import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function SalarySlip() {
  const [month, setMonth] = useState("jan-2026");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Salary Slip</h1>

        <div className="flex items-center gap-4">
            <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="jan-2026">January 2026</SelectItem>
                    <SelectItem value="dec-2025">December 2025</SelectItem>
                    <SelectItem value="nov-2025">November 2025</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>

        <Card className="max-w-4xl mx-auto w-full">
            <CardHeader className="text-center border-b bg-muted/20">
                <CardTitle className="text-2xl">NEXUS ENTERPRISES LTD.</CardTitle>
                <CardDescription>Payslip for the month of {month.replace("-", " ").toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Employee Name</p>
                        <p className="font-semibold">Alex Morgan</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Employee ID</p>
                        <p className="font-semibold">EMP-2024-001</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Designation</p>
                        <p className="font-semibold">Product Designer</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-semibold">Design & Engineering</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-0 border rounded-md overflow-hidden">
                    <div className="border-r">
                        <div className="bg-muted/50 p-2 font-semibold border-b">Earnings</div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Basic Salary</span>
                                <span>$4,500.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>HRA</span>
                                <span>$1,200.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Special Allowance</span>
                                <span>$800.00</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="bg-muted/50 p-2 font-semibold border-b">Deductions</div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Provident Fund</span>
                                <span>$250.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>$450.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-primary/10 p-4 rounded-md">
                    <span className="text-lg font-bold">Net Salary</span>
                    <span className="text-2xl font-bold text-primary">$5,800.00</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
