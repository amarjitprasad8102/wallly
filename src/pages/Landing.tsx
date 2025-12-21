import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap, Globe, Lock, ArrowRight, Hash, ChevronDown, UserX, MessageSquare, Image } from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import Lenis from '@studio-freight/lenis';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StrangerDialog from '@/components/StrangerDialog';
import { toast } from 'sonner';

const Landing = () => {
  const navigate = useNavigate();
  const [strangerDialogOpen, setStrangerDialogOpen] = useState(false);

  const handleStrangerStart = async (gender: string, age: number, email: string, tempId: string) => {
    // Store stranger session data
    sessionStorage.setItem('stranger_mode', 'true');
    sessionStorage.setItem('stranger_id', tempId);
    sessionStorage.setItem('stranger_gender', gender);
    sessionStorage.setItem('stranger_age', age.toString());
    sessionStorage.setItem('stranger_email', email);
    
    toast.success('Starting as stranger...');
    navigate('/app');
  };

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
    <>
      <Helmet>
        <title>Wallly - Talk to Strangers, Make Friends | Free Random Video Chat</title>
        <meta name="description" content="Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world! Free video chat, text chat & image sharing. The best Omegle alternative." />
        <meta name="keywords" content="random video chat, talk to strangers, make friends online, free video chat, omegle alternative, ometv alternative, anonymous chat, stranger chat, video chat app, webcam chat, text chat, random chat, chat with strangers, meet people online, india chat" />
        <link rel="canonical" href="https://wallly.in/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wallly.in/" />
        <meta property="og:title" content="Wallly - Talk to Strangers, Make Friends | Free Random Video Chat" />
        <meta property="og:description" content="Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world! The best Omegle alternative." />
        <meta property="og:image" content="https://wallly.in/logo.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Wallly - Talk to Strangers, Make Friends" />
        <meta name="twitter:description" content="Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world!" />
        <meta name="twitter:image" content="https://wallly.in/logo.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Wallly",
            "description": "Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world. The modern Omegle and OmeTV alternative.",
            "url": "https://wallly.in",
            "applicationCategory": "SocialNetworkingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Random Video Chat",
              "Random Text Chat",
              "Image Sharing",
              "Interest-based Matching",
              "Friends & Chat History",
              "Search Filters",
              "Safety & Moderation",
              "Community Groups"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4" aria-label="Main navigation">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Wallly Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              <h2 className="text-lg sm:text-xl font-bold">Wallly</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/howtouse')}>
                How to Use
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/c')}>
                Communities
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/blog')}>
                Blog
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/contact')} aria-label="Contact Us">
                Contact
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} aria-label="Sign in to your account">
                Sign In
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStrangerDialogOpen(true)} aria-label="Chat as stranger">
                <UserX className="w-4 h-4 mr-1" />
                Stranger
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white" onClick={() => navigate('/premium')} aria-label="Premium">
                Premium
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
                <img src={logo} alt="Wallly Logo" className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-3xl shadow-2xl" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 gradient-text leading-tight">
              Talk to Strangers,<br className="hidden sm:block" /> Make Friends!
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-gradient-primary hover:opacity-90 transition-all hover:scale-105"
                onClick={() => navigate('/auth')}
                aria-label="Start video chat"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
                Video Chat
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full hover:opacity-90 transition-all hover:scale-105"
                onClick={() => navigate('/auth')}
                aria-label="Start text chat"
              >
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2" aria-hidden="true" />
                Text Chat
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">Free • No Download • No Bots • Ages 16+</p>
          </div>
        </section>

        {/* Anonymous Chat Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex text-sm font-semibold py-1 px-3 m-2 text-primary bg-primary/10 rounded-full mb-4">
              Reach people like you
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Anonymous Chat, Meet New People</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Find strangers worldwide, the new modern Omegle and OmeTV alternative.
              Connect with real people, enjoy ad free text and video chats, and build genuine friendships.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">The Best Site to Chat with Strangers</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">Modern, secure and feature rich with diverse, interesting people from around the globe</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-label="Video chat icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Video Chat</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Experience authentic face to face encounters with real people from all over the world.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-accent/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-label="Friends icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Friends & History</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Had a fun chat but skipped by accident? Find them in your chat history and add them as a friend.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-destructive/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Hash className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" aria-label="Search filters icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Interest Matching</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Talk to online strangers who love what you love. Chat about hobbies and enjoy fun conversations.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" aria-label="Text chat icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Text Chat</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Not in the mood for video? No problem! You can also chat with strangers via text messages. Full of features.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-accent/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-label="Safety icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Safety & Moderation</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We make use of advanced AI technologies and enhanced spam protection to keep your chats clean.
                </p>
              </article>

              <article className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <div className="bg-destructive/10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Image className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" aria-label="Feature rich icon" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Feature Rich</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  From sending photos, having voice calls, to sharing images and joining communities, we have it all.
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
              <p className="text-base sm:text-lg text-muted-foreground">Everything you need to know about Wallly</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Is Wallly a good Omegle alternative?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Wallly is the best Omegle and OmeTV alternative. Find strangers worldwide with our modern, secure and feature rich platform. Connect with diverse, interesting people from around the globe through both video and text chat.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Is Wallly free to use?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Wallly is completely free to use. Connect with real people, enjoy ad free text and video chats, and build genuine friendships. Premium features are available for enhanced experience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Can I chat with strangers based on interests?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Talk to online strangers who love what you love. Chat about hobbies and enjoy fun conversations - all from one place! Making new friends based on interests is made easy with our interest-based matching feature.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Can I add strangers as friends?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Absolutely! Had a fun chat but skipped by accident? Find them in your chat history and add them as a friend. Turn strangers into friends and stay connected for future conversations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Is Wallly safe and moderated?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We make use of advanced AI technologies and enhanced spam protection to keep your chats clean. Age verification (16+), reporting features, and moderation keep the platform safe. You can skip any conversation instantly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border/50 rounded-2xl px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base sm:text-lg font-semibold">Do I need to download an app?</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  No! Wallly works directly in your web browser on any device. No downloads, no installations, no bots. Just visit our website and start chatting with strangers worldwide.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20 lg:py-24 bg-gradient-primary text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              From Strangers to Friends
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-4">
              Discover new people, make real and genuine connections, learn new languages or just have casual text or video chats. Your next conversation could change everything.
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
      <footer className="border-t border-border/50 py-8 sm:py-12 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">Video Chat</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">Text Chat</button></li>
                <li><button onClick={() => navigate('/premium')} className="hover:text-primary transition-colors">Premium</button></li>
                <li><button onClick={() => navigate('/c')} className="hover:text-primary transition-colors">Communities</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/howtouse')} className="hover:text-primary transition-colors">How to Use</button></li>
                <li><button onClick={() => navigate('/blog')} className="hover:text-primary transition-colors">Blog</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-primary transition-colors">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:help@corevia.in" className="hover:text-primary transition-colors">help@corevia.in</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs sm:text-sm text-muted-foreground border-t border-border/50 pt-6">
            <p className="mb-2">
              By using Wallly, you agree to be respectful and follow our community guidelines. Users must be 16+.
            </p>
            <p>&copy; 2025 Wallly. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <StrangerDialog 
        open={strangerDialogOpen} 
        onOpenChange={setStrangerDialogOpen} 
        onStart={handleStrangerStart} 
      />
      </div>
    </>
  );
};

export default Landing;