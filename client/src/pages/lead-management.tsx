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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Filter } from "lucide-react";

const initialLeads = [
  { id: 1, customerName: "Global Tech", lead: "Alex Rivera", stage: "quotation submission" },
  { id: 2, customerName: "Zenith Corp", lead: "Sarah Chen", stage: "sample testing" },
  { id: 3, customerName: "Peak Dynamics", lead: "Marcus Thorne", stage: "purchase order" },
];

const stages = [
  "inquiry", "RFQ", "quotation submission", "sample request", 
  "sample submission", "sample testing", "sample approval", 
  "purchase order", "production"
];

export default function LeadManagement() {
  const [leads, setLeads] = useState(initialLeads);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: "",
    lead: "",
    stage: "inquiry"
  });

  const handleAddLead = () => {
    if (!newLead.customerName) return;
    const lead = {
      ...newLead,
      id: leads.length + 1
    };
    setLeads([...leads, lead]);
    setIsAddOpen(false);
    setNewLead({
      customerName: "",
      lead: "",
      stage: "inquiry"
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <UserPlus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
                <DialogDescription>Track a new business opportunity.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input 
                    id="customer" 
                    className="border-input bg-background" 
                    value={newLead.customerName}
                    onChange={(e) => setNewLead({...newLead, customerName: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lead">Lead Owner</Label>
                  <Input 
                    id="lead" 
                    className="border-input bg-background" 
                    value={newLead.lead}
                    onChange={(e) => setNewLead({...newLead, lead: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sales Stage</Label>
                  <Select 
                    value={newLead.stage} 
                    onValueChange={(v) => setNewLead({...newLead, stage: v})}
                  >
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddLead}>Save Lead</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center font-bold text-foreground">S.No</TableHead>
                <TableHead className="font-bold text-foreground">Customer Name</TableHead>
                <TableHead className="font-bold text-foreground">Lead Owner</TableHead>
                <TableHead className="font-bold text-foreground">Current Stage</TableHead>
                <TableHead className="text-right pr-6 font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow key={lead.id} className="hover:bg-accent/5 transition-colors border-b border-border last:border-0">
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-primary">{lead.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.lead}</TableCell>
                  <TableCell>
                    <Select defaultValue={lead.stage}>
                      <SelectTrigger className="h-9 w-56 border-input bg-background text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="outline" size="sm" className="h-8 border-border hover:bg-muted">Update</Button>
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
