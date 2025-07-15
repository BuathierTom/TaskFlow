import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthProps {
  mode: 'sign-in' | 'sign-up';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            TaskFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'sign-in' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Auth Component */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;