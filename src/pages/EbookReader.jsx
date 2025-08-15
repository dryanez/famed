import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, MessageCircle, Send, RefreshCw, Star, Wand2, Plus, BrainCircuit, Search, FileText, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/api/integrations';
import { Flashcard, User } from '@/api/entities';

// --- Suggested Questions Component ---
const SuggestedQuestions = ({ onQuestionClick }) => {
  const questions = [
    {
      category: "Anamnese",
      icon: <FileText className="w-4 h-4" />,
      questions: [
        "Wie führe ich ein Anamnesegespräch mit einem Patienten?",
        "Welche Fragen sollte ich bei der Schmerzanamnese stellen?",
        "Wie erfrage ich die Familienanamnese professionell?"
      ]
    },
    {
      category: "Kommunikation",
      icon: <MessageCircle className="w-4 h-4" />,
      questions: [
        "Wie erkläre ich einem Patienten eine Diagnose verständlich?",
        "Wie gehe ich mit ängstlichen Patienten um?",
        "Welche Phrasen verwende ich bei der Aufklärung über Nebenwirkungen?"
      ]
    },
    {
      category: "Fachbegriffe",
      icon: <BrainCircuit className="w-4 h-4" />,
      questions: [
        "Was bedeutet 'Dyspnoe' und wie erkläre ich es einem Patienten?",
        "Welche deutschen Begriffe gibt es für Herzrhythmusstörungen?",
        "Wie beschreibe ich Symptome des Verdauungstrakts?"
      ]
    },
    {
      category: "Prüfungsvorbereitung",
      icon: <Star className="w-4 h-4" />,
      questions: [
        "Welche typischen Fragen kommen in der mündlichen Prüfung vor?",
        "Wie bereite ich mich auf Fallpresentationen vor?",
        "Was sind häufige Fehler bei der medizinischen Kommunikation?"
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Vorgeschlagene Fragen
      </h3>
      {questions.map((category) => (
        <div key={category.category} className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            {category.icon}
            {category.category}
          </h4>
          <div className="space-y-1">
            {category.questions.map((question, index) => (
              <button
                key={index}
                onClick={() => onQuestionClick(question)}
                className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Enhanced AI Chat Assistant Component ---
const AIAssistant = ({ onFlashcardCreated }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hallo! Ich bin Ihr persönlicher FaMED-Assistent. Fragen Sie mich alles über das FaMED-Protokoll, medizinische Kommunikation, deutsche Fachbegriffe oder Prüfungsvorbereitung. Ich helfe Ihnen gerne!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState('general');

  const conversationModes = {
    general: {
      name: "Allgemein",
      context: "Du bist ein freundlicher, medizinischer Sprachassistent für deutsche Medizinstudenten und Ärzte.",
      icon: <MessageCircle className="w-4 h-4" />
    },
    vocabulary: {
      name: "Vokabular",
      context: "Fokussiere dich auf deutsche medizinische Fachbegriffe, deren Bedeutung und Verwendung.",
      icon: <BrainCircuit className="w-4 h-4" />
    },
    communication: {
      name: "Kommunikation",
      context: "Helfe bei der medizinischen Kommunikation mit Patienten, Erklärungen und Gesprächsführung.",
      icon: <MessageCircle className="w-4 h-4" />
    },
    exam: {
      name: "Prüfung",
      context: "Bereite auf mündliche Prüfungen vor und simuliere Prüfungssituationen.",
      icon: <Star className="w-4 h-4" />
    }
  };

  const handleSendMessage = async (question = input) => {
    if (!question.trim()) return;
    
    const userMessage = { 
      role: 'user', 
      content: question, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const mode = conversationModes[conversationMode];
      const contextPrompt = `${mode.context}
      
Das FaMED Protokoll ist ein Lernbuch für medizinische Kommunikation auf Deutsch.
Beantworte Fragen basierend auf medizinischer Kommunikation, deutschen Fachbegriffen und Gesprächsführung.
Sei präzise, hilfreich und verwende medizinische Fachterminologie korrekt.

Wenn möglich, gib praktische Beispiele und strukturiere deine Antworten klar.
Bei Fachbegriffen erkläre auch die Etymologie oder Eselsbrücken.

Frage: ${question}`;

      const response = await InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date(),
        mode: conversationMode
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Fehler beim AI-Chat:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.', 
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const createFlashcardFromResponse = async (content) => {
    try {
       const flashcardData = await InvokeLLM({
        prompt: `Erstelle aus diesem Text eine Lernkarte. Extrahiere den wichtigsten deutschen medizinischen Begriff oder Satz, übersetze ihn ins Englische und gib eine kurze, einfache Erklärung.
        Text: "${content}"`,
        response_json_schema: {
          type: "object",
          properties: {
            german_text: { type: "string", description: "Der deutsche Begriff/Satz." },
            english_translation: { type: "string", description: "Die englische Übersetzung." },
            explanation: { type: "string", description: "Eine kurze Erklärung des Begriffs." }
          },
          required: ["german_text", "english_translation", "explanation"]
        }
      });

      await Flashcard.create({
        german_text: flashcardData.german_text,
        english_translation: flashcardData.english_translation,
        difficulty_reason: flashcardData.explanation,
        category: 'vocabulary',
        mastery_level: 0,
      });

      onFlashcardCreated();
      alert('Lernkarte erfolgreich aus AI-Antwort erstellt!');
    } catch (error) {
      console.error('Fehler beim Erstellen der Lernkarte aus AI-Antwort:', error);
      alert('Konnte die Lernkarte nicht erstellen. Bitte versuchen Sie es manuell.');
    }
  };

  const clearConversation = () => {
    setMessages([{
      role: 'assistant',
      content: 'Neue Unterhaltung gestartet! Wie kann ich Ihnen helfen?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Conversation Mode Selector */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Chat-Modus</h3>
          <Button onClick={clearConversation} variant="ghost" size="sm" className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Neu starten
          </Button>
        </div>
        <Select value={conversationMode} onValueChange={setConversationMode}>
          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(conversationModes).map(([key, mode]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {mode.icon}
                  {mode.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center flex-shrink-0">
                    <BrainCircuit className="w-4 h-4"/>
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm' 
                    : message.isError
                    ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 rounded-bl-sm dark:from-red-900 dark:to-red-800 dark:text-red-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-bl-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.mode && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {conversationModes[message.mode]?.name}
                    </Badge>
                  )}
                  {message.role === 'assistant' && index > 0 && !message.isError && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => createFlashcardFromResponse(message.content)}
                      className="mt-2 text-xs text-green-700 hover:bg-green-100 h-auto p-2 dark:text-green-400 dark:hover:bg-green-900"
                    >
                      <Plus className="w-3 h-3 mr-1"/> Als Lernkarte speichern
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-4 h-4"/>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl rounded-bl-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stellen Sie eine Frage zum FaMED-Protokoll..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
            className="rounded-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Button 
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Drücken Sie Enter zum Senden • Wählen Sie einen Chat-Modus für bessere Ergebnisse
        </p>
      </div>
    </div>
  );
};

// --- Flashcard Creator Component ---
const FlashcardCreator = ({ onFlashcardCreated }) => {
  const [germanText, setGermanText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [category, setCategory] = useState('vocabulary');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if(!germanText.trim()) {
        alert("Bitte geben Sie zuerst einen deutschen Begriff ein.");
        return;
    }
    setIsTranslating(true);
    try {
        const translationResponse = await InvokeLLM({
            prompt: `Translate the following German medical term or phrase into English: "${germanText}". Return only the English translation string, nothing else.`
        });
        setEnglishText(translationResponse);
    } catch (error) {
        console.error("Fehler bei der Übersetzung:", error);
        alert("Übersetzung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }
    setIsTranslating(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!germanText || !englishText) {
      alert("Bitte füllen Sie sowohl den deutschen als auch den englischen Text aus.");
      return;
    }
    setIsSaving(true);
    try {
      await Flashcard.create({
        german_text: germanText,
        english_translation: englishText,
        difficulty_reason: reason,
        category: category,
        mastery_level: 0,
      });
      setGermanText('');
      setEnglishText('');
      setReason('');
      onFlashcardCreated();
    } catch (error) {
      console.error("Fehler beim Erstellen der Lernkarte:", error);
      alert("Konnte Lernkarte nicht speichern.");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Deutscher Begriff/Satz</label>
          <Input 
            placeholder="z.B. Anamnese"
            value={germanText}
            onChange={(e) => setGermanText(e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Englische Übersetzung</label>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="z.B. Medical History"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Button type="button" size="icon" variant="outline" onClick={handleTranslate} disabled={isTranslating} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white">
              {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Hinweis / Eselsbrücke (optional)</label>
          <Textarea
            placeholder="z.B. schwierig auszusprechen"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-20 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Kategorie</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectItem value="vocabulary">Vokabular</SelectItem>
              <SelectItem value="pronunciation">Aussprache</SelectItem>
              <SelectItem value="grammar">Grammatik</SelectItem>
              <SelectItem value="fluency">Flüssigkeit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
          {isSaving ? 'Speichern...' : 'Lernkarte speichern'}
        </Button>
      </form>
    </div>
  );
};

// --- Ebook Reader Main Component ---
export default function EbookReader() {
  const googleDocUrl = "https://docs.google.com/document/d/14PpwM28tvyahfZd-_Thl4C7D6ZZz9my4rSAgITs8Pjw/edit?usp=sharing&rm=minimal&ui=2";
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const data = await Flashcard.filter({created_by: user.email}, "-created_date", 5);
      setFlashcards(data);
    } catch (error) {
      console.log("Nicht angemeldet, es werden keine Lernkarten geladen.");
      setFlashcards([]);
    }
    setIsLoading(false);
  };
  
  const getCategoryColor = (category) => {
    switch (category) {
      case 'pronunciation': return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700";
      case 'grammar': return "bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700";
      case 'vocabulary': return "bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700";
      case 'fluency': return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-700";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600";
    }
  };

  return (
    <ProtectedRoute requiredPlan="basic" feature="das FaMED Protokoll E-Book">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
          {/* Left Column: Google Doc Reader */}
          <div className="xl:col-span-2 h-full">
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  FaMED Protokoll
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <iframe
                  src={googleDocUrl}
                  title="FaMED Protokoll Google Doc Reader"
                  className="w-full h-full border-0 rounded-b-2xl"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Assistant and Tools */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full flex flex-col">
            <Tabs defaultValue="assistant" className="w-full flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-4 dark:bg-gray-700">
                <TabsTrigger value="assistant" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:bg-gray-600">
                  <BrainCircuit className="w-4 h-4 mr-1"/>AI
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:bg-gray-600">
                  <Lightbulb className="w-4 h-4 mr-1"/>Fragen
                </TabsTrigger>
                <TabsTrigger value="creator" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:bg-gray-600">
                  <Plus className="w-4 h-4 mr-1"/>Erstellen
                </TabsTrigger>
                <TabsTrigger value="recent" className="dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:bg-gray-600">
                  <Star className="w-4 h-4 mr-1"/>Neueste
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistant" className="flex-grow">
                <AIAssistant onFlashcardCreated={loadFlashcards} />
              </TabsContent>

              <TabsContent value="suggestions" className="flex-grow">
                <ScrollArea className="h-full p-4">
                  <SuggestedQuestions onQuestionClick={(question) => {
                    // Switch to assistant tab and send question
                    const assistantTab = document.querySelector('[value="assistant"]');
                    if (assistantTab) assistantTab.click();
                    setTimeout(() => {
                      const input = document.querySelector('input[placeholder*="Stellen Sie eine Frage"]');
                      if (input) {
                        input.value = question;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        const sendButton = input.parentElement?.querySelector('button');
                        if (sendButton) sendButton.click();
                      }
                    }, 100);
                  }} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="creator" className="flex-grow">
                <FlashcardCreator onFlashcardCreated={loadFlashcards} />
              </TabsContent>
              
              <TabsContent value="recent" className="flex-grow overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Zuletzt erstellte Karten</h3>
                  <Button variant="ghost" size="icon" onClick={loadFlashcards} className="dark:hover:bg-gray-700 dark:text-gray-300">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {isLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Lade Karten...</p>
                ) : flashcards.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {flashcards.map(card => (
                        <motion.div
                          key={card.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{card.german_text}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{card.english_translation}</p>
                              </div>
                              <Badge className={getCategoryColor(card.category)}>{card.category}</Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <Star className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                    <p>Hier erscheinen Ihre erstellten Lernkarten.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}