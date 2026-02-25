# Nexus Portal - Employee Portal Application 

## Overview
A comprehensive employee portal built with React + Express + PostgreSQL. Features authentication, dashboard with interactive widgets, and multiple business modules.

## Current State
Full-stack application with real database persistence and session-based authentication.

## Recent Changes
- **Feb 20, 2026**: Business Trip Reports enhanced with new fields
  - Trips schema: added client, stakeholders (JSON), pointsDiscussed, actionPoints, associate fields
  - Create Trip form: Client dropdown populated from CRM clients, dynamic stakeholders (name + designation with add/remove), points discussed, action points, associate, outcome
  - Trip table: shows Client, Associate columns; View button opens details dialog with stakeholders table
  - UI enhancements: gradient accents on dashboard cards, glassmorphism header, polished sidebar and auth page
- **Feb 19, 2026**: Password Reset on login page using registered email
  - "Reset it" link on login page opens a reset password form (email + new password + confirm)
  - POST /api/auth/reset-password endpoint looks up user by email and updates password
  - Added getUserByEmail storage method and resetPassword auth function
  - Leave Management page: Apply for Leave / Leave History now in horizontal tabs
- **Feb 19, 2026**: Email field added to registration; Change Password now functional
  - Users schema: added email (text) field
  - Registration form: email field with validation added between name and username
  - Settings Change Password: calls POST /api/auth/change-password API
  - Current password verified against stored hash; new password replaces old for future logins
  - Added updateUserPassword storage method and changePassword auth function
- **Feb 19, 2026**: MOM linked to specific meetings with agenda & attendees
  - Meetings schema: added agenda (text) and attendees (JSON) fields
  - Meeting Management form: captures agenda, dynamic attendees list (name + designation with add/remove)
  - "Create MOM" button passes meetingId; MOM page fetches meeting details by ID
  - MOM page displays: meeting details card, agenda card, people involved table, and discussion points
  - Added GET /api/meetings/:id endpoint and getMeeting storage method
- **Feb 18, 2026**: Enhanced CRM and Lead Management linkage
  - CRM table: "Company Name" renamed to "Client"
  - Add Client form: added description, dynamic stakeholders (name + designation with add more)
  - Client name clickable in CRM table → opens detail dialog showing all client data + associated leads
  - Lead Management: customer name populated from CRM clients dropdown
  - Customer name in leads table links back to CRM and auto-opens the matching client detail
  - Clients schema: added description and stakeholders (JSON) fields
- Converted from frontend-only prototype to full-stack with PostgreSQL backend
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
