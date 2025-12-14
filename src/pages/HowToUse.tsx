import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus, Hash, Users, Shield, ArrowRight, CheckCircle, Home } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const HowToUse = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>How to Use Wallly - Complete Guide to Random Video Chat</title>
        <meta name="description" content="Learn how to use Wallly in 5 simple steps. Complete guide to random video chat, connecting with friends by ID, joining communities, and staying safe online." />
        <meta name="keywords" content="how to use, user guide, random chat tutorial, video chat guide, connect by ID, join communities" />
        <link rel="canonical" href="https://wallly.corevia.in/howtouse" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use Wallly for Random Video Chat",
            "description": "Step-by-step guide to connecting with people worldwide on Kindred",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Create Your Account",
                "text": "Sign up with your email address and verify you're 16 or older"
              },
              {
                "@type": "HowToStep",
                "name": "Start Random Matching",
                "text": "Click the Start Chat button and get instantly matched with someone new"
              },
              {
                "@type": "HowToStep",
                "name": "Connect with ID",
                "text": "Save user IDs and send connection requests to chat again"
              }
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4" aria-label="Main navigation">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-primary p-1.5 sm:p-2 rounded-lg" aria-hidden="true">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-label="Wallly logo" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Wallly</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} aria-label="Go to home">
                Home
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')} aria-label="Get started with Wallly">
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Breadcrumbs */}
      <div className="px-4 py-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>How to Use</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="py-16 sm:py-20 lg:py-24">
        {/* Hero Section */}
        <section className="px-4 mb-16 sm:mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              Complete Guide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              How to Use Wallly
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to start connecting with people worldwide and make meaningful conversations
            </p>
          </div>
        </section>

        {/* Step-by-step Guide */}
        <section className="px-4 max-w-6xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Step 1: Sign Up */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="bg-gradient-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Create Your Account</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Sign up with your email address and verify you're 16 or older. No personal information needed beyond that!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Quick registration in under 30 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Receive your unique Wallly ID</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Completely free, no credit card required</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
                  <UserPlus className="w-20 h-20 sm:w-24 sm:h-24 text-primary mx-auto mb-6" />
                  <div className="space-y-4">
                    <div className="h-3 bg-muted rounded-full w-3/4 mx-auto animate-pulse"></div>
                    <div className="h-3 bg-muted rounded-full w-1/2 mx-auto animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Start Random Chat */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="bg-gradient-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Start Random Matching</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Click the "Start Chat" button and get instantly matched with someone new from anywhere in the world!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Instant matching with available users</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Real-time text messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Skip anytime if the conversation isn't for you</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
                  <MessageCircle className="w-20 h-20 sm:w-24 sm:h-24 text-accent mx-auto mb-6 animate-pulse-glow" />
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-2xl p-4 ml-auto max-w-[80%]">
                      <div className="h-2 bg-primary/30 rounded-full w-full mb-2"></div>
                      <div className="h-2 bg-primary/30 rounded-full w-3/4"></div>
                    </div>
                    <div className="bg-accent/10 rounded-2xl p-4 mr-auto max-w-[80%]">
                      <div className="h-2 bg-accent/30 rounded-full w-full mb-2"></div>
                      <div className="h-2 bg-accent/30 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Connect with ID */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="bg-gradient-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Connect with ID</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Found someone you'd like to chat with again? Save their unique ID and send them a connection request!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Every user has a permanent unique ID</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Send connection requests to specific users</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Build your network of friends worldwide</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
                  <Hash className="w-20 h-20 sm:w-24 sm:h-24 text-destructive mx-auto mb-6" />
                  <div className="bg-muted/50 rounded-2xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Enter User ID</p>
                    <div className="bg-background border-2 border-primary/50 rounded-xl p-4 font-mono text-xl font-bold text-primary">
                      #KIN12345
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Manage Connections */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="bg-gradient-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                  4
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Manage Your Connections</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                View all your connections, pending requests, and chat history in one convenient place.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Accept or decline connection requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Resume conversations with your friends</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Organized connection management</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
                  <Users className="w-20 h-20 sm:w-24 sm:h-24 text-primary mx-auto mb-6" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((item, index) => (
                      <div key={item} className="flex items-center gap-4 bg-muted/30 rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-10 h-10 rounded-full bg-gradient-primary"></div>
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full w-1/2 mb-2"></div>
                          <div className="h-2 bg-muted rounded-full w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Join Communities */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="bg-gradient-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                  5
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">Join Bharatiya Samudaay</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Explore our vibrant communities connecting India to the world. Join interest-based groups and grow together!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Browse communities by interest</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Create your own community</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Connect India to the world</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all">
                  <Users className="w-20 h-20 sm:w-24 sm:h-24 text-accent mx-auto mb-6" />
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-3 rounded-full font-semibold">
                      <Users className="w-5 h-5" />
                      Bharatiya Samudaay
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24 mt-16 sm:mt-20">
          <div className="max-w-4xl mx-auto text-center bg-gradient-primary rounded-3xl p-8 sm:p-12 lg:p-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90">
              Join thousands of people making new friends on Wallly today!
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:scale-105 transition-all group"
              onClick={() => navigate('/auth')}
              aria-label="Start chatting now"
            >
              Start Chatting Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 Wallly. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
};

export default HowToUse;
