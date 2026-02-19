import { Link } from "wouter";
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
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export default function MeetingManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    location: "",
    agenda: "",
  });
  const [attendees, setAttendees] = useState<{ name: string; designation: string }[]>([{ name: "", designation: "" }]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const meetingsQuery = useQuery<any[]>({ queryKey: ["/api/meetings"] });
  const meetings = meetingsQuery.data ?? [];

  const addMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      await apiRequest("POST", "/api/meetings", meetingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setIsAddOpen(false);
      setNewMeeting({ title: "", time: "", location: "", agenda: "" });
      setAttendees([{ name: "", designation: "" }]);
      setErrors({});
      toast({ title: "Meeting scheduled successfully" });
    },
  });

  const validateMeeting = () => {
    const newErrors: Record<string, string> = {};
    if (!newMeeting.title) newErrors.title = "Title is required";
    if (!newMeeting.time) newErrors.time = "Time is required";
    if (!newMeeting.location) newErrors.location = "Location is required";
    if (!newMeeting.agenda) newErrors.agenda = "Agenda is required";
    
    const hasValidAttendee = attendees.some(a => a.name.trim() !== "");
    if (!hasValidAttendee) newErrors.attendees = "At least one attendee is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMeeting = () => {
    if (!validateMeeting()) return;
    if (!date) return;

    const validAttendees = attendees.filter(a => a.name.trim() !== "");

    addMeetingMutation.mutate({
      title: newMeeting.title,
      time: newMeeting.time,
      location: newMeeting.location,
      agenda: newMeeting.agenda,
      attendees: JSON.stringify(validAttendees),
      date: date.toISOString()
    });
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", designation: "" }]);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index: number, field: "name" | "designation", value: string) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const filteredMeetings = meetings.filter((meeting: any) => 
    date && new Date(meeting.date).toDateString() === date.toDateString()
  );

  if (meetingsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading meetings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meeting Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-schedule-meeting">
                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input 
                    data-testid="input-meeting-title"
                    placeholder="Meeting Title" 
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Time <span className="text-red-500">*</span></Label>
                    <Input 
                      data-testid="input-meeting-time"
                      type="time" 
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                      className={errors.time ? "border-red-500" : ""}
                    />
                    {errors.time && <span className="text-xs text-red-500">{errors.time}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Input 
                      data-testid="input-meeting-location"
                      placeholder="Location" 
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Agenda <span className="text-red-500">*</span></Label>
                  <Textarea 
                    data-testid="input-meeting-agenda"
                    placeholder="Meeting agenda details..."
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                    className={errors.agenda ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.agenda && <span className="text-xs text-red-500">{errors.agenda}</span>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>People Involved <span className="text-red-500">*</span></Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAttendee} data-testid="button-add-attendee">
                      <Plus className="mr-1 h-3 w-3" /> Add More
                    </Button>
                  </div>
                  {errors.attendees && <span className="text-xs text-red-500">{errors.attendees}</span>}
                  <div className="space-y-2">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          data-testid={`input-attendee-name-${index}`}
                          placeholder="Name"
                          value={attendee.name}
                          onChange={(e) => updateAttendee(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          data-testid={`input-attendee-designation-${index}`}
                          placeholder="Designation"
                          value={attendee.designation}
                          onChange={(e) => updateAttendee(index, "designation", e.target.value)}
                          className="flex-1"
                        />
                        {attendees.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttendee(index)}
                            data-testid={`button-remove-attendee-${index}`}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMeeting} disabled={addMeetingMutation.isPending} data-testid="button-save-meeting">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Scheduled Meetings {date ? `for ${date.toLocaleDateString()}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No meetings scheduled for this date.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMeetings.map((meeting: any) => {
                      const meetingAttendees = meeting.attendees ? JSON.parse(meeting.attendees) : [];
                      return (
                        <TableRow key={meeting.id} data-testid={`row-meeting-${meeting.id}`}>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
                          <TableCell>{meeting.time}</TableCell>
                          <TableCell>{meeting.location}</TableCell>
                          <TableCell>
                            {meetingAttendees.length > 0
                              ? meetingAttendees.map((a: any) => a.name).join(", ")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild data-testid={`button-create-mom-${meeting.id}`}>
                               <Link href={`/mom?meetingId=${meeting.id}`}>
                                 Create MOM
                               </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
