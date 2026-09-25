import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';
// PERF: `m` + LazyMotion loads only the animation features actually used
// (smaller bundle than the full `motion` component).
// A11Y: MotionConfig reducedMotion="user" respects the OS "reduce motion" setting.
import { LazyMotion, domAnimation, m, MotionConfig } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
// PERF: requires `vite-imagetools` (npm i -D vite-imagetools, then add imagetools()
// to the plugins array in vite.config). Serves ~2x display-size WebP instead of full PNGs.
import epicon from '../assets/epicon.png?format=webp&h=288&quality=80'
import goal from '../assets/goal.png?format=webp&h=288&quality=80'
import sarkars from '../assets/sarkars.png?format=webp&h=288&quality=80'
import zodiac from '../assets/zodiac.png?format=webp&h=288&quality=80'

// PERF: intrinsic size hints so the browser reserves space (fixes the
// "Image elements do not have explicit width and height" diagnostic).
// Adjust to your real thumbnail aspect ratio if it differs.
const IMG_WIDTH = 400;
const IMG_HEIGHT = 288;

const defaultProjects = [
    {
        id: 1,
        Category: 'FINTECH',
        Title: 'EPICON GLOBAL',
        description: 'High-frequency algorithmic trading dashboard with real-time risk telemetry.',
        tags: [{ tagName: 'React' }, { tagName: 'TypeScript' }],
        Thumbnail: epicon,
        LiveUrl: '#',
    },
    {
        id: 2,
        Category: 'CLOUD',
        Title: 'GOAL PETROLEUM',
        description: 'Distributed microservices monitoring tool tracking live server health.',
        tags: [{ tagName: 'Next.js' }, { tagName: 'GraphQL' }],
        Thumbnail: goal,
        LiveUrl: '#',
    },
    {
        id: 3,
        Category: 'SARKARS',
        Title: 'SARKARS',
        description: 'Enterprise AI orchestrator enabling automated document analysis pipelines.',
        tags: [{ tagName: 'Python' }, { tagName: 'FastAPI' }],
        Thumbnail: sarkars,
        LiveUrl: '#',
    },
    {
        id: 4,
        Category: 'SECURITY',
        Title: 'ZODIAC HOLIDAYS',
        description: 'End-to-end encrypted asset portal with automated compliance auditing.',
        tags: [{ tagName: 'Docker' }, { tagName: 'WebAuthn' }],
        Thumbnail: zodiac,
        LiveUrl: '#',
    },
];

export default function WorksPage() {
    // Fetch projects using TanStack Query
    const { data: projects = defaultProjects } = useQuery({
        queryKey: ['work-sections-archive'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/work-sections?populate=*`);
            if (!res.ok) {
                throw new Error('Failed to fetch projects');
            }
            const response = await res.json();
            const fetchedProjects = response?.data;

            if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
                return fetchedProjects.map(item => {
                    const attr = item.attributes || item;
                    return {
                        id: item.id,
                        Category: attr.Category || attr.category || '',
                        Title: attr.Title || attr.title || '',
                        description: attr.Description || attr.description || '',
                        tags: attr.tags || attr.Tags || [],
                        Thumbnail: attr.Thumbnail?.data?.attributes || attr.Thumbnail || null,
                        LiveUrl: attr.LiveUrl || attr.liveUrl || '#',
                    };
                });
            }

            return defaultProjects;
        },
        // PERFORMANCE FIX: keep previously-resolved data on screen across
        // refetches instead of it ever reverting to undefined
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5, // Cache project list for 5 minutes
    });

    return (
        <MotionConfig reducedMotion="user">
            <LazyMotion features={domAnimation}>
                {/* A11Y: <main> landmark (fixes "Document does not have a main landmark") */}
                <main className="min-h-screen bg-black text-white pt-24 pb-16 px-6 sm:px-8 max-w-6xl mx-auto selection:bg-emerald-500 selection:text-black font-sans">
                    <SEO
                        title="All Works Archive"
                        description="A complete repository of engineered platforms, applications, and full-stack systems."
                        path="/works"
                    />

                    {/* A11Y: purely decorative, hidden from assistive tech */}
                    <div aria-hidden="true" className="absolute top-1/4 left-1/3 -z-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
                    <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />

                    <div className="mb-10 border-b border-white/10 pb-6 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-emerald-200 bg-clip-text text-transparent font-sans">
                                All <span className="text-emerald-400">works.</span>
                            </h1>
                        </div>
                        {/* A11Y: text-zinc-500 -> text-zinc-400 for WCAG AA contrast (4.5:1) */}
                        <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
                            MODULES_TOTAL: {projects.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {projects.map((project, index) => {
                            const rawImageUrl = project.Thumbnail?.url;
                            const baseClean = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : '';
                            const imageUrl = rawImageUrl?.startsWith('http')
                                ? rawImageUrl
                                : rawImageUrl
                                    ? `${baseClean}${rawImageUrl}`
                                    : (typeof project.Thumbnail === 'string' ? project.Thumbnail : null);

                            return (
                                <m.div
                                    key={project.id || index}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/30 transition-all duration-300 flex flex-col sm:flex-row shadow-xl"
                                >
                                    <div className="relative sm:w-5/12 aspect-[16/9] sm:aspect-auto bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-950/50 flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-white/5 overflow-hidden">
                                        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />

                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={project.Title ? `${project.Title} preview` : 'Project preview'}
                                                width={IMG_WIDTH}
                                                height={IMG_HEIGHT}
                                                // PERF: first card is the likely LCP element, so it must NOT be
                                                // lazy-loaded. Everything below the fold stays lazy.
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                // React 19: fetchPriority. On React 18 use lowercase `fetchpriority`.
                                                fetchPriority={index === 0 ? 'high' : undefined}
                                                decoding="async"
                                                // w-auto h-auto keeps the original sizing behaviour now that
                                                // width/height attributes are present.
                                                className="w-auto h-auto max-h-36 max-w-full object-contain relative z-0 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                                            />
                                        ) : (
                                            <div className="text-[10px] font-mono text-zinc-400 z-0 tracking-widest">NO PREVIEW</div>
                                        )}

                                        <span aria-hidden="true" className="absolute top-3 left-3 z-20 text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-black/60 text-zinc-400 backdrop-blur-md">
                                            SYS_0{index + 1}
                                        </span>
                                    </div>

                                    <div className="p-6 sm:w-7/12 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">
                                                    {project.Category}
                                                </span>
                                                <div className="flex gap-1.5 flex-wrap justify-end">
                                                    {project.tags?.slice(0, 2).map((tagObj, tIdx) => (
                                                        <span
                                                            key={tIdx}
                                                            className="rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 text-[9px] font-mono text-zinc-300 backdrop-blur-md"
                                                        >
                                                            {typeof tagObj === 'string' ? tagObj : tagObj?.tagName || tagObj?.Name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* A11Y: h3 -> h2 so headings descend sequentially (h1 -> h2) */}
                                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase font-sans">
                                                {project.Title}
                                            </h2>

                                            <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed font-sans">
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-white/5 flex items-center justify-end">

                                            <a href={project.LiveUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                // A11Y: unique accessible name per link (still contains the visible
                                                // text "Live Preview") and tells users it opens a new tab.
                                                aria-label={`Live preview of ${project.Title} (opens in a new tab)`}
                                                className="inline-flex items-center space-x-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-md backdrop-blur-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                            >
                                                <span>Live Preview</span>
                                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                            </a>
                                        </div>
                                    </div>
                                </m.div>
                            );
                        })}
                    </div>
                </main>
            </LazyMotion>
        </MotionConfig>
    );
}