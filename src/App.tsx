import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReadingProgressProvider } from "@/contexts/ReadingProgressContext";
import { BookmarksProvider } from "@/contexts/BookmarksContext";
import { JournalProvider } from "@/contexts/JournalContext";
import { PioneerProvider } from "@/contexts/PioneerContext";
import { StudiesProvider } from "@/contexts/StudiesContext";
import BottomNav from "@/components/BottomNav";
import OfflineIndicator from "@/components/OfflineIndicator";
import HomePage from "./pages/HomePage";
import ReaderPage from "./pages/ReaderPage";
import PlansPage from "./pages/PlansPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import BookmarksPage from "./pages/BookmarksPage";
import JournalPage from "./pages/JournalPage";
import HowToPage from "./pages/HowToPage";
import PioneerPage from "./pages/PioneerPage";
import StudiesPage from "./pages/StudiesPage";
import DailyTextPage from "./pages/DailyTextPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DarkModeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nwt-reading-progress');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch {}
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReadingProgressProvider>
        <BookmarksProvider>
          <JournalProvider>
            <PioneerProvider>
              <StudiesProvider>
                <DarkModeInit />
                <Toaster />
                <Sonner />
                <OfflineIndicator />
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
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/how-to" element={<HowToPage />} />
                    <Route path="/pioneer" element={<PioneerPage />} />
                    <Route path="/studies" element={<StudiesPage />} />
                    <Route path="/daily-text" element={<DailyTextPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <BottomNav />
                </BrowserRouter>
              </StudiesProvider>
            </PioneerProvider>
          </JournalProvider>
        </BookmarksProvider>
      </ReadingProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
