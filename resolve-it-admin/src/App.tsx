import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { NotificationContainer } from '@/components/NotificationToast'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Reports = lazy(() => import('@/pages/Reports').then(module => ({ default: module.Reports })))
const Departments = lazy(() => import('@/pages/Departments').then(module => ({ default: module.Departments })))
const Settings = lazy(() => import('@/pages/Settings').then(module => ({ default: module.Settings })))
const Login = lazy(() => import('@/pages/Login').then(module => ({ default: module.Login })))

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="reports" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Reports />
                </Suspense>
              } />
              <Route path="departments" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Departments />
                </Suspense>
              } />
              <Route path="settings" element={
                <ProtectedRoute requiredRole="super-admin">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Settings />
                  </Suspense>
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Go Home
                  </a>
                </div>
              </div>
            } />
                 </Routes>
                 <NotificationContainer />
               </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
