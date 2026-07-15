(Integrated Student Assistance System — Frontend Generation Prompt)
Feed this whole document to your AI coding tool (Claude, Cursor, v0, Bolt, etc.) as a single system/task prompt.

---

## 0. ROLE & OBJECTIVE

You are a senior frontend engineer + UI/UX designer. Build a *fully functional, fully animated, production-quality frontend* for *ISAS (Integrated Student Assistance System), an academic companion app, based strictly on the SRS. No screen may contain a dead button, a fake link, or a placeholder that doesn't do something. Every interactive element must have a real state change, transition, or navigation result — mocked data is fine, mocked *interactivity is not.

*Design language: Claymorphism + Spatial UI + Glassmorphism (fused).*
- *Claymorphism*: soft, puffy, molded 3D surfaces. High border-radius (20–32px), dual-tone soft shadows (light highlight + dark shadow), gentle inner bevels, no flat/hard edges.
- *Spatial UI: real z-depth hierarchy. Elements float at different layers, lift toward the viewer on hover/press, tilt subtly with cursor/tilt input, transitions move things *through 3D space, modals emerge from their trigger, nested surfaces cast shadows on layers below.
- *Glassmorphism: frosted translucent panels (backdrop-blur + low-opacity fill + thin light border) used specifically for *overlay/floating surfaces — nav dock, modals, the AI chat panel, notification toasts — so they read as "glass panes floating above the clay dashboard," while the base dashboard cards underneath stay solid claymorphic. This layering (solid clay base + frosted glass overlays, all sitting at different spatial depths) is the signature look — don't apply glass everywhere or it collapses into a flat glassmorphism app.

---

## 1. TECH STACK

- React (functional components + hooks) — single-file or componentized artifact
- Tailwind CSS for utility styling + custom CSS variables for clay shadows/glass blur
- Framer Motion (or CSS keyframes if unavailable) for all animation/spatial transitions
- Recharts for attendance/performance visualizations
- Lucide-react for icons
- All data in local React state (mock data layer) simulating the Node.js/MongoDB backend from the SRS — isolate all data access in a services/-style mock module so real REST calls can be swapped in later.

---

## 2. AUTHENTICATION — THREE ROLE POVs

Login/Signup must branch into *three distinct roles*, each with its own dashboard and permission set. Build a role-select step before/within auth (three claymorphic role cards — Student / Teacher / Admin — each liftable/selectable with its own icon and accent tint), then route to role-specific credential form.

### A. Student (Primary User — full SRS feature set)
- Uses all major features: attendance, assignments, events, AI assistant
- Sees only their own data

### B. Teacher (new role — extends SRS's admin-adjacent scope to a dedicated faculty POV)
- Views class-wide attendance rosters (aggregate, per-subject, per-section) rather than logging their own attendance
- Can mark/edit attendance for students in their subject(s) — this is the real-world source of the "User inputs attendance" stimulus for a classroom setting
- Can post/edit assignments for their subject (title, description, deadline) that populate on enrolled students' Assignment screens
- Can view (read-only) event feed; cannot manage events (that stays Admin-only per SRS 2.2)
- Has its own dashboard: "My Subjects" cards, "Attendance below threshold" roster alert list, "Pending grading/checklist" overview

### C. Admin (Secondary User, per SRS 2.2)
- Manages campus events: create/edit/delete, categorize (Workshop/Hackathon/Seminar) — FR-11
- Sees platform-wide oversight cards (total students, total events, engagement snapshot) — mock data
- Controlled access, admin-only routes strictly gated

Role-based route gating must be real: attempting to reach a Teacher/Admin-only screen as a Student redirects with a styled "access restricted" clay+glass card, not just a hidden nav item.

---

## 3. INFORMATION ARCHITECTURE

*Shared shell:* persistent bottom nav (mobile) / side dock (desktop preview) styled as a frosted glass floating dock over the clay background, tabs shown depend on active role.

### Student screens
1. Dashboard — attendance %, next deadline, upcoming event, AI quick-access
2. Attendance — subject-wise list, live % rings, log Present/Absent/Late (FR-01), 75% alert (FR-03), recovery predictor (FR-04), trend chart (FR-05)
3. Assignments — list/calendar toggle (FR-10), create/edit/delete (FR-06), checklist (FR-08), overdue highlight (FR-09), reminder badges (FR-07); assignments posted by Teachers appear here too
4. Events — feed by category (FR-12), search/filter (FR-15), RSVP/bookmark (FR-14)
5. AI Assistant "Campus Copilot" — chat, text+voice input (FR-16), quick-reply chips (FR-19), answers reference live mock data (FR-17/18/20)
6. Profile/Settings — dark/light toggle, notifications, logout

