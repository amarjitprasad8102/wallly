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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
