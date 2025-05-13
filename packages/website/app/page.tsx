'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import UseCases from '@/components/use-cases';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import TypingPromptInput from '@/components/typing-prompt-input';
import FramerSpotlight from '@/components/framer-spotlight';
import CssGridBackground from '@/components/css-grid-background';
import FeaturesSection from '@/components/features-section';
import StructuredData from '@/components/structured-data';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BusterState } from '@/components/animated-buster';
import { motion } from 'framer-motion';
import TechStack from '@/components/tech-stack';

const AnimatedBuster = dynamic(
  () => import('@/components/animated-buster').then(mod => mod.AnimatedBuster),
  { ssr: false }
);

export default function Home() {
  const [state, setState] = useState<BusterState>('idle');
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col">
        <Navbar />

        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <CssGridBackground />
          <FramerSpotlight />
          <div className="container px-4 md:px-6 py-16 md:py-20">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <AnimatedBuster
                state={state}
                className="shadow-2xl cursor-pointer hover:scale-110 hover:rotate-6 transition-all duration-300"
                style={{ borderRadius: '50%', width: '150px', height: '150px', marginBottom: 35 }}
              />
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-6">
                AI Solution for Web 3.0 Businesses
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                Empower DeFi Adoption with AI-powered Engine
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12">
                Focus on shipping great products, we’ll handle the connection between your users and
                your app
              </p>

              <TypingPromptInput />

              <div className="flex flex-wrap justify-center gap-3 mt-16">
                <Button className="flex items-center gap-3 px-5 py-6 h-[40px] bg-primary hover:bg-primary/90 text-white rounded-xl border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  <ArrowRight />
                  <div className="flex flex-col items-start relative z-10">
                    <span
                      className="text-[15px] font-bold"
                      onMouseEnter={() => setState('hover')}
                      onMouseLeave={() => setState('idle')}>
                      Set up in minutes
                    </span>
                  </div>
                </Button>
                <Button className="px-5 py-6 h-[40px] rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-[15px] font-medium text-foreground">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Built with your familiar tech stack */}
        <TechStack />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works */}
        <section className="py-20" id="how-it-works" aria-labelledby="how-it-works-heading">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <div className="space-y-2" style={{ marginBottom: 50 }}>
                <h2
                  id="how-it-works-heading"
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Seamless dApps Integrations
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Our platform is designed with user experience in mind, making it easy to integrate
                  with your dApps.
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12 items-start">
              {[
                {
                  image: '/jumbotron/configure-agent.png',
                  title: 'Create Agents and Workflows',
                  description:
                    'Create custom agents and workflows to handle complex tasks and automate workflows.',
                },
                {
                  image: '/jumbotron/install-widget.png',
                  title: 'Integrate and Customize Widgets',
                  description: 'Integrate and customize widgets to match your needs.',
                },
                {
                  image: '/jumbotron/assign-workflow.png',
                  title: 'Provide Instructions for the Agents',
                  description:
                    'Provide clear instructions for the agents to onboard users based on their journey in the app.',
                },
              ].map(({ image, title, description }, index) => (
                <div key={index} className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex h-[400px] w-full items-center justify-center rounded-full cursor-pointer hover:bg-primary transition-colors duration-300 text-primary-foreground">
                    <img src={image} alt={title} />
                  </div>
                  <div style={{ marginTop: 85 }}>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Feature Banner */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
          aria-labelledby="key-features-heading">
          <CssGridBackground />
          <FramerSpotlight />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <div className="space-y-2">
                <h2
                  id="key-features-heading"
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
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
                <img
                  src="/banners/dashboard-banner.png"
                  width={1280}
                  height={720}
                  alt="Suite dashboard"
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Use Cases */}
        <UseCases />

        {/* Testimonials */}
        {/* <Testimonials /> */}

        {/* Contact/Pricing Section */}
        {/* <section
          id="contact"
          className="py-20 bg-muted/50 dark:bg-muted/10"
          aria-labelledby="contact-heading">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2
                    id="contact-heading"
                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Custom Enterprise Pricing
                  </h2>
                  <p className="text-muted-foreground md:text-xl">
                    We offer tailored pricing packages for enterprises and government agencies based
                    on your specific needs and scale.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Unlimited users with role-based access control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <span>Customizable knowledge base size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>Access to all LLM models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Enterprise-grade security and compliance</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="font-medium">
                    Contact us for a personalized quote and to discuss your specific requirements.
                  </p>
                </div>
              </div>
              <div className="lg:ml-10">
                <ContactForm />
              </div>
            </div>
          </div>
        </section> */}

        <Footer />
      </div>
    </>
  );
}
