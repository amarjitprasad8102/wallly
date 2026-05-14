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

const AcceptableUse = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Acceptable Use Policy - Wallly</title>
        <meta name="description" content="Wallly's Acceptable Use Policy: rules against spam, harassment, abuse, and limits to keep the platform safe for everyone." />
        <link rel="canonical" href="https://wallly.in/acceptable-use" />
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
                <BreadcrumbPage>Acceptable Use</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-card rounded-xl p-8 border border-border shadow-card">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Acceptable Use Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Purpose</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Acceptable Use Policy ("AUP") defines what behavior is permitted on Wallly. It applies to all users —
                  free, premium, and stranger-mode — and supplements our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Prohibited Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">You may not use Wallly to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong className="text-foreground">Harass or abuse</strong> other users — including bullying, threats, hate speech, or discriminatory language based on race, gender, sexuality, religion, or disability.</li>
                  <li><strong className="text-foreground">Share sexually explicit content</strong>, nudity, or sexually suggestive material — particularly involving minors (zero-tolerance, reported to authorities).</li>
                  <li><strong className="text-foreground">Spam</strong> or send unsolicited promotional messages, links, or referral codes.</li>
                  <li><strong className="text-foreground">Impersonate</strong> other people, brands, or Wallly staff.</li>
                  <li><strong className="text-foreground">Share illegal content</strong>, including pirated material, weapons sales, drug solicitation, or fraud.</li>
                  <li><strong className="text-foreground">Solicit personal data</strong> (phone numbers, addresses, payment info) from other users.</li>
                  <li><strong className="text-foreground">Record or screenshot</strong> conversations with intent to publish without the other party's consent.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Technical Restrictions</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>No automated bots, scripts, or scrapers.</li>
                  <li>No attempts to bypass our moderation, age gate, or rate limits.</li>
                  <li>No reverse-engineering, decompiling, or probing the Service for vulnerabilities (except via responsible disclosure).</li>
                  <li>No DDoS, brute-force, or load-testing of our infrastructure.</li>
                  <li>No injection of malware, viruses, or malicious code through chat, images, or any input field.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Fair Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wallly is intended for personal, non-commercial use. Excessive use that degrades performance for others —
                  including running multiple simultaneous sessions, opening hundreds of matches per hour, or other abusive
                  patterns — may result in rate-limiting, throttling, or suspension.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Reporting Violations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Use the in-app <strong className="text-foreground">Report</strong> button during any chat to flag harmful behavior.
                  Reports are reviewed by our moderation team. You can also reach us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Consequences</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">Depending on severity, violations may result in:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Warnings and content removal</li>
                  <li>Temporary suspension</li>
                  <li>Permanent account termination without refund</li>
                  <li>IP / device bans</li>
                  <li>Reporting to law enforcement where required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Updates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may revise this AUP at any time. Continued use after changes constitutes acceptance.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-x-3">
            <a href="/terms" className="hover:text-primary hover:underline">Terms</a>
            <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
            <a href="/refund" className="hover:text-primary hover:underline">Refund</a>
            <a href="/cookies" className="hover:text-primary hover:underline">Cookies</a>
            <a href="/disclaimer" className="hover:text-primary hover:underline">Disclaimer</a>
          </div>
          <MadeByCorevia />
        </div>
      </div>
    </>
  );
};

export default AcceptableUse;
