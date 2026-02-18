import { Link } from "wouter";
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
import { Plus } from "lucide-react";

const initialMeetings = [
  { id: 1, title: "Weekly Sync", date: new Date(), time: "10:00", location: "Conference Room A" },
  { id: 2, title: "Client Review", date: new Date(new Date().setDate(new Date().getDate() + 1)), time: "14:00", location: "Online" },
];

export default function MeetingManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState(initialMeetings);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    location: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateMeeting = () => {
    const newErrors: Record<string, string> = {};
    if (!newMeeting.title) newErrors.title = "Title is required";
    if (!newMeeting.time) newErrors.time = "Time is required";
    if (!newMeeting.location) newErrors.location = "Location is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMeeting = () => {
    if (!validateMeeting()) return;
    
    if (!date) return;

    const meeting = {
      id: meetings.length + 1,
      title: newMeeting.title,
      time: newMeeting.time,
      location: newMeeting.location,
      date: date
    };

    setMeetings([...meetings, meeting]);
    setIsAddOpen(false);
    setNewMeeting({
      title: "",
      time: "",
      location: ""
    });
    setErrors({});
  };

  const filteredMeetings = meetings.filter(meeting => 
    date && meeting.date.toDateString() === date.toDateString()
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meeting Management</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Meeting Title" 
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                </div>
                <div className="grid gap-2">
                  <Label>Time <span className="text-red-500">*</span></Label>
                  <Input 
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
                    placeholder="Location" 
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && <span className="text-xs text-red-500">{errors.location}</span>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMeeting}>Save</Button>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No meetings scheduled for this date.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>{meeting.date.toLocaleDateString()}</TableCell>
                        <TableCell>{meeting.time}</TableCell>
                        <TableCell>{meeting.location}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                             <Link href={`/mom?title=${encodeURIComponent(meeting.title)}&date=${encodeURIComponent(meeting.date.toISOString())}&time=${encodeURIComponent(meeting.time)}`}>
                               Create MOM
                             </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
