'use client';

import { Button } from '@/components/ui/button';
import React from 'react';

export function FloatingButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <React.Fragment>
      <div className={`fixed bottom-6 right-6 z-50`}>
        <Button
          {...props}
          className="rounded-full p-4 shadow-lg bg-primary text-white hover:bg-primary/90">
          Open Widget
        </Button>
      </div>
    </React.Fragment>
  );
}
