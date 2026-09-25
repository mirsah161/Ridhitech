import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden pt-28 pb-16">

            <div className="absolute inset-0 z-0">
                <img
                    src="https://i.pinimg.com/1200x/6d/be/ae/6dbeae2d7f877e9b22b0e1d204037235.jpg"
                    alt="404 Background"
                    className="w-full h-full object-cover filter brightness-50 contrast-125"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-xl w-full text-center relative z-10 space-y-6">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-7xl sm:text-9xl font-extrabold tracking-tighter mt-6 mb-2 font-sans text-white drop-shadow-lg">
                        4<span className="text-emerald-400">0</span>4
                    </h1>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-200">
                        Page Not Found
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-sm sm:text-base text-zinc-300 font-mono tracking-wide max-w-md mx-auto"
                >
                    The page you are looking for doesn't exist or has been moved. Let's get you back on track.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link
                        to="/"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-mono tracking-[0.2em] uppercase text-black font-bold hover:bg-emerald-300 transition-all duration-300 shadow-lg shadow-emerald-400/20 cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-6 py-3 text-xs font-mono tracking-[0.2em] uppercase text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous Page</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}