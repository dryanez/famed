import React, { useState } from 'react';
import { User, AccessCode } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PLAN_NAMES } from "@/components/utils/subscriptionLimits";

export default function Redeem() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter an access code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the access code
      const accessCodes = await AccessCode.filter({ code: code.toUpperCase() });
      if (accessCodes.length === 0) {
        throw new Error('Invalid access code');
      }

      const accessCode = accessCodes[0];

      // Check if already redeemed
      if (accessCode.redeemedByUserId) {
        throw new Error('This access code has already been used');
      }

      // Check if expired
      if (accessCode.expiresAt && new Date(accessCode.expiresAt) < new Date()) {
        throw new Error('This access code has expired');
      }

      // Get current user
      const user = await User.me();
      
      // Calculate expiry date
      const daysToAdd = accessCode.plan === 'paid_1m' ? 30 : 90;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      // Update user account
      await User.updateMyUserData({
        account_type: accessCode.plan,
        plan_expiry: expiryDate.toISOString().split('T')[0]
      });

      // Mark code as redeemed
      await AccessCode.update(accessCode.id, {
        redeemedByUserId: user.id,
        redeemedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 3000);

    } catch (error) {
      setError(error.message || 'Failed to redeem code. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-green-900/30 border-green-700">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Code Redeemed!</h2>
              <p className="text-green-300 mb-4">
                Your account has been successfully upgraded. Redirecting to dashboard...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-400 border-t-transparent mx-auto"></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-md mx-auto pt-20">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Upgrade"))}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Redeem Access Code</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="w-5 h-5 text-blue-400" />
                Enter Your Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter access code (e.g., ABC123DEF456)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 text-center text-lg font-mono"
                    maxLength={16}
                  />
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Access codes are 12-16 characters long
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Redeeming...' : 'Redeem Code'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Need an access code?</h3>
                <p className="text-blue-400 text-sm mb-3">
                  Contact our support team for purchase instructions:
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@famedtest.com?subject=Access Code Request'}
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}