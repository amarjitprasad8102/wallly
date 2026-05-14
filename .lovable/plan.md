## Legal Policy Pages

Create 6 legal/policy pages for the Wallly platform to ensure compliance and legal protection.

### Pages to Create

1. **Terms of Service (ToS)** — `/terms`
   - Subscription & billing terms (auto-renewal, payment failure)
   - Account termination / suspension rights
   - Limitation of liability (downtime, bugs, data loss)
   - Intellectual property ownership
   - User conduct obligations

2. **Privacy Policy** — `/privacy` (exists, verify completeness)
   - Data collection & usage (already partially covered)
   - Third-party integrations (WebRTC, Supabase backend)
   - User rights (view, modify, delete)
   - Contact/Support info

3. **Refund & Cancellation Policy** — `/refund`
   - Cancellation steps for subscriptions
   - Refund eligibility rules (e.g., 7-day money-back, prorated access)
   - Payment failure handling

4. **Acceptable Use Policy (AUP)** — `/acceptable-use`
   - Prohibit spam, harassment, illegal content
   - Fair use & rate limits
   - Consequences for violations

5. **Cookie Policy** — `/cookies`
   - Types of cookies used (essential, analytics)
   - Opt-out mechanism for non-essential cookies

6. **Disclaimer** — `/disclaimer`
   - No guarantee of specific outcomes
   - Platform provided "as-is"
   - Limitation regarding third-party service behavior

### Technical Work

- Create `src/pages/Terms.tsx`, `src/pages/Refund.tsx`, `src/pages/AcceptableUse.tsx`, `src/pages/Cookies.tsx`, `src/pages/Disclaimer.tsx`
- Add routes in `src/App.tsx`
- Add entries to `public/sitemap-static.xml`
- Each page follows the same structure as `Privacy.tsx` (Helmet SEO, Breadcrumb, card layout, MadeByCorevia footer)
- Update existing `Privacy.tsx` footer to include links to other legal pages if a footer nav component does not already exist (will add a minimal footer link row to each page)