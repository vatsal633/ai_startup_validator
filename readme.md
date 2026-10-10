# 🚀 AI Startup Validator & Investor Discovery Platform

An AI-powered platform that helps founders validate startup ideas and connect with
investors through controlled information sharing.

> **Academic project.** The MVP does not process real investments and does not
> guarantee startup success. AI scores are decision-support information, not advice.

---

## 📌 Overview

A founder submits a business idea with its industry, audience, budget, location and
business model. Gemini analyses it and produces a structured validation report.

After reviewing that report the founder **publishes** the idea, which puts a limited
public summary on the marketplace. Investors browse published startups, see the
high-level information and the AI score, and request access to the full detail. The
founder approves or declines each request.

---

## 🏗️ Technology Stack

| Layer | What we actually use |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, JavaScript |
| Backend | Django 6.1, Django REST Framework |
| Database | PostgreSQL |
| AI | Google Gemini (`gemini-3.6-flash`) via the `google-genai` SDK |
| Auth | JWT (`djangorestframework-simplejwt`), rotating refresh tokens |
| Email | SMTP (password reset) |

---

## 📌 Running the project

You need **Python 3.12+**, **Node 20.9+** (what Next 16 requires) and a running **PostgreSQL** instance.

### 1. Clone

```bash
git clone https://github.com/vatsal633/ai_startup_validator.git
cd ai_startup_validator
```

### 2. Backend

```bash
cd server
python -m venv venv
venv\Scripts\activate        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `server/.env`:

```ini
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=ai_startup_validator
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Gemini API key from https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-key

# Gmail account + app password, used for password-reset emails
EMAIL_HOST_USER=you@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

FRONTEND_URL=http://localhost:3000
```

Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is on `http://127.0.0.1:8000`.

### 3. Frontend

```bash
cd client
npm install
```

Create `client/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then:

```bash
npm run dev
```

The app is on `http://localhost:3000`.

### 4. Tests

```bash
cd server
python manage.py test
```

98 tests covering authentication, the publish flow, tiered disclosure, the connection
state machine and the background analysis task.

> **Never commit** `.env`, `.env.local`, `venv/`, `node_modules/` or `db.sqlite3`.

---

## 🔄 How the workflow actually works

```text
Founder submits an idea
        │
        ▼
  status = processing          ← the API responds immediately
        │
        ▼
Gemini runs in the background
        │
        ├── success → status = draft    (private to the founder)
        └── failure → status = failed   (retry from the UI)
        │
        ▼
Founder reviews the report
        │
        ▼
Founder clicks Publish → status = published
        │
        ▼
Idea appears on the public marketplace
        │
        ▼
Investor requests access
        │
        ▼
Founder accepts → investor sees the full report
```

### Idea statuses

| Status | Meaning |
|---|---|
| `processing` | The AI analysis is running |
| `draft` | Analysed, private to the founder |
| `published` | Public summary visible on the marketplace |
| `failed` | Analysis failed; retry to run it again |

A substantive edit to a published idea sends it back to `processing`, then `draft` —
the report it was published on no longer matches, so the founder reviews and
republishes.

---

## 🔐 Controlled information disclosure

Publishing an idea does **not** publish the whole idea. The API serves two shapes:

**Public (anyone, including signed-out visitors):** title, short description,
industry, country, stage, business model, funding requirement, founder name and the
AI validation score.

**Restricted (founder, admin, or an investor with an *accepted* connection):** the
problem and solution detail, target customer, differentiator, competitors, and the
full AI report.

This is enforced server-side in `IdeaDetailView`, which picks the serializer based on
who is asking. A *pending* request is not enough — only an accepted one unlocks the
report. Unpublished ideas are visible only to their founder and to admins.

---

## 🔌 API reference

All paths are relative to `http://127.0.0.1:8000`. Everything requires a
`Bearer <access_token>` header except where marked **public**.

### Auth — `/api/auth/`

| Method | Path | Purpose |
|---|---|---|
| POST | `register/` | Create an account (**public**) |
| POST | `login/` | Obtain access + refresh tokens (**public**) |
| POST | `refresh/` | Exchange a refresh token (**public**) |
| GET | `me/` | The signed-in user's profile |
| PATCH | `me/` | Update name, bio, phone, location, LinkedIn, website |
| POST | `password-change/` | Change password while signed in |
| POST | `password-reset/` | Email a reset link (**public**) |
| POST | `password-reset/confirm/` | Set a new password from the link (**public**) |

The access token carries `role` and `email` claims, so the frontend can route by role
without an extra request.

### Ideas — `/api/ideas/`

| Method | Path | Purpose |
|---|---|---|
| GET | `` | Marketplace list (**public**), paginated |
| POST | `submit/` | Submit an idea; returns at once, analysis runs in the background |
| GET | `mine/` | The founder's own ideas, every status |
| GET | `dashboard/stats/` | Counts for the founder dashboard |
| GET | `<id>/` | One idea — teaser or full report depending on who asks |
| PATCH | `<id>/` | Edit your own idea |
| DELETE | `<id>/` | Delete your own idea |
| POST | `<id>/publish/` | Publish a draft |
| DELETE | `<id>/publish/` | Unpublish |
| POST | `<id>/retry/` | Re-run a failed analysis |

