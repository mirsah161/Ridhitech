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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const frameStep = isMobile ? 2 : 1; // load every other frame on mobile to cut the download in half

    const fallbackServices = [
        {
            title: 'Technology That Drives Your Growth',
            description: 'Scalable, enterprise-grade engineering built for modern enterprises.'
        },
        {
            title: 'High-Performance Architecture',
            description: 'Engineered for low latency, security, and high availability.'
        },
        {
            title: 'Enterprise Scale & Cloud',
            description: 'Multi-cloud orchestration and resilient infrastructure frameworks.'
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

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

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

        loadFrame(targetFrames[0]).then(() => {
            if (cancelled) return;
            setIsLoaded(true);

            const run = async () => {
                const batchSize = isMobile ? 4 : 8;
                for (let i = 1; i < targetFrames.length && !cancelled; i += batchSize) {
                    const batch = targetFrames.slice(i, i + batchSize);
                    await Promise.all(batch.map((frameNum) => loadFrame(frameNum)));
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

        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
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
        if (!isLoaded) return undefined;

        let raf = 0;
        const unsubscribe = frameIndex.on('change', (latest) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => render(latest));
        });

        render(frameIndex.get());
        const handleResize = () => render(frameIndex.get());
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, [isLoaded, frameIndex, render]);

    const opacityAct1 = useTransform(scrollYProgress, [0, 0.15, 0.20], [1, 1, 0]);
    const yAct1 = useTransform(scrollYProgress, [0, 0.15, 0.20], [0, 0, -20]);
    const displayAct1 = useTransform(scrollYProgress, (v) => (v > 0.21 ? 'none' : 'block'));

    const opacityAct2 = useTransform(scrollYProgress, [0.24, 0.30, 0.50, 0.56], [0, 1, 1, 0]);
    const yAct2 = useTransform(scrollYProgress, [0.24, 0.30, 0.50, 0.56], [20, 0, 0, -20]);
    const displayAct2 = useTransform(scrollYProgress, (v) => (v < 0.22 || v > 0.58 ? 'none' : 'block'));

    const opacityAct3 = useTransform(scrollYProgress, [0.60, 0.66, 1], [0, 1, 1]);
    const yAct3 = useTransform(scrollYProgress, [0.60, 0.66, 1], [20, 0, 0]);
    const displayAct3 = useTransform(scrollYProgress, (v) => (v < 0.58 ? 'none' : 'block'));
    const progressPercent = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const titleWords = (activeServices[0]?.title || '').trim().split(/\s+/);
    const lastTwo = titleWords.length > 2 ? titleWords.splice(-2).join(' ') : '';
    const firstPart = titleWords.join(' ');

    return (
        <section id="hero" ref={containerRef} aria-labelledby="hero-title" className="relative h-[800vh] bg-black selection:bg-emerald-500 selection:text-black">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />

                {!isLoaded && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black text-white font-mono" role="status" aria-live="polite">
                        <div className="text-sm tracking-widest text-emerald-400 mb-2">INITIALIZING EXPERIENCE</div>
                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={loadProgress} aria-label="Loading hero animation">
                            <div className="h-full bg-emerald-400 transition-all duration-200" style={{ width: `${loadProgress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{loadProgress}%</div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50 pointer-events-none" aria-hidden="true" />

                <div className="relative z-20 flex h-[calc(100vh-88px)] items-center px-4 sm:px-8 max-w-7xl mx-auto w-full">
                    <motion.div style={{ opacity: opacityAct1, y: yAct1, display: displayAct1 }} className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6">
                        <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none font-sans">
                            {firstPart} <br />
                            <span className="bg-gradient-to-r from-white via-gray-200 to-emerald-400 bg-clip-text text-transparent">{lastTwo}</span>
                        </h1>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-sans">{activeServices[0].description}</p>
                    </motion.div>

                    <motion.div style={{ opacity: opacityAct2, y: yAct2, display: displayAct2 }} className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight font-sans">{activeServices[1].title}</h2>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-sans">{activeServices[1].description}</p>
                    </motion.div>

                    <motion.div style={{ opacity: opacityAct3, y: yAct3, display: displayAct3 }} className="absolute max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6">
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