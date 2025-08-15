
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course, Enrollment, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ course }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-lg border-0 bg-gray-800/50 border-gray-700 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group">
        <div className="relative">
          <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
             <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-none flex items-center gap-1">
                <Star className="w-3 h-3"/> {course.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-100 group-hover:text-green-400 transition-colors">{course.title}</CardTitle>
          <p className="text-sm text-gray-400">von {course.instructor_name}</p>
        </CardHeader>
        <CardContent className="flex-grow pb-4">
          <p className="text-sm text-gray-300 line-clamp-3">{course.description}</p>
        </CardContent>
        <div className="p-6 pt-0">
            <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Kurs ansehen <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default function OnDemand() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const courseData = await Course.list();
        setCourses(courseData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
      setIsLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            On-Demand Kurse
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Vertiefen Sie Ihr Wissen mit von Experten geleiteten Videokursen. Lernen Sie in Ihrem eigenen Tempo, wann und wo Sie wollen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {isLoading 
                ? Array(4).fill(0).map((_, i) => <Card key={i} className="h-96 animate-pulse bg-gray-700"></Card>)
                : courses.map(course => <CourseCard key={course.id} course={course} />)
            }
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-gradient-to-r from-green-800 to-green-700 border-none text-white shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2 text-white">Persönliches Coaching benötigt?</h2>
                    <p className="text-green-100 mb-4 max-w-xl">
                      Buchen Sie eine private 1-zu-1-Stunde mit unseren erfahrenen Dozenten für eine maßgeschneiderte Lernerfahrung.
                    </p>
                    <Link to={createPageUrl("PrivateClasses")}>
                      <Button 
                        size="lg" 
                        className="bg-white text-green-800 hover:bg-green-50 shadow-lg font-semibold px-8 py-3"
                      >
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Private Stunde buchen
                      </Button>
                    </Link>
                  </div>
                   <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
