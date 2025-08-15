import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, SpeechAssessment, Flashcard, Assignment, Submission } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Mic,
  TrendingUp,
  CreditCard,
  Award,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
  BookCheck,
  CheckCircle,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { getEffectiveAccountType, getDaysRemaining, PLAN_NAMES } from "@/components/utils/subscriptionLimits";

import QuickStats from "../components/dashboard/QuickStats";
import RecentAssessments from "../components/dashboard/RecentAssessments";
import WeeklyProgress from "../components/dashboard/WeeklyProgress";
import LevelProgressCard from "../components/dashboard/LevelProgressCard";
import Leaderboard from "../components/dashboard/Leaderboard";

const guestData = {
  assessments: [
    { id: 'guest1', created_date: new Date().toISOString(), overall_score: 85, prompt_text: "Hallo, wie geht es Ihnen heute?", difficulty_level: "Beginner", pronunciation_score: 88, grammar_score: 90, fluency_score: 80 },
    { id: 'guest2', created_date: new Date(Date.now() - 86400000).toISOString(), overall_score: 78, prompt_text: "Ich möchte einen Termin beim Arzt vereinbaren.", difficulty_level: "Intermediate", pronunciation_score: 75, grammar_score: 82, fluency_score: 77 },
    { id: 'guest3', created_date: new Date(Date.now() - 172800000).toISOString(), overall_score: 92, prompt_text: "Die Anamnese des Patienten ergab eine bekannte Herzinsuffizienz.", difficulty_level: "CaseStudy", pronunciation_score: 95, grammar_score: 90, fluency_score: 91 },
  ],
  flashcards: [
    { id: 'guest1', german_text: 'Anamnese', english_translation: 'Medical History', category: 'vocabulary' },
    { id: 'guest2', german_text: 'Verschreiben', english_translation: 'To prescribe', category: 'grammar' },
    { id: 'guest3', german_text: 'Röntgenaufnahme', english_translation: 'X-ray image', category: 'pronunciation' },
  ],
  stats: {
    todayAssessments: 1,
    averageScore: 85,
    flashcardsCount: 3,
    totalAssessments: 24,
  }
};

export default function Dashboard() {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [authUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && authUser) {
        // Use our custom auth user instead of Base44
        setUser(authUser);
        
        // Load user-specific data - using demo data for now
        // You can replace this with real API calls later
        setAssessments(guestData.assessments);
        setFlashcards(guestData.flashcards);
        setAssignments([]);
        setSubmissions([]);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const isGuest = !isAuthenticated || user === null;

  const getAverageScore = () => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce((sum, assessment) => sum + (assessment.overall_score || 0), 0);
    return Math.round(total / assessments.length);
  };
  
  const todayAssessmentsCount = assessments.filter(a => new Date(a.created_date).toDateString() === new Date().toDateString()).length;

  const isAssignmentCompleted = (assignmentId) => {
      return submissions.some(sub => sub.assignment_id === assignmentId);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-4xl mx-auto text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Willkommen bei Famed Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            Erstellen Sie ein Konto, um Ihren Fortschritt zu speichern und alle Funktionen freizuschalten.
          </p>
          
          <Card className="mb-8 bg-gradient-to-r from-green-800 to-green-700 border-none text-white shadow-2xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Starten Sie Ihre Vorbereitung</h2>
              <p className="text-green-100 mb-4">
                Verbessern Sie Ihre Aussprache mit AI-gestütztem Feedback
              </p>
              <Link to={createPageUrl("Home")}>
                <Button 
                  size="lg" 
                  className="bg-white text-green-800 hover:bg-green-50 shadow-lg font-semibold px-8 py-3"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Jetzt kostenlos starten
                </Button>
              </Link>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Funktionsübersicht</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickStats title="KI-Feedback" value="Sofort" icon={Mic} bgColor="from-blue-500 to-blue-600" subtitle="Aussprache & Grammatik" />
            <QuickStats title="Fallstudien" value="Realistisch" icon={BookOpen} bgColor="from-purple-500 to-purple-600" subtitle="Anamnese & Aufklärung" />
            <QuickStats title="Lernkarten" value="Intelligent" icon={CreditCard} bgColor="from-amber-500 to-amber-600" subtitle="Spaced Repetition" />
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated User Dashboard ---
  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Willkommen zurück! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Bereit für Ihre nächste Deutsch-Sprechübung?
          </p>
        </div>

        {/* Assignments Card */}
        {assignments.length > 0 && (
            <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <BookCheck className="w-5 h-5 text-indigo-500"/>
                        Meine Aufgaben
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                    {assignments.map(assignment => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{assignment.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fällig am: {format(new Date(assignment.due_date), 'dd.MM.yyyy')}</p>
                            </div>
                            {isAssignmentCompleted(assignment.id) ? (
                                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/20"><CheckCircle className="w-4 h-4 mr-2"/> Abgeschlossen</Badge>
                            ) : (
                                <Link to={createPageUrl(`CaseDetail?id=${assignment.resource_id}&assignmentId=${assignment.id}&classId=${assignment.class_id}`)}>
                                    <Button size="sm">Starten</Button>
                                </Link>
                            )}
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Quick Action */}
        <Card className="mb-8 bg-gradient-to-r from-green-800 to-green-700 border-none text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Neue Sprechübung starten</h2>
                <p className="text-green-100 mb-4">
                  Verbessern Sie Ihre Aussprache mit AI-gestütztem Feedback
                </p>
                <Link to={createPageUrl("Practice")}>
                  <Button 
                    size="lg" 
                    className="bg-white text-green-800 hover:bg-green-50 shadow-lg font-semibold px-8 py-3"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Jetzt üben
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Mic className="w-16 h-16 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickStats
            title="Heutige Übungen"
            value={todayAssessmentsCount.toString()}
            icon={Clock}
            bgColor="from-blue-500 to-blue-600"
            subtitle="Übungen heute"
          />
          <QuickStats
            title="Durchschnittliche Punktzahl"
            value={`${getAverageScore()}%`}
            icon={Target}
            bgColor="from-green-500 to-green-600"
            subtitle="Letzte Bewertungen"
          />
          <QuickStats
            title="Lernkarten"
            value={flashcards.length.toString()}
            icon={CreditCard}
            bgColor="from-amber-500 to-amber-600"
            subtitle="Gespeicherte Begriffe"
          />
          <QuickStats
            title="Gesamtübungen"
            value={assessments.length.toString()}
            icon={Award}
            bgColor="from-purple-500 to-purple-600"
            subtitle="Abgeschlossene Tests"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Assessments */}
          <div className="lg:col-span-2">
            <RecentAssessments 
              assessments={assessments}
              isLoading={isLoading}
              isGuest={false}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard />
            <Link to={createPageUrl("Progress")}>
                <LevelProgressCard user={user} />
            </Link>
            <WeeklyProgress assessments={assessments} />
            
            {/* Recent Flashcards */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Neueste Lernkarten
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flashcards.length > 0 ? (
                  <div className="space-y-3">
                    {flashcards.slice(0, 3).map((card) => (
                      <div 
                        key={card.id}
                        className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
                      >
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{card.german_text}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.english_translation}</p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            card.category === 'pronunciation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            card.category === 'grammar' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            card.category === 'vocabulary' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {card.category}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Link to={createPageUrl("Flashcards")}>
                      <Button variant="outline" className="w-full mt-4 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                        Alle Lernkarten anzeigen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Noch keine Lernkarten erstellt</p>
                    <p className="text-sm mt-1">Beginnen Sie mit einer Übung!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}