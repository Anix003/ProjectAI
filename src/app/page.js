'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <main className="bg-background text-on-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop h-20">
          <div className="flex items-center gap-sm">
            <img
              alt="Growth & Connection Logo"
              className="h-10 w-10"
              src="https://lh3.googleusercontent.com/aida/ADBb0uirXkZvJhe1rKG8miB_TEia1R6mGKCp765ETISELLZPUXu_V74Yfu34BGbAmC6kUWjC-wV7mRgrWNjlFxkN1sqXhnlxqXr9kIpR-qKcx733m2OWKN54IIhAWV3zD2EJetcEQWdc2Sh0RWMWopsFN2m7UA-MwUytG2WMBdRmg_FR97OoUyBdtfcw1JYInvPErZOEqoIpYylZXC4Hs2Fliymbyqi1fM_I_vjCzheQXfGzrG45f6HFqJmh_P5o"
            />
            <span className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">
              Growth & Connection
            </span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <a
              className="text-secondary font-bold border-b-2 border-secondary pb-1 transition-colors duration-200"
              href="#"
            >
              Features
            </a>
            <a
              className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Services
            </a>
            <a
              className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Company
            </a>
          </div>
          <div className="flex items-center gap-md">
            <button className="hidden md:block text-primary font-label-md hover:text-secondary transition-colors duration-200 active:scale-95">
              Login
            </button>
            <button className="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-label-md hover:bg-secondary transition-all duration-200 active:scale-95">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-xxl pb-xxl flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop relative z-10 text-center">
          <span className="inline-block py-xs px-md rounded-full bg-secondary-container/20 text-secondary font-label-sm mb-lg border border-secondary/30">
            NETWORK SMARTER, NOT HARDER
          </span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md max-w-4xl mx-auto">
            Unlock Your Potential with <span className="text-secondary">Smart Connections</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-2xl mx-auto">
            Our data-driven networking platform empowers professionals through high-performance resource
            matching and curated industry insights designed for strategic growth.
          </p>
          <div className="flex flex-col md:flex-row gap-md justify-center items-center">
            <button className="bg-primary text-on-primary px-xxl py-md rounded-xl font-label-md hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95">
              Get Started Today
            </button>
            <button className="border border-outline-variant bg-surface-container/50 backdrop-blur-md text-on-surface px-xxl py-md rounded-xl font-label-md hover:bg-surface-variant transition-all duration-300 active:scale-95">
              View our solutions
            </button>
          </div>
        </div>
        {/* Abstract background shape */}
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
      </section>

      {/* Features Section */}
      <section className="py-xxl bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-xxl text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Precision-Engineered Growth Tools
            </h2>
            <div className="h-1 w-24 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            {/* Strategic Networking Card */}
            <div className="md:col-span-7 glass-card rounded-xl p-lg glowing-border transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined text-primary">hub</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-sm">Strategic Networking</h3>
                <p className="font-body-md text-on-surface-variant mb-lg">
                  Algorithmically-driven peer matching based on multi-dimensional performance metrics and
                  industry trajectory.
                </p>
              </div>
              <div className="relative h-48 bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden p-md">
                <div className="flex flex-wrap gap-sm">
                  <div className="bg-surface-variant p-sm rounded-lg flex items-center gap-xs border border-outline">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                      JD
                    </div>
                    <span className="text-label-sm">Jordan D. matched with Marketing</span>
                  </div>
                  <div className="bg-surface-variant p-sm rounded-lg flex items-center gap-xs border border-outline opacity-70">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      AL
                    </div>
                    <span className="text-label-sm">Alex L. requested Strategy Sync</span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
              </div>
            </div>

            {/* Resource Library Card */}
            <div className="md:col-span-5 glass-card rounded-xl p-lg glowing-border transition-all duration-300">
              <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-secondary">inventory_2</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-sm">Resource Library</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Access a deep repository of whitepapers, templates, and strategic frameworks.
              </p>
              <div className="space-y-sm">
                <div className="flex items-center justify-between p-sm rounded bg-surface-container-high border-l-4 border-primary">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-sm">description</span>
                    <span className="font-label-md text-on-surface">Growth_Strategy_2024.pdf</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-sm">download</span>
                </div>
                <div className="flex items-center justify-between p-sm rounded bg-surface-container-high border-l-4 border-secondary">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary text-sm">article</span>
                    <span className="font-label-md text-on-surface">Networking_KPIs.xlsx</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-sm">download</span>
                </div>
              </div>
            </div>

            {/* Growth Tracking Card */}
            <div className="md:col-span-12 glass-card rounded-xl p-lg glowing-border transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md">
                <div>
                  <div className="w-12 h-12 bg-tertiary-container/20 rounded-lg flex items-center justify-center mb-md">
                    <span className="material-symbols-outlined text-tertiary">query_stats</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md">Growth Tracking</h3>
                </div>
                <div className="flex gap-sm">
                  <div className="px-md py-xs rounded-full bg-secondary-container/10 border border-secondary text-secondary text-label-sm">
                    Monthly Growth +24%
                  </div>
                  <div className="px-md py-xs rounded-full bg-surface-variant border border-outline text-on-surface-variant text-label-sm">
                    Updated 2m ago
                  </div>
                </div>
              </div>
              <div className="h-64 w-full flex items-end gap-2 px-md">
                {[30, 45, 40, 65, 55, 85, 95].map((height, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t transition-all hover:bg-primary ${
                      idx === 3 || idx === 5 || idx === 6
                        ? 'bg-secondary/40 hover:bg-secondary'
                        : 'bg-primary/20 hover:bg-primary'
                    }`}
                    style={{ height: `${height}%` }}
                    title={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][idx]}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-sm text-label-sm text-outline px-md">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-xxl bg-background overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-xxl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Trusted by Industry Leaders
            </h2>
            <p className="font-body-md text-on-surface-variant mt-sm">
              Powering the next generation of professional excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-lg rounded-xl border border-outline-variant bg-surface-container-lowest/50 relative"
              >
                <span className="material-symbols-outlined text-secondary opacity-30 text-[64px] absolute -top-4 -left-2">
                  format_quote
                </span>
                <p className="font-body-md italic mb-xl relative z-10">{testimonial.quote}</p>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">{testimonial.name}</p>
                    <p className="font-label-sm text-outline">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-xxl">
        <div className="max-w-[1200px] mx-auto px-margin-mobile">
          <div className="bg-primary rounded-xxl p-xl md:p-xxl text-center text-on-primary relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] opacity-20 pointer-events-none"></div>
            <h2 className="font-headline-lg text-headline-lg md:text-headline-xl mb-md relative z-10">
              Ready to Accelerate Your Career?
            </h2>
            <p className="font-body-lg mb-xl max-w-xl mx-auto opacity-90 relative z-10">
              Join thousands of industry professionals using Growth & Connection to reach their full
              potential through precision tools.
            </p>
            <button className="bg-on-primary text-primary px-xxl py-md rounded-full font-headline-md hover:bg-secondary hover:text-on-secondary transition-all duration-300 shadow-xl relative z-10 active:scale-95">
              Start Free Trial
            </button>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-xxl">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl gap-lg">
          <div className="flex flex-col items-center md:items-start gap-sm">
            <div className="flex items-center gap-xs">
              <img
                alt="Growth & Connection Logo"
                className="h-6 w-6"
                src="https://lh3.googleusercontent.com/aida/ADBb0uirXkZvJhe1rKG8miB_TEia1R6mGKCp765ETISELLZPUXu_V74Yfu34BGbAmC6kUWjC-wV7mRgrWNjlFxkN1sqXhnlxqXr9kIpR-qKcx733m2OWKN54IIhAWV3zD2EJetcEQWdc2Sh0RWMWopsFN2m7UA-MwUytG2WMBdRmg_FR97OoUyBdtfcw1JYInvPErZOEqoIpYylZXC4Hs2Fliymbyqi1fM_I_vjCzheQXfGzrG45f6HFqJmh_P5o"
              />
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Growth & Connection
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm text-center md:text-left">
              © {currentYear} Growth & Connection. Empowering professional journeys through strategic
              networking.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-md md:gap-xl">
            {footerLinks.map((link, idx) => (
              <a
                key={idx}
                className="text-on-surface-variant font-label-sm hover:text-primary transition-all duration-200 hover:underline decoration-secondary underline-offset-4"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex gap-md">
            <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-90">
              <span className="material-symbols-outlined text-on-surface-variant">share</span>
            </button>
            <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-90">
              <span className="material-symbols-outlined text-on-surface-variant">mail</span>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

const testimonials = [
  {
    quote:
      '"The strategic networking tools have completely transformed how our team approaches business development. The connections we make are higher quality and data-backed."',
    initials: 'SM',
    name: 'Sarah J. Miller',
    title: 'CTO, TechVision',
  },
  {
    quote:
      '"Efficiency is everything in operations. The resource library gives us instant access to the frameworks we need to scale rapidly without reinventing the wheel."',
    initials: 'DC',
    name: 'David Chen',
    title: 'Director of Operations',
  },
  {
    quote:
      '"Growth & Connection isn\'t just a platform; it\'s a strategic partner. Our growth tracking has shown a 40% increase in lead conversion since joining."',
    initials: 'ER',
    name: 'Elena Rodriguez',
    title: 'VP of Strategy',
  },
];

const footerLinks = [
  'Privacy Policy',
  'Terms of Service',
  'Cookie Policy',
  'Contact Us',
  'Resources',
];