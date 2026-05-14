import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Admin from "./pages/Admin";
import Connections from "./pages/Connections";
import Privacy from "./pages/Privacy";
import HowToUse from "./pages/HowToUse";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import ProfileSettings from "./pages/ProfileSettings";
import Contact from "./pages/Contact";
import Premium from "./pages/Premium";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import AcceptableUse from "./pages/AcceptableUse";
import Cookies from "./pages/Cookies";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import RequireAgeGate from "./components/RequireAgeGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RequireAgeGate />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
