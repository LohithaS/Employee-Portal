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
import { UserPlus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type Lead = {
  id: number;
  customerName: string;
  lead: string;
  stage: string;
  userId?: number;
};

type Client = {
  id: number;
  name: string;
};

const stages = [
  "inquiry", "RFQ", "quotation submission", "sample request",
  "sample submission", "sample testing", "sample approval",
  "purchase order", "production"
];

export default function LeadManagement() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const leadsQuery = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const clientsQuery = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const leads = leadsQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [newLead, setNewLead] = useState({
    customerName: "",
    lead: "",
    stage: "inquiry"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLead = () => {
    const newErrors: Record<string, string> = {};
    if (!newLead.customerName) newErrors.customerName = "Customer name is required";
    if (!newLead.lead) newErrors.lead = "Lead owner is required";
    if (!newLead.stage) newErrors.stage = "Stage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: typeof newLead) => {
      await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsAddOpen(false);
      setNewLead({ customerName: "", lead: "", stage: "inquiry" });
      setErrors({});
      toast({ title: "Lead Created", description: "Successfully added the new lead." });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Lead> }) => {
      await apiRequest("PATCH", `/api/leads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsUpdateOpen(false);
      setSelectedLead(null);
      toast({ title: "Lead Updated", description: "Successfully updated the lead." });
    },
  });

  const handleAddLead = () => {
    if (!validateLead()) return;
    addLeadMutation.mutate(newLead);
  };

  const openUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setIsUpdateOpen(true);
  };

  const handleUpdateLead = () => {
    if (!selectedLead) return;
    updateLeadMutation.mutate({
      id: selectedLead.id,
      data: {
        customerName: selectedLead.customerName,
        lead: selectedLead.lead,
        stage: selectedLead.stage,
      },
    });
  };

  if (leadsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading leads...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-leads-title">Lead Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" data-testid="button-add-lead">
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
                  <Label htmlFor="customer">Customer Name <span className="text-red-500">*</span></Label>
                  {clients.length > 0 ? (
                    <Select
                      value={newLead.customerName}
                      onValueChange={(v) => setNewLead({...newLead, customerName: v})}
                    >
                      <SelectTrigger data-testid="select-lead-customer" className={`border-input bg-background ${errors.customerName ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="customer"
                      data-testid="input-lead-customer"
                      className={`border-input bg-background ${errors.customerName ? "border-red-500" : ""}`}
                      value={newLead.customerName}
                      onChange={(e) => setNewLead({...newLead, customerName: e.target.value})}
                    />
                  )}
                  {errors.customerName && <span className="text-xs text-red-500">{errors.customerName}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lead">Lead Owner <span className="text-red-500">*</span></Label>
                  <Input
                    id="lead"
                    data-testid="input-lead-owner"
                    className={`border-input bg-background ${errors.lead ? "border-red-500" : ""}`}
                    value={newLead.lead}
                    onChange={(e) => setNewLead({...newLead, lead: e.target.value})}
                  />
                  {errors.lead && <span className="text-xs text-red-500">{errors.lead}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Sales Stage <span className="text-red-500">*</span></Label>
                  <Select
                    value={newLead.stage}
                    onValueChange={(v) => setNewLead({...newLead, stage: v})}
                  >
                    <SelectTrigger data-testid="select-lead-stage" className={`border-input bg-background ${errors.stage ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.stage && <span className="text-xs text-red-500">{errors.stage}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddLead} data-testid="button-save-lead">Save Lead</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
            <DialogContent className="bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle>Update Lead Details</DialogTitle>
                <DialogDescription>Modify existing lead information.</DialogDescription>
              </DialogHeader>
              {selectedLead && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="update-customer">Customer Name</Label>
                    {clients.length > 0 ? (
                      <Select
                        value={selectedLead.customerName}
                        onValueChange={(v) => setSelectedLead({...selectedLead, customerName: v})}
                      >
                        <SelectTrigger className="border-input bg-background">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="update-customer"
                        className="border-input bg-background"
                        value={selectedLead.customerName}
                        onChange={(e) => setSelectedLead({...selectedLead, customerName: e.target.value})}
                      />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="update-lead">Lead Owner</Label>
                    <Input
                      id="update-lead"
                      className="border-input bg-background"
                      value={selectedLead.lead}
                      onChange={(e) => setSelectedLead({...selectedLead, lead: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sales Stage</Label>
                    <Select
                      value={selectedLead.stage}
                      onValueChange={(v) => setSelectedLead({...selectedLead, stage: v})}
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
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateLead}>Update Lead</Button>
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
                <TableRow key={lead.id} className="hover:bg-accent/5 transition-colors border-b border-border last:border-0" data-testid={`row-lead-${lead.id}`}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <button
                      className="font-semibold text-primary hover:underline cursor-pointer text-left"
                      onClick={() => navigate(`/crm?client=${encodeURIComponent(lead.customerName)}`)}
                      data-testid={`link-lead-client-${lead.id}`}
                    >
                      {lead.customerName}
                    </button>
                  </TableCell>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-border hover:bg-muted"
                      onClick={() => openUpdateDialog(lead)}
                      data-testid={`button-update-lead-${lead.id}`}
                    >
                      Update
                    </Button>
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
