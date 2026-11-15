# CampusCare API Reference

All protected endpoints require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Service health |
| POST | `/api/auth/register` | Public | Register student |
| POST | `/api/auth/login` | Public | Authenticate |
| GET | `/api/auth/me` | Authenticated | Current user |
| POST | `/api/complaints` | Student | Create complaint |
| GET | `/api/complaints/mine` | Student | List own complaints |
| GET | `/api/complaints/:id` | Owner/Admin | Complaint detail and history |
| GET | `/api/admin/complaints` | Admin | Search/filter complaints |
| PATCH | `/api/admin/complaints/:id` | Admin | Update status/priority and add note |
| GET | `/api/admin/summary` | Admin | Dashboard and report aggregates |
| GET | `/api/notifications` | Authenticated | List own notifications and unread count |
| PATCH | `/api/notifications/:id/read` | Owner | Mark one notification read |
| PATCH | `/api/notifications/read-all` | Authenticated | Mark all own notifications read |

## Complaint update example

```json
{
  "status": "In Progress",
  "priority": "High",
  "note": "Network team assigned; inspection scheduled."
}
```

The administrator update creates an in-app notification for the complaint owner when status or priority changes.
