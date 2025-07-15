import React from 'react';
import { UserProfile, useUser, SignOutButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mon Profil
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez vos informations personnelles
              </p>
            </div>
          </div>
          
          <SignOutButton>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </SignOutButton>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user?.imageUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{user?.fullName || 'Nom non défini'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Membre depuis {new Date(user?.createdAt || '').toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clerk UserProfile Component */}
        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardContent className="p-0">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 bg-transparent",
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;