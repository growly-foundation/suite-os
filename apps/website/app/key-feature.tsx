import { motion } from 'framer-motion';

import { GridBackground } from '@getgrowly/ui';

export const KeyFeature = () => {
  return (
    <section
      id="features"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
      aria-labelledby="features-heading">
      <GridBackground />
      {/* <FramerSpotlight /> */}
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
          <div className="space-y-2">
            <h2
              id="features-heading"
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Suite Dashboard for AI Agents Management
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Manage your AI agents and workflows in one place with our user-friendly interface.
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto max-w-5xl">
          <img
            src="/graphics/buster-mascot-3d.png"
            className="max-sm:hidden absolute object-cover w-[140px] h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] left-[-30px] md:left-[-50px] lg:left-[-80px] bottom-[-40px] md:bottom-[-60px] lg:bottom-[-80px] rotate-[15deg] hover:rotate-[-10deg] transition-all duration-300 cursor-pointer"
          />
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
            <video
              src="/videos/workflow-guide.mp4"
              width={1480}
              height={720}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
