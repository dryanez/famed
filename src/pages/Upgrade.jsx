
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { STRIPE_CONFIG, getStripePaymentLink } from '../components/utils/subscriptionLimits';
import { getEffectiveAccountType, getDaysRemaining, PLAN_NAMES } from '../components/utils/subscriptionLimits';

const PlanFeature = ({ children }) => (
  <li className="flex items-center gap-3">
    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
    <span className="text-gray-600 dark:text-gray-300">{children}</span>
  </li>
);

export default function Upgrade() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser) {
                    const plan = getEffectiveAccountType(currentUser);
                    setCurrentPlan(plan);
                    setDaysRemaining(getDaysRemaining(currentUser));
                }
            } catch (e) {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const plans = [
        {
          id: 'paid_1m',
          name: '1-Monat Intensiv',
          price: '€59',
          duration: 'für 30 Tage',
          description: 'Perfekt für die kurzfristige, intensive Vorbereitung.',
          features: [
            `Unbegrenzte KI-Sprechübungen`,
            `Unbegrenzte Anamnese & Aufklärung`,
            `Zugriff auf ALLE medizinischen Fälle`,
            `Voller Zugriff auf Lernkarten`,
            `Prüfungssimulationen freigeschaltet`,
          ],
          cta: 'Intensiv Plan Wählen',
          badge: 'Beliebt',
        },
        {
          id: 'paid_3m',
          name: '3-Monate Prüfungs-Prep',
          price: '€129',
          duration: 'Bestes Preis-Leistungs-Verhältnis',
          description: 'Umfassende Vorbereitung für den maximalen Erfolg.',
          features: [
            'Alle Vorteile des Intensiv-Plans',
            'Offline-Zugriff auf Lernmaterialien',
            'Abschlusszertifikat nach Beendigung',
            'Priorisierter Support',
            'Exklusive Inhalte & Fallstudien',
          ],
          cta: 'Prüfungs-Prep Wählen',
          badge: 'Bester Wert',
          isFeatured: true,
        },
        {
          id: 'test_plan',
          name: 'Test Plan',
          price: '€1',
          duration: '(Simuliert)',
          description: 'Nur für Testzwecke. Verwendet Test-Kreditkarten, keine echten Kosten.',
          features: [
            `Simuliert den Kauf des 1-Monats-Plans.`,
            `Verifiziert den gesamten Zahlungsprozess.`,
            `Wird nicht auf echten Konten abgebucht.`,
          ],
          cta: 'Testkauf Starten',
          badge: 'Entwickler',
        },
    ];

    const handlePurchase = (planId) => {
        if (!user) {
            alert("Bitte loggen Sie sich ein, um einen Plan zu kaufen.");
            User.login();
            return;
        }

        if (STRIPE_CONFIG.STRIPE_ENABLED) {
            // Updated call to getStripePaymentLink, now includes user.id
            const paymentLink = getStripePaymentLink(planId, user.email, user.id);
            
            if (paymentLink) {
                // The link now contains everything needed. Just redirect.
                window.location.href = paymentLink;
            } else {
                alert("Stripe Payment Link ist für diesen Plan nicht konfiguriert.");
            }
        } else {
            alert("Stripe-Zahlungen sind derzeit deaktiviert.");
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Pläne & Preise</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Wählen Sie den Plan, der am besten zu Ihren Vorbereitungszielen passt.</p>
                </div>

                {currentPlan !== 'free' && (
                    <Card className="mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="text-green-600" />
                                Ihr aktueller Plan: {PLAN_NAMES[currentPlan]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-200">
                                {daysRemaining > 0 ? `Ihr Plan ist noch ${daysRemaining} Tage gültig.` : "Ihr Plan ist abgelaufen."}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`flex flex-col border-2 dark:bg-gray-800/80 shadow-lg transition-all duration-300 ${plan.isFeatured ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-500'}`}>
                            <CardHeader className="p-6">
                                {plan.badge && <div className={`text-xs font-bold uppercase mb-2 ${plan.isFeatured ? 'text-blue-500' : 'text-gray-500'}`}>{plan.badge}</div>}
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                                    {plan.price} <span className="text-base font-medium text-gray-500 dark:text-gray-400">{plan.duration}</span>
                                </div>
                                <CardDescription className="mt-2 text-gray-600 dark:text-gray-300 h-10">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow p-6">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <PlanFeature key={i}>{feature}</PlanFeature>
                                    ))}
                                </ul>
                            </CardContent>
                            <div className="p-6 mt-auto">
                                <Button
                                    onClick={() => handlePurchase(plan.id)}
                                    size="lg"
                                    className={`w-full text-white font-semibold ${plan.isFeatured ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-800'}`}
                                >
                                    {plan.cta}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
