import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { de } from "date-fns/locale";

export default function WeeklyProgress({ assessments }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayProgress = (day) => {
    const dayAssessments = assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.created_date);
      return assessmentDate.toDateString() === day.toDateString();
    });
    return dayAssessments.length;
  };

  const weekTotal = weekDays.reduce((total, day) => total + getDayProgress(day), 0);
  const avgScore = assessments.length > 0 
    ? assessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessments.length 
    : 0;

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Wochenfortschritt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day, index) => {
              const dayProgress = getDayProgress(day);
              const isToday = day.toDateString() === now.toDateString();
              return (
                <div key={index} className="text-center">
                  <div className={`text-xs mb-1 ${isToday ? 'font-bold text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {format(day, 'EEE', { locale: de })}
                  </div>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      dayProgress > 0 
                        ? 'bg-green-500 text-white' 
                        : isToday 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 border-2 border-green-500'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {dayProgress}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500 dark:text-green-400">{weekTotal}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Diese Woche</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{Math.round(avgScore)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ø Punktzahl</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}