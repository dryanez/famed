
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Video, Square, AlertTriangle, MessageSquare, VideoOff } from "lucide-react";
import CaseTestResults from "../components/casetest/CaseTestResults";
import XPReward from "../components/gamification/XPReward";
import { calculateLevelInfo } from "../components/gamification/GamificationProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAufklaerungDetails } from "../components/aufklaerung/data.jsx";

const PREP_TIME = 10;
const RECORD_TIME = 120; // 2 minutes

// New Permission Denied Component
const PermissionDenied = ({ onRetry }) => (
  <Card className="bg-red-900/20 border-red-500/30 text-white max-w-2xl mx-auto">
    <CardHeader className="text-center">
      <VideoOff className="w-16 h-16 mx-auto text-red-400 mb-4" />
      <CardTitle className="text-2xl text-red-300">Kamera/Mikrofon Zugriff verweigert</CardTitle>
      <CardDescription className="text-red-400">
        Um den Test zu starten, benötigt die App Zugriff auf Ihre Kamera und Ihr Mikrofon.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="font-semibold text-center text-white">So beheben Sie das Problem:</p>
      <ul className="space-y-3 text-red-200 bg-red-900/30 p-4 rounded-lg">
        <li>
          <strong>1. Browser-Berechtigung:</strong> Klicken Sie auf das <strong>Schloss-Symbol (🔒)</strong> in der Adressleiste Ihres Browsers und stellen Sie sicher, dass Kamera und Mikrofon für diese Seite <strong>erlaubt</strong> sind.
        </li>
        <li>
          <strong>2. Andere Apps schließen:</strong> Beenden Sie alle anderen Programme (z.B. Zoom, Teams), die möglicherweise Ihre Kamera verwenden.
        </li>
        <li>
          <strong>3. Seite neu laden:</strong> Nach dem Ändern der Einstellungen kann ein Neuladen der Seite erforderlich sein.
        </li>
        <li>
          <strong>4. Browser wechseln:</strong> Falls das Problem weiterhin besteht, versuchen Sie es mit Chrome oder Firefox.
        </li>
      </ul>
      <Button onClick={onRetry} className="w-full bg-red-400 hover:bg-red-500 text-white">
        Erneut versuchen
      </Button>
    </CardContent>
  </Card>
);

