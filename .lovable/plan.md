# Plan

## 1. Migrate all emails to Lovable Email (replace AWS SES)

**Auth emails** are already on Lovable Email (auth-email-hook deployed). Done.

**App / notification emails** — currently use AWS SES via these edge functions:
- `send-ses-email` (admin bulk send raw HTML)
- `send-notification-email` (welcome, connection request, premium upgrade, etc.)
- `send-bulk-blast` (cron + admin blasts)
- `send-email` (legacy)
- `send-auth-email` (legacy SES version — replace with Lovable hook only)

Replacement approach:
- Scaffold Lovable transactional email infrastructure (`send-transactional-email` + templates).
- Create React Email templates for each existing notification type: `welcome`, `connection-request`, `connection-accepted`, `new-message`, `premium-upgrade`, `account-warning`, `community-join`, `admin-blast`.
- Rewrite `src/utils/emailNotifications.ts` to invoke `send-transactional-email` with a `templateName` + `templateData` instead of calling `send-notification-email`.
- Update admin blast UI (`AdminEmailBlasts.tsx`, `send-bulk-blast`) to enqueue one transactional send per recipient using the `admin-blast` template (still sequential).
- Delete the SES edge functions (`send-ses-email`, `send-notification-email`, `send-bulk-blast`, `send-email`, `send-auth-email`) and undeploy them.
- Remove AWS SES secrets references; keep the secrets in the vault (user can delete manually).

## 2. Enforce email verification

- Call `configure_auth` with `auto_confirm_email = false` so signups require email confirmation.
- In `src/pages/Auth.tsx`, after signup show a "Check your email" screen instead of routing in.
- In session handling (e.g. `App.tsx` / auth pages), block users whose `user.email_confirmed_at` is null — sign them out with a toast directing to verify.
- Add a "Resend verification" button on the auth page using `supabase.auth.resend({ type: 'signup', email })`.

## 3. Remove stranger account flow entirely

Files to delete:
- `src/components/StrangerDialog.tsx`
- `src/components/RequireAgeGate.tsx` (if only used by stranger flow — verify first)
- Any stranger-only pages or routes.

Code changes:
- Remove all imports/usages of `StrangerDialog` (Landing, Index, etc.).
- Remove "Continue as stranger" buttons / CTAs on landing and auth pages.
- Remove stranger branches in `useMatch`, matchmaking, and chat hooks (anything referencing `temp_id`, `stranger_sessions`, `isStranger`, `verification_token`).
- Drop the `stranger_sessions` table via migration.
- Update memory entries that reference the stranger flow.

## 4. Fast-loading / HTML-first optimizations

- Convert the public marketing pages (`Landing`, `Blog`, `BlogDetail`, `Privacy`, `Terms`, `Cookies`, `Refund`, `Disclaimer`, `AcceptableUse`, `HowToUse`, `Contact`) to use static, semantic HTML with minimal client JS — strip unused effects, replace heavy components with plain `<section>` markup.
- Add `React.lazy` + `Suspense` route splitting in `App.tsx` for app-only pages (`Index`, `Admin`, `Premium`, `Connections`, `Communities`, etc.).
- Add `loading="lazy"` and explicit `width`/`height` to all `<img>` on marketing pages (prevent CLS).
- Defer non-critical scripts; ensure no console.logs in production (already configured).
- Preload the LCP hero image on Landing in `index.html`.
- Audit `package.json` for heavy unused deps — leave install changes to a follow-up if any spotted.

## Technical details

**Templates registry** (`supabase/functions/_shared/transactional-email-templates/registry.ts`) will gain 8 templates. Each template imports brand color `#7c3aed` and white body.

**Migration** drops `stranger_sessions` and any policies attached.

**Auth gate**: a small `<RequireVerifiedEmail>` wrapper around protected routes that signs out unverified sessions.

**Performance**: route-level code splitting target — keep `Landing` bundle under ~80 KB JS gzipped; marketing pages render server-acceptable HTML on first paint (Vite SPA, but minimal JS on those routes).

## Out of scope / confirmations needed

- I'll keep Razorpay flow unchanged.
- I'll keep the existing `EmailTemplates` helper file for now if any non-email code imports it; otherwise delete.
- The `stranger_sessions` table will be dropped — existing rows lost. Confirm acceptable.
