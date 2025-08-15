
import React, { useState, useEffect } from "react";
import { SpeechAssessment, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Award, Calendar, Target, Medal, Sparkles, Trophy, ListOrdered, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProgressPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const data = await SpeechAssessment.filter({ created_by: currentUser.email }, "-created_date");
      setAssessments(data);
    } catch (error) {
      console.log("Progress page viewed by guest.");
      setUser(null);
      setAssessments([]);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (!isLoading) {
      setAchievements(calculateAchievements(assessments));
    }
  }, [assessments, isLoading]);

  // Calculate statistics (modified to accept assessments as parameter for purity)
  const getStats = (assessmentsToProcess = assessments) => {
    if (assessmentsToProcess.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        bestScore: 0,
        improvementTrend: 0,
        weeklyData: []
      };
    }

    const totalAssessments = assessmentsToProcess.length;
    const averageScore = assessmentsToProcess.reduce((sum, a) => sum + (a.overall_score || 0), 0) / totalAssessments;
    const bestScore = Math.max(...assessmentsToProcess.map(a => a.overall_score || 0));
    
    // Calculate improvement trend (compare first half vs second half)
    const halfPoint = Math.floor(totalAssessments / 2);
    // Ensure there are enough assessments for both halves to avoid division by zero or NaN
    const firstHalfScores = assessmentsToProcess.slice(-halfPoint);
    const secondHalfScores = assessmentsToProcess.slice(0, halfPoint);

    const firstHalfAvg = firstHalfScores.length > 0 ? firstHalfScores.reduce((sum, a) => sum + (a.overall_score || 0), 0) / firstHalfScores.length : 0;
    const secondHalfAvg = secondHalfScores.length > 0 ? secondHalfScores.reduce((sum, a) => sum + (a.overall_score || 0), 0) / secondHalfScores.length : 0;
    
    const improvementTrend = secondHalfAvg - firstHalfAvg;

    // Weekly data for the last 4 weeks
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekAssessments = assessmentsToProcess.filter(assessment => {
        const assessmentDate = new Date(assessment.created_date);
        return assessmentDate >= weekStart && assessmentDate <= weekEnd;
      });

      weeklyData.push({
        week: format(weekStart, 'dd.MM', { locale: de }),
        count: weekAssessments.length,
        averageScore: weekAssessments.length > 0 
          ? weekAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / weekAssessments.length 
          : 0
      });
    }

    return {
      totalAssessments,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      improvementTrend: Math.round(improvementTrend),
      weeklyData
    };
  };

  const getScoresByCategory = () => {
    if (assessments.length === 0) return [];

    const byLevel = assessments.reduce((acc, assessment) => {
      const level = assessment.difficulty_level || 'Unknown';
      if (!acc[level]) {
        acc[level] = { total: 0, count: 0, pronunciation: 0, grammar: 0, fluency: 0 };
      }
      acc[level].total += assessment.overall_score || 0;
      acc[level].pronunciation += assessment.pronunciation_score || 0;
      acc[level].grammar += assessment.grammar_score || 0;
      acc[level].fluency += assessment.fluency_score || 0;
      acc[level].count += 1;
      return acc;
    }, {});

    return Object.entries(byLevel).map(([level, data]) => ({
      level,
      averageScore: Math.round(data.total / data.count),
      pronunciation: Math.round(data.pronunciation / data.count),
      grammar: Math.round(data.grammar / data.count),
      fluency: Math.round(data.fluency / data.count),
      count: data.count
    }));
  };

  const calculateAchievements = (userAssessments) => {
    const currentStats = getStats(userAssessments); 
    const bestScore = userAssessments.length > 0 ? Math.max(...userAssessments.map(a => a.overall_score || 0)) : 0;
    
    const achievedList = [
        { 
            id: 'first_assessment', 
            name: 'Erste Übung', 
            description: 'Schließe deine erste Sprechübung ab.', 
            icon: <Sparkles className="w-5 h-5" />, 
            achieved: userAssessments.length >= 1,
            color: 'text-amber-500'
        },
        { 
            id: 'five_assessments', 
            name: 'Fleißig Lernender', 
            description: 'Schließe 5 Sprechübungen ab.', 
            icon: <Medal className="w-5 h-5" />, 
            achieved: userAssessments.length >= 5,
            color: 'text-lime-500'
        },
        { 
            id: 'ten_assessments', 
            name: 'Meister der Praxis', 
            description: 'Schließe 10 Sprechübungen ab.', 
            icon: <Trophy className="w-5 h-5" />, 
            achieved: userAssessments.length >= 10,
            color: 'text-red-500'
        },
        { 
            id: 'high_scorer', 
            name: 'Spitzenleistung', 
            description: 'Erreiche eine Punktzahl von 90% oder höher.', 
            icon: <Star className="w-5 h-5" />, 
            achieved: bestScore >= 90,
            color: 'text-yellow-500'
        },
        { 
            id: 'master_speaker', 
            name: 'Meisterredner', 
            description: 'Erreiche eine Punktzahl von 95% oder höher.', 
            icon: <Award className="w-5 h-5" />, 
            achieved: bestScore >= 95,
            color: 'text-teal-500'
        },
        { 
            id: 'improver', 
            name: 'Kontinuierliche Verbesserung', 
            description: 'Verbessere deinen Durchschnitt um 10% oder mehr.', 
            icon: <TrendingUp className="w-5 h-5" />, 
            achieved: userAssessments.length >= 2 && currentStats.improvementTrend >= 10,
            color: 'text-indigo-500'
        }
    ];
    return achievedList;
  };

  const stats = getStats(); // Use the state-based assessments for display
  const scoresByCategory = getScoresByCategory();

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Intermediate': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'Advanced': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "[&>div]:bg-green-500";
    if (score >= 70) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          </div>
      );
  }

  // Guest View
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500"/>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verfolgen Sie Ihren Fortschritt</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                Registrieren Sie sich oder melden Sie sich an, um Ihre Statistiken, Erfolge und Verbesserungen zu sehen.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button size="lg" className="w-full">Jetzt kostenlos starten</Button>
            </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meine Erfolge & Statistiken</h1>
            <p className="text-gray-600 dark:text-gray-300">Verfolgen Sie Ihre Verbesserung und Meilensteine</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAssessments}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gesamte Übungen</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Durchschnitt</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.bestScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bestes Ergebnis</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className={`text-3xl font-bold ${stats.improvementTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verbesserung</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Progress */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 text-green-600" />
                Wochenübersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Woche {week.week}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{week.count} Übungen</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {week.averageScore > 0 ? `${Math.round(week.averageScore)}%` : '-'}
                      </p>
                      <div className="w-20">
                        <Progress value={week.averageScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance by Level */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Award className="w-5 h-5 text-amber-600" />
                Leistung nach Schwierigkeit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoresByCategory.map((category) => (
                <div key={category.level} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getLevelColor(category.level)} border`}>
                        {category.level}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-300">({category.count} Übungen)</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{category.averageScore}%</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Aussprache:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={category.pronunciation} className={`h-2 flex-1 ${getScoreColor(category.pronunciation)}`} />
                        <span className="text-xs font-medium w-8 text-gray-900 dark:text-white">{category.pronunciation}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Grammatik:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={category.grammar} className={`h-2 flex-1 ${getScoreColor(category.grammar)}`} />
                        <span className="text-xs font-medium w-8 text-gray-900 dark:text-white">{category.grammar}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Flüssigkeit:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={category.fluency} className={`h-2 flex-1 ${getScoreColor(category.fluency)}`} />
                        <span className="text-xs font-medium w-8 text-gray-900 dark:text-white">{category.fluency}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {scoresByCategory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>Noch keine Daten verfügbar</p>
                  <p className="text-sm mt-1">Starten Sie Übungen, um Ihren Fortschritt zu verfolgen!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gamification Section (now only Achievements) */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Achievements Card */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Meine Erfolge
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement) => (
                                <div 
                                    key={achievement.id} 
                                    className={`flex items-center gap-3 p-4 rounded-lg border ${achievement.achieved ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70'}`}
                                >
                                    <div className={`flex-shrink-0 ${achievement.achieved ? achievement.color : 'text-gray-400'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${achievement.achieved ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{achievement.name}</h4>
                                        <p className={`text-sm ${achievement.achieved ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>{achievement.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Medal className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p>Noch keine Erfolge freigeschaltet.</p>
                            <p className="text-sm mt-1">Beginnen Sie mit Übungen, um Auszeichnungen zu verdienen!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
