
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Order } from '@/types/supabase';
import { getUserOrders } from '@/services/orderService';
import OrderHistoryList from '@/components/OrderHistoryList';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to login if not authenticated and auth is not loading
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Combine with email from auth
        setProfile({
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          email: user.email || '',
        });
        
        // Fetch user's order history
        const orderData = await getUserOrders(user.id);
        setOrders(orderData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const first_name = formData.get('firstName') as string;
    const last_name = formData.get('lastName') as string;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name, last_name })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, first_name, last_name } : null);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile information.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading profile data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and view your order history
          </p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your account details and personal information.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Contact support to change your email address.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={profile?.first_name || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={profile?.last_name || ''}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track your past orders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderHistoryList orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    You can change your password or sign out from all devices.
                  </p>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button variant="outline" disabled>
                      Change Password
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
