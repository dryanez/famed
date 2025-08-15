import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

// --- Gamification Logic ---
export const levelThresholds = {
    1: 0, 2: 100, 3: 250, 4: 500, 5: 800,
    6: 1200, 7: 1700, 8: 2300, 9: 3000, 10: 4000,
};

export const rankTitles = {
    1: "Neuling", 2: "Lernender", 3: "Praktikant", 4: "Medizinstudent", 5: "PJ-ler",
    6: "Assistenzarzt", 7: "Facharztanwärter", 8: "Oberarzt", 9: "Chefarzt", 10: "Facharzt",
};

export const calculateLevelInfo = (xp) => {
    let level = 1;
    for (const lvl in levelThresholds) {
        if (xp >= levelThresholds[lvl]) {
            level = parseInt(lvl);
        } else {
            break;
        }
    }
    level = Math.min(level, 10); // Cap at max level

    const currentLevelXP = levelThresholds[level];
    const nextLevelXP = levelThresholds[level + 1] || currentLevelXP; // Handle max level
    const xpIntoLevel = xp - currentLevelXP;
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercentage = xpForNextLevel > 0 ? (xpIntoLevel / xpForNextLevel) * 100 : 100;
    
    return {
        level,
        title: rankTitles[level],
        xp,
        progressPercentage,
        xpForNextLevel,
        xpIntoLevel
    };
};

// --- Component ---
export default function GamificationProfile({ user }) {
    if (!user) return null;

    const { level, title, xp } = calculateLevelInfo(user.xp || 0);

    return (
        <div className="text-right">
            <p className="font-semibold text-gray-800 text-sm truncate">Level {level}: {title}</p>
            <p className="text-xs text-gray-500">{xp} XP</p>
        </div>
    );
}