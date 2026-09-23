import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

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
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-center shadow-inner text-emerald-400 backdrop-blur-md">
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
                    <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-3 font-sans">
                    {service.title}
                </h3>

                <div className="text-zinc-400 text-sm mb-4 leading-relaxed relative font-sans">
                    <p className={`${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}>
                        {service.description}
                    </p>

                    {isLongDescription && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                        >
                            <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <a
                    href="/#contact"
                    className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    <span>INITIATE PROJECT</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </a>
            </div>
        </motion.div>
    );
}

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [pageContent, setPageContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        Promise.all([
            fetch(`${API_BASE_URL}/api/services?populate=*`, { signal: controller.signal })
                .then(res => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch services')))),
            fetch(`${API_BASE_URL}/api/service-page?populate=seo`, { signal: controller.signal })
                .then(res => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch page metadata'))))
        ])
            .then(([servicesRes, pageRes]) => {
                const fetchedServices = servicesRes?.data;
                if (Array.isArray(fetchedServices)) {
                    const formatted = fetchedServices.map(item => {
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
                    });
                    setServices(formatted);
                }

                const fetchedPageData = pageRes?.data;
                if (fetchedPageData) {
                    setPageContent(fetchedPageData.attributes || fetchedPageData);
                }

                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching from Strapi:', err);
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-16 px-6 sm:px-8 max-w-6xl mx-auto relative overflow-hidden selection:bg-emerald-500 selection:text-black font-sans">
            <SEO
                title={pageContent.seo?.metaTitle || pageContent.Title || "Services"}
                description={pageContent.seo?.metaDescription || pageContent.Description || "Explore engineered technical services and solutions."}
                path="/services"
            />

            <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute top-2/3 right-1/4 -z-10 h-80 w-80 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

            <div className="mb-16 border-b border-white/10 pb-8">
                <div className="inline-flex items-center space-x-2.5 rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 mb-3">
                    <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-emerald-400 uppercase">
                        {pageContent.Subtitle || 'CAPABILITIES & OFFERINGS'}
                    </span>
                </div>
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

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-64 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                    {services.map((service, index) => (
                        <ServiceCard key={service.id || index} service={service} index={index} />
                    ))}
                </div>
            )}

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
                        className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-mono font-semibold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                        <span>GET IN TOUCH</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}