'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    console.log(error);

    return {
      error: error.message,
    };
  }

  return data;
}

export async function verifyOTP(email: string, formData: FormData) {
  const supabase = await createClient();

  const token = formData.get('token') as string;

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) {
    console.log(error);
    return {
      error: error.message,
    };
  }
  return redirect('/dashboard');
}
