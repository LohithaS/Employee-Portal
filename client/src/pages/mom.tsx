import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MOMPoint = {
  id: number;
  discussion: string;
  decision: string;
  actionItem: string;
  responsibility: string;
};

export default function MinutesOfMeeting() {
  const [points, setPoints] = useState<MOMPoint[]>([]);
  const [location, setLocation] = useLocation();
  
  // Parse query params manually
  const getQueryParams = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return {
      title: params.get("title") || "",
      date: params.get("date") || "",
      time: params.get("time") || ""
    };
  };

  const { title, date, time } = getQueryParams();
  const formattedDate = date ? new Date(date).toLocaleDateString() : "";

  const [newPoint, setNewPoint] = useState<MOMPoint>({
    id: 0,
    discussion: "",
    decision: "",
    actionItem: "",
    responsibility: ""
  });

  const handleAddPoint = () => {
    if (newPoint.discussion) {
      setPoints([...points, { ...newPoint, id: points.length + 1 }]);
      setNewPoint({ id: 0, discussion: "", decision: "", actionItem: "", responsibility: "" });
    }
  };

  const handleSubmit = () => {
    // Submit logic
    alert("MOM Submitted!");
    setLocation("/meeting-management");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={() => setLocation("/meeting-management")}>
                 <ArrowLeft className="h-4 w-4" />
               </Button>
               <h1 className="text-3xl font-bold tracking-tight text-foreground">Minutes of Meeting</h1>
             </div>
             {title && (
               <p className="text-muted-foreground ml-10">
                 Recording minutes for <span className="font-semibold text-primary">{title}</span> on {formattedDate} at {time}
               </p>
             )}
          </div>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" /> Save & Submit
          </Button>
        </div>

        {title && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Meeting:</span> <span className="font-medium">{title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span> <span className="font-medium">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span> <span className="font-medium">{time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Record Discussion Points</CardTitle>
            <CardDescription>Add key discussion points, decisions made, and action items assigned.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Discussion Point</Label>
                <Textarea 
                  value={newPoint.discussion}
                  onChange={(e) => setNewPoint({...newPoint, discussion: e.target.value})}
                  placeholder="Topic discussed..."
                />
              </div>
              <div className="space-y-2">
                <Label>Decision</Label>
                <Textarea 
                  value={newPoint.decision}
                  onChange={(e) => setNewPoint({...newPoint, decision: e.target.value})}
                  placeholder="Decision made..."
                />
              </div>
              <div className="space-y-2">
                <Label>Action Item</Label>
                <Textarea 
                  value={newPoint.actionItem}
                  onChange={(e) => setNewPoint({...newPoint, actionItem: e.target.value})}
                  placeholder="Action to be taken..."
                />
              </div>
              <div className="space-y-2">
                <Label>Responsibility</Label>
                <Input 
                  value={newPoint.responsibility}
                  onChange={(e) => setNewPoint({...newPoint, responsibility: e.target.value})}
                  placeholder="Assigned to..."
                />
                <Button className="w-full mt-2" onClick={handleAddPoint}>
                  <Plus className="mr-2 h-4 w-4" /> Add Point
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discussion Point</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Action Item</TableHead>
                <TableHead>Responsibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No points recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                points.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell>{point.discussion}</TableCell>
                    <TableCell>{point.decision}</TableCell>
                    <TableCell>{point.actionItem}</TableCell>
                    <TableCell>{point.responsibility}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
