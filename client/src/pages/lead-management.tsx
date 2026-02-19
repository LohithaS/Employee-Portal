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
import { Textarea } from "@/components/ui/textarea";
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
  department?: string;
  projectName?: string;
  contactName?: string;
  contactNumber?: string;
  email?: string;
  location?: string;
  productDescription?: string;
  quantity?: string;
  valueInr?: string;
  remarks?: string;
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

const departments = [
  "Procurement", "Purchase", "R&D", "Engineering", "Others"
];

const emptyLead = {
  customerName: "",
  lead: "",
  stage: "inquiry",
  department: "",
  projectName: "",
  contactName: "",
  contactNumber: "",
  email: "",
  location: "",
  productDescription: "",
  quantity: "",
  valueInr: "",
  remarks: "",
};

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

  const [newLead, setNewLead] = useState({ ...emptyLead });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLead = () => {
    const newErrors: Record<string, string> = {};
    if (!newLead.customerName) newErrors.customerName = "Client is required";
    if (!newLead.department) newErrors.department = "Department is required";
    if (!newLead.projectName) newErrors.projectName = "Project name is required";
    if (!newLead.contactName) newErrors.contactName = "Name is required";
    if (!newLead.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(newLead.contactNumber)) {
      newErrors.contactNumber = "Enter a valid 10-digit contact number";
    }
    if (!newLead.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!newLead.location) newErrors.location = "Location is required";
    if (!newLead.lead) newErrors.lead = "Lead owner is required";
    if (!newLead.productDescription) newErrors.productDescription = "Product description is required";
    if (!newLead.quantity) newErrors.quantity = "Quantity is required";
    if (!newLead.valueInr) newErrors.valueInr = "Value is required";
    if (!newLead.stage) newErrors.stage = "Lead stage is required";
    if (!newLead.remarks) newErrors.remarks = "Remarks is required";
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
      setNewLead({ ...emptyLead });
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
        department: selectedLead.department,
        projectName: selectedLead.projectName,
        contactName: selectedLead.contactName,
        contactNumber: selectedLead.contactNumber,
        email: selectedLead.email,
        location: selectedLead.location,
        productDescription: selectedLead.productDescription,
        quantity: selectedLead.quantity,
        valueInr: selectedLead.valueInr,
        remarks: selectedLead.remarks,
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
            <DialogContent className="bg-card text-card-foreground border-border max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
                <DialogDescription>Track a new business opportunity.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Client <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                    <Select
                      value={newLead.department}
                      onValueChange={(v) => setNewLead({...newLead, department: v})}
                    >
                      <SelectTrigger data-testid="select-lead-department" className={`border-input bg-background ${errors.department ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && <span className="text-xs text-red-500">{errors.department}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="projectName"
                      data-testid="input-lead-project"
                      className={`border-input bg-background ${errors.projectName ? "border-red-500" : ""}`}
                      value={newLead.projectName}
                      onChange={(e) => setNewLead({...newLead, projectName: e.target.value})}
                    />
                    {errors.projectName && <span className="text-xs text-red-500">{errors.projectName}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="contactName"
                      data-testid="input-lead-contact-name"
                      className={`border-input bg-background ${errors.contactName ? "border-red-500" : ""}`}
                      value={newLead.contactName}
                      onChange={(e) => setNewLead({...newLead, contactName: e.target.value})}
                    />
                    {errors.contactName && <span className="text-xs text-red-500">{errors.contactName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="contactNumber"
                      data-testid="input-lead-contact-number"
                      className={`border-input bg-background ${errors.contactNumber ? "border-red-500" : ""}`}
                      value={newLead.contactNumber}
                      onChange={(e) => setNewLead({...newLead, contactNumber: e.target.value})}
                    />
                    {errors.contactNumber && <span className="text-xs text-red-500">{errors.contactNumber}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-lead-email"
                      className={`border-input bg-background ${errors.email ? "border-red-500" : ""}`}
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="location"
                      data-testid="input-lead-location"
                      className={`border-input bg-background ${errors.location ? "border-red-500" : ""}`}
                      value={newLead.location}
                      onChange={(e) => setNewLead({...newLead, location: e.target.value})}
                    />
                    {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productDescription">Product Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="productDescription"
                    data-testid="input-lead-product-desc"
                    className={`border-input bg-background ${errors.productDescription ? "border-red-500" : ""}`}
                    value={newLead.productDescription}
                    onChange={(e) => setNewLead({...newLead, productDescription: e.target.value})}
                  />
                  {errors.productDescription && <span className="text-xs text-red-500">{errors.productDescription}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                    <Input
                      id="quantity"
                      data-testid="input-lead-quantity"
                      className={`border-input bg-background ${errors.quantity ? "border-red-500" : ""}`}
                      value={newLead.quantity}
                      onChange={(e) => setNewLead({...newLead, quantity: e.target.value})}
                    />
                    {errors.quantity && <span className="text-xs text-red-500">{errors.quantity}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valueInr">Value (in INR) <span className="text-red-500">*</span></Label>
                    <Input
                      id="valueInr"
                      data-testid="input-lead-value"
                      className={`border-input bg-background ${errors.valueInr ? "border-red-500" : ""}`}
                      value={newLead.valueInr}
                      onChange={(e) => setNewLead({...newLead, valueInr: e.target.value})}
                    />
                    {errors.valueInr && <span className="text-xs text-red-500">{errors.valueInr}</span>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Lead Stage <span className="text-red-500">*</span></Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="remarks">Remarks <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="remarks"
                    data-testid="input-lead-remarks"
                    className={`border-input bg-background ${errors.remarks ? "border-red-500" : ""}`}
                    value={newLead.remarks}
                    onChange={(e) => setNewLead({...newLead, remarks: e.target.value})}
                  />
                  {errors.remarks && <span className="text-xs text-red-500">{errors.remarks}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddLead} data-testid="button-save-lead">Save Lead</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
            <DialogContent className="bg-card text-card-foreground border-border max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Lead Details</DialogTitle>
                <DialogDescription>Modify existing lead information.</DialogDescription>
              </DialogHeader>
              {selectedLead && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="update-customer">Client</Label>
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
                      <Label>Department</Label>
                      <Select
                        value={selectedLead.department || ""}
                        onValueChange={(v) => setSelectedLead({...selectedLead, department: v})}
                      >
                        <SelectTrigger className="border-input bg-background">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Project Name</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.projectName || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, projectName: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.contactName || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, contactName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Contact Number</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.contactNumber || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, contactNumber: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        className="border-input bg-background"
                        value={selectedLead.email || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Location</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.location || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, location: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Lead Owner</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.lead}
                        onChange={(e) => setSelectedLead({...selectedLead, lead: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Product Description</Label>
                    <Textarea
                      className="border-input bg-background"
                      value={selectedLead.productDescription || ""}
                      onChange={(e) => setSelectedLead({...selectedLead, productDescription: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Quantity</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.quantity || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, quantity: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Value (in INR)</Label>
                      <Input
                        className="border-input bg-background"
                        value={selectedLead.valueInr || ""}
                        onChange={(e) => setSelectedLead({...selectedLead, valueInr: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Lead Stage</Label>
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

                  <div className="grid gap-2">
                    <Label>Remarks</Label>
                    <Textarea
                      className="border-input bg-background"
                      value={selectedLead.remarks || ""}
                      onChange={(e) => setSelectedLead({...selectedLead, remarks: e.target.value})}
                    />
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
                <TableHead className="font-bold text-foreground">Client</TableHead>
                <TableHead className="font-bold text-foreground">Project Name</TableHead>
                <TableHead className="font-bold text-foreground">Current Stage</TableHead>
                <TableHead className="font-bold text-foreground">Value (in INR)</TableHead>
                <TableHead className="font-bold text-foreground">Remarks</TableHead>
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
                  <TableCell className="text-muted-foreground">{lead.projectName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{lead.stage.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.valueInr || "-"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{lead.remarks || "-"}</TableCell>
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
