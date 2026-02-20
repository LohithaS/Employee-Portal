import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("Employee"),
  phone: text("phone"),
  department: text("department"),
  designation: text("designation"),
  reportingTo: text("reporting_to"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  assignedBy: text("assigned_by"),
  assignedTo: text("assigned_to"),
  deadline: text("deadline").notNull(),
  backupPlan: text("backup_plan"),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("New"),
  remarks: text("remarks"),
  userId: integer("user_id"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  product: text("product").notNull(),
  region: text("region").notNull(),
  accountHolder: text("account_holder").notNull(),
  description: text("description"),
  stakeholders: text("stakeholders"),
  userId: integer("user_id"),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  lead: text("lead").notNull(),
  stage: text("stage").notNull().default("inquiry"),
  department: text("department"),
  projectName: text("project_name"),
  contactName: text("contact_name"),
  contactNumber: text("contact_number"),
  email: text("email"),
  location: text("location"),
  productDescription: text("product_description"),
  quantity: text("quantity"),
  valueInr: text("value_inr"),
  remarks: text("remarks"),
  userId: integer("user_id"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  client: text("client").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(),
  lastService: text("last_service").notNull(),
  info: text("info").notNull(),
  nextService: text("next_service").notNull(),
  region: text("region").notNull(),
  userId: integer("user_id"),
});

export const insertMachineSchema = createInsertSchema(machines).omit({ id: true });
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machines.$inferSelect;

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  incidentId: text("incident_id"),
  customer: text("customer").notNull(),
  region: text("region").notNull(),
  model: text("model").notNull(),
  complaint: text("complaint").notNull(),
  assignedTo: text("assigned_to").notNull(),
  created: text("created").notNull(),
  deadline: text("deadline").notNull(),
  status: text("status").notNull().default("Open"),
  userId: integer("user_id"),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  agenda: text("agenda"),
  attendees: text("attendees"),
  userId: integer("user_id"),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

export const momPoints = pgTable("mom_points", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id"),
  discussion: text("discussion").notNull(),
  decision: text("decision"),
  actionItem: text("action_item"),
  responsibility: text("responsibility"),
  remarks: text("remarks"),
  userId: integer("user_id"),
});

export const insertMomPointSchema = createInsertSchema(momPoints).omit({ id: true });
export type InsertMomPoint = z.infer<typeof insertMomPointSchema>;
export type MomPoint = typeof momPoints.$inferSelect;

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  purpose: text("purpose").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  outcome: text("outcome").notNull(),
  status: text("status").notNull().default("Pending"),
  userId: integer("user_id"),
});

export const insertTripSchema = createInsertSchema(trips).omit({ id: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export const reimbursements = pgTable("reimbursements", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: text("amount").notNull(),
  date: text("date").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Pending"),
  rejectionReason: text("rejection_reason"),
  userId: integer("user_id"),
});

export const insertReimbursementSchema = createInsertSchema(reimbursements).omit({ id: true });
export type InsertReimbursement = z.infer<typeof insertReimbursementSchema>;
export type Reimbursement = typeof reimbursements.$inferSelect;

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("Pending"),
  rejectionReason: text("rejection_reason"),
  userId: integer("user_id"),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true });
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
