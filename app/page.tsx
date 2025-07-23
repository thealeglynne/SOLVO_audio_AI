'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Head from 'next/head';

import Header from './components/header'
import Main1 from './components/main1';


function AnimatedSection({
  children,
  className = 'h-screen',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: 'easeOut',
          },
        },
      }}
      className={`snap-start ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>GLYNNE – Automatización Empresarial con IA y Arquitectura Escalable</title>
        <meta name="description" content="GLYNNE es una plataforma empresarial que permite integrar inteligencia artificial y automatización avanzada en cada proceso operativo. Diagnósticos inteligentes, orquestación con agentes IA, dashboards en tiempo real y más." />
        <meta name="keywords" content="GLYNNE, automatización empresarial, inteligencia artificial, RPA, BPA, integración, agentes IA, LangChain, Next.js, arquitectura escalable, orquestación, low-code, no-code, procesos empresariales, eficiencia operativa, Supabase, n8n" />
        <meta name="author" content="GLYNNE Tech" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (para redes sociales y WhatsApp) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GLYNNE – IA para Automatizar tu Empresa" />
        <meta property="og:description" content="Orquesta procesos empresariales con IA: arquitecturas inteligentes, integración de APIs, agentes personalizados y diagnósticos inteligentes." />
        <meta property="og:image" content="https://glynne-ia-6rjd.vercel.app/meta-banner.jpg" />
        <meta property="og:url" content="https://glynne-ia-6rjd.vercel.app/" />
        <meta property="og:site_name" content="GLYNNE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GLYNNE – IA para Automatizar tu Empresa" />
        <meta name="twitter:description" content="Orquestación de procesos empresariales con inteligencia artificial y automatización avanzada." />
        <meta name="twitter:image" content="https://glynne-ia-6rjd.vercel.app/meta-banner.jpg" />

        {/* Canonical */}
        <link rel="canonical" href="https://glynne-ia-6rjd.vercel.app/" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

 
        <div
          className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-white text-black no-scrollbar"
          style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
        >

            <Header />
 

\
          <AnimatedSection>
            <Main1 />
          </AnimatedSection>

          
        </div>
    
    </>
  );
}
