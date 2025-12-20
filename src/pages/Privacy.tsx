import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Wallly</title>
        <meta name="description" content="Wallly Privacy Policy. Learn how we protect your data and keep your chats safe." />
        <meta name="keywords" content="privacy policy, data protection, chat privacy, user safety" />
        <link rel="canonical" href="https://wallly.in/privacy" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-card rounded-xl p-8 border border-border shadow-card">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: October 2025</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Random Chat. We are committed to protecting your privacy and ensuring a safe chat experience. 
                This Privacy Policy explains how we handle your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-2 text-muted-foreground">
                <p className="font-medium text-foreground">Account Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for authentication)</li>
                  <li>Unique user ID (automatically generated)</li>
                  <li>Premium status (if applicable)</li>
                </ul>
                <p className="font-medium text-foreground mt-4">Connection Data:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Connection requests between users</li>
                  <li>Connection timestamps</li>
                  <li>List of established connections</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. What We DON'T Store</h2>
              <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Chat Messages:</strong> All chat conversations are end-to-end encrypted 
                  and transmitted directly between users via WebRTC. We never store or have access to your chat content.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Shared Images:</strong> Images shared during chats are automatically 
                  deleted from our servers when the chat session ends. They are never permanently stored.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Personal Information:</strong> We do not collect or store names, 
                  phone numbers, addresses, or any other personal information beyond your email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide and maintain the chat service</li>
                <li>To authenticate users and prevent unauthorized access</li>
                <li>To facilitate connections between users</li>
                <li>To manage premium subscriptions (if applicable)</li>
                <li>To improve our service and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>End-to-end encryption for all chat messages</li>
                <li>Secure authentication using industry-standard protocols</li>
                <li>Automatic deletion of temporary data (chat images)</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Connection Management</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you disconnect from another user or remove a connection, all associated connection records are 
                automatically deleted from both sides. You maintain full control over your connections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access your account information at any time</li>
                <li>Delete your connections whenever you choose</li>
                <li>Request account deletion by contacting support</li>
                <li>Control who you connect with through our request system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use secure backend services to provide authentication and connection management. 
                These services are compliant with industry security standards and do not have access to your chat content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for users under 16 years of age. We do not knowingly collect 
                information from children under 16. If you believe we have collected information from a child 
                under 16, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of any significant 
                changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our practices, please use the "Connect by ID" 
                feature to reach out to our support team.
              </p>
            </section>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By using Random Chat, you agree to this Privacy Policy and our Terms of Service.
          </p>
        </footer>
        </div>
      </div>
    </>
  );
};

export default Privacy;
