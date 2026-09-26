# World ID for Agents integration debrief

## Scope

Tora-x125 targets the **Best Use of World ID for Agents** track using the official ETHGlobal event sandbox issuer:

`https://sandbox.auth.world.org`

The protected product event is a **Tora Trade Agent authorization**. The agent may prepare the route for a specific tokenised-impact-asset trade only after a fresh human verification has been validated by the Tora backend.

## Time to first success

**Live sandbox round trip:** not yet claimed in this repository because the event confidential-client credentials are not stored in source control.

The code path is implemented and CI-testable without secrets. The live timing should be filled in immediately after the first successful request → World completion → backend callback → protected action run:

- Started:
- First successful World callback:
- First protected Trade Agent authorization:
- Total time to first live success:

## Friction encountered

1. The Agents flow is different from the older IDKit-style frontend proof flow: it is a **confidential OIDC client** with backend code exchange, so the previous public `NEXT_PUBLIC_WORLD_ID_APP_ID` configuration was not sufficient.
2. Sandbox client registration requires an exact **public HTTPS callback**, which adds setup friction for local hackathon development and makes a tunnel or deployed preview useful.
3. A robust integration needs several OIDC checks that are easy to omit in a quick demo: PKCE, state, nonce, issuer, audience, signature/JWKS, expiry and fresh `auth_time`.
4. Success and cancellation are straightforward product states, but teams also need an explicit testable expired/denied path so the protected action visibly fails closed.

## Missing capability / documentation

A single copy-paste **Next.js reference integration** for the event sandbox—covering client registration, Authorization Code + PKCE, backend token exchange, exact ID-token claims, cancellation, expiry, and a protected-route example—would reduce ambiguity and make it easier to distinguish the Agents track from IDKit.

## One improvement with the greatest impact

Provide an event-specific **“golden path” starter** that creates a sandbox client and generates framework-specific server routes plus a built-in success/failure test page. This would move teams faster from “authentication works” to demonstrating the higher-value product moment: a meaningful agent action that is cryptographically gated by a fresh human verification.

## What Tora-x125 now demonstrates

### Successful path

```text
Trade proposal
  → POST /api/world/start
  → official sandbox authorization
  → user completes
  → GET /api/world/callback
  → server exchanges code
  → server verifies World-signed ID token
  → short-lived HttpOnly verified session
  → POST /api/world/protected-action
  → trade-bound authorization issued
```

### Unsuccessful path

```text
No valid/fresh World session
  → POST /api/world/protected-action
  → HTTP 403
  → actionExecuted=false
  → no authorization token
  → no route execution / no wallet-signing step
```

The callback also handles `access_denied`, expired requests, invalid state, invalid nonce, failed token exchange and failed ID-token validation.

## Security decisions

- `WORLD_ID_CLIENT_SECRET` is server-only.
- `WORLD_ID_SESSION_SECRET` is server-only.
- PKCE verifier is held in a signed HttpOnly flow cookie.
- State and nonce are single-request values.
- The nonce is bound to the immutable trade payload.
- ID tokens are verified using the sandbox JWKS and expected issuer/audience.
- Freshness is checked using `auth_time` relative to the request start.
- The raw World subject is not returned to the browser or stored onchain.
- The browser receives only a truncated SHA-256 subject commitment and session status.
- Protected action authorization expires after two minutes.

## Live demo checklist

- [ ] Register confidential client in the event sandbox portal.
- [ ] Configure exact public HTTPS callback: `https://YOUR_HOST/api/world/callback`.
- [ ] Store `WORLD_ID_CLIENT_ID` and `WORLD_ID_CLIENT_SECRET` only in backend environment.
- [ ] Set a strong random `WORLD_ID_SESSION_SECRET`.
- [ ] Open `/world-agents`.
- [ ] Run successful World request and record elapsed time.
- [ ] Run protected Trade Agent action and show authorization ID.
- [ ] Use **Test denied path** and show `403` / `actionExecuted=false`.
- [ ] Optionally cancel at World to demonstrate the real `access_denied` callback.
- [ ] Update this debrief with the measured time to first live success.