### Teacher screens
1. Dashboard — my subjects, roster attendance-risk alerts, pending items
2. Class Attendance — roster table per subject/section, bulk + individual mark Present/Absent/Late, live recalculated class-average ring
3. Assignments (Manage) — create/edit/delete assignments scoped to their subjects
4. Events (read-only feed)
5. Profile/Settings

### Admin screens
1. Dashboard — platform oversight cards
2. Event Management — full CRUD table + the same category system (Workshop/Hackathon/Seminar), publish toggle
3. (Optional oversight) Users directory — read-only list of students/teachers, mock data
4. Profile/Settings

---

## 4. UML — CLASS / DATA MODEL

Implement the mock data layer to mirror this exactly (field names, types, relationships) so it's copy-paste-ready for the real backend later.

mermaid
classDiagram
    class User {
        +String userID
        +String name
        +String email
        +String passwordHash
        +String role  %% "student" | "teacher" | "admin"
        +login()
        +logout()
        +updateProfile()
    }

    class Student {
        +List~String~ enrolledSubjects
    }

    class Teacher {
        +List~String~ subjectsTaught
        +markAttendance(studentID, status)
        +postAssignment()
    }

    class Admin {
        +manageEvents()
        +viewPlatformStats()
    }

    class Attendance {
        +String attendanceID
        +String studentID
        +String subject
        +Date date
        +String status  %% Present|Absent|Late
        +float percentage
        +String markedBy  %% student self-log or teacherID
        +logAttendance()
        +calculatePercentage()
        +predictClassesNeeded()
    }

    class Assignment {
        +String assignmentID
        +String title
        +String subject
        +String description
        +DateTime deadline
        +boolean completed
        +String createdBy  %% studentID or teacherID
        +List~ChecklistItem~ checklist
        +createAssignment()
        +editAssignment()
        +deleteAssignment()
        +isOverdue()
    }

    class ChecklistItem {
        +String itemID
        +String label
        +boolean done
    }

    class Event {
        +String eventID
        +String title
        +DateTime dateTime
        +String venue
        +String category  %% Workshop|Hackathon|Seminar
        +String description
        +String createdByAdminID
        +createEvent()
        +editEvent()
        +deleteEvent()
    }

    class RSVP {
        +String userID
        +String eventID
        +boolean bookmarked
        +boolean attending
    }

    class AIQuery {
        +String queryID
        +String userID
        +String inputText
        +String inputType  %% text|voice
        +String responseText
        +DateTime timestamp
        +sendQuery()
        +getContextualSuggestion()
    }

    User <|-- Student
    User <|-- Teacher
    User <|-- Admin
    Student "1" --> "many" Attendance : owns
    Teacher "1" --> "many" Attendance : marks
    Student "1" --> "many" Assignment : owns
    Teacher "1" --> "many" Assignment : posts
    Student "1" --> "many" AIQuery : sends
    Student "1" --> "many" RSVP : makes
    Event "1" --> "many" RSVP : receives
    Assignment "1" --> "many" ChecklistItem : contains
    Admin "1" --> "many" Event : creates


---

## 5. DESIGN SYSTEM SPEC (be exact)

*Color base:*
- Light mode background: #e9edf5 (soft blue-grey clay bed)
- Dark mode background: #1c1e26
- Accent palette: coral/red #ff8a80 (alerts/overdue), amber #ffcf86 (approaching), mint green #8ce0c0 (complete/on-track), periwinkle #8fa6ff (primary/Student), teal #6fd6c4 (Teacher role accent), violet #b39ddb (Admin role accent) — role accent tints the shell, role-select cards, and active nav state per role.

*Clay surfaces (base dashboard cards, buttons, form fields):*
css
border-radius: 24px;
box-shadow:
  8px 8px 16px rgba(0,0,0,0.15),
  -8px -8px 16px rgba(255,255,255,0.7);

Dark mode: invert highlight to a subtle lighter grey (not pure white), same offsets.

*Glass surfaces (nav dock, modals/sheets, toasts, AI chat panel, role-select overlay):*
css
background: rgba(255,255,255,0.18);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border: 1px solid rgba(255,255,255,0.35);
border-radius: 28px;
box-shadow: 0 8px 32px rgba(0,0,0,0.12);

