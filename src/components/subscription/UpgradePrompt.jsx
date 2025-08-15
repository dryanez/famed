import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function UpgradePrompt({ 
  isOpen, 
  onClose, 
  title = "Upgrade Required", 
  description = "This feature requires a paid plan.", 
  feature = "this feature" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Choose your exam timeline:</strong>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                1-Month Intensive (€59) or 3-Month Pro Prep (€129)
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link to={createPageUrl("Upgrade")} onClick={onClose}>
                <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  View Plans & Upgrade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" onClick={onClose} className="w-full">
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}