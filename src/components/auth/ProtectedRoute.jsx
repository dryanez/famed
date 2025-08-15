
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getEffectiveAccountType } from "../utils/subscriptionLimits";

export default function ProtectedRoute({ children, requiredPlan = "basic", feature = "diese Funktion" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkUserAccess();
  }, [requiredPlan]);

  const checkUserAccess = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const access = checkSubscriptionAccess(currentUser, requiredPlan);
      setHasAccess(access);
    } catch (error) {
      setUser(null);
      setHasAccess(false);
    }
    setLoading(false);
  };

  const checkSubscriptionAccess = (user, requiredPlan) => {
    if (!user) return false;

    const effectiveAccountType = getEffectiveAccountType(user);
    
    if (requiredPlan === "basic") {
      return effectiveAccountType === 'paid_1m' || effectiveAccountType === 'paid_3m';
    }
    if (requiredPlan === "pro") {
      return effectiveAccountType === 'paid_3m';
    }
    
    return false;
  };

  const getPlanName = (plan) => {
    const names = { basic: "Basis", pro: "Pro", team: "Team" };
    return names[plan] || "Premium";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Anmeldung erforderlich</CardTitle>
            <CardDescription>Um auf "{feature}" zuzugreifen, müssen Sie sich anmelden.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700">
                <Link to={createPageUrl("Upgrade")}>Anmelden & Pläne ansehen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
     return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{getPlanName(requiredPlan)}-Plan erforderlich</CardTitle>
            <CardDescription>Um auf "{feature}" zuzugreifen, ist ein Upgrade erforderlich.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
                Ihr aktueller Plan <span className="font-bold capitalize">{user.subscription_plan || 'Free'}</span> beinhaltet keinen Zugriff.
            </p>
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700">
                <Link to={createPageUrl("Upgrade")}>Pläne ansehen & upgraden</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
