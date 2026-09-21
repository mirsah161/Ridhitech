import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const TOTAL_FRAMES = 200;

const currentFrame = (index) =>
    `${import.meta.env.BASE_URL}lapFrames/frame-${index.toString().padStart(4, '0')}.webp`;

export default function Services({ data }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const canvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 });

    const [images, setImages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [shouldLoad, setShouldLoad] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const frameStep = isMobile ? 2 : 1;

    const fallbackServices = [
        {
            id: 1,
            Title: 'Web Designing & Hosting',
            Description: 'Professional web development services with secure, high-speed architecture.',
        },
        {
            id: 2,
            Title: 'Ecommerce Solutions',
            Description: 'Full range of Search Engine Optimization and E-commerce platform implementations.',
        },
        {
            id: 3,
            Title: 'IT Infrastructure & WIFI Solutions',
            Description: 'Key value drivers for enterprise environments requiring flexible, secure networks.',
        },
        {
            id: 4,
            Title: 'Cloud Based Solutions',
            Description: 'High-availability multi-cloud orchestration engineered for seamless scalability.',
        },
    ];

    const rawServices = data && data.length > 0 ? data : fallbackServices;

    const services = rawServices.slice(0, 4).map((item) => {
        const attr = item.attributes || item;
        const iconField = attr.icon?.data?.attributes?.url || attr.icon?.url || attr.icon;
        const iconUrl = iconField ? (iconField.startsWith('http') ? iconField : `${API_BASE_URL.replace('/api', '')}${iconField}`) : null;

        return {
            id: item.id || Math.random(),
            title: attr.Title || attr.title || '',
            description: attr.Description || attr.description || '',
            iconUrl: iconUrl,
        };
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    useEffect(() => {
        if (!shouldLoad) return;

        let loadedCount = 0;
        const totalToLoad = Math.ceil(TOTAL_FRAMES / frameStep);
        const imgMap = {};
        let isCancelled = false;

        for (let i = 1; i <= TOTAL_FRAMES; i += frameStep) {
            const img = new Image();
            img.src = currentFrame(i);

            const handleLoad = () => {
                if (isCancelled) return;
                loadedCount++;

                const pct = Math.round((loadedCount / totalToLoad) * 100);
                if (pct % 10 === 0 || loadedCount === totalToLoad) {
                    setLoadProgress(pct);
                }

                if (loadedCount === totalToLoad) {
                    setIsLoaded(true);
                }
            };

            img.onload = handleLoad;
            img.onerror = handleLoad;
            imgMap[i - 1] = img;
        }

        setImages(imgMap);

        return () => {
            isCancelled = true;
        };
    }, [shouldLoad, frameStep]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const updateCanvasDimensions = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (ctx) ctx.scale(dpr, dpr);

            canvasSizeRef.current = { width, height, dpr };
        };

        updateCanvasDimensions();
        window.addEventListener('resize', updateCanvasDimensions, { passive: true });

        return () => window.removeEventListener('resize', updateCanvasDimensions);
    }, []);

    useEffect(() => {
        if (!isLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });

        const render = (index) => {
            let frameNum = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(index)));

            if (frameStep > 1) {
                frameNum = Math.floor(frameNum / frameStep) * frameStep;
            }

            const img = images[frameNum];
            const { width, height } = canvasSizeRef.current;

            if (img && img.complete && img.naturalWidth !== 0 && width > 0) {
                const hRatio = width / img.width;
                const vRatio = height / img.height;
                const ratio = Math.max(hRatio, vRatio);

                const centerShiftX = (width - img.width * ratio) / 2;
                const centerShiftY = (height - img.height * ratio) / 2;

                context.clearRect(0, 0, width, height);
                context.drawImage(
                    img,
                    0,
                    0,
                    img.width,
                    img.height,
                    centerShiftX,
                    centerShiftY,
                    img.width * ratio,
                    img.height * ratio
                );
            }
        };

        let animationFrameId;
        const unsubscribe = frameIndex.on('change', (latest) => {
            animationFrameId = window.requestAnimationFrame(() => render(latest));
        });

        render(frameIndex.get());

        return () => {
            if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
            unsubscribe();
        };
    }, [isLoaded, images, frameIndex, frameStep]);

    const serviceTransforms = services.map((_, index) => {
        const stepSize = 1 / services.length;
        const start = index * stepSize;
        const peakStart = start + stepSize * 0.1;
        const peakEnd = start + stepSize * 0.8;
        const end = (index + 1) * stepSize;

        return {
            opacity: useTransform(scrollYProgress, [start, peakStart, peakEnd, end], [0, 1, 1, index === services.length - 1 ? 1 : 0]),
            y: useTransform(scrollYProgress, [start, peakStart, peakEnd, end], [20, 0, 0, -20]),
            display: useTransform(scrollYProgress, (v) => (v < start || (v > end && index !== services.length - 1) ? 'none' : 'block')),
        };
    });

    const progressPercent = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    return (
        <section
            id="solutions"
            ref={containerRef}
            className="relative h-[600vh] bg-black text-white selection:bg-emerald-500 selection:text-black font-sans"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

                {!isLoaded && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white space-y-4 font-mono">
                        <div className="text-sm tracking-widest text-emerald-400 uppercase">
                            LOADING SEQUENCE // {loadProgress}%
                        </div>
                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-400 transition-all duration-150"
                                style={{ width: `${loadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none z-10" />

                <div className="relative z-20 flex h-[calc(100vh-88px)] max-w-7xl mx-auto px-6 sm:px-8 items-start pt-28 sm:pt-30 justify-between pointer-events-none">
                    <div className="relative w-full max-w-xl">
                        {services.map((service, index) => {
                            const transform = serviceTransforms[index] || serviceTransforms[0];
                            const isLastService = index === services.length - 1;
                            const step = `0${index + 1}`;

                            return (
                                <motion.div
                                    key={service.id || step}
                                    style={{
                                        opacity: transform.opacity,
                                        y: transform.y,
                                        display: transform.display,
                                    }}
                                    className="absolute top-0 left-0 w-full space-y-4 pointer-events-auto"
                                >
                                    {service.iconUrl ? (
                                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-center overflow-hidden shadow-inner">
                                            <img
                                                src={service.iconUrl}
                                                alt={service.title}
                                                className="max-h-full max-w-full object-contain filter drop-shadow"
                                            />
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center space-x-2.5 rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-emerald-400 uppercase">
                                                SERVICE // {step}
                                            </span>
                                        </div>
                                    )}

                                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug bg-gradient-to-r from-white via-gray-100 to-emerald-200 bg-clip-text text-transparent font-sans">
                                        {service.title}
                                    </h2>

                                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md font-sans">
                                        {service.description}
                                    </p>

                                    {isLastService && (
                                        <div className="pt-4">
                                            <a
                                                href="/services"
                                                className="inline-flex items-center space-x-3 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-mono font-semibold tracking-[0.1em] text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                                            >
                                                <span>EXPLORE ALL SERVICES</span>
                                                <span className="text-sm">→</span>
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 z-20 flex items-center justify-between max-w-7xl mx-auto text-xs font-mono text-zinc-300">
                    <div className="flex items-center space-x-4">
                        <span>SOLUTIONS SEQUENCE</span>
                        <div className="h-1 w-20 sm:w-24 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-400"
                                style={{ width: progressPercent }}
                            />
                        </div>
                    </div>
                    <span className="hidden sm:block">RIDHITECH INDIA PVT LTD</span>
                </div>
            </div>
        </section>
    );
}