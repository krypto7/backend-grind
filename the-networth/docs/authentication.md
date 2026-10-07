# Authentication

This is the login system in this project today. Next.js draws the pages. Express decides who is logged in. The browser keeps the proof in two cookies.

Read it in order. Each section answers one question: what do we know so far, and what has to happen next?

## The problem

A password check is a one-time event. The next page, the next tab, and tomorrow's visit still need a way to say "this is the same person" without asking for the password again.

That proof has to survive three different lifetimes:

1. **One request.** Express must know who called `GET /api/auth/getCurrentUser`.
2. **One tab.** React state in `AppShell` holds the user object while the page is open. Closing the tab deletes that state.
3. **The browser.** A new tab on the same site must still be logged in. The cookies do that. React state does not.

If the site skips the cookie check and always opens `/sign-in`, a valid login looks logged out. That was the old front door: `frontend/src/app/page.tsx` redirected to sign-in before Express was asked.

## How to think before writing code

Ask these questions one by one.

1. **Who proves the password?** Express, in `login`. Next.js never sees the password hash and never signs a token.
2. **What is the proof after login?** Two JWTs. The access token is the short proof. The refresh token is the long proof used only to mint a new pair.
3. **Where does the browser keep them?** In `accessToken` and `refreshToken` cookies. `httpOnly` means page JavaScript cannot read them. The browser attaches them to later requests by itself.
4. **Where does the server remember the long proof?** On the user, in `refreshToken`. Logout deletes that field. Refresh replaces it. A cookie that does not match the database is rejected.
5. **How does a new tab find out?** The page runs in the browser, calls `restoreSession()`, and that function calls Express with `credentials: "include"`. Express reads the cookies. The page then goes to `/home` or `/sign-in`.
6. **Why is that page `"use client"`?** Because the cookies live in the browser. A Server Component redirect on `/` runs on the Next server and does not ask Express with those cookies. `"use client"` does not replace the backend. It is how the browser reaches the backend.

## Two processes

```text
Browser  ──fetch /api/auth/...──▶  Next.js (:3001)
                                      │
                                      │ rewrite in next.config.ts
                                      ▼
                                   Express (:8000)
                                      │
                                      ▼
                                   MongoDB
```

| Process | Port in local dev | Job |
| --- | --- | --- |
| Next.js | 3001 | Pages, forms, and the `/api/*` rewrite |
| Express | 8000 | Signup, login, OTP, tokens, cookies, current user, logout |

The browser calls `http://localhost:3001/api/auth/login`. It does not call port 8000 directly. `frontend/next.config.ts` rewrites `/api/:path*` to `http://localhost:8000/api/:path*`.

From the browser's point of view the response comes from port 3001, so the cookies are stored for that host. The next call to `/api/auth/...` on port 3001 sends those cookies. Next forwards the `Cookie` header to Express. `cookieParser()` turns it into `req.cookies`.

`credentials: "include"` on each `fetch` in `frontend/src/lib/api.ts` tells the browser to send and accept cookies. CORS on Express allows `http://localhost:3000` and `http://localhost:3001` with `credentials: true`, for a browser that talks to Express directly. The rewrite path is same-origin to Next, which is the path this UI uses.

## Files

| File | Job |
| --- | --- |
| `backend/src/models/user.model.ts` | Password hash, `isVerified`, `otp`, `refreshToken`, and the two `jwt.sign` methods |
| `backend/src/controllers/auth.controller.ts` | Signup, login, OTP, refresh, logout, current user, cookie options |
| `backend/src/middlewares/auth.middlewale.ts` | `verifyJWT` reads the access cookie and loads the user |
| `backend/src/routes/auth.routes.ts` | Which routes are public and which require `verifyJWT` |
| `backend/src/app.ts` | `cookieParser`, CORS, mounts `/api/auth` |
| `frontend/next.config.ts` | Rewrites `/api/*` to Express |
| `frontend/src/lib/api.ts` | Browser `fetch` helpers. Every authed call uses `credentials: "include"` |
| `frontend/src/lib/session.ts` | `restoreSession()`: current user, then refresh, then current user again |
| `frontend/src/app/page.tsx` | Front door. Asks `restoreSession()`, then opens `/home` or `/sign-in` |
| `frontend/src/components/auth/guest-only.tsx` | Sign-in and sign-up send an already logged-in visitor to `/home` |
| `frontend/src/components/app/app-shell.tsx` | `/home` and `/profile` load the account the same way |

## What is stored where

| Thing | Where | Lifetime in this project | Who can read it |
| --- | --- | --- | --- |
| Password | MongoDB, bcrypt hash | Until the user changes it | Express, only to compare |
| OTP | MongoDB, `otp` and `otpExpiry` | 10 minutes | Express, during verify |
| Access JWT | `accessToken` cookie | Cookie `maxAge` 1 day. JWT `expiresIn` comes from `ACCESS_TOKEN_EXPIRY` (set to `1d`) | Browser sends it. Express verifies it. Page JS cannot read it |
| Refresh JWT | `refreshToken` cookie and `user.refreshToken` | Cookie `maxAge` 10 days. JWT `expiresIn` comes from `REFRESH_TOKEN_EXPIRY` (set to `10d`) | Same as the access cookie, plus the database copy |
| User object on screen | React state in `AppShell` | Until the tab closes or the layout unmounts | That tab only |

