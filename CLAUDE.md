# Gym Progress Tracker — Project Documentation

## 📋 Project Overview

A full-stack gym tracking application allowing users to log workouts based on customizable workout splits, select exercises with visual guides, track sets/reps/weights, and visualize strength progress over time.

**Owner**: Mangesh Khandale  
**Email**: mangeshkhandale327@gmail.com  
**Scope**: Personal gym tracking (single user daily use)  
**Status**: In development — Phase 1 (Project Setup)

## 📱 IMPORTANT: Mobile-First Responsive Design
**All UI components MUST be fully responsive and mobile-optimized.** The app will be primarily used on mobile at the gym.
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:` for responsive layouts
- Test on mobile devices (iPhone/Android) before marking features complete
- DaisyUI components are mobile-friendly by default — leverage them
- Ensure touch-friendly buttons/inputs (min 44px height for mobile)
- Optimize images and fonts for mobile performance

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand + Immer
- **Charts**: Recharts
- **Hosting**: Vercel

### Backend
- **Framework**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Phone OTP
- **Hosting**: Render.com (free tier)

### Supporting Tools
- **Version Control**: Git
- **Code Review**: Claude Code reviewer-agent
- **Testing**: Jest (frontend), pytest (backend)
- **Package Managers**: npm (frontend), pip (backend)

---

## 📁 Project Structure

```
nextjs/
├── CLAUDE.md                 # This file — project documentation
├── NEXTJS_RULES.md           # Next.js best practices & conventions
├── FASTAPI_RULES.md          # Python FastAPI best practices & conventions
├── plan.md                   # Implementation roadmap
├── .claude/
│   ├── agents/
│   │   └── reviewer-agent.md # Code review automation
│   └── plans/
├── frontend/                 # Next.js app (to be created)
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── lib/
│   └── types/
├── backend/                  # FastAPI app (to be created)
│   ├── routers/
│   ├── models/
│   ├── db/
│   ├── auth/
│   └── tests/
└── README.md
```

---

## 🗄️ Database Schema

See [plan.md](plan.md) for detailed schema. Quick reference:

- **splits** — User's workout split (PPL, Bro Split, etc.)
- **split_days** — Days in the split with muscle groups
- **exercise_library** — Catalog of exercises with images
- **workout_sessions** — Logged gym sessions
- **workout_exercises** — Exercise performance (sets/reps/weight)

Row Level Security (RLS) ensures users only see their own data.

---

## 🔐 Authentication Flow

1. **User enters phone** → Supabase sends OTP via SMS
2. **User enters OTP** → Supabase returns JWT token
3. **JWT stored** in Zustand `authStore`
4. **Sent on API calls** as `Authorization: Bearer {token}` header
5. **FastAPI validates** JWT and extracts `user_id` for DB queries

---

## 📋 Development Guidelines

### Before Writing Code
1. **Read the relevant rules file**:
   - Frontend → [NEXTJS_RULES.md](NEXTJS_RULES.md)
   - Backend → [FASTAPI_RULES.md](FASTAPI_RULES.md)
2. **Follow the implementation plan** in [plan.md](plan.md)
3. **Use type safety** — TypeScript on frontend, type hints on backend
4. **Write tests** as you go (minimum 80% coverage for critical paths)

### Code Review
- Use the [reviewer-agent](.claude/agents/reviewer-agent.md) for automated checks
- Focus areas: TypeScript compliance, Next.js patterns, React hooks, Zustand state, Tailwind styles, security, performance

### Commit Messages
```
feat: add phone OTP login
fix: reset form after submit  
refactor: extract exercise picker to component
docs: update database schema
```

---

## 🚀 Implementation Phases

### ✅ Phase 1: Project Setup
- [ ] Initialize Next.js with TypeScript, Tailwind, DaisyUI
- [ ] Set up Supabase project & database schema
- [ ] Initialize FastAPI backend
- [ ] Configure Zustand stores (auth, split, session)

### ⭕ Phase 2: Authentication
- [ ] Supabase phone OTP login UI
- [ ] Auth state management (Zustand)
- [ ] Protected routes (Next.js + FastAPI)
- [ ] Session persistence

### ⭕ Phase 3: Split Configuration
- [ ] Onboarding flow to create splits
- [ ] Settings page to manage splits/days
- [ ] Assign muscle groups to days

### ⭕ Phase 4: Session Logging
- [ ] Pick split day for today
- [ ] Exercise picker (by muscle group, with images)
- [ ] Set/rep/weight entry form
- [ ] Save to Supabase via FastAPI

### ⭕ Phase 5: Progress Charts
- [ ] Fetch per-exercise historical data
- [ ] Recharts line chart (weight progression)
- [ ] Dashboard summary stats
- [ ] Exercise history view

### ⭕ Phase 6: Deployment
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render.com
- [ ] Configure environment variables
- [ ] End-to-end testing

---

## 🌐 API Endpoints

Full list in [plan.md](plan.md). Key routes:

**Splits**
- `POST /splits` — Create a split
- `GET /splits` — List user's splits
- `POST /splits/{id}/days` — Add a day to split

**Sessions**
- `POST /sessions` — Start a new gym session
- `GET /sessions` — List past sessions
- `POST /sessions/{id}/exercises` — Log exercises

**Progress**
- `GET /progress/{exercise_id}` — Historical data for charts

---

## 🔧 Local Development Setup

### Frontend
```bash
cd frontend
npm install
npm install zustand immer recharts @supabase/supabase-js
npm run dev
# Opens http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Opens http://localhost:8000/docs (Swagger UI)
```

### Environment Variables
Create `.env.local` (frontend) and `.env` (backend) files using `.env.example` templates.

---

## 🧪 Testing

### Frontend
```bash
npm test              # Run Jest tests
npm test -- --coverage
```

### Backend
```bash
pytest                # Run pytest
pytest --cov          # With coverage report
pytest -v             # Verbose output
```

---

## 📦 Free Hosting

| Service | Tier | Limits |
|---------|------|--------|
| **Vercel** | Free | Unlimited personal projects |
| **Render.com** | Free | 750 hrs/month, cold starts after 15 min idle |
| **Supabase** | Free | 500MB DB, 50k MAU, 2GB bandwidth |

**Cost**: $0/month for personal use

---

## 🔒 Security Checklist

- [ ] No secrets in `.env` files (use `.env.example`)
- [ ] JWT validation on all protected routes
- [ ] Row Level Security (RLS) on Supabase tables
- [ ] Input validation (Pydantic on backend, zod/react-hook-form on frontend)
- [ ] Rate limiting on FastAPI endpoints
- [ ] CORS configured correctly
- [ ] Images use Next.js Image component (not `<img>`)
- [ ] No console.log in production code

---

## 📚 Resources

**Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)

**Tools**
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)

---

## 📞 Help & Feedback

- **Issues**: Report bugs or feature requests in the `.claude` folder or GitHub issues
- **Questions**: Check the relevant rules file (NEXTJS_RULES.md or FASTAPI_RULES.md)
- **Feedback**: Use the reviewer-agent for code review

---

**Last Updated**: 2026-05-15  
**Next Phase**: Initialize Next.js project (Phase 1)