Dark mode: background: rgba(30,32,40,0.35), border rgba(255,255,255,0.08).

*Depth layers:*
- Layer 0: page background (gradient clay bed, very subtle noise/texture)
- Layer 1: solid clay dashboard cards
- Layer 2: floating glass nav dock + FABs — closest to viewer, always visible
- Layer 3: glass modals/sheets/toasts — emerge above everything, background beneath blurs/dims further and scales down slightly

*Required micro-interactions (implement all):*
- Buttons: press → clay squish (scale 0.96, shadow compresses), release → spring back
- Cards: hover/tap → lift (translateY -4px, shadow grows), subtle cursor-follow tilt on desktop (max ~4deg)
- Glass panels: on open, blur ramps in from 0 alongside scale/opacity — never appear instantly at full blur
- Nav tab switch: active icon pops forward + glows with its role accent color; inactive icons recede
- Role-select screen: three role cards sit at slightly different depths/scales; selecting one has the other two recede+blur while the chosen one expands into the login form
- Modal open: originates from triggering element's position, scales+blurs into a glass sheet; close reverses it
- Attendance ring: animated fill on mount/update, color sweeps red→amber→green by %
- Toggles (dark/light, RSVP, checklist, teacher's mark-attendance switches): thumb has its own mini clay shadow, springs across
- Alert banners: glass toast slides in from top with soft bounce, auto-dismiss via fade+shrink
- AI chat bubbles: pop in with slight overshoot (1.0→1.05→1.0); typing indicator = 3 staggered bouncing dots; chat panel itself is a glass surface floating over the blurred dashboard behind it
- Tab/page transitions: content shifts through 3D space (perspective translateZ + opacity), not flat crossfade

---

## 6. FUNCTIONAL COMPLETENESS CHECKLIST

For every interactive element:
- [ ] Visible pressed/active/disabled state
- [ ] Real, observable state change on trigger (data updates, re-render, navigation, modal open/close)
- [ ] Animation on trigger per Section 5
- [ ] Keyboard/tap accessible, custom-styled focus ring (not browser default)
- [ ] Empty/error/loading states designed, not blank

Specifically verify before calling the build done:
- Role-select → correct role dashboard and nav set loads; wrong-role route attempts show the styled "access restricted" card
- Student: logging attendance recalculates + animates the ring live; crossing below 75% fires the alert; assignment CRUD and checklist actually mutate state; overdue auto-highlights against current mock date; event filters/search actually filter; RSVP/bookmark toggles persist and reflect instantly; AI chat generates responses referencing the current mock attendance/assignment/event state, not static text; voice button toggles a real recording UI state; quick-reply chips populate + send
- Teacher: marking a student's attendance in the roster updates that student's record and the class-average ring; posting an assignment makes it appear on the Student assignment screens in the same session/state; read-only event feed has no edit affordances
- Admin: event CRUD actually adds/edits/removes cards from the feed everyone else sees; category tagging works; platform stat cards reflect mock counts
- Dark/light toggle swaps theme app-wide with smooth transition; both clay shadows and glass blur/opacity recompute correctly for the new theme (not just inverted colors)

---

## 7. NON-FUNCTIONAL NOTES TO HONOR

- Fast, low-friction onboarding to first core interaction (NFR: ~5 minutes)
- Consistent color-coded status system: red = below threshold/overdue, amber = approaching/at-risk, green = complete/on-track
- Maintain legible contrast even through frosted glass panels and pastel clay — don't sacrifice readability for the aesthetic
- Mobile-first layout (~360–480dp), frame in a phone-shaped viewport for desktop preview if needed

---

## 8. DELIVERABLE FORMAT

Build as a single cohesive interactive artifact (one React app) containing:
1. Three-role auth flow + role-gated navigation and screens per Section 3
2. Mock data layer matching Section 4's model exactly
3. Full clay + glass + spatial styling and animation per Section 5
4. Nothing that looks clickable but isn't

Do not summarize or truncate implementation. Build in this priority order if output limits are hit, continuing automatically without waiting to be asked: (1) Role-select + auth for all three roles, (2) Student Dashboard/Attendance/Assignments/AI Assistant, (3) Teacher Dashboard/Class Attendance/Assignments, (4) Admin Dashboard/Event Management, (5) Events feed (student+teacher view) and Profile/Settings for all roles.