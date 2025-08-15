
import React, { useState, useRef, useEffect } from "react";
import { User, SpeechAssessment, Flashcard } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Square, 
  RefreshCw, 
  Volume2, 
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Lock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl, getEffectiveAccountType } from "@/utils"; // Added getEffectiveAccountType
import { calculateLevelInfo, rankTitles } from "../components/gamification/GamificationProfile";
import XPReward from "../components/gamification/XPReward";

import PracticeSelector from "../components/practice/PracticeSelector";
import RecordingInterface from "../components/practice/RecordingInterface";
import AssessmentResults from "../components/practice/AssessmentResults";

const SAMPLE_TEXTS = {
  Beginner: [
    "Hallo, ich heiße Maria und komme aus Deutschland.",
    "Heute ist das Wetter sehr schön und sonnig.",
    "Meine Familie hat einen kleinen Hund namens Max.",
    "Ich trinke gerne Kaffee am Morgen.",
    "Das Buch liegt auf dem Tisch im Wohnzimmer."
  ],
  Intermediate: [
    "Die deutsche Sprache hat viele interessante grammatikalische Regeln, die man lernen muss.",
    "Letztes Wochenende bin ich mit meinen Freunden ins Kino gegangen und wir haben einen spannenden Film gesehen.",
    "Wenn ich Zeit habe, lese ich gerne Bücher über Geschichte und Wissenschaft.",
    "Der öffentliche Verkehr in deutschen Städten ist normalerweise sehr pünktlich und zuverlässig.",
    "Umweltschutz ist ein wichtiges Thema, das alle Menschen betrifft und ernst genommen werden sollte."
  ],
  Advanced: [
    "Die fortschreitende Digitalisierung unserer Gesellschaft bringt sowohl Chancen als auch Herausforderungen mit sich, die sorgfältig abgewogen werden müssen.",
    "Obwohl die Globalisierung viele wirtschaftliche Vorteile gebracht hat, entstehen dadurch auch komplexe gesellschaftliche und kulturelle Spannungen.",
    "Die wissenschaftlichen Erkenntnisse über den Klimawandel erfordern eine fundamentale Neuausrichtung unserer Energie- und Wirtschaftspolitik.",
    "Künstliche Intelligenz wird voraussichtlich verschiedene Branchen revolutionieren, wobei ethische Überlegungen eine zentrale Rolle spielen sollten.",
    "Die Erhaltung kultureller Vielfalt in einer zunehmend vernetzten Welt stellt eine der größten Herausforderungen des 21. Jahrhunderts dar."
  ]
};

