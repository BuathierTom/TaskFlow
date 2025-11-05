import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthProps {
  mode: 'sign-in' | 'sign-up';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
            TaskFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'sign-in' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Auth Component: plus de Card ici */}
        {mode === 'sign-in' ? (
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
              }
            }}
            fallbackRedirectUrl="/"
            signUpUrl="/auth/sign-up"
          />
        ) : (
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
              }
            }}
            fallbackRedirectUrl="/"
            signInUrl="/auth/sign-in"
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
