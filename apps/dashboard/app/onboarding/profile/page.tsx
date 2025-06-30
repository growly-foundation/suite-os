'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { uploadToSupabase } from '@/utils/supabase-storage';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { SuiteLogoFull } from '@getgrowly/ui';

export function ProfileForm() {
  const router = useRouter();
  const { admin } = useDashboardState();
  const [firstName, setFirstName] = useState(admin?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(admin?.name.split(' ')[1] || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];

      // Validate file size (10MB limit as mentioned in UI)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error('Please provide your first and last name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user profile in database
      if (admin?.email) {
        // Handle profile image upload if provided
        let profileImageUrl = null;
        if (imageFile) {
          toast.info('Uploading profile image...');
          profileImageUrl = await uploadToSupabase(imageFile, 'profiles', `admin-${admin.id}`);
          if (!profileImageUrl) {
            toast.warning('Image upload failed, but profile will still be updated');
          } else {
            toast.success('Image uploaded successfully!');
          }
        }
        // Update admin record with name and profile image URL if available
        await suiteCore.db.admins.update(admin.id, {
          name: `${firstName} ${lastName}`,
          ...(profileImageUrl && { image_url: profileImageUrl }),
        });

        toast.success('Profile updated successfully!');
        // Redirect to organization page
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!admin) {
    router.push('/onboarding');
    return null;
  }

  return (
    <Card className="overflow-hidden md:overflow-auto position-relative rounded-2xl flex max-h-[85vh] max-sm:h-[100vh] justify-between">
      <CardContent className="py-6 px-10 md:p-8 w-full max-h-full overflow-auto">
        <div className="text-left mb-8">
          <h1 className="text-xl font-bold">Let&apos;s get to know you</h1>
          <p className="text-md text-muted-foreground mt-2">
            Tell us a bit about yourself to personalize your experience.
          </p>
        </div>

        <div>
          <div className="flex space-x-6 max-sm:flex-col max-sm:space-x-0 items-center space-y-4 md:space-y-0 mb-6">
            <div className="relative w-24 h-24 mb-2">
              {profileImage ? (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-semibold">
                  {firstName && lastName ? `${firstName[0]}${lastName[0]}` : '?'}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start space-y-4 max-sm:mt-4 max-sm:items-center max-sm:justify-center">
              <Button
                size="sm"
                className="flex items-center max-sm:w-full space-x-2 primary"
                onClick={() => document.getElementById('profileImage')?.click()}>
                <Upload size={16} />
                Upload profile picture
              </Button>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-xs text-muted-foreground">
                *JPG, PNG files up to 10MB at least 400px by 400px
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="firstName">
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="lastName">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            {admin?.email && (
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="email">
                  Email
                </Label>
                <Input id="email" type="email" value={admin?.email} disabled className="bg-muted" />
              </div>
            )}
            <Button
              size="lg"
              onClick={handleSubmit}
              className="w-full mt-2 bg-gradient-to-r from-primary to-brand-accent"
              disabled={isSubmitting || !firstName || !lastName}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
      <img
        src="/banners/onboarding-profile-banner.png"
        alt="Banner"
        style={{ width: '50%', height: '90vh', objectFit: 'cover' }}
        className="dark:brightness-[0.2] dark:grayscale max-md:hidden"
      />
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="bg-muted p-6 py-10 md:p-10 h-[100vh]">
      <div className="w-full max-w-[80%] max-sm:max-w-full flex flex-col items-center mx-auto">
        <SuiteLogoFull className="w-24 object-contain mb-6" />
        <ProfileForm />
        <div className="text-balance text-center text-xs text-muted-foreground mt-6 max-sm:m-4 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By continuing, you agree to our <a href="#">Terms of Service</a> and{' '}
          <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
