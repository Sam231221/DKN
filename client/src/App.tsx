import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { SolutionsSection } from "@/components/solutions-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import LoginPage from "@/pages/login/page";
import SignupPage from "@/pages/signup/page";
import ActivateInvitationPage from "@/pages/activate-invitation/page";
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
import OrganizationSearchPage from "@/pages/organization-dashboard/search/page";
import OrganizationTrendingPage from "@/pages/organization-dashboard/trending/page";
import OrganizationLeaderboardPage from "@/pages/organization-dashboard/leaderboard/page";
import OrganizationContributorsPage from "@/pages/organization-dashboard/contributors/page";

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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/activate-invitation/:token" element={<ActivateInvitationPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Individual user routes */}
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/profile" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/search" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/trending" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <TrendingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/leaderboard" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <LeaderboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/settings" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/contributors" 
            element={
              <ProtectedRoute requiredOrganizationType="individual">
                <ContributorsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Organizational user routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/clients" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <ClientsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/employees" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <EmployeesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/projects" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/knowledge-items" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <KnowledgeItemsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/knowledge-items/:id" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <KnowledgeItemDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/repositories" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <RepositoriesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/repositories/:id" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <RepositoryDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/search" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationSearchPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/trending" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationTrendingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/contributors" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationContributorsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/leaderboard" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationLeaderboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute requiredOrganizationType="organizational">
                <OrganizationSettingsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
