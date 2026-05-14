import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MadeByCorevia from '@/components/MadeByCorevia';

const Cookies = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Cookie Policy - Wallly</title>
        <meta name="description" content="How Wallly uses cookies and similar tracking technologies, and how you can control them." />
        <link rel="canonical" href="https://wallly.in/cookies" />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                  <Home className="h-4 w-4" /> Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Cookie Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-card rounded-xl p-8 border border-border shadow-card">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website. They allow the site to remember
                  your actions and preferences. Wallly also uses related technologies such as <strong className="text-foreground">localStorage</strong> and <strong className="text-foreground">sessionStorage</strong>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Cookies We Use</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <div>
                    <p className="font-medium text-foreground">Essential (always on)</p>
                    <p>Required for the site to function — authentication tokens, session IDs, security tokens, age-gate state.
                      Without these, you cannot log in or use Wallly.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Functional</p>
                    <p>Remember your preferences such as chat mode, virtual background settings, and UI layout.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Analytical</p>
                    <p>Help us understand how the Service is used (page views, feature adoption) so we can improve it.
                      These are aggregated and anonymized.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Marketing</p>
                    <p>Currently, Wallly does <strong className="text-foreground">not</strong> use third-party marketing or advertising cookies.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Third-Party Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Some essential cookies are set by trusted infrastructure providers (authentication, payments, hosting) to
                  enable the Service. They do not track you across other websites for advertising purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">You can control cookies through:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong className="text-foreground">Your browser settings</strong> — block or delete cookies at any time. Note: blocking essential cookies will prevent login.</li>
                  <li><strong className="text-foreground">Our cookie banner</strong> (where shown) — opt out of non-essential cookies.</li>
                  <li><strong className="text-foreground">Browser DNT (Do Not Track)</strong> — we honor browser-level signals where technically feasible.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy as our practices evolve. The "Last updated" date will reflect any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions? Reach us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-x-3">
            <a href="/terms" className="hover:text-primary hover:underline">Terms</a>
            <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
            <a href="/refund" className="hover:text-primary hover:underline">Refund</a>
            <a href="/acceptable-use" className="hover:text-primary hover:underline">Acceptable Use</a>
            <a href="/disclaimer" className="hover:text-primary hover:underline">Disclaimer</a>
          </div>
          <MadeByCorevia />
        </div>
      </div>
    </>
  );
};

export default Cookies;
