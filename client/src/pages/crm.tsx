import { useState, useMemo, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Plus, PlusCircle, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type Stakeholder = {
  name: string;
  designation: string;
};

type Client = {
  id: number;
  name: string;
  type: string;
  category: string;
  product: string;
  region: string;
  accountHolder: string;
  description?: string;
  stakeholders?: string;
  userId?: number;
};

type Lead = {
  id: number;
  customerName: string;
  lead: string;
  stage: string;
  userId?: number;
};

type Machine = {
  id: number;
  client: string;
  model: string;
  type: string;
  region: string;
};

const regionColors: Record<string, string> = {
  N: "#3b82f6",
  E: "#10b981",
  W: "#f59e0b",
  S: "#ef4444",
};

const regionLabels: Record<string, string> = {
  N: "North",
  E: "East",
  W: "West",
  S: "South",
};

const stages = [
  "inquiry", "RFQ", "quotation submission", "sample request",
  "sample submission", "sample testing", "sample approval",
  "purchase order", "production"
];

export default function CRM() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const clientsQuery = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const leadsQuery = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const machinesQuery = useQuery<Machine[]>({ queryKey: ["/api/machines"] });
  const clients = clientsQuery.data ?? [];
  const leads = leadsQuery.data ?? [];
  const machines = machinesQuery.data ?? [];
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const regionPieData = useMemo(() => {
    const counts: Record<string, number> = { N: 0, E: 0, W: 0, S: 0 };
    clients.forEach(c => {
      if (counts[c.region] !== undefined) counts[c.region]++;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: regionLabels[key] || key,
      regionKey: key,
      value,
      color: regionColors[key] || "#888",
    }));
  }, [clients]);

  const regionClients = useMemo(() => {
    if (!selectedRegion) return [];
    return clients.filter(c => c.region === selectedRegion);
  }, [clients, selectedRegion]);

  const handlePieClick = (_: any, index: number) => {
    const clicked = regionPieData[index];
    if (clicked) {
      setSelectedRegion(clicked.regionKey);
      setIsRegionOpen(true);
    }
  };

  useEffect(() => {
    if (clients.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const clientName = params.get("client");
      if (clientName) {
        const match = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
        if (match) {
          setSelectedClient(match);
          setIsDetailOpen(true);
          window.history.replaceState({}, "", "/crm");
        }
      }
    }
  }, [clients]);

  const [newClient, setNewClient] = useState({
    name: "",
    type: "tyre1",
    category: "Automotive",
    product: "",
    region: "N",
    accountHolder: "",
    description: "",
  });

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { name: "", designation: "" }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { name: "", designation: "" }]);
  };

  const removeStakeholder = (index: number) => {
    if (stakeholders.length <= 1) return;
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: string) => {
    const updated = [...stakeholders];
    updated[index] = { ...updated[index], [field]: value };
    setStakeholders(updated);
  };

  const validateClient = () => {
    const newErrors: Record<string, string> = {};
    if (!newClient.name) newErrors.name = "Client name is required";
    if (!newClient.type) newErrors.type = "Type is required";
    if (!newClient.category) newErrors.category = "Category is required";
    if (!newClient.product) newErrors.product = "Product is required";
    if (!newClient.region) newErrors.region = "Region is required";
    if (!newClient.accountHolder) newErrors.accountHolder = "Account holder is required";

    const validStakeholders = stakeholders.filter(s => s.name || s.designation);
    for (let i = 0; i < validStakeholders.length; i++) {
      if (validStakeholders[i].name && !validStakeholders[i].designation) {
        newErrors[`stakeholder_${i}_designation`] = "Designation is required";
      }
      if (!validStakeholders[i].name && validStakeholders[i].designation) {
        newErrors[`stakeholder_${i}_name`] = "Stakeholder name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      await apiRequest("POST", "/api/clients", clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddOpen(false);
      setNewClient({
        name: "",
        type: "tyre1",
        category: "Automotive",
        product: "",
        region: "N",
        accountHolder: "",
        description: "",
      });
      setStakeholders([{ name: "", designation: "" }]);
      setErrors({});
      toast({ title: "Client Added", description: "Successfully added the new client." });
    },
  });

  const handleAddClient = () => {
    if (!validateClient()) return;
    const validStakeholders = stakeholders.filter(s => s.name && s.designation);
    addClientMutation.mutate({
      ...newClient,
      stakeholders: validStakeholders.length > 0 ? JSON.stringify(validStakeholders) : null,
    });
  };

  const openClientDetail = (client: Client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const getClientLeads = (clientName: string): Lead[] => {
    return leads.filter(l => l.customerName.toLowerCase() === clientName.toLowerCase());
  };

  const parseStakeholders = (stakeholdersStr?: string): Stakeholder[] => {
    if (!stakeholdersStr) return [];
    try {
      return JSON.parse(stakeholdersStr);
    } catch {
      return [];
    }
  };

  const filteredClients = useMemo(() => {
    if (categoryFilter === "All") return clients;
    return clients.filter(c => c.category === categoryFilter);
  }, [clients, categoryFilter]);

  if (clientsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading clients...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-crm-title">CRM Dashboard</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setErrors({}); } }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-client">
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter client details to expand your network.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Client Name <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      data-testid="input-client-name"
                      className={`border-input bg-background ${errors.name ? "border-red-500" : ""}`}
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select
                      value={newClient.type}
                      onValueChange={(v) => setNewClient({...newClient, type: v})}
                    >
                      <SelectTrigger data-testid="select-client-type" className={`border-input bg-background ${errors.type ? "border-red-500" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tyre1">Tyre 1</SelectItem>
                        <SelectItem value="tyre2">Tyre 2</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select
                      value={newClient.category}
                      onValueChange={(v) => setNewClient({...newClient, category: v})}
                    >
                      <SelectTrigger data-testid="select-client-category" className={`border-input bg-background ${errors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="White goods">White goods</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Defence">Defence</SelectItem>
                        <SelectItem value="Energy sector">Energy sector</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <span className="text-xs text-red-500">{errors.category}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">Product <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input
                      id="product"
                      data-testid="input-client-product"
                      className={`border-input bg-background ${errors.product ? "border-red-500" : ""}`}
                      value={newClient.product}
                      onChange={(e) => setNewClient({...newClient, product: e.target.value})}
                    />
                    {errors.product && <span className="text-xs text-red-500">{errors.product}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">Region <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select
                      value={newClient.region}
                      onValueChange={(v) => setNewClient({...newClient, region: v})}
                    >
                      <SelectTrigger data-testid="select-client-region" className={`border-input bg-background ${errors.region ? "border-red-500" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N">North (N)</SelectItem>
                        <SelectItem value="E">East (E)</SelectItem>
                        <SelectItem value="W">West (W)</SelectItem>
                        <SelectItem value="S">South (S)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.region && <span className="text-xs text-red-500">{errors.region}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="holder" className="text-right">Account Holder <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input
                      id="holder"
                      data-testid="input-client-holder"
                      className={`border-input bg-background ${errors.accountHolder ? "border-red-500" : ""}`}
                      value={newClient.accountHolder}
                      onChange={(e) => setNewClient({...newClient, accountHolder: e.target.value})}
                    />
                    {errors.accountHolder && <span className="text-xs text-red-500">{errors.accountHolder}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">Description</Label>
                  <div className="col-span-3">
                    <Textarea
                      id="description"
                      data-testid="input-client-description"
                      className="border-input bg-background min-h-[80px]"
                      placeholder="Brief description about the client..."
                      value={newClient.description}
                      onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Stakeholders</Label>
                  <div className="col-span-3 space-y-3">
                    {stakeholders.map((sh, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Stakeholder name"
                            data-testid={`input-stakeholder-name-${index}`}
                            className={`border-input bg-background ${errors[`stakeholder_${index}_name`] ? "border-red-500" : ""}`}
                            value={sh.name}
                            onChange={(e) => updateStakeholder(index, "name", e.target.value)}
                          />
                          {errors[`stakeholder_${index}_name`] && (
                            <span className="text-xs text-red-500">{errors[`stakeholder_${index}_name`]}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Designation"
                            data-testid={`input-stakeholder-designation-${index}`}
                            className={`border-input bg-background ${errors[`stakeholder_${index}_designation`] ? "border-red-500" : ""}`}
                            value={sh.designation}
                            onChange={(e) => updateStakeholder(index, "designation", e.target.value)}
                          />
                          {errors[`stakeholder_${index}_designation`] && (
                            <span className="text-xs text-red-500">{errors[`stakeholder_${index}_designation`]}</span>
                          )}
                        </div>
                        {stakeholders.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                            onClick={() => removeStakeholder(index)}
                            data-testid={`button-remove-stakeholder-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={addStakeholder}
                      data-testid="button-add-stakeholder"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Stakeholder
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddClient} data-testid="button-save-client">Save Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Regional Client Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {regionPieData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex justify-center gap-4 mb-4">
                      {regionPieData.map((entry) => (
                        <button
                          key={entry.regionKey}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-accent/10 transition-colors cursor-pointer"
                          onClick={() => { setSelectedRegion(entry.regionKey); setIsRegionOpen(true); }}
                        >
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-xs text-muted-foreground">(0)</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">No clients added yet. Add clients to see the chart.</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      onClick={handlePieClick}
                      cursor="pointer"
                    >
                      {regionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [`${value} clients`, name]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Label>Category Filter</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-input bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="White goods">White goods</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Defence">Defence</SelectItem>
                  <SelectItem value="Energy sector">Energy sector</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center font-semibold text-foreground">S.No</TableHead>
                <TableHead className="font-semibold text-foreground">Client</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Category</TableHead>
                <TableHead className="font-semibold text-foreground">Product Details</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Account Holder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, index) => (
                <TableRow key={client.id} className="hover:bg-accent/5 transition-colors border-b border-border last:border-0" data-testid={`row-client-${client.id}`}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <button
                      className="font-semibold text-primary hover:underline cursor-pointer text-left"
                      onClick={() => openClientDetail(client)}
                      data-testid={`link-client-${client.id}`}
                    >
                      {client.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    {client.type === 'tyre1' ? 'Tyre 1' : 'Tyre 2'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.category}</TableCell>
                  <TableCell className="text-muted-foreground">{client.product}</TableCell>
                  <TableCell className="text-center font-bold text-foreground">{client.region}</TableCell>
                  <TableCell className="text-muted-foreground">{client.accountHolder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            {selectedClient && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedClient.name}</DialogTitle>
                  <DialogDescription>Client details and associated leads</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedClient.type === 'tyre1' ? 'Tyre 1' : 'Tyre 2'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedClient.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{selectedClient.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-medium">{selectedClient.region === 'N' ? 'North' : selectedClient.region === 'E' ? 'East' : selectedClient.region === 'W' ? 'West' : 'South'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Holder</p>
                      <p className="font-medium">{selectedClient.accountHolder}</p>
                    </div>
                  </div>

                  {selectedClient.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="font-medium text-sm">{selectedClient.description}</p>
                    </div>
                  )}

                  {parseStakeholders(selectedClient.stakeholders).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Stakeholders</p>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="font-semibold text-foreground text-sm">Name</TableHead>
                              <TableHead className="font-semibold text-foreground text-sm">Designation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parseStakeholders(selectedClient.stakeholders).map((sh, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm">{sh.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{sh.designation}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Associated Leads</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => { setIsDetailOpen(false); navigate("/lead-management"); }}
                        data-testid="button-go-to-leads"
                      >
                        View All Leads
                      </Button>
                    </div>
                    {getClientLeads(selectedClient.name).length > 0 ? (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="font-semibold text-foreground text-sm">Lead Owner</TableHead>
                              <TableHead className="font-semibold text-foreground text-sm">Stage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getClientLeads(selectedClient.name).map((lead) => (
                              <TableRow key={lead.id}>
                                <TableCell className="text-sm">{lead.lead}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">
                                    {lead.stage.replace(/_/g, " ").toUpperCase()}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No leads associated with this client yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isRegionOpen} onOpenChange={setIsRegionOpen}>
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRegion ? regionLabels[selectedRegion] : ""} Region - Clients</DialogTitle>
              <DialogDescription>Clients registered in the {selectedRegion ? regionLabels[selectedRegion] : ""} region</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {regionClients.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-12 text-center font-semibold text-foreground text-sm">S.No</TableHead>
                        <TableHead className="font-semibold text-foreground text-sm">Client</TableHead>
                        <TableHead className="font-semibold text-foreground text-sm">Category</TableHead>
                        <TableHead className="font-semibold text-foreground text-sm">Product</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionClients.map((client, i) => (
                        <TableRow key={client.id}>
                          <TableCell className="text-center text-sm">{i + 1}</TableCell>
                          <TableCell>
                            <button
                              className="font-semibold text-primary hover:underline cursor-pointer text-left text-sm"
                              onClick={() => { setIsRegionOpen(false); openClientDetail(client); }}
                            >
                              {client.name}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{client.category}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{client.product}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No clients found in this region.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
