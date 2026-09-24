import { useQuery } from '@tanstack/react-query';
import { ArrowUp } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';

export default function Footer() {

    const [shouldFetch, setShouldFetch] = useState(false);

    useEffect(() => {
        // Defer the footer network request until the browser is idle or after 1 second
        const timer = setTimeout(() => {
            setShouldFetch(true);
        }, 1000); // 1-second delay ensures LCP and critical bundle requests finish first

        return () => clearTimeout(timer);
    }, [])

    const { data, isLoading: loading } = useQuery({
        queryKey: ['footerData'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/footer-link?populate=*`);
            if (!res.ok) return null;
            const resJson = await res.json();
            if (!resJson?.data) return null;
            const item = resJson.data;
            return item.attributes ? { id: item.id, ...item.attributes } : item;
        },
        enabled: shouldFetch, 
        staleTime: 1000 * 60 * 10,
    });

    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const socialLinks = data?.social_links || [];
    const trustBadge = data?.trustBadges;
    const connectedServices = (data?.services || []).slice(0, 5);
    const addressComp = data?.footerAddress?.[0];

    const quickLinks = [
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about' },
        { label: 'Services', url: '/services' },
        { label: 'Works', url: '/works' },
    ];

    const renderSocialIcon = (platform) => {
        const key = platform?.toLowerCase();
        switch (key) {
            case 'facebook':
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
            case 'twitter':
            case 'x':
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
            case 'github':
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.5 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>;
            case 'linkedin':
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
            case 'youtube':
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
            default:
                return <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>;
        }
    };

    return (
        <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden font-sans">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 h-32 w-2/3 bg-emerald-500/5 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">

                    <div className="space-y-6">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold">Follow Us</h3>
                        <div className="flex items-center space-x-3">
                            {loading ? (
                                [...Array(4)].map((_, idx) => (
                                    <div key={idx} className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                                ))
                            ) : (
                                socialLinks.map((item, idx) => {
                                    const platformName = item.platform;
                                    return (
                                        <a
                                            key={item.id || idx}
                                            href={item.URL}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all shadow-md"
                                            aria-label={`Visit our ${platformName} page`}
                                        >
                                            {renderSocialIcon(platformName)}
                                        </a>
                                    );
                                })
                            )}
                        </div>

                        {trustBadge?.url && (
                            <div className="pt-2">
                                <img
                                    src={
                                        trustBadge.url.startsWith('http')
                                            ? trustBadge.url
                                            : `${API_BASE_URL}${trustBadge.url.startsWith('/') ? '' : '/'}${trustBadge.url}`
                                    }
                                    alt={trustBadge.name || "Trust badge"}
                                    width={133}
                                    height={89}
                                    className="h-20 w-auto object-contain"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold">Quick Links</h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.url} className="text-zinc-300 hover:text-emerald-400 transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold">Our Services</h3>
                        <ul className="space-y-2.5">
                            {loading ? (
                                [...Array(4)].map((_, idx) => (
                                    <li key={idx}>
                                        <div className="h-3.5 w-28 rounded bg-white/5 animate-pulse" />
                                    </li>
                                ))
                            ) : connectedServices.length > 0 ? (
                                connectedServices.map((service, idx) => (
                                    <li key={service.id || idx}>
                                        <a href={`/services`} className="text-zinc-300 hover:text-emerald-400 transition-colors text-sm">
                                            {service.Title}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-zinc-500 text-sm italic">No services linked</li>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold">Ridhitech India</h3>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-3.5 w-40 rounded bg-white/5 animate-pulse" />
                                <div className="h-3.5 w-32 rounded bg-white/5 animate-pulse" />
                            </div>
                        ) : addressComp ? (
                            <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                                {addressComp.Building}, {addressComp.place}, {addressComp.pin ? `${addressComp.pin}, ` : ''}
                                {addressComp.district ? `${addressComp.district}, ` : ''}
                                {addressComp.state || ''}
                            </p>
                        ) : (
                            <p className="text-zinc-500 text-sm italic">Address not provided</p>
                        )}
                    </div>

                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-4">
                    <p>{data?.copyright || `© 2016-2026 Created By: Ridhitech India. All rights reserved.`}</p>

                    <div className="flex items-center space-x-6">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>

                        <button
                            onClick={scrollToTop}
                            className="flex items-center space-x-2 rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-xs font-mono text-zinc-300 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                            <span>TOP</span>
                            <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

            </div>
        </footer>
    );
}