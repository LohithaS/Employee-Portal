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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Wrench, Plus, Ticket } from "lucide-react";

const initialMachines = [
  { id: 1, client: "AutoCorp Solutions", model: "X-2000", type: "CNC", lastService: "2025-12-15", info: "Routine Maintenance", nextService: "2026-06-15", region: "North" },
  { id: 2, client: "EcoEnergy Systems", model: "Solar-Max", type: "Inverter", lastService: "2026-01-10", info: "Firmware Update", nextService: "2026-07-10", region: "South" },
  { id: 3, client: "HealthMed Devices", model: "Scan-Pro", type: "Scanner", lastService: "2026-02-01", info: "Calibration", nextService: "2026-05-01", region: "East" },
];

const initialTickets = [
  { id: 1, customer: "AutoCorp Solutions", region: "North", model: "X-2000", complaint: "Overheating", assignedTo: "Mike Tech", created: "2026-02-15", deadline: "2026-02-18" },
];

const regionData = [
  { name: "North", value: 35, color: "#3b82f6" },
  { name: "East", value: 25, color: "#10b981" },
  { name: "West", value: 20, color: "#f59e0b" },
  { name: "South", value: 20, color: "#ef4444" },
];

export default function ServiceManagement() {
  const [machines, setMachines] = useState(initialMachines);
  const [tickets, setTickets] = useState(initialTickets);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);

  const [newMachine, setNewMachine] = useState({
    client: "",
    model: "",
    type: "",
    lastService: "",
    info: "",
    nextService: "",
    region: "North"
  });

  const [newTicket, setNewTicket] = useState({
    customer: "",
    region: "North",
    model: "",
    complaint: "",
    assignedTo: "",
    created: new Date().toISOString().split('T')[0],
    deadline: ""
  });

  const handleAddMachine = () => {
    if (!newMachine.client || !newMachine.model) return;
    const machine = {
      ...newMachine,
      id: machines.length + 1
    };
    setMachines([...machines, machine]);
    setIsAddMachineOpen(false);
    setNewMachine({
      client: "",
      model: "",
      type: "",
      lastService: "",
      info: "",
      nextService: "",
      region: "North"
    });
  };

  const handleAddTicket = () => {
    if (!newTicket.customer || !newTicket.complaint) return;
    const ticket = {
      ...newTicket,
      id: tickets.length + 1
    };
    setTickets([...tickets, ticket]);
    setIsAddTicketOpen(false);
    setNewTicket({
      customer: "",
      region: "North",
      model: "",
      complaint: "",
      assignedTo: "",
      created: new Date().toISOString().split('T')[0],
      deadline: ""
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Service Management</h1>
          <div className="flex gap-2">
            <Dialog open={isAddMachineOpen} onOpenChange={setIsAddMachineOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Machine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Machine Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Client/Company</Label>
                    <Input 
                      placeholder="Client Name" 
                      value={newMachine.client}
                      onChange={(e) => setNewMachine({...newMachine, client: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Model</Label>
                    <Input 
                      placeholder="Machine Model" 
                      value={newMachine.model}
                      onChange={(e) => setNewMachine({...newMachine, model: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Input 
                      placeholder="Machine Type" 
                      value={newMachine.type}
                      onChange={(e) => setNewMachine({...newMachine, type: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Last Service Date</Label>
                    <Input 
                      type="date"
                      value={newMachine.lastService}
                      onChange={(e) => setNewMachine({...newMachine, lastService: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Service Info</Label>
                    <Input 
                      placeholder="Maintenance Details" 
                      value={newMachine.info}
                      onChange={(e) => setNewMachine({...newMachine, info: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Upcoming Service</Label>
                    <Input 
                      type="date"
                      value={newMachine.nextService}
                      onChange={(e) => setNewMachine({...newMachine, nextService: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMachine}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddTicketOpen} onOpenChange={setIsAddTicketOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Ticket className="mr-2 h-4 w-4" /> Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                    <Label>Customer Name</Label>
                    <Input 
                      placeholder="Customer Name" 
                      value={newTicket.customer}
                      onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Region</Label>
                    <Select 
                      value={newTicket.region}
                      onValueChange={(v) => setNewTicket({...newTicket, region: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="East">East</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Machine Model</Label>
                    <Input 
                      placeholder="Model Number" 
                      value={newTicket.model}
                      onChange={(e) => setNewTicket({...newTicket, model: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Complaint Type</Label>
                    <Input 
                      placeholder="Issue Description" 
                      value={newTicket.complaint}
                      onChange={(e) => setNewTicket({...newTicket, complaint: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Assigned To</Label>
                    <Input 
                      placeholder="Technician Name" 
                      value={newTicket.assignedTo}
                      onChange={(e) => setNewTicket({...newTicket, assignedTo: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Deadline</Label>
                    <Input 
                      type="date"
                      value={newTicket.deadline}
                      onChange={(e) => setNewTicket({...newTicket, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTicket}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Regional Sales Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
           
           <Card>
             <CardHeader>
               <CardTitle>Recent Tickets</CardTitle>
             </CardHeader>
             <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.customer}</TableCell>
                        <TableCell>{ticket.complaint}</TableCell>
                        <TableCell><span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs">Open</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Machine Registry</h2>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">S.No</TableHead>
                  <TableHead>Client/Company</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Service Info</TableHead>
                  <TableHead>Upcoming Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine, index) => (
                  <TableRow key={machine.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{machine.client}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.type}</TableCell>
                    <TableCell>{machine.lastService}</TableCell>
                    <TableCell>{machine.info}</TableCell>
                    <TableCell>{machine.nextService}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Support Tickets</h2>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Machine Model</TableHead>
                  <TableHead>Complaint Type</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.customer}</TableCell>
                    <TableCell>{ticket.region}</TableCell>
                    <TableCell>{ticket.model}</TableCell>
                    <TableCell>{ticket.complaint}</TableCell>
                    <TableCell>{ticket.assignedTo}</TableCell>
                    <TableCell>{ticket.created}</TableCell>
                    <TableCell>{ticket.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
