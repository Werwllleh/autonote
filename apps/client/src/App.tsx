import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout"
import { ProtectedRoute } from "@/components/protected-route"
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { DashboardPage } from "@/pages/dashboard"
import { VehiclePage } from "@/pages/vehicle"
import { ProfilePage } from "@/pages/profile"
import { AdminPage } from "@/pages/admin"
import { VerifyPage } from "@/pages/verify"
import { PublicReportPage } from "@/pages/public-report"
import { AdminRoute } from "@/components/admin-route"
import { useTheme } from "@/hooks/use-theme"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function App() {
  useTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/report/:token" element={<PublicReportPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles/:id" element={<VehiclePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
