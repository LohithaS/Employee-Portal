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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Search, Plus, UserPlus } from "lucide-react";

const initialClients = [
  { id: 1, name: "AutoCorp Solutions", type: "tyre1", category: "Automotive", product: "Engine Components", region: "N", accountHolder: "John Doe" },
  { id: 2, name: "EcoEnergy Systems", type: "tyre2", category: "Energy sector", product: "Solar Panels", region: "S", accountHolder: "Jane Smith" },
  { id: 3, name: "HealthMed Devices", type: "tyre1", category: "Medical", product: "Imaging Scanners", region: "E", accountHolder: "Mike Johnson" },
  { id: 4, name: "DefendTech Industries", type: "tyre1", category: "Defence", product: "Communication Gear", region: "W", accountHolder: "Sarah Wilson" },
  { id: 5, name: "HomeAppliance Co", type: "tyre2", category: "White goods", product: "Refrigerators", region: "N", accountHolder: "Robert Brown" },
];

const regionData = [
  { name: "North", value: 40, color: "#3b82f6" },
  { name: "East", value: 20, color: "#10b981" },
  { name: "West", value: 25, color: "#f59e0b" },
  { name: "South", value: 15, color: "#ef4444" },
];

export default function CRM() {
  const [clients, setClients] = useState(initialClients);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    type: "tyre1",
    category: "Automotive",
    product: "",
    region: "N",
    accountHolder: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateClient = () => {
    const newErrors: Record<string, string> = {};
    if (!newClient.name) newErrors.name = "Company name is required";
    if (!newClient.type) newErrors.type = "Type is required";
    if (!newClient.category) newErrors.category = "Category is required";
    if (!newClient.product) newErrors.product = "Product is required";
    if (!newClient.region) newErrors.region = "Region is required";
    if (!newClient.accountHolder) newErrors.accountHolder = "Account holder is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClient = () => {
    if (!validateClient()) return;

    const client = {
      ...newClient,
      id: clients.length + 1
    };
    setClients([...clients, client]);
    setIsAddOpen(false);
    setNewClient({
      name: "",
      type: "tyre1",
      category: "Automotive",
      product: "",
      region: "N",
      accountHolder: ""
    });
    setErrors({});
  };

  const filteredClients = useMemo(() => {
    if (categoryFilter === "All") return clients;
    return clients.filter(c => c.category === categoryFilter);
  }, [clients, categoryFilter]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM Dashboard</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter client details to expand your network.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Company <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input 
                      id="name" 
                      className={`border-input bg-background ${errors.name ? "border-red-500" : ""}`}
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                    {errors.name && <span className="text-xs text-red-500 absolute">{errors.name}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select 
                      value={newClient.type} 
                      onValueChange={(v) => setNewClient({...newClient, type: v})}
                    >
                      <SelectTrigger className={`border-input bg-background ${errors.type ? "border-red-500" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tyre1">Tyre 1</SelectItem>
                        <SelectItem value="tyre2">Tyre 2</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <span className="text-xs text-red-500 absolute">{errors.type}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select 
                      value={newClient.category} 
                      onValueChange={(v) => setNewClient({...newClient, category: v})}
                    >
                      <SelectTrigger className={`border-input bg-background ${errors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="White goods">White goods</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Defence">Defence</SelectItem>
                        <SelectItem value="Energy sector">Energy sector</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <span className="text-xs text-red-500 absolute">{errors.category}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">Product <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input 
                      id="product" 
                      className={`border-input bg-background ${errors.product ? "border-red-500" : ""}`}
                      value={newClient.product}
                      onChange={(e) => setNewClient({...newClient, product: e.target.value})}
                    />
                    {errors.product && <span className="text-xs text-red-500 absolute">{errors.product}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">Region <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Select 
                      value={newClient.region} 
                      onValueChange={(v) => setNewClient({...newClient, region: v})}
                    >
                      <SelectTrigger className={`border-input bg-background ${errors.region ? "border-red-500" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N">North (N)</SelectItem>
                        <SelectItem value="E">East (E)</SelectItem>
                        <SelectItem value="W">West (W)</SelectItem>
                        <SelectItem value="S">South (S)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.region && <span className="text-xs text-red-500 absolute">{errors.region}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="holder" className="text-right">Holder <span className="text-red-500">*</span></Label>
                  <div className="col-span-3">
                    <Input 
                      id="holder" 
                      className={`border-input bg-background ${errors.accountHolder ? "border-red-500" : ""}`}
                      value={newClient.accountHolder}
                      onChange={(e) => setNewClient({...newClient, accountHolder: e.target.value})}
                    />
                    {errors.accountHolder && <span className="text-xs text-red-500 absolute">{errors.accountHolder}</span>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddClient}>Save Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Regional Client Distribution</CardTitle>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Label>Category Filter</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-input bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="White goods">White goods</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Defence">Defence</SelectItem>
                  <SelectItem value="Energy sector">Energy sector</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center font-semibold text-foreground">S.No</TableHead>
                <TableHead className="font-semibold text-foreground">Company Name</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Category</TableHead>
                <TableHead className="font-semibold text-foreground">Product Details</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Region</TableHead>
                <TableHead className="font-semibold text-foreground">Account Holder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, index) => (
                <TableRow key={client.id} className="hover:bg-accent/5 transition-colors border-b border-border last:border-0">
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-primary">{client.name}</TableCell>
                  <TableCell>
                    {client.type === 'tyre1' ? 'Tyre 1' : 'Tyre 2'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.category}</TableCell>
                  <TableCell className="text-muted-foreground">{client.product}</TableCell>
                  <TableCell className="text-center font-bold text-foreground">{client.region}</TableCell>
                  <TableCell className="text-muted-foreground">{client.accountHolder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
