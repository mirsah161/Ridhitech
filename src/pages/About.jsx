import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Cpu, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

const defaultAboutData = {
    title: 'Building Reliable Infrastructure & Software for Growing Businesses.',
    description: 'At Ridhitech India, we believe technology should solve real operational friction. We partner with organizations to build resilient network systems, secure architectures, and custom web applications that scale with purpose.',
    vision: 'To be a trusted engineering partner for businesses navigating digital transformation, known for technical precision, reliability, and long-term value.',
    mission: 'To deliver robust, high-performance IT infrastructure and digital solutions through rigorous execution and transparent collaboration.',
    clients: [
        { name: 'Fams', logo: { url: '/uploads/Fams_49905748a4.png' } },
        { name: 'Celebi', logo: { url: '/uploads/celebi_3deaa897fd.png' } },
    ],
    techPartners: [
        { name: 'airtel', logo: { url: '/uploads/airtel_c8a41d8b69.png' } },
        { name: 'amie', logo: { url: '/uploads/amie_5cc9474174.png' } },
    ],
    location: {
        Building: 'Ground Floor Malikayil Building',
        Place: 'Kanjikuzhi',
        Pin: '686002',
        District: 'Kottayam',
        State: 'Kerala',
    },
    email: 'info@ridhitechindia.com',
    phone: '+91989-561-1166',
};

