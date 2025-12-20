import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Zap, 
  Users, 
  Filter, 
  Shield, 
  Video, 
  MessageCircle, 
  Star,
  Sparkles,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  Image,
  Mic,
  Palette,
  SkipForward,
  UserCheck,
  Heart
} from 'lucide-react';
import logo from '@/assets/logo.png';
import PremiumLeadForm from '@/components/PremiumLeadForm';

const Premium = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Weekly',
      price: '₹99',
      period: '/week',
      description: 'Try premium features',
      features: [
        'Gender & Age Filters',
        'Priority Matching',
        'Premium Badge',
        'Ad-Free Experience',
      ],
      popular: false,
      savings: null,
    },
    {
      name: 'Monthly',
      price: '₹299',
      period: '/month',
      description: 'Most popular choice',
      features: [
        'All Weekly Features',
        'Interest-Based Priority',
        'Skip Queue',
        'HD Video Quality',
        'Unlimited Connections',
      ],
      popular: true,
      savings: 'Save 25%',
    },
    {
      name: 'Yearly',
      price: '₹1999',
      period: '/year',
      description: 'Best value',
      features: [
        'All Monthly Features',
        'Virtual Backgrounds',
        'Voice Messages',
        'Profile Analytics',
        'Verified Badge',
        'Priority Support',
      ],
      popular: false,
      savings: 'Save 45%',
    },
  ];

  const allFeatures = [
    {
      icon: Filter,
      title: 'Gender & Age Filters',
      description: 'Choose to match only with specific genders and set your preferred age range for matches.',
      tier: 'Weekly',
    },
    {
      icon: Zap,
      title: 'Priority Matching',
      description: 'Get matched faster with priority queue access. Skip the wait and connect instantly.',
      tier: 'Weekly',
    },
    {
      icon: Crown,
      title: 'Premium Badge',
      description: 'Stand out with an exclusive premium badge visible to everyone you chat with.',
      tier: 'Weekly',
    },
    {
      icon: EyeOff,
      title: 'Ad-Free Experience',
      description: 'Enjoy uninterrupted conversations without any advertisements.',
      tier: 'Weekly',
    },
    {
      icon: Heart,
      title: 'Interest-Based Priority',
      description: 'Get matched first with people who share your interests and hobbies.',
      tier: 'Monthly',
    },
    {
      icon: SkipForward,
      title: 'Skip Queue',
      description: 'Jump ahead in the matchmaking queue and find your next conversation faster.',
      tier: 'Monthly',
    },
    {
      icon: Video,
      title: 'HD Video Quality',
      description: 'Crystal clear video calls with enhanced resolution for a better experience.',
      tier: 'Monthly',
    },
    {
      icon: Users,
      title: 'Unlimited Connections',
      description: 'No daily limits on saving connections. Build your network without restrictions.',
      tier: 'Monthly',
    },
    {
      icon: Palette,
      title: 'Virtual Backgrounds',
      description: 'Use custom backgrounds during video chats for privacy and fun.',
      tier: 'Yearly',
    },
    {
      icon: Mic,
      title: 'Voice Messages',
      description: 'Send voice notes to your connections for more personal communication.',
      tier: 'Yearly',
    },
    {
      icon: Eye,
      title: 'Profile Analytics',
      description: 'See who viewed your profile and track your connection statistics.',
      tier: 'Yearly',
    },
    {
      icon: UserCheck,
      title: 'Verified Badge',
      description: 'Get a verified badge after identity verification to build trust.',
      tier: 'Yearly',
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: '24/7 priority customer support with faster response times.',
      tier: 'Yearly',
    },
  ];

  const faqs = [
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Simply choose a plan above and click "Get Started". You\'ll be redirected to our secure payment page.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.',
    },
    {
      question: 'Do premium filters guarantee matches?',
      answer: 'Premium filters help you find more relevant matches, but matches depend on available users in the queue who meet your criteria.',
    },
    {
      question: 'Is my payment secure?',
      answer: 'Absolutely! We use industry-standard encryption and secure payment processors to protect your information.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Wallly Premium - Unlock Advanced Random Chat Features | Gender Filter, HD Video</title>
        <meta name="description" content="Upgrade to Wallly Premium for advanced random video chat features. Gender & age filters, priority matching, HD video quality, unlimited connections, and ad-free experience. Best Omegle alternative with premium features." />
        <meta name="keywords" content="wallly premium, random video chat premium, omegle alternative premium, gender filter video chat, age filter random chat, priority matching, HD video chat, unlimited connections, ad-free chat, premium video chat, chatroulette premium, stranger chat premium, video chat subscription" />
        <link rel="canonical" href="https://wallly.in/premium" />
        
        <meta property="og:title" content="Wallly Premium - Unlock Advanced Random Chat Features" />
        <meta property="og:description" content="Upgrade to Wallly Premium for gender filters, priority matching, HD video, and more. The best random video chat experience." />
        <meta property="og:url" content="https://wallly.in/premium" />
        <meta property="og:image" content="https://wallly.in/logo.png" />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Wallly Premium - Advanced Random Chat Features" />
        <meta name="twitter:description" content="Gender filters, priority matching, HD video & more. Upgrade your random chat experience." />
        <meta name="twitter:image" content="https://wallly.in/logo.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Wallly Premium",
            "description": "Premium subscription for Wallly random video chat with advanced features like gender filters, priority matching, and HD video.",
            "brand": {
              "@type": "Brand",
              "name": "Wallly"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Weekly Plan",
                "price": "99",
                "priceCurrency": "INR",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "name": "Monthly Plan",
                "price": "299",
                "priceCurrency": "INR",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "name": "Yearly Plan",
                "price": "1999",
                "priceCurrency": "INR",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "15000"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="Wallly Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                <h2 className="text-lg sm:text-xl font-bold">Wallly</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/howtouse')}>
                  How to Use
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/blog')}>
                  Blog
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero Section */}
          <section className="px-4 py-12 sm:py-20 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Premium Membership</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight">
                Unlock the Ultimate Random Chat Experience
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Get gender & age filters, priority matching, HD video quality, and unlimited connections. 
                Take your random video chat experience to the next level.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Instant activation</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="px-4 py-12 sm:py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Plan</h2>
                <p className="text-lg text-muted-foreground">Flexible plans to fit your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {plans.map((plan, index) => (
                  <Card 
                    key={plan.name}
                    className={`relative border-2 transition-all hover:shadow-xl ${
                      plan.popular 
                        ? 'border-primary shadow-lg scale-105 md:scale-110' 
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-primary text-white px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {plan.savings && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="bg-primary/10 p-1 rounded-full">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <PremiumLeadForm 
                        planName={plan.name}
                        planPrice={plan.price + plan.period}
                        popular={plan.popular}
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* All Features Section */}
          <section className="px-4 py-12 sm:py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">All Premium Features</h2>
                <p className="text-lg text-muted-foreground">Everything you get with Wallly Premium</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFeatures.map((feature, index) => (
                  <Card key={index} className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {feature.tier}+
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How Filters Work Section */}
          <section className="px-4 py-12 sm:py-16">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Premium Filters Work</h2>
                <p className="text-lg text-muted-foreground">Find exactly who you want to chat with</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Set Your Preferences</h3>
                  <p className="text-muted-foreground">
                    Choose your preferred gender, age range, and interests before starting a chat.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
                  <p className="text-muted-foreground">
                    Our algorithm prioritizes users who match your criteria for faster, better connections.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Connect & Enjoy</h3>
                  <p className="text-muted-foreground">
                    Meet people who match your preferences and have meaningful conversations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="px-4 py-12 sm:py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Free vs Premium</h2>
                <p className="text-lg text-muted-foreground">See what you're missing</p>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4 font-semibold">Free</th>
                        <th className="text-center p-4 font-semibold bg-primary/5">
                          <div className="flex items-center justify-center gap-2">
                            <Crown className="w-4 h-4 text-primary" />
                            Premium
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: 'Random Video Chat', free: true, premium: true },
                        { feature: 'Random Text Chat', free: true, premium: true },
                        { feature: 'Image Sharing', free: true, premium: true },
                        { feature: 'Gender Filter', free: false, premium: true },
                        { feature: 'Age Range Filter', free: false, premium: true },
                        { feature: 'Interest-Based Matching', free: 'Basic', premium: 'Priority' },
                        { feature: 'Matching Speed', free: 'Standard', premium: 'Priority' },
                        { feature: 'Video Quality', free: 'SD', premium: 'HD' },
                        { feature: 'Daily Connections', free: 'Limited', premium: 'Unlimited' },
                        { feature: 'Advertisements', free: 'Yes', premium: 'No Ads' },
                        { feature: 'Premium Badge', free: false, premium: true },
                        { feature: 'Customer Support', free: 'Standard', premium: 'Priority' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="text-center p-4">
                            {typeof row.free === 'boolean' ? (
                              row.free ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )
                            ) : (
                              <span className="text-muted-foreground text-sm">{row.free}</span>
                            )}
                          </td>
                          <td className="text-center p-4 bg-primary/5">
                            {typeof row.premium === 'boolean' ? (
                              row.premium ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )
                            ) : (
                              <span className="text-primary font-medium text-sm">{row.premium}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </section>

          {/* FAQs */}
          <section className="px-4 py-12 sm:py-16">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-muted-foreground">Got questions? We've got answers</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <Card key={i} className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-4 py-12 sm:py-20 bg-gradient-primary text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Crown className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Go Premium?
              </h2>
              <p className="text-lg sm:text-xl mb-8 opacity-90">
                Join thousands of premium members who are enjoying the best random chat experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-all"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all"
                  onClick={() => navigate('/app')}
                >
                  Try Free Version
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
              <button onClick={() => navigate('/privacy')} className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/howtouse')} className="text-muted-foreground hover:text-primary transition-colors">
                How to Use
              </button>
              <button onClick={() => navigate('/contact')} className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </button>
              <button onClick={() => navigate('/blog')} className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                Need help? <a href="mailto:help@corevia.in" className="text-primary hover:underline">help@corevia.in</a>
              </p>
              <p>&copy; 2025 Wallly. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Premium;
