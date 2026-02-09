import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReadingProgressProvider } from "@/contexts/ReadingProgressContext";
import { BookmarksProvider } from "@/contexts/BookmarksContext";
import BottomNav from "@/components/BottomNav";
import HomePage from "./pages/HomePage";
import ReaderPage from "./pages/ReaderPage";
import PlansPage from "./pages/PlansPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import BookmarksPage from "./pages/BookmarksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReadingProgressProvider>
        <BookmarksProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reader" element={<ReaderPage />} />
              <Route path="/reader/:bookId" element={<ReaderPage />} />
              <Route path="/reader/:bookId/:chapter" element={<ReaderPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </BookmarksProvider>
      </ReadingProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
