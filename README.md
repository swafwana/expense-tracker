# Expense Tracker

A full-stack personal finance app for tracking expenses against monthly category budgets. The backend is a REST API built with **FastAPI** and **PostgreSQL**, and the frontend is a **React** single-page app. The whole stack (frontend, API and database) runs with a single Docker Compose command.

## Features

- **Authentication:** register and log in with JWT-based auth. Passwords are hashed, and every resource endpoint is scoped to the authenticated user.
- **Categories, budgets and expenses:** full CRUD on each, with per-user ownership enforced on every route.
- **Budget vs. spending comparison:** a dedicated endpoint answers "how am I doing against my budget this month?" for a category. Categories that have expenses but no budget yet are handled as a valid state, not an error.
- **Dashboard and pages:** a React UI with a dashboard, plus pages for expenses, budgets and categories, protected behind login.
- **Dockerized:** frontend, API and PostgreSQL each run in their own container via Docker Compose, with a persistent database volume and a health check so the API waits for the database.

## Tech Stack

**Backend**
- Python 3.11, FastAPI
- PostgreSQL 17, SQLAlchemy ORM
- JWT (python-jose), password hashing with pwdlib

**Frontend**
- React 19, Vite
- Tailwind CSS 4
- React Router, Recharts, Lucide icons

**Infrastructure**
- Docker and Docker Compose
- nginx (serves the production frontend build)

## Project Structure

```
expense-tracker/
├── app/                         # FastAPI backend
│   ├── core/
│   │   ├── dependencies.py      # auth / DB dependency injection
│   │   └── security.py          # password hashing, JWT creation/validation
│   ├── models/                  # SQLAlchemy ORM models
│   ├── routers/                 # route handlers (auth, category, budget, expense, summary)
│   ├── schemas/                 # Pydantic request/response models
│   ├── services/                # business logic and DB queries
│   └── database.py              # engine/session setup
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/          # shared components (layout, modals)
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # Welcome, Login, Register, Dashboard, Expenses, Budgets, Categories
│   │   └── routes/              # route config and ProtectedRoute
│   ├── Dockerfile               # multi-stage build: Node build, then nginx
│   └── nginx.conf               # serves the build, falls back to index.html for React Router
├── main.py                      # FastAPI entry point
├── create_table.py              # creates DB tables (local setup)
├── Dockerfile                   # backend image
├── docker-compose.yml           # frontend + API + database
├── .env.example
└── requirements.txt
```

The backend separates concerns in three layers: **routers** handle HTTP, **services** hold the business logic and queries, and **schemas** validate input and output.

## Getting Started

### Prerequisites

- Docker and Docker Compose (for the recommended setup)
- Python 3.11, Node.js 22 and PostgreSQL 17 (only if running without Docker)

### Environment variables

Copy the template and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string. Use host `db` for Docker, or `localhost` for a local run |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credentials the database container is created with (must match `DATABASE_URL`) |
| `SECRET_KEY` | Secret used to sign JWTs. Use a long random string |
| `ALGORITHM` | JWT signing algorithm, e.g. `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes, e.g. `30` |

Example for Docker:

```env
DATABASE_URL=postgresql://youruser:yourpassword@db:5432/yourdbname
POSTGRES_USER=youruser
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=yourdbname
SECRET_KEY=change-me-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> The `@db` host is the Compose service name. Inside the API container, `localhost` would point at the container itself, not the database.

### Option A: Run with Docker (recommended)

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

Stop with `Ctrl+C`, or `docker-compose down`. Database data is kept in the `postgres_data` volume.

### Option B: Run locally

**Backend**

1. Create and activate a virtual environment, then install dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # macOS / Linux
   pip install -r requirements.txt
   ```
2. Create a local PostgreSQL database and set `DATABASE_URL` in `.env` with host `localhost`.
3. Start the API (tables are created automatically on startup):
   ```bash
   uvicorn main:app --reload
   ```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/auth/me` | Get the current user |
| GET / POST | `/categories` | List or create categories |
| GET / PUT / DELETE | `/categories/{id}` | Read, update or delete a category |
| GET / POST | `/budgets` | List or create monthly budgets |
| GET / PUT / DELETE | `/budgets/{id}` | Read, update or delete a budget |
| GET / POST | `/expenses` | List or log expenses |
| GET / PUT / DELETE | `/expenses/{id}` | Read, update or delete an expense |
| GET | `/summary/comparison?category_id={id}&month={YYYY-MM-DD}` | Compare a category's budget against actual spend (`month` is optional and defaults to the current month) |

All endpoints except `/auth/register` and `/auth/login` require a valid JWT in the `Authorization: Bearer <token>` header. Full interactive documentation is available at `/docs` when the API is running.

## Architecture Notes

- The React app runs in the browser and calls the API at `http://localhost:8000`, so the API port is published by Compose. The browser talks to both the frontend and the API, and only the API talks to the database.
- The frontend image is built in two stages: Node compiles the app, then only the static files are copied into a small nginx image.
- CORS currently allows `http://localhost:5173`. Update it in `main.py` when deploying elsewhere.

## License

This project is for portfolio and educational purposes.