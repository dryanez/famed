
import React, { useState, useEffect } from "react";
import { User, MedicalCase } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Stethoscope, FileText, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateLevelInfo } from "../components/gamification/GamificationProfile";
import { getEffectiveAccountType } from "../components/utils/subscriptionLimits";

export default function MedicalCases() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = user === null;
  const userLevel = user?.level || 1;

  // Define all medical systems
  const medicalSystems = [
    { id: "all", name: "Alle Fälle", icon: "🏥" },
    { id: "respiratorisches", name: "Respiratorisch", icon: "🫁" },
    { id: "immunsystem", name: "Immunsystem", icon: "🛡️" },
    { id: "gastrointestinal", name: "Gastrointestinal", icon: "🫃" },
    { id: "rheumatologie", name: "Rheumatologie", icon: "🦴" },
    { id: "nephrologie", name: "Nephrologie", icon: "🫘" },
    { id: "hamatologie", name: "Hämatologie", icon: "🩸" },
    { id: "endokrinologie", name: "Endokrinologie", icon: "⚖️" },
    { id: "kardiovaskulär", name: "Kardiovaskulär", icon: "❤️" },
    { id: "neurologie", name: "Neurologie", icon: "🧠" },
    { id: "orthopädie", name: "Orthopädie", icon: "🦴" }
  ];

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
    const data = await MedicalCase.list();
    setCases(data);
    setIsLoading(false);
  };

  const handleCaseClick = (caseId) => {
    const effectiveAccountType = getEffectiveAccountType(user);
    const hasProAccess = effectiveAccountType === 'paid_1m' || effectiveAccountType === 'paid_3m';

    if (isGuest || !hasProAccess) {
      navigate(createPageUrl("Upgrade"));
    } else {
      console.log("Navigating to case detail with ID:", caseId);
      navigate(createPageUrl(`CaseDetail?id=${caseId}`));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Respiratorisches System": "bg-blue-100 text-blue-800",
      "Immunsystem / Allergologie": "bg-purple-100 text-purple-800",
      "Gastrointestinales System": "bg-green-100 text-green-800",
      "Rheumatologisches System": "bg-orange-100 text-orange-800",
      "Nephrologisches System": "bg-cyan-100 text-cyan-800",
      "Hämatologisches System": "bg-red-100 text-red-800",
      "Endokrinologisches System": "bg-yellow-100 text-yellow-800",
      "Kardiovaskuläres System": "bg-rose-100 text-rose-800",
      "Neurologisches System": "bg-indigo-100 text-indigo-800",
      "Orthopädisches System": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getSystemKey = (category) => {
    const mapping = {
      "Respiratorisches System": "respiratorisches",
      "Immunsystem / Allergologie": "immunsystem",
      "Gastrointestinales System": "gastrointestinal",
      "Rheumatologisches System": "rheumatologie",
      "Nephrologisches System": "nephrologie",
      "Hämatologisches System": "hamatologie",
      "Endokrinologisches System": "endokrinologie",
      "Kardiovaskuläres System": "kardiovaskulär",
      "Neurologisches System": "neurologie",
      "Orthopädisches System": "orthopädie"
    };
    return mapping[category] || "other";
  };

  const filterCasesBySystem = (systemId) => {
    if (systemId === "all") return cases;
    return cases.filter(caseItem => getSystemKey(caseItem.category) === systemId);
  };

  const CaseGrid = ({ filteredCases }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array(6).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </CardContent>
          </Card>
        ))
      ) : filteredCases.length > 0 ? (
        filteredCases.map((caseItem, index) => {
          const isChallenge = caseItem.is_challenge;
          const isLocked = isChallenge && userLevel < 5;

          return (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="h-full"
          >
            <Card
                className={`shadow-lg border-2 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group ${isLocked ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                onClick={() => !isLocked && handleCaseClick(caseItem.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                    {caseItem.title}
                  </CardTitle>
                  {isChallenge ? (
                    <Badge variant="destructive" className="flex-shrink-0">Challenge</Badge>
                  ) : (
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <Badge className={`${getCategoryColor(caseItem.category)} text-xs`}>
                  {caseItem.category}
                </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {caseItem.summary}
                </p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button
                    className={`w-full transition-all group-hover:shadow-lg ${isLocked ? 'bg-gray-400' : 'bg-gradient-to-r from-green-700 to-green-600 group-hover:from-green-600 group-hover:to-green-500'}`}
                    tabIndex={-1}
                    disabled={isLocked}
                >
                  {(isGuest || getEffectiveAccountType(user) === 'free' || isLocked) && <Lock className="w-4 h-4 mr-2" />}
                  {isLocked ? `Level 5 benötigt` : `Fall ansehen`}
                  {!isLocked && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        )})
      ) : (
        <div className="col-span-full text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Keine Fälle in diesem System verfügbar</p>
          <p className="text-gray-400 text-sm mt-2">Weitere Fälle werden bald hinzugefügt</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Stethoscope className="w-10 h-10 text-green-700 dark:text-green-400" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Medizinische Fälle
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Eine Sammlung von klinischen Fallstudien zum Lernen und Üben.
              </p>
            </div>
          </div>
        </div>

        {/* Access Alert */}
        {(!user || getEffectiveAccountType(user) === 'free') && (
          <Alert className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-lg">
              <strong>Upgrade erforderlich:</strong> Medizinische Fälle sind Teil der bezahlten Pläne.
              <Link to={createPageUrl("Upgrade")} className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 ml-2">
                Jetzt upgraden →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for different medical systems */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 mb-8 h-auto p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {medicalSystems.map((system) => (
              <TabsTrigger
                key={system.id}
                value={system.id}
                className="flex flex-col items-center p-3 text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white dark:text-gray-300 dark:data-[state=active]:bg-green-600"
              >
                <span className="text-lg mb-1">{system.icon}</span>
                <span className="font-medium">{system.name}</span>
                <span className="text-xs opacity-70">
                  ({system.id === "all" ? cases.length : filterCasesBySystem(system.id).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Contents */}
          {medicalSystems.map((system) => (
            <TabsContent key={system.id} value={system.id} className="mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">{system.icon}</span>
                  {system.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {system.id === "all"
                    ? "Alle verfügbaren medizinischen Fälle in der Übersicht"
                    : `Klinische Fälle aus dem Bereich ${system.name.toLowerCase()}`
                  }
                </p>
              </div>
              <CaseGrid filteredCases={filterCasesBySystem(system.id)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
  );
}
