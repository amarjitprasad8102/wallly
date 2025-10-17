import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap, Globe, Lock, ArrowRight, Hash, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Lenis from '@studio-freight/lenis';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app');
      }
    });

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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4" aria-label="Main navigation">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-1.5 sm:p-2 rounded-lg" aria-hidden="true">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-label="Kindred logo" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Kindred</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/howtouse')} aria-label="How to use Kindred">
                How to Use
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/blog')} aria-label="Read our blog">
                Blog
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/privacy')} aria-label="Privacy Policy">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} aria-label="Sign in to your account">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')} aria-label="Get started with Kindred">
                Start
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-pulse-glow" aria-hidden="true"></div>
                <div className="relative bg-gradient-primary p-6 sm:p-8 rounded-full">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" aria-label="Chat icon" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Connect With Strangers Worldwide
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Connect with strangers worldwide through instant text chat. Make new friends and discover different cultures.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105"
                onClick={() => navigate('/auth')}
                aria-label="Start chatting now"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
                Start Chatting Now
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">Free • No Download • Ages 16+</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Why Choose Kindred?</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">The best random chat platform for meeting new people</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-label="Random matching icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Random Matching</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Connect instantly with random people from around the world. Every conversation is a new adventure.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-accent/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-label="Lightning fast icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Lightning Fast</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Experience instant connections with optimized peer-to-peer messaging. No delays, just real conversations.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-destructive/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" aria-label="Safe and secure icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Safe & Secure</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Age-verified users with unique IDs. Skip inappropriate content anytime. Your safety is our priority.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-label="Global community icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Global Community</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Meet people from every corner of the world. Discover new cultures and perspectives in real-time.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-accent/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Hash className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-label="Connect with ID icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Connect with ID</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Found someone interesting? Save their unique ID and reconnect anytime to continue your conversation.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-destructive/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" aria-label="No download required icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">No Download</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Start chatting instantly in your browser. No apps to download, no setup. Just click and connect.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">How It Works</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">Get started in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center group">
                <div className="bg-gradient-primary text-white w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Sign Up Free</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Create your account in seconds with just your email and age verification (16+)
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-primary text-white w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Start Matching</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Click "Start Chat" and get instantly matched with someone new from anywhere
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-primary text-white w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Chat & Connect</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Have fun conversations, skip if you want, and meet amazing people worldwide
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-base sm:text-lg text-muted-foreground">Everything you need to know about Kindred</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">How does random matching work?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  When you click "Start Chat", our system instantly pairs you with another available user from anywhere in the world. The matching is completely random to ensure diverse and interesting conversations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Is Kindred really free?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Kindred is completely free to use. You can chat with unlimited people without any cost. We believe in connecting people without barriers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">How do I reconnect with someone using their ID?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Every user has a unique ID. If you had a great conversation, save their ID! You can use the "Connect with ID" feature to send them a connection request and chat again anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Is my chat private and secure?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Absolutely! All chats are encrypted and anonymous. We don't store your personal information, and you can end any conversation at any time. Your safety and privacy are our top priorities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">What if I encounter inappropriate behavior?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  You can skip any chat instantly and report users who violate our community guidelines. We have age verification and moderation in place to keep the platform safe for everyone.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Do I need to download an app?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  No! Kindred works directly in your web browser on any device. No downloads, no installations, no hassle. Just visit our website and start chatting.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24 bg-gradient-primary text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Meet Someone New?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-4">
              Join thousands of people already chatting on Kindred. Your next conversation could change everything.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:scale-105 transition-all group"
              onClick={() => navigate('/auth')}
              aria-label="Get started free"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-muted-foreground">
          <p className="mb-3 sm:mb-4 leading-relaxed px-4">
            By using Kindred, you agree to be respectful and follow our community guidelines. Users must be 16 years or older.
          </p>
          <p>&copy; 2025 Kindred. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;