import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, registerUser, loginUser, changePassword, resetPassword } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, role, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await registerUser(username, password, name || username, role || "Employee", email);
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role, rememberMe } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Please select a login type" });
      }
      const user = await loginUser(username, password, role);
      req.session.userId = user.id;
      if (rememberMe && req.session.cookie) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      }
      const { password: _, ...safeUser } = user;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json(safeUser);
      });
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

  app.get("/api/auth/reporting-team", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      const team = await storage.getUsersReportingTo(user.name);
      const safeTeam = team.map(({ password: _, ...u }) => u);
      res.json(safeTeam);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, department, designation, reportingTo } = req.body;
      if (!firstName || !lastName || !email || !phone || !department || !designation || !reportingTo) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const name = `${firstName.trim()} ${lastName.trim()}`;
      const updated = await storage.updateUserProfile(req.session.userId!, {
        name,
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
        reportingTo: reportingTo.trim(),
      });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      const result = await changePassword(req.session.userId!, currentPassword, newPassword);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      if (newPassword.length < 6 || newPassword.length > 12) {
        return res.status(400).json({ message: "Password must be between 6 and 12 characters" });
      }
      const result = await resetPassword(email, newPassword);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
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

  app.get("/api/meetings/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const meeting = await storage.getMeeting(id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json(meeting);
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

  app.patch("/api/mom-points/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const { discussion, decision, actionItem, responsibility, remarks } = req.body;
    const updated = await storage.updateMomPoint(id, { discussion, decision, actionItem, responsibility, remarks });
    if (!updated) return res.status(404).json({ message: "MOM point not found" });
    res.json(updated);
  });

  app.get("/api/trips", requireAuth, async (_req, res) => {
    const data = await storage.getTrips();
    res.json(data);
  });

  app.post("/api/trips", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const today = new Date().toISOString().split("T")[0];
      if (startDate >= today) {
        return res.status(400).json({ message: "Start date must be before today" });
      }
      if (endDate >= today) {
        return res.status(400).json({ message: "End date must be before today" });
      }
      if (endDate < startDate) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      const endDateMs = new Date(endDate).getTime();
      const deadlineMs = endDateMs + 10 * 86400000;
      if (Date.now() > deadlineMs) {
        return res.status(400).json({ message: "Filing window expired — must be within 10 days of trip end date" });
      }
      const trip = await storage.createTrip({ ...req.body, userId: req.session.userId });
      res.json(trip);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put("/api/trips/:id", requireAuth, async (req, res) => {
    try {
      const tripId = Number(req.params.id);
      const existing = await storage.getTrips();
      const tripRecord = existing.find(t => t.id === tripId);
      if (!tripRecord) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (tripRecord.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to edit this trip" });
      }
      if (tripRecord.status !== "Draft") {
        return res.status(400).json({ message: "Only draft trips can be edited" });
      }
      if (tripRecord.endDate) {
        const endDateMs = new Date(tripRecord.endDate).getTime();
        const deadlineMs = endDateMs + 10 * 86400000;
        if (Date.now() > deadlineMs) {
          return res.status(400).json({ message: "Edit window expired — reports can only be edited within 10 days of the trip end date" });
        }
      }
      const trip = await storage.updateTrip(tripId, req.body);
      res.json(trip);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/reimbursements", requireAuth, async (req, res) => {
    const allData = await storage.getReimbursements();
    const data = allData.filter(r => r.userId === req.session.userId);
    res.json(data);
  });

  app.patch("/api/reimbursements/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "Manager") {
        return res.status(403).json({ message: "Only managers can approve or reject claims" });
      }
      const id = parseInt(req.params.id as string);
      const { status, rejectionReason } = req.body;
      if (!status || !["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (status === "Rejected" && (!rejectionReason || !rejectionReason.trim())) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      const updateData: any = { status };
      if (status === "Rejected") {
        updateData.rejectionReason = rejectionReason.trim();
      }
      const updated = await storage.updateReimbursement(id, updateData);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/reimbursements", requireAuth, async (req, res) => {
    try {
      const r = await storage.createReimbursement({ ...req.body, userId: req.session.userId });
      res.json(r);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/pending-approvals", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "Manager") {
        return res.status(403).json({ message: "Only managers can view approvals" });
      }
      const allLeaves = await storage.getLeaveRequests();
      const allReimbursements = await storage.getReimbursements();
      const pendingLeaves = allLeaves.filter(l => l.status === "Pending");
      const pendingReimbursements = allReimbursements.filter(r => r.status === "Pending");

      const userIds = new Set([
        ...pendingLeaves.map(l => l.userId).filter(Boolean),
        ...pendingReimbursements.map(r => r.userId).filter(Boolean),
      ]);

      const userMap: Record<number, string> = {};
      for (const uid of userIds) {
        if (uid) {
          const u = await storage.getUser(uid);
          if (u) userMap[uid] = u.name;
        }
      }

      res.json({
        leaves: pendingLeaves.map(l => ({ ...l, employeeName: l.userId ? userMap[l.userId] || "Unknown" : "Unknown" })),
        reimbursements: pendingReimbursements.map(r => ({ ...r, employeeName: r.userId ? userMap[r.userId] || "Unknown" : "Unknown" })),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/leave-requests", requireAuth, async (req, res) => {
    const allData = await storage.getLeaveRequests();
    const data = allData.filter(l => l.userId === req.session.userId);
    res.json(data);
  });

  app.patch("/api/leave-requests/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "Manager") {
        return res.status(403).json({ message: "Only managers can approve or reject leave requests" });
      }
      const id = parseInt(req.params.id as string);
      const { status, rejectionReason } = req.body;
      if (!status || !["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (status === "Rejected" && (!rejectionReason || !rejectionReason.trim())) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      const updateData: any = { status };
      if (status === "Rejected") {
        updateData.rejectionReason = rejectionReason.trim();
      }
      const updated = await storage.updateLeaveRequest(id, updateData);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
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
