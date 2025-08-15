import React, { useState, useEffect } from "react";
import { SpeechAssessment } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import AssessmentDetailView from "../components/assessment/AssessmentDetailView";

export default function AssessmentDetail() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const assessmentId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    } else {
      setError("Keine Bewertungs-ID gefunden.");
      setIsLoading(false);
    }
  }, [assessmentId]);

  const loadAssessment = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await SpeechAssessment.get(id);
      setAssessment(data);
    } catch (e) {
      console.error("Fehler beim Laden der Bewertung:", e);
      setError("Bewertung konnte nicht geladen werden.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Bewertungsdetails</h1>
            <p className="text-gray-300">Ihre Ergebnisse im Detail</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-400" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>
          </div>
        )}

        {assessment && <AssessmentDetailView assessment={assessment} />}
      </div>
    </div>
  );
}