import React, { useState, useEffect } from 'react';
import { User, SpeechAssessment, Submission, Assignment, UserFlashcardMastery, Flashcard } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, User as UserIcon, Target, Award, CreditCard, Stethoscope, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function StudentReportModal({ student, classData, isOpen, onClose }) {
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masteryData, setMasteryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && student) {
      loadStudentData();
    }
  }, [isOpen, student]);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      const [
        studentAssessments,
        studentSubmissions,
        classAssignments,
        studentMastery
      ] = await Promise.all([
        SpeechAssessment.filter({ created_by: student.email }, '-created_date'),
        Submission.filter({ student_email: student.email, class_id: classData.id }),
        Assignment.filter({ class_id: classData.id }),
        UserFlashcardMastery.filter({ user_email: student.email })
      ]);

      setAssessments(studentAssessments);
      setSubmissions(studentSubmissions);
      setAssignments(classAssignments);
      setMasteryData(studentMastery);
    } catch (error) {
      console.error("Error loading student data:", error);
    }
    setIsLoading(false);
  };

  const getStudentStats = () => {
    if (assignments.length === 0) return { completion: 0, averageScore: 0, medicalCaseAvg: 0, flashcardMastery: 0 };

    const completion = (submissions.length / assignments.length) * 100;
    
    // Medical case performance
    const medicalCaseScores = assessments
      .filter(a => a.case_id)
      .map(a => a.overall_score || 0);
    const medicalCaseAvg = medicalCaseScores.length > 0 ? 
      medicalCaseScores.reduce((sum, score) => sum + score, 0) / medicalCaseScores.length : 0;

    // Flashcard mastery
    const flashcardMasteryAvg = masteryData.length > 0 ?
      (masteryData.reduce((sum, m) => sum + m.mastery_level, 0) / masteryData.length / 5) * 100 : 0;

    const overallAverage = ((medicalCaseAvg + flashcardMasteryAvg) / 2);

    return {
      completion: Math.round(completion),
      averageScore: Math.round(overallAverage),
      medicalCaseAvg: Math.round(medicalCaseAvg),
      flashcardMastery: Math.round(flashcardMasteryAvg)
    };
  };

  const generatePDFReport = async () => {
    const stats = getStudentStats();
    
    // Create a simple HTML report that can be printed to PDF
    const reportWindow = window.open('', '_blank');
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Studentenbericht - ${student.full_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
          .stat-value { font-size: 36px; font-weight: bold; color: #4CAF50; }
          .assessments-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .assessments-table th, .assessments-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .assessments-table th { background-color: #f5f5f5; }
          .progress-bar { height: 10px; background-color: #e0e0e0; border-radius: 5px; margin-top: 5px; }
          .progress-fill { height: 100%; border-radius: 5px; }
          .green { background-color: #4CAF50; }
          .amber { background-color: #FF9800; }
          .red { background-color: #F44336; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎓 Famed Test - Studentenbericht</div>
          <h2>${student.full_name}</h2>
          <p>Klasse: ${classData.class_name} | Erstellt: ${format(new Date(), 'dd.MM.yyyy', { locale: de })}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Abschlussrate</h3>
            <div class="stat-value">${stats.completion}%</div>
            <p>${submissions.length} von ${assignments.length} Aufgaben abgeschlossen</p>
          </div>
          <div class="stat-card">
            <h3>Durchschnittliche Leistung</h3>
            <div class="stat-value">${stats.averageScore}%</div>
            <p>Gesamtbewertung aller Aktivitäten</p>
          </div>
          <div class="stat-card">
            <h3>Medizinische Fälle</h3>
            <div class="stat-value">${stats.medicalCaseAvg}%</div>
            <p>Durchschnitt aus ${assessments.filter(a => a.case_id).length} Fallstudien</p>
          </div>
          <div class="stat-card">
            <h3>Lernkarten Beherrschung</h3>
            <div class="stat-value">${stats.flashcardMastery}%</div>
            <p>Basierend auf ${masteryData.length} gelernten Begriffen</p>
          </div>
        </div>

        <h3>Letzte Bewertungen</h3>
        <table class="assessments-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Aufgabe</th>
              <th>Typ</th>
              <th>Gesamtpunktzahl</th>
              <th>Aussprache</th>
              <th>Grammatik</th>
              <th>Flüssigkeit</th>
            </tr>
          </thead>
          <tbody>
            ${assessments.slice(0, 10).map(assessment => `
              <tr>
                <td>${format(new Date(assessment.created_date), 'dd.MM.yyyy')}</td>
                <td>${assessment.prompt_text.substring(0, 50)}${assessment.prompt_text.length > 50 ? '...' : ''}</td>
                <td>${assessment.difficulty_level || 'Standard'}</td>
                <td><strong>${Math.round(assessment.overall_score || 0)}%</strong></td>
                <td>${Math.round(assessment.pronunciation_score || 0)}%</td>
                <td>${Math.round(assessment.grammar_score || 0)}%</td>
                <td>${Math.round(assessment.fluency_score || 0)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Dieser Bericht wurde automatisch von Famed Test generiert.</p>
          <p>Für weitere Informationen besuchen Sie https://famed-test.de</p>
        </div>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  const getProgressColor = (value) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  if (!isOpen) return null;

  const stats = getStudentStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={student.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {student.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{student.full_name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={generatePDFReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF herunterladen
              </Button>
              <Button onClick={onClose} variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="assessments">Bewertungen</TabsTrigger>
              <TabsTrigger value="assignments">Aufgaben</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{stats.completion}%</div>
                    <div className="text-xs text-gray-600">Abschlussrate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{stats.averageScore}%</div>
                    <div className="text-xs text-gray-600">Durchschnitt</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold">{stats.medicalCaseAvg}%</div>
                    <div className="text-xs text-gray-600">Arzt-Fälle</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                    <div className="text-2xl font-bold">{stats.flashcardMastery}%</div>
                    <div className="text-xs text-gray-600">Lernkarten</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detaillierte Leistung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Aufgaben abgeschlossen</span>
                      <span className="font-mono">{stats.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(stats.completion)}`}
                        style={{ width: `${stats.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Medizinische Fälle</span>
                      <span className="font-mono">{stats.medicalCaseAvg}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(stats.medicalCaseAvg)}`}
                        style={{ width: `${stats.medicalCaseAvg}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Lernkarten Beherrschung</span>
                      <span className="font-mono">{stats.flashcardMastery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(stats.flashcardMastery)}`}
                        style={{ width: `${stats.flashcardMastery}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{assessment.prompt_text}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(assessment.created_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </p>
                        </div>
                        <Badge className={`${assessment.overall_score >= 70 ? 'bg-green-500' : assessment.overall_score >= 50 ? 'bg-amber-500' : 'bg-red-500'} text-white`}>
                          {Math.round(assessment.overall_score || 0)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Aussprache:</span>
                          <Progress value={assessment.pronunciation_score} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Grammatik:</span>
                          <Progress value={assessment.grammar_score} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Flüssigkeit:</span>
                          <Progress value={assessment.fluency_score} className="h-2 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Noch keine Bewertungen verfügbar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {assignments.map((assignment) => {
                const isCompleted = submissions.some(s => s.assignment_id === assignment.id);
                const isOverdue = new Date(assignment.due_date) < new Date() && !isCompleted;
                
                return (
                  <Card key={assignment.id} className={`${
                    isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 
                    isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Fällig: {format(new Date(assignment.due_date), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        </div>
                        <Badge variant={isCompleted ? "default" : isOverdue ? "destructive" : "secondary"}>
                          {isCompleted ? "Abgeschlossen" : isOverdue ? "Überfällig" : "Ausstehend"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}