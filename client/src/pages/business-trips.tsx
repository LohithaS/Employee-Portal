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
import { Badge } from "@/components/ui/badge";
import { Plus, Paperclip } from "lucide-react";

export default function BusinessTripReports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  
  const tripsQuery = useQuery<any[]>({ queryKey: ["/api/trips"] });
  const trips = tripsQuery.data ?? [];

  const [newTrip, setNewTrip] = useState({
    purpose: "",
    location: "",
    startDate: "",
    endDate: "",
    outcome: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      await apiRequest("POST", "/api/trips", tripData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      setIsAddOpen(false);
      setNewTrip({ purpose: "", location: "", startDate: "", endDate: "", outcome: "" });
      setErrors({});
      toast({ title: "Trip report submitted successfully" });
    },
  });

  const validateTrip = () => {
    const newErrors: Record<string, string> = {};
    if (!newTrip.purpose) newErrors.purpose = "Purpose is required";
    if (!newTrip.location) newErrors.location = "Location is required";
    if (!newTrip.startDate) newErrors.startDate = "Start date is required";
    if (!newTrip.endDate) newErrors.endDate = "End date is required";
    if (newTrip.startDate && newTrip.endDate && newTrip.startDate > newTrip.endDate) {
       newErrors.endDate = "End date cannot be before start date";
    }
    if (!newTrip.outcome) newErrors.outcome = "Outcome is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrip = () => {
    if (!validateTrip()) return;

    addTripMutation.mutate({
      purpose: newTrip.purpose,
      location: newTrip.location,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      outcome: newTrip.outcome,
      status: "Pending"
    });
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Trip Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Trip Report</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Purpose <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Trip Purpose" 
                    value={newTrip.purpose}
                    onChange={(e) => setNewTrip({...newTrip, purpose: e.target.value})}
                    className={errors.purpose ? "border-red-500" : ""}
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
                  />
                  {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date <span className="text-red-500">*</span></Label>
                    <Input 
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                      className={errors.startDate ? "border-red-500" : ""}
                    />
                    {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date <span className="text-red-500">*</span></Label>
                    <Input 
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                      className={errors.endDate ? "border-red-500" : ""}
                    />
                    {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Outcome <span className="text-red-500">*</span></Label>
                  <Textarea 
                    placeholder="Key outcomes..." 
                    value={newTrip.outcome}
                    onChange={(e) => setNewTrip({...newTrip, outcome: e.target.value})}
                    className={errors.outcome ? "border-red-500" : ""}
                  />
                  {errors.outcome && <span className="text-xs text-red-500">{errors.outcome}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Attachments</Label>
                  <Input type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTrip} disabled={addTripMutation.isPending}>Submit for Approval</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purpose</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip: any) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.purpose}</TableCell>
                  <TableCell>{trip.location}</TableCell>
                  <TableCell>{trip.startDate} - {trip.endDate}</TableCell>
                  <TableCell>{trip.outcome}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{trip.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
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
