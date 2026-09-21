import { useEffect } from 'react';

const SITE_NAME = 'Ridhitech India';
const SITE_URL = 'https://www.ridhitech.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Sets per-route <title>, meta description, canonical, Open Graph, Twitter
 * Card and robots tags on mount/update. No extra dependency required.
 *
 * Note: because this app renders client-side, Google (which executes JS)
 * will pick these tags up, but crawlers that DON'T run JavaScript
 * (many link-unfurlers used by Slack/Discord/older bots, some SEO
 * auditing tools) will only ever see the static tags in index.html.
 * For full coverage, pair this with static prerendering per route
 * (see the README section on prerendering) so the real tags ship in
 * the initial HTML response, not just after hydration.
 */
export default function SEO({
    title,
    description,
    path = '/',
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    noindex = false,
}) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${SITE_URL}${path}`;

    useEffect(() => {
        document.title = fullTitle;

        const setMeta = (attr, key, content) => {
            if (!content) return;
            let el = document.head.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        const setLink = (rel, href) => {
            let el = document.head.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        setMeta('name', 'description', description);
        setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
        setLink('canonical', url);

        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', image);
        setMeta('property', 'og:site_name', SITE_NAME);

        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', description);
        setMeta('name', 'twitter:image', image);
    }, [fullTitle, description, url, image, type, noindex]);

    return null;
}
