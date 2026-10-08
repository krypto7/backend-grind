# Authentication

This is the session design used by production web apps, and the version this project implements. Read it in order. Each step answers one question: what do we know so far, and what has to happen next?

## The problem

HTTP forgets you after every response. The server does not remember that the previous request was you. Login has to leave behind a proof the browser can show on the next request, including after the tab is closed.

A password is a bad proof to keep sending. It is the master key. Production apps check the password once, then hand the browser a token. Later requests show the token.

## Fundamental: a token is a signed proof

A token in this app is a JWT. It is one string with three parts:

1. **Header.** Says this is a JWT and which algorithm signed it.
2. **Payload.** The claims. Here that is the user id, and for the access token also the username and email. It also has an expiry.
3. **Signature.** The server signs the first two parts with a secret (`ACCESS_TOKEN_SECRET` or `REFRESH_TOKEN_SECRET`). Anyone can read the payload. Only the server can produce a signature that `jwt.verify` accepts.

Verification does not look the password up again. It checks three things:

- The signature matches the secret.
- The expiry is still in the future.
- The user id inside still exists.

If any of those fail, the API returns 401. The caller is not logged in for that request.

The token is not the cookie. The token is the string. The cookie is the box the browser stores that string in and attaches to later requests.

## Fundamental: two tokens, two jobs

One long-lived token is convenient and dangerous. If it leaks, the thief stays logged in for as long as it lasts, and the server has nothing short to reject.

Production apps split the proof:

| Token | Job | Lifetime in this app | Stored where |
| --- | --- | --- | --- |
| Access token | Opens protected APIs. Sent on every call. | JWT expiry comes from `ACCESS_TOKEN_EXPIRY`. The cookie itself lasts 24 hours. | `accessToken` cookie, and nowhere in the database |
| Refresh token | Gets a new access token when the access token is rejected. Not used as the API pass. | JWT expiry comes from `REFRESH_TOKEN_EXPIRY`. The cookie lasts 10 days. | `refreshToken` cookie, and a copy on the user in MongoDB |

The access token can be checked without a database lookup for the signature and expiry. This app still loads the user, so a deleted account stops working immediately. The refresh token is checked against the database copy. That copy is what makes logout and rotation real: delete or replace the database value, and the old refresh token stops working even if the thief still has the string.

Login creates both. Logout deletes the database copy and clears both cookies.

## Fundamental: the browser holds the tokens, JavaScript does not

Both cookies are set with:

- `httpOnly: true` so page JavaScript cannot read them.
- `secure` in production so they travel only over HTTPS.
- `sameSite: "lax"` so the browser sends them on normal visits to this site, and not on random cross-site requests.
- `path: "/"` so every route on this origin gets them.
- `maxAge` so closing the tab does not delete them. A cookie without `maxAge` is a session cookie and dies when the browser closes.

The frontend never saves the token in `localStorage` or React state. It calls `fetch` with `credentials: "include"`. That one option tells the browser to attach the cookies and to keep any `Set-Cookie` headers from the response.

This is the production default for a first-party web app. `localStorage` is readable by any script on the page, so one XSS bug becomes a stolen session. An httpOnly cookie is not readable that way.

## The flow

### 1. Sign up does not start a session

`POST /api/auth/signup` creates the user with `isVerified: false` and sends an OTP. No auth cookies are set. An unverified account cannot log in. Email verification is a separate flow, documented in `backend/docs/email-verification.md`.

### 2. Login trades the password for the two cookies

`POST /api/auth/login` checks the email, `isVerified`, and the password hash. On success `generateAccessRefershToken` builds both JWTs, saves the refresh token on the user, and clears any previous refresh token.

The response sets `accessToken` and `refreshToken` as httpOnly cookies and returns the user. The JSON body does not contain the tokens.

### 3. Coming back to the site

The cookies are still in the browser. `frontend/src/proxy.ts` runs on the server before the page renders.

- `/` with either cookie redirects to `/home`.
- `/` with neither cookie redirects to `/sign-in`.
- `/home` and `/profile` with neither cookie redirect to `/sign-in`.

Cookie presence is only a gate. It means "a session might exist." It does not mean the JWT is still valid. The page is allowed to render, and the next step asks the API.

### 4. The app asks who you are

`AppShell` calls `loadAccount`, which calls `GET /api/auth/getCurrentUser` through `authFetch`. The browser attaches the access cookie. `verifyJWT` verifies that JWT and loads the user. The home screen renders from that user.

If this call returns 200, the refresh token is not used.

### 5. A 401 means "try the refresh token once"

`authFetch` wraps protected calls (`getCurrentUser`, `logout`, and any later call that uses it). When the response is 401:

1. Refresh once. `GET /api/auth/refresh` sends the refresh cookie. The handler verifies the JWT, matches it to `user.refreshToken`, saves a new refresh token, and sets both cookies again.
2. Retry the original call once. The browser now sends the new access cookie.
3. If the refresh call itself fails, the original 401 stands. `loadAccount` returns null and the app goes to `/sign-in`.

The access token is the key for the door. The refresh token is the slip that gets a new key. You only show the slip when the key is rejected.

While the tab stays open, the same wrapper covers later calls. Logout goes through it too, so an expired access token can still be refreshed and then revoked.

### 6. Two tabs must not destroy each other

Each refresh replaces the database refresh token. If two tabs send the old token at the same moment, the second used to look stolen and got a 401.

Two guards stop that:

- In the browser, `navigator.locks` lets one tab refresh. The other tab waits, then retries with the cookie the first tab already stored.
- On the server, the old refresh token stays acceptable for 30 seconds (`previousRefreshToken`). The second request in that window receives the new pair instead of a 401. After 30 seconds, reuse is rejected.

### 7. Logout ends the session on the server

`GET /api/auth/logout` runs behind `verifyJWT`, deletes `refreshToken` from the user, and clears both cookies. A copied refresh token cannot mint a new access token after that, because the database copy is gone.

## Where each piece lives

| Piece | File | What it decides |
| --- | --- | --- |
| JWT creation | `backend/src/models/user.model.ts` | `generateAccessToken`, `generateRefreshToken` |
| Cookie options, login, refresh, logout | `backend/src/controllers/auth.controller.ts` | Issues, rotates, and clears the session |
| Access-token check | `backend/src/middlewares/auth.middlewale.ts` | `verifyJWT` on protected routes |
| Routes | `backend/src/routes/auth.routes.ts` | `POST /login`, `GET /refresh`, `GET /getCurrentUser`, `GET /logout` |
| Attach cookies, refresh on 401, retry | `frontend/src/lib/api.ts` | `authFetch`, `loadAccount` |
| Cookie names | `frontend/src/lib/session.ts` | `accessToken`, `refreshToken` |
| Redirect before render | `frontend/src/proxy.ts` | `/`, `/home`, `/profile` |
| Load the user into the screen | `frontend/src/components/app/app-shell.tsx` | Calls `loadAccount` after the server lets the page through |

## What this is, in one pass

```text
Password  --once-->  login
login     --sets-->  access cookie + refresh cookie
later API --sends--> access cookie
401       --sends--> refresh cookie
refresh   --sets-->  new access cookie + new refresh cookie
retry     --sends--> new access cookie
logout    --deletes--> database refresh token + both cookies
```

That sequence is the production session: a short-lived access token for requests, a long-lived refresh token that can be revoked, both kept in httpOnly cookies, and a client that refreshes only after a 401.
