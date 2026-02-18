import { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "nexus-portal-secret-key-2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
  },
});

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerUser(username: string, password: string, name: string, role: string = "Employee") {
  const existing = await storage.getUserByUsername(username);
  if (existing) {
    throw new Error("Username already exists");
  }
  const validRole = role === "Manager" ? "Manager" : "Employee";
  const hashedPassword = await bcrypt.hash(password, 10);
  return storage.createUser({ username, password: hashedPassword, name, role: validRole });
}

export async function loginUser(username: string, password: string, role: string) {
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  if (user.role !== role) {
    throw new Error(`This account is registered as ${user.role}. Please use the ${user.role} login.`);
  }
  return user;
}
