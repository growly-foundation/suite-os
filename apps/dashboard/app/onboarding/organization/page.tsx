'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { SuiteLogoFull } from '@getgrowly/ui';

// Options for how user heard about us
const REFERRAL_SOURCES = [
  'Search Engine',
  'Social Media',
  'Friend or Colleague',
  'Blog Post',
  'Conference',
  'Advertisement',
  'Other',
];

// Options for roles at company
const ROLES = [
  'Founder/CEO',
  'CTO/Technical Lead',
  'Developer',
  'Product Manager',
  'Designer',
  'Marketing',
  'Operations',
  'Sales',
  'Customer Support',
  'Other',
];

export function OrganizationForm() {
  const router = useRouter();
  const { user } = usePrivy();
  const { admin } = useDashboardState();
  const [companyName, setCompanyName] = useState('');
  const [organizationHandle, setOrganizationHandle] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [role, setRole] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setCompanyLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !organizationHandle) {
      toast.error('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (admin) {
        // Create organization - schema only has name and description fields
        const organization = await suiteCore.db.organizations.create({
          name: companyName,
          description: JSON.stringify({
            handle: organizationHandle,
            referralSource,
            userRole: role,
            createdBy: admin.name,
            // Add logo processing here if needed
          }),
        });

        // Add current user as admin to the organization
        await suiteCore.db.admin_organizations.create({
          organization_id: organization.id,
          admin_id: admin.id,
          // Note: No role field in admin_organizations table
        });

        // Update selected organization and redirect to dashboard
        await localStorage.setItem(`selected-organization-id-${admin.id}`, organization.id);
        toast.success('Organization created successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a handle from company name
  const generateHandle = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Update handle when company name changes if handle is empty
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    if (!organizationHandle) {
      setOrganizationHandle(generateHandle(name));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="overflow-hidden md:overflow-auto position-relative rounded-2xl flex max-h-[85vh] max-sm:h-[100vh] justify-between">
        <CardContent className="py-6 px-10 md:p-8 w-full max-h-full overflow-auto">
          <div className="text-left mb-8">
            <h1 className="text-xl font-bold">Create your organization</h1>
            <p className="text-md text-muted-foreground mt-2">
              Set up your organization to get started with Suite.
            </p>
          </div>
          <div>
            <div className="flex space-x-6 items-center mb-6 max-sm:flex-col max-sm:space-x-0">
              <div className="relative w-24 h-24 mb-2">
                {companyLogo ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={companyLogo}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload size={24} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start space-y-4 max-sm:mt-4 max-sm:items-center max-sm:justify-center">
                <Button
                  size="sm"
                  className="flex items-center max-sm:w-full space-x-2 primary"
                  onClick={() => document.getElementById('companyLogo')?.click()}>
                  <Upload size={16} />
                  Upload company logo
                </Button>
                <Input
                  className="hidden"
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-muted-foreground">
                  *JPG, PNG files up to 10MB at least 400px by 400px
                </p>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="companyName">
                  Company name
                </Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name..."
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="organizationHandle">
                  Organization handle
                </Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground text-sm mr-2">suite.getgrowly.app/</span>
                  <Input
                    id="organizationHandle"
                    placeholder="my-organization"
                    value={organizationHandle}
                    onChange={e => setOrganizationHandle(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="role">
                  Your role at the company
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="referralSource">
                  How did you hear about us?
                </Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_SOURCES.map(source => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 bg-gradient-to-r from-primary to-brand-accent"
                disabled={isSubmitting || !companyName || !organizationHandle}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
              <Link href="/onboarding/profile" className="block text-center">
                <Button variant="ghost" type="button" className="mt-2 w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <img
          src="/banners/onboarding-organization-banner.png"
          alt="Banner"
          style={{ width: '50%', height: '90vh', objectFit: 'cover' }}
          className="dark:brightness-[0.2] dark:grayscale max-md:hidden"
        />
      </Card>
    </form>
  );
}

export default function OrganizationPage() {
  return (
    <div className="bg-muted p-6 md:p-10 h-[100vh]">
      <div className="w-full max-w-[80%] max-sm:max-w-full flex flex-col items-center mx-auto">
        <SuiteLogoFull className="w-24 object-contain mb-6" />
        <OrganizationForm />
      </div>
    </div>
  );
}
