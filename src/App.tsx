import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import HashtagOptimizer from "./pages/HashtagOptimizer";
import ImageCreator from "./pages/ImageCreator";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import ContentCalendar from "./pages/ContentCalendar";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generate" element={<ContentGenerator />} />
          <Route path="/hashtags" element={<HashtagOptimizer />} />
          <Route path="/images" element={<ImageCreator />} />
          <Route path="/sentiment" element={<SentimentAnalysis />} />
          <Route path="/calendar" element={<ContentCalendar />} />
          <Route path="/competitors" element={<CompetitorAnalysis />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
