
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Flashcard, User, UserFlashcardMastery } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, Volume2, Star, RotateCcw, BrainCircuit, BookHeart, Plus, Play, Keyboard, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import XPReward from "../components/gamification/XPReward";
import FlashcardEditor from "../components/flashcards/FlashcardEditor";
import { calculateLevelInfo } from "../components/gamification/GamificationProfile";
import UpgradePrompt from "../components/subscription/UpgradePrompt";
import { getEffectiveAccountType, LIMITS } from '../components/utils/subscriptionLimits';

const systemDecks = [
    { id: 'Respiratorisches System', name: 'Respiratorisch', icon: '🫁' },
    { id: 'Immunsystem / Allergologie', name: 'Immun/Allergie', icon: '🛡️' },
    { id: 'Gastrointestinales System', name: 'Gastro', icon: '🫃' },
    { id: 'Rheumatologisches System', name: 'Rheuma', icon: '🦴' },
    { id: 'Nephrologisches System', name: 'Nephro', icon: '🫘' },
    { id: 'Hämatologisches System', name: 'Hämato', icon: '🩸' },
    { id: 'Endokrinologisches System', name: 'Endokrin', icon: '⚖️' },
    { id: 'Kardiovaskuläres System', name: 'Kardio', icon: '❤️' },
    { id: 'Neurologisches System', name: 'Neuro', icon: '🧠' },
    { id: 'Orthopädisches System', name: 'Ortho', icon: '🦴' },
];

