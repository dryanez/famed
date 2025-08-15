
import React, { useState, useEffect } from "react";
import { MedicalCase, User, Submission } from "@/api/entities";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User as UserIcon, Stethoscope, AlertTriangle, Mic, Lock, Play } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function CaseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state variables for access control, initialized for demonstration
  // In a real application, these would be set based on user's subscription and case requirements
  const [hasProAccess, setHasProAccess] = useState(true); // Assume true for now
  const [isLocked, setIsLocked] = useState(false); // Assume false for now
  const [requiredLevel, setRequiredLevel] = useState(1); // Assume level 1 for now

  const urlParams = new URLSearchParams(location.search);
  const caseId = urlParams.get('id');
  const assignmentId = urlParams.get('assignmentId');
  const classId = urlParams.get('classId');

  useEffect(() => {
    if (caseId) {
      loadCase(caseId);
      // Example: In a real app, you'd fetch user's pro access and case lock status here
      // setHasProAccess(User.current().hasProAccess);
      // setIsLocked(caseData.requiredLevel > User.current().level);
      // setRequiredLevel(caseData.requiredLevel);
    } else {
      setError("Keine Fall-ID in der URL gefunden. Bitte überprüfen Sie den Link.");
      setIsLoading(false);
    }
  }, [caseId]);

  const loadCase = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await MedicalCase.get(id);
      setCaseData(data);
    } catch (e) {
      console.error("Error loading case:", e);
      setError(`Fall konnte nicht geladen werden: ${e.message}`);
    }
    setIsLoading(false);
  };

  const handleStartTest = async () => {
    if (!caseData?.id) {
      console.error("No case ID available for test");
      setError("Keine Fall-ID verfügbar, um den Test zu starten.");
      return;
    }

    try {
      const currentUser = await User.me();
      // Create a submission record when the test is started
      if (assignmentId && classId && currentUser && currentUser.email) {
        await Submission.create({
          student_email: currentUser.email,
          assignment_id: assignmentId,
          class_id: classId,
          completed_date: new Date().toISOString()
        });
      }
      const testUrl = createPageUrl(`CaseTest?id=${caseData.id}`);
      console.log("Navigating to test with URL:", testUrl);
      navigate(testUrl);
    } catch (error) {
      console.error("Could not create submission or navigate:", error);
      // Still navigate even if submission fails, using caseData.id for consistency
      navigate(createPageUrl(`CaseTest?id=${caseData.id}`));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6 flex justify-center items-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="h-4 bg-gray-700 rounded w-48"></div>
          <div className="h-64 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Fehler beim Laden</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button
            onClick={() => navigate(createPageUrl("MedicalCases"))}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu den Fällen
          </Button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Fall nicht gefunden</h1>
          <p className="text-gray-300 mb-6">Der angeforderte Fall konnte nicht gefunden werden.</p>
          <Button
            onClick={() => navigate(createPageUrl("MedicalCases"))}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu den Fällen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("MedicalCases"))}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{caseData.title}</h1>
            <p className="text-gray-300">{caseData.category}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {caseData.patient && (
              <Card className="shadow-lg border-0 bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserIcon className="w-5 h-5 text-blue-500" />
                    Patienteninformationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-white">
                    <div>
                      <p className="text-sm text-gray-300">Name</p>
                      <p className="font-semibold">{caseData.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Alter</p>
                      <p className="font-semibold">{caseData.patient.age} Jahre</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Content */}
            <Card className="shadow-lg border-0 bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Stethoscope className="w-5 h-5 text-green-500" />
                  Fallbeschreibung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.sections?.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-lg text-white mb-2">{section.title}</h3>
                    <div className="prose prose-sm max-w-none text-gray-200 prose-headings:text-white prose-strong:text-white">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}

                {caseData.task && (
                  <div className="mt-6 p-4 bg-amber-900/30 border-l-4 border-amber-500 rounded-r-lg">
                    <h3 className="font-bold text-lg text-amber-200 mb-2">Aufgabenstellung</h3>
                    <div className="prose prose-sm max-w-none text-amber-100 prose-headings:text-amber-200">
                      <ReactMarkdown>{caseData.task}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Panel (Summary only, old button removed as per outline's intent for sticky footer button) */}
          <div className="space-y-6">
            {/* Removed the old "Falltest starten" card here */}

            {/* Summary */}
            <Card className="shadow-lg border-0 bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">{caseData.summary}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer button */}
      <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm p-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={handleStartTest}
            disabled={!hasProAccess || isLocked}
            size="lg"
            className={`w-full font-semibold text-lg py-4 ${
              (!hasProAccess || isLocked)
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {!hasProAccess ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pro-Plan erforderlich - Jetzt upgraden
              </>
            ) : isLocked ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Level {requiredLevel} erforderlich
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Test starten
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
