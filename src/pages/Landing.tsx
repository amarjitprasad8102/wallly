import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Main navigation">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg" aria-hidden="true">
                <MessageCircle className="w-6 h-6 text-white" aria-label="Kindred logo" />
              </div>
              <h2 className="text-xl font-bold">Kindred</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/blog')} aria-label="Read our blog">
                Blog
              </Button>
              <Button variant="ghost" onClick={() => navigate('/privacy')} aria-label="Privacy Policy">
                Privacy
              </Button>
              <Button variant="ghost" onClick={() => navigate('/auth')} aria-label="Sign in to your account">
                Sign In
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')} aria-label="Get started with Kindred">
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse-glow" aria-hidden="true"></div>
                <div className="relative bg-gradient-primary p-8 rounded-full shadow-glow">
                  <MessageCircle className="w-20 h-20 text-white" aria-label="Chat icon" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Connect With Strangers Worldwide
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Connect with strangers worldwide through instant text chat. Make new friends, have meaningful conversations, and discover different cultures.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-glow"
                onClick={() => navigate('/auth')}
                aria-label="Start chatting now"
              >
                <MessageCircle className="w-6 h-6 mr-2" aria-hidden="true" />
                Start Chatting Now
              </Button>
              <p className="text-sm text-muted-foreground">Free • No Download • Ages 16+</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Kindred?</h2>
              <p className="text-xl text-muted-foreground">The best random chat platform for meeting new people</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up">
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Users className="w-8 h-8 text-primary" aria-label="Random matching icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Random Matching</h3>
                <p className="text-muted-foreground">
                  Connect instantly with random people from around the world. Every conversation is a new adventure waiting to happen.
                </p>
              </article>

              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Zap className="w-8 h-8 text-accent" aria-label="Lightning fast icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Experience instant connections with our optimized peer-to-peer messaging technology. No delays, just real conversations.
                </p>
              </article>

              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-destructive/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Shield className="w-8 h-8 text-destructive" aria-label="Safe and secure icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  Age-verified users with unique IDs. Skip inappropriate content and end chats anytime. Your safety is our priority.
                </p>
              </article>

              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Globe className="w-8 h-8 text-primary" aria-label="Global community icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Global Community</h3>
                <p className="text-muted-foreground">
                  Meet people from every corner of the world. Discover new cultures, languages, and perspectives in real-time.
                </p>
              </article>

              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="bg-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <Lock className="w-8 h-8 text-accent" aria-label="Private and anonymous icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Private & Anonymous</h3>
                <p className="text-muted-foreground">
                  Chat anonymously with your unique ID. No personal information required. Your privacy is completely protected.
                </p>
              </article>

              <article className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all hover:shadow-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="bg-destructive/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6" aria-hidden="true">
                  <MessageCircle className="w-8 h-8 text-destructive" aria-label="No download required icon" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No Download Required</h3>
                <p className="text-muted-foreground">
                  Start chatting instantly in your browser. No apps to download, no complicated setup. Just click and connect.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up Free</h3>
                <p className="text-muted-foreground">
                  Create your account in seconds with just your email and age verification (16+)
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Matching</h3>
                <p className="text-muted-foreground">
                  Click "Start Chat" and get instantly matched with someone new from anywhere
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat & Connect</h3>
                <p className="text-muted-foreground">
                  Have fun conversations, skip if you want, and meet amazing people worldwide
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 bg-gradient-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Meet Someone New?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people already chatting on Kindred. Your next conversation could change everything.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-all"
              onClick={() => navigate('/auth')}
              aria-label="Get started free"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p className="mb-4">
            By using Kindred, you agree to be respectful and follow our community guidelines. Users must be 16 years or older.
          </p>
          <p>&copy; 2025 Kindred. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;