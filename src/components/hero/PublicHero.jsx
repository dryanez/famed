
import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { MoveRight, PlayCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoModal from './DemoModal';

const MetricCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.8 }}
    className="absolute -bottom-8 -right-8 w-48 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-lg"
  >
    <p className="text-xs font-semibold text-white">Sample AI Feedback</p>
    <div className="mt-2 space-y-1 text-xs text-gray-300">
      <div className="flex justify-between"><span>Aussprache</span><span className="font-mono font-medium text-green-400">92%</span></div>
      <div className="flex justify-between"><span>Grammatik</span><span className="font-mono font-medium text-green-400">88%</span></div>
      <div className="flex justify-between"><span>Flüssigkeit</span><span className="font-mono font-medium text-green-400">90%</span></div>
    </div>
  </motion.div>
);

const PublicHero = ({
    screenshotSrc = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png',
    demoVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Placeholder video
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStartFree = async () => {
        try {
            // Trigger the login/signup flow
            await User.login();
        } catch (error) {
            console.error('Login failed:', error);
            // Login method should redirect to Google auth automatically
        }
    };

    return (
        <>
            <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white">
                {/* JSON-LD Structured Data for Google */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "EducationalOrganization",
                            "name": "FaMED Test Prep",
                            "description": "KI-gestützte Vorbereitung auf die deutsche medizinische Sprachprüfung",
                            "url": "https://famedtestprep.com",
                            "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dea42d9a1_9108119c1_logo.jpg",
                            "image": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png",
                            "sameAs": [
                                "https://famed-test.de"
                            ],
                            "address": {
                                "@type": "PostalAddress",
                                "addressCountry": "DE"
                            },
                            "offers": {
                                "@type": "Offer",
                                "category": "Education",
                                "availability": "https://schema.org/InStock",
                                "priceValidUntil": "2025-12-31"
                            },
                            "courseMode": "online",
                            "educationalLevel": "Professional",
                            "teaches": [
                                "Medizinische Kommunikation auf Deutsch",
                                "Anamnese Gespräche",
                                "Aufklärungsgespräche",
                                "Deutsche Aussprache für Ärzte"
                            ],
                            "provider": {
                                "@type": "Organization",
                                "name": "FaMED Test Prep"
                            }
                        })
                    }}
                />

                {/* Additional structured data for Course */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Course",
                            "name": "FaMED Sprachprüfung Vorbereitung",
                            "description": "Comprehensive preparation for German medical language examination with AI-powered feedback",
                            "provider": {
                                "@type": "Organization",
                                "name": "FaMED Test Prep"
                            },
                            "hasCourseInstance": {
                                "@type": "CourseInstance",
                                "courseMode": "online",
                                "courseWorkload": "PT10H"
                            },
                            "teaches": [
                                "Medical German vocabulary",
                                "Patient communication",
                                "Medical case studies",
                                "Pronunciation training"
                            ],
                            "audience": {
                                "@type": "EducationalAudience",
                                "educationalRole": "Medical professionals"
                            }
                        })
                    }}
                />

                <div className="absolute inset-0 z-0">
                    <div className="absolute left-[-10%] top-[10%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl"></div>
                    <div className="absolute right-[-10%] bottom-[5%] h-[300px] w-[500px] rounded-full bg-rose-500/10 blur-3xl"></div>
                </div>

                <main className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Left Column: Copy */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left"
                        >
                            <span className="mb-4 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-400">
                                <ShieldCheck className="mr-2 inline h-4 w-4" />
                                Built for FaMED candidates
                            </span>
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                FaMED Test Prep — AI-powered medical German practice
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                Train Anamnese and Aufklärung with realistic case simulations and instant AI feedback on pronunciation, grammar, and fluency—exactly like the real exam.
                            </p>
                            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                <Button 
                                    size="lg" 
                                    onClick={handleStartFree}
                                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 font-semibold text-white shadow-lg hover:shadow-green-500/30 transition-shadow"
                                    aria-label="Start your free trial"
                                >
                                    Jetzt kostenlos starten
                                    <MoveRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="ghost" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)} aria-label="Watch a 60-second demo">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    Watch 60-sec Demo
                                </Button>
                            </div>
                            <p className="mt-6 text-xs text-gray-400">
                                Practice cases • AI speech feedback • Mock exam mode
                            </p>
                        </motion.div>

                        {/* Right Column: Visual */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
                                <img
                                    src={screenshotSrc}
                                    alt="Famed Test Prep application showing medical case studies including Mastoidektomie, Koloskopie, and Koronarangiographie"
                                    className="rounded-2xl"
                                />
                            </div>
                            <MetricCard />
                        </motion.div>
                    </div>

                    <div className="mt-24 text-center text-xs text-gray-500">
                        <p>Not affiliated with the official FaMed examination authority.</p>
                    </div>
                </main>
            </div>
            <DemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} videoUrl={demoVideoUrl} />
        </>
    );
};

export default PublicHero;
