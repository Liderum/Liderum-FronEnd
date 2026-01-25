
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ModulosSection from '../components/ModulosSection';
import ChartShowcase from '../components/ChartShowcase';
import Beneficios from '../components/Beneficios';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

const Index = () => {
  useSessionCleanup();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ModulosSection />
        <ChartShowcase />
        <Beneficios />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
