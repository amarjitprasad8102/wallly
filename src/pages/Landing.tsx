import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowUpRight, MessageCircle, MessageSquare, Sparkles, Shield, Users, Hash, Image as ImageIcon, Zap, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import Lenis from '@studio-freight/lenis';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Sticker-pop maximalist / neo-brutalist — Gen Z vibe
// Palette: bg #F3F3F3, ink #1A1A1A, indigo #5D5DFF, pink #FF72C0, lime #E4FF00
// Fonts: Archivo Black (display) + Hind (body)

const heading = { fontFamily: '"Archivo Black", system-ui, sans-serif', letterSpacing: '-0.02em' };
const body = { fontFamily: '"Hind", system-ui, sans-serif' };

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { l: 'How to use', p: '/howtouse' },
    { l: 'Communities', p: '/c' },
    { l: 'Blog', p: '/blog' },
    { l: 'Premium', p: '/premium' },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/app');
    });

    const isDesktop = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
    if (!isDesktop) return;
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    let rafId = 0;
    function raf(time: number) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
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
        className="min-h-screen w-full bg-[#F3F3F3] text-[#1A1A1A] overflow-x-hidden selection:bg-[#E4FF00] selection:text-black"
        style={body}
      >
        {/* NAV — floating pill with chunky shadow */}
        <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl bg-white border-[3px] sm:border-4 border-black px-3 sm:px-6 py-2 sm:py-3 flex justify-between items-center shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src={logo} alt="Wallly" width="28" height="28" className="w-7 h-7 border-2 border-black" />
            <span style={heading} className="text-lg sm:text-2xl uppercase tracking-tighter italic">Wallly</span>
          </button>
          <div className="hidden md:flex gap-7 font-semibold text-sm">
            {navItems.map((i) => (
              <button key={i.p} onClick={() => navigate(i.p)} className="hover:underline decoration-4 underline-offset-4 decoration-[#FF72C0]">{i.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#E4FF00] border-2 border-black px-3 sm:px-4 py-1.5 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Log In
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="fixed top-[68px] left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-5xl bg-white border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:hidden">
            <ul className="flex flex-col">
              {navItems.map((i) => (
                <li key={i.p} className="border-b-2 border-black last:border-b-0">
                  <button
                    onClick={() => { setMenuOpen(false); navigate(i.p); }}
                    className="w-full text-left px-5 py-4 font-bold uppercase tracking-tight text-base active:bg-[#E4FF00]"
                    style={heading}
                  >
                    {i.l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <main>
          {/* HERO */}
          <section className="relative pt-24 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 flex flex-col items-center text-center">
            {/* Floating sticker decors */}
            <div className="absolute top-32 left-[6%] -rotate-12 hidden lg:flex items-center bg-[#FF72C0] border-4 border-black px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <span style={heading} className="text-white uppercase">No Limits</span>
            </div>
            <div className="absolute top-56 right-[8%] rotate-6 hidden lg:flex items-center gap-2 bg-[#5D5DFF] border-4 border-black px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 text-white" />
              <span style={heading} className="text-white uppercase">Fast Match</span>
            </div>
            <div className="absolute bottom-10 left-[12%] rotate-[8deg] hidden xl:flex items-center bg-white border-4 border-black px-3 py-2 shadow-[4px_4px_0px_0px_rgba(93,93,255,1)]">
              <Sparkles className="w-4 h-4 mr-1" />
              <span style={heading} className="uppercase text-xs">100% Random</span>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
              <div className="inline-block bg-[#E4FF00] border-2 border-black px-4 py-1 font-bold mb-6 rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase">
                ● Now Live Worldwide
              </div>

              <h1 style={heading} className="text-[2.25rem] xs:text-[2.75rem] sm:text-7xl lg:text-[7.5rem] uppercase leading-[0.9] sm:leading-[0.88] tracking-tighter mb-6 sm:mb-8 break-words">
                Where the <span className="outline-text text-[#5D5DFF]">walls</span> end, you find a <span className="text-[#FF72C0] italic underline decoration-[6px] sm:decoration-[12px] underline-offset-[4px] sm:underline-offset-8 decoration-black">friend</span>
              </h1>

              <p className="text-lg sm:text-2xl max-w-2xl mx-auto mb-10 font-medium text-[#1A1A1A]/80">
                The unfiltered social experience. No profiles, no pressure. Just real faces and instant vibes.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-center">
                <button
                  onClick={() => navigate('/auth')}
                  style={heading}
                  className="group bg-[#5D5DFF] text-white text-xl sm:text-3xl uppercase px-8 sm:px-12 py-5 sm:py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] sm:hover:translate-x-[8px] hover:translate-y-[4px] sm:hover:translate-y-[8px] transition-all cursor-pointer inline-flex items-center gap-3"
                >
                  Start Chatting <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  style={heading}
                  className="bg-white text-black uppercase text-base sm:text-lg px-6 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(228,255,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(228,255,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" /> Text Chat
                </button>
              </div>

              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <div className="flex -space-x-3">
                  <div className="w-11 h-11 rounded-full border-[3px] border-black bg-blue-400" />
                  <div className="w-11 h-11 rounded-full border-[3px] border-black bg-pink-400" />
                  <div className="w-11 h-11 rounded-full border-[3px] border-black bg-yellow-300" />
                  <div className="w-11 h-11 rounded-full border-[3px] border-black bg-[#5D5DFF] flex items-center justify-center text-white font-bold text-xs">+</div>
                </div>
                <p className="font-bold uppercase tracking-tight text-sm sm:text-base">
                  <span className="text-[#5D5DFF]">12,847</span> vibing right now
                </p>
              </div>
              <p className="text-xs mt-4 uppercase tracking-widest font-semibold text-black/60">Free • No download • 16+</p>
            </div>
          </section>

          {/* SCROLLING BANNER */}
          <div className="bg-black text-white py-3 sm:py-4 overflow-hidden whitespace-nowrap border-y-4 border-black">
            <div className="animate-[wallmarquee_25s_linear_infinite] inline-block" style={heading}>
              {Array.from({ length: 2 }).map((_, k) => (
                <span key={k} className="text-2xl sm:text-3xl uppercase">
                  {['Random Chat', 'Instant Connection', 'New Friends', 'No Walls', 'No Bots', 'Worldwide', 'Free Forever'].map((t, i) => (
                    <span key={t + k} className="mx-6">
                      <span className="text-[#E4FF00]">●</span> {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <style>{`@keyframes wallmarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
          </div>

          {/* FEATURES */}
          <section className="px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10 sm:mb-14">
                <div className="inline-block bg-[#FF72C0] border-2 border-black px-3 py-1 font-bold mb-4 -rotate-2 text-white text-xs uppercase">/ features</div>
                <h2 style={heading} className="text-4xl sm:text-6xl uppercase leading-[0.9]">
                  the chat app<br />that actually <span className="text-[#5D5DFF] outline-text">slaps</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { icon: Users, t: 'Random Matching', d: "Chaos by design. Connect with humans you'd never meet in your algorithm bubble.", shadow: 'rgba(93,93,255,1)', tilt: 'rotate-1', bg: '#5D5DFF', white: true },
                  { icon: Zap, t: 'Lightning Fast', d: 'Zero lag, all talk. Built on the edge for seamless face-to-face transitions.', shadow: 'rgba(228,255,0,1)', tilt: '-rotate-1', bg: '#E4FF00', white: false },
                  { icon: Shield, t: 'Safe & Private', d: 'Your space, your rules. End-to-end encrypted signals and instant reporting tools.', shadow: 'rgba(255,114,192,1)', tilt: 'rotate-1', bg: '#FF72C0', white: true },
                  { icon: MessageCircle, t: 'Video + Text', d: 'Camera shy? Slide into a text DM. Ready to vibe? Hit video. Your call.', shadow: 'rgba(0,0,0,1)', tilt: '-rotate-1', bg: '#1A1A1A', white: true },
                  { icon: Hash, t: 'Interest Tags', d: 'Anime, gym, music, gaming — drop tags, find your people, skip the rest.', shadow: 'rgba(93,93,255,1)', tilt: 'rotate-1', bg: '#5D5DFF', white: true },
                  { icon: ImageIcon, t: 'Auto-Expire Pics', d: 'Send pics that vanish. No saving, no leaks, no second thoughts.', shadow: 'rgba(228,255,0,1)', tilt: '-rotate-1', bg: '#E4FF00', white: false },
                ].map((f, i) => (
                  <article key={i} className={`bg-white border-4 border-black p-7 shadow-[8px_8px_0px_0px_${f.shadow}] ${f.tilt} hover:rotate-0 hover:-translate-y-1 transition-transform`} style={{ boxShadow: `8px 8px 0px 0px ${f.shadow}` }}>
                    <div className="w-12 h-12 border-2 border-black mb-4 flex items-center justify-center" style={{ background: f.bg }}>
                      <f.icon className={`w-6 h-6 ${f.white ? 'text-white' : 'text-black'}`} />
                    </div>
                    <h3 style={heading} className="text-2xl uppercase mb-3">{f.t}</h3>
                    <p className="font-medium text-black/75">{f.d}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="px-4 sm:px-6 py-16 sm:py-20 bg-[#5D5DFF] border-y-4 border-black">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <div className="inline-block bg-[#E4FF00] border-2 border-black px-3 py-1 font-bold mb-4 rotate-2 text-xs uppercase">/ how it works</div>
                <h2 style={heading} className="text-4xl sm:text-6xl uppercase text-white leading-[0.9]">3 steps. that's it.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { n: '01', t: 'Sign Up Free', d: 'Email + age (16+). Done in 20 seconds.', c: '#FF72C0' },
                  { n: '02', t: 'Tap Start', d: 'Get matched instantly with a real human, somewhere on the planet.', c: '#E4FF00' },
                  { n: '03', t: 'Vibe or Skip', d: "Love it? Add as friend. Not feeling it? Skip — zero awkward.", c: '#FFFFFF' },
                ].map((s) => (
                  <div key={s.n} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-6xl mb-4 inline-block px-3 border-4 border-black" style={{ ...heading, background: s.c }}>{s.n}</div>
                    <h3 style={heading} className="text-2xl uppercase mb-2">{s.t}</h3>
                    <p className="font-medium text-black/75">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <div className="inline-block bg-[#1A1A1A] text-white border-2 border-black px-3 py-1 font-bold mb-4 -rotate-1 text-xs uppercase">/ real talk</div>
                <h2 style={heading} className="text-4xl sm:text-6xl uppercase leading-[0.9]">people are <span className="text-[#FF72C0]">obsessed</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { q: 'literally my comfort app. talked to ppl from 6 countries this week alone', a: '@miyukii', bg: '#FF72C0', tilt: '-rotate-2' },
                  { q: 'omegle who?? wallly is the upgrade we needed fr', a: '@lukascodes', bg: '#E4FF00', tilt: 'rotate-1 md:translate-y-4' },
                  { q: 'made an actual friend on here. we facetime every day now 🥹', a: '@_aanya', bg: '#5D5DFF', tilt: '-rotate-1' },
                ].map((t, i) => (
                  <div key={i} className={`p-7 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${t.tilt} hover:rotate-0 transition-transform`} style={{ background: t.bg, color: t.bg === '#E4FF00' ? '#000' : '#fff' }}>
                    <div className="text-3xl mb-3" style={heading}>"</div>
                    <p className="font-semibold leading-snug mb-4 text-base">{t.q}</p>
                    <div className="text-xs uppercase tracking-widest opacity-80" style={heading}>{t.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white border-y-4 border-black">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
              <div className="lg:sticky lg:top-32">
                <div className="inline-block bg-[#5D5DFF] text-white border-2 border-black px-3 py-1 font-bold mb-4 rotate-2 text-xs uppercase">/ faq</div>
                <h2 style={heading} className="text-4xl sm:text-5xl uppercase leading-none">questions?<br /><span className="text-[#FF72C0]">we got you.</span></h2>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                  { q: 'Is Wallly a good Omegle alternative?', a: 'Yep — modern UI, AI moderation, video + text, interest matching, friends list. Everything Omegle didn’t have.' },
                  { q: 'Is it actually free?', a: 'Free forever for video & text chat. Premium unlocks filters, virtual backgrounds, read receipts.' },
                  { q: 'How safe is it?', a: 'AI moderation, age verification (16+), instant skip, report tools. We take safety seriously.' },
                  { q: 'Do I need to download anything?', a: 'Nope. Works in any browser on phone, tablet, or laptop.' },
                  { q: 'Can I add people as friends?', a: 'Yes — find them in your chat history and send a connection request.' },
                ].map((f, i) => (
                  <AccordionItem key={i} value={`i${i}`} className="border-4 border-black bg-white px-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AccordionTrigger className="hover:no-underline text-left">
                      <span style={heading} className="text-base sm:text-lg uppercase">{f.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-black/75 text-base font-medium">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 sm:px-6 py-20 bg-[#E4FF00]">
            <div className="max-w-5xl mx-auto bg-white border-4 border-black p-8 sm:p-14 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="inline-block bg-[#FF72C0] text-white border-2 border-black px-3 py-1 font-bold mb-6 -rotate-2 text-xs uppercase">/ your turn</div>
              <h2 style={heading} className="text-4xl sm:text-7xl uppercase leading-[0.9] mb-6">
                from strangers<br /><span className="text-[#5D5DFF] outline-text">to friends.</span>
              </h2>
              <p className="text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto text-black/75">
                Your next favorite person is online right now. Don't leave them on read.
              </p>
              <button
                onClick={() => navigate('/auth')}
                style={heading}
                className="bg-[#5D5DFF] text-white text-2xl sm:text-3xl uppercase px-10 sm:px-14 py-5 sm:py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[5px] hover:translate-y-[5px] transition-all inline-flex items-center gap-3"
              >
                Start Chatting <ArrowUpRight className="w-7 h-7" />
              </button>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-black text-white border-t-4 border-black px-4 sm:px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <img src={logo} alt="Wallly" width="32" height="32" loading="lazy" className="w-8 h-8 border-2 border-white" />
                  <span style={heading} className="text-xl uppercase italic">Wallly</span>
                </div>
                <p className="text-sm text-white/70 max-w-xs">Where the walls end, you find a friend.</p>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-[#E4FF00] mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><button onClick={() => navigate('/auth')} className="hover:text-white">Video Chat</button></li>
                  <li><button onClick={() => navigate('/auth')} className="hover:text-white">Text Chat</button></li>
                  <li><button onClick={() => navigate('/premium')} className="hover:text-white">Premium</button></li>
                  <li><button onClick={() => navigate('/c')} className="hover:text-white">Communities</button></li>
                </ul>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-[#FF72C0] mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><button onClick={() => navigate('/howtouse')} className="hover:text-white">How to Use</button></li>
                  <li><button onClick={() => navigate('/blog')} className="hover:text-white">Blog</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-white">Contact</button></li>
                </ul>
              </div>
              <div>
                <h4 style={heading} className="text-xs uppercase tracking-widest text-[#5D5DFF] mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><button onClick={() => navigate('/privacy')} className="hover:text-white">Privacy</button></li>
                  <li><a href="mailto:help@corevia.in" className="hover:text-white">help@corevia.in</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
              <p>&copy; 2025 Wallly. 16+ only. Be kind.</p>
              <p>Made by <a href="https://corevia.in" rel="dofollow" target="_blank" className="text-white/80 hover:text-white">Corevia</a></p>
            </div>
          </div>
        </footer>

        <style>{`
          .outline-text {
            -webkit-text-stroke: 2px #000;
            color: transparent;
          }
        `}</style>
      </div>
    </>
  );
};

export default Landing;
