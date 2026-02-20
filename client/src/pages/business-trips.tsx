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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Paperclip, Trash2, PlusCircle, Eye, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Stakeholder {
  name: string;
  designation: string;
}

export default function BusinessTripReports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [viewTrip, setViewTrip] = useState<any>(null);
  const { toast } = useToast();
  
  const tripsQuery = useQuery<any[]>({ queryKey: ["/api/trips"] });
  const trips = tripsQuery.data ?? [];

  const clientsQuery = useQuery<any[]>({ queryKey: ["/api/clients"] });
  const clientsList = clientsQuery.data ?? [];

  const [newTrip, setNewTrip] = useState({
    purpose: "",
    location: "",
    startDate: "",
    endDate: "",
    outcome: "",
    client: "",
    pointsDiscussed: "",
    actionPoints: "",
    associate: "",
  });

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([{ name: "", designation: "" }]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      await apiRequest("POST", "/api/trips", tripData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Trip report submitted successfully" });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/trips/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      setIsEditOpen(false);
      setEditingTrip(null);
      resetForm();
      toast({ title: "Trip report updated successfully" });
    },
  });

  const openEditDialog = (trip: any) => {
    setEditingTrip(trip);
    setNewTrip({
      purpose: trip.purpose || "",
      location: trip.location || "",
      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      outcome: trip.outcome || "",
      client: trip.client || "",
      pointsDiscussed: trip.pointsDiscussed || "",
      actionPoints: trip.actionPoints || "",
      associate: trip.associate || "",
    });
    setStakeholders(parseStakeholders(trip.stakeholders).length > 0 ? parseStakeholders(trip.stakeholders) : [{ name: "", designation: "" }]);
    setErrors({});
    setIsEditOpen(true);
  };

  const handleUpdateTrip = (status: string) => {
    if (status === "Pending" && !validateTrip()) return;
    if (status === "Draft" && !newTrip.purpose) {
      setErrors({ purpose: "Purpose is required to save" });
      return;
    }

    const validStakeholders = stakeholders.filter(s => s.name.trim());

    updateTripMutation.mutate({
      id: editingTrip.id,
      data: {
        purpose: newTrip.purpose,
        location: newTrip.location || "",
        startDate: newTrip.startDate || "",
        endDate: newTrip.endDate || "",
        outcome: newTrip.outcome || "",
        client: newTrip.client,
        stakeholders: JSON.stringify(validStakeholders),
        pointsDiscussed: newTrip.pointsDiscussed,
        actionPoints: newTrip.actionPoints,
        associate: newTrip.associate,
        status,
      },
    });
  };

  const resetForm = () => {
    setNewTrip({
      purpose: "",
      location: "",
      startDate: "",
      endDate: "",
      outcome: "",
      client: "",
      pointsDiscussed: "",
      actionPoints: "",
      associate: "",
    });
    setStakeholders([{ name: "", designation: "" }]);
    setErrors({});
  };

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { name: "", designation: "" }]);
  };

  const removeStakeholder = (index: number) => {
    if (stakeholders.length === 1) return;
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: string) => {
    const updated = [...stakeholders];
    updated[index][field] = value;
    setStakeholders(updated);
  };

  const validateTrip = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date().toISOString().split("T")[0];
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0];
    if (!newTrip.purpose) newErrors.purpose = "Purpose is required";
    if (!newTrip.location) newErrors.location = "Location is required";
    if (!newTrip.client) newErrors.client = "Client is required";
    if (!newTrip.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (newTrip.startDate > today) {
      newErrors.startDate = "Start date cannot be a future date";
    }
    if (!newTrip.endDate) {
      newErrors.endDate = "End date is required";
    } else if (newTrip.endDate > today) {
      newErrors.endDate = "End date cannot be a future date";
    } else if (newTrip.startDate && newTrip.endDate && newTrip.endDate < newTrip.startDate) {
      newErrors.endDate = "End date cannot be before start date";
    } else if (newTrip.endDate < tenDaysAgo) {
      newErrors.endDate = "Filing window expired — reports must be filed within 10 days of trip end date";
    }
    if (!newTrip.outcome) newErrors.outcome = "Outcome is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTrip = (status: string) => {
    if (status === "Pending" && !validateTrip()) return;
    if (status === "Draft" && !newTrip.purpose) {
      setErrors({ purpose: "Purpose is required to save" });
      return;
    }

    const validStakeholders = stakeholders.filter(s => s.name.trim());

    addTripMutation.mutate({
      purpose: newTrip.purpose,
      location: newTrip.location || "",
      startDate: newTrip.startDate || "",
      endDate: newTrip.endDate || "",
      outcome: newTrip.outcome || "",
      client: newTrip.client,
      stakeholders: JSON.stringify(validStakeholders),
      pointsDiscussed: newTrip.pointsDiscussed,
      actionPoints: newTrip.actionPoints,
      associate: newTrip.associate,
      status,
    });
  };

  const parseStakeholders = (data: string | null): Stakeholder[] => {
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  if (tripsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading trips...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Trip Reports</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-trip">
                <Plus className="mr-2 h-4 w-4" /> New Trip Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create Trip Report</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Client <span className="text-red-500">*</span></Label>
                    <Select value={newTrip.client} onValueChange={(val) => setNewTrip({...newTrip, client: val})}>
                      <SelectTrigger className={errors.client ? "border-red-500" : ""} data-testid="select-trip-client">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsList.map((c: any) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.client && <span className="text-xs text-red-500">{errors.client}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label>Purpose <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="Trip Purpose" 
                      value={newTrip.purpose}
                      onChange={(e) => setNewTrip({...newTrip, purpose: e.target.value})}
                      className={errors.purpose ? "border-red-500" : ""}
                      data-testid="input-trip-purpose"
                    />
                    {errors.purpose && <span className="text-xs text-red-500">{errors.purpose}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="City, Country" 
                      value={newTrip.location}
                      onChange={(e) => setNewTrip({...newTrip, location: e.target.value})}
                      className={errors.location ? "border-red-500" : ""}
                      data-testid="input-trip-location"
                    />
                    {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date <span className="text-red-500">*</span></Label>
                      <Input 
                        type="date"
                        max={newTrip.endDate || new Date().toISOString().split("T")[0]}
                        value={newTrip.startDate}
                        onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                        className={errors.startDate ? "border-red-500" : ""}
                        data-testid="input-trip-start-date"
                      />
                      {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date <span className="text-red-500">*</span></Label>
                      <Input 
                        type="date"
                        min={newTrip.startDate || new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0]}
                        max={new Date().toISOString().split("T")[0]}
                        value={newTrip.endDate}
                        onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                        className={errors.endDate ? "border-red-500" : ""}
                        data-testid="input-trip-end-date"
                      />
                      {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">Trip reports must be filed within 10 days of the trip end date.</p>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Stakeholders</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addStakeholder} data-testid="button-add-stakeholder">
                        <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add More
                      </Button>
                    </div>
                    {stakeholders.map((sh, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Stakeholder name"
                            value={sh.name}
                            onChange={(e) => updateStakeholder(idx, "name", e.target.value)}
                            data-testid={`input-stakeholder-name-${idx}`}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Designation"
                            value={sh.designation}
                            onChange={(e) => updateStakeholder(idx, "designation", e.target.value)}
                            data-testid={`input-stakeholder-designation-${idx}`}
                          />
                        </div>
                        {stakeholders.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => removeStakeholder(idx)} data-testid={`button-remove-stakeholder-${idx}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2">
                    <Label>Points Discussed</Label>
                    <Textarea 
                      placeholder="Key points discussed during the trip..." 
                      value={newTrip.pointsDiscussed}
                      onChange={(e) => setNewTrip({...newTrip, pointsDiscussed: e.target.value})}
                      rows={3}
                      data-testid="input-trip-points-discussed"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Action Points</Label>
                    <Textarea 
                      placeholder="Action items from the trip..." 
                      value={newTrip.actionPoints}
                      onChange={(e) => setNewTrip({...newTrip, actionPoints: e.target.value})}
                      rows={3}
                      data-testid="input-trip-action-points"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Associate</Label>
                    <Input 
                      placeholder="Associate name" 
                      value={newTrip.associate}
                      onChange={(e) => setNewTrip({...newTrip, associate: e.target.value})}
                      data-testid="input-trip-associate"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Outcome <span className="text-red-500">*</span></Label>
                    <Textarea 
                      placeholder="Key outcomes..." 
                      value={newTrip.outcome}
                      onChange={(e) => setNewTrip({...newTrip, outcome: e.target.value})}
                      className={errors.outcome ? "border-red-500" : ""}
                      rows={3}
                      data-testid="input-trip-outcome"
                    />
                    {errors.outcome && <span className="text-xs text-red-500">{errors.outcome}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label>Attachments</Label>
                    <Input type="file" data-testid="input-trip-attachments" />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => handleSaveTrip("Draft")} disabled={addTripMutation.isPending} data-testid="button-save-trip">
                  Save as Draft
                </Button>
                <Button onClick={() => handleSaveTrip("Pending")} disabled={addTripMutation.isPending} data-testid="button-submit-trip">
                  Submit for Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Associate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No trip reports yet. Click "New Trip Report" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip: any) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.client || "-"}</TableCell>
                    <TableCell>{trip.purpose}</TableCell>
                    <TableCell>{trip.location}</TableCell>
                    <TableCell className="whitespace-nowrap">{trip.startDate} to {trip.endDate}</TableCell>
                    <TableCell>{trip.associate || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        trip.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                        trip.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        trip.status === "Draft" ? "bg-slate-50 text-slate-600 border-slate-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }>{trip.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {trip.status === "Draft" && (
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(trip)} data-testid={`button-edit-trip-${trip.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setViewTrip(trip)} data-testid={`button-view-trip-${trip.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!viewTrip} onOpenChange={(open) => { if (!open) setViewTrip(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Trip Report Details</DialogTitle>
          </DialogHeader>
          {viewTrip && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{viewTrip.client || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Associate</p>
                    <p className="font-medium">{viewTrip.associate || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{viewTrip.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{viewTrip.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dates</p>
                    <p className="font-medium">{viewTrip.startDate} to {viewTrip.endDate}</p>
                  </div>
                </div>

                {parseStakeholders(viewTrip.stakeholders).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Stakeholders</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Designation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parseStakeholders(viewTrip.stakeholders).map((s, i) => (
                          <TableRow key={i}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.designation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {viewTrip.pointsDiscussed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Points Discussed</p>
                    <p className="font-medium whitespace-pre-wrap">{viewTrip.pointsDiscussed}</p>
                  </div>
                )}

                {viewTrip.actionPoints && (
                  <div>
                    <p className="text-sm text-muted-foreground">Action Points</p>
                    <p className="font-medium whitespace-pre-wrap">{viewTrip.actionPoints}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Outcome</p>
                  <p className="font-medium whitespace-pre-wrap">{viewTrip.outcome}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={
                    viewTrip.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" :
                    viewTrip.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }>{viewTrip.status}</Badge>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingTrip(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Trip Report</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Client <span className="text-red-500">*</span></Label>
                <Select value={newTrip.client} onValueChange={(val) => setNewTrip({...newTrip, client: val})}>
                  <SelectTrigger className={errors.client ? "border-red-500" : ""} data-testid="select-edit-trip-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsList.map((c: any) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && <span className="text-xs text-red-500">{errors.client}</span>}
              </div>

              <div className="grid gap-2">
                <Label>Purpose <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Trip Purpose" 
                  value={newTrip.purpose}
                  onChange={(e) => setNewTrip({...newTrip, purpose: e.target.value})}
                  className={errors.purpose ? "border-red-500" : ""}
                  data-testid="input-edit-trip-purpose"
                />
                {errors.purpose && <span className="text-xs text-red-500">{errors.purpose}</span>}
              </div>

              <div className="grid gap-2">
                <Label>Location <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="City, Country" 
                  value={newTrip.location}
                  onChange={(e) => setNewTrip({...newTrip, location: e.target.value})}
                  className={errors.location ? "border-red-500" : ""}
                  data-testid="input-edit-trip-location"
                />
                {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date"
                    max={newTrip.endDate || new Date().toISOString().split("T")[0]}
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                    className={errors.startDate ? "border-red-500" : ""}
                    data-testid="input-edit-trip-start-date"
                  />
                  {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date"
                    min={newTrip.startDate || new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0]}
                    max={new Date().toISOString().split("T")[0]}
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                    className={errors.endDate ? "border-red-500" : ""}
                    data-testid="input-edit-trip-end-date"
                  />
                  {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">Trip reports must be filed within 10 days of the trip end date.</p>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Stakeholders</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStakeholder} data-testid="button-edit-add-stakeholder">
                    <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add More
                  </Button>
                </div>
                {stakeholders.map((sh, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Stakeholder name"
                        value={sh.name}
                        onChange={(e) => updateStakeholder(idx, "name", e.target.value)}
                        data-testid={`input-edit-stakeholder-name-${idx}`}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Designation"
                        value={sh.designation}
                        onChange={(e) => updateStakeholder(idx, "designation", e.target.value)}
                        data-testid={`input-edit-stakeholder-designation-${idx}`}
                      />
                    </div>
                    {stakeholders.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => removeStakeholder(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <Label>Points Discussed</Label>
                <Textarea 
                  placeholder="Key points discussed during the trip..." 
                  value={newTrip.pointsDiscussed}
                  onChange={(e) => setNewTrip({...newTrip, pointsDiscussed: e.target.value})}
                  rows={3}
                  data-testid="input-edit-trip-points-discussed"
                />
              </div>

              <div className="grid gap-2">
                <Label>Action Points</Label>
                <Textarea 
                  placeholder="Action items from the trip..." 
                  value={newTrip.actionPoints}
                  onChange={(e) => setNewTrip({...newTrip, actionPoints: e.target.value})}
                  rows={3}
                  data-testid="input-edit-trip-action-points"
                />
              </div>

              <div className="grid gap-2">
                <Label>Associate</Label>
                <Input 
                  placeholder="Associate name" 
                  value={newTrip.associate}
                  onChange={(e) => setNewTrip({...newTrip, associate: e.target.value})}
                  data-testid="input-edit-trip-associate"
                />
              </div>

              <div className="grid gap-2">
                <Label>Outcome <span className="text-red-500">*</span></Label>
                <Textarea 
                  placeholder="Key outcomes..." 
                  value={newTrip.outcome}
                  onChange={(e) => setNewTrip({...newTrip, outcome: e.target.value})}
                  className={errors.outcome ? "border-red-500" : ""}
                  rows={3}
                  data-testid="input-edit-trip-outcome"
                />
                {errors.outcome && <span className="text-xs text-red-500">{errors.outcome}</span>}
              </div>

              <div className="grid gap-2">
                <Label>Attachments</Label>
                <Input type="file" data-testid="input-edit-trip-attachments" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleUpdateTrip("Draft")} disabled={updateTripMutation.isPending} data-testid="button-update-draft-trip">
              Save as Draft
            </Button>
            <Button onClick={() => handleUpdateTrip("Pending")} disabled={updateTripMutation.isPending} data-testid="button-update-submit-trip">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
