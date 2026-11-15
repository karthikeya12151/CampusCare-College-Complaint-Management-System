# CampusCare — Professional ITSM-style college complaint platform

A local full-stack Software Engineering and System Design project built with HTML/CSS/JavaScript, Node.js, Express and MongoDB.

## Professional improvements
- Enterprise-inspired responsive interface and reusable visual patterns
- Dedicated student and administrator workspaces
- Complaint detail view with timestamped activity timeline
- Administrator update dialog (replaces browser prompt popups)
- Persistent in-app notifications with unread count and read actions
- Admin dashboard and category/monthly reporting
- Role-protected REST endpoints and bcrypt password hashing
- Architecture and API documentation in `docs/`

## Windows local setup
Requirements: Node.js 18+ and MongoDB Community Server running locally.

1. Stop the previous server with Ctrl+C.
2. Back up your current CampusCare folder.
3. Extract this project into a new folder or copy its files over the matching source files.
4. Keep your existing `.env` file. Do not replace it with `.env.example`.
5. In PowerShell, from the folder containing `package.json`, run:
   ```powershell
   npm install
   npm run dev
   ```
6. Open `http://localhost:4000`.

If this is a fresh database only, create the administrator using `npm run seed:admin`. Do not rerun seeding unless you intend to reset the configured admin password.

## Data preservation
This update does not drop collections or delete documents. Existing `users` and `complaints` remain in the `campuscare` database. The `notifications` collection is created when the first notification is saved. Keep your existing `.env` and `MONGODB_URI`.

## Demonstration flow
1. Sign in as a student and submit a complaint.
2. Sign in as administrator and open Complaints.
3. Select Update, set status and priority, and add an administrative note.
4. Sign back in as the student. Open Notifications and My complaints.
5. Open complaint Details to demonstrate the tracking timeline.
6. Sign in as administrator and open Reports & analytics.

## Demo administrator
Email: `admin@campuscare.local`
Password: use the value configured in your existing `.env` (`ADMIN_PASSWORD`). The seed script's default for a fresh setup is `Admin@12345`.

## Important scope note
Notifications are in-app notifications, not email/SMS or browser push. Analytics are based on records stored in MongoDB. This is an educational local demonstration and should not be represented as production-certified. See `docs/ARCHITECTURE.md` and `docs/API.md` for design and endpoint details.
