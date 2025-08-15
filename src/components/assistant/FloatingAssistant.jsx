import React, { useState, useEffect, useRef, useMemo } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Bot, Send, X, Minimize2, Maximize2, User as UserIcon, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Bubble = ({ role, text }) => {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3 h-3 text-white" />
        </div>
      )}
      <div
        className={`px-3 py-2 rounded-2xl max-w-xs text-sm whitespace-pre-wrap ${
          isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
        }`}
      >
        {text}
      </div>
       {isUser && (
        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would normally send to your backend/email service
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Fehler beim Senden. Bitte versuchen Sie es erneut.');
    }
    
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Nachricht gesendet!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.
        </p>
        <Button 
          onClick={() => setSubmitted(false)} 
          variant="outline" 
          size="sm"
          className="dark:border-gray-600"
        >
          Neue Nachricht
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3">
      <div>
        <Input
          placeholder="Ihr Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Ihre E-Mail"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <Textarea
          placeholder="Wie können wir Ihnen helfen?"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
          rows={3}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? 'Sende...' : 'Nachricht senden'}
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Oder schreiben Sie uns direkt an{' '}
        <a href="mailto:support@famed-test.de" className="underline hover:text-blue-600">
          support@famed-test.de
        </a>
      </p>
    </form>
  );
};

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "system", 
      content: `Du bist der Hilfe-Assistent für Famed Test - eine Lernplattform für deutsche medizinische Sprachprüfungen.

ÜBER FAMED TEST:
- Famed Test hilft Ärzten bei der Vorbereitung auf deutsche Sprachprüfungen
- Wir bieten KI-gestützte Sprechübungen, Anamnese- und Aufklärungstraining
- Die Plattform hat verschiedene medizinische Fallstudien und Lernkarten
- Es gibt kostenlose und Premium-Pläne (1-Monat und 3-Monate)

HÄUFIGE FRAGEN:
- Anmeldung: Nutzer können sich kostenlos registrieren und haben begrenzten Zugang
- Premium-Features: Unbegrenzte Übungen, alle Fälle, erweiterte E-Book-Zugriffe
- Sprechübungen: KI analysiert Aussprache, Grammatik und Flüssigkeit
- Lernkarten: Intelligente Wiederholung basierend auf Spaced-Repetition
- Fortschritt: XP-System mit Leveln und Rängen von "Neuling" bis "Facharzt"

TECHNISCHE HILFE:
- Bei Login-Problemen: Cookies und Cache löschen, anderen Browser probieren
- Bei Audio-Problemen: Mikrofonberechtigungen prüfen
- Bei langsamer Leistung: Internetverbindung prüfen

Antworte auf Deutsch, sei hilfsbereit und verweise bei komplexen Problemen auf den Support.` 
    }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const viewRef = useRef(null);

  const visibleMessages = useMemo(() => messages.filter(m => m.role !== "system"), [messages]);

  const suggestions = [
    "Wie kann ich meine Aussprache verbessern?",
    "Was ist der Unterschied zwischen den Plänen?",
    "Wie funktionieren die Lernkarten?",
    "Ich habe Probleme beim Login",
    "Wie kann ich mein Level erhöhen?",
    "Was sind Anamnese und Aufklärung?",
  ];

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTo({ top: viewRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visibleMessages.length, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setBusy(true);

    try {
      const fullPrompt = newMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const answer = await InvokeLLM({ prompt: fullPrompt });
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Entschuldigung, es gab einen technischen Fehler. Bitte kontaktieren Sie unseren Support unter support@famed-test.de` }]);
    } finally {
      setBusy(false);
    }
  };

  const addSuggestion = (s) => { 
    setInput(s); 
    setActiveTab("chat");
  };
  
  const onKeyDown = (e) => { 
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      send(); 
    } 
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50 p-0 animate-bounce"
        size="icon"
        title="Hilfe & Support"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`bg-white dark:bg-gray-800 shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Famed Test Hilfe</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 dark:hover:bg-gray-700"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-65px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="chat">Chat-Hilfe</TabsTrigger>
                <TabsTrigger value="contact">Kontakt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                {/* Welcome & Suggestions */}
                {visibleMessages.length === 0 && (
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      👋 Hallo! Ich helfe Ihnen bei Fragen zu Famed Test.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Häufige Fragen:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => addSuggestion(s)}
                            className="text-xs px-2 py-1 rounded-full border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div ref={viewRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {visibleMessages.map((m, i) => (
                    <Bubble key={i} role={m.role} text={m.content} />
                  ))}
                  {busy && <Bubble role="assistant" text="Einen Moment..." />}
                </div>

                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 resize-none rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[120px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Stellen Sie Ihre Frage..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      disabled={busy}
                      rows={1}
                    />
                    <Button
                      onClick={send}
                      disabled={busy || input.trim().length === 0}
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 h-10 w-10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="flex-1 mt-0">
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Direkter Kontakt
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Brauchen Sie persönliche Hilfe? Wir sind für Sie da.
                    </p>
                  </div>
                  
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">FAQ besuchen</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      Viele Antworten finden Sie in unseren häufig gestellten Fragen.
                    </p>
                    <a 
                      href="https://famed-test.de/faq" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      → Zur FAQ-Seite
                    </a>
                  </div>
                </div>
                
                <ContactForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}