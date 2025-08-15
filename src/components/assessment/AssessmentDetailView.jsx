import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle, AlertTriangle, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function AssessmentDetailView({ assessment }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };
  
  const getScoreBgColor = (score) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  const getScoreProgressColor = (score) => {
    if (score >= 80) return "[&>div]:bg-green-500";
    if (score >= 60) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
  }

  const getTypeBadge = (type) => {
    const styles = {
      "Grammatik": "bg-blue-900/50 text-blue-300 border-blue-700",
      "Aussprache": "bg-purple-900/50 text-purple-300 border-purple-700",
      "Wortwahl": "bg-yellow-900/50 text-yellow-300 border-yellow-700",
      "Struktur": "bg-indigo-900/50 text-indigo-300 border-indigo-700"
    };
    return styles[type] || "bg-gray-700 text-gray-300 border-gray-600";
  };

  const feedback = assessment.feedback || {};
  const improvementPoints = feedback.improvement_points || [];
  const positivePoints = feedback.positive_points || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <Card className="text-center shadow-2xl border-0 bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className={`w-32 h-32 bg-gradient-to-br ${getScoreBgColor(assessment.overall_score)} rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg`}>
            <div className="text-center text-white">
              <Award className="w-8 h-8 mx-auto mb-1" />
              <span className="text-2xl font-bold">{Math.round(assessment.overall_score)}%</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Gesamtergebnis</h2>
          <p className="text-gray-300 max-w-2xl mx-auto line-clamp-2">"{assessment.prompt_text}"</p>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-white">Aussprache</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.pronunciation_score)}`}>
              {Math.round(assessment.pronunciation_score)}%
            </div>
            <Progress value={assessment.pronunciation_score} className={`h-3 ${getScoreProgressColor(assessment.pronunciation_score)}`} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-white">Grammatik</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.grammar_score)}`}>
              {Math.round(assessment.grammar_score)}%
            </div>
            <Progress value={assessment.grammar_score} className={`h-3 ${getScoreProgressColor(assessment.grammar_score)}`} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-white">Flüssigkeit</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(assessment.fluency_score)}`}>
              {Math.round(assessment.fluency_score)}%
            </div>
            <Progress value={assessment.fluency_score} className={`h-3 ${getScoreProgressColor(assessment.fluency_score)}`} />
          </CardContent>
        </Card>
      </div>
      
      {/* Transcription */}
      <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            Ihre Antwort (Transkript)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 max-h-48 overflow-y-auto">
            <p className="text-gray-200 italic text-sm">"{assessment.transcription}"</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Improvement Points */}
      {improvementPoints.length > 0 && (
        <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Verbesserungspunkte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {improvementPoints.map((item, index) => (
              <div key={index} className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
                  <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`${getTypeBadge(item.type)}`}>{item.type}</Badge>
                          <p className="text-sm font-semibold text-red-400 line-through">"{item.original}"</p>
                      </div>
                      <p className="text-sm font-semibold text-green-400">
                          <span className="font-normal text-gray-300">Korrektur:</span> "{item.correction}"
                      </p>
                      {item.explanation && (
                        <p className="text-sm text-gray-300 mt-2">
                           <span className="font-medium text-gray-200">Erklärung:</span> {item.explanation}
                        </p>
                      )}
                  </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Positive Points */}
      {positivePoints.length > 0 && (
        <Card className="shadow-lg border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Positive Punkte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {positivePoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-green-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-green-300 text-sm">{point}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}