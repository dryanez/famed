
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen,
  RotateCcw,
  Plus,
  Trophy // Added Trophy icon for gamification
} from "lucide-react";
import { motion } from "framer-motion";

export default function AssessmentResults({ assessment, onAddToFlashcards, onReset, xpEarned }) {
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return "from-green-500 to-green-600";
    if (score >= 70) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <Card className="text-center bg-gradient-to-r from-white to-gray-50 border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className={`w-32 h-32 bg-gradient-to-br ${getScoreBgColor(assessment.overall_score)} rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg`}>
            <div className="text-center text-white">
              <Award className="w-8 h-8 mx-auto mb-1" />
              <span className="text-2xl font-bold">{Math.round(assessment.overall_score)}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bewertung abgeschlossen!</h2>
          <p className="text-gray-600">Hier ist Ihr detailliertes Feedback</p>
          {xpEarned > 0 && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold rounded-full shadow-lg"
            >
              +{xpEarned} XP Verdient!
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Aussprache
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.pronunciation_score)}`}>
              {Math.round(assessment.pronunciation_score)}%
            </div>
            <Progress value={assessment.pronunciation_score} className="h-3" />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Grammatik
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.grammar_score)}`}>
              {Math.round(assessment.grammar_score)}%
            </div>
            <Progress value={assessment.grammar_score} className="h-3" />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Flüssigkeit
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.fluency_score)}`}>
              {Math.round(assessment.fluency_score)}%
            </div>
            <Progress value={assessment.fluency_score} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Transcription */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Was Sie gesagt haben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-gray-800 italic">"{assessment.transcription}"</p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Sections */}
      {assessment.feedback && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pronunciation Issues */}
          {assessment.feedback.pronunciation_issues && assessment.feedback.pronunciation_issues.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Aussprache-Verbesserungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessment.feedback.pronunciation_issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">"{issue.word}"</p>
                        <p className="text-sm text-red-600 mt-1">{issue.issue}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Korrektur:</span> {issue.correction}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToFlashcards(issue, 'pronunciation')}
                        className="shrink-0 hover:bg-red-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Grammar Issues */}
          {assessment.feedback.grammar_issues && assessment.feedback.grammar_issues.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  Grammatik-Verbesserungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessment.feedback.grammar_issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-amber-800">"{issue.phrase}"</p>
                        <p className="text-sm text-amber-600 mt-1">{issue.issue}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Korrektur:</span> {issue.correction}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToFlashcards(issue, 'grammar')}
                        className="shrink-0 hover:bg-amber-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Positive Feedback */}
      {assessment.feedback && assessment.feedback.positive_points && assessment.feedback.positive_points.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Was gut war
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessment.feedback.positive_points.map((point, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-green-800 text-sm">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Section (New Gamification Feature) */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Award className="w-5 h-5" /> 
            Ihre Errungenschaften
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />
              <div>
                <p className="font-semibold text-purple-800">Erster Meilenstein!</p>
                <p className="text-sm text-gray-600">Haben Sie Ihre erste Bewertung abgeschlossen.</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-purple-200 text-purple-800">Abgeschlossen</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">50% Aussprache-Meister</p>
                <p className="text-sm text-gray-600">Erreichen Sie 50% in der Aussprachebewertung.</p>
              </div>
              <Badge variant="outline" className="ml-auto text-gray-600">Ausstehend</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Section (New Gamification Feature) */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Trophy className="w-5 h-5" />
            Bestenliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="font-bold text-yellow-800 text-lg w-6 text-center">1.</span>
              <div>
                <p className="font-semibold text-gray-800">Sprecher-Königin</p>
                <p className="text-sm text-gray-600">Gesamtpunktzahl: 95%</p>
              </div>
              <Badge variant="default" className="ml-auto bg-yellow-400 text-white">Sie</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-bold text-gray-800 text-lg w-6 text-center">2.</span>
              <div>
                <p className="font-semibold text-gray-800">Sprach-Genie</p>
                <p className="text-sm text-gray-600">Gesamtpunktzahl: 92%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-bold text-gray-800 text-lg w-6 text-center">3.</span>
              <div>
                <p className="font-semibold text-gray-800">Wort-Meister</p>
                <p className="text-sm text-gray-600">Gesamtpunktzahl: 88%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={onReset}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 font-semibold"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Neue Übung starten
        </Button>
      </div>
    </motion.div>
  );
}
