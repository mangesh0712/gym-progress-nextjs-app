# Architecture Decisions & Lessons Learned

## Authentication Approach

### Current Implementation: Custom JWT + EmailJS

**What we use:**
- Email OTP via EmailJS (third-party email service)
- Custom JWT tokens (not Supabase's native auth)
- Backend validation in FastAPI
- RLS disabled on Supabase

---

## Why We Didn't Use Supabase's Built-in Auth

### Attempt 1: Supabase Phone OTP
**Status:** ❌ Failed

**What we tried:**
- Use Supabase's native phone OTP authentication
- Send SMS codes to user's phone number

**Why it failed:**
- Error: `"Unsupported phone provider"`
- Supabase's phone provider wasn't available/configured for our region or setup
- Could not proceed with phone-based authentication

**Timeline:** Early development (May 15-18, 2026)

---

### Attempt 2: Supabase Email OTP
**Status:** ❌ Failed

**What we tried:**
- Switch to Supabase's native email OTP after phone failed
- Use `supabase.auth.signInWithOtp({ email })`
- Let Supabase handle email sending and JWT generation

**Why it failed:**
- Error: `500 Internal Server Error` when trying to send OTP
- Emails were not being received by users
- Supabase auth configuration issues (likely missing email provider setup)
- Could not debug the root cause effectively

**Timeline:** Mid development (around May 18, 2026)

**Example error:**
```
POST /auth/send-otp 500 (Internal Server Error)
Failed to send OTP email. Please try again.
```

---

## Final Decision: Custom JWT + EmailJS

**Status:** ✅ Working

**What we implemented:**
1. **Email sending:** EmailJS (third-party service) instead of Supabase
2. **Authentication:** Custom JWT tokens (HS256) instead of Supabase auth
3. **Token structure:**
   - `sub`: user_id
   - `email`: user email
   - `jti`: unique token ID (for revocation)
   - `iat`: issued at timestamp
   - `exp`: expiration timestamp (7 days for access, 30 days for refresh)
4. **Token refresh:** Refresh token mechanism with `/auth/refresh` endpoint
5. **Token revocation:** Server-side blacklist in `token_blacklist` table for logout

**Pros:**
- ✅ Full control over auth flow
- ✅ EmailJS is reliable for email delivery
- ✅ Custom JWT allows flexible token claims
- ✅ Token blacklisting enables secure logout
- ✅ Works with custom backend validation

**Cons:**
- ❌ Cannot use Supabase RLS (`auth.uid()` not available)
- ❌ Manual session management
- ❌ More code to maintain
- ❌ Need to handle token expiration/refresh manually

**Why this was the right choice:**
- Supabase's built-in auth had reliability issues in our setup
- EmailJS provides a simple, working email delivery mechanism
- Custom JWT gives us control and flexibility
- We validate all requests on the backend, so RLS isn't strictly necessary

---

## Database Row-Level Security (RLS)

### Why RLS is Disabled

**Status:** ❌ Disabled

**What we tried:**
```sql
CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

**Why it failed:**
- Error: `"new row violates row-level security policy"` (code 42501)
- `auth.uid()` is only populated by Supabase's native authentication
- Since we're using custom JWT tokens, `auth.uid()` is empty/null
- RLS policies couldn't verify user ownership, so all inserts were blocked

**Solution:**
```sql
ALTER TABLE workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;
```

**Is this secure?**
- ✅ Yes, because the backend validates JWT and extracts `user_id` from token
- ✅ All API routes check authentication via `@router.post("/", Depends(get_current_user_id))`
- ✅ Database security is enforced at the application layer, not RLS layer

**For future:**
- If we switch to Supabase's native auth, we can re-enable RLS and use proper row-level security
- For now, application-layer security is sufficient

---

## Key Lessons

1. **Test auth early** — Don't assume Supabase features will work without testing
2. **Have backup plans** — When Supabase phone failed, we had to pivot to email
3. **RLS requires native auth** — RLS (`auth.uid()`) only works with Supabase's built-in authentication
4. **Custom JWT is viable** — If you have a reliable backend, custom JWT is simpler than it sounds
5. **Token revocation matters** — Implement blacklisting for secure logout

---

## Files Involved

### Backend
- `backend/routers/auth.py` — Custom JWT generation and refresh endpoints
- `backend/auth/middleware.py` — JWT validation for protected routes
- `backend/db/supabase_client.py` — Token blacklist management
- `backend/services/email_service.py` — EmailJS integration

### Frontend
- `frontend/lib/supabase.ts` — OTP/token API functions
- `frontend/store/authStore.ts` — Zustand auth state management
- `frontend/app/login/page.tsx` — Login UI with email OTP
- `frontend/app/signup/page.tsx` — Signup UI with email OTP
- `frontend/middleware.ts` — Route protection via JWT cookie

### Database (Supabase)
- `backend/schemas/init_db.sql` — Table creation (RLS disabled)
- `token_blacklist` table — Store revoked JWT tokens by jti

---

## Timeline

| Date | Event | Status |
|------|-------|--------|
| May 15 | Start with Supabase phone OTP | ❌ Failed |
| May 18 | Try Supabase email OTP | ❌ Failed |
| May 18 | Implement custom JWT + EmailJS | ✅ Success |
| May 18 | Disable RLS, enable app-layer security | ✅ Working |

---

## References

- **EmailJS Docs:** https://www.emailjs.com/docs/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc7519
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
