import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Certificate as CertificateEntity, Course } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Download, Linkedin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CertificateDisplay = ({ certificate, course }) => {
    if (!certificate || !course) return null;

    const shareUrl = window.location.href;
    const shareText = `Ich habe gerade den Kurs "${course.title}" auf Famed Test abgeschlossen!`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
        >
            <div className="bg-white shadow-2xl rounded-lg p-8 border-t-8 border-green-600">
                <div className="text-center border-b-2 pb-6 border-gray-200">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-wider">Teilnahmezertifikat</h1>
                    <p className="text-gray-500 mt-2">wird verliehen an</p>
                </div>
                <div className="my-12 text-center">
                    <h2 className="text-5xl font-serif text-green-700">{certificate.user_name}</h2>
                </div>
                <div className="text-center">
                    <p className="text-gray-600 text-lg">für den erfolgreichen Abschluss des Kurses</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{course.title}</h3>
                </div>
                <div className="mt-12 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{course.instructor_name}</p>
                        <p className="text-sm text-gray-500">{course.instructor_title}</p>
                    </div>
                    <div>
                        <p className="font-bold">Ausgestellt am</p>
                        <p className="text-sm text-gray-500">{new Date(certificate.issued_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-center gap-4">
                <Button asChild variant="outline">
                    <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" /> Auf LinkedIn teilen
                    </a>
                </Button>
                <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Herunterladen</Button>
            </div>
        </motion.div>
    )
}

export default function Certificate() {
    const location = useLocation();
    const [certificate, setCertificate] = useState(null);
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const certId = new URLSearchParams(location.search).get('id');
    const courseId = new URLSearchParams(location.search).get('course_id');


    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                let certData;
                if (certId) {
                    certData = await CertificateEntity.get(certId);
                } else if (courseId) {
                     // In a real app you'd get the cert for the logged-in user for that course
                    const certs = await CertificateEntity.filter({ course_id: courseId });
                    if (certs.length > 0) certData = certs[0];
                }

                if (certData) {
                    const courseData = await Course.get(certData.course_id);
                    setCertificate(certData);
                    setCourse(courseData);
                }

            } catch(error) {
                console.error("Failed to load certificate:", error);
            }
            setIsLoading(false);
        };
        
        loadData();
    }, [certId, courseId]);

    if (isLoading) return <div className="p-6 text-center">Lade Zertifikat...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
            {certificate && course ? (
                <CertificateDisplay certificate={certificate} course={course} />
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Zertifikat nicht gefunden</h2>
                    <p className="text-gray-600 mt-2">Das angeforderte Zertifikat konnte nicht geladen werden.</p>
                    <Link to={createPageUrl('OnDemand')}>
                        <Button className="mt-4">Zurück zu den Kursen</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}