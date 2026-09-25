import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';
// A11Y: MotionConfig lets these animations respect the OS "reduce motion" setting.
import { motion, MotionConfig } from 'framer-motion';
import { ArrowRight, ChevronDown, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Reused from Services.jsx so the homepage section and this page stay
// consistent when the API hasn't responded yet.
const fallbackServices = [
    {
        id: 1,
        title: 'Web Designing & Hosting',
        description: 'Professional web development services with secure, high-speed architecture.',
        iconUrl: null,
    },
    {
        id: 2,
        title: 'Ecommerce Solutions',
        description: 'Full range of Search Engine Optimization and E-commerce platform implementations.',
        iconUrl: null,
    },
    {
        id: 3,
        title: 'IT Infrastructure & WIFI Solutions',
        description: 'Key value drivers for enterprise environments requiring flexible, secure networks.',
        iconUrl: null,
    },
    {
        id: 4,
        title: 'Cloud Based Solutions',
        description: 'High-availability multi-cloud orchestration engineered for seamless scalability.',
        iconUrl: null,
    },
];

function ServiceCard({ service, index }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongDescription = service.description.length > 110;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group rounded-2xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm hover:border-emerald-500/35 transition-all duration-300 flex flex-col justify-between h-full shadow-xl"
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    {/* A11Y: icon is decorative — the title text below already names the service */}
                    <div aria-hidden="true" className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-center shadow-inner text-emerald-400 backdrop-blur-md">
                        {service.iconUrl ? (
                            <div
                                className="w-6 h-6 bg-emerald-400 group-hover:bg-emerald-300 transition-colors"
                                style={{
                                    maskImage: `url(${service.iconUrl})`,
                                    WebkitMaskImage: `url(${service.iconUrl})`,
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                }}
                            />
                        ) : (
                            <Layers className="h-6 w-6" />
                        )}
                    </div>
                    {/* A11Y: index badge is decorative, not reading content */}
                    <span aria-hidden="true" className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                </div>

                {/* A11Y: h3 -> h2 so headings descend sequentially after the page's single h1
                    (fixes "Heading elements are not in a sequentially-descending order") */}
                <h2 className="text-xl font-bold text-white tracking-tight mb-3 font-sans">
                    {service.title}
                </h2>

                <div className="text-zinc-400 text-sm mb-4 leading-relaxed relative font-sans">
                    <p className={`${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}>
                        {service.description}
                    </p>

                    {isLongDescription && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded}
                            // A11Y: focus:outline-none previously removed the focus indicator with
                            // nothing to replace it; focus-visible:ring restores one for keyboard users.
                            className="mt-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded cursor-pointer"
                        >
                            <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                            <ChevronDown aria-hidden="true" className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">

                {/* A11Y: every card repeats "INITIATE PROJECT" verbatim; aria-label gives each
                    link a distinct accessible name (fixes "Identical links have the same purpose") */}
                <a href="/#contact"
                    aria-label={`Initiate project: ${service.title}`}
                    className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
                >
                    <span>INITIATE PROJECT</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
            </div>
        </motion.div>
    );
}

export default function ServicesPage() {
    const { data } = useQuery({
        queryKey: ['servicesPageData'],
        queryFn: async () => {
            const [servicesRes, pageRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/services?populate=*`),
                fetch(`${API_BASE_URL}/api/service-page?populate=seo`)
            ]);

            const servicesJson = servicesRes.ok ? await servicesRes.json() : { data: [] };
            const pageJson = pageRes.ok ? await pageRes.json() : null;

            const fetchedServices = servicesJson?.data;
            const formattedServices = Array.isArray(fetchedServices)
                ? fetchedServices.map(item => {
                    const attr = item.attributes || item;
                    const iconData = attr.Icon || attr.icon;
                    const rawUrl =
                        typeof iconData === 'string' ? iconData :
                            iconData?.url ||
                            iconData?.data?.url ||
                            iconData?.data?.attributes?.url;

                    const iconUrl = rawUrl
                        ? (rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL.replace('/api', '')}${rawUrl}`)
                        : null;

                    return {
                        id: item.id,
                        title: attr.Title || attr.title || '',
                        description: attr.Description || attr.description || '',
                        iconUrl: iconUrl,
                    };
                })
                : [];

            const fetchedPageData = pageJson?.data;
            const pageContent = fetchedPageData ? (fetchedPageData.attributes || fetchedPageData) : {};

            return {
                services: formattedServices.length > 0 ? formattedServices : fallbackServices,
                pageContent,
            };
        },
        // PERFORMANCE FIX: keep the previously-rendered data on screen across
        // refetches instead of clearing it, so there's never a moment with
        // nothing to render
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // PERFORMANCE FIX: no isLoading gate — render fallback content
    // immediately on first paint, then it's replaced in place once the
    // Render-hosted API responds. Removes this page from the network
    // dependency chain the same way Home.jsx was fixed.
    const services = data?.services ?? fallbackServices;
    const pageContent = data?.pageContent || {};

    return (
        <MotionConfig reducedMotion="user">
            {/* A11Y: <main> landmark (fixes "Document does not have a main landmark") */}
            {/* Expanded max-w container from max-w-6xl to max-w-7xl to comfortably fit 4 columns */}
            <main className="min-h-screen bg-black text-white pt-28 pb-16 px-6 sm:px-8 max-w-7xl mx-auto relative overflow-hidden selection:bg-emerald-500 selection:text-black font-sans">
                <SEO
                    title={pageContent.seo?.metaTitle || pageContent.Title || "Services"}
                    description={pageContent.seo?.metaDescription || pageContent.Description || "Explore engineered technical services and solutions."}
                    path="/services"
                />

                {/* A11Y: purely decorative, hidden from assistive tech */}
                <div aria-hidden="true" className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
                <div aria-hidden="true" className="absolute top-2/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

                <div className="mb-16 border-b border-white/10 pb-8">

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-sans">
                        {pageContent.Heading || 'Engineered solutions for '}
                        <span className="text-emerald-400">
                            {pageContent.HeadingHighlight || 'scale.'}
                        </span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl text-sm sm:text-base font-sans leading-relaxed">
                        {pageContent.Description || 'Comprehensive technical services tailored for high-growth startups and enterprise organizations.'}
                    </p>
                </div>

                {/* Updated main services grid to show 4 columns on large screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
                    {services.map((service, index) => (
                        <ServiceCard key={service.id || index} service={service} index={index} />
                    ))}
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-black p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 font-sans">
                            Ready to build something <span className="text-emerald-400">extraordinary?</span>
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base mb-8 font-sans">
                            Let's discuss your project requirements, architecture scoping, and implementation timelines.
                        </p>
                        <Link
                            to="/about"
                            className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-mono font-semibold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            <span>GET IN TOUCH</span>
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>
        </MotionConfig>
    );
}