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
import VerifyEmailPage from "@/pages/verify-email/page";
import ForgotPasswordPage from "@/pages/forgot-password/page";
import ResetPasswordPage from "@/pages/reset-password/page";
import DashboardPage from "@/pages/dashboard/page";
import ProfilePage from "@/pages/dashboard/profile/page";
import SearchPage from "@/pages/dashboard/search/page";
import LeaderboardPage from "@/pages/dashboard/leaderboard/page";
import SettingsPage from "@/pages/dashboard/settings/page";
import ContributorsPage from "@/pages/dashboard/contributors/page";
import TrendingPage from "@/pages/dashboard/trending/page";
import OrganizationDashboardPage from "@/pages/organization-dashboard/page";
import ClientsPage from "@/pages/organization-dashboard/clients/page";
import EmployeesPage from "@/pages/organization-dashboard/employees/page";
import KnowledgeItemsPage from "@/pages/organization-dashboard/knowledge-items/page";
import KnowledgeItemDetailPage from "@/pages/organization-dashboard/knowledge-items/[id]/page";
import RepositoriesPage from "@/pages/organization-dashboard/repositories/page";
import RepositoryDetailPage from "@/pages/organization-dashboard/repositories/detail/page";
import ProjectsPage from "@/pages/organization-dashboard/projects/page";
import OrganizationSettingsPage from "@/pages/organization-dashboard/settings/page";

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
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/explore" element={<DashboardPage />} />
        <Route path="/explore/profile" element={<ProfilePage />} />
        <Route path="/explore/search" element={<SearchPage />} />
        <Route path="/explore/trending" element={<TrendingPage />} />
        <Route path="/explore/leaderboard" element={<LeaderboardPage />} />
        <Route path="/explore/settings" element={<SettingsPage />} />
        <Route path="/explore/contributors" element={<ContributorsPage />} />
        <Route path="/dashboard" element={<OrganizationDashboardPage />} />
        <Route path="/dashboard/clients" element={<ClientsPage />} />
        <Route path="/dashboard/employees" element={<EmployeesPage />} />
        <Route path="/dashboard/projects" element={<ProjectsPage />} />
        <Route path="/dashboard/knowledge-items" element={<KnowledgeItemsPage />} />
        <Route path="/dashboard/knowledge-items/:id" element={<KnowledgeItemDetailPage />} />
        <Route path="/dashboard/repositories" element={<RepositoriesPage />} />
        <Route path="/dashboard/repositories/:id" element={<RepositoryDetailPage />} />
        <Route path="/dashboard/settings" element={<OrganizationSettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
