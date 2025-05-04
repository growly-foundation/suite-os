'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { GalleryVerticalEnd } from 'lucide-react';

import { GithubSvg } from '@/components/svg/github';
import { GoogleSvg } from '@/components/svg/google';
import { MetaSvg } from '@/components/svg/meta';
import { Button } from '@/components/ui/button';
import { FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { signIn, verifyOTP } from '@/app/login/action';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import useSupabaseClient from '@/utils/supabase/client';
import { Provider } from '@supabase/supabase-js';
import { z } from 'zod';
import { text } from '@/styles/theme';

const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.'),
});

const OTPSchema = z.object({
  token: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export default function LoginPage() {
  const supabase = useSupabaseClient();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
    },
  });
  const otpForm = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      token: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    const formData = new FormData();
    formData.append('email', data.email);
    try {
      const response = await signIn(formData);
      setEmail(data.email);
      if (response) {
        setStep('otp');
      }
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const onOTPSubmit = async (data: z.infer<typeof OTPSchema>) => {
    const formData = new FormData();
    formData.append('token', data.token);

    const response = await verifyOTP(email, formData);
    if (response.error) {
      setError(response.error);
      return;
    }
    setError(null);
    // On success, you may want to redirect or show a success message
  };

  const loginWithOauth = (provider: Provider) => {
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `/auth/callback`,
      },
    });
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {step === 'email' && (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <a href="#" className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex size-8 items-center justify-center rounded-md">
                          <GalleryVerticalEnd className="size-6" />
                        </div>
                        <span className={text.headline}>Growly</span>
                      </a>
                      <h1 className={text.headline}>Welcome to Growly</h1>
                    </div>
                    <div className="flex flex-col gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="m@example.com" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                  </div>
                </form>
              </Form>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    loginWithOauth('google');
                  }}
                  className="flex justify-center items-center">
                  <GoogleSvg />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loginWithOauth('github')}
                  className="flex justify-center items-center">
                  <GithubSvg />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loginWithOauth('facebook')}
                  className="flex justify-center items-center">
                  <MetaSvg />
                </Button>
              </div>
            </>
          )}

          {step === 'otp' && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOTPSubmit)}>
                <FormField
                  control={otpForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
