# Nexus Portal - Employee Portal Application

## Overview
A comprehensive employee portal built with React + Express + PostgreSQL. Features authentication, dashboard with interactive widgets, and multiple business modules.

## Current State
Full-stack application with real database persistence and session-based authentication.

## Recent Changes
- **Feb 18, 2026**: Converted from frontend-only prototype to full-stack with PostgreSQL backend
- Added session-based authentication (register/login/logout) with bcrypt password hashing
- Defined Drizzle ORM schemas for all entities: users, tasks, clients, leads, machines, tickets, meetings, MOM points, trips, reimbursements, leave requests
- Built REST API routes for all CRUD operations
- Connected all frontend pages to real API calls using TanStack Query
- Business trip dates now use proper date pickers (start/end date fields)

## Project Architecture
- **Frontend**: React 19 + Tailwind CSS v4 + wouter routing + TanStack Query
- **Backend**: Express.js + express-session + connect-pg-simple
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based with bcrypt, stored in PostgreSQL

### Key Directories
- `client/src/pages/` - All page components
- `client/src/components/` - Shared UI components (shadcn/ui)
- `client/src/hooks/` - Auth hook with TanStack Query
- `server/` - Express server, routes, storage, auth
- `shared/schema.ts` - Drizzle schemas and types

### Modules
- Dashboard, Tasks, CRM, Lead Management, Service Management
- Meeting Management, Minutes of Meeting (MOM)
- Business Trip Reports, Reimbursements, Leave Management
- Salary Slip, Company Info, Settings

## User Preferences
- Slate & Indigo color palette
- Inter for UI text, Plus Jakarta Sans for headings
- Red asterisks for mandatory fields
- Inline validation (no alert dialogs)
- Date validation: past dates for history, future dates for deadlines
