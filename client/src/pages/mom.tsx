import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";
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
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Minutes of Meeting</h1>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" /> Save & Submit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record Discussion Points</CardTitle>
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
