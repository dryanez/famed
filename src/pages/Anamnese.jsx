
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, User, Bot, Loader2, ArrowLeft, Book, Clock, Sparkles } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { patientCases, basePrompt } from '../components/anamnese/patientData.js';
import { InvokeLLM } from '@/api/integrations';
import { API_KEYS } from "@/components/config/apiKeys";
import { motion, AnimatePresence } from 'framer-motion';

const CaseSelector = ({ onSelectCase }) => (
  <div className="max-w-4xl mx-auto">
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Anamnese-Trainer</h1>
      <p className="text-lg text-gray-300 mb-10">Wählen Sie einen Fall aus, um die KI-gestützte Simulation zu starten.</p>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patientCases.map((pCase, index) => (
        <motion.div
          key={pCase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="h-full"
        >
          <div
            className="h-full bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 flex flex-col cursor-pointer group hover:border-purple-400 transition-all"
            onClick={() => onSelectCase(pCase)}
          >
            <div className="text-4xl mb-4">{pCase.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{pCase.title}</h3>
            <p className="text-gray-400 flex-grow mb-6">{pCase.description}</p>
            <div className="mt-auto text-purple-400 font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Fall starten <ArrowLeft className="w-4 h-4 transform rotate-180" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const AnamneseSimulator = ({ selectedCase, onBack }) => {
  const [conversation, setConversation] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeLeft, setTimeLeft] = useState(8 * 60); // 8 minutes in seconds
  const [assessment, setAssessment] = useState(null); // New: for final assessment
  const [sessionEnded, setSessionEnded] = useState(false); // New: session state

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const scrollAreaRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null); // To keep track of the media stream

  // Timer Countdown Effect
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          handleTimeUp(); // New: automatically assess when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current);
      // Ensure any playing audio (both browser TTS and custom audio elements) is stopped when component unmounts or case changes
      speechSynthesis.cancel(); // Stop browser TTS
      const audioElements = document.getElementsByTagName("audio");
      for(let i=0; i< audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].src = ''; // Clear source to release blob URL
        audioElements[i].load(); // Reload to apply changes
      }
    };
  }, []);

  useEffect(() => {
    // Fixed initial greeting - proper medical greeting
    const patientName = selectedCase.fallDaten.match(/Name: (.*?)\n/)?.[1];
    const initialGreeting = `Guten Tag, Herr Doktor. Mein Name ist ${patientName || 'unbekannt'}.`;
    setConversation([{
      speaker: 'ai',
      text: initialGreeting
    }]);

    // Speak the initial greeting
    speakText(initialGreeting);
  }, [selectedCase]);
  
  useEffect(() => {
    // Auto-scroll to the latest message
    if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(scrollElement) {
           scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }
  }, [conversation]);
  
  // Robust Text-to-Speech with fallback
  const speakText = async (text) => {
    if (!text || text.trim() === '') return;

    speechSynthesis.cancel();
    const audioElements = document.getElementsByTagName("audio");
    for(let i=0; i< audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].load();
    }

    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEYS.GOOGLE_CLOUD_TTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: text },
          voice: {
            languageCode: 'de-DE',
            name: 'de-DE-Neural2-B', // High quality German male voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9,
            pitch: 0
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Google TTS API Error:", errorBody);
        throw new Error(`Google TTS request failed: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error("No audio content received from Google TTS");
      }

      // Convert base64 to blob and play
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);

    } catch (error) {
      console.error("Google TTS failed, using fallback browser voice:", error.message);
      // Enhanced fallback with better German voice selection
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Try to get a better German voice if available
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(voice => voice.lang.includes('de')) || voices[0];
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  // The main conversational loop function
  const handleUserInput = async (userText) => {
    // 1. Add user's transcribed message to the conversation
    const newConversation = [...conversation, { speaker: 'user', text: userText }];
    setConversation(newConversation);
    setIsProcessing(true);

    try {
      // 2. Think: Combine context and call the LLM
      const fullPrompt = `${basePrompt}\n\n${selectedCase.fallDaten}\n\n**Bisheriger Dialogverlauf:**\n${newConversation.map(m => `${m.speaker === 'user' ? 'Arzt' : 'Patient'}: ${m.text}`).join('\n')}\n**Arzt:** ${userText}\n**Patient:**`;
      
      const aiTextResponse = await InvokeLLM({ prompt: fullPrompt });
      const aiText = typeof aiTextResponse === 'string' ? aiTextResponse : JSON.stringify(aiTextResponse);

      // 3. Respond (Text): Add AI's text response to the conversation
      setConversation(prev => [...prev, { speaker: 'ai', text: aiText }]);
      
      // 4. Speak & Play: Use the configured TTS to speak the response aloud
      speakText(aiText);

    } catch (error) {
      console.error("Error invoking LLM:", error);
      const errorMessage = "Entschuldigung, es ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es erneut.";
      setConversation(prev => [...prev, { speaker: 'ai', text: errorMessage }]);
      speakText(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Listen: Starts recording audio from the user's microphone
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Mikrofon-Zugriff wird von Ihrem Browser nicht unterstützt.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream in ref
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Transcribe: When recording stops, send audio to Deepgram
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop the microphone track to turn off the indicator
        if(streamRef.current && streamRef.current.getTracks) streamRef.current.getTracks().forEach(track => track.stop());

        setIsProcessing(true);
        try {
          // Simplified the API endpoint URL to improve compatibility and added more robust error handling
          const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=de&punctuate=true', {
            method: 'POST',
            headers: { 'Authorization': `Token ${API_KEYS.DEEPGRAM}`, 'Content-Type': 'audio/webm' },
            body: audioBlob
          });
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API request failed with status ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
          
          if (transcript) {
            handleUserInput(transcript); // Kick off the conversational loop
          } else {
             setIsProcessing(false); // No speech detected
          }
        } catch (error) {
          console.error("Error with transcription:", error.message);
          alert("Fehler bei der Spracherkennung. Bitte überprüfen Sie Ihre Internetverbindung und die API-Schlüssel-Konfiguration.");
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Could not start recording:", error);
      alert("Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.");
    }
  };

  // Stops the recording, which then triggers the 'onstop' event handler
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // New: Handle time up and generate assessment
  const handleTimeUp = async () => {
    setSessionEnded(true);
    setIsProcessing(true);
    // Stop any ongoing speech (both browser TTS and custom audio elements)
    speechSynthesis.cancel();
    const audioElements = document.getElementsByTagName("audio");
    for(let i=0; i< audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].src = '';
        audioElements[i].load();
    }

    try {
      // Generate comprehensive medical assessment
      const assessmentPrompt = `
        MEDIZINISCHE ANAMNESE BEWERTUNG

        **PATIENTENFALL:**
        ${selectedCase.fallDaten}

        **GESPRÄCHSVERLAUF:**
        ${conversation.map(m => `${m.speaker === 'user' ? 'Arzt' : 'Patient'}: ${m.text}`).join('\n')}

        **STUDENTENNOTIZEN:**
        ${notes || 'Keine Notizen verfasst'}

        **BEWERTUNGSKRITERIEN (0-100 Punkte):**

        1. **SYSTEMATISCHES VORGEHEN (25 Punkte):**
           - Strukturierte Gesprächsführung
           - Logische Reihenfolge der Fragen
           - Vollständige Anamnese-Abschnitte abgearbeitet

        2. **VOLLSTÄNDIGKEIT DER ANAMNESE (30 Punkte):**
           - Aktuelle Anamnese (Hauptbeschwerde, Verlauf)
           - Schmerzanamnese (OPQRST: Onset, Provocation, Quality, Radiation, Severity, Timing)
           - Vegetative Anamnese
           - Vorerkrankungen/Medikamente (falls relevant)
           - Sozialanamnese (falls relevant)

        3. **GESPRÄCHSFÜHRUNG (25 Punkte):**
           - Empathie und Patientenzentrierung
           - Offene vs. geschlossene Fragen angemessen eingesetzt
           - Nachfragen bei wichtigen Punkten
           - Professionelle Kommunikation

        4. **KLINISCHES DENKEN (20 Punkte):**
           - Differentialdiagnosen erkennbar
           - Relevante Fragen für den Fall gestellt
           - Wichtige Red Flags erfragt
           - Zusammenhänge erkannt

        **AUSGABE IM JSON-FORMAT:**
        {"systematic_score": 0-100, "completeness_score": 0-100, "communication_score": 0-100, "clinical_thinking_score": 0-100, "overall_score": 0-100, "feedback": {"strengths": ["string"], "missed_areas": ["string"], "important_questions_not_asked": ["string"], "improvement_suggestions": ["string"], "overall_comment": "string"}}
      `;

      const aiResponse = await InvokeLLM({
        prompt: assessmentPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            systematic_score: { type: "number" },
            completeness_score: { type: "number" },
            communication_score: { type: "number" },
            clinical_thinking_score: { type: "number" },
            overall_score: { type: "number" },
            feedback: {
              type: "object",
              properties: {
                strengths: { type: "array", items: { type: "string" } },
                missed_areas: { type: "array", items: { type: "string" } },
                important_questions_not_asked: { type: "array", items: { type: "string" } },
                improvement_suggestions: { type: "array", items: { type: "string" } },
                overall_comment: { type: "string" }
              }
            }
          },
          required: ["systematic_score", "completeness_score", "communication_score", "clinical_thinking_score", "overall_score", "feedback"]
        }
      });

      setAssessment(aiResponse);
    } catch (error) {
      console.error("Error generating assessment:", error);
      setAssessment({
        systematic_score: 0,
        completeness_score: 0,
        communication_score: 0,
        clinical_thinking_score: 0,
        overall_score: 0,
        feedback: {
          overall_comment: "Fehler bei der Bewertungserstellung. Bitte versuchen Sie es erneut.",
          strengths: [],
          missed_areas: ["Es gab einen Fehler beim Abrufen der Bewertung."],
          important_questions_not_asked: [],
          improvement_suggestions: []
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Assessment Results Component
  if (assessment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent text-white hover:bg-slate-700 border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Fallauswahl
        </Button>

        {/* Overall Score */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white text-center">
          <CardContent className="p-8">
            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 text-white ${
              assessment.overall_score >= 70 ? 'bg-gradient-to-br from-green-500 to-teal-600' : 
              assessment.overall_score >= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              <span className="text-3xl font-bold">{Math.round(assessment.overall_score)}%</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Anamnese abgeschlossen!</h2>
            <p className="text-gray-300">Hier ist Ihre KI-basierte Auswertung</p>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Systematisches Vorgehen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(assessment.systematic_score)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${assessment.systematic_score >= 70 ? 'from-green-500 to-teal-500' : assessment.systematic_score >= 50 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'}`}
                  style={{ width: `${assessment.systematic_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Vollständigkeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(assessment.completeness_score)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${assessment.completeness_score >= 70 ? 'from-green-500 to-teal-500' : assessment.completeness_score >= 50 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'}`}
                  style={{ width: `${assessment.completeness_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Gesprächsführung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(assessment.communication_score)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${assessment.communication_score >= 70 ? 'from-green-500 to-teal-500' : assessment.communication_score >= 50 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'}`}
                  style={{ width: `${assessment.communication_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Klinisches Denken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(assessment.clinical_thinking_score)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${assessment.clinical_thinking_score >= 70 ? 'from-green-500 to-teal-500' : assessment.clinical_thinking_score >= 50 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'}`}
                  style={{ width: `${assessment.clinical_thinking_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border border-green-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-green-400">✅ Gut gemacht</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.feedback.strengths?.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside">
                  {assessment.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1"></span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Keine spezifischen Stärken identifiziert.</p>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border border-red-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-red-400">❌ Verbesserungsbereiche</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.feedback.missed_areas?.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside">
                  {assessment.feedback.missed_areas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400 mt-1"></span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Keine kritischen Bereiche übersehen.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Important Questions Not Asked */}
        {assessment.feedback.important_questions_not_asked?.length > 0 && (
          <Card className="bg-slate-800/60 backdrop-blur-sm border border-amber-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-amber-400">❓ Wichtige Fragen, die gestellt werden sollten</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                {assessment.feedback.important_questions_not_asked.map((question, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1"></span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Improvement Suggestions */}
        {assessment.feedback.improvement_suggestions?.length > 0 && (
          <Card className="bg-slate-800/60 backdrop-blur-sm border border-blue-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-blue-400">💡 Verbesserungsvorschläge</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                {assessment.feedback.improvement_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1"></span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Overall Comment */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Gesamtkommentar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200">{assessment.feedback.overall_comment}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => {
              setAssessment(null);
              setSessionEnded(false);
              setConversation([]);
              setNotes('');
              setTimeLeft(8 * 60);
              // Re-initialize timer interval
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                  if (prevTime <= 1) {
                    clearInterval(timerIntervalRef.current);
                    handleTimeUp();
                    return 0;
                  }
                  return prevTime - 1;
                });
              }, 1000);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-base"
          >
            Neue Anamnese starten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Left Column: Notebook */}
      <div className="lg:col-span-1">
         <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent text-white hover:bg-slate-700 border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Fallauswahl
        </Button>
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white sticky top-24">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
              <Book className="w-6 h-6"/>
              Notizbuch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Schreiben Sie hier Ihre Notizen zum Patienten..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-[50vh] bg-slate-900/70 border-slate-600 text-gray-200 resize-none focus:border-purple-400"
              disabled={sessionEnded}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Conversation */}
      <div className="lg:col-span-2 flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-grow flex flex-col bg-slate-800/60 backdrop-blur-sm border border-slate-700 text-white rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-purple-300">Gesprächssimulation</CardTitle>
              <div className={`flex items-center gap-2 text-2xl font-mono ${timeLeft < 60 && timeLeft > 0 ? 'text-red-400' : timeLeft === 0 ? 'text-gray-500' : 'text-white'}`}>
                <Clock className="w-6 h-6"/>
                {formatTime(timeLeft)}
                {timeLeft === 0 && <span className="text-sm ml-2">Zeit abgelaufen</span>}
              </div>
            </div>
          </div>
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {conversation.map((msg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-3 w-full ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.speaker === 'ai' && <div className="w-10 h-10 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center"><Bot className="w-6 h-6 text-white"/></div>}
                  <div className={`p-4 rounded-2xl max-w-lg ${msg.speaker === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                    <p className="text-white">{msg.text}</p>
                  </div>
                  {msg.speaker === 'user' && <div className="w-10 h-10 rounded-full bg-slate-500 flex-shrink-0 flex items-center justify-center"><User className="w-6 h-6 text-white"/></div>}
                </motion.div>
              ))}
              {isProcessing && !sessionEnded && (
                <div className="flex items-end gap-3 justify-start">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center"><Bot className="w-6 h-6 text-white"/></div>
                   <div className="p-4 rounded-2xl bg-slate-700 rounded-bl-none">
                      <Loader2 className="w-6 h-6 text-white animate-spin"/>
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-auto p-6 border-t border-slate-700 flex flex-col items-center justify-center bg-slate-800/80">
             <p className="text-sm text-gray-400 mb-4">
              {sessionEnded && timeLeft === 0 ? 'Session beendet - Bewertung wird erstellt...' : 'Mikrofon klicken, um zu sprechen. Erneut klicken zum Senden.'}
             </p>
            <div className="relative">
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || timeLeft <= 0 || sessionEnded}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10 ${isRecording ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/50'} text-white shadow-lg`}
                whileHover={{ scale: (isProcessing || timeLeft <= 0 || sessionEnded) ? 1 : 1.05 }}
                whileTap={{ scale: (isProcessing || timeLeft <= 0 || sessionEnded) ? 1 : 0.95 }}
              >
                <Mic className="w-8 h-8" />
              </motion.button>
              {!isRecording && !(isProcessing || timeLeft <= 0 || sessionEnded) && (
                <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-pulse z-0"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AnamnesePage() {
  const [selectedCase, setSelectedCase] = useState(null);

  // Stop any active speech synthesis when leaving the page or changing cases
  useEffect(() => {
    return () => {
      speechSynthesis.cancel(); // Stop browser TTS
      const audioElements = document.getElementsByTagName("audio");
      for(let i=0; i< audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].src = ''; // Clear source to release blob URL
        audioElements[i].load(); // Reload to apply changes
      }
    }
  }, [selectedCase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 p-6">
      <AnimatePresence mode="wait">
        {selectedCase ? (
          <motion.div
            key="simulator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnamneseSimulator 
              selectedCase={selectedCase} 
              onBack={() => setSelectedCase(null)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CaseSelector onSelectCase={setSelectedCase} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