Marketplace filters: `q`, `industry`, `country`, `stage`, `business_model`,
`min_score`, `max_score`, `min_funding`, `max_funding`, and
`ordering` (`newest`, `oldest`, `score`, `funding`).

### Connections — `/api/connections/`

| Method | Path | Purpose |
|---|---|---|
| POST | `request/<idea_id>/` | Investor requests access (empty body) |
| GET | `` | Your requests — sent if investor, received if founder |
| POST | `<id>/accept/` · `<id>/decline/` | Founder responds |

### Notifications — `/api/notifications/`

| Method | Path | Purpose |
|---|---|---|
| GET | `` | Your notifications; filters `unread=true`, `type=` |
| GET | `unread-count/` | Badge count |
| POST | `<id>/read/` | Mark one read |
| POST | `read-all/` | Mark all read |

---

## 🧠 How the AI analysis runs

`analysis/report_generator.py` sends the idea's details to Gemini and asks for JSON
matching a fixed schema, enforced server-side through the SDK's `response_format`.
That means no markdown-fence stripping and no guessing at the shape.

The call happens in a **background thread** (`analysis/tasks.py`), not during the
request. A Gemini call takes tens of seconds normally and minutes when the API is
rate-limiting, so running it inline held the HTTP request open the whole time.
Submitting now responds in about 0.2s.

This is deliberately a thread rather than Celery: the project has no message broker,
and Redis plus a worker process is a lot of infrastructure for one call. The trade-off
is that work does not survive a server restart, so `recover_stale_processing()` marks
anything stuck in `processing` for over 15 minutes as `failed`, and the retry endpoint
lets the founder run it again. To scale past one server, replace `run_in_background`
with a real task queue — nothing else needs to change.

### Gemini quota and errors

The free tier has per-minute and per-day limits, and **quota is per project, not per
key** — issuing a new API key in the same project does not reset anything. A daily
limit clears on its own at midnight Pacific.

Two failures look similar but are not:

- **429** — quota exhausted. Wait for the reset, or raise limits in Google AI Studio.
- **503** — the model is temporarily overloaded. Transient; retrying usually works.

Either marks the idea `failed`, and the founder can hit **Retry analysis**.

---

## 👥 User roles

**Founder** — submit ideas, run AI analysis, review reports, edit, publish and
unpublish, receive and respond to investor requests.

**Investor** — browse and filter the marketplace, view public summaries and AI
scores, request access to full details.

**Admin** — Django admin at `/admin/`: manage users, ideas, connections and
notifications. Admins can read any idea. The role cannot be self-assigned at
registration.

---

## 📁 Project structure

```text
ai_startup_validator/
│
├── client/                    # Next.js frontend
│   ├── app/
│   │   ├── (auth)/            # login, signup, password reset
│   │   ├── (dashboards)/      # founder and investor areas
│   │   │   ├── components/    # shared dashboard UI
│   │   │   ├── founder/
│   │   │   └── investor/
│   │   └── startups/          # public marketplace
│   └── lib/                   # api client, endpoints, auth, helpers
│
├── server/                    # Django backend
│   ├── accounts/              # custom user, JWT auth, profile
│   ├── ideas/                 # Idea, IdeaReport, IdeaView
│   ├── analysis/              # Gemini prompt + background task
│   ├── connections/           # investor access requests
│   ├── notifications/         # in-app notifications
│   ├── matching/              # placeholder, not implemented
│   └── config/                # settings and root urls
│
└── readme.md
```

### Frontend notes

`lib/api.js` is the only place the app talks to Django. It attaches the bearer token,
refreshes an expired access token once per request and replays the call, and only
redirects to `/login` if that fails. Refreshes are single-flight, so simultaneous 401s
cannot each spend the single-use rotating refresh token.

Route protection (`RequireRole`) is a **UX guard, not a security boundary** — tokens
live in `localStorage`, so it only runs client-side. The API enforces the real rules.
Next 16 renamed Middleware to Proxy, but Proxy reads sessions from cookies and so
cannot see these tokens; guarding server-side would mean moving to httpOnly cookies.

---

## ✅ Status

**Working end to end:** registration and login with role-based routing, password
reset by email, idea submission with background AI analysis, the full validation
report, publish/unpublish, the public marketplace with search and filters, investor
access requests, founder approve/decline, notifications, and profile settings.

**Not implemented:**

- `matching/` — intended to hold investor recommendation logic ("which ideas should
  this investor see first?"). Currently an empty app. There is not yet enough
  behavioural data to rank on, so it would need explicit investor preferences first.
- Admin dashboard beyond Django admin.
- Photo upload, two-factor authentication, session management (the settings screen
  says so rather than pretending).
- Messaging between founders and investors.

---

## ⚠️ Limitations

AI-generated scores and recommendations are **decision-support information**, not
guarantees. Market conditions, competition, execution and funding all change outcomes.

The platform reduces unnecessary disclosure through authentication, role-based access
and founder approval. It cannot guarantee an idea will not be copied.

---

## 🎓 Academic objective

Demonstrates full-stack development, REST API design, LLM integration with structured
output, relational data modelling, JWT authentication and role-based access control,
background task handling, automated testing, and data visualisation.

---

## 📄 License

Developed for educational and academic purposes.
