import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, FileSpreadsheet, FileText } from "lucide-react";

const reportTypes = [
  { id: "tasks", label: "Task Report", endpoint: "/api/tasks" },
  { id: "clients", label: "CRM / Client Report", endpoint: "/api/clients" },
  { id: "leads", label: "Lead Report", endpoint: "/api/leads" },
  { id: "meetings", label: "Meeting Report", endpoint: "/api/meetings" },
  { id: "trips", label: "Business Trip Report", endpoint: "/api/trips" },
  { id: "reimbursements", label: "Reimbursement Report", endpoint: "/api/reimbursements" },
  { id: "leave", label: "Leave Report", endpoint: "/api/leave-requests" },
  { id: "tickets", label: "Service Ticket Report", endpoint: "/api/tickets" },
];

function getColumns(reportId: string): { key: string; label: string }[] {
  switch (reportId) {
    case "tasks":
      return [
        { key: "title", label: "Title" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
        { key: "dueDate", label: "Due Date" },
        { key: "assignee", label: "Assignee" },
      ];
    case "clients":
      return [
        { key: "name", label: "Client Name" },
        { key: "industry", label: "Industry" },
        { key: "status", label: "Status" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ];
    case "leads":
      return [
        { key: "name", label: "Lead Name" },
        { key: "customerName", label: "Customer" },
        { key: "value", label: "Value (₹)" },
        { key: "status", label: "Status" },
        { key: "source", label: "Source" },
      ];
    case "meetings":
      return [
        { key: "title", label: "Title" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "location", label: "Location" },
      ];
    case "trips":
      return [
        { key: "destination", label: "Destination" },
        { key: "purpose", label: "Purpose" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "status", label: "Status" },
      ];
    case "reimbursements":
      return [
        { key: "type", label: "Type" },
        { key: "description", label: "Description" },
        { key: "amount", label: "Amount (₹)" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
      ];
    case "leave":
      return [
        { key: "type", label: "Leave Type" },
        { key: "fromDate", label: "From" },
        { key: "toDate", label: "To" },
        { key: "days", label: "Days" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
      ];
    case "tickets":
      return [
        { key: "title", label: "Title" },
        { key: "machine", label: "Machine" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
      ];
    default:
      return [];
  }
}

function formatCellValue(key: string, value: any): string {
  if (value === null || value === undefined) return "-";
  if (key === "date" || key === "dueDate" || key === "startDate" || key === "endDate" || key === "fromDate" || key === "toDate") {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  if (key === "amount" || key === "value") {
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }
  return String(value);
}

function generateCSV(columns: { key: string; label: string }[], data: any[]): string {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = formatCellValue(c.key, row[c.key]);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printReport(columns: { key: string; label: string }[], data: any[], reportLabel: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const tableRows = data
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${formatCellValue(c.key, row[c.key])}</td>`).join("")}</tr>`
    )
    .join("");
  printWindow.document.write(`
    <html>
    <head>
      <title>${reportLabel}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 30px; color: #1a1a1a; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .date { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 20px; font-size: 11px; color: #9ca3af; text-align: center; }
        @media print { body { padding: 15px; } }
      </style>
    </head>
    <body>
      <h1>${reportLabel}</h1>
      <div class="date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
      <table>
        <thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Nexus Enterprises Ltd. — Confidential</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const reportConfig = reportTypes.find((r) => r.id === selectedReport);
  const columns = useMemo(() => getColumns(selectedReport), [selectedReport]);

  const dataQuery = useQuery<any[]>({
    queryKey: [reportConfig?.endpoint],
    queryFn: async () => {
      const res = await fetch(reportConfig!.endpoint, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!reportConfig,
  });
  const data = dataQuery.data ?? [];

  const handleView = () => {
    if (!selectedReport) return;
    setPreviewOpen(true);
  };

  const handleDownloadPdf = () => {
    if (!reportConfig) return;
    printReport(columns, data, reportConfig.label);
  };

  const handleExportCsv = () => {
    if (!reportConfig) return;
    const csv = generateCSV(columns, data);
    downloadFile(csv, `${reportConfig.label.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type <span className="text-red-500">*</span></label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedReport && (
              <div className="text-sm text-muted-foreground">
                {dataQuery.isLoading
                  ? "Loading data..."
                  : `${data.length} record${data.length !== 1 ? "s" : ""} found`}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedReport || data.length === 0}
                onClick={handleView}
                data-testid="button-view-report"
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedReport || data.length === 0}
                onClick={handleDownloadPdf}
                data-testid="button-download-report"
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedReport || data.length === 0}
                onClick={handleExportCsv}
                data-testid="button-export-report"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> {reportConfig?.label || "Report"} Preview
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground h-24">
                      No data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row: any, idx: number) => (
                    <TableRow key={row.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.key}>{formatCellValue(col.key, row[col.key])}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
