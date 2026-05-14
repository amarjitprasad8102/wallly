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

const Terms = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service - Wallly</title>
        <meta name="description" content="Read Wallly's Terms of Service covering subscriptions, billing, account termination, liability, and intellectual property." />
        <link rel="canonical" href="https://wallly.in/terms" />
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
                <BreadcrumbPage>Terms of Service</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-card rounded-xl p-8 border border-border shadow-card">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By creating an account or using Wallly ("the Service"), you agree to be bound by these Terms of Service.
                  If you do not agree, do not use the Service. You must be at least 16 years old to use Wallly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. The Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wallly is a random video and text chat platform that connects users for real-time conversations using
                  WebRTC technology. We provide the matchmaking infrastructure; conversations occur peer-to-peer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Subscription &amp; Billing</h2>
                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <p>Wallly offers a Premium subscription at <strong className="text-foreground">₹329</strong> per billing cycle (monthly, unless otherwise stated).</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong className="text-foreground">Auto-renewal:</strong> Premium subscriptions automatically renew at the end of each billing cycle using your stored payment method until cancelled.</li>
                    <li><strong className="text-foreground">Upgrades/Downgrades:</strong> Plan changes take effect from the next billing cycle. No prorated charges or credits are issued for mid-cycle changes.</li>
                    <li><strong className="text-foreground">Failed Payments:</strong> If a renewal payment fails, we will retry for up to 7 days. If payment cannot be collected, your Premium access will be downgraded to the free tier.</li>
                    <li><strong className="text-foreground">Taxes:</strong> Prices are inclusive of applicable taxes unless stated otherwise.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Share illegal, sexually explicit, or harmful content</li>
                  <li>Impersonate any person or misrepresent your age</li>
                  <li>Use automated systems, bots, or scrapers</li>
                  <li>Attempt to bypass moderation, security, or rate limits</li>
                  <li>Record or distribute another user's likeness without consent</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  See our <a href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</a> for full details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Account Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend, restrict, or permanently terminate any account that violates these Terms,
                  the Acceptable Use Policy, or applicable laws — at our sole discretion and without prior notice.
                  Terminated users are not entitled to refunds for unused subscription time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is provided <strong className="text-foreground">"as-is"</strong> and <strong className="text-foreground">"as-available"</strong>
                  {" "}without warranties of any kind. To the maximum extent permitted by law, Wallly and Corevia shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages — including but not limited to loss of profits, data, downtime, bugs,
                  service interruptions, or harm caused by other users. Our total aggregate liability shall not exceed the amount you paid us in the
                  preceding 3 months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All software, branding, design, logos, and platform code are owned by Wallly / Corevia and protected by copyright and
                  trademark laws. You may not copy, modify, redistribute, reverse-engineer, or create derivative works without written permission.
                  You retain ownership of any content you create, but you grant us a worldwide, royalty-free license to host and transmit it
                  for the purpose of operating the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service relies on third-party providers (cloud hosting, email delivery, payment processing). Their availability is
                  outside our direct control. We are not responsible for outages or data handling by third parties beyond our reasonable control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these Terms at any time. Material changes will be communicated via email or in-app notice.
                  Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the
                  courts located in India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms, please reach us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-x-3">
            <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
            <a href="/refund" className="hover:text-primary hover:underline">Refund</a>
            <a href="/acceptable-use" className="hover:text-primary hover:underline">Acceptable Use</a>
            <a href="/cookies" className="hover:text-primary hover:underline">Cookies</a>
            <a href="/disclaimer" className="hover:text-primary hover:underline">Disclaimer</a>
          </div>
          <MadeByCorevia />
        </div>
      </div>
    </>
  );
};

export default Terms;
