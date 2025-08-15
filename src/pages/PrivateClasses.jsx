
import React, { useState, useEffect } from 'react';
import { User, Appointment } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const professors = [
  {
    id: 1,
    name: 'Dr. Anna Schmidt',
    specialty: 'Expertin für klinische Kommunikation',
    rate: 75,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300',
  },
  {
    id: 2,
    name: 'Dr. Markus Weber',
    specialty: 'Spezialist für Innere Medizin & Fallstudien',
    rate: 85,
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300',
  },
];

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export default function PrivateClasses() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(professors[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingStep, setBookingStep] = useState('selection'); // selection, confirmation, booked
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(() => {});
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const handleBooking = async () => {
    if (!currentUser || !selectedDate || !selectedTime || !selectedProfessor) {
      alert('Bitte stellen Sie sicher, dass alle Details ausgewählt sind.');
      return;
    }
    
    setIsLoading(true);

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      await Appointment.create({
        professor_name: selectedProfessor.name,
        student_name: currentUser.full_name,
        student_email: currentUser.email,
        appointment_date: appointmentDateTime.toISOString(),
        rate: selectedProfessor.rate,
        status: 'pending_payment'
      });

      await SendEmail({
          to: 'dr.felipeyanez@gmail.com',
          subject: `Neue Privatstunden-Buchung: ${currentUser.full_name}`,
          body: `
            <h3>Neue Buchung erhalten!</h3>
            <p><strong>Student:</strong> ${currentUser.full_name} (${currentUser.email})</p>
            <p><strong>Dozent:</strong> ${selectedProfessor.name}</p>
            <p><strong>Datum:</strong> ${format(appointmentDateTime, 'PPP', { locale: de })}</p>
            <p><strong>Uhrzeit:</strong> ${selectedTime}</p>
            <p><strong>Preis:</strong> €${selectedProfessor.rate}/Stunde</p>
            <p>Bitte kontaktieren Sie den Studenten, um die Zahlung und weitere Details zu arrangieren.</p>
          `
      });

      setBookingStep('booked');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
        setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (bookingStep) {
        case 'booked':
            return (
                <div className="text-center p-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6"/>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Buchung erfolgreich!</h2>
                    <p className="text-gray-300 mb-4">Ihre Anfrage wurde gesendet. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit den Zahlungsdetails.</p>
                    <Button onClick={() => setBookingStep('selection')} className="bg-green-600 hover:bg-green-700 text-white">Neue Buchung</Button>
                </div>
            )
        case 'confirmation':
            return (
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Buchung bestätigen</h2>
                    <Card className="p-6 bg-gray-700/50 mb-6 border border-gray-600 text-white">
                        <p><strong>Dozent:</strong> {selectedProfessor.name}</p>
                        <p><strong>Datum:</strong> {format(selectedDate, 'PPP', { locale: de })}</p>
                        <p><strong>Uhrzeit:</strong> {selectedTime}</p>
                        <p className="mt-4 text-lg font-bold">Preis: €{selectedProfessor.rate}</p>
                    </Card>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setBookingStep('selection')} className="border-gray-500 text-gray-200 hover:bg-gray-700">Zurück</Button>
                        <Button onClick={handleBooking} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                            {isLoading ? 'Wird gebucht...' : 'Jetzt zahlungspflichtig buchen'}
                        </Button>
                    </div>
                </div>
            )
        default:
            return (
                <>
                <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">1. Dozenten wählen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professors.map((prof) => (
                    <Card
                      key={prof.id}
                      className={`p-4 cursor-pointer border-2 transition-all bg-gray-800/50 ${selectedProfessor.id === prof.id ? 'border-green-500 shadow-lg' : 'border-gray-700 hover:shadow-md hover:border-green-600'}`}
                      onClick={() => setSelectedProfessor(prof)}
                    >
                      <div className="flex items-center gap-4">
                        <img src={prof.imageUrl} alt={prof.name} className="w-16 h-16 rounded-full object-cover"/>
                        <div>
                          <p className="font-bold text-white">{prof.name}</p>
                          <p className="text-sm text-gray-400">{prof.specialty}</p>
                          <Badge className="mt-2 bg-green-900/50 text-green-300 border-green-700">€{prof.rate}/Stunde</Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">2. Termin wählen</h2>
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <ArrowLeft className="w-4 h-4 mr-2"/> Vorherige
                  </Button>
                  <span className="font-semibold text-lg text-white">{format(weekStart, 'MMM yyyy', { locale: de })}</span>
                  <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Nächste <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day.toString()} className="text-center">
                      <p className="text-sm text-gray-400 mb-2">{format(day, 'EEE', { locale: de })}</p>
                      <button
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center font-medium text-white ${
                          format(day, 'yyyy-MM-dd') === format(selectedDate || new Date(0), 'yyyy-MM-dd')
                            ? 'bg-green-600 shadow-md'
                            : 'hover:bg-gray-700 border border-gray-600'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        {format(day, 'd')}
                      </button>
                    </div>
                  ))}
                </div>
                {selectedDate && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        className={`${selectedTime === slot ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-gray-700 flex justify-end">
                <Button size="lg" disabled={!selectedTime} onClick={() => setBookingStep('confirmation')} className="bg-green-600 hover:bg-green-700 text-white">
                    Weiter zur Bestätigung <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
              </div>
              </>
            )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl">
            <h1 className="text-4xl font-bold text-white mb-2 text-center">Private Stunden buchen</h1>
            <p className="text-lg text-gray-300 mb-8 text-center">Persönliches Coaching zur Perfektionierung Ihrer medizinischen Deutschkenntnisse.</p>
            
            <AnimatePresence mode="wait">
            <motion.div
                key={bookingStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="shadow-2xl border-0 bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden">
                    {renderContent()}
                </Card>
            </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
}