The cookie lifetime and the JWT lifetime are two clocks. The cookie is how long the browser keeps the string. The JWT `exp` is how long Express trusts the string. Both are one day for access and ten days for refresh, so they line up. If they ever diverge, Express follows the JWT. A cookie that is still in the browser with an expired JWT gets a 401, and `restoreSession()` tries the refresh cookie.

Cookie flags, from `baseCookieOptions` in the auth controller:

| Flag | Value | Why |
| --- | --- | --- |
| `httpOnly` | `true` | `document.cookie` cannot steal the token |
| `secure` | `true` only when `NODE_ENV` is `production` | Local `http://localhost` can still set the cookie |
| `sameSite` | `lax` | Sent on normal visits to this site. Not sent on cross-site POSTs from another site |
| `path` | `/` | Sent to every path on this host, including `/api/auth/...` |
| `maxAge` | 1 day or 10 days | Survives closing a tab. A session cookie with no `maxAge` would also survive a new tab, and would die when the browser itself quits. `maxAge` is what keeps the login after the browser quits, until the age runs out |

## The two tokens

Both are JWTs from `jsonwebtoken`. They use different secrets so a refresh token cannot be presented as an access token.

Access token, `user.generateAccessToken()`:

```json
{ "_id": "<user id>", "username": "<username>", "email": "<email>" }
```

Signed with `ACCESS_TOKEN_SECRET`. Checked by `verifyJWT`.

Refresh token, `user.generateRefreshToken()`:

```json
{ "_id": "<user id>" }
```

Signed with `REFRESH_TOKEN_SECRET`. Checked only by `refreshAccessToken`. It is also saved on the user document.

`generateAccessRefershToken(userId)` is the one function that mints a pair:

1. Load the user.
2. Sign both JWTs.
3. Save the refresh JWT on `user.refreshToken`.
4. Return both strings.

Login, OTP success, and refresh all call that function, then set both cookies.

## Routes

Mounted at `/api/auth`.

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `POST` | `/signup` | Public | Creates an unverified user and emails an OTP. Sets no cookies |
| `POST` | `/verify-otp/:email` | Public | Checks the OTP, sets `isVerified`, sets both cookies |
| `POST` | `/resend-otp/:email` | Public | Replaces the OTP and expiry. Sets no cookies |
| `POST` | `/login` | Public | Checks email, verified flag, and password. Sets both cookies |
| `POST` or `GET` | `/refresh` | Refresh cookie | Verifies the refresh JWT, compares it to the database, sets a new pair |
| `GET` | `/getCurrentUser` | Access cookie, `verifyJWT` | Returns the user without `password` or `refreshToken` |
| `GET` | `/logout` | Access cookie, `verifyJWT` | Deletes `refreshToken` in Mongo and clears both cookies |
| `GET` | `/verify-email` | Public | Older email-link check. See `backend/docs/email-verification.md` |

`verifyJWT` accepts the access token from `req.cookies.accessToken` or from `Authorization: Bearer <token>`. This UI uses the cookie.

## Flow 1 — Sign up

Signup proves the form was filled in. It does not prove the inbox, and it does not start a session.

```text
SignUpForm
  → POST /api/auth/signup   (multipart: fields + avtar file)
    → Express checks required fields and duplicate email
    → uploads the photo
    → User.create  (password is hashed in a pre-save hook, isVerified defaults to false)
    → stores a 6-digit OTP and otpExpiry = now + 10 minutes
    → emails the OTP
    → JSON only. No Set-Cookie
  → browser goes to /verify-otp?email=...&expires=...
```

Login before verification returns `401` with `"Email not verified"`.

## Flow 2 — Verify the OTP and start the session

`verify-otp` is the first moment cookies exist for a new account.

```text
VerifyOtpForm
  → POST /api/auth/verify-otp/:email   { otp }   credentials: include
    → find user by email
    → reject a wrong OTP or an expired OTP
    → set isVerified: true
    → delete otp and otpExpiry
    → generateAccessRefershToken
    → Set-Cookie accessToken
    → Set-Cookie refreshToken
  → browser goes to /profile
```

`/profile` is inside the app layout, so `AppShell` calls `restoreSession()`. The access cookie is new, `getCurrentUser` succeeds, and the account renders.

If the user is already verified, the same route still mints a new cookie pair and returns 200. The normal first-time path is the unverified branch above.

## Flow 3 — Sign in later

```text
SignInForm
  → POST /api/auth/login   { email, password }   credentials: include
    → email must exist and isVerified must be true
    → bcrypt compare via isPassowordCorrect
    → generateAccessRefershToken
    → both cookies
    → JSON user, without password and without refreshToken
  → router.push("/home")
```

The JSON body is for the screen. The cookies are the session. Losing the JSON and keeping the cookies still leaves you logged in. Losing the cookies and keeping the JSON does not.

