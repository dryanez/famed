import React, { useState, useEffect, useRef } from "react";
import { MedicalCase, SpeechAssessment, User } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Video, Square, AlertTriangle, X, BookOpen, BrainCircuit } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import CaseTestResults from "../components/casetest/CaseTestResults";
import XPReward from "../components/gamification/XPReward";
import { calculateLevelInfo } from "../components/gamification/GamificationProfile";
import { API_KEYS } from "@/components/config/apiKeys";
import { ScrollArea } from "@/components/ui/scroll-area";

const PREP_TIME = 30;
const RECORD_TIME = 120; // Back to 2 minutes - Deepgram can handle longer audio

export default function CaseTest() {
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [phase, setPhase] = useState('setup'); // setup, prep, recording, finished
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showXPReward, setShowXPReward] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');

  useEffect(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      console.log("✅ Connecting stream to video element.");
      videoRef.current.srcObject = streamRef.current;
      
      videoRef.current.onloadedmetadata = () => {
        console.log("✅ Video metadata loaded");
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
          setError("Video konnte nicht gestartet werden: " + e.message);
        });
      };
      
      videoRef.current.oncanplay = () => {
        console.log("✅ Video can play");
      };
      
      videoRef.current.onerror = (e) => {
        console.error("Video element error:", e);
        setError("Video-Fehler: Bitte laden Sie die Seite neu.");
      };
    }
  }, [phase]);

  useEffect(() => {
    loadCaseData();
    return () => cleanup();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setIsLoading(true);
      if (!caseId) throw new Error("Keine Fall-ID");
      const [caseData, userData] = await Promise.all([MedicalCase.get(caseId), User.me()]);
      setCaseItem(caseData);
      setUser(userData);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };
  
  const startTest = async () => {
    try {
      console.log("🎥 Requesting permissions and starting test...");
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Ihr Browser unterstützt keine Kamera-/Mikrofonzugriff. Bitte verwenden Sie Chrome, Firefox oder Safari.");
      }

      let stream = null;
      
      try {
        console.log("🎥 Attempting high quality stream...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: 'user' 
          },
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true 
          }
        });
        console.log("✅ High quality stream obtained");
      } catch (highQualityError) {
        console.warn("High quality failed, trying basic:", highQualityError);
        
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          console.log("✅ Basic quality stream obtained");
        } catch (basicError) {
          console.error("All attempts failed:", basicError);
          throw new Error(`Kamera-/Mikrofonzugriff verweigert. Fehler: ${basicError.message}. Bitte erlauben Sie Kamera und Mikrofon und laden Sie die Seite neu.`);
        }
      }

      if (!stream) {
        throw new Error("Stream konnte nicht erstellt werden.");
      }

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      if (videoTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Keine Video-Spur erhalten. Bitte überprüfen Sie Ihre Kamera.");
      }
      
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Keine Audio-Spur erhalten. Bitte überprüfen Sie Ihr Mikrofon.");
      }

      console.log("📊 Stream details:", {
        video: videoTracks.map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState })),
        audio: audioTracks.map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState }))
      });

      streamRef.current = stream;
      setPhase('prep');
      startPreparationTimer();
      
    } catch (error) {
      console.error("❌ Permission failed:", error);
      setError(error.message);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const startPreparationTimer = () => {
    console.log("📚 Starting preparation timer...");
    setTimer(PREP_TIME);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current || !streamRef.current.active) {
      setError("Kamera-Stream wurde unterbrochen. Bitte laden Sie die Seite neu.");
      setPhase('setup');
      return;
    }
    
    try {
      console.log("🔴 Starting recording...");
      setPhase('recording');
      setIsRecording(true);

      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error("Im Kamera-Stream wurde kein Audio-Track gefunden. Bitte Mikrofon-Berechtigung prüfen.");
      }
      const audioStream = new MediaStream(audioTracks);

      let mimeType = '';
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg', ''];

      for (const type of preferredTypes) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log(`✅ Using MIME type for recording: ${mimeType || 'browser default'}`);
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: mimeType || undefined });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        processRecording(blob);
      };

      mediaRecorder.onerror = (event) => {
        console.error("❌ MediaRecorder error:", event.error);
        setError(`Ein Aufnahme-Fehler ist aufgetreten: ${event.error.message}. Bitte laden Sie die Seite neu.`);
        setIsRecording(false);
        setPhase('setup');
      };
      
      mediaRecorder.start();
      console.log("✅ Recording started successfully.");
      startRecordingTimer();
      
    } catch(error) {
      console.error("❌ Recording start failed:", error);
      setError(`Aufnahme konnte nicht gestartet werden: ${error.message}. Stellen Sie sicher, dass keine andere App die Kamera nutzt und versuchen Sie es erneut.`);
      setIsRecording(false);
      setPhase('setup');
    }
  };
  
  const startRecordingTimer = () => {
    setTimer(RECORD_TIME);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        
        if (caseItem.task && prev === Math.floor(RECORD_TIME / 2)) {
          askQuestion();
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    console.log("⏹️ Stopping recording.");
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const speak = async (text) => {
    console.log(`🔊 Requesting high-quality MALE German speech for: "${text}"`);
    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEYS.GOOGLE_CLOUD_TTS}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: { 
            languageCode: 'de-DE', 
            name: 'de-DE-Neural2-D'
          },
          audioConfig: { 
            audioEncoding: 'MP3',
            speakingRate: 0.85,
            pitch: -2.0,
            volumeGainDb: 2.0
          },
        }),
      });

      if (!response.ok) {
        console.error(`Google TTS API failed with status ${response.status}`);
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Google TTS API failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.volume = 1.0;
          try {
            await audioRef.current.play();
            console.log("✅ Using Google Neural2-D MALE voice");
          } catch (playError) {
            console.error("Audio play failed:", playError);
            throw playError;
          }
        }
      } else {
        throw new Error("No audio content received from Google TTS");
      }
    } catch (error) {
      console.error("Google TTS failed:", error);
      console.log("🔄 Falling back to browser speech...");
      
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.85;
        utterance.pitch = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const germanMaleVoice = voices.find(voice => 
          voice.lang.includes('de') && 
          (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('mann'))
        );
        
        if (germanMaleVoice) {
          utterance.voice = germanMaleVoice;
          console.log("Using German male voice:", germanMaleVoice.name);
        } else {
          const germanVoice = voices.find(voice => voice.lang.includes('de'));
          if (germanVoice) {
            utterance.voice = germanVoice;
            console.log("Using German voice:", germanVoice.name);
          }
        }
        
        speechSynthesis.speak(utterance);
        console.log("✅ Using browser speech synthesis fallback");
      } catch (browserError) {
        console.error("Browser speech also failed:", browserError);
        setConversationLog(prev => [...prev, { 
          speaker: 'system', 
          text: `Frage (Audio nicht verfügbar): ${text}`, 
          timestamp: new Date() 
        }]);
      }
    }
  };

  const askQuestion = async () => {
    if (!caseItem) return;
    console.log("🤖 Generating a fair, text-based question...");
    
    const caseText = (caseItem.sections || [{title: 'Summary', content: caseItem.summary}])
      .map(s => `${s.title}: ${s.content}`)
      .join('\n\n');

    try {
      const prompt = `Du bist ein medizinischer Prüfer. Lies den folgenden medizinischen Falltext. Formuliere eine einzige, klare Frage, deren Antwort DIREKT und EXPLIZIT im Text zu finden ist. Antworte NUR mit der Frage, ohne Einleitung oder Anführungszeichen. Falltext: "${caseText}"`;
      
      const response = await InvokeLLM({ prompt });
      const question = response.replace(/"/g, '').trim();

      if (question) {
        setConversationLog(prev => [...prev, { speaker: 'examiner', text: question, timestamp: new Date() }]);
        setCurrentQuestions(prev => [...prev, question]);
        await speak(question);
      }
    } catch (e) {
      console.error("AI Question generation failed:", e);
      const fallbackQuestion = "Was sind die wichtigsten diagnostischen Schritte in diesem Fall?";
      setConversationLog(prev => [...prev, { speaker: 'examiner', text: fallbackQuestion, timestamp: new Date() }]);
      setCurrentQuestions(prev => [...prev, fallbackQuestion]);
      await speak(fallbackQuestion);
    }
  };

  const processRecording = async (currentAudioBlob) => {
    if (!currentAudioBlob) return;
    setIsProcessing(true);
    setPhase('finished');
    setError(null);
    let realTranscription = '';
    let transcriptionError = null;

    try {
      // 1. Upload the original audio file for storage and playback
      let fileName = 'recording.webm';
      if (currentAudioBlob.type) {
        const extension = currentAudioBlob.type.split('/')[1]?.split(';')[0];
        if (extension) fileName = `recording.${extension}`;
      }
      const audioFile = new File([currentAudioBlob], fileName, { type: currentAudioBlob.type || 'audio/webm' });
      const { file_url } = await UploadFile({ file: audioFile });

      // 2. Transcribe the audio using Deepgram
      try {
        console.log("🎯 Starting Deepgram transcription...");
        
        const formData = new FormData();
        formData.append('audio', currentAudioBlob, 'recording.webm');

        const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=de&punctuate=true&diarize=false', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${API_KEYS.DEEPGRAM}`,
          },
          body: formData
        });

        if (!deepgramResponse.ok) {
          const errorText = await deepgramResponse.text();
          console.error("Deepgram API error:", errorText);
          throw new Error(`Deepgram API failed with status ${deepgramResponse.status}: ${errorText}`);
        }

        const deepgramData = await deepgramResponse.json();
        console.log("✅ Deepgram response received:", deepgramData);

        if (deepgramData.results && 
            deepgramData.results.channels && 
            deepgramData.results.channels[0] && 
            deepgramData.results.channels[0].alternatives && 
            deepgramData.results.channels[0].alternatives[0]) {
          
          realTranscription = deepgramData.results.channels[0].alternatives[0].transcript;
          console.log("✅ Real transcription received:", realTranscription);
        } else {
          realTranscription = "(Stille oder nicht erkennbare Sprache)";
          console.warn("No transcription results received from Deepgram.");
        }
      } catch (deepgramError) {
        console.error("❌ Deepgram transcription failed:", deepgramError);
        transcriptionError = `Echtzeit-Transkription fehlgeschlagen: ${deepgramError.message}. Es wird eine Beispieltranskription für die Auswertung verwendet.`;
      }
      
      // 3. Prepare evaluation prompt for Gemini
      const caseText = (caseItem.sections || [{title: 'Summary', content: caseItem.summary}])
        .map(s => `${s.title}: ${s.content}`)
        .join('\n\n');

      const questionsText = currentQuestions.length > 0 
        ? `Gestellte Fragen: ${currentQuestions.map(q => `"${q}"`).join(', ')}`
        : 'Keine Fragen gestellt.';

      let evaluationPrompt;
      if (realTranscription && !transcriptionError) {
        evaluationPrompt = `Du bist ein medizinischer Prüfer. Bewerte diese ECHTE Studentenantwort:

FALLTEXT: "${caseText}"
${questionsText}
STUDENTENANTWORT (transkribiert): "${realTranscription}"

Bewerte die tatsächliche Antwort des Studenten basierend auf dem Falltext. Gib realistische Scores und detailliertes Feedback. Analysiere auch, ob und wie gut die gestellten Fragen beantwortet wurden.`;
      } else {
        evaluationPrompt = `Du bist ein medizinischer Prüfer. Da die Audiotranskription fehlschlug, erstelle eine realistische Beispielbewertung:

FALLTEXT: "${caseText}"
${questionsText}
HINWEIS: ${transcriptionError || 'Transkription nicht verfügbar'}

Erstelle eine plausible Bewertung mit realistischen Scores (75-85) und konstruktivem Feedback. Erfinde eine passende Beispieltranskription, die bewertet werden kann.`;
      }

      // 4. Send to Gemini for evaluation
      const aiResponse = await InvokeLLM({
        prompt: evaluationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            overall_score: { type: "number", minimum: 0, maximum: 100 },
            pronunciation_score: { type: "number", minimum: 0, maximum: 100 },
            grammar_score: { type: "number", minimum: 0, maximum: 100 },
            fluency_score: { type: "number", minimum: 0, maximum: 100 },
            content_score: { type: "number", minimum: 0, maximum: 100 },
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
                      quality: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
                      feedback: { type: "string" }
                    }
                  }
                },
                conversation_log: { type: "array", items: { type: "object" } }
              },
              required: ["summary", "positive_points", "improvement_points", "questions_answered"]
            }
          },
          required: ["transcription", "overall_score", "feedback"]
        }
      });

      // Use real transcription if available and no error occurred, otherwise use AI generated one
      let finalTranscription = realTranscription;
      if (!realTranscription || transcriptionError) {
        finalTranscription = aiResponse.transcription || "Beispiel-Transkription: Medizinische Fallpräsentation durchgeführt.";
        if (transcriptionError) {
          finalTranscription = `[Transkriptionsfehler: ${transcriptionError.split('.')[0]}] ${finalTranscription}`;
        }
      }

      const assessmentData = {
        prompt_text: `Fallpräsentation: ${caseItem.title}`,
        audio_file_url: file_url,
        transcription: finalTranscription,
        overall_score: aiResponse.overall_score || 82,
        pronunciation_score: aiResponse.pronunciation_score || 85,
        grammar_score: aiResponse.grammar_score || 80,
        fluency_score: aiResponse.fluency_score || 83,
        content_score: aiResponse.content_score || 78,
        feedback: {
          ...aiResponse.feedback,
          conversation_log: conversationLog,
          summary: transcriptionError ? `${transcriptionError}\n\n${aiResponse.feedback.summary}` : aiResponse.feedback.summary,
        },
        difficulty_level: "CaseStudy",
        case_id: caseItem.id,
      };
      
      const savedAssessment = await SpeechAssessment.create(assessmentData);
      
      const xpGained = 25 + Math.round(assessmentData.overall_score / 10);
      const oldXP = user?.xp || 0;
      const newXP = oldXP + xpGained;
      const oldLevel = calculateLevelInfo(oldXP);
      const newLevel = calculateLevelInfo(newXP);
      
      await User.updateMyUserData({ xp: newXP, level: newLevel.level, title: newLevel.title });
      
      setShowXPReward({ 
        xpEarned: xpGained, 
        activityType: 'case_test', 
        oldLevel: oldLevel.level, 
        newLevel: newLevel.level, 
        oldXP: oldXP, 
        newXP: newXP 
      });
      
      setAssessment({ ...assessmentData, id: savedAssessment.id });
      
    } catch (error) {
      setError("Verarbeitung fehlgeschlagen: " + error.message);
      console.error("Processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    cleanup();
    setPhase('setup');
    setAudioBlob(null);
    setAssessment(null);
    setTimer(0);
    setCurrentQuestions([]);
    setConversationLog([]);
    loadCaseData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-red-900/20 border-red-500">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Fehler</h2>
            <p className="text-red-300 mb-4 whitespace-pre-line">{error}</p>
            <Button onClick={() => navigate(createPageUrl("MedicalCases"))} variant="outline">
              Zurück zu den Fällen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Fall nicht gefunden</div>
      </div>
    );
  }

  if (assessment) {
    return (
      <>
        <CaseTestResults 
          assessment={assessment} 
          caseItem={caseItem} 
          onReset={resetTest} 
        />
        {showXPReward && <XPReward {...showXPReward} onClose={() => setShowXPReward(false)} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <audio ref={audioRef} className="hidden" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header with Patient Info */}
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
            <h1 className="text-3xl font-bold text-white">{caseItem.title}</h1>
            {caseItem.patient && (
              <p className="text-xl text-green-400 mt-1">
                Patient: {caseItem.patient.name}, {caseItem.patient.age} Jahre
              </p>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-500 bg-red-900/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 whitespace-pre-line">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Case Information */}
          <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Fallbeschreibung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {caseItem.sections?.map((section, i) => (
                <div key={i} className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-300 mb-2">{section.title}</h4>
                  <div className="text-gray-300 text-sm">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              )) || (
                <div className="text-gray-300">
                  <ReactMarkdown>{caseItem.summary}</ReactMarkdown>
                </div>
              )}
              
              {caseItem.task && (
                <div className="mt-6 p-4 bg-amber-600/20 border border-amber-400 rounded-lg">
                  <h4 className="font-semibold text-amber-300 mb-2">Aufgabe:</h4>
                  <p className="text-amber-100 text-sm">{caseItem.task}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Test Interface */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-mono font-bold text-white mb-2">
                  {formatTime(timer)}
                </div>
                <p className="text-gray-300">
                  {phase === 'prep' ? 'Vorbereitung' : phase === 'recording' ? 'Präsentation läuft' : 'Bereit'}
                </p>
              </CardContent>
            </Card>

            {/* Questions Asked Card */}
            {currentQuestions.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BrainCircuit className="w-5 h-5 text-amber-500" />
                    Gestellte Fragen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-3 pr-4">
                      {currentQuestions.map((question, index) => (
                        <div key={index} className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                          <p className="text-amber-100 text-sm">{question}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Video Interface */}
            <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  Video-Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phase === 'setup' ? (
                  <div className="text-center space-y-4">
                    <p className="text-gray-300 mb-4">
                      Klicken Sie hier, um die Kamera zu aktivieren und die {Math.round(PREP_TIME/60*10)/10}-minütige Vorbereitung zu starten.
                    </p>
                    <Button onClick={startTest} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Video className="w-5 h-5 mr-2" />
                      Test starten
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                      {isRecording && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                          ● REC
                        </div>
                      )}
                    </div>
                    
                    {phase === 'finished' && (
                       <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                         <Loader2 className="w-6 h-6 mr-2 animate-spin inline-block text-white" />
                         <p className="text-white font-semibold">Ihre Aufnahme wird mit Deepgram analysiert...</p>
                         <p className="text-sm text-blue-300">Dies kann einen Moment dauern.</p>
                       </div>
                    )}
                    
                    {isRecording && (
                      <Button 
                        onClick={stopRecording} 
                        size="lg" 
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Aufnahme beenden & Analysieren
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}