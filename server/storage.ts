import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users, tasks, clients, leads, machines, tickets, meetings, momPoints, trips, reimbursements, leaveRequests,
  type User, type InsertUser,
  type Task, type InsertTask,
  type Client, type InsertClient,
  type Lead, type InsertLead,
  type Machine, type InsertMachine,
  type Ticket, type InsertTicket,
  type Meeting, type InsertMeeting,
  type MomPoint, type InsertMomPoint,
  type Trip, type InsertTrip,
  type Reimbursement, type InsertReimbursement,
  type LeaveRequest, type InsertLeaveRequest,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  updateUserProfile(id: number, data: { name: string; email: string; phone: string; department: string; designation: string; reportingTo: string }): Promise<User | undefined>;
  getUsersReportingTo(managerName: string): Promise<User[]>;

  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;

  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;

  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, data: Partial<Lead>): Promise<Lead | undefined>;

  getMachines(): Promise<Machine[]>;
  createMachine(machine: InsertMachine): Promise<Machine>;

  getTickets(): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined>;

  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;

  getMomPoints(meetingId?: number): Promise<MomPoint[]>;
  createMomPoint(point: InsertMomPoint): Promise<MomPoint>;
  updateMomPoint(id: number, data: Partial<MomPoint>): Promise<MomPoint | undefined>;

  getTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;

  getReimbursements(): Promise<Reimbursement[]>;
  createReimbursement(r: InsertReimbursement): Promise<Reimbursement>;

  getLeaveRequests(): Promise<LeaveRequest[]>;
  createLeaveRequest(r: InsertLeaveRequest): Promise<LeaveRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async updateUserProfile(id: number, data: { name: string; email: string; phone: string; department: string; designation: string; reportingTo: string }): Promise<User | undefined> {
    const [updated] = await db.update(users).set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      reportingTo: data.reportingTo,
    }).where(eq(users.id, id)).returning();
    return updated;
  }

  async getUsersReportingTo(managerName: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.reportingTo, managerName));
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async getClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return updated;
  }

  async getMachines(): Promise<Machine[]> {
    return db.select().from(machines);
  }

  async createMachine(machine: InsertMachine): Promise<Machine> {
    const [created] = await db.insert(machines).values(machine).returning();
    return created;
  }

  async getTickets(): Promise<Ticket[]> {
    return db.select().from(tickets);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updated] = await db.update(tickets).set(data).where(eq(tickets.id, id)).returning();
    return updated;
  }

  async getMeetings(): Promise<Meeting[]> {
    return db.select().from(meetings);
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [created] = await db.insert(meetings).values(meeting).returning();
    return created;
  }

  async getMomPoints(meetingId?: number): Promise<MomPoint[]> {
    if (meetingId) {
      return db.select().from(momPoints).where(eq(momPoints.meetingId, meetingId));
    }
    return db.select().from(momPoints);
  }

  async createMomPoint(point: InsertMomPoint): Promise<MomPoint> {
    const [created] = await db.insert(momPoints).values(point).returning();
    return created;
  }

  async updateMomPoint(id: number, data: Partial<MomPoint>): Promise<MomPoint | undefined> {
    const [updated] = await db.update(momPoints).set(data).where(eq(momPoints.id, id)).returning();
    return updated;
  }

  async getTrips(): Promise<Trip[]> {
    return db.select().from(trips);
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [created] = await db.insert(trips).values(trip).returning();
    return created;
  }

  async getReimbursements(): Promise<Reimbursement[]> {
    return db.select().from(reimbursements);
  }

  async createReimbursement(r: InsertReimbursement): Promise<Reimbursement> {
    const [created] = await db.insert(reimbursements).values(r).returning();
    return created;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return db.select().from(leaveRequests);
  }

  async createLeaveRequest(r: InsertLeaveRequest): Promise<LeaveRequest> {
    const [created] = await db.insert(leaveRequests).values(r).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
