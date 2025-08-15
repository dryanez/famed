import React, { useState, useEffect } from 'react';
import { User, Class, Assignment, Submission, ClassMessage, SpeechAssessment } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Trophy, 
  Target, 
  Calendar, 
  MessageCircle, 
  Send, 
  Paperclip, 
  Crown,
  Star,
  Flame,
  ArrowLeft,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ClassDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classmates, setClassmates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    loadClassData();
  }, []);

  const loadClassData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (!currentUser.class_id) {
        navigate(createPageUrl("Dashboard"));
        return;
      }

      setUser(currentUser);
      
      const [
        userClass,
        classAssignments,
        userSubmissions,
        allClassmates,
        classMessages
      ] = await Promise.all([
        Class.get(currentUser.class_id),
        Assignment.filter({ class_id: currentUser.class_id }, '-due_date'),
        Submission.filter({ student_email: currentUser.email, class_id: currentUser.class_id }),
        User.filter({ class_id: currentUser.class_id }, '-xp'),
        ClassMessage.filter({ class_id: currentUser.class_id }, '-created_date', 50)
      ]);

      setClassData(userClass);
      setAssignments(classAssignments);
      setSubmissions(userSubmissions);
      setClassmates(allClassmates);
      setMessages(classMessages);
    } catch (error) {
      console.error("Error loading class data:", error);
      navigate(createPageUrl("Dashboard"));
    }
    setIsLoading(false);
  };

  const getAssignmentProgress = () => {
    if (assignments.length === 0) return 0;
    const completedAssignments = assignments.filter(assignment => 
      submissions.some(sub => sub.assignment_id === assignment.id)
    );
    return Math.round((completedAssignments.length / assignments.length) * 100);
  };

  const getUserRankInClass = () => {
    const sortedClassmates = [...classmates].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return sortedClassmates.findIndex(mate => mate.email === user.email) + 1;
  };

  const getTotalXPFromClass = () => {
    return submissions.reduce((total, sub) => {
      // Estimate XP based on completion (you might want to store actual XP earned)
      return total + 25; // Base XP per completed assignment
    }, 0);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return;
    
    setIsSendingMessage(true);
    try {
      await ClassMessage.create({
        class_id: user.class_id,
        sender_email: user.email,
        sender_name: user.full_name,
        message: newMessage.trim(),
        message_type: 'text'
      });
      setNewMessage('');
      loadClassData(); // Reload to get new messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSendingMessage(false);
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      await ClassMessage.create({
        class_id: user.class_id,
        sender_email: user.email,
        sender_name: user.full_name,
        message: `Datei geteilt: ${file.name}`,
        message_type: 'file',
        file_url
      });
      loadClassData();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              {classData?.class_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Ihr Klassenzimmer • Rang #{getUserRankInClass()} von {classmates.length}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">{getTotalXPFromClass()} XP</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">aus dieser Klasse</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{getAssignmentProgress()}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aufgaben abgeschlossen</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">#{getUserRankInClass()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Klassenrang</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{submissions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Abgaben</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="assignments">Meine Aufgaben</TabsTrigger>
            <TabsTrigger value="leaderboard">Klassenrangliste</TabsTrigger>
            <TabsTrigger value="chat">Klassenchat</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="grid gap-6">
              {assignments.map((assignment) => {
                const isCompleted = submissions.some(sub => sub.assignment_id === assignment.id);
                const isOverdue = new Date(assignment.due_date) < new Date() && !isCompleted;
                
                return (
                  <Card key={assignment.id} className={`shadow-lg border-0 ${
                    isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    'bg-white dark:bg-gray-800'
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            {isCompleted ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />}
                            {assignment.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Fällig: {format(new Date(assignment.due_date), 'dd. MMMM yyyy', { locale: de })}
                          </p>
                        </div>
                        <Badge variant={isCompleted ? "default" : isOverdue ? "destructive" : "secondary"}>
                          {isCompleted ? "Abgeschlossen" : isOverdue ? "Überfällig" : "Ausstehend"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{assignment.task_type === 'medical_case' ? 'Medizinischer Fall' : assignment.task_type}</Badge>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-medium">+25 XP</span>
                            </div>
                          )}
                        </div>
                        {!isCompleted && (
                          <Button 
                            onClick={() => navigate(createPageUrl(`CaseDetail?id=${assignment.resource_id}&assignmentId=${assignment.id}&classId=${assignment.class_id}`))}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Starten
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Klassenrangliste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classmates.map((mate, index) => (
                    <div key={mate.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      mate.email === user.email ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 ring-2 ring-green-300' : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={mate.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {mate.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{mate.full_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{mate.title || 'Neuling'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-amber-600 dark:text-amber-400">{mate.xp || 0} XP</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Level {mate.level || 1}</p>
                      </div>
                      {mate.email === user.email && <Crown className="w-5 h-5 text-amber-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Klassenchat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender_email === user.email ? 'justify-end' : ''}`}>
                        {message.sender_email !== user.email && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {message.sender_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_email === user.email 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          {message.sender_email !== user.email && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{message.sender_name}</p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          {message.file_url && (
                            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                              Datei öffnen
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht eingeben..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    onChange={uploadFile}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" size="icon" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button onClick={sendMessage} disabled={isSendingMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}