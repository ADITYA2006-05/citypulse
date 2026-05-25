# PRD: CityPulse Smart City Issue Management

## 1. Product Overview
CityPulse is a smart civic infrastructure portal designed to empower residents to report local urban issues and enable city administrators to manage, monitor, and resolve those reports. It couples community-driven incident reporting with an administrative operations dashboard built on modern web technologies.

## 2. Objectives
- Enable citizens to submit and track public issue reports quickly.
- Provide a searchable, filterable community board of active city incidents.
- Support administrators with insights, report triage, and status updates.
- Offer secure access control for citizen and admin roles.
- Deliver a clean, performant UI optimized for web and rapid deployment.

## 3. Key User Personas
- **Citizen**: A resident who wants to report potholes, broken street lights, waste issues, traffic signal problems, water leaks, and other public infrastructure concerns.
- **City Official / Admin**: A municipal operator who reviews incoming reports, updates issue status, views analytics, and communicates progress through the dashboard.

## 4. Core Features

### 4.1 Citizen Experience
- Landing page with hero messaging, live issue metrics, and community board.
- Issue report creation workflow with:
  - category selection
  - title and description
  - severity selection
  - address and optional mock geolocation
  - optional image upload
- Protected report submission requiring user login.
- Client-side search and filtering by issue category and status.
- Upvote support for citizen reports to surface community priority.
- Issue detail cards with summary, location, status, severity, and support counts.

### 4.2 Administrator Experience
- Admin command center gated behind admin credentials.
- Live report list with filter tabs for Pending, In Progress, Resolved, and All.
- Status updates via PATCH API to move issues through workflow stages.
- Visual analytics including:
  - category distribution bar chart
  - resolution pipeline pie chart
- Admin comments/posts associated with reports.

### 4.3 Data and System Behavior
- Persisted reports via Prisma-backed data layer.
- API routes for CRUD operations:
  - GET `/api/reports` - list and filter reports
  - POST `/api/reports` - create a new report
  - PATCH `/api/reports/[id]` - update status, upvote, or modify report fields
  - GET `/api/reports/[id]` - retrieve report details
  - POST `/api/reports/[id]/comments` - add comments to a report
- Client-side filtering for category, status, and text search.

## 5. Product Scope

### In-Scope
- Issue creation and submission for citizens
- Live issue board with sorting and filtering
- Admin dashboard for operations and analytics
- Basic auth session management using NextAuth and local credentials
- Embedded charts using Recharts
- Responsive UI with Next.js App Router
- Prisma integration with PostgreSQL support

### Out-of-Scope (for current version)
- Real-time collaboration or WebSocket updates
- Map integration with live geolocation pins
- Advanced moderation / multi-step approval workflows
- Full comment threading or notifications
- Mobile app version beyond responsive web design

## 6. Success Metrics
- Citizens can submit reports in under 2 minutes.
- Admins can identify and update issue status in one click.
- Report board loads in under 2 seconds on first view.
- Increase visibility of community issues via search and filters.
- Support story collection through upvotes and comments.

## 7. Architecture Summary
- Frontend: Next.js 16 with App Router, React 19, Tailwind CSS, lucide-react icons.
- Data Layer: Prisma client with a Postgres-compatible adapter.
- Auth: NextAuth for third-party sign-in plus local session fallback.
- Charts: Recharts for admin analytics.
- Deployment: Cloudflare Workers via OpenNext.js and Wrangler.

## 8. User Flows

### Citizen Report Flow
1. User lands on `/` and sees the dashboard.
2. User filters or searches existing issues.
3. User clicks `Register a Problem` and is sent to `/reports/new`.
4. If not authenticated, user is prompted to log in.
5. User completes the issue form, optionally uploads an image, and submits.
6. Report is created with default status `PENDING`.
7. User returns to the home dashboard to see the report in the board.

### Admin Workflow
1. Admin logs in and visits `/admin`.
2. Admin reviews counts, bar/pie charts, and issue status tabs.
3. Admin selects pending or in-progress issues.
4. Admin updates issue status to `IN_PROGRESS` or `RESOLVED`.
5. Changes are persisted through PATCH `/api/reports/[id]`.

## 9. Technical Considerations
- Use client-side hydration for interactive filters, upvotes, and form submission.
- Maintain mock fallback behavior when backend connection fails.
- Keep issue cards accessible and intuitive for both citizen and admin interactions.
- Store user session in localStorage for fallback auth state.

## 10. Future Enhancements
- Real location capture via device GPS and map visualization.
- Report timelines, notifications, and email alerts.
- Role-based admin permissions and audit logging.
- Multi-language support and accessibility improvements.
- Exportable civic issue reports for city operations.