export default function Flashcards() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [user, setUser] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userDecks, setUserDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [studiedCards, setStudiedCards] = useState(0);
  const [sessionStartXP, setSessionStartXP] = useState(0);
  const [showXPReward, setShowXPReward] = useState(false);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      User.me().then(user => {
        setUser(user);
        const effectiveType = getEffectiveAccountType(user);
        const limits = LIMITS[effectiveType];
        if (!limits.flashcardsEnabled) {
          setShowUpgradePrompt(true);
        }
      }).catch(() => {
        setUser(null);
        setShowUpgradePrompt(true);
      });
    } else {
      setUser(null);
      setShowUpgradePrompt(true);
    }
  }, [authUser, isAuthenticated]);

  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck);
    } else {
      loadUserDecks();
    }
  }, [selectedDeck, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!studyMode || flashcards.length === 0) return;
      
      switch(event.key) {
        case ' ': // Space to flip
          event.preventDefault();
          if (!showAnswer) {
            setShowAnswer(true);
          } else {
            handleNextCard();
          }
          break;
        case '1': // Hard
          if (showAnswer) updateMastery(flashcards[currentCardIndex].id, 1);
          break;
        case '2': // Medium  
          if (showAnswer) updateMastery(flashcards[currentCardIndex].id, 3);
          break;
        case '3': // Easy
          if (showAnswer) updateMastery(flashcards[currentCardIndex].id, 5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [studyMode, showAnswer, flashcards, currentCardIndex, user]);

  const loadUserDecks = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const allUserCards = await Flashcard.filter({ created_by: user.email }, "-created_date");
        // Group by deck
        const deckGroups = allUserCards.reduce((acc, card) => {
          const deckName = card.deck || 'Persönliche Karten';
          if (!acc[deckName]) acc[deckName] = [];
          acc[deckName].push(card);
          return acc;
        }, {});
        
        setUserDecks(Object.entries(deckGroups).map(([name, cards]) => ({
          name,
          cards,
          count: cards.length
        })));
      }
    } catch (error) {
      console.error("Error loading user decks:", error);
    }
    setIsLoading(false);
  };

  const loadFlashcards = async (deckId) => {
    setIsLoading(true);
    try {
        let baseCards = [];
        const isSystemDeck = systemDecks.some(d => d.id === deckId);
        
        if (isSystemDeck) {
            baseCards = await Flashcard.filter({ deck: deckId });
        } else if (user) {
            baseCards = await Flashcard.filter({ 
                created_by: user.email, 
                deck: deckId === 'Persönliche Karten' ? null : deckId 
            });
        }

        let userMastery = [];
        if (user) {
            const cardIds = baseCards.map(c => c.id);
            if (cardIds.length > 0) {
                 userMastery = await UserFlashcardMastery.filter({ user_email: user.email, flashcard_id: { $in: cardIds } });
            }
        }
        
        const masteryMap = userMastery.reduce((acc, m) => {
            acc[m.flashcard_id] = m.mastery_level;
            return acc;
        }, {});

        const mergedData = baseCards.map(card => ({
            ...card,
            mastery_level: masteryMap[card.id] || 0 // Use personal mastery, default to 0
        }));

        // Sort by spaced repetition algorithm
        mergedData.sort((a, b) => {
            const aMastery = a.mastery_level;
            const bMastery = b.mastery_level;
            const aWeight = Math.max(1, 6 - aMastery);
            const bWeight = Math.max(1, 6 - bMastery);
            // Higher weight (lower mastery) means higher chance to appear
            return (Math.random() * bWeight) - (Math.random() * aWeight);
        });

        setFlashcards(mergedData);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setStudiedCards(0);
        if(user) setSessionStartXP(user.xp || 0);
    } catch (error) {
        console.error("Error loading flashcards:", error);
        setFlashcards([]);
    }
    setIsLoading(false);
  };

  const createNewDeck = async () => {
    if (!newDeckName.trim() || !user) return;
    
    // Create a placeholder card to establish the deck
    await Flashcard.create({
      german_text: 'Beispielkarte',
      english_translation: 'Sample card',
      deck: newDeckName,
      category: 'vocabulary',
      mastery_level: 0,
      created_by: user.email
    });
    
    setNewDeckName('');
    setShowCreateDeck(false);
    loadUserDecks();
  };

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
    
    // Check if session completed
    if (currentCardIndex === flashcards.length - 1) {
      completeSession();
    }
  };

  const handlePrevCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex(prev => prev === 0 ? flashcards.length - 1 : prev - 1);
  };

  const updateMastery = async (cardId, level) => {
    if (!user) return;

    try {
        // Find if a mastery record already exists
        const existingMastery = await UserFlashcardMastery.filter({
            user_email: user.email,
            flashcard_id: cardId
        });

        if (existingMastery.length > 0) {
            // Update existing record
            await UserFlashcardMastery.update(existingMastery[0].id, { mastery_level: level });
        } else {
            // Create new record
            await UserFlashcardMastery.create({
                user_email: user.email,
                flashcard_id: cardId,
                mastery_level: level
            });
        }

        // Update local state for immediate feedback
        const updatedFlashcards = [...flashcards];
        const cardToUpdate = updatedFlashcards.find(c => c.id === cardId);
        if(cardToUpdate) cardToUpdate.mastery_level = level;
        setFlashcards(updatedFlashcards);
        setStudiedCards(prev => prev + 1);

        console.log(`Updated mastery for card ${cardId} to level ${level}`);

        // Auto-advance after rating
        setTimeout(() => {
          handleNextCard();
        }, 500);
    } catch (error) {
        console.error("Failed to update mastery:", error);
        alert("Fehler beim Aktualisieren des Lernfortschritts.");
    }
  };

  const completeSession = async () => {
    if (!user || studiedCards === 0) return;
    
    // Calculate XP based on cards studied
    const xpGained = Math.max(5, studiedCards * 2);
    const oldLevel = calculateLevelInfo(user.xp || 0).level;
    const newXP = (user.xp || 0) + xpGained;
    const newLevel = calculateLevelInfo(newXP).level;
    
    // Update user XP using real API
    await User.updateMyUserData({
      xp: newXP,
      level: newLevel,
      title: calculateLevelInfo(newXP).title
    });
    
    // Show XP reward
    setShowXPReward({
      xpEarned: xpGained,
      activityType: 'flashcard_session',
      oldLevel,
      newLevel,
      oldXP: user.xp || 0,
      newXP
    });
    
    // Update local user state
    setUser(prev => ({ ...prev, xp: newXP, level: newLevel }));
    setStudyMode(false);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    speechSynthesis.speak(utterance);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowEditor(true);
  };

  const handleSaveCard = async (cardData) => {
    try {
      if (editingCard) {
        await Flashcard.update(editingCard.id, cardData);
      } else {
        await Flashcard.create(cardData);
      }
      setShowEditor(false);
      setEditingCard(null);
      if (selectedDeck) {
        loadFlashcards(selectedDeck);
      } else {
        loadUserDecks();
      }
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Fehler beim Speichern der Karte.");
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm("Sind Sie sicher, dass Sie diese Karte löschen möchten?")) return;
    
    try {
      await Flashcard.delete(cardId);
      // Also delete associated mastery records if card is deleted
      const masteryRecords = await UserFlashcardMastery.filter({ flashcard_id: cardId });
      masteryRecords.forEach(record => UserFlashcardMastery.delete(record.id));

      if (selectedDeck) {
        loadFlashcards(selectedDeck);
      } else {
        loadUserDecks();
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Fehler beim Löschen der Karte.");
    }
  };

  const renderDeckOverview = () => (
    <div className="space-y-8">
      {/* User Decks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Kartendecks</h2>
          <Button onClick={() => setShowEditor(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Neue Karte erstellen
          </Button>
        </div>

        {showCreateDeck && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Deck-Name eingeben..."
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewDeck()}
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                  <Button onClick={createNewDeck}>Erstellen</Button>
                  <Button variant="outline" onClick={() => setShowCreateDeck(false)} className="dark:border-gray-600">Abbrechen</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userDecks.map((deck) => (
            <Card
              key={deck.name}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              onClick={() => setSelectedDeck(deck.name)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{deck.name}</CardTitle>
                  <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">{deck.count} Karten</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {userDecks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">Noch keine eigenen Decks</h3>
            <p>Erstellen Sie Ihr erstes Kartendeck oder nutzen Sie die Systemdecks unten.</p>
          </div>
        )}
      </div>

      {/* System Decks */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vorgefertigte Systemdecks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemDecks.map((deck) => (
            <Card
              key={deck.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              onClick={() => setSelectedDeck(deck.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{deck.icon}</span>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{deck.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudyMode = () => {
    if (flashcards.length === 0) return null;
    
    const currentCard = flashcards[currentCardIndex];
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress & Instructions */}
        <div className="text-center space-y-4">
          <Progress 
            value={(currentCardIndex + 1) / flashcards.length * 100} 
            className="w-full max-w-md mx-auto" 
          />
          <p className="text-gray-300">
            Karte {currentCardIndex + 1} von {flashcards.length} • {studiedCards} studiert
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>Leertaste: Umdrehen</span>
            </div>
            <span>1: Schwer • 2: Mittel • 3: Einfach</span>
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mx-auto shadow-2xl border-0 bg-gray-800 min-h-[400px]">
              <CardContent className="p-8">
                <div className="text-center space-y-6 min-h-[300px] flex flex-col justify-center">
                  <div className="space-y-4">
                    {/* Front of card */}
                    <div className="flex items-center justify-center gap-4">
                      <h2 className="text-4xl font-bold text-white">
                        {currentCard.german_text}
                      </h2>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => speakText(currentCard.german_text)}
                        className="dark:border-gray-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mastery stars */}
                    <div className="flex items-center justify-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < (currentCard.mastery_level || 0) 
                              ? 'text-amber-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Back of card */}
                    <AnimatePresence>
                      {showAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6 border-t pt-6 border-gray-700"
                        >
                          <p className="text-2xl text-gray-300">
                            {currentCard.english_translation}
                          </p>
                          
                          {/* Additional info */}
                          {(currentCard.pronunciation_guide || currentCard.difficulty_reason) && (
                            <div className="space-y-3 text-left">
                              {currentCard.pronunciation_guide && (
                                <div className="bg-blue-50 p-3 rounded-lg dark:bg-blue-950">
                                  <p className="text-sm font-medium text-blue-900 mb-1 dark:text-blue-200">Aussprache:</p>
                                  <p className="text-blue-800 text-sm dark:text-blue-100">{currentCard.pronunciation_guide}</p>
                                </div>
                              )}
                              {currentCard.difficulty_reason && (
                                <div className="bg-amber-50 p-3 rounded-lg dark:bg-amber-950">
                                  <p className="text-sm font-medium text-amber-900 mb-1 dark:text-amber-200">Hinweis:</p>
                                  <p className="text-amber-800 text-sm dark:text-amber-100">{currentCard.difficulty_reason}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Rating buttons */}
                          <div className="flex justify-center gap-3">
                            <Button 
                              size="lg"
                              variant="outline" 
                              onClick={() => updateMastery(currentCard.id, 1)} 
                              className="hover:bg-red-50 text-red-600 border-red-200 dark:hover:bg-red-950 dark:text-red-400 dark:border-red-900"
                            >
                              <span className="font-bold mr-2">1</span> Schwer
                            </Button>
                            <Button 
                              size="lg"
                              variant="outline" 
                              onClick={() => updateMastery(currentCard.id, 3)} 
                              className="hover:bg-amber-50 text-amber-600 border-amber-200 dark:hover:bg-amber-950 dark:text-amber-400 dark:border-amber-900"
                            >
                              <span className="font-bold mr-2">2</span> Mittel
                            </Button>
                            <Button 
                              size="lg"
                              variant="outline" 
                              onClick={() => updateMastery(currentCard.id, 5)} 
                              className="hover:bg-green-50 text-green-600 border-green-200 dark:hover:bg-green-950 dark:text-green-400 dark:border-green-900"
                            >
                              <span className="font-bold mr-2">3</span> Einfach
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-center gap-4">
                    {!showAnswer ? (
                      <Button 
                        onClick={() => setShowAnswer(true)} 
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Antwort zeigen
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button onClick={handlePrevCard} variant="outline" size="lg" className="dark:border-gray-600">
                          Vorherige
                        </Button>
                        <Button onClick={handleNextCard} size="lg">
                          Nächste
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderDeckView = () => {
    if (isLoading) {
      return <p className="text-center py-10 text-gray-500 dark:text-gray-400">Lade Karten...</p>
    }

    if (flashcards.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"/>
          <h2 className="text-xl font-semibold">Dieses Deck ist leer</h2>
          <p>Fügen Sie Karten zu diesem Deck hinzu.</p>
        </div>
      );
    }

    if (studyMode) {
      return renderStudyMode();
    }

    return (
      <div className="space-y-6">
        {/* Study Mode CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-none text-white shadow-2xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4">
                <Play className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Lernmodus starten</h2>
                  <p className="text-green-100">Üben Sie mit {flashcards.length} Karten</p>
                </div>
                <Button
                  onClick={() => setStudyMode(true)}
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 ml-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Los geht's!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card List */}
        <div className="grid gap-4">
          {flashcards.map((card) => (
            <Card key={card.id} className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => speakText(card.german_text)}
                      className="shrink-0 dark:border-gray-600"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{card.german_text}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{card.english_translation}</p>
                      {card.difficulty_reason && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.difficulty_reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (card.mastery_level || 0) 
                              ? 'text-amber-400 fill-current' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    {card.created_by === user?.email && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditCard(card)}
                          className="h-8 w-8 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCard(card.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
       <UpgradePrompt 
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Lernkarten freischalten"
        description="Erschließen Sie sich den vollen Wortschatz mit unserem intelligenten Lernkartensystem, das auf dem Spaced-Repetition-Algorithmus basiert."
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => selectedDeck ? setSelectedDeck(null) : navigate(createPageUrl("Dashboard"))}
            className="dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedDeck || 'Lernkarten'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedDeck 
                ? `${flashcards.length} Karten in diesem Deck`
                : 'Organisieren und üben Sie Ihre Vokabeln'
              }
            </p>
          </div>
        </div>

        {/* Content */}
        {selectedDeck ? renderDeckView() : renderDeckOverview()}

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <FlashcardEditor
              card={editingCard}
              onSave={handleSaveCard}
              onCancel={() => {
                setShowEditor(false);
                setEditingCard(null);
              }}
            />
          </div>
        )}

        {/* XP Reward */}
        {showXPReward && (
          <XPReward
            {...showXPReward}
            onClose={() => setShowXPReward(false)}
          />
        )}
      </div>
    </div>
  );
}
