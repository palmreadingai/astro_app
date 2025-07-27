import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './hooks/useAuth';
import { PaymentProvider } from './context/PaymentContext';
import { ProfileCompletionProvider } from './context/ProfileCompletionContext';

function App() {
  return (
    <AuthProvider>
      <ProfileCompletionProvider>
        <PaymentProvider>
          <RouterProvider router={router} />
        </PaymentProvider>
      </ProfileCompletionProvider>
    </AuthProvider>
  );
}

export default App;