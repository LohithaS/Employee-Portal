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

const initialTrips = [
  { id: 1, purpose: "Client Visit - AutoCorp", location: "New York", dates: "Feb 10 - Feb 12, 2026", outcome: "Deal Signed", status: "Approved" },
];

export default function BusinessTripReports() {
  const [trips, setTrips] = useState(initialTrips);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newTrip, setNewTrip] = useState({
    purpose: "",
    location: "",
    dates: "",
    outcome: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateTrip = () => {
    const newErrors: Record<string, string> = {};
    if (!newTrip.purpose) newErrors.purpose = "Purpose is required";
    if (!newTrip.location) newErrors.location = "Location is required";
    if (!newTrip.dates) newErrors.dates = "Dates are required";
    if (!newTrip.outcome) newErrors.outcome = "Outcome is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrip = () => {
    if (!validateTrip()) return;

    const trip = {
      id: trips.length + 1,
      purpose: newTrip.purpose,
      location: newTrip.location,
      dates: newTrip.dates,
      outcome: newTrip.outcome,
      status: "Pending"
    };

    setTrips([...trips, trip]);
    setIsAddOpen(false);
    setNewTrip({
      purpose: "",
      location: "",
      dates: "",
      outcome: ""
    });
    setErrors({});
  };

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
                <div className="grid gap-2">
                  <Label>Dates <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. March 1 - March 5" 
                    value={newTrip.dates}
                    onChange={(e) => setNewTrip({...newTrip, dates: e.target.value})}
                    className={errors.dates ? "border-red-500" : ""}
                  />
                  {errors.dates && <span className="text-xs text-red-500">{errors.dates}</span>}
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
                <Button onClick={handleAddTrip}>Submit for Approval</Button>
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
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.purpose}</TableCell>
                  <TableCell>{trip.location}</TableCell>
                  <TableCell>{trip.dates}</TableCell>
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
