import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/WCU';
import Services from '../components/Services';
import Work from '../components/Work';
import { API_BASE_URL } from '../config/api';

function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-black text-white">
            <section className="relative h-screen w-full overflow-hidden flex items-center px-4 sm:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="max-w-[90vw] sm:max-w-xl space-y-4 sm:space-y-6 animate-pulse">
                        <div className="h-3 w-32 rounded-full bg-white/10" />
                        <div className="space-y-3">
                            <div className="h-10 sm:h-14 w-full rounded-lg bg-white/10" />
                            <div className="h-10 sm:h-14 w-2/3 rounded-lg bg-emerald-500/10" />
                        </div>
                        <div className="space-y-2 max-w-lg pt-2">
                            <div className="h-3 w-full rounded bg-white/5" />
                            <div className="h-3 w-4/5 rounded bg-white/5" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <div className="h-12 w-44 rounded-full bg-emerald-500/10" />
                            <div className="h-12 w-36 rounded-full bg-white/5" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Home() {
    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: async () => {
            const [homePageRes, aboutRes, servicesRes, workRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/home-page?populate=*`),
                fetch(`${API_BASE_URL}/api/about-sections?populate=*`),
                fetch(`${API_BASE_URL}/api/services?populate=*`),
                fetch(`${API_BASE_URL}/api/work-sections?populate=*`)
            ]);

            const [homePage, about, services, work] = await Promise.all([
                homePageRes.ok ? homePageRes.json() : null,
                aboutRes.ok ? aboutRes.json() : null,
                servicesRes.ok ? servicesRes.json() : { data: [] },
                workRes.ok ? workRes.json() : { data: [] },
            ]);

            return {
                homePage: homePage?.data || null,
                about: about?.data || null,
                services: services?.data || [],
                work: work?.data || [],
            };
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    if (isLoading || !homeData) {
        return <HomeSkeleton />;
    }

    const seoData = homeData.homePage?.attributes?.seo || homeData.homePage?.seo;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black font-sans antialiased">
            <SEO
                title={seoData?.metaTitle || "High-Performance Web & Software Engineering"}
                description={seoData?.metaDescription || "Ridhitech India builds high-throughput systems, zero-trust secure architecture, and scalable web experiences."}
                path="/"
            />
            <main>
                <Hero servicesData={homeData.services} />
                <About data={homeData.about} />
                <Services data={homeData.services} />
                <Work data={homeData.work} />
            </main>
        </div>
    );
}

export default Home;