'use client';

import { ChainConfigForm } from '@/components/chains/chain-config-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { Organization, generateHandle } from '@getgrowly/core';

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

export function OrganizationEditForm({
  existingOrganization,
}: {
  existingOrganization?: Organization;
}) {
  const router = useRouter();
  const { createOrganization, updateOrganization, setSelectedOrganization } = useDashboardState();
  const { admin } = useDashboardState();
  const [companyName, setCompanyName] = useState(existingOrganization?.name || '');
  const [companyDescription, setCompanyDescription] = useState(
    existingOrganization?.description || ''
  );
  const [organizationHandle, setOrganizationHandle] = useState(existingOrganization?.handle || '');
  const [referralSource, setReferralSource] = useState(existingOrganization?.referral_source || '');
  const [role, setRole] = useState('');
  // const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  // const [logoFile, setLogoFile] = useState<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files?.[0]) {
  //     const file = event.target.files[0];

  //     // Validate file size (10MB limit as mentioned in UI)
  //     if (file.size > 10 * 1024 * 1024) {
  //       toast.error('File size must be less than 10MB');
  //       return;
  //     }

  //     // Validate file type
  //     if (!file.type.startsWith('image/')) {
  //       toast.error('Please select an image file');
  //       return;
  //     }

  //     setLogoFile(file);
  //     const reader = new FileReader();
  //     reader.onload = e => {
  //       setCompanyLogo(e.target?.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !organizationHandle) {
      toast.error('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (admin) {
        if (existingOrganization) {
          const organization = await updateOrganization(
            existingOrganization.id,
            companyName,
            companyDescription,
            organizationHandle,
            undefined,
            referralSource
          );
          setSelectedOrganization(organization);
          toast.success('Organization updated successfully!');
          router.push('/dashboard');
          return;
        }
        const organization = await createOrganization(
          companyName,
          companyDescription,
          role,
          organizationHandle,
          undefined,
          referralSource
        );
        setSelectedOrganization(organization);
        toast.success('Organization created successfully!');
        // Redirect to chain selection for new organizations
        router.push('/onboarding/chains');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handle when company name changes if handle is empty
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    setOrganizationHandle(generateHandle(name));
  };

  const handleCompanyDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target.value;
    setCompanyDescription(description);
  };

  const handleChainConfigSave = async (chainIds: number[]) => {
    if (!existingOrganization) {
      // For new organizations, we'll handle this in the submit
      toast.info('Chain configuration will be saved with your organization');
      return;
    }

    try {
      await suiteCore.db.organizations.update(existingOrganization.id, {
        supported_chain_ids: chainIds,
      });
      toast.success('Chain configuration updated successfully!');
      // Refresh the selected organization
      const updatedOrg = await suiteCore.organizations.getOrganizationById(existingOrganization.id);
      if (updatedOrg) {
        setSelectedOrganization(updatedOrg);
      }
    } catch (error) {
      console.error('Error updating chain config:', error);
      toast.error('Failed to update chain configuration');
      throw error;
    }
  };

  if (!admin) {
    router.push('/onboarding');
    return null;
  }

  return (
    <React.Fragment>
      <div className="text-left mb-8">
        <h1 className="text-xl font-bold">
          {existingOrganization ? 'Edit' : 'Create'} your organization
        </h1>
        <p className="text-md text-muted-foreground mt-2">
          {existingOrganization
            ? 'Update your organization details'
            : 'Set up your organization to get started with Suite.'}
        </p>
      </div>
      <div>
        {/* <div className="flex space-x-6 items-center mb-6 max-sm:flex-col max-sm:space-x-0">
          <div className="relative w-24 h-24 mb-2">
            {companyLogo ? (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
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
        </div> */}
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
            <Label className="text-sm" htmlFor="companyDescription">
              Company description
            </Label>
            <Input
              id="companyDescription"
              placeholder="Enter your company description..."
              value={companyDescription}
              onChange={handleCompanyDescriptionChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm" htmlFor="organizationHandle">
              Organization handle
            </Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm mr-2">app.getsuite.io/</span>
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
            size="lg"
            onClick={handleSubmit}
            className={cn(
              'w-full mt-2 bg-gradient-to-r from-primary to-brand-accent',
              existingOrganization && 'max-w-[300px]'
            )}
            disabled={isSubmitting || !companyName || !organizationHandle}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
          {!existingOrganization && (
            <Link href="/onboarding/profile" className="block text-center">
              <Button variant="ghost" type="button" className="mt-2 w-full">
                <ArrowLeft size={16} className="mr-2" />
                Back to profile
              </Button>
            </Link>
          )}
        </div>

        {existingOrganization && (
          <>
            <Separator className="my-8" />
            <ChainConfigForm
              selectedChainIds={existingOrganization.supported_chain_ids || []}
              onSave={handleChainConfigSave}
              maxChains={2}
            />
          </>
        )}
      </div>
    </React.Fragment>
  );
}
