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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, ArrowLeft, Eye } from "lucide-react";
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const getQueryParams = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return {
      meetingId: params.get("meetingId") || ""
    };
  };

  const { meetingId } = getQueryParams();

  const meetingQuery = useQuery<any>({
    queryKey: ["/api/meetings", meetingId],
    queryFn: async () => {
      if (!meetingId) return null;
      const res = await fetch(`/api/meetings/${meetingId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!meetingId,
  });

  const meeting = meetingQuery.data;
  const attendees = meeting?.attendees ? JSON.parse(meeting.attendees) : [];

  const pointsQuery = useQuery<any[]>({
    queryKey: ["/api/mom-points", meetingId],
    queryFn: async () => {
      const url = meetingId ? `/api/mom-points?meetingId=${meetingId}` : "/api/mom-points";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const points = pointsQuery.data ?? [];

  const [newPoint, setNewPoint] = useState({
    discussion: "",
    decision: "",
    actionItem: "",
    responsibility: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPointMutation = useMutation({
    mutationFn: async (pointData: any) => {
      await apiRequest("POST", "/api/mom-points", pointData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mom-points", meetingId] });
      setNewPoint({ discussion: "", decision: "", actionItem: "", responsibility: "" });
      setErrors({});
      toast({ title: "Point added successfully" });
    },
  });

  const validatePoint = () => {
    const newErrors: Record<string, string> = {};
    if (!newPoint.discussion.trim()) newErrors.discussion = "Discussion point is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPoint = () => {
    if (!validatePoint()) return;
    addPointMutation.mutate({
      meetingId: meetingId ? Number(meetingId) : null,
      discussion: newPoint.discussion,
      decision: newPoint.decision,
      actionItem: newPoint.actionItem,
      responsibility: newPoint.responsibility
    });
  };

  const handleSubmit = () => {
    toast({ title: "Minutes saved successfully" });
    setLocation("/meetings");
  };

  if (meetingQuery.isLoading || pointsQuery.isLoading) {
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
               <Button variant="ghost" size="icon" onClick={() => setLocation("/meetings")} data-testid="button-back-meetings">
                 <ArrowLeft className="h-4 w-4" />
               </Button>
               <h1 className="text-3xl font-bold tracking-tight text-foreground">Minutes of Meeting</h1>
             </div>
             {meeting && (
               <p className="text-muted-foreground ml-10">
                 Recording minutes for <span className="font-semibold text-primary">{meeting.title}</span> on {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
               </p>
             )}
          </div>
          <Button onClick={handleSubmit} data-testid="button-save-mom">
            <Save className="mr-2 h-4 w-4" /> Save & Submit
          </Button>
        </div>

        {!meeting && !meetingId && (
          <Card className="bg-muted/30">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No meeting selected. Please go to Meeting Management and click "Create MOM" for a specific meeting.</p>
              <Button variant="outline" className="mt-4" onClick={() => setLocation("/meetings")} data-testid="button-go-to-meetings">
                Go to Meeting Management
              </Button>
            </CardContent>
          </Card>
        )}

        {meeting && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-[70px]">Title:</span>
                    <span className="font-medium">{meeting.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-[70px]">Date:</span>
                    <span className="font-medium">{new Date(meeting.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-[70px]">Time:</span>
                    <span className="font-medium">{meeting.time}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-[70px]">Location:</span>
                    <span className="font-medium">{meeting.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{meeting.agenda || "No agenda specified"}</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">People Involved ({attendees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {attendees.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {attendees.map((attendee: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{attendee.name}</span>
                        <span className="text-muted-foreground text-xs">{attendee.designation || "-"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No attendees listed</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Record Discussion Points</CardTitle>
            <CardDescription>Add key discussion points, decisions made, and action items assigned.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Discussion Point <span className="text-red-500">*</span></Label>
                <Textarea 
                  data-testid="input-discussion"
                  value={newPoint.discussion}
                  onChange={(e) => setNewPoint({...newPoint, discussion: e.target.value})}
                  placeholder="Topic discussed..."
                  className={errors.discussion ? "border-red-500" : ""}
                />
                {errors.discussion && <span className="text-xs text-red-500">{errors.discussion}</span>}
              </div>
              <div className="space-y-2">
                <Label>Decision</Label>
                <Textarea 
                  data-testid="input-decision"
                  value={newPoint.decision}
                  onChange={(e) => setNewPoint({...newPoint, decision: e.target.value})}
                  placeholder="Decision made..."
                />
              </div>
              <div className="space-y-2">
                <Label>Action Item</Label>
                <Textarea 
                  data-testid="input-action-item"
                  value={newPoint.actionItem}
                  onChange={(e) => setNewPoint({...newPoint, actionItem: e.target.value})}
                  placeholder="Action to be taken..."
                />
              </div>
              <div className="space-y-2">
                <Label>Responsibility</Label>
                <Input 
                  data-testid="input-responsibility"
                  value={newPoint.responsibility}
                  onChange={(e) => setNewPoint({...newPoint, responsibility: e.target.value})}
                  placeholder="Assigned to..."
                />
                <Button className="w-full mt-2" onClick={handleAddPoint} disabled={addPointMutation.isPending} data-testid="button-add-point">
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
                <TableHead>S.No</TableHead>
                <TableHead>Discussion Point</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Action Item</TableHead>
                <TableHead>Responsibility</TableHead>
                {meeting && <TableHead>Meeting Details</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={meeting ? 6 : 5} className="text-center text-muted-foreground h-24">
                    No points recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                points.map((point: any, index: number) => (
                  <TableRow key={point.id || index} data-testid={`row-mom-point-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{point.discussion}</TableCell>
                    <TableCell>{point.decision || "-"}</TableCell>
                    <TableCell>{point.actionItem || "-"}</TableCell>
                    <TableCell>{point.responsibility || "-"}</TableCell>
                    {meeting && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          onClick={() => setDetailsOpen(true)}
                          data-testid={`button-view-details-${index}`}
                        >
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meeting && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Meeting Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Title:</span>
                  <span className="font-medium">{meeting.title}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Date:</span>
                  <span className="font-medium">{new Date(meeting.date).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Time:</span>
                  <span className="font-medium">{meeting.time}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Location:</span>
                  <span className="font-medium">{meeting.location}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">Agenda</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{meeting.agenda || "No agenda specified"}</p>
              </div>

              {attendees.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold mb-2">People Involved</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Designation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.map((attendee: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{attendee.name}</TableCell>
                          <TableCell>{attendee.designation || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