export default function Practice() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0); 
  const [showXPReward, setShowXPReward] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  
  const isGuest = user === null;

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const startPractice = (level) => {
    if (isGuest) {
      navigate(createPageUrl("Upgrade")); // Changed from Pricing to Upgrade
      return;
    }
    
    // Check user's plan using new system
    const effectiveAccountType = getEffectiveAccountType(user);
    if (effectiveAccountType === 'free') {
      alert("Sprechübungen erfordern einen bezahlten Plan."); // Updated alert message
      navigate(createPageUrl("Upgrade")); // Changed from Pricing to Upgrade
      return;
    }

    setSelectedLevel(level);
    const texts = SAMPLE_TEXTS[level];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setCurrentText(randomText);
    setAssessment(null);
    setError(null);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      setError("Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const processRecording = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    setError(null);
    setXpEarned(0); // Resetting the local xpEarned state
    
    try {
      // Upload audio file
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await UploadFile({ file: audioFile });
      
      // Get AI assessment
      const assessmentPrompt = `
        Analyze this German speech recording. The user was supposed to say: "${currentText}"
        
        Please provide detailed feedback on:
        1. Pronunciation accuracy (score 0-100)
        2. Grammar correctness (score 0-100)  
        3. Fluency (score 0-100)
        4. Overall score (average of the above)
        
        Also provide:
        - Transcription of what was actually said
        - Specific pronunciation issues with corrections
        - Grammar issues with corrections
        - Positive points
        - Fluency notes
        
        Be encouraging but constructive in your feedback.
      `;
      
      const aiResponse = await InvokeLLM({
        prompt: assessmentPrompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            pronunciation_score: { type: "number" },
            grammar_score: { type: "number" },
            fluency_score: { type: "number" },
            overall_score: { type: "number" },
            feedback: {
              type: "object",
              properties: {
                pronunciation_issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      issue: { type: "string" },
                      correction: { type: "string" }
                    }
                  }
                },
                grammar_issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phrase: { type: "string" },
                      issue: { type: "string" },
                      correction: { type: "string" }
                    }
                  }
                },
                fluency_notes: { type: "string" },
                positive_points: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      // Save assessment
      const assessmentData = {
        prompt_text: currentText,
        audio_file_url: file_url,
        transcription: aiResponse.transcription,
        pronunciation_score: aiResponse.pronunciation_score,
        grammar_score: aiResponse.grammar_score,
        fluency_score: aiResponse.fluency_score,
        overall_score: aiResponse.overall_score,
        feedback: aiResponse.feedback,
        difficulty_level: selectedLevel
      };
      
      const savedAssessment = await SpeechAssessment.create(assessmentData);
      
      // --- Gamification Logic ---
      const xpGained = 15 + Math.round(assessmentData.overall_score / 10);
      
      const today = new Date().toISOString().split('T')[0];
      const lastReset = user?.last_xp_reset || '';
      
      let dailyXpUpdate = xpGained;
      if (today === lastReset) {
        dailyXpUpdate = (user.daily_xp || 0) + xpGained;
      }
      
      const oldLevelInfo = calculateLevelInfo(user?.xp || 0);
      const newXp = (user?.xp || 0) + xpGained;
      const newLevelInfo = calculateLevelInfo(newXp);

      await User.updateMyUserData({
        xp: newXp,
        daily_xp: dailyXpUpdate,
        last_xp_reset: today,
        level: newLevelInfo.level,
        title: newLevelInfo.title,
      });

      // Show XP reward
      setShowXPReward({
        xpEarned: xpGained,
        activityType: 'speech_practice',
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        oldXP: user?.xp || 0,
        newXP: newXp
      });
      
      // Update local user state
      setUser(prev => ({
        ...prev, 
        xp: newXp, 
        level: newLevelInfo.level, 
        title: newLevelInfo.title,
        daily_xp: dailyXpUpdate,
        last_xp_reset: today
      }));
      // --- End Gamification ---

      setAssessment({ ...assessmentData, id: savedAssessment.id });
      
    } catch (error) {
      setError("Fehler bei der Analyse. Bitte versuchen Sie es erneut.");
      console.error("Processing error:", error);
    }
    
    setIsProcessing(false);
  };

  const addToFlashcards = async (item, category) => {
    try {
      await Flashcard.create({
        german_text: item.word || item.phrase,
        english_translation: "Translation needed", // This could be enhanced with translation API
        pronunciation_guide: item.correction,
        difficulty_reason: item.issue,
        assessment_id: assessment.id,
        category: category,
        mastery_level: 0
      });
      
      // Show success feedback (could be enhanced with toast notification)
      setError(null);
    } catch (error) {
      setError("Fehler beim Hinzufügen zur Lernkarte.");
    }
  };

  const resetPractice = () => {
    setSelectedLevel(null);
    setCurrentText("");
    setAssessment(null);
    setAudioBlob(null);
    setError(null);
    setRecordingTime(0);
    setXpEarned(0); // Resetting this state variable
    setShowXPReward(false); // Also reset XP reward display
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-green-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sprechübung</h1>
            <p className="text-gray-600 dark:text-gray-300">Verbessern Sie Ihre deutsche Aussprache</p>
          </div>
        </div>
        
        {isGuest && (
            <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                    Dies ist eine Vorschau. <Link to={createPageUrl("Pricing")} className="font-bold underline">Registrieren Sie sich</Link>, um Übungen zu starten und Ihren Fortschritt zu speichern.
                </AlertDescription>
            </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!selectedLevel ? (
          <PracticeSelector onSelectLevel={startPractice} />
        ) : !assessment ? (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    Text zu sprechen
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                    {selectedLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                    "{currentText}"
                  </p>
                </div>
                <Button
                  variant="outline" 
                  className="mt-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-gray-200 dark:border-gray-600"
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(currentText);
                    utterance.lang = 'de-DE';
                    speechSynthesis.speak(utterance);
                  }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Text anhören
                </Button>
              </CardContent>
            </Card>

            <RecordingInterface
              isRecording={isRecording}
              isProcessing={isProcessing}
              recordingTime={recordingTime}
              hasRecording={!!audioBlob}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onProcessRecording={processRecording}
              onReset={resetPractice}
            />
          </div>
        ) : (
          <AssessmentResults
            assessment={assessment}
            onAddToFlashcards={addToFlashcards}
            onReset={resetPractice}
            xpEarned={showXPReward ? showXPReward.xpEarned : 0}
          />
        )}

        {/* XP Reward */}
        {showXPReward && (
          <XPReward
            {...showXPReward}
            onClose={() => setShowXPReward(false)}
          />
        )}
      </div>
  );
}
