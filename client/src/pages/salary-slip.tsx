import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (2020 + i).toString());

function getMonthLabel(m: string) {
  return months.find((x) => x.value === m)?.label || m;
}

function PayslipContent({ month, year, user }: { month: string; year: string; user: any }) {
  const monthLabel = getMonthLabel(month);
  return (
    <div className="space-y-8 p-6" id="payslip-content">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">NEXUS ENTERPRISES LTD.</h2>
        <p className="text-muted-foreground">Payslip for the month of {monthLabel} {year}</p>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Employee Name</p>
          <p className="font-semibold">{user?.name || "Employee"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Employee ID</p>
          <p className="font-semibold">EMP-{user?.id?.toString().padStart(4, "0") || "0001"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Month</p>
          <p className="font-semibold">{monthLabel} {year}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Department</p>
          <p className="font-semibold">General</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border rounded-md overflow-hidden">
        <div className="border-r">
          <div className="bg-muted/50 p-2 font-semibold border-b">Earnings</div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between"><span>Basic Salary</span><span>₹25,000.00</span></div>
            <div className="flex justify-between"><span>HRA</span><span>₹10,000.00</span></div>
            <div className="flex justify-between"><span>Special Allowance</span><span>₹5,000.00</span></div>
            <div className="flex justify-between"><span>Conveyance</span><span>₹1,600.00</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total Earnings</span><span>₹41,600.00</span></div>
          </div>
        </div>
        <div>
          <div className="bg-muted/50 p-2 font-semibold border-b">Deductions</div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between"><span>Provident Fund</span><span>₹3,000.00</span></div>
            <div className="flex justify-between"><span>Professional Tax</span><span>₹200.00</span></div>
            <div className="flex justify-between"><span>Income Tax (TDS)</span><span>₹2,500.00</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total Deductions</span><span>₹5,700.00</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-primary/10 p-4 rounded-md">
        <span className="text-lg font-bold">Net Salary</span>
        <span className="text-2xl font-bold text-primary">₹35,900.00</span>
      </div>
    </div>
  );
}

export default function SalarySlip() {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const monthLabel = getMonthLabel(selectedMonth);
    printWindow.document.write(`
      <html>
      <head>
        <title>Salary Slip - ${monthLabel} ${selectedYear}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
          .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
          .header h2 { margin: 0; font-size: 22px; }
          .header p { margin: 4px 0 0; color: #6b7280; font-size: 14px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-item .label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
          .info-item .value { font-weight: 600; font-size: 14px; }
          .table-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
          .table-grid .col { }
          .table-grid .col:first-child { border-right: 1px solid #e5e7eb; }
          .table-grid .col-header { background: #f9fafb; padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .table-grid .col-body { padding: 12px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
          .row.total { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; font-weight: 600; }
          .net-salary { display: flex; justify-content: space-between; align-items: center; background: #eef2ff; padding: 16px; border-radius: 6px; }
          .net-salary .label { font-size: 16px; font-weight: 700; }
          .net-salary .amount { font-size: 22px; font-weight: 700; color: #4f46e5; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>NEXUS ENTERPRISES LTD.</h2>
          <p>Payslip for the month of ${monthLabel} ${selectedYear}</p>
        </div>
        <div class="info-grid">
          <div class="info-item"><div class="label">Employee Name</div><div class="value">${user?.name || "Employee"}</div></div>
          <div class="info-item"><div class="label">Employee ID</div><div class="value">EMP-${user?.id?.toString().padStart(4, "0") || "0001"}</div></div>
          <div class="info-item"><div class="label">Month</div><div class="value">${monthLabel} ${selectedYear}</div></div>
          <div class="info-item"><div class="label">Department</div><div class="value">General</div></div>
        </div>
        <div class="table-grid">
          <div class="col">
            <div class="col-header">Earnings</div>
            <div class="col-body">
              <div class="row"><span>Basic Salary</span><span>₹25,000.00</span></div>
              <div class="row"><span>HRA</span><span>₹10,000.00</span></div>
              <div class="row"><span>Special Allowance</span><span>₹5,000.00</span></div>
              <div class="row"><span>Conveyance</span><span>₹1,600.00</span></div>
              <div class="row total"><span>Total Earnings</span><span>₹41,600.00</span></div>
            </div>
          </div>
          <div class="col">
            <div class="col-header">Deductions</div>
            <div class="col-body">
              <div class="row"><span>Provident Fund</span><span>₹3,000.00</span></div>
              <div class="row"><span>Professional Tax</span><span>₹200.00</span></div>
              <div class="row"><span>Income Tax (TDS)</span><span>₹2,500.00</span></div>
              <div class="row total"><span>Total Deductions</span><span>₹5,700.00</span></div>
            </div>
          </div>
        </div>
        <div class="net-salary">
          <span class="label">Net Salary</span>
          <span class="amount">₹35,900.00</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Salary Slip</h1>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Select Pay Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Month <span className="text-red-500">*</span></label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger data-testid="select-month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Year <span className="text-red-500">*</span></label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" variant="outline" onClick={() => setPreviewOpen(true)} data-testid="button-preview">
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
              <Button className="flex-1" onClick={handleDownloadPdf} data-testid="button-download-pdf">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Salary Slip Preview
            </DialogTitle>
          </DialogHeader>
          <div ref={printRef}>
            <PayslipContent month={selectedMonth} year={selectedYear} user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
