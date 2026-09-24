import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

function ContactForm() {

    const { executeRecaptcha } = useGoogleReCaptcha();
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formElements = e.target.elements;

        // Honeypot Anti-Spam Check 
        if (formElements.website.value) {
            setSubmitted(true);
            return;
        }

        // Simple Email Format Validation Check
        const emailValue = formElements.email.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        // Check if reCAPTCHA is ready
        if (!executeRecaptcha) {
            setErrorMsg('Security check is still loading. Please try again in a moment.');
            return;
        }

        setIsLoading(true);

        try {
            // Generate Google reCAPTCHA v3 invisible token
            const token = await executeRecaptcha('contact_submit');

            const formData = {
                firstName: formElements.firstName.value,
                lastName: formElements.lastName.value,
                email: emailValue,
                message: formElements.message.value,
                token: token, // Send the security token to backend
            };

            const API_BASE_URL_LOCAL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

            // Client-side Rate Limiting Check 
            const RATE_LIMIT_KEY = 'ridhitech_form_submissions';
            const MAX_SUBMISSIONS = 3;
            const WINDOW_TIME_MS = 10 * 60 * 1000; // 10 minutes 

            const now = Date.now();
            const existingLogs = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
            const recentLogs = existingLogs.filter(timestamp => now - timestamp < WINDOW_TIME_MS);

            if (recentLogs.length >= MAX_SUBMISSIONS) {
                setErrorMsg('You have sent too many messages recently. Please try again later.');
                setIsLoading(false);
                return;
            }

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
        <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 flex flex-col justify-center rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-xl">
                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-16 text-center space-y-3 relative" /* Added relative here */
                        >
                            {/* Top Right Close Button */}
                            <button
                                onClick={() => setSubmitted(false)}
                                className="absolute top-[-20%] right-0 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                                aria-label="Close success message"
                            >
                                <X className="h-4 w-4" />
                            </button>

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
                            <p className="text-[11px] text-zinc-500 text-center mt-3">
                                This site is protected by reCAPTCHA and the Google{' '}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a> and{' '}
                                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">Terms of Service</a> apply.
                            </p>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ContactForm