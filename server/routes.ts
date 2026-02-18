import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, registerUser, loginUser } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await registerUser(username, password, name || username, role || "Employee");
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Please select a login type" });
      }
      const user = await loginUser(username, password, role);
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/tasks", requireAuth, async (_req, res) => {
    const data = await storage.getTasks();
    res.json(data);
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const task = await storage.createTask({ ...req.body, userId: req.session.userId });
      res.json(task);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateTask(id, req.body);
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  });

  app.get("/api/clients", requireAuth, async (_req, res) => {
    const data = await storage.getClients();
    res.json(data);
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const client = await storage.createClient({ ...req.body, userId: req.session.userId });
      res.json(client);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/leads", requireAuth, async (_req, res) => {
    const data = await storage.getLeads();
    res.json(data);
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const lead = await storage.createLead({ ...req.body, userId: req.session.userId });
      res.json(lead);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/leads/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateLead(id, req.body);
    if (!updated) return res.status(404).json({ message: "Lead not found" });
    res.json(updated);
  });

  app.get("/api/machines", requireAuth, async (_req, res) => {
    const data = await storage.getMachines();
    res.json(data);
  });

  app.post("/api/machines", requireAuth, async (req, res) => {
    try {
      const machine = await storage.createMachine({ ...req.body, userId: req.session.userId });
      res.json(machine);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/tickets", requireAuth, async (_req, res) => {
    const data = await storage.getTickets();
    res.json(data);
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.createTicket({ ...req.body, userId: req.session.userId });
      res.json(ticket);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateTicket(id, req.body);
    if (!updated) return res.status(404).json({ message: "Ticket not found" });
    res.json(updated);
  });

  app.get("/api/meetings", requireAuth, async (_req, res) => {
    const data = await storage.getMeetings();
    res.json(data);
  });

  app.post("/api/meetings", requireAuth, async (req, res) => {
    try {
      const meeting = await storage.createMeeting({ ...req.body, userId: req.session.userId });
      res.json(meeting);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/mom-points", requireAuth, async (req, res) => {
    const meetingId = req.query.meetingId ? parseInt(req.query.meetingId as string) : undefined;
    const data = await storage.getMomPoints(meetingId);
    res.json(data);
  });

  app.post("/api/mom-points", requireAuth, async (req, res) => {
    try {
      const point = await storage.createMomPoint({ ...req.body, userId: req.session.userId });
      res.json(point);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/trips", requireAuth, async (_req, res) => {
    const data = await storage.getTrips();
    res.json(data);
  });

  app.post("/api/trips", requireAuth, async (req, res) => {
    try {
      const trip = await storage.createTrip({ ...req.body, userId: req.session.userId });
      res.json(trip);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/reimbursements", requireAuth, async (_req, res) => {
    const data = await storage.getReimbursements();
    res.json(data);
  });

  app.post("/api/reimbursements", requireAuth, async (req, res) => {
    try {
      const r = await storage.createReimbursement({ ...req.body, userId: req.session.userId });
      res.json(r);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/leave-requests", requireAuth, async (_req, res) => {
    const data = await storage.getLeaveRequests();
    res.json(data);
  });

  app.post("/api/leave-requests", requireAuth, async (req, res) => {
    try {
      const r = await storage.createLeaveRequest({ ...req.body, userId: req.session.userId });
      res.json(r);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  return httpServer;
}
