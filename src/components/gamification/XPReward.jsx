import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Star, Zap, Crown, CheckCircle } from 'lucide-react';

export default function XPReward({ 
  xpEarned, 
  activityType, 
  oldLevel, 
  newLevel, 
  oldXP, 
  newXP, 
  onClose,
  show = true 
}) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show && newLevel > oldLevel) {
      setShowLevelUp(true);
      // Create confetti effect
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(particles);
    }
  }, [show, newLevel, oldLevel]);

  const getActivityMessage = (type) => {
    switch (type) {
      case 'speech_practice':
        return 'Sprechübung abgeschlossen!';
      case 'flashcard_session':
        return 'Lernkarten-Session beendet!';
      case 'medical_case':
        return 'Medizinischer Fall gelöst!';
      case 'case_test':
        return 'Falltest bestanden!';
      default:
        return 'Aktivität abgeschlossen!';
    }
  };

  const getRankTitle = (level) => {
    const titles = {
      1: "Neuling", 2: "Lernender", 3: "Praktikant", 4: "Medizinstudent", 5: "PJ-ler",
      6: "Assistenzarzt", 7: "Facharztanwärter", 8: "Oberarzt", 9: "Chefarzt", 10: "Facharzt"
    };
    return titles[level] || "Experte";
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Confetti */}
        {showLevelUp && confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: particle.color }}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              scale: 0 
            }}
            animate={{ 
              y: '100vh',
              scale: [0, 1, 0],
              rotate: 360
            }}
            transition={{ 
              duration: 3,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          <Card className="max-w-lg w-full shadow-2xl border-0 bg-white relative overflow-hidden">
            {showLevelUp && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20" />
            )}
            
            <CardContent className="p-8 text-center relative">
              {/* Main Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  showLevelUp 
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                } shadow-xl`}
              >
                {showLevelUp ? (
                  <Crown className="w-10 h-10 text-white" />
                ) : (
                  <Sparkles className="w-10 h-10 text-white" />
                )}
              </motion.div>

              {/* Level Up Message */}
              {showLevelUp ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    🎉 Level Aufstieg! 🎉
                  </h2>
                  <p className="text-xl text-purple-600 font-semibold mb-2">
                    Level {oldLevel} → Level {newLevel}
                  </p>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-lg px-4 py-2">
                    {getRankTitle(newLevel)}
                  </Badge>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Gut gemacht! 👏
                  </h2>
                  <p className="text-lg text-gray-600">
                    {getActivityMessage(activityType)}
                  </p>
                </motion.div>
              )}

              {/* XP Earned */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-800">+{xpEarned} XP</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    {oldXP} → {newXP} XP insgesamt
                  </p>
                </div>
              </motion.div>

              {/* Achievements */}
              {showLevelUp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Neue Errungenschaften freigeschaltet!
                    </h3>
                    <div className="space-y-1 text-sm text-purple-700">
                      {newLevel >= 5 && <p>🔓 Challenge-Fälle verfügbar</p>}
                      {newLevel >= 3 && <p>🔓 Erweiterte Statistiken</p>}
                      <p>⭐ Neue Lernkarten-Kategorien</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className={`w-full font-semibold ${
                    showLevelUp 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' 
                      : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
                  } text-white shadow-lg`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Weiter lernen!
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}