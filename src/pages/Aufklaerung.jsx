
import React, { useState, useEffect } from "react";
import { User, InformedConsentCase } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileSignature, Clock, Users, Lock, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getEffectiveAccountType } from "../components/utils/subscriptionLimits";

export default function Aufklaerung() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveAccountType = getEffectiveAccountType(user);
  const hasAccess = effectiveAccountType === 'paid_1m' || effectiveAccountType === 'paid_3m';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    const data = await InformedConsentCase.list("-created_date");
    setCases(data);
    setIsLoading(false);
  };

  const handleCaseClick = (caseItem, isFree) => {
    if (isFree || hasAccess) {
      navigate(createPageUrl(`AufklaerungTest?id=${caseItem.id}`));
    } else {
      navigate(createPageUrl("Upgrade"));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Viszeralchirurgie": "bg-emerald-500",
      "HNO": "bg-purple-500",
      "Innere Medizin / Gastroenterologie": "bg-blue-500",
      "Kardiologie": "bg-red-500",
      "Orthopädie": "bg-orange-500"
    };
    return colors[category] || "bg-gray-500";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Viszeralchirurgie": "🏥",
      "HNO": "👂",
      "Innere Medizin / Gastroenterologie": "🫀",
      "Kardiologie": "❤️",
      "Orthopädie": "🦴"
    };
    return icons[category] || "⚕️";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-full mb-6">
            <FileSignature className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Aufklärungsgespräche
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Trainieren Sie professionelle Patientenaufklärung vor medizinischen Eingriffen.
            Üben Sie mit realistischen Szenarien und erhalten Sie AI-basiertes Feedback.
          </p>
        </div>

        {/* Access Alert */}
        {!hasAccess && (
          <Alert className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-lg">
              <strong>Upgrade erforderlich:</strong> Testen Sie den ersten Fall als kostenlose Vorschau! Für vollen Zugriff benötigen Sie einen bezahlten Plan.
              <Link to={createPageUrl("Upgrade")} className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 ml-2">
                Jetzt upgraden →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">{cases.length}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Verfügbare Fälle</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">2 Min</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Pro Gespräch</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">AI</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Feedback System</div>
            </CardContent>
          </Card>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => {
            const isFree = index === 0;
            const isLocked = !isFree && !hasAccess;

            return (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 dark:bg-slate-800 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleCaseClick(caseItem, isFree)}
                >
                  {/* Category Header */}
                  <div className={`${getCategoryColor(caseItem.category)} p-4 text-white relative overflow-hidden`}>
                    {isFree && (
                        <Badge className="absolute top-3 left-3 bg-white text-teal-600 font-bold">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Kostenlose Vorschau
                        </Badge>
                    )}
                    <div className="absolute top-0 right-0 text-6xl opacity-20">
                      {getCategoryIcon(caseItem.category)}
                    </div>
                    <div className="relative z-10 pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase tracking-wider">
                          {caseItem.category}
                        </span>
                        {isLocked && <Lock className="w-5 h-5" />}
                      </div>
                      <h3 className="text-xl font-bold mt-2">{caseItem.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{caseItem.patient?.name}, {caseItem.patient?.age} Jahre</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{caseItem.procedure?.duration_minutes}</span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {caseItem.situation}
                      </p>

                      <div className="pt-4 border-t dark:border-slate-700">
                        <Button
                          className={`w-full transition-all group-hover:scale-105 ${
                            !isLocked
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                              : 'bg-gray-400 dark:bg-gray-600'
                          } text-white font-semibold`}
                          disabled={isLocked}
                        >
                          {!isLocked ? (
                            <>
                              <FileSignature className="w-4 h-4 mr-2" />
                              Aufklärung starten
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Upgrade erforderlich
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {cases.length === 0 && (
          <div className="text-center py-20">
            <FileSignature className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">Keine Fälle verfügbar</h3>
            <p className="text-gray-400 dark:text-gray-500">Neue Aufklärungsfälle werden bald hinzugefügt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
