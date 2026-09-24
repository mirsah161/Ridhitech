import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TOTAL_FRAMES = 182;
const framePath = (index) => `/frames/frame-${String(index).padStart(4, '0')}.webp`;

export default function Hero({ servicesData = [] }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const imagesRef = useRef([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // PERFORMANCE OPTIMIZATION: Cache window dimensions to prevent forced reflows / layout thrashing
    const dimensionsRef = useRef({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

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

    // PERFORMANCE FIX: Skip more frames on mobile (e.g., every 4th frame = ~45 frames total)
    // Desktop keeps smooth high-fidelity (every 1st frame)
    const frameStep = isMobile ? 4 : 1;

    const fallbackServices = [
        {
            title: 'Web Designing & Hosting',
            description: 'Professional web development services with secure, high-speed architecture.'
        },
        {
            title: 'Ecommerce Solutions',
            description: 'Full range of Search Engine Optimization and E-commerce platform implementations.'
        },
        {
            title: 'IT Infrastructure & WIFI Solutions',
            description: 'Key value drivers for enterprise environments requiring flexible, secure networks.'
        }
    ];

    const activeServices = servicesData.length > 0
        ? servicesData.slice(0, 3).map(item => {
            const attr = item.attributes || item;
            return {
                title: attr.Title || attr.title,
                description: attr.Description || attr.description
            };
        })
        : fallbackServices;

    while (activeServices.length < 3) {
        activeServices.push(fallbackServices[activeServices.length] || fallbackServices[0]);
    }

    // PERFORMANCE FIX: layoutEffect: false stops Framer Motion from measuring
    // the container's bounding box synchronously inside a layout effect on
    // every scroll tick, which was the source of the "Forced reflow" warning
    // (it was fighting the canvas.width/height writes in render() below for
    // a synchronous layout pass). Measurement now happens in a passive effect.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
        layoutEffect: false,
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Optimized frame loading
    useEffect(() => {
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
            img.src = framePath(index);
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

        // Load the very first frame immediately to display canvas instantly
        loadFrame(targetFrames[0]).then(() => {
            if (cancelled) return;
            setIsLoaded(true);

            // Lazy/background load subsequent frames in smaller batches to save bandwidth
            const run = async () => {
                // Smaller batch size on mobile to prevent network choking
                const batchSize = isMobile ? 2 : 8;
                for (let i = 1; i < targetFrames.length && !cancelled; i += batchSize) {
                    const batch = targetFrames.slice(i, i + batchSize);
                    await Promise.all(batch.map((frameNum) => loadFrame(frameNum)));
                    // Tiny yield to keep mobile main thread silky smooth
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
    }, [isMobile, frameStep]);

    const render = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = contextRef.current || canvas.getContext('2d', { alpha: false });
        if (!context) return;
        contextRef.current = context;

        let frameNum = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(index)));

        // Snap to nearest available stepped frame
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
        // Lower DPR multiplier on mobile to save considerable GPU overhead
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.5);
        const targetWidth = Math.round(width * dpr);
        const targetHeight = Math.round(height * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const ratio = Math.max(width / img.width, height / img.height);
        const drawWidth = img.width * ratio;
        const drawHeight = img.height * ratio;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        context.clearRect(0, 0, width, height);
        context.drawImage(img, x, y, drawWidth, drawHeight);
    }, [isMobile, frameStep]);

    useEffect(() => {
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
    }, [frameIndex, render]);

    // Opacity, Y-offsets, Pointer-events, and Visibility transforms
    const opacityAct1 = useTransform(scrollYProgress, [0, 0.15, 0.20], [1, 1, 0]);
    const yAct1 = useTransform(scrollYProgress, [0, 0.15, 0.20], [0, 0, -20]);
    const pointerAct1 = useTransform(scrollYProgress, (v) => (v > 0.21 ? 'none' : 'auto'));
    const visibilityAct1 = useTransform(scrollYProgress, (v) => (v > 0.21 ? 'hidden' : 'visible'));

    const opacityAct2 = useTransform(scrollYProgress, [0.24, 0.30, 0.50, 0.56], [0, 1, 1, 0]);
    const yAct2 = useTransform(scrollYProgress, [0.24, 0.30, 0.50, 0.56], [20, 0, 0, -20]);
    const pointerAct2 = useTransform(scrollYProgress, (v) => (v < 0.22 || v > 0.58 ? 'none' : 'auto'));
    const visibilityAct2 = useTransform(scrollYProgress, (v) => (v < 0.22 || v > 0.58 ? 'hidden' : 'visible'));

    const opacityAct3 = useTransform(scrollYProgress, [0.60, 0.66, 1], [0, 1, 1]);
    const yAct3 = useTransform(scrollYProgress, [0.60, 0.66, 1], [20, 0, 0]);
    const pointerAct3 = useTransform(scrollYProgress, (v) => (v < 0.58 ? 'none' : 'auto'));
    const visibilityAct3 = useTransform(scrollYProgress, (v) => (v < 0.58 ? 'hidden' : 'visible'));

    const progressPercent = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const titleWords = (activeServices[0]?.title || '').trim().split(/\s+/);
    const lastTwo = titleWords.length > 2 ? titleWords.splice(-2).join(' ') : '';
    const firstPart = titleWords.join(' ');

    return (
        <section id="hero" ref={containerRef} aria-labelledby="hero-title" className="relative h-[800vh] bg-black selection:bg-emerald-500 selection:text-black">
            {/* PERFORMANCE FIX: contain:layout_paint scopes layout/paint recalculation
                to this box instead of the whole 800vh ancestor section */}
            <div className="sticky top-0 h-screen w-full overflow-hidden [contain:layout_paint]">
                <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />

                {/* Background loader indicator */}
                {!isLoaded && (
                    <div className="absolute top-6 right-6 z-30 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-emerald-400">
                        <span>LOADING ASSETS ({loadProgress}%)</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50 pointer-events-none" aria-hidden="true" />

                <div className="relative z-20 flex h-[calc(100vh-88px)] items-center px-4 sm:px-8 max-w-7xl mx-auto w-full">
                    <motion.div
                        style={{ opacity: opacityAct1, y: yAct1, pointerEvents: pointerAct1, visibility: visibilityAct1 }}
                        className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6"
                    >
                        <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none font-sans">
                            {firstPart} <br />
                            <span className="bg-gradient-to-r from-white via-gray-200 to-emerald-400 bg-clip-text text-transparent">{lastTwo}</span>
                        </h1>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-sans">{activeServices[0].description}</p>
                    </motion.div>

                    <motion.div
                        style={{ opacity: opacityAct2, y: yAct2, pointerEvents: pointerAct2, visibility: visibilityAct2 }}
                        className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight font-sans">{activeServices[1].title}</h2>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-sans">{activeServices[1].description}</p>
                    </motion.div>

                    <motion.div
                        style={{ opacity: opacityAct3, y: yAct3, pointerEvents: pointerAct3, visibility: visibilityAct3 }}
                        className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">{activeServices[2].title}</h2>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-sans">{activeServices[2].description}</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                            <button type="button" className="rounded-full bg-emerald-400 px-6 py-3.5 text-xs font-mono uppercase tracking-[0.15em] text-black hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all text-center cursor-pointer" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                                Schedule Consultation
                            </button>
                            <button type="button" className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-mono uppercase tracking-[0.15em] text-white backdrop-blur-md hover:bg-white/10 transition-all text-center cursor-pointer" onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}>
                                Explore Services
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 z-20 flex items-center justify-between max-w-7xl mx-auto text-xs font-mono text-zinc-300" aria-hidden="true">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <span>SCROLL TO EXPLORE</span>
                        <div className="h-1 w-16 sm:w-24 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-emerald-400" style={{ width: progressPercent }} /></div>
                    </div>
                    <span className="hidden sm:block">RIDHITECH INDIA PVT LTD</span>
                </div>
            </div>
        </section>
    );
}