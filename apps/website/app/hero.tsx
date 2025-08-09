import { FloatingAvatars } from '@/components/floating-avatars';
import { Button } from '@/components/ui/button';
import { MessageCircle, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

import { GridBackground } from '@getgrowly/ui';

export function ArcadeEmbed() {
  return (
    <div
      className="max-w-[100%] mx-auto"
      style={{
        position: 'relative',
        paddingBottom: 'calc(62.5% + 45px)',
        height: 0,
        width: '100%',
      }}>
      <iframe
        src="https://demo.arcade.software/KsZvvHJgcbealKDHzwdA?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
        title="Suite | Arcade Demo"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
        allow="clipboard-write"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          colorScheme: 'light',
        }}
      />
    </div>
  );
}

export function RotatingArcade() {
  const [rotation, setRotation] = useState(9); // initial tilt

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxRotation = 9;
      const minRotation = 0;
      const maxScroll = 300; // adjust based on how fast it flattens

      // Calculate rotation based on scrollY
      const newRotation = Math.max(minRotation, maxRotation - (scrollY / maxScroll) * maxRotation);

      setRotation(newRotation);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="w-full border px-4 rounded-xl bg-white/5 shadow-lg mt-4"
      style={{
        transform: `perspective(200px) rotateX(${rotation}deg)`,
        transition: 'transform 0.2s ease-out',
      }}>
      <ArcadeEmbed />
    </div>
  );
}

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden">
      <GridBackground />
      {/* Custom container specifically for floating avatars */}
      <FloatingAvatars />
      {/* <FramerSpotlight /> */}
      <div className="container px-4 md:px-6 py-16 md:py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-block rounded-full bg-white border px-3 py-1 text-md mb-6">
            Built for the Web3 era 👀💙
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
            Create Growth That Lasts.
          </h1>
          <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12">
            The OS platform to understand your users, get insights, and grow.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => (window.location.href = 'https://x.com/i/status/1937774993770971576')}
              className="flex items-center gap-3 px-3 py-4 bg-primary hover:bg-primary/90 text-white border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-md font-bold">View Demo</span>
              </div>
              <Video />
            </Button>
            <Button
              onClick={() => (window.location.href = 'https://cal.com/ngan-suite/30min')}
              className="flex items-center gap-3 px-3 py-4 bg-white hover:bg-primary/90 text-black border border-slate-200 hover:bg-slate-100 hover:border-slate-600 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-md font-bold">Talk to sales</span>
              </div>
              <MessageCircle />
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>
        </div>
        <RotatingArcade />
      </div>
    </section>
  );
};