export default function About() {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch data using TanStack Query
    const { data: aboutData = defaultAboutData } = useQuery({
        queryKey: ['about-page-data'],
        queryFn: async () => {
            const [aboutRes, contactRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/about-page?populate=*`).then(res => res.ok ? res.json() : null),
                fetch(`${API_BASE_URL}/api/contact-section`).then(res => res.ok ? res.json() : null)
            ]);

            const attr = aboutRes?.data;
            const contactAttr = contactRes?.data;

            const formatLogoList = (logoArray, fallback) => {
                if (!Array.isArray(logoArray) || logoArray.length === 0) return fallback;
                return logoArray.map((item) => ({
                    name: item.name || 'Logo',
                    logo: { url: item.url }
                }));
            };

            return {
                ...defaultAboutData,
                title: attr?.Title || defaultAboutData.title,
                description: attr?.Description || defaultAboutData.description,
                vision: attr?.Vision || defaultAboutData.vision,
                mission: attr?.Mission || defaultAboutData.mission,
                clients: formatLogoList(attr?.Client_Logo, defaultAboutData.clients),
                techPartners: formatLogoList(attr?.Partners_Logo, defaultAboutData.techPartners),
                location: contactAttr?.Location || contactAttr?.location || attr?.Location || attr?.location || defaultAboutData.location,
                email: contactAttr?.Email || contactAttr?.email || attr?.Email || attr?.email || defaultAboutData.email,
                phone: contactAttr?.Phone || contactAttr?.phone || attr?.Phone || attr?.phone || defaultAboutData.phone,
            };
        },
        staleTime: 1000 * 60 * 5,
    });

    const resolveImageUrl = (logoObj) => {
        let rawUrl = logoObj;
        if (typeof logoObj === 'object' && logoObj !== null) {
            rawUrl = logoObj.url || logoObj.data?.attributes?.url || logoObj.data?.url || '';
        }
        if (!rawUrl || typeof rawUrl !== 'string') return '';
        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            return rawUrl;
        }
        const baseClean = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : '';
        return `${baseClean}${rawUrl}`;
    };

    const loc = aboutData.location || {};
    const addressLine1 = [loc.Building || loc.building, loc.place || loc.Place].filter(Boolean).join(', ');
    const addressLine2 = [loc.pin || loc.Pin, loc.district || loc.District, loc.state || loc.State].filter(Boolean).join(', ');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formElements = e.target.elements;

        // 1. Honeypot Anti-Spam Check
        if (formElements.website.value) {
            setSubmitted(true);
            return;
        }

        // 2. Simple Email Format Validation Check
        const emailValue = formElements.email.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        const formData = {
            firstName: formElements.firstName.value,
            lastName: formElements.lastName.value,
            email: emailValue,
            message: formElements.message.value,
        };

        const API_BASE_URL_LOCAL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

        // 3. Client-side Rate Limiting Check (e.g., max 3 messages per 10 minutes)
        const RATE_LIMIT_KEY = 'ridhitech_form_submissions';
        const MAX_SUBMISSIONS = 3;
        const WINDOW_TIME_MS = 10 * 60 * 1000; // 10 minutes (or use 24 * 60 * 60 * 1000 for 24h)

        const now = Date.now();
        const existingLogs = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');

        // Filter out timestamps older than the window time
        const recentLogs = existingLogs.filter(timestamp => now - timestamp < WINDOW_TIME_MS);

        if (recentLogs.length >= MAX_SUBMISSIONS) {
            setErrorMsg('You have sent too many messages recently. Please try again later.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL_LOCAL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: formData }),
            });

            if (response.ok) {
                recentLogs.push(now);
                localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentLogs));
                setSubmitted(true);
                e.target.reset();
            } else {
                const errorData = await response.json();
                setErrorMsg(errorData?.error?.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMsg('An error occurred. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black pt-32 pb-24 relative overflow-hidden">
            <SEO
                title="About Us"
                description={aboutData.description}
                path="/about"
            />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/5 blur-[140px] pointer-events-none rounded-full" />
            <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/5 blur-[160px] pointer-events-none rounded-full" />

            <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-28 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 max-w-3xl border-l-2 border-emerald-500 pl-6 sm:pl-8"
                >
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
                        {aboutData.title}
                    </h1>
                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-sans pt-2">
                        {aboutData.description}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-md p-8 sm:p-10 space-y-4 hover:border-emerald-500/40 transition-all shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center space-x-3 text-emerald-400">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Target className="h-5 w-5" />
                            </div>
                            <h3 className="font-mono text-sm uppercase tracking-wider text-white font-bold">Our Vision</h3>
                        </div>
                        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                            {aboutData.vision}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-md p-8 sm:p-10 space-y-4 hover:border-emerald-500/40 transition-all shadow-2xl relative group">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center space-x-3 text-emerald-400">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <h3 className="font-mono text-sm uppercase tracking-wider text-white font-bold">Our Mission</h3>
                        </div>
                        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                            {aboutData.mission}
                        </p>
                    </div>
                </div>

                <div className="space-y-16 overflow-hidden">
                    {aboutData.clients && aboutData.clients.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                <div>
                                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">Collaborations</span>
                                    <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Trusted Clients</h3>
                                </div>
                                <span className="text-xs font-mono text-zinc-500">Organizations we build long-term value for</span>
                            </div>

                            <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                                <div className="animate-marquee flex space-x-6 items-center">
                                    {[...aboutData.clients, ...aboutData.clients].map((client, index) => {
                                        const logoUrl = resolveImageUrl(client.logo);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center px-8 py-5 rounded-2xl bg-zinc-950/90 border border-white/5 hover:border-emerald-500/40 transition-all duration-300 min-w-[210px] h-24 shrink-0 group shadow-lg"
                                            >
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt={client.name || 'Client logo'}
                                                        className="max-h-10 w-auto object-contain opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-mono tracking-wider text-zinc-300 group-hover:text-emerald-400 transition-colors">
                                                        {client.name}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {aboutData.techPartners && aboutData.techPartners.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                <div>
                                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">Ecosystem</span>
                                    <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Technology Partners</h3>
                                </div>
                                <span className="text-xs font-mono text-zinc-500">Platforms and network tools we utilize</span>
                            </div>

                            <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                                <div className="animate-marquee-reverse flex space-x-6 items-center">
                                    {[...aboutData.techPartners, ...aboutData.techPartners].map((tech, index) => {
                                        const logoUrl = resolveImageUrl(tech.logo);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center px-8 py-5 rounded-2xl bg-zinc-950/90 border border-white/5 hover:border-emerald-500/40 transition-all duration-300 min-w-[210px] h-24 shrink-0 group shadow-lg"
                                            >
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt={tech.name || 'Tech partner logo'}
                                                        className="max-h-10 w-auto object-contain opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-mono tracking-wider text-zinc-300 group-hover:text-emerald-400 transition-colors">
                                                        {tech.name}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div id="contact" className="pt-20 border-t border-white/10 scroll-mt-20 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                            Get in touch
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Ready to optimize your infrastructure? Drop us a message or visit our office below.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-950 p-5 hover:border-emerald-500/30 transition-all shadow-xl">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mr-4">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">Email Address</div>
                                <a href={`mailto:${aboutData.email}`} className="text-sm font-semibold text-white hover:text-emerald-300 truncate block">
                                    {aboutData.email}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-950 p-5 hover:border-emerald-500/30 transition-all shadow-xl">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mr-4">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">Phone Number</div>
                                <a href={`tel:${aboutData.phone}`} className="text-sm font-semibold text-white hover:text-emerald-300 truncate block">
                                    {aboutData.phone}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-950 p-5 hover:border-emerald-500/30 transition-all shadow-xl">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mr-4">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">Our Office</div>
                                <p className="text-sm font-semibold text-white truncate">{addressLine1 || 'Ground Floor Malikayil Building'}</p>
                                <p className="text-xs text-zinc-400 truncate mt-0.5">{addressLine2 || 'Kanjikuzhi, Kottayam'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-xl overflow-hidden min-h-[420px]">
                            <div className="w-full h-full flex-1 rounded-xl overflow-hidden border border-white/10 relative">
                                <iframe
                                    title="Ridhitech India Location Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.69562737813!2d76.28866479999999!3d9.9592621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0873a594821935%3A0xbcb764a920edbc17!2sRIDHITECH%20INDIA%20PRIVATE%20LIMITED!5e0!3m2!1sen!2sin!4v1789975771710!5m2!1sen!2sin" width="100%" height="100%"
                                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)', minHeight: '390px' }}
                                    allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>

                        <div className="lg:col-span-6 flex flex-col">
                            <div className="flex-1 flex flex-col justify-center rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-xl">
                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="py-16 text-center space-y-3"
                                        >
                                            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                                            <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                                            <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                                                We’ve received your message and will respond within 24 hours.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            {errorMsg && (
                                                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center font-mono">
                                                    {errorMsg}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                                                        Your Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        required
                                                        placeholder="Your name"
                                                        className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        required
                                                        placeholder="Your last name"
                                                        className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                                                    Email address
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="Your email address"
                                                    className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                                                    Message
                                                </label>
                                                <textarea
                                                    name="message"
                                                    required
                                                    rows={4}
                                                    placeholder="Write something...."
                                                    className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                                />
                                            </div>

                                            {/* Hidden Honeypot Field */}
                                            <input
                                                type="text"
                                                name="website"
                                                style={{ display: 'none' }}
                                                tabIndex="-1"
                                                autoComplete="off"
                                            />

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-mono font-semibold text-black hover:bg-emerald-400 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 cursor-pointer mt-2"
                                            >
                                                {isLoading ? (
                                                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <span>Submit</span>
                                                )}
                                            </button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}