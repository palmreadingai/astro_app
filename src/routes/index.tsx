import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import Layout from '../components/Layout/Layout';
import LandingPage from '../components/Auth/LandingPage';
import AuthScreen from '../components/Auth/AuthScreen';
import AuthConfirmScreen from '../components/Auth/AuthConfirmScreen';
import UpdatePasswordScreen from '../components/Auth/UpdatePasswordScreen';
import ProfileCompletionScreen from '../components/Profile/ProfileCompletionScreen';
import ProfileCompletionGuard from '../components/Profile/ProfileCompletionGuard';
import TermsOfService from '../components/Legal/TermsOfService';
import PrivacyPolicy from '../components/Legal/PrivacyPolicy';
import RefundPolicy from '../components/Legal/RefundPolicy';
import PricingPolicy from '../components/Legal/PricingPolicy';
import ContactPage from '../components/Contact/ContactPage';

// Lazy load components for code splitting
const HomePage = lazy(() => import('../components/Home/HomePage'));
const PalmAnalysis = lazy(() => import('../components/Palm/PalmAnalysis'));
const SamadhanChat = lazy(() => import('../components/Chat/SamadhanChat'));
const ProfilePage = lazy(() => import('../components/Profile/ProfilePage'));
const FeedbackPage = lazy(() => import('../components/Feedback/FeedbackPage'));
const PricingPage = lazy(() => import('../components/Pricing/PricingPage'));
const PaymentSuccess = lazy(() => import('../components/Pricing/PaymentSuccess'));
const PaymentFailure = lazy(() => import('../components/Pricing/PaymentFailure'));

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <ProfileCompletionGuard>
      <Layout>{children}</Layout>
    </ProfileCompletionGuard>
  );
}

// Public Route Component (for non-authenticated users)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    ),
  },
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <AuthScreen />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/confirm',
    element: <AuthConfirmScreen />,
  },
  {
    path: '/account/update-password',
    element: (
      <ProtectedRoute>
        <UpdatePasswordScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/complete-profile',
    element: (
      <ProtectedRoute>
        <ProfileCompletionScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/palm',
    element: (
      <ProtectedRoute>
        <PalmAnalysis />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <SamadhanChat />
      </ProtectedRoute>
    ),
  },
  {
    path: '/feedback',
    element: (
      <ProtectedRoute>
        <FeedbackPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/horoscope',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/kundli',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing',
    element: (
      <ProtectedRoute>
        <PricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-success',
    element: (
      <ProtectedRoute>
        <PaymentSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-failure',
    element: (
      <ProtectedRoute>
        <PaymentFailure />
      </ProtectedRoute>
    ),
  },
  {
    path: '/terms',
    element: <TermsOfService />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/refund',
    element: <RefundPolicy />,
  },
  {
    path: '/pricing-policy',
    element: <PricingPolicy />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);