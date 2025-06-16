'use client';

import IntentSuggestion from '@/components/defi/intent-suggestion';
import KnowYourDapp from '@/components/defi/kyd';
import Persona from '@/components/defi/persona';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { StructuredData } from '@/components/structured-data';
import DemoInstallationSection from '@/components/widget-installation-section';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

import { GrowlyComponent } from '@getgrowly/suite';
import { AnimatedBusterLoading } from '@getgrowly/ui';

import { Hero } from './hero';

const CURRENT_ETHEREUM_WALLET_COUNT = 323452456;

export function AnimatedLine() {
  return (
    <div
      className="flex items-center justify-center rotate-90 relative"
      style={{ marginTop: 0, marginBottom: 50, height: '150px' }} // adjust height if needed
    >
      {/* Line */}
      <div className="w-36 h-[2px] bg-gradient-to-r from-transparent to-gray-400 shadow-md rounded-full" />

      {/* Dot */}
      <div
        className="absolute w-2 h-2 bg-gray-400 rounded-full"
        style={{
          animation: 'move-down 1.5s linear infinite',
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col">
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Built with your familiar tech stack */}
        {/* <TechStack /> */}

        {/* Features Section */}
        {/* <FeaturesSection /> */}

        <section id="flow" className="w-full overflow-hidden">
          <div className="container px-4 md:px-6 py-16 md:py-20">
            <div className="flex flex-col space-y-4 items-center justify-center text-center max-w-3xl mx-auto">
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}>
                Understand onchain user personas
              </motion.h2>
              <motion.p
                className="text-muted-foreground md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}>
                Onboarding new users in Web3.0 is hard due to the anonymity of users.
              </motion.p>
              <img
                src="/banners/anonymous-wallet-banner.png"
                style={{
                  marginTop: 50,
                  maxWidth: '1000px',
                  height: 'auto',
                  objectFit: 'cover',
                }}
              />
              <motion.h3
                className="text-2xl tracking-tighter sm:text-4xl md:text-5xl"
                style={{ marginTop: -100 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}>
                There are{' '}
                <CountUp
                  className="text-primary"
                  enableScrollSpy
                  end={CURRENT_ETHEREUM_WALLET_COUNT}
                  duration={2}
                  separator=","
                />{' '}
                wallets on Ethereum mainnet.
              </motion.h3>
            </div>
          </div>
        </section>

        <div
          className="flex items-center justify-center rotate-90"
          style={{ marginTop: 0, marginBottom: 90 }}>
          <div className="w-36 h-[2px] bg-gradient-to-r from-transparent to-primary/50 shadow-md rounded-full" />
        </div>

        <div className="flex flex-wrap space-4 items-center justify-center border py-10">
          <AnimatedBusterLoading width={200} height={200} />
          <h1 className="text-4xl font-bold text-primary tracking-tighter sm:text-3xl md:text-4xl">
            Analyzing Onchain Data...
          </h1>
        </div>

        <div
          className="flex items-center justify-center rotate-90"
          style={{ marginTop: 70, marginBottom: 50 }}>
          <div className="w-36 h-[2px] bg-gradient-to-r from-transparent to-primary/50 shadow-md rounded-full" />
          <div className="w-5 h-5 bg-primary rounded-full shadow-md" />
        </div>

        {/* Installation Section */}
        <DemoInstallationSection />

        <div
          className="flex items-center justify-center rotate-90"
          style={{ marginTop: 20, marginBottom: 50 }}>
          <div className="w-36 h-[2px] bg-gradient-to-r from-transparent to-primary/50 shadow-md rounded-full" />
          <div className="w-5 h-5 bg-primary rounded-full shadow-md" />
        </div>

        {/* Key Feature Banner */}
        {/* <KeyFeature/> */}

        {/* DeFi Specialization */}
        <section
          className="py-20"
          id="defi-specialization"
          aria-labelledby="defi-specialization-heading">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <div className="space-y-2" style={{ marginBottom: 50 }}>
                <h2
                  id="defi-specialization-heading"
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Unlock Web3 Insights
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Powerful tools to understand dApps, analyze on-chain activities, and get
                  personalized recommendations
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12 items-start">
              {[
                {
                  component: <KnowYourDapp />,
                  title: 'Know Your dApp (KYD)',
                  description:
                    'Feed the AI assistant with everything about the Dapp (GitHub, Gitbook, blogs) so it can easily explain your product to users.',
                },
                {
                  component: <Persona />,
                  title: 'Onchain Persona Analysis',
                  description:
                    'Aggregate multichain transaction data and cross-dApp activities to build a comprehensive risk profile of each user.',
                },
                {
                  component: <IntentSuggestion />,
                  title: 'Intent Suggestion',
                  description:
                    'Simplify DeFi access with data-informed user guidance, and plug-and-play widgets (OnchainKit).',
                },
              ].map(({ component, title, description }, index) => (
                <GrowlyComponent.Div
                  key={index}
                  withUserMessage={false}
                  triggerMessage={`Explain about ${title} feature in Growly Suite: ${description}`}
                  className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex h-[400px] w-full items-center justify-center rounded-full cursor-pointer hover:bg-primary transition-colors duration-300 text-primary-foreground">
                    {component}
                  </div>
                  <div style={{ marginTop: 85 }}>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </GrowlyComponent.Div>
              ))}
            </div>
          </div>
        </section>

        {/* DeFi Use Cases */}
        {/* <UseCasesDefi /> */}
        <Footer />
      </div>
    </>
  );
}
