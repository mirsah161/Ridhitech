import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/WCU';
import Services from '../components/Services';
import Work from '../components/Work';
import { API_BASE_URL } from '../config/api';

export default function Home() {
    const { data } = useQuery({
        queryKey: ['homePageBundle'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/homepage-bundle`);
            const json = res.ok ? await res.json() : null;
            return json?.data || {
                homePage: null,
                aboutSections: null,
                services: [],
                workSections: [],
            };
        },
        staleTime: 1000 * 60 * 5,
        // keep last-known-good data on screen during refetches instead of
        // ever falling back to a loading state after first paint
        placeholderData: (prev) => prev,
    });

    // no isLoading gate — render with whatever we have (empty/fallback
    // on first paint, real data the moment the fetch resolves)
    const homePage = data?.homePage || null;
    const about = data?.aboutSections || null;
    const services = data?.services || [];
    const work = data?.workSections || [];

    const seoData = homePage?.attributes?.seo || homePage?.seo;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black font-sans antialiased">
            <SEO
                title={seoData?.metaTitle || "High-Performance Web & Software Engineering"}
                description={seoData?.metaDescription || "Ridhitech India builds high-throughput systems, zero-trust secure architecture, and scalable web experiences."}
                path="/"
            />
            <main>
                <Hero servicesData={services} />
                <About data={about} />
                <Services data={services} />
                <Work data={work} />
            </main>
        </div>
    );
}