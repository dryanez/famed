import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticeSelector({ onSelectLevel }) {
  const levels = [
    {
      level: "Beginner",
      title: "Anfänger",
      description: "Einfache Sätze und grundlegende Vokabeln",
      duration: "2-3 Min",
      topics: ["Begrüßungen", "Familie", "Alltag"],
      color: "from-blue-500 to-blue-600",
      icon: "🌱"
    },
    {
      level: "Intermediate", 
      title: "Mittelstufe",
      description: "Komplexere Sätze und Grammatikstrukturen",
      duration: "3-5 Min",
      topics: ["Reisen", "Arbeit", "Kultur"],
      color: "from-amber-500 to-amber-600",
      icon: "🌿"
    },
    {
      level: "Advanced",
      title: "Fortgeschritten",
      description: "Anspruchsvolle Texte und komplexe Themen",
      duration: "5-7 Min",
      topics: ["Politik", "Wissenschaft", "Philosophie"],
      color: "from-red-500 to-red-600",
      icon: "🌳"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="text-center bg-gradient-to-r from-green-800 to-green-700 border-none text-white shadow-2xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-2">Schwierigkeitsgrad wählen</h2>
          <p className="text-green-100">
            Wählen Sie den passenden Schwierigkeitsgrad für Ihre Sprechübung
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((levelData, index) => (
          <motion.div
            key={levelData.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${levelData.color} opacity-10 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500`} />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{levelData.icon}</span>
                  <Badge variant="outline" className="bg-white/80">
                    {levelData.duration}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">{levelData.title}</CardTitle>
                <p className="text-gray-600 text-sm">{levelData.description}</p>
              </CardHeader>
              
              <CardContent className="relative space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  Themen:
                </div>
                <div className="flex flex-wrap gap-2">
                  {levelData.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  onClick={() => onSelectLevel(levelData.level)}
                  className={`w-full bg-gradient-to-r ${levelData.color} hover:shadow-lg transition-all duration-300 font-medium`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {levelData.title} starten
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}