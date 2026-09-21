import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export default function Work({ data }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackProjects = [
        {
            id: 1,
            Category: 'FINTECH PLATFORM',
            Title: 'THE AURA ENGINE',
            Description: 'High-frequency algorithmic trading dashboard with real-time risk telemetry.',
            LiveUrl: '#',
            Thumbnail: { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' },
            tags: [{ tagName: 'React' }, { tagName: 'TypeScript' }]
        },
        {
            id: 2,
            Category: 'CLOUD TELEMETRY',
            Title: 'THE PINEWOOD MESH',
            Description: 'Distributed microservices monitoring tool tracking live server health.',
            LiveUrl: '#',
            Thumbnail: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' },
            tags: [{ tagName: 'Next.js' }, { tagName: 'GraphQL' }]
        },
        {
            id: 3,
            Category: 'AI WORKFLOW',
            Title: 'THE STONE RIDGE AI',
            Description: 'Enterprise AI orchestrator enabling automated document analysis pipelines.',
            LiveUrl: '#',
            Thumbnail: { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80' },
            tags: [{ tagName: 'Python' }, { tagName: 'FastAPI' }]
        },
        {
            id: 4,
            Category: 'CYBERSECURITY',
            Title: 'VANGUARD VAULT',
            Description: 'End-to-end encrypted asset portal with automated compliance auditing.',
            LiveUrl: '#',
            Thumbnail: { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
            tags: [{ tagName: 'Docker' }, { tagName: 'WebAuthn' }]
        }
    ];

    useEffect(() => {
        if (data && data.length > 0) {
            setProjects(data);
            setLoading(false);
            return;
        }

        if (!API_BASE_URL) {
            setProjects(fallbackProjects);
            setLoading(false);
            return;
        }

        fetch(`${API_BASE_URL}/api/work-sections?populate=*`)
            .then(res => res.json())
            .then(response => {
                const rawData = response?.data;
                if (Array.isArray(rawData) && rawData.length > 0) {
                    const formatted = rawData.map(item => {
                        const attr = item.attributes || item;
                        return {
                            id: item.id,
                            Category: attr.Category || attr.category || '',
                            Title: attr.Title || attr.title || '',
                            Description: attr.Description || attr.description || '',
                            LiveUrl: attr.LiveUrl || attr.liveUrl || '#',
                            Thumbnail: attr.Thumbnail?.data?.attributes || attr.Thumbnail || null,
                            tags: attr.tags || attr.Tags || []
                        };
                    });
                    setProjects(formatted);
                } else {
                    setProjects(fallbackProjects);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error while fetching Work sections from Strapi, using fallback:', err);
                setProjects(fallbackProjects);
                setLoading(false);
            });
    }, [data]);

    useEffect(() => {
        if (!isAutoPlaying || projects.length === 0) return;
        const interval = setInterval(() => {
            handleNext();
        }, 3500);
        return () => clearInterval(interval);
    }, [activeIndex, isAutoPlaying, projects.length]);

    const handleNext = () => {
        if (projects.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % projects.length);
    };

    const handlePrev = () => {
        if (projects.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const getCardTransform = (index) => {
        const total = projects.length;
        let diff = (index - activeIndex + total) % total;

        if (diff > total / 2) diff -= total;

        if (diff === 0) {
            return {
                x: '0%',
                scale: 1,
                zIndex: 30,
                opacity: 1,
                filter: 'brightness(1) blur(0px)',
            };
        } else if (diff === 1 || diff === -(total - 1)) {
            return {
                x: '68%',
                scale: 0.8,
                zIndex: 20,
                opacity: 0.45,
                filter: 'brightness(0.5) blur(1px)',
            };
        } else if (diff === -1 || diff === total - 1) {
            return {
                x: '-68%',
                scale: 0.8,
                zIndex: 20,
                opacity: 0.45,
                filter: 'brightness(0.5) blur(1px)',
            };
        } else {
            return {
                x: diff > 0 ? '130%' : '-130%',
                scale: 0.6,
                zIndex: 10,
                opacity: 0,
                filter: 'brightness(0.2) blur(4px)',
            };
        }
    };

    return (
        <section
            id="work"
            className="relative min-h-screen w-full bg-black py-12 pt-20 scroll-mt-12 text-white overflow-hidden flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="absolute top-1/4 left-1/3 -z-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 -z-10 h-64 w-64 rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full px-6 sm:px-8 mb-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center space-x-2.5 rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 mb-3">
                        <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-emerald-400 uppercase">
                            PORTFOLIO // 02
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug bg-gradient-to-r from-white via-gray-100 to-emerald-200 bg-clip-text text-transparent font-sans">
                        Engineered for <span className="text-emerald-400">performance.</span>
                    </h2>
                </div>

                <a
                    href="/works"
                    className="inline-flex items-center space-x-3 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-mono font-semibold tracking-[0.1em] text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer self-start sm:self-auto"
                >
                    <span>VIEW ALL WORKS</span>
                    <span className="text-sm">→</span>
                </a>
            </div>

            {loading ? (
                <div className="relative w-full max-w-6xl mx-auto h-[320px] sm:h-[380px] flex items-center justify-center my-auto px-4">
                    <div className="w-[85vw] max-w-[460px] aspect-[16/10] rounded-2xl border border-white/10 bg-zinc-900/40 p-6 flex flex-col justify-between animate-pulse">
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-white/10 rounded-full" />
                            <div className="h-5 w-16 bg-white/10 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-white/10 rounded font-mono" />
                            <div className="h-6 w-3/4 bg-white/10 rounded font-sans" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative w-full max-w-6xl mx-auto h-[320px] sm:h-[380px] flex items-center justify-center my-auto px-4">
                    {projects.map((project, index) => {
                        const transform = getCardTransform(index);
                        const isActive = index === activeIndex;
                        const rawUrl = project.Thumbnail?.url;
                        const baseClean = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
                        const imgURL = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${baseClean}${rawUrl}`) : null;
                        const tagsList = project.tags || [];

                        return (
                            <motion.div
                                key={project.id || index}
                                initial={false}
                                animate={{
                                    x: transform.x,
                                    scale: transform.scale,
                                    opacity: transform.opacity,
                                    zIndex: transform.zIndex,
                                    filter: transform.filter,
                                }}
                                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                                onClick={() => setActiveIndex(index)}
                                className={`absolute w-[85vw] max-w-[360px] sm:max-w-[460px] aspect-[16/10] rounded-2xl overflow-hidden border bg-zinc-900/40 backdrop-blur-sm shadow-xl cursor-pointer transition-colors duration-300 ${isActive ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {imgURL ? (
                                    <img
                                        src={imgURL}
                                        alt={project.Title ? `${project.Title} project screenshot` : 'Project screenshot'}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-300 text-xs font-mono">
                                        NO IMAGE UPLOADED
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                                <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                                    <div className="flex gap-2">
                                        {tagsList.map((tag, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className="rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md"
                                            >
                                                {tag.tagName || tag.Name || tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-4 inset-x-4 flex items-end justify-between">
                                    <div>
                                        <div className="text-[10px] font-mono text-gray-300 tracking-widest uppercase mb-1">
                                            0{index + 1} // {project.Category}
                                        </div>
                                        <h3 className="text-base sm:text-xl font-bold text-white tracking-tight uppercase font-sans">
                                            {project.Title}
                                        </h3>
                                    </div>

                                    {isActive && (
                                        <motion.a
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            href={project.LiveUrl || '#'}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-md backdrop-blur-md"
                                        >
                                            <span>View project</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </motion.a>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col items-center justify-center gap-2 z-30 mt-2 pb-6">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handlePrev}
                        className="h-10 w-10 rounded-lg border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all backdrop-blur-sm active:scale-95 shadow-md"
                        aria-label="Previous Slide"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="h-10 w-10 rounded-lg border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all backdrop-blur-sm active:scale-95 shadow-md"
                        aria-label="Next Slide"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                    CLICK ARROWS OR CARDS TO NAVIGATE
                </span>
            </div>
        </section>
    );
}