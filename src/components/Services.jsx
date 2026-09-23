import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const TOTAL_FRAMES = 200;

const currentFrame = (index) =>
    `${import.meta.env.BASE_URL}lapFrames/frame-${index.toString().padStart(4, '0')}.webp`;

export default function Services({ data }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const imagesRef = useRef([]);

    // PERFORMANCE OPTIMIZATION: Cache window dimensions to prevent forced reflows / layout thrashing
    const dimensionsRef = useRef({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [shouldLoad, setShouldLoad] = useState(false);

    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < 768
    );

    useEffect(() => {
        const handleBreakpointResize = () => {
            dimensionsRef.current = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleBreakpointResize, { passive: true });
        return () => window.removeEventListener('resize', handleBreakpointResize);
    }, []);

    // PERFORMANCE OPTIMIZATION: Skip more frames on mobile (~50 frames total)
    const frameStep = isMobile ? 4 : 1;

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
            { rootMargin: '1000px' }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Asynchronous non-blocking chunked frame preloader
    useEffect(() => {
        if (!shouldLoad) return;

        let cancelled = false;
        const images = new Array(TOTAL_FRAMES);
        imagesRef.current = images;
        let loaded = 0;

        const targetFrames = [];
        for (let i = 1; i <= TOTAL_FRAMES; i += frameStep) {
            targetFrames.push(i);
        }
        const totalToLoad = targetFrames.length;

        const loadFrame = (index) => new Promise((resolve) => {
            if (images[index - 1]?.complete && images[index - 1]?.naturalWidth) {
                resolve(images[index - 1]);
                return;
            }
            const img = new Image();
            img.decoding = 'async';
            img.src = currentFrame(index);
            const done = () => {
                loaded += 1;
                if (!cancelled) {
                    setLoadProgress(Math.round((loaded / totalToLoad) * 100));
                }
                resolve(img);
            };
            img.onload = done;
            img.onerror = done;
            images[index - 1] = img;
        });

        loadFrame(targetFrames[0]).then(() => {
            if (cancelled) return;
            setIsLoaded(true);

            const run = async () => {
                const batchSize = isMobile ? 2 : 10;
                for (let i = 1; i < targetFrames.length && !cancelled; i += batchSize) {
                    const batch = targetFrames.slice(i, i + batchSize);
                    await Promise.all(batch.map((frameNum) => loadFrame(frameNum)));
                    await new Promise(r => setTimeout(r, isMobile ? 30 : 10));
                }
            };

            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(run, { timeout: 1000 });
            } else {
                setTimeout(run, 100);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [shouldLoad, frameStep, isMobile]);

    const render = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = contextRef.current || canvas.getContext('2d', { alpha: false });
        if (!context) return;
        contextRef.current = context;

        let frameNum = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(index)));

        if (frameStep > 1) {
            frameNum = Math.floor(frameNum / frameStep) * frameStep;
        }

        let img = imagesRef.current[frameNum];

        if (!img?.complete || !img?.naturalWidth) {
            for (let distance = 1; distance < TOTAL_FRAMES; distance += 1) {
                const previous = imagesRef.current[frameNum - distance];
                const next = imagesRef.current[frameNum + distance];
                if (previous?.complete && previous.naturalWidth) { img = previous; break; }
                if (next?.complete && next.naturalWidth) { img = next; break; }
            }
        }
        if (!img?.naturalWidth) return;

        // Use cached dimensions to completely eliminate forced reflows / layout thrashing
        const { width, height } = dimensionsRef.current;
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.5);
        const targetWidth = Math.round(width * dpr);
        const targetHeight = Math.round(height * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

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
    }, [isMobile, frameStep]);

    useEffect(() => {
        if (!shouldLoad) return;
        let raf = 0;
        const unsubscribe = frameIndex.on('change', (latest) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => render(latest));
        });

        render(frameIndex.get());

        return () => {
            cancelAnimationFrame(raf);
            unsubscribe();
        };
    }, [shouldLoad, frameIndex, render]);

    // INTRO TEXT TRANSFORM: Fades out completely in the first 15% of the scroll
    const introOpacity = useTransform(scrollYProgress, [0, 0.12, 0.18], [1, 1, 0]);
    const introY = useTransform(scrollYProgress, [0, 0.18], [0, -40]);
    const introDisplay = useTransform(scrollYProgress, (v) => (v > 0.2 ? 'none' : 'flex'));

    // SERVICES TRANSFORMS: Shifted forward so they start after intro text fades out
    const serviceTransforms = services.map((_, index) => {
        const totalSlice = 0.85;
        const startOffset = 0.15;
        const stepSize = totalSlice / services.length;
        const start = startOffset + index * stepSize;
        const peakStart = start + stepSize * 0.1;
        const peakEnd = start + stepSize * 0.8;
        const end = startOffset + (index + 1) * stepSize;

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
                <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />

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

                {/* HARDCODED INTRO TEXT OVERLAY */}
                <motion.div
                    style={{
                        opacity: introOpacity,
                        y: introY,
                        display: introDisplay,
                    }}
                    className="absolute inset-0 z-20 max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center items-start pointer-events-none"
                >
                    <div className="space-y-4 max-w-2xl">
                        <span className="text-xs font-mono font-medium tracking-[0.2em] text-emerald-400 uppercase">
                            EXPERTISE & CAPABILITIES
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-gray-200 to-emerald-300 bg-clip-text text-transparent">
                            Our Services
                        </h1>
                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-sans">
                            Engineered for high performance, security, and scalability. Scroll down to explore our core solutions package.
                        </p>
                        <div className="pt-2 text-xs font-mono text-zinc-500 flex items-center space-x-2">
                            <span>SCROLL TO BEGIN</span>
                            <span className="animate-bounce">↓</span>
                        </div>
                    </div>
                </motion.div>

                {/* DYNAMIC SERVICES SEQUENCE */}
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
                                        <div className="inline-flex items-center space-x-2.5">
                                            <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-emerald-400 uppercase">
                                                {step}
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