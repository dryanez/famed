import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Crown, Calendar, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.log("User not authenticated");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case "basic": return "bg-blue-100 text-blue-800";
      case "pro": return "bg-amber-100 text-amber-800";
      case "team": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case "basic": return "Basis";
      case "pro": return "Pro";
      case "team": return "Team";
      default: return "Kostenlos";
    }
  };

  const isTrialActive = user?.trial_ends && new Date(user.trial_ends) > new Date();
  const daysUntilTrialEnd = user?.trial_ends 
    ? Math.max(0, Math.ceil((new Date(user.trial_ends) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Button 
        onClick={() => User.login()}
        className="bg-gradient-to-r from-green-600 to-green-700"
      >
        Mit Google anmelden
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-gray-900 truncate">
              {user.full_name || user.email}
            </CardTitle>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Plan:</span>
          <Badge className={getPlanColor(user.subscription_plan)}>
            <Crown className="w-3 h-3 mr-1" />
            {getPlanName(user.subscription_plan)}
          </Badge>
        </div>

        {isTrialActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Trial aktiv</span>
            </div>
            <p className="text-xs text-amber-700">
              Noch {daysUntilTrialEnd} Tage kostenlos
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Link to={createPageUrl("Pricing")}>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Plan upgraden
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full text-xs text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Abmelden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}