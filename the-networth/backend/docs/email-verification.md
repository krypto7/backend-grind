# Email verification

This is the flow in this backend today. Read it in order. Each step answers one question: what do we know so far, and what do we need next?

## The problem

Signup only proves that someone typed an email. It does not prove they own that inbox. Verification is a second check:

1. Create the account with `isVerified: false`.
2. Send a secret that only that inbox should see.
3. When the secret comes back, set `isVerified: true` and throw the secret away.

If you skip step 3, anyone can sign up with someone else's email.

## How to think before writing code

Ask these questions one by one. Do not jump to the email HTML.

1. **What changes on the user?** `isVerified` starts `false`. After a successful check it becomes `true`.
2. **What is the secret?** A token. Here it is a JWT that contains the user id and expires in 10 minutes.
3. **Where do we remember it?** On the user, in `emailVerificationToken`. The database copy is what makes the link one-time. The JWT expiry is what makes it short-lived. You need both.
4. **How does the secret leave the server?** Email. The message has a button. The button is only a link. Email apps do not run your API. A click opens a URL.
5. **How does the secret come back?** `GET /api/auth/verify-email?token=...`. No login cookie. The token itself is the proof.
6. **What do we do when it comes back?** Check the JWT, find the user who still has that exact token, set `isVerified`, delete the token.
7. **What if it is wrong, old, or already used?** Reject it. Do not tell the caller which of those three happened.

That order is the design. The files below are just where each answer lives.

## Files

| File | Job |
| --- | --- |
| `src/models/user.model.ts` | Stores `isVerified` and `emailVerificationToken` |
| `src/controllers/auth.controller.ts` | `signup` creates the token. `verifyEmail` consumes it |
| `src/services/verifyEmail.ts` | Builds the link and sends the mail |
| `src/templates/verifyEmail.html` | The button the user sees |
| `src/routes/auth.routes.ts` | `GET /api/auth/verify-email` is public |

`verifyEmail` in the service sends mail. `verifyEmail` in the controller checks the token. They share a name and do different jobs. The controller imports the mail function as `sendVerifyEmail` so the two do not clash.

## Signup, one step at a time

`POST /api/auth/signup`

**1. Check the body.** First name, last name, username, email, and password are all required. If one is missing, stop.

**2. Check the email and username are new.** One query looks for either. If a user already exists, stop. You do not send a second verification mail for an account that is already there.

**3. Create the user.** `isVerified` is `false` by default. The password is hashed by the `pre("save")` hook. At this moment the account exists, but it is not trusted.

**4. Make the token.**

```ts
jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10m" })
```

The payload is only the user id. The signature proves we created it. `exp` proves it dies after 10 minutes. The raw token is the secret that goes in the email.

**5. Send the email.** `sendVerifyEmail(email, token)` reads `src/templates/verifyEmail.html`, fills `{{verifyUrl}}`, and sends HTML plus a plain-text fallback.

The link in the mail is:

```
{FRONTEND_URL}/verify-email?token={token}
```

Example from `.env`: `http://localhost:3000/verify-email?token=...`

That host is the frontend. Postman and the API live on the backend. Same token, different URL. See [Test it](#test-it).

**6. Save the token on the user.** `user.emailVerificationToken = token`, then `user.save()`. The second save does not re-hash the password, because the password field did not change.

**7. Respond.** Signup returns the user and the token. The account is still unverified until step 6 of the click flow succeeds.

## The click, one step at a time

`GET /api/auth/verify-email?token=...`

This route has no `verifyJWT` middleware. The person is not logged in yet. The query token is the only credential.

**1. Read `req.query.token`.** Missing token means stop with `401`.

**2. `jwt.verify` the token with `SECRET_KEY`.** This fails when the signature is fake or the 10 minutes are over. Both land in `catch` and return `401`.

**3. Load the user with two conditions at once.**

```ts
User.findOne({
  _id: decoded.id,
  emailVerificationToken: token,
})
```

The id comes from the JWT. The token must still be the one stored on that user. If they already verified, the field was deleted, so this find returns nothing.

**4. No user means stop.** Same `401` as a bad token. One message for every failure is enough for this version.

**5. Update the user.**

- `$set: { isVerified: true }`
- `$unset: { emailVerificationToken: 1 }` removes the field

Deleting the token is what makes the link single-use. A second click fails at step 3 even if the JWT has not expired yet.

**6. Respond** `200` with `{ status: "true", msg: "email verified" }`.

## Picture of the whole path

```
signup
  create user (isVerified false)
  sign a 10-minute JWT
  email the token
  save emailVerificationToken
        |
        v
user opens the mail and clicks the button
        |
        v
GET /api/auth/verify-email?token=...
  jwt.verify
  find user by id + stored token
  isVerified true
  delete emailVerificationToken
```

## Test it

**Signup**

- `POST http://localhost:8000/api/auth/signup`
- JSON body: `firstname`, `lastname`, `username`, `email`, `password`
- Copy `token` from the response. It expires in 10 minutes.

**Verify**

- `GET http://localhost:8000/api/auth/verify-email`
- Params: `token` = the value you copied
- No auth header, no body

The mail link starts with `http://localhost:3000`. Postman must use `http://localhost:8000/api/auth/verify-email` and the same token.

Success: `"msg": "email verified"`. In Mongo, `isVerified` is `true` and `emailVerificationToken` is gone.

Call the same URL again. It returns `401`, because the stored token is gone.

## Advanced ideas

These are not in the code yet. Add them when the basic click works.

**Do not return the token from signup.** The inbox should be the only place that sees it. Returning it in JSON lets anyone skip the email. The response can say "check your email" and nothing else. Also omit `password` and `emailVerificationToken` from the user object you send back.

**Save the token before you send the mail.** If send succeeds and the save fails, the inbox has a link the database does not know. Write `emailVerificationToken`, then send.

**Store a hash, not the raw token.** Save `sha256(token)` in Mongo. On verify, hash the query token and compare. A database leak then does not hand out live links. Send the raw token only inside the email.

**Block login until `isVerified` is true.** Right now login ignores that flag, so the check does not protect anything. After a correct password, if `isVerified` is false, return a clear "verify your email" response and do not issue access or refresh tokens.

**Point the button at a page, and let the page call the API.** The mail link can stay on `FRONTEND_URL`. That page reads `token` from the query and calls `GET /api/auth/verify-email`. The API response stays JSON. The page shows "Email verified" or "Link expired". Direct API links dump JSON in the browser.

**Separate "expired" from "already used" only in your logs.** The client can keep seeing one message. Your server log can record which check failed, so you can debug without teaching an attacker how the token works.

**Resend.** `POST /api/auth/resend-verification` with the email. If the user exists and `isVerified` is false, sign a new JWT, replace `emailVerificationToken`, and send again. Always respond with the same success message, even when the email is unknown, so people cannot use this route to discover accounts.

**Rate limit signup and resend.** A few sends per email per hour. Otherwise the route becomes a way to spam inboxes through your Gmail account.

**One-time random token instead of a JWT.** `crypto.randomBytes(32).toString("hex")` plus an `emailVerificationExpires` date is enough. A JWT is useful when you want the expiry inside the token. A random string is useful when you want no user id visible in the link. Both are fine if you store a hash and delete it after use.
