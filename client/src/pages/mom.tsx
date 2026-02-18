import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function MinutesOfMeeting() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const getQueryParams = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return {
      title: params.get("title") || "",
      date: params.get("date") || "",
      time: params.get("time") || "",
      meetingId: params.get("meetingId") || ""
    };
  };

  const { title, date, time, meetingId } = getQueryParams();
  const formattedDate = date ? new Date(date).toLocaleDateString() : "";

  const pointsQuery = useQuery<any[]>({ queryKey: ["/api/mom-points"] });
  const allPoints = pointsQuery.data ?? [];
  const points = meetingId ? allPoints.filter((p: any) => String(p.meetingId) === meetingId) : allPoints;

  const [newPoint, setNewPoint] = useState({
    discussion: "",
    decision: "",
    actionItem: "",
    responsibility: ""
  });

  const addPointMutation = useMutation({
    mutationFn: async (pointData: any) => {
      await apiRequest("POST", "/api/mom-points", pointData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mom-points"] });
      setNewPoint({ discussion: "", decision: "", actionItem: "", responsibility: "" });
      toast({ title: "Point added successfully" });
    },
  });

  const handleAddPoint = () => {
    if (newPoint.discussion) {
      addPointMutation.mutate({
        meetingId: meetingId ? Number(meetingId) : null,
        discussion: newPoint.discussion,
        decision: newPoint.decision,
        actionItem: newPoint.actionItem,
        responsibility: newPoint.responsibility
      });
    }
  };

  const handleSubmit = () => {
    setLocation("/meeting-management");
  };

  if (pointsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

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
                <Button className="w-full mt-2" onClick={handleAddPoint} disabled={addPointMutation.isPending}>
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
                points.map((point: any, index: number) => (
                  <TableRow key={point.id || index}>
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
