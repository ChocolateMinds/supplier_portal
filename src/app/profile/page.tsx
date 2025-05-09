"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserCircle, ArrowLeft, CheckCircle2, AlertTriangle, Save } from "lucide-react";
import { api } from "@/lib/apiService";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  // Add other fields as necessary, e.g., phone, address
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming a getProfile method exists in tenantProfileService
        // const data = await api.profile.getProfile(); 
        // Mocking for now as backend MVP might not have this specific tenant profile endpoint
        // It might be part of the user object or a separate tenant profile
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
        const mockProfile: ProfileData = {
            first_name: "Supplier",
            last_name: "User",
            email: "supplier@example.com",
            company_name: "Global Jet Services Inc."
        };
        setProfile(mockProfile);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Could not load profile information.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Assuming an updateProfile method exists in tenantProfileService
      // const response = await api.profile.updateProfile(profile);
      // Mocking update as well
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Profile update submitted (mock):", profile);
      setSuccessMessage("Profile updated successfully!"); 
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-center flex-col">
            <UserCircle className="h-16 w-16 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>
              View and update your company and contact information.
            </CardDescription>
          </div>
        </CardHeader>
        {error && (
            <div className="mx-6 mb-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )}
        {successMessage && (
            <div className="mx-6 mb-4">
                <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            </div>
        )}
        {profile ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="first_name" 
                    value={profile.first_name}
                    onChange={handleInputChange} 
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="last_name" 
                    value={profile.last_name}
                    onChange={handleInputChange} 
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profile.email} 
                  onChange={handleInputChange} 
                  disabled={isSaving} // Or make email read-only if not updatable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  name="company_name" 
                  value={profile.company_name}
                  onChange={handleInputChange} 
                  disabled={isSaving}
                />
              </div>
              {/* Add more fields here as needed, e.g., phone, address */}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSaving} className="ml-auto">
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        ) : (
          !error && <p className="text-center text-muted-foreground py-4">Profile data not available.</p>
        )}
      </Card>
    </div>
  );
}

