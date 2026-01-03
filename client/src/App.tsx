import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { SolutionsSection } from "@/components/solutions-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import LoginPage from "@/pages/login/page";
import SignupPage from "@/pages/signup/page";
import DashboardPage from "@/pages/dashboard/page";
import SearchPage from "@/pages/dashboard/search/page";
import LeaderboardPage from "@/pages/dashboard/leaderboard/page";
import SettingsPage from "@/pages/dashboard/settings/page";
import ContributorsPage from "@/pages/dashboard/contributors/page";
import KnowledgePage from "@/pages/dashboard/knowledge/page";

function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <SolutionsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/search" element={<SearchPage />} />
        <Route path="/dashboard/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/contributors" element={<ContributorsPage />} />
        <Route path="/dashboard/knowledge" element={<KnowledgePage />} />
      </Routes>
    </BrowserRouter>
  );
}
