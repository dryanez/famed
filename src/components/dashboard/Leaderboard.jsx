import React, { useState, useEffect } from 'react';
import { User, Class } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Zap, Users, Trophy, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calculateLevelInfo } from '../gamification/GamificationProfile';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState({ daily: [], overall: [], classes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading', 'admin', 'user', 'guest'

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role === 'admin') {
          setAuthStatus('admin');
          await fetchAdminLeaderboardData();
        } else {
          setAuthStatus('user');
        }
      } catch (error) {
        setAuthStatus('guest');
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    initialize();
  }, []);

  const fetchAdminLeaderboardData = async () => {
    try {
      const [daily, overall, classes] = await Promise.all([
        User.filter({ daily_xp: { $gt: 0 } }, '-daily_xp', 10),
        User.list('-xp', 10),
        Class.list()
      ]);

      const classXPTotals = await Promise.all(
        classes.map(async (cls) => {
          const classStudents = await User.filter({ class_id: cls.id });
          const totalXP = classStudents.reduce((sum, student) => sum + (student.xp || 0), 0);
          return { ...cls, total_xp: totalXP, student_count: classStudents.length };
        })
      );
      
      const sortedClasses = classXPTotals.sort((a, b) => b.total_xp - a.total_xp).slice(0, 5);
      setLeaderboardData({ daily, overall, classes: sortedClasses });
    } catch (error) {
      console.error("Error fetching admin leaderboard data:", error);
    }
  };

  const renderLeaderboardList = (data, type) => {
    // ... (This function remains the same as it's only used for admins now)
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>Noch keine Daten verfügbar.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              type !== 'classes' && currentUser?.id === item.id 
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-sm' 
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
              index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
              index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
              'bg-gradient-to-br from-gray-500 to-gray-700'
            }`}>
              {index + 1}
            </div>
            
            {type === 'classes' ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.class_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.student_count} Studenten</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 text-sm">
                  <span>{item.total_xp}</span>
                  <Zap className="w-4 h-4" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {item.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.title || 'Neuling'}</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 text-sm">
                  <span>{type === 'daily' ? item.daily_xp : item.xp}</span>
                  <Zap className="w-4 h-4" />
                </div>
                {type !== 'classes' && currentUser?.id === item.id && <Crown className="w-4 h-4 text-amber-500" />}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderAdminView = () => (
    <Tabs defaultValue="overall">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="daily">Täglich</TabsTrigger>
        <TabsTrigger value="overall">Gesamt</TabsTrigger>
        <TabsTrigger value="classes">Klassen</TabsTrigger>
      </TabsList>
      <TabsContent value="daily" className="mt-4">
        {renderLeaderboardList(leaderboardData.daily, 'daily')}
      </TabsContent>
      <TabsContent value="overall" className="mt-4">
        {renderLeaderboardList(leaderboardData.overall, 'overall')}
      </TabsContent>
      <TabsContent value="classes" className="mt-4">
        {renderLeaderboardList(leaderboardData.classes, 'classes')}
      </TabsContent>
    </Tabs>
  );

  const renderUserView = () => {
    const { level, title } = calculateLevelInfo(currentUser.xp || 0);
    return (
      <div className="text-center p-4">
        <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-green-400">
          <AvatarImage src={currentUser.profile_picture_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-3xl">
            {currentUser.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{currentUser.full_name}</h3>
        <p className="text-sm text-green-500 dark:text-green-400 font-semibold mb-4">{title}</p>
        
        <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Gesamt-XP</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{currentUser.xp || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Tägliche XP</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{currentUser.daily_xp || 0}</p>
            </div>
        </div>
      </div>
    );
  };

  const renderGuestView = () => (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="font-semibold">Messen Sie sich mit anderen!</p>
          <p className="text-sm mb-4">Registrieren Sie sich, um Ihren Rang zu sehen und aufzusteigen.</p>
          <Link to={createPageUrl("Home")}>
              <Button>Jetzt kostenlos starten</Button>
          </Link>
      </div>
  );
  
  const renderLoading = () => (
      <div className="space-y-3 p-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
  );

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Trophy className="w-5 h-5 text-amber-500" />
          {authStatus === 'admin' ? 'Bestenliste' : 'Mein Status'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && renderLoading()}
        {!isLoading && authStatus === 'admin' && renderAdminView()}
        {!isLoading && authStatus === 'user' && renderUserView()}
        {!isLoading && authStatus === 'guest' && renderGuestView()}
      </CardContent>
    </Card>
  );
}