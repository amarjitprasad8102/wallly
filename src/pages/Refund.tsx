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

const Refund = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Refund &amp; Cancellation Policy - Wallly</title>
        <meta name="description" content="Wallly's Refund and Cancellation Policy: how to cancel your subscription and when refunds are issued." />
        <link rel="canonical" href="https://wallly.in/refund" />
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
                <BreadcrumbPage>Refund &amp; Cancellation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="bg-card rounded-xl p-8 border border-border shadow-card">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Refund &amp; Cancellation Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This policy describes how to cancel your Wallly Premium subscription and our stance on refunds. By subscribing,
                  you agree to the terms below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. How to Cancel</h2>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Log in to your Wallly account.</li>
                  <li>Navigate to <strong className="text-foreground">Profile Settings → Subscription</strong>.</li>
                  <li>Click <strong className="text-foreground">Cancel Subscription</strong> and confirm.</li>
                  <li>You will receive an email confirming the cancellation.</li>
                </ol>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  If you cannot access these settings, contact us via the <a href="/contact" className="text-primary hover:underline">Contact page</a>
                  {" "}and we will process the cancellation manually within 2 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. What Happens When You Cancel</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>You retain Premium access until the end of your current billing period.</li>
                  <li>No further charges will be made after cancellation.</li>
                  <li>At the end of the billing period, your account is downgraded to the free tier.</li>
                  <li><strong className="text-foreground">No prorated refunds</strong> are issued for the unused portion of the current billing cycle.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Refund Eligibility</h2>
                <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">All payments are non-refundable</strong>, except in the following cases:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Duplicate charges:</strong> Accidental double billing will be refunded in full within 7 business days.</li>
                    <li><strong className="text-foreground">Service unavailability:</strong> If Wallly Premium is unavailable for more than 72 consecutive hours due to our fault, you may request a prorated refund for the affected period.</li>
                    <li><strong className="text-foreground">Unauthorized transactions:</strong> If you can demonstrate a charge was made without your authorization, we will investigate and refund if warranted.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. How to Request a Refund</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Email us via the <a href="/contact" className="text-primary hover:underline">Contact page</a> within
                  <strong className="text-foreground"> 14 days</strong> of the disputed charge. Include your account email,
                  transaction ID, and reason for the request. We will respond within 5 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Failed Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If a renewal payment fails, we will retry the charge for up to 7 days. During this period, Premium features
                  may be temporarily disabled. If the payment cannot be collected, your account will be downgraded to free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Account Termination by Wallly</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Accounts terminated for violating our Terms of Service or Acceptable Use Policy are <strong className="text-foreground">not eligible</strong>
                  {" "}for refunds.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Chargebacks</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Please contact us before initiating a chargeback. Disputed chargebacks may result in immediate account suspension
                  pending review.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-x-3">
            <a href="/terms" className="hover:text-primary hover:underline">Terms</a>
            <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
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

export default Refund;
