# Expense & Budget Tracker API

A backend REST API for tracking personal expenses against monthly category budgets, built with **FastAPI** and **PostgreSQL**. Built as a backend-focused portfolio project, with an emphasis on clean service/router/schema separation and deliberate data-modeling decisions over quick scaffolding.

## Features

- **JWT-based authentication** — register and log in, with all resource endpoints scoped to the authenticated user.
- **Categories, Budgets, and Expenses** — full CRUD on each, with per-user ownership enforced on every route.
- **Budget-vs-Expense comparison** — a dedicated `GET /summary/comparison` endpoint that answers "how am I doing against my budget this month?" for a given category, including correct handling of categories that have expenses but no budget yet (a valid state, not an error).
- **Dockerized** — the app and PostgreSQL both run in containers via Docker Compose, with a persistent volume for the database and a health check to avoid startup race conditions.

## Tech Stack

- **Python 3.11**, **FastAPI**
- **PostgreSQL 17**, **SQLAlchemy ORM**
- **JWT** for authentication
- **Docker** & **Docker Compose**

## Project Structure

```
expense-tracker/
├── app/
│   ├── core/
│   │   ├── dependencies.py     # auth/DB dependency injection
│   │   └── security.py         # password hashing, JWT creation/validation
│   ├── database.py              # SQLAlchemy engine/session setup
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── budget.py
│   │   ├── category.py
│   │   ├── expense.py
│   │   └── user.py
│   ├── routers/                 # FastAPI route handlers
│   │   ├── auth.py
│   │   ├── budget.py
│   │   ├── category.py
│   │   ├── expense.py
│   │   └── summary.py           # budget-vs-expense comparison
│   ├── schemas/                 # Pydantic request/response models
│   │   ├── budget.py
│   │   ├── category.py
│   │   ├── expense.py
│   │   ├── summary.py
│   │   └── user.py
│   └── services/                # business logic, DB queries
│       ├── budget_service.py
│       ├── category_service.py
│       ├── expense_service.py
│       ├── summary_service.py
│       └── user_service.py
├── main.py
├── create_tables.py
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── requirements.txt
```

## Getting Started

### Prerequisites

- Python 3.11
- PostgreSQL 17 (if running locally without Docker)
- Docker & Docker Compose (if running containerized)

### Option A — Run with Docker (recommended)

1. Clone the repo and copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Fill in real values in `.env` — a database URL (host should be `db`, matching the Compose service name), plus matching `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` values, and a `SECRET_KEY` for JWT signing.
3. Build and start both the app and database containers:
   ```bash
   docker-compose up --build
   ```
4. The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Option B — Run locally

1. Create and activate a virtual environment, then install dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   pip install -r requirements.txt
   ```
2. Create a local PostgreSQL database and set `DATABASE_URL` in `.env` to point at it (host `localhost`).
3. Create the tables:
   ```bash
   python create_tables.py
   ```
4. Run the app:
   ```bash
   uvicorn main:app --reload
   ```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Log in and receive a JWT |
| GET/POST/PUT/DELETE | `/categories` | Manage expense categories |
| GET/POST/PUT/DELETE | `/budgets` | Manage monthly category budgets |
| GET/POST/PUT/DELETE | `/expenses` | Log and manage individual expenses |
| GET | `/summary/comparison?category_id={id}&month={YYYY-MM-DD}` | Compare a category's budget against its actual spend for a given month (`month` optional, defaults to the current month) |

Full interactive documentation (via Swagger UI) is available at `/docs` once the app is running.

## License

This project is for portfolio/educational purposes.
