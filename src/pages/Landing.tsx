import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, MessageCircle, MessageSquare, Sparkles, Shield, Users, Hash, Image as ImageIcon, Star } from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import Lenis from '@studio-freight/lenis';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Y2K Chrome / Vapor — dark blue + white + black, asymmetric
// Fonts: Archivo Black (display) + Hind (body)

const heading = { fontFamily: '"Archivo Black", system-ui, sans-serif', letterSpacing: '-0.02em' };
const body = { fontFamily: '"Hind", system-ui, sans-serif' };

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/app');
    });

    // Lenis smooth-scroll is heavy on mobile — only enable on pointer:fine (desktop)
    const isDesktop = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
    if (!isDesktop) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Wallly — Talk to Strangers, Make Friends | Free Random Video Chat</title>
        <meta name="description" content="Wallly is a Gen-Z random video & text chat. Meet strangers, make friends, vibe worldwide. Free, no download, ages 16+." />
        <meta name="keywords" content="random video chat, talk to strangers, omegle alternative, ometv alternative, text chat, gen z chat, wallly" />
        <link rel="canonical" href="https://wallly.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wallly.in/" />
        <meta property="og:title" content="Wallly — Talk to Strangers, Make Friends" />
        <meta property="og:description" content="Random video & text chat with a Gen-Z vibe. Free, no download, ages 16+." />
        <meta property="og:image" content="https://wallly.in/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Wallly",
          url: "https://wallly.in",
          applicationCategory: "SocialNetworkingApplication",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
        })}</script>
      </Helmet>

      <div
        className="min-h-screen text-white relative overflow-x-clip"
        style={{
          ...body,
          background: 'radial-gradient(1200px 600px at 90% -10%, #1e3a8a 0%, transparent 60%), radial-gradient(900px 500px at -10% 30%, #1d4ed8 0%, transparent 55%), linear-gradient(180deg, #050814 0%, #0a0f25 60%, #03060f 100%)',
        }}
      >
        {/* Grain + grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)',
          }}
        />

        {/* Floating chrome blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
          style={{ background: 'conic-gradient(from 180deg, #60a5fa, #ffffff, #1e3a8a, #000000, #60a5fa)' }} />
        <div aria-hidden className="pointer-events-none absolute top-[40%] -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{ background: 'conic-gradient(from 0deg, #ffffff, #3b82f6, #0b1437, #ffffff)' }} />

        {/* NAV */}
        <header className="relative z-40">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur-md opacity-60 bg-white/40 group-hover:opacity-100 transition" />
                <img src={logo} alt="Wallly Logo" className="relative w-9 h-9 rounded-xl ring-1 ring-white/30" />
              </div>
              <span style={heading} className="text-xl tracking-tight">WALLLY</span>
            </button>

            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl">
              {[
                { l: 'How to use', p: '/howtouse' },
                { l: 'Communities', p: '/c' },
                { l: 'Blog', p: '/blog' },
                { l: 'Contact', p: '/contact' },
              ].map((i) => (
                <button key={i.p} onClick={() => navigate(i.p)} className="px-4 py-1.5 text-sm rounded-full hover:bg-white/10 transition">
                  {i.l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hidden sm:inline-flex" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
              <button
                onClick={() => navigate('/premium')}
                style={heading}
                className="text-xs tracking-wide px-4 py-2 rounded-full text-black bg-gradient-to-b from-white to-blue-200 hover:from-white hover:to-white transition shadow-[0_0_20px_rgba(147,197,253,0.6)]"
              >
                ★ PREMIUM
              </button>
            </div>
          </nav>
        </header>

        <main className="relative z-10">
          {/* HERO — asymmetric */}
          <section className="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 items-end">
              {/* Left badge column */}
              <div className="col-span-12 lg:col-span-3 order-2 lg:order-1 flex lg:flex-col gap-3 lg:gap-4 lg:pb-10">
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-4 lg:rotate-[-3deg]">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-200/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online now
                  </div>
                  <div style={heading} className="text-3xl mt-1">12,847</div>
                  <div className="text-xs text-white/60">strangers vibing</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/30 to-transparent backdrop-blur-xl p-4 lg:rotate-[2deg]">
                  <div className="flex -space-x-2 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full ring-2 ring-[#03060f] bg-gradient-to-br from-white to-blue-400" />
                    ))}
                  </div>
                  <p className="text-xs text-white/80 leading-snug">“met my best friend on here fr 😭✨”</p>
                </div>
              </div>

              {/* Center hero */}
              <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl text-[11px] uppercase tracking-[0.2em] mb-6">
                  <Sparkles className="w-3 h-3 text-blue-300" /> where the walls end
                </div>
                <h1 style={heading} className="text-[14vw] sm:text-7xl lg:text-[110px] leading-[0.85] uppercase">
                  <span className="block">talk to</span>
                  <span
                    className="block bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(180deg, #ffffff 0%, #93c5fd 35%, #1e3a8a 65%, #ffffff 100%)',
                      WebkitTextStroke: '1px rgba(255,255,255,0.15)',
                    }}
                  >
                    strangers
                  </span>
                  <span className="block">make friends</span>
                </h1>
                <p className="mt-6 text-sm sm:text-base text-white/70 max-w-md mx-auto">
                  Free random video & text chat. No bots. No downloads. Just real people, real vibes — worldwide.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/auth')}
                    style={heading}
                    className="group relative px-7 py-4 rounded-full text-black bg-white text-sm tracking-wide uppercase overflow-hidden hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition"
                  >
                    <span className="relative flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Start Video Chat
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    style={heading}
                    className="group px-7 py-4 rounded-full text-white border border-white/30 bg-white/5 backdrop-blur-xl text-sm tracking-wide uppercase hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Text Chat
                  </button>
                </div>
                <p className="text-[11px] text-white/50 mt-4 uppercase tracking-widest">free • no download • 16+</p>
              </div>

              {/* Right ticker column */}
              <div className="col-span-12 lg:col-span-3 order-3 flex lg:flex-col gap-3 lg:gap-4 lg:pb-10">
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-xl aspect-[4/5] lg:rotate-[3deg] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-transparent to-white/10" />
                  <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-red-500 px-2 py-0.5 rounded-sm">● LIVE</div>
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white/80 backdrop-blur bg-black/30 rounded-md p-2">
                    <div style={heading} className="text-sm">@sora_404</div>
                    <div className="opacity-70">tokyo · 4 min</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-4 lg:-rotate-[2deg]">
                  <div className="text-[10px] uppercase tracking-widest text-white/60">since 2024</div>
                  <div style={heading} className="text-3xl mt-1">2.3M+</div>
                  <div className="text-xs text-white/60">connections made</div>
                </div>
              </div>
            </div>
          </section>

          {/* MARQUEE */}
          <div className="border-y border-white/10 bg-black/30 backdrop-blur overflow-hidden">
            <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap py-4">
              {Array.from({ length: 2 }).map((_, k) => (
                <div key={k} className="flex items-center gap-10 px-5 text-white/70" style={heading}>
                  {['NO BOTS', 'REAL PEOPLE', 'WORLDWIDE', 'FREE FOREVER', 'SAFE & MODERATED', 'ANONYMOUS', 'TEXT + VIDEO', '16+ ONLY'].map((t) => (
                    <span key={t + k} className="flex items-center gap-10 text-sm tracking-widest uppercase">
                      ★ {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
          </div>

          {/* FEATURES — bento asymmetric */}
          <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-blue-300 mb-3">/ features</div>
                  <h2 style={heading} className="text-4xl sm:text-6xl uppercase leading-[0.9] max-w-2xl">
                    the chat app<br />that actually<br />
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(180deg,#fff,#3b82f6)' }}>slaps</span>
                  </h2>
                </div>
                <p className="text-white/60 max-w-sm">Built for the timeline generation. Less swiping, more talking. Less algorithm, more serendipity.</p>
              </div>

              <div className="grid grid-cols-12 gap-4 sm:gap-5">
                {/* Big card */}
                <article className="col-span-12 lg:col-span-7 row-span-2 rounded-3xl p-8 border border-white/15 bg-gradient-to-br from-blue-600/30 via-blue-900/40 to-transparent backdrop-blur-xl relative overflow-hidden min-h-[320px]">
                  <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-40 bg-white" />
                  <MessageCircle className="w-10 h-10 mb-6" />
                  <h3 style={heading} className="text-3xl sm:text-4xl uppercase mb-3">Random video chat</h3>
                  <p className="text-white/70 max-w-md">One click. Face-to-face with someone new from anywhere on the planet. Skip anytime. Stay if it clicks.</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-blue-200">Learn more <ArrowRight className="w-4 h-4" /></div>
                </article>

                <article className="col-span-6 lg:col-span-5 rounded-3xl p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl">
                  <MessageSquare className="w-8 h-8 mb-4" />
                  <h3 style={heading} className="text-xl uppercase mb-2">Text chat</h3>
                  <p className="text-sm text-white/60">Camera shy? Slide into a random DM instead.</p>
                </article>

                <article className="col-span-6 lg:col-span-5 rounded-3xl p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl">
                  <Hash className="w-8 h-8 mb-4" />
                  <h3 style={heading} className="text-xl uppercase mb-2">Interest match</h3>
                  <p className="text-sm text-white/60">Add tags, find your people. Anime, gym, music — your niche awaits.</p>
                </article>

                <article className="col-span-6 lg:col-span-4 rounded-3xl p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl">
                  <Users className="w-8 h-8 mb-4" />
                  <h3 style={heading} className="text-xl uppercase mb-2">Friends + history</h3>
                  <p className="text-sm text-white/60">Skipped by accident? Find them in history & add them back.</p>
                </article>

                <article className="col-span-6 lg:col-span-4 rounded-3xl p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl">
                  <Shield className="w-8 h-8 mb-4" />
                  <h3 style={heading} className="text-xl uppercase mb-2">Safe & moderated</h3>
                  <p className="text-sm text-white/60">AI moderation, age verification, instant skip. We keep it clean.</p>
                </article>

                <article className="col-span-12 lg:col-span-4 rounded-3xl p-6 border border-white/15 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl">
                  <ImageIcon className="w-8 h-8 mb-4" />
                  <h3 style={heading} className="text-xl uppercase mb-2">Image share</h3>
                  <p className="text-sm text-white/60">Send pics that auto-expire. No saving, no leaks.</p>
                </article>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS — zigzag */}
          <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="text-xs uppercase tracking-[0.3em] text-blue-300 mb-3">/ how it works</div>
              <h2 style={heading} className="text-4xl sm:text-6xl uppercase mb-16">3 steps. that's it.</h2>

              <div className="space-y-10">
                {[
                  { n: '01', t: 'sign up free', d: 'Email + age (16+). Done in 20 seconds.', align: 'left' },
                  { n: '02', t: 'tap start', d: 'Get matched instantly with a real human, somewhere.', align: 'right' },
                  { n: '03', t: 'vibe or skip', d: 'Love it? Add as friend. Not feeling it? Skip — zero awkward.', align: 'left' },
                ].map((s) => (
                  <div key={s.n} className={`flex flex-col ${s.align === 'right' ? 'lg:flex-row-reverse lg:text-right' : 'lg:flex-row'} gap-6 lg:items-center`}>
                    <div style={heading} className="text-[20vw] lg:text-[180px] leading-none">
                      <span style={{ backgroundImage: 'linear-gradient(180deg,#fff,#3b82f6 60%,#0b1437)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{s.n}</span>
                    </div>
                    <div className="lg:max-w-md">
                      <h3 style={heading} className="text-3xl uppercase mb-2">{s.t}</h3>
                      <p className="text-white/60">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS strip */}
          <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4">
              {[
                { q: 'literally my comfort app. talked to ppl from 6 countries this week alone', a: '@miyukii' },
                { q: 'omegle who?? wallly is the upgrade we needed fr', a: '@lukascodes' },
                { q: 'made an actual friend on here. we facetime every day now 🥹', a: '@_aanya' },
              ].map((t, i) => (
                <div key={i} className={`rounded-3xl p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl ${i === 1 ? 'md:translate-y-6' : ''}`}>
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-blue-300 text-blue-300" />)}</div>
                  <p className="text-white/85 leading-snug mb-4">"{t.q}"</p>
                  <div className="text-xs text-white/50" style={heading}>{t.a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/10">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
              <div className="lg:sticky lg:top-24">
                <div className="text-xs uppercase tracking-[0.3em] text-blue-300 mb-3">/ faq</div>
                <h2 style={heading} className="text-4xl sm:text-5xl uppercase leading-none">questions?<br />we got you.</h2>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {[
                  { q: 'Is Wallly a good Omegle alternative?', a: 'Yep — modern UI, AI moderation, video + text, interest matching, friends list. Everything Omegle didn’t have.' },
                  { q: 'Is it actually free?', a: 'Free forever for video & text chat. Premium unlocks filters, virtual backgrounds, read receipts.' },
                  { q: 'How safe is it?', a: 'AI moderation, age verification (16+), instant skip, report tools. We take safety seriously.' },
                  { q: 'Do I need to download anything?', a: 'Nope. Works in any browser on phone, tablet, or laptop.' },
                  { q: 'Can I add people as friends?', a: 'Yes — find them in your chat history and send a connection request.' },
                ].map((f, i) => (
                  <AccordionItem key={i} value={`i${i}`} className="border border-white/15 rounded-2xl px-5 bg-white/[0.04] backdrop-blur-xl">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span style={heading} className="text-base sm:text-lg uppercase">{f.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70 text-sm">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 sm:px-6 lg:px-8 py-24 border-t border-white/10">
            <div className="max-w-6xl mx-auto rounded-[2.5rem] p-10 sm:p-16 relative overflow-hidden border border-white/20"
              style={{
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(255,255,255,0.05)), radial-gradient(600px 300px at 80% 20%, rgba(255,255,255,0.3), transparent 60%)',
              }}
            >
              <div aria-hidden className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full blur-3xl opacity-50"
                style={{ background: 'conic-gradient(from 90deg, #ffffff, #1e3a8a, #000)' }} />
              <div className="relative grid lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-8">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/80 mb-3">/ your turn</div>
                  <h2 style={heading} className="text-5xl sm:text-7xl uppercase leading-[0.9]">from strangers<br />to friends.</h2>
                  <p className="mt-5 text-white/80 max-w-lg">Your next favorite person is online right now. Don’t leave them on read.</p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <button
                    onClick={() => navigate('/auth')}
                    style={heading}
                    className="group px-8 py-5 rounded-full text-black bg-white text-sm uppercase tracking-widest hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition flex items-center gap-2"
                  >
                    Start chatting <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <img src={logo} alt="Wallly" className="w-8 h-8 rounded-lg" />
                  <span style={heading} className="text-lg">WALLLY</span>
                </div>
                <p className="text-sm text-white/60 max-w-xs">Where the walls end, you find a friend.</p>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-white/80 mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><button onClick={() => navigate('/auth')} className="hover:text-white">Video Chat</button></li>
                  <li><button onClick={() => navigate('/auth')} className="hover:text-white">Text Chat</button></li>
                  <li><button onClick={() => navigate('/premium')} className="hover:text-white">Premium</button></li>
                  <li><button onClick={() => navigate('/c')} className="hover:text-white">Communities</button></li>
                </ul>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-white/80 mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><button onClick={() => navigate('/howtouse')} className="hover:text-white">How to Use</button></li>
                  <li><button onClick={() => navigate('/blog')} className="hover:text-white">Blog</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-white">Contact</button></li>
                </ul>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-white/80 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><button onClick={() => navigate('/privacy')} className="hover:text-white">Privacy</button></li>
                  <li><a href="mailto:help@corevia.in" className="hover:text-white">help@corevia.in</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
              <p>&copy; 2025 Wallly. 16+ only. Be kind.</p>
              <p>Made by <a href="https://corevia.in" rel="dofollow" target="_blank" className="text-white/70 hover:text-white">Corevia</a></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