export default function AufklaerungTest() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [caseItem, setCaseItem] = useState(null);
  const [caseDetails, setCaseDetails] = useState({ script: "", questions: [] });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  
  const [phase, setPhase] = useState('setup');
  const [timer, setTimer] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [showXPReward, setShowXPReward] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const questionIntervalRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');

  // Master Timer Logic with useEffect
  useEffect(() => {
    if (phase !== 'prep' && phase !== 'recording') {
      return;
    }

    if (timer <= 0) {
      if (phase === 'prep') {
        setPhase('recording');
      } else if (phase === 'recording') {
        stopRecording();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase, timer]);

  // Phase change handler
  useEffect(() => {
    if (phase === 'recording') {
      setTimer(RECORD_TIME);
      startMediaRecorder();
    }
  }, [phase]);


  useEffect(() => {
    loadCaseData();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
    };
  }, [caseId]);

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase, streamRef.current]);

  const loadCaseData = async () => {
    try {
      setIsLoading(true);
      if (!caseId) throw new Error("Keine Fall-ID");
      
      const [caseData, userData] = await Promise.all([
        InformedConsentCase.get(caseId), 
        User.me()
      ]);
      
      setCaseItem(caseData);
      setCaseDetails(getAufklaerungDetails(caseData.title));
      setUser(userData);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startTest = async () => {
    try {
      setError(null);
      setPermissionError(false);
      
      // First check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Ihr Browser unterstützt keine Kamera/Mikrofon-Zugriffe. Bitte verwenden Sie Chrome, Firefox oder Safari.");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      });
      streamRef.current = stream;
      setPhase('prep');
      setTimer(PREP_TIME);
    } catch (error) {
      console.error("Media access error:", error);
      
      // Handle specific error types
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionError(true);
      } else if (error.name === "NotFoundError") {
        setError("Keine Kamera oder Mikrofon gefunden. Bitte stellen Sie sicher, dass Geräte angeschlossen sind.");
      } else if (error.name === "NotReadableError" || error.message.includes("Could not start video source")) {
        setError("Kamera/Mikrofon wird bereits von einer anderen Anwendung verwendet. Bitte schließen Sie andere Programme wie Zoom, Teams, Skype und versuchen Sie es erneut.");
      } else if (error.name === "OverconstrainedError") {
        setError("Die angeforderte Kamera-Qualität wird nicht unterstützt. Versuchen Sie es mit niedrigeren Einstellungen.");
      } else {
        setError(`Konnte Kamera/Mikrofon nicht starten: ${error.message}. Bitte prüfen Sie Ihre Geräte und Browser-Einstellungen.`);
      }
    }
  };

  const startMediaRecorder = () => {
    if (!streamRef.current) return;
    
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp8,opus' });
    audioChunks.current = [];
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.current.push(event.data);
    };
    
    mediaRecorderRef.current.onstop = () => {
      const recordedBlob = new Blob(audioChunks.current, { type: 'video/webm' });
      processRecording(recordedBlob);
    };
    
    mediaRecorderRef.current.start();
    startQuestionGenerator();
  };
  
  const startQuestionGenerator = () => {
    if (caseDetails.questions.length === 0) return;
    let availableQuestions = [...caseDetails.questions];
    
    const askQuestion = () => {
      if (availableQuestions.length === 0) {
        clearInterval(questionIntervalRef.current);
        return;
      }
      const qIndex = Math.floor(Math.random() * availableQuestions.length);
      const question = availableQuestions.splice(qIndex, 1)[0];
      setConversationLog(prev => [...prev, { speaker: "Patient", text: question, timestamp: Date.now() }]);
    };
    
    setTimeout(askQuestion, (20 + Math.random() * 10) * 1000);
    questionIntervalRef.current = setInterval(askQuestion, (30 + Math.random() * 10) * 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
  };

  const processRecording = async (recordedBlob) => {
    setPhase('processing');
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

    try {
      const recordedFile = new File([recordedBlob], 'aufklaerung.webm', { type: 'video/webm' });
      const { file_url } = await UploadFile({ file: recordedFile });
      
      let transcription = '';
      try {
        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=de&punctuate=true', {
          method: 'POST',
          headers: { 'Authorization': `Token ${API_KEYS.DEEPGRAM}`, 'Content-Type': 'video/webm' },
          body: recordedBlob
        });
        if (response.ok) {
          const data = await response.json();
          transcription = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        }
      } catch (e) { 
        console.error("Transcription failed:", e); 
      }
      
      if (!transcription) {
        transcription = "[Transkription fehlgeschlagen - Bitte sprechen Sie lauter und deutlicher]";
      }

      const evaluationPrompt = `BEWERTUNG EINER MEDIZINISCHEN AUFKLÄRUNG

Soll-Text (Vollständiger Aufklärungstext):
---
${caseDetails.script.replace(/<[^>]*>/g, '')}
---

Ist-Text (Tatsächliche Nutzer-Aufklärung in ${RECORD_TIME} Sekunden):
---
"${transcription}"
---

Gestellte Patientenfragen:
---
${conversationLog.map(q => `- ${q.text}`).join('\n') || 'Keine Fragen gestellt'}
---

BEWERTUNGSKRITERIEN (Punkte von 0-100):
1. INHALTLICHE VOLLSTÄNDIGKEIT (content_score): Vergleiche den Ist-Text mit dem Soll-Text. Wie viel Prozent des Inhalts wurde korrekt wiedergegeben? Ein sehr kurzes Transkript (1-2 Sätze) muss einen niedrigen Score (0-20) erhalten. Wurden die Patientenfragen sinnvoll beantwortet?
2. AUSSPRACHE (pronunciation_score): Klarheit und Verständlichkeit.
3. GRAMMATIK (grammar_score): Grammatikische Korrektheit.
4. FLÜSSIGKEIT (fluency_score): Redefluss ohne Zögern oder Füllwörter.
5. GESAMTBEWERTUNG (overall_score): Ein gewichteter Durchschnitt, bei dem der content_score das höchste Gewicht hat.

WICHTIG:
- Der content_score ist entscheidend. Wenn nur sehr wenig gesagt wurde, muss dieser niedrig sein, was die Gesamtbewertung stark senkt.
- Gib konstruktives, spezifisches Feedback auf Deutsch. Finde mindestens 2 Verbesserungspunkte, auch wenn die Leistung gut war.`;

      const aiResponse = await InvokeLLM({
        prompt: evaluationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            content_score: { type: "number" },
            pronunciation_score: { type: "number" },
            grammar_score: { type: "number" },
            fluency_score: { type: "number" },
            overall_score: { type: "number" },
            feedback: {
              type: "object",
              properties: {
                summary: { type: "string" },
                positive_points: { type: "array", items: { type: "string" } },
                improvement_points: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { 
                      type: { type: "string" }, 
                      original: { type: "string" }, 
                      correction: { type: "string" }, 
                      explanation: { type: "string" } 
                    },
                    required: ["type", "original", "correction", "explanation"]
                  }
                },
                questions_answered: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { 
                      question: { type: "string" }, 
                      answered: { type: "boolean" }, 
                      quality: { type: "string" }, 
                      feedback: { type: "string" } 
                    }
                  }
                }
              },
              required: ["summary", "positive_points", "improvement_points"]
            }
          },
          required: ["content_score", "pronunciation_score", "grammar_score", "fluency_score", "overall_score", "feedback"]
        }
      });

      const assessmentData = {
        prompt_text: `Aufklärungsgespräch: ${caseItem.title}`,
        audio_file_url: file_url,
        transcription,
        content_score: aiResponse.content_score || 0,
        pronunciation_score: aiResponse.pronunciation_score || 0,
        grammar_score: aiResponse.grammar_score || 0,
        fluency_score: aiResponse.fluency_score || 0,
        overall_score: aiResponse.overall_score || 0,
        feedback: aiResponse.feedback || { summary: "Bewertung fehlgeschlagen", positive_points: [], improvement_points: [] },
        difficulty_level: "CaseStudy",
        case_id: caseItem.id,
        conversation_log: conversationLog
      };

      const savedAssessment = await SpeechAssessment.create(assessmentData);
      
      const xpGained = 25 + Math.round(assessmentData.overall_score / 4);
      const oldLevelInfo = calculateLevelInfo(user.xp || 0);
      const newXP = (user.xp || 0) + xpGained;
      const newLevelInfo = calculateLevelInfo(newXP);
      await User.updateMyUserData({ xp: newXP, level: newLevelInfo.level, title: newLevelInfo.title });
      
      if (newLevelInfo.level > oldLevelInfo.level) {
        setShowXPReward({ 
          xpEarned: xpGained, 
          activityType: 'case_test', 
          oldLevel: oldLevelInfo.level, 
          newLevel: newLevelInfo.level, 
          oldXP: user.xp || 0, 
          newXP 
        });
      }

      setAssessment({ ...assessmentData, id: savedAssessment.id });
      setPhase('finished');
      
    } catch (err) {
      setError(`Fehler bei der Auswertung: ${err.message}`);
      setPhase('setup'); // Fallback to setup on error
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-red-400 p-6">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-center">{error}</p>
        <Button onClick={() => navigate(createPageUrl('Aufklaerung'))} className="mt-4">
          Zurück
        </Button>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl">KI bewertet Ihre Aufklärung...</h2>
        <p className="text-gray-400 mt-2">Dies kann einen Moment dauern</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl('Aufklaerung'))} 
            className="hover:bg-indigo-900 border-indigo-700 text-indigo-300 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-indigo-200">Aufklärungstest: {caseItem?.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Lesen Sie den Text und führen Sie die Aufklärung durch</p>
          </div>
        </div>

        {phase === 'setup' && (
          permissionError ? (
            <PermissionDenied onRetry={startTest} />
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-indigo-300">Vollständiger Aufklärungstext</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="text-gray-800 dark:text-gray-300 leading-relaxed prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: caseDetails.script }} />
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="sticky top-24 h-fit">
                <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white text-center">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-indigo-200">Bereit für den Test?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-gray-700 dark:text-gray-300 space-y-2">
                      <p>📖 <strong>{PREP_TIME}s</strong> Vorbereitung</p>
                      <p>🎤 <strong>{RECORD_TIME / 60} Minuten</strong> Aufklärungsgespräch</p>
                      <p>🤖 <strong>KI-Feedback</strong> zur Bewertung</p>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 w-full text-white" 
                      onClick={startTest}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Test starten
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        )}

        {(phase === 'prep' || phase === 'recording') && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-indigo-300">Aufklärungstext</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[75vh] pr-4">
                  <div className="text-gray-800 dark:text-gray-300 leading-relaxed prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: caseDetails.script }} />
                </ScrollArea>
              </CardContent>
            </Card>
            
            <div className="space-y-4 sticky top-24 h-fit">
              <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white text-center">
                <CardContent className="p-6">
                  <div className={`text-6xl font-bold mb-2 ${phase === 'recording' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'}`}>
                    {formatTime(timer)}
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {phase === 'prep' ? 'Vorbereitung läuft...' : 'Aufnahme läuft'}
                  </p>
                  <div className={`w-4 h-4 rounded-full mx-auto mt-4 ${phase === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white">
                <CardContent className="p-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full aspect-video bg-gray-900 rounded-lg object-cover" 
                  />
                  <div className="mt-4 flex justify-center">
                    {phase === 'recording' && (
                      <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white">
                        <Square className="w-4 h-4 mr-2" />
                        Aufnahme beenden
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {conversationLog.length > 0 && (
                <Card className="bg-white dark:bg-gray-800/50 dark:border-indigo-500/20 text-gray-900 dark:text-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-indigo-300">
                      <MessageSquare className="w-5 h-5 text-indigo-400 dark:text-indigo-300"/>
                      Patientenfragen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScrollArea className="h-24 pr-2">
                      {conversationLog.map((log, i) => (
                        <p key={i} className="text-sm p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg mb-2 text-gray-800 dark:text-gray-200">
                          {log.text}
                        </p>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {phase === 'finished' && assessment && (
          <CaseTestResults assessment={assessment} caseItem={caseItem} />
        )}
        
        {showXPReward && (
          <XPReward {...showXPReward} onClose={() => setShowXPReward(false)} />
        )}
      </div>
    </div>
  );
}
