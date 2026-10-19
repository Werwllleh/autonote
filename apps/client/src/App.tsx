import { lazy, Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "@/pages/landing"
import { ProtectedRoute } from "@/components/protected-route"
import { GuestRoute } from "@/components/guest-route"
import { AdminRoute } from "@/components/admin-route"
import { useTheme } from "@/hooks/use-theme"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"

const Layout = lazy(() => import("@/components/layout").then((m) => ({ default: m.Layout })))
const LoginPage = lazy(() => import("@/pages/login").then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/pages/register").then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })))
const VehiclePage = lazy(() => import("@/pages/vehicle").then((m) => ({ default: m.VehiclePage })))
const ProfilePage = lazy(() => import("@/pages/profile").then((m) => ({ default: m.ProfilePage })))
const AdminPage = lazy(() => import("@/pages/admin").then((m) => ({ default: m.AdminPage })))
const AdminVehiclePage = lazy(() => import("@/pages/admin-vehicle").then((m) => ({ default: m.AdminVehiclePage })))
const VerifyPage = lazy(() => import("@/pages/verify").then((m) => ({ default: m.VerifyPage })))
const PublicReportPage = lazy(() => import("@/pages/public-report").then((m) => ({ default: m.PublicReportPage })))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

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
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
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
              <Route path="/admin/vehicles/:id" element={<AdminRoute><AdminVehiclePage /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <PwaInstallPrompt />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
