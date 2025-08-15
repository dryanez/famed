import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, CheckCircle, AlertTriangle, Plus, FileText, Award, MessageSquare, BrainCircuit, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CaseTestResults({ assessment, caseItem, onAddToFlashcards, onReset, onBackToCases }) {
    
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  const getScoreBgColor = (score) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };
  
  const getTypeBadge = (type) => {
    const styles = {
      "Grammatik": "bg-blue-100 text-blue-800",
      "Aussprache": "bg-purple-100 text-purple-800",
      "Wortwahl": "bg-yellow-100 text-yellow-800",
      "Struktur": "bg-indigo-100 text-indigo-800",
      "Vollständigkeit": "bg-green-100 text-green-800",
      "Verständlichkeit": "bg-cyan-100 text-cyan-800"
    };
    return styles[type] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="text-center shadow-2xl border-0 bg-white dark:bg-gray-800">
        <CardContent className="p-8">
          <div className={`w-32 h-32 bg-gradient-to-br ${getScoreBgColor(assessment.overall_score)} rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg`}>
            <div className="text-center text-white">
              <Award className="w-8 h-8 mx-auto mb-1" />
              <span className="text-2xl font-bold">{Math.round(assessment.overall_score)}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test abgeschlossen!</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {assessment.feedback?.summary || "Gut gemacht!"}
          </p>
        </CardContent>
      </Card>
      
      {/* Interactive Conversation Log */}
      {assessment.conversation_log && assessment.conversation_log.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Gesprächsverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-60">
              <div className="space-y-3 pr-4">
                {assessment.conversation_log.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      entry.speaker === 'patient' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        entry.speaker === 'patient'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 capitalize">
                        {entry.speaker}
                      </p>
                      <p className="text-sm">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Question Evaluation - New Section */}
      {assessment.feedback?.questions_answered && assessment.feedback.questions_answered.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
              Fragenbeantwortung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.feedback.questions_answered.map((qa, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium text-gray-900 dark:text-white">{qa.question}</p>
                  <div className="flex items-center gap-2">
                    {qa.answered ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Badge className={
                      qa.quality === 'excellent' ? 'bg-green-500' :
                      qa.quality === 'good' ? 'bg-blue-500' :
                      qa.quality === 'fair' ? 'bg-amber-500' : 'bg-red-500'
                    }>
                      {qa.quality === 'excellent' ? 'Ausgezeichnet' :
                       qa.quality === 'good' ? 'Gut' :
                       qa.quality === 'fair' ? 'Ausreichend' : 'Mangelhaft'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{qa.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="w-5 h-5 text-blue-600" />
            Ihre Aufklärung (Transkript)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
            <p className="text-gray-800 italic text-sm dark:text-gray-200">"{assessment.transcription}"</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Improvement Points */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            Verbesserungspunkte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.feedback?.improvement_points?.map((item, index) => (
            <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-gray-700 dark:border-amber-900">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getTypeBadge(item.type)}`}>{item.type}</Badge>
                            <p className="text-sm font-semibold text-red-700 line-through dark:text-red-400">"{item.original}"</p>
                        </div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            <span className="font-normal text-gray-600 dark:text-gray-300">Korrektur:</span> "{item.correction}"
                        </p>
                        <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                           <span className="font-medium">Erklärung:</span> {item.explanation}
                        </p>
                    </div>
                    <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => onAddToFlashcards && onAddToFlashcards(item)}
                        className="hover:bg-amber-100 flex-shrink-0 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          ))}
          {(!assessment.feedback?.improvement_points || assessment.feedback.improvement_points.length === 0) && (
            <p className="text-gray-500 text-center dark:text-gray-400">Keine spezifischen Verbesserungspunkte gefunden. Sehr gute Arbeit!</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center pt-6">
        <Button onClick={onReset} size="lg" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <RotateCcw className="w-5 h-5 mr-2" />
          Nochmal versuchen
        </Button>
      </div>
    </div>
  );
}