import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Landing from "./pages/Landing"; // keep eager: it's the LCP route
import RequireAgeGate from "./components/RequireAgeGate";

// Lazy-load every non-landing page — cuts initial JS dramatically on mobile
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const Connections = lazy(() => import("./pages/Connections"));
const Privacy = lazy(() => import("./pages/Privacy"));
const HowToUse = lazy(() => import("./pages/HowToUse"));
const Communities = lazy(() => import("./pages/Communities"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Contact = lazy(() => import("./pages/Contact"));
const Premium = lazy(() => import("./pages/Premium"));
const Terms = lazy(() => import("./pages/Terms"));
const Refund = lazy(() => import("./pages/Refund"));
const AcceptableUse = lazy(() => import("./pages/AcceptableUse"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#03060f]">
    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RequireAgeGate />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/b/:slug" element={<BlogDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/howtouse" element={<HowToUse />} />
            <Route path="/c" element={<Communities />} />
            <Route path="/c/:communityName" element={<CommunityDetail />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/acceptable-use" element={<AcceptableUse />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
