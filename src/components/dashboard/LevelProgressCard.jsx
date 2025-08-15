import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Star } from "lucide-react";
import { calculateLevelInfo, rankTitles } from '../gamification/GamificationProfile';

export default function LevelProgressCard({ user }) {
  if (!user) return null;

  const { level, title, progressPercentage, xp, xpIntoLevel, xpForNextLevel } = calculateLevelInfo(user.xp || 0);
  const nextRank = rankTitles[level + 1] || title;

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <Award className="w-5 h-5 text-purple-500" />
          Ihr Fortschritt
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
          <div className="text-center text-white">
            <span className="text-xs">Level</span>
            <span className="text-4xl font-bold">{level}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{xp} XP gesammelt</p>
        
        <div className="text-left space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                <span>Fortschritt zu Level {level + 1}</span>
                <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Nächster Rang: <span className="font-semibold text-purple-600 dark:text-purple-400">{nextRank}</span>
            </p>
        </div>
      </CardContent>
    </Card>
  );
}