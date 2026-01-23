import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ContentGenerator from "./pages/ContentGenerator";
import HashtagOptimizer from "./pages/HashtagOptimizer";
import ImageCreator from "./pages/ImageCreator";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import ContentCalendar from "./pages/ContentCalendar";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><ContentGenerator /></ProtectedRoute>} />
            <Route path="/hashtags" element={<ProtectedRoute><HashtagOptimizer /></ProtectedRoute>} />
            <Route path="/images" element={<ProtectedRoute><ImageCreator /></ProtectedRoute>} />
            <Route path="/sentiment" element={<ProtectedRoute><SentimentAnalysis /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
            <Route path="/competitors" element={<ProtectedRoute><CompetitorAnalysis /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
