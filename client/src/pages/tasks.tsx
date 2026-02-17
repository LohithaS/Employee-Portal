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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Paperclip, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Task = {
  id: number;
  description: string;
  assignedBy?: string;
  assignedTo?: string;
  deadline: string;
  backupPlan: string;
  priority: "High" | "Medium" | "Low";
  status: "New" | "In Progress" | "Completed";
  remarks: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    description: "Quarterly Financial Audit",
    assignedBy: "John Director",
    assignedTo: "Alex Morgan",
    deadline: "2026-03-01",
    backupPlan: "External consultant review",
    priority: "High",
    status: "In Progress",
    remarks: "Awaiting bank statements",
  },
  {
    id: 2,
    description: "Client Presentation Deck",
    assignedBy: "Sarah Manager",
    assignedTo: "Alex Morgan",
    deadline: "2026-02-25",
    backupPlan: "Use previous template",
    priority: "Medium",
    status: "New",
    remarks: "",
  },
];

export default function TaskManagement() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock check for manager role - in a real app this would come from user object
  const isManager = user?.username === "manager" || false;

  const handleStatusChange = (taskId: number, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handlePriorityChange = (taskId: number, newPriority: Task["priority"]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground">Manage and track your project responsibilities.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details to assign a new task.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Task Description</Label>
                  <Input id="description" placeholder="Describe the task..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assignee">Assign To</Label>
                    <Input id="assignee" placeholder="Employee Name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="backup">Backup Plan</Label>
                  <Input id="backup" placeholder="What if the primary plan fails?" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remarks">Initial Remarks</Label>
                  <Textarea id="remarks" placeholder="Any additional notes..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Save Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">S.No</TableHead>
                <TableHead className="min-w-[200px]">Task Description</TableHead>
                <TableHead>{isManager ? "Assigned To" : "Assigned By"}</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Backup Plan</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{isManager ? task.assignedTo : task.assignedBy}</TableCell>
                  <TableCell>{task.deadline}</TableCell>
                  <TableCell className="text-muted-foreground italic text-sm">{task.backupPlan}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={task.priority} 
                      onValueChange={(value: any) => handlePriorityChange(task.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">
                          <Badge variant="destructive" className="bg-red-500">High</Badge>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <Badge variant="secondary" className="bg-amber-500 text-white">Medium</Badge>
                        </SelectItem>
                        <SelectItem value="Low">
                          <Badge variant="outline">Low</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={task.status} 
                      onValueChange={(value: any) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
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
