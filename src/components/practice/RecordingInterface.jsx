import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecordingInterface({ 
  isRecording, 
  isProcessing, 
  recordingTime, 
  hasRecording, 
  onStartRecording, 
  onStopRecording, 
  onProcessRecording,
  onReset 
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          <Mic className="w-5 h-5 text-red-500" />
          Aufnahme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Status */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-300 rounded-full opacity-30"
                  />
                  <Mic className="w-12 h-12 text-white relative z-10" />
                </div>
                <p className="mt-4 text-lg font-semibold text-red-600">
                  Aufnahme läuft... {formatTime(recordingTime)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mx-auto flex items-center justify-center">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600">
                  {hasRecording ? "Aufnahme bereit" : "Bereit für Aufnahme"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isRecording && !hasRecording && (
            <Button
              onClick={onStartRecording}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 font-semibold"
            >
              <Mic className="w-5 h-5 mr-2" />
              Aufnahme starten
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={onStopRecording}
              size="lg"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 px-8 py-3 font-semibold"
            >
              <Square className="w-5 h-5 mr-2" />
              Aufnahme stoppen
            </Button>
          )}

          {hasRecording && !isRecording && !isProcessing && (
            <>
              <Button
                onClick={onProcessRecording}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Analyse starten
              </Button>
              <Button
                onClick={onReset}
                size="lg"
                variant="outline"
                className="px-8 py-3"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Neu aufnehmen
              </Button>
            </>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="text-lg font-medium text-green-600">
                AI analysiert Ihre Aufnahme...
              </span>
            </div>
            <Progress value={75} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-gray-500">
              Dies kann einen Moment dauern
            </p>
          </motion.div>
        )}

        {/* Tips */}
        {!isRecording && !hasRecording && !isProcessing && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tipps für eine gute Aufnahme:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sprechen Sie klar und deutlich</li>
              <li>• Nutzen Sie eine ruhige Umgebung</li>
              <li>• Halten Sie das Mikrofon nah</li>
              <li>• Lesen Sie den Text natürlich vor</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}