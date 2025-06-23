'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ firstName: user.firstName, lastName: user.lastName });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Actualizăm doar profilul local pentru demonstrație
      // În aplicația reală, apelăm API-ul pentru actualizare
      updateUser({
        ...user!,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
      
      toast({
        title: 'Succes',
        description: 'Profilul a fost actualizat.',
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza profilul.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Eroare',
        description: 'Parolele noi nu se potrivesc.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      // În aplicația reală, apelăm API-ul pentru schimbarea parolei
      // Aici doar simulăm succesul
      toast({
        title: 'Succes',
        description: 'Parola a fost schimbată.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut schimba parola.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  if (!user) return <div className="flex justify-center items-center h-screen">Se încarcă...</div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 text-center">Setări Cont</h1>
        
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl text-gray-800">Setări Profil</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Actualizează informațiile profilului.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">Prenume</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 w-full p-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">Nume</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 w-full p-2.5"
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md"
                  >
                    {loading ? 'Se salvează...' : 'Salvează Modificările'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl text-gray-800">Schimbare Parolă</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Actualizează parola contului.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-700 font-medium">Parola Curentă</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 w-full p-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">Parola Nouă</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 w-full p-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmă Parola Nouă</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 w-full p-2.5"
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md"
                  >
                    {loading ? 'Se schimbă...' : 'Schimbă Parola'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 