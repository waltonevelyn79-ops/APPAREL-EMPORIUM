'use client';

import { useSettings } from '@/context/SettingsContext';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function TrackingScripts() {
    const { settings } = useSettings();
    const [consent, setConsent] = useState<{ necessary: boolean; analytics: boolean; marketing: boolean } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('cookieConsentData');
        if (stored) {
            try {
                setConsent(JSON.parse(stored));
            } catch (e) { console.error('Error parsing cookie consent'); }
        }
    }, []);

    // Helper functions
    const isAnalytics = () => consent?.analytics === true;
    const isMarketing = () => consent?.marketing === true;

    // Process Custom Scripts
    let customScripts: any[] = [];
    try {
        if (settings.custom_scripts) customScripts = JSON.parse(settings.custom_scripts);
    } catch (e) {
        // Safe fail
    }

    return (
        <>
            {/* 1. Necessary / Global head tags */}
            {settings.google_search_console_meta && (
                <meta name="google-site-verification" content={settings.google_search_console_meta} />
            )}

            {/* Custom Scripts HEAD */}
            {customScripts.filter(s => s.active && s.location === 'head').map((script, idx) => (
                <Script
                    key={`custom-head-${idx}`}
                    id={`custom-head-${idx}`}
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{ __html: script.code.replace(/<script>|<\/script>/g, '') }}
                />
            ))}

            {/* 2. Analytics Scripts */}
            {isAnalytics() && (
                <>
                    {/* GTM */}
                    {settings.gtm_enabled === 'true' && settings.gtm_container_id && (
                        <Script
                            id="gtag-manager-head"
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{
                                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${settings.gtm_container_id}');`
                            }}
                        />
                    )}

                    {/* GA4 */}
                    {settings.ga4_enabled === 'true' && settings.ga4_measurement_id && settings.gtm_enabled !== 'true' && (
                        <>
                            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4_measurement_id}`} strategy="afterInteractive" />
                            <Script id="ga4-script" strategy="afterInteractive">
                                {`
                                  window.dataLayer = window.dataLayer || [];
                                  function gtag(){dataLayer.push(arguments);}
                                  gtag('js', new Date());
                                  gtag('config', '${settings.ga4_measurement_id}');
                                `}
                            </Script>
                        </>
                    )}

                    {/* Clarity */}
                    {settings.clarity_enabled === 'true' && settings.clarity_project_id && (
                        <Script id="clarity-script" strategy="afterInteractive">
                            {`
                                (function(c,l,a,r,i,t,y){
                                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                                })(window, document, "clarity", "script", "${settings.clarity_project_id}");
                            `}
                        </Script>
                    )}

                    {/* Hotjar */}
                    {settings.hotjar_enabled === 'true' && settings.hotjar_site_id && (
                        <Script id="hotjar-script" strategy="afterInteractive">
                            {`
                                (function(h,o,t,j,a,r){
                                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                                    h._hjSettings={hjid:${settings.hotjar_site_id},hjsv:6};
                                    a=o.getElementsByTagName('head')[0];
                                    r=o.createElement('script');r.async=1;
                                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                                    a.appendChild(r);
                                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                            `}
                        </Script>
                    )}
                </>
            )}

            {/* 3. Marketing Scripts */}
            {isMarketing() && (
                <>
                    {/* FB Pixel */}
                    {settings.fb_pixel_enabled === 'true' && settings.fb_pixel_id && settings.gtm_enabled !== 'true' && (
                        <Script id="fb-pixel" strategy="afterInteractive">
                            {`
                              !function(f,b,e,v,n,t,s)
                              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                              n.queue=[];t=b.createElement(e);t.async=!0;
                              t.src=v;s=b.getElementsByTagName(e)[0];
                              s.parentNode.insertBefore(t,s)}(window, document,'script',
                              'https://connect.facebook.net/en_US/fbevents.js');
                              fbq('init', '${settings.fb_pixel_id}');
                              fbq('track', 'PageView');
                            `}
                        </Script>
                    )}

                    {/* TikTok Pixel */}
                    {settings.tiktok_pixel_enabled === 'true' && settings.tiktok_pixel_id && (
                        <Script id="tiktok-pixel" strategy="afterInteractive">
                            {`
                                !function (w, d, t) {
                                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                                  ttq.load('${settings.tiktok_pixel_id}');
                                  ttq.page();
                                }(window, document, 'ttq');
                            `}
                        </Script>
                    )}

                    {/* LinkedIn Insight */}
                    {settings.linkedin_enabled === 'true' && settings.linkedin_partner_id && (
                        <Script id="linkedin-pixel" strategy="afterInteractive">
                            {`
                                _linkedin_partner_id = "${settings.linkedin_partner_id}";
                                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                                (function(l) {
                                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                                window.lintrk.q=[]}
                                var s = document.getElementsByTagName("script")[0];
                                var b = document.createElement("script");
                                b.type = "text/javascript";b.async = true;
                                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                                s.parentNode.insertBefore(b, s);})(window.lintrk);
                            `}
                        </Script>
                    )}

                    {/* Pinterest Tag */}
                    {settings.pinterest_enabled === 'true' && settings.pinterest_tag_id && (
                        <Script id="pinterest-pixel" strategy="afterInteractive">
                            {`
                                !function(e){if(!window.pintrk){window.pintrk = function () {
                                window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                                  n=window.pintrk;n.queue=[],n.version="3.0";var
                                  t=document.createElement("script");t.async=!0,t.src=e;var
                                  r=document.getElementsByTagName("script")[0];
                                  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                                pintrk('load', '${settings.pinterest_tag_id}');
                                pintrk('page');
                            `}
                        </Script>
                    )}
                </>
            )}

            {/* Custom Scripts BODY START */}
            {customScripts.filter(s => s.active && s.location === 'body-start').map((script, idx) => (
                <div
                    key={`custom-body-start-${idx}`}
                    dangerouslySetInnerHTML={{ __html: script.code }}
                />
            ))}

            {/* Custom Scripts BODY END */}
            {customScripts.filter(s => s.active && s.location === 'body-end').map((script, idx) => (
                <div
                    key={`custom-body-end-${idx}`}
                    className="fixed bottom-0 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: script.code }}
                />
            ))}

            {/* GTM Noscript Fallback */}
            {isAnalytics() && settings.gtm_enabled === 'true' && settings.gtm_container_id && (
                <noscript dangerouslySetInnerHTML={{
                    __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_container_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
                }} />
            )}
        </>
    );
}
