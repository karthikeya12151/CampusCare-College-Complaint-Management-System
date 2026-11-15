# CampusCare Architecture

## System context
CampusCare is a browser-based college complaint management system. Students submit and track complaints. Administrators review, prioritize, and update them. The application uses a same-origin web client and REST API backed by MongoDB.

## Logical architecture

```text
Browser
  ├── Student UI / Administrator UI
  └── Fetch API (Bearer JWT)
          |
          v
Express REST API
  ├── Authentication and role middleware
  ├── Complaint routes
  ├── Administrator routes / analytics
  └── Notification routes
          |
          v
Mongoose data access
  ├── User
  ├── Complaint + embedded status history
  └── Notification
          |
          v
MongoDB database: campuscare
```

## Main design decisions
- A single Express application serves both static frontend assets and `/api` endpoints, avoiding cross-origin complexity in local development.
- Passwords are stored as bcrypt hashes; plaintext passwords are never stored.
- JWT authentication protects private API routes. Administrator routes additionally enforce the `admin` role.
- Complaint status history is embedded in the complaint document because updates are normally read with their parent complaint.
- Notifications are separate documents because they have independent read state and recipient-oriented retrieval.
- Schema defaults preserve compatibility with older complaint documents that do not contain newer optional fields.

## Data model
- `User`: name, unique email, password hash, role, department, timestamps.
- `Complaint`: reference code, title, description, category, location, priority, status, student reference, status history, timestamps.
- `Notification`: recipient, complaint reference, title, message, type, read timestamp, timestamps.

## Security and operational notes
This is an educational demonstration baseline, not a production-certified service. Before deployment, add HTTPS, secure HttpOnly cookie-based sessions or refresh-token rotation, CSRF protection if cookie authentication is used, strict schema validation, audit logs, pagination, structured logging, automated tests, backup/restore procedures, secrets management and security review.
