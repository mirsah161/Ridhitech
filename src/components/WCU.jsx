import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

function WCUCard({ pillar, index }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongDescription = pillar.Description && pillar.Description.length > 110;

    const IconComponent = LucideIcons[pillar.IconName] || LucideIcons.Layers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/[0.04] flex flex-col justify-between"
        >
            <div>
                <div className="mb-6 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <IconComponent className="h-6 w-6 shrink-0" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2 font-sans">
                    {pillar.Title}
                </h3>
                <div className="text-gray-400 text-sm leading-relaxed relative font-sans">
                    <p className={`${!isExpanded && isLongDescription ? 'line-clamp-2' : ''}`}>
                        {pillar.Description}
                    </p>

                    {isLongDescription && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-xs font-mono tracking-[0.150em] uppercase text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                        >
                            <span>{isExpanded ? 'View Less' : 'View More'}</span>
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function WCU({ data }) {
    const fallbackServices = [
        {
            id: 1,
            Title: 'High-Throughput Systems',
            Description: 'Architecting distributed platforms engineered for continuous load and microsecond response times.',
            IconName: 'Cpu',
        },
        {
            id: 2,
            Title: 'Zero-Trust Security',
            Description: 'Bespoke infrastructure hardened with active threat mitigation and strict compliance controls.',
            IconName: 'ShieldCheck',
        },
        {
            id: 3,
            Title: 'Precision Execution',
            Description: 'Eliminating technical friction through continuous delivery pipelines and optimized codebases.',
            IconName: 'Zap',
        },
        {
            id: 4,
            Title: 'Custom Dev Ecosystems',
            Description: 'Tailor-made software environments and internal tools designed to supercharge engineering velocity.',
            IconName: 'Terminal',
        },
    ];

    const services = data && data.length > 0 ? data : fallbackServices;
    const totalCount = services.length;

    let gridColsClass = 'lg:grid-cols-4';
    if (totalCount % 3 === 0 && totalCount % 4 !== 0) {
        gridColsClass = 'lg:grid-cols-3';
    } else if (totalCount === 6) {
        gridColsClass = 'lg:grid-cols-3';
    }

    return (
        <section id="wcu" className="relative w-full bg-black py-24 sm:py-32 text-white overflow-hidden flex flex-col justify-center selection:bg-emerald-500 selection:text-black">

            <div className="absolute top-1/4 -left-20 -z-10 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 -z-10 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10 w-full space-y-12 sm:space-y-16">

                <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-emerald-400 tracking-[0.2em] uppercase">
                            WHY CHOOSE US
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                        Engineered for stability. <br />
                        <span className="bg-gradient-to-r from-white via-gray-200 to-emerald-400 bg-clip-text text-transparent">
                            Built for extreme scale.
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-sans">
                        We build low-latency enterprise infrastructure, custom cloud orchestration, and resilient software ecosystems designed to operate flawlessly under pressure.
                    </p>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-6`}>
                    {services.map((pillar, idx) => (
                        <WCUCard key={pillar.id || pillar.Title} pillar={pillar} index={idx} />
                    ))}
                </div>

            </div>
        </section>
    );
}