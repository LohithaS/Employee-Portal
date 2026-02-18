import { useState, useMemo } from "react";
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
import { Plus, Paperclip, MessageSquare, Search, Filter, MoreVertical, FileUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  userId?: number;
};

export default function TaskManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const tasksQuery = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const tasks = tasksQuery.data ?? [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [tempRemarks, setTempRemarks] = useState("");
  
  const [newTask, setNewTask] = useState({
    description: "",
    assignedTo: "",
    deadline: "",
    backupPlan: "",
    remarks: "",
    priority: "Medium" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isManager = user?.username === "manager" || false;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const validateTask = () => {
    const newErrors: Record<string, string> = {};
    if (!newTask.description) newErrors.description = "Description is required";
    if (!newTask.deadline) newErrors.deadline = "Deadline is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: typeof newTask) => {
      await apiRequest("POST", "/api/tasks", {
        description: taskData.description,
        assignedBy: user?.name || "System",
        assignedTo: taskData.assignedTo || "Unassigned",
        deadline: taskData.deadline,
        backupPlan: taskData.backupPlan,
        priority: taskData.priority,
        status: "New",
        remarks: taskData.remarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      setNewTask({
        description: "",
        assignedTo: "",
        deadline: "",
        backupPlan: "",
        remarks: "",
        priority: "Medium",
      });
      setErrors({});
      toast({
        title: "Task Created",
        description: "Successfully added the new task."
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleAddTask = () => {
    if (!validateTask()) return;
    addTaskMutation.mutate(newTask);
  };

  const handleStatusChange = (taskId: number, newStatus: Task["status"]) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
    toast({
      title: "Status Updated",
      description: `Task marked as ${newStatus}`
    });
  };

  const handlePriorityChange = (taskId: number, newPriority: Task["priority"]) => {
    updateTaskMutation.mutate({ id: taskId, data: { priority: newPriority } });
  };

  const openRemarks = (task: Task) => {
    setSelectedTask(task);
    setTempRemarks(task.remarks);
    setIsRemarksOpen(true);
  };

  const saveRemarks = () => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, data: { remarks: tempRemarks } });
      setIsRemarksOpen(false);
      toast({
        title: "Remarks Saved",
        description: "Task notes updated successfully."
      });
    }
  };

  if (tasksQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground">Search, monitor and update project progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 w-full md:w-[250px] bg-background shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Assign a new responsibility to the team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Task Description <span className="text-red-500">*</span></Label>
                    <Input 
                      id="description" 
                      placeholder="e.g. Monthly Revenue Report" 
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assignee">Assign To</Label>
                      <Input 
                        id="assignee" 
                        placeholder="Employee Name" 
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Deadline <span className="text-red-500">*</span></Label>
                      <Input 
                        id="deadline" 
                        type="date" 
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                        className={errors.deadline ? "border-red-500" : ""}
                      />
                      {errors.deadline && <span className="text-xs text-red-500">{errors.deadline}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Initial Priority</Label>
                      <Select 
                        value={newTask.priority}
                        onValueChange={(v: any) => setNewTask({...newTask, priority: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="backup">Backup Plan</Label>
                      <Input 
                        id="backup" 
                        placeholder="Fallback plan..." 
                        value={newTask.backupPlan}
                        onChange={(e) => setNewTask({...newTask, backupPlan: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="remarks">Notes / Remarks</Label>
                    <Textarea 
                      id="remarks" 
                      placeholder="Initial context for the task..." 
                      value={newTask.remarks}
                      onChange={(e) => setNewTask({...newTask, remarks: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead className="min-w-[250px]">Task Description</TableHead>
                  <TableHead>{isManager ? "Assigned To" : "Assigned By"}</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="hidden lg:table-cell">Backup Plan</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions Entered</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No tasks found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task, index) => (
                    <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{task.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {(isManager ? task.assignedTo : task.assignedBy)?.[0] || "?"}
                          </div>
                          <span className="text-sm">{isManager ? task.assignedTo : task.assignedBy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Plus className="h-3 w-3 text-muted-foreground rotate-45" />
                          {task.deadline}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block">
                          {task.backupPlan || "None"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={task.priority} 
                          onValueChange={(value: any) => handlePriorityChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[100px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span>High</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Medium">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span>Medium</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Low">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span>Low</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={task.status} 
                          onValueChange={(value: any) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className={cn(
                            "h-8 w-[120px] text-xs font-medium",
                            task.status === "Completed" ? "text-emerald-600 bg-emerald-50" : 
                            task.status === "In Progress" ? "text-blue-600 bg-blue-50" : "text-slate-600 bg-slate-50"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground italic">
                          {task.remarks || "No actions entered"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openRemarks(task)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Remarks
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Paperclip className="mr-2 h-4 w-4" />
                              Attach File
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Remarks Dialog */}
        <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Remarks</DialogTitle>
              <DialogDescription>
                Update the progress notes for this task.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Write your update here..."
                value={tempRemarks}
                onChange={(e) => setTempRemarks(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>Cancel</Button>
              <Button onClick={saveRemarks}>Save Updates</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