## Flow 4 — A new tab

This is the part that used to fail. React state is gone. The cookies are still in the browser if they have not expired and logout has not cleared them.

```text
Open /
  → page.tsx is a client component
  → useEffect calls restoreSession()

restoreSession()
  1. GET /api/auth/getCurrentUser
       cookie present and JWT valid → return the user → router.replace("/home")
  2. that call failed
       POST /api/auth/refresh
       then GET /api/auth/getCurrentUser again
       success → router.replace("/home")
  3. refresh failed too
       return null → router.replace("/sign-in")
```

The same function is used in three places so every entrance agrees:

| Entrance | Component | If a user comes back | If not |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `/home` | `/sign-in` |
| `/sign-in`, `/sign-up` | `GuestOnly` | `/home` | Show the form |
| `/home`, `/profile` | `AppShell` | Render the page | `/sign-in` |

`/verify-otp` is not wrapped in `GuestOnly`. A person confirming a code should stay on that form.

`restoreSession` keeps one in-flight promise. React can run the effect twice, and two callers can overlap. Sharing one request means the refresh cookie is rotated once. Refresh compares the cookie to `user.refreshToken` and then replaces that field, so a second refresh with the old cookie is rejected.

While the check runs, the page shows "Checking your session..." or "Loading your account...". The form and the account UI wait for the result.

## Flow 5 — Refresh, in detail

`POST /api/auth/refresh` does not look at the access cookie.

1. Read `req.cookies.refreshToken`.
2. `jwt.verify` with `REFRESH_TOKEN_SECRET`. A bad signature or an expired refresh JWT stops here.
3. Load the user by `_id` from the payload.
4. Compare the cookie string to `user.refreshToken`. Logout cleared it, or a newer refresh already replaced it, so a mismatch returns 401.
5. Call `generateAccessRefershToken`, which signs a new pair and saves the new refresh token.
6. Set both cookies again and return `{ msg: "AccessToken Refreshed" }`.

The old refresh cookie is now useless. The browser is holding the new pair because `Set-Cookie` replaced them.

`getCurrentUser` after that uses the new access cookie:

1. `verifyJWT` reads `accessToken`.
2. `jwt.verify` with `ACCESS_TOKEN_SECRET`.
3. Load the user. Missing user is 401.
4. `req.user` is set. The controller returns that user without `password` or `refreshToken`.

## Flow 6 — Logout

```text
ProfileScreen
  → GET /api/auth/logout   credentials: include
    → verifyJWT must accept the access cookie
    → $unset refreshToken on the user
    → Clear-Cookie accessToken
    → Clear-Cookie refreshToken
  → router.replace("/sign-in")
```

Clearing the cookies removes the proof from this browser. Deleting `refreshToken` in Mongo also makes a copied refresh cookie fail step 4 of refresh.

Logout itself requires a valid access token, because the route uses `verifyJWT`. If the access cookie is already dead and only the refresh cookie remains, this call returns 401 and the handler in `ProfileScreen` shows the error. `restoreSession()` on the next visit can still refresh and get back in, until logout succeeds with a live access cookie or the refresh cookie expires.

`clearCookie` uses the same `path`, `httpOnly`, `secure`, and `sameSite` as the cookies that were set. A mismatch there would leave the browser holding the old cookie.

## Why `"use client"` shows up on the front door

Next.js can render a page in two places.

**On the Next server**, before the browser runs your component. The old `/` page did this:

```ts
redirect("/sign-in");
```

That line never called Express. A valid `accessToken` cookie in the browser changed nothing, because the decision was already made.

**In the browser**, after `"use client"`. `useEffect` runs `restoreSession()`, which uses `fetch("/api/auth/getCurrentUser", { credentials: "include" })`. The browser attaches the cookies. Express answers. Then `router.replace` picks the page.

The forms were already client components because they handle typing and submit. `AppShell` was already a client component because it loads the user after paint. The front door follows that same path so there is one session function instead of a second cookie parser on the Next server.

A Server Component could forward the incoming `Cookie` header to Express. This app does not do that. The API client in `frontend/src/lib/api.ts` is browser `fetch`, and session restore uses it.

## What a protected page actually checks

There is no Next.js `middleware.ts` gate. Protection is two steps:

1. **Express** rejects `/getCurrentUser` and `/logout` without a valid access JWT. That is the real check.
2. **`AppShell`** treats a failed `restoreSession()` as "go to `/sign-in`". The account children render only after a user object exists.

Someone who opens `/home` with no cookies sees the loading state, then sign-in. Someone who opens `/home` with a good access cookie sees the account. Someone whose access JWT has expired and whose refresh cookie is still good is refreshed first, then sees the account.

## Mental model

```text
Password or OTP   →   one check on Express
                         │
                         ▼
                    two JWTs
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     access cookie                refresh cookie
     sent on API calls            sent only to /refresh
     dies in 1 day                dies in 10 days
           │                           │
           └─────────────┬─────────────┘
                         ▼
                  restoreSession()
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
            /home                /sign-in
```

The backend owns the decision. The Next page owns the navigation after that decision comes back.
