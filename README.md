# Employee Feedback Platform

This repository contains:

- `frontend`: React app powered by Vite
- `backend`: Express API server with employee and feedback endpoints

## Features

- Employee creation with MongoDB persistence
- Feedback submission with self-review protection
- Duplicate feedback prevention within 24 hours
- Average rating and feedback history per employee

## Run locally

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:5000`.

## API routes

- `GET /api/health`
- `GET /api/employees`
- `POST /api/employees`
- `POST /api/feedback`
- `GET /api/feedback/:employeeId`
- `GET /api/feedback/average/:employeeId`
- `DELETE /api/feedback/:id`

Feedback and employee data are stored in MongoDB.

## Backend structure

- `backend/server.js`: Backend startup and MongoDB initialization
- `backend/app.js`: Express app wiring and middleware
- `backend/config`: Database connection setup
- `backend/models`: Mongoose models
- `backend/routes`: Route definitions
- `backend/controllers`: Request handlers
- `backend/middleware`: Express error and not-found handlers
- `backend/utils`: Shared helpers

## Backend verification

```bash
npm run smoke -w backend
```
