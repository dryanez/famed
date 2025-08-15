import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, ArrowRight, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const getLevelColor = (level) => {
  switch (level) {
    case 'Beginner': return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700";
    case 'Intermediate': return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700";
    case 'Advanced': return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700";
    case 'CaseStudy': return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700";
    default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
  }
};

const getScoreColor = (score) => {
    if (score >= 90) return "[&>div]:bg-green-500";
    if (score >= 70) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
};

export default function RecentAssessments({ assessments, isLoading, isGuest }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-gray-900 dark:text-white">Lade letzte Bewertungen...</CardTitle></CardHeader>
        <CardContent><div className="h-40 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <Clock className="w-5 h-5 text-blue-500" />
          Letzte Bewertungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assessments.length > 0 ? (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Link to={isGuest ? '#' : createPageUrl(`AssessmentDetail?id=${assessment.id}`)} key={assessment.id}>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{assessment.prompt_text}</p>
                      {assessment.flashcard_deck && (
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Deck: {assessment.flashcard_deck}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={getLevelColor(assessment.difficulty_level)}>
                        {assessment.difficulty_level}
                      </Badge>
                      <Badge className={`text-white border-none ${assessment.overall_score >= 70 ? 'bg-green-500' : assessment.overall_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
                        {Math.round(assessment.overall_score)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <div>
                      Aussprache:
                      <Progress value={assessment.pronunciation_score} className={`h-1.5 mt-1 ${getScoreColor(assessment.pronunciation_score)}`} />
                    </div>
                    <div>
                      Grammatik:
                      <Progress value={assessment.grammar_score} className={`h-1.5 mt-1 ${getScoreColor(assessment.grammar_score)}`} />
                    </div>
                    <div>
                      Flüssigkeit:
                      <Progress value={assessment.fluency_score} className={`h-1.5 mt-1 ${getScoreColor(assessment.fluency_score)}`} />
                    </div>
                  </div>
                   <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {format(new Date(assessment.created_date), "dd.MM.yyyy 'um' HH:mm", { locale: de })}
                    </p>
                </div>
              </Link>
            ))}
             <Link to={createPageUrl(isGuest ? "Pricing" : "Progress")}>
                <Button variant="outline" className="w-full mt-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-gray-200 dark:border-gray-600">
                  Alle Bewertungen anzeigen <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>Keine Bewertungen gefunden</p>
            <p className="text-sm mt-1">Starten Sie eine Übung, um Ihren Fortschritt zu sehen!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}