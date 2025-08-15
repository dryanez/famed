import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Course, Enrollment, User, Certificate } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, PlayCircle, CheckCircle, Star, Users, Award, BookOpen, Clock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function CourseDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setError("Keine Kurs-ID angegeben.");
      setIsLoading(false);
      return;
    }
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me().catch(() => null);
      setUser(currentUser);

      const courseData = await Course.get(courseId);
      setCourse(courseData);

      if (currentUser) {
        const enrollmentData = await Enrollment.filter({ user_email: currentUser.email, course_id: courseId });
        if (enrollmentData.length > 0) {
          setEnrollment(enrollmentData[0]);
        } else {
          // Auto-enroll the user
          const newEnrollment = await Enrollment.create({
            user_email: currentUser.email,
            course_id: courseId,
            progress: 0,
            completed_lessons: []
          });
          setEnrollment(newEnrollment);
        }
      }

      // Set the first video as default
      if (courseData.modules && courseData.modules[0]?.videos[0]) {
        setSelectedVideo(courseData.modules[0].videos[0]);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Kursdaten:", err);
      setError("Kurs konnte nicht geladen werden.");
    }
    setIsLoading(false);
  };
  
  const handleLessonClick = (video) => {
    setSelectedVideo(video);
  };
  
  const handleMarkAsComplete = async () => {
      if (!enrollment || !selectedVideo) return;

      const lessonIdentifier = selectedVideo.title;
      if (enrollment.completed_lessons?.includes(lessonIdentifier)) return;

      const totalLessons = course.modules.reduce((sum, mod) => sum + mod.videos.length, 0);
      const newCompletedLessons = [...(enrollment.completed_lessons || []), lessonIdentifier];
      const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);

      try {
          const updatedEnrollment = await Enrollment.update(enrollment.id, {
              completed_lessons: newCompletedLessons,
              progress: newProgress,
              completed_at: newProgress === 100 ? new Date().toISOString() : null,
          });
          setEnrollment(updatedEnrollment);
          
          if(newProgress === 100) {
              await generateCertificate();
          }
      } catch(err) {
          console.error("Fehler beim Aktualisieren des Fortschritts:", err);
      }
  };

  const generateCertificate = async () => {
      try {
          await Certificate.create({
              user_email: user.email,
              user_name: user.full_name,
              course_id: course.id,
              course_title: course.title,
              issued_at: format(new Date(), 'yyyy-MM-dd')
          });
      } catch(err) {
          console.error("Fehler beim Erstellen des Zertifikats:", err);
      }
  };


  if (isLoading) {
    return <div className="text-center p-10 text-white">Lade Kursdetails...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  const isLessonCompleted = (video) => {
    return enrollment?.completed_lessons?.includes(video.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6 text-white">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("OnDemand"))}
            className="border-gray-600 bg-gray-800/50 hover:bg-gray-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-sm text-gray-400">von {course.instructor_name}, {course.instructor_title}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
              <CardContent className="p-4">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                  {selectedVideo && selectedVideo.youtube_id ? (
                      <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}`}
                          title={selectedVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                      ></iframe>
                  ) : (
                    <div className="text-gray-400 text-center">
                        <PlayCircle className="w-16 h-16 mx-auto mb-2" />
                        <p>Video-Player</p>
                        <p className="text-sm">Keine Video-ID vorhanden. Dies ist ein Platzhalter.</p>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-2">{selectedVideo?.title || 'Wählen Sie eine Lektion'}</h2>
                
                {selectedVideo && user && (
                    <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {selectedVideo.duration}
                        </Badge>
                        <Button
                            onClick={handleMarkAsComplete}
                            disabled={isLessonCompleted(selectedVideo)}
                            className={`transition-all ${isLessonCompleted(selectedVideo) 
                                ? 'bg-green-700 hover:bg-green-700 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-500'}`}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isLessonCompleted(selectedVideo) ? 'Abgeschlossen' : 'Als abgeschlossen markieren'}
                        </Button>
                    </div>
                )}
                
              </CardContent>
            </Card>

            <Card className="mt-6 bg-gray-800/50 border-gray-700 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-400" /> Kursbeschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 leading-relaxed">{course.description}</p>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span>{course.rating} Bewertung</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                            <Users className="w-4 h-4" />
                            <span>{course.student_count} Teilnehmer</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 shadow-xl h-full">
                <CardHeader>
                    <CardTitle>Kursinhalte</CardTitle>
                    {user && enrollment && (
                        <div className="mt-2">
                           <div className="flex justify-between text-sm mb-1">
                               <span>Fortschritt</span>
                               <span className="font-bold">{enrollment.progress}%</span>
                           </div>
                           <Progress value={enrollment.progress} className="h-2 [&>div]:bg-green-500" />
                           {enrollment.progress === 100 && (
                                <Alert className="mt-4 bg-green-900/50 border-green-700 text-green-300">
                                    <Award className="h-4 w-4 !text-green-300" />
                                    <AlertTitle>Kurs abgeschlossen!</AlertTitle>
                                    <AlertDescription>
                                        <Link to={createPageUrl("Certificate")} className="underline font-bold">Zertifikat ansehen</Link>
                                    </AlertDescription>
                                </Alert>
                           )}
                        </div>
                    )}
                </CardHeader>
              <CardContent className="p-2">
                <Accordion type="single" collapsible defaultValue="module-0" className="w-full">
                  {course.modules.map((module, moduleIndex) => (
                    <AccordionItem key={moduleIndex} value={`module-${moduleIndex}`} className="border-b-gray-700">
                      <AccordionTrigger className="px-4 text-base hover:no-underline hover:bg-gray-700/50 rounded-lg">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="p-1">
                        <ul className="space-y-1">
                          {module.videos.map((video, videoIndex) => (
                            <li key={videoIndex}>
                              <button
                                onClick={() => handleLessonClick(video)}
                                className={`w-full flex items-center gap-3 text-left p-3 rounded-md text-sm transition-colors ${
                                  selectedVideo?.title === video.title ? 'bg-green-600/30 text-white' : 'hover:bg-gray-700/50 text-gray-300'
                                }`}
                              >
                                {isLessonCompleted(video) ? (
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                    <PlayCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                )}
                                <span className="flex-1">{video.title}</span>
                                <span className="text-xs text-gray-400">{video.duration}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}