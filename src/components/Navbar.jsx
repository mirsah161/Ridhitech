import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const defaultNavItems = [
    { name: 'Home', href: '/#hero', isAnchor: true },
    { name: 'Services', href: '/services', isAnchor: false },
    { name: 'Work', href: '/works', isAnchor: false },
    { name: 'About', href: '/about', isAnchor: false },
];

export default function Navbar() {
    const [navItems] = useState(defaultNavItems);
    const [activeSection, setActiveSection] = useState('');
    const [bgOpacity, setBgOpacity] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isHoverExpanded, setIsHoverExpanded] = useState(false);
    const [hoverScrollPos, setHoverScrollPos] = useState(0);

    // PERFORMANCE OPTIMIZATION: Track mobile screen state safely via cached ref and event listener
    const [isMobileScreen, setIsMobileScreen] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < 768
    );

    const navigate = useNavigate();
    const location = useLocation();
    const ticking = useRef(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileScreen(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize, { passive: true });
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.scrollY;

                    setIsScrolled(currentScroll > 100);

                    if (isHoverExpanded && Math.abs(currentScroll - hoverScrollPos) > 50) {
                        setIsHoverExpanded(false);
                    }

                    if (location.pathname === '/') {
                        const heroElement = document.getElementById('hero');

                        if (heroElement) {
                            const heroHeight = heroElement.offsetHeight;
                            const fadeStart = Math.max(0, heroHeight - 300);
                            const fadeEnd = heroHeight;

                            if (currentScroll <= fadeStart) {
                                setBgOpacity(0);
                            } else if (currentScroll >= fadeEnd) {
                                setBgOpacity(0.85);
                            } else {
                                const progress = (currentScroll - fadeStart) / (fadeEnd - fadeStart);
                                setBgOpacity(progress * 0.85);
                            }
                        } else {
                            const progress = Math.min(currentScroll / 400, 1);
                            setBgOpacity(progress * 0.85);
                        }
                    } else {
                        setBgOpacity(0.85);
                    }

                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHoverExpanded, hoverScrollPos, location.pathname]);

    useEffect(() => {
        if (location.pathname !== '/') {
            setActiveSection('');
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -40% 0px',
            threshold: 0,
        };

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        navItems.forEach((item) => {
            if (item.isAnchor) {
                const targetId = item.href.replace('/#', '');
                const element = document.getElementById(targetId);
                if (element) observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [location.pathname, navItems]);

    const handleMouseEnter = () => {
        if (isScrolled && !isMobileScreen) {
            setIsHoverExpanded(true);
            setHoverScrollPos(window.scrollY);
        }
    };

    const handleNavClick = (e, item) => {
        setMobileMenuOpen(false);
        setIsHoverExpanded(false);

        if (item.isAnchor) {
            e.preventDefault();
            const targetId = item.href.replace('/#', '');
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                    const element = document.getElementById(targetId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(targetId);
                    }
                }, 250);
            } else {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setActiveSection(targetId);
                }
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isShrunk = !isMobileScreen && isScrolled && !isHoverExpanded;

    return (
        <header
            onMouseEnter={handleMouseEnter}
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out flex justify-center px-4 sm:px-6 ${isShrunk ? 'py-3 pointer-events-none' : 'py-4 pointer-events-auto'
                }`}
        >
            <div
                className={`transition-all duration-300 ease-in-out flex items-center ${isShrunk
                        ? 'w-auto max-w-[92vw] px-4 py-2 rounded-full border border-white/10 bg-black/75 backdrop-blur-xl shadow-2xl pointer-events-auto'
                        : 'w-full max-w-7xl px-4 sm:px-10 justify-between'
                    }`}
                style={{
                    backgroundColor: isShrunk ? undefined : `rgba(0, 0, 0, ${bgOpacity})`,
                    backdropFilter: isShrunk ? undefined : bgOpacity > 0 ? `blur(${bgOpacity * 12}px)` : 'none',
                    WebkitBackdropFilter: isShrunk ? undefined : bgOpacity > 0 ? `blur(${bgOpacity * 12}px)` : 'none',
                }}
            >
                <AnimatePresence>
                    {!isShrunk && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                to="/"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center space-x-2 cursor-pointer font-sans"
                            >
                                <span>
                                    RIDHI<span className="text-emerald-400">TECH</span>
                                </span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <nav
                    className={`hidden md:flex items-center space-x-1 rounded-full transition-all duration-300 ${isShrunk
                            ? 'bg-transparent border-none p-0'
                            : 'border border-white/10 bg-white/[0.03] backdrop-blur-lg p-1.5 shadow-inner'
                        }`}
                >
                    {navItems.map((item) => {
                        const sectionId = item.isAnchor ? item.href.replace('/#', '') : '';
                        let isActive = false;
                        if (item.isAnchor) {
                            if (sectionId === 'hero') {
                                isActive = location.pathname === '/' && (activeSection === 'hero' || activeSection === '');
                            } else {
                                isActive = location.pathname === '/' && activeSection === sectionId;
                            }
                        } else {
                            isActive = location.pathname === item.href;
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={(e) => {
                                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                                    handleNavClick(e, item);
                                }}
                                className={`relative font-mono tracking-[0.15em] uppercase transition-colors duration-200 cursor-pointer ${isShrunk ? 'px-4 py-1.5 text-[11px]' : 'px-5 py-2 text-xs'
                                    } ${isActive ? 'text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-emerald-400 rounded-full -z-10 shadow-lg shadow-emerald-400/20"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <AnimatePresence>
                    {!isShrunk && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2 }}
                            className="hidden md:block"
                        >
                            <Link
                                to="/about"
                                onClick={(e) => {
                                    if (e.metaKey || e.ctrlKey) return;
                                    handleNavClick(e, { href: '/about', isAnchor: false });
                                }}
                                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-mono tracking-[0.15em] text-emerald-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/5"
                            >
                                GET IN TOUCH
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white ml-auto cursor-pointer transition-colors"
                    aria-label="Toggle Menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-4 right-4 sm:left-6 sm:right-6 md:hidden border border-white/10 rounded-2xl bg-black/95 backdrop-blur-2xl p-6 space-y-3 shadow-2xl pointer-events-auto mt-2"
                >
                    <div className="flex flex-col space-y-2">
                        {navItems.map((item) => {
                            const sectionId = item.isAnchor ? item.href.replace('/#', '') : '';
                            let isActive = false;
                            if (item.isAnchor) {
                                if (sectionId === 'hero') {
                                    isActive = location.pathname === '/' && (activeSection === 'hero' || activeSection === '');
                                } else {
                                    isActive = location.pathname === '/' && activeSection === sectionId;
                                }
                            } else {
                                isActive = location.pathname === item.href;
                            }

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={(e) => {
                                        if (e.metaKey || e.ctrlKey) return;
                                        handleNavClick(e, item);
                                    }}
                                    className={`px-4 py-3 rounded-xl text-xs font-mono tracking-[0.2em] uppercase transition-all ${isActive
                                            ? 'bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-400/20'
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-2">
                            <Link
                                to="/about"
                                onClick={(e) => {
                                    if (e.metaKey || e.ctrlKey) return;
                                    handleNavClick(e, { href: '/about', isAnchor: false });
                                }}
                                className="block w-full text-center rounded-xl bg-emerald-400/10 border border-emerald-500/30 px-4 py-3 text-xs font-mono tracking-[0.2em] uppercase text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
                            >
                                Get In Touch
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </header>
    );
}