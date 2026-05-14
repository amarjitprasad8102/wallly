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

const Disclaimer = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Disclaimer - Wallly</title>
        <meta name="description" content="Wallly's general disclaimer regarding service outcomes, user-generated content, and third-party services." />
        <link rel="canonical" href="https://wallly.in/disclaimer" />
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
                <BreadcrumbPage>Disclaimer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-card rounded-xl p-8 border border-border shadow-card">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Disclaimer</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. General Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information and Service provided by Wallly is for general use only. While we strive to keep everything
                  accurate and operational, we make no representations or warranties of any kind, express or implied, about
                  the completeness, accuracy, reliability, suitability, or availability of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. No Guarantee of Outcomes</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wallly is a random matchmaking platform. We do <strong className="text-foreground">not guarantee</strong> any specific outcome
                  from using the Service, including but not limited to: making friends, finding compatible matches, engagement
                  metrics, follower growth, financial returns, or relationship success. Any expectations of specific results
                  are entirely your own.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. User-Generated Content</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wallly connects users for peer-to-peer conversations. We are not responsible for the conduct, language,
                  opinions, or actions of other users. Use the Service with caution and report any inappropriate behavior.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. No Professional Advice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Conversations on Wallly may touch on sensitive topics including mental health, relationships, finance, and
                  legal matters. <strong className="text-foreground">Nothing on Wallly constitutes professional advice.</strong> If you
                  need help, consult a qualified professional. If you are in crisis, contact local emergency services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wallly uses third-party providers (cloud hosting, payments, email delivery). We are not responsible for
                  outages, data handling, or actions of these third parties beyond our reasonable control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. External Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service may contain links to external websites that are not operated by us. We have no control over
                  the content and practices of those sites and cannot accept responsibility for them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Service Availability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not warrant uninterrupted, secure, or error-free operation of the Service. The Service is provided
                  on an <strong className="text-foreground">"as-is"</strong> and <strong className="text-foreground">"as-available"</strong> basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Changes</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Disclaimer may be updated at any time. Continued use of the Service constitutes acceptance.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-x-3">
            <a href="/terms" className="hover:text-primary hover:underline">Terms</a>
            <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
            <a href="/refund" className="hover:text-primary hover:underline">Refund</a>
            <a href="/acceptable-use" className="hover:text-primary hover:underline">Acceptable Use</a>
            <a href="/cookies" className="hover:text-primary hover:underline">Cookies</a>
          </div>
          <MadeByCorevia />
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
