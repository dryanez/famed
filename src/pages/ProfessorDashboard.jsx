
import React, { useState, useEffect } from 'react';
import { User, Class, Assignment, Course, Flashcard, MedicalCase, Submission, SpeechAssessment, UserFlashcardMastery } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Plus, Search, Mail, BookOpen, Mic, Stethoscope, BookCheck, ArrowLeft, CalendarIcon, ChevronsRight, Trash2, CheckCircle, XCircle, Download, UserPlus, ArrowRight, Eye, BarChart2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import StudentReportModal from '../components/professor/StudentReportModal';

// --- Create Class Modal ---
const CreateClassModal = ({ onClassCreated }) => {
    const [className, setClassName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!className.trim()) {
            alert("Bitte geben Sie einen Klassennamen ein.");
            return;
        }
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            await Class.create({
                class_name: className,
                professor_email: currentUser.email,
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
                student_emails: []
            });
            onClassCreated();
            setClassName('');
            setStartDate(null);
            setEndDate(null);
        } catch (error) {
            console.error("Failed to create class", error);
            alert("Fehler beim Erstellen der Klasse.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Neue Klasse erstellen</DialogTitle>
                <DialogDescription>Erstellen Sie eine neue Klasse für Ihre Studenten.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input
                    placeholder="Klassenname (z.B. Medizinisches Deutsch A1)"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    required
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'PPP', { locale: de }) : <span>Startdatum</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP', { locale: de }) : <span>Enddatum (optional)</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
                </Popover>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Wird erstellt...' : 'Klasse erstellen'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

// --- Add Student Modal ---
const AddStudentModal = ({ classData, onStudentsAdded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        try {
            const results = await User.list();
            const filteredResults = results.filter(user => {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = user.full_name && user.full_name.toLowerCase().includes(searchLower);
                const emailMatch = user.email && user.email.toLowerCase().includes(searchLower);
                const isStudentRole = user.role !== 'admin';
                const notInClass = !(classData.student_emails || []).includes(user.email);
                return (nameMatch || emailMatch) && isStudentRole && notInClass;
            });
            setSearchResults(filteredResults);
        } catch (error) {
            console.error("Failed to search students:", error);
            alert("Fehler bei der Suche nach Studenten.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStudent = (student) => {
        setSelectedStudents(prev =>
            prev.find(s => s.id === student.id)
                ? prev.filter(s => s.id !== student.id)
                : [...prev, student]
        );
    };

    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) return;
        setIsLoading(true);
        try {
            const newEmails = selectedStudents.map(s => s.email);
            const updatedEmails = [...(classData.student_emails || []), ...newEmails];
            await Class.update(classData.id, { student_emails: updatedEmails });

            for (const student of selectedStudents) {
                await User.update(student.id, { class_id: classData.id });
            }

            onStudentsAdded();
            setSearchTerm('');
            setSearchResults([]);
            setSelectedStudents([]);
            setHasSearched(false);
        } catch (error) {
            console.error("Failed to add students to class:", error);
            alert("Fehler beim Hinzufügen von Studenten.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Studenten hinzufügen</DialogTitle>
                <DialogDescription>
                  Suchen Sie nach Studenten und klicken Sie auf "Auswählen". Fügen Sie sie dann am Ende hinzu.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Name oder E-Mail eingeben..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
                        <Search className="w-4 h-4 mr-2" />
                        {isLoading ? 'Suchen...' : 'Suchen'}
                    </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                    {!hasSearched && (
                        <p className="text-gray-500 text-center py-8">Geben Sie einen Namen oder eine E-Mail ein und klicken Sie auf "Suchen".</p>
                    )}

                    {hasSearched && searchResults.length === 0 && !isLoading && (
                        <p className="text-gray-500 text-center py-8">Keine passenden Studenten gefunden.</p>
                    )}

                    {searchResults.map(student => {
                        const isSelected = selectedStudents.find(s => s.id === student.id);
                        return (
                            <div
                                key={student.id}
                                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                                    isSelected ? 'bg-green-100' : 'bg-gray-50'
                                }`}
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{student.full_name || 'Unbekannter Name'}</p>
                                    <p className="text-sm text-gray-600">{student.email}</p>
                                </div>
                                <Button
                                  variant={isSelected ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleStudent(student)}
                                >
                                  {isSelected ? <CheckCircle className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                  {isSelected ? 'Ausgewählt' : 'Auswählen'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="outline">Abbrechen</Button></DialogClose>
                <Button
                    onClick={handleAddStudents}
                    disabled={selectedStudents.length === 0 || isLoading}
                >
                    {isLoading ? 'Wird hinzugefügt...' : `${selectedStudents.length} Student${selectedStudents.length === 1 ? '' : 'en'} hinzufügen`}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

// --- Create Assignment Modal ---
const CreateAssignmentModal = ({ classData, onAssignmentCreated }) => {
    const [title, setTitle] = useState('');
    const [taskType, setTaskType] = useState('medical_case');
    const [resourceId, setResourceId] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [resources, setResources] = useState([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

    useEffect(() => {
        const fetchResources = async () => {
            if (!taskType) return;
            setIsLoadingResources(true);
            try {
                let resourceData = [];
                if (taskType === 'medical_case') {
                    resourceData = await MedicalCase.list();
                } else if (taskType === 'flashcard_deck') {
                    const allFlashcards = await Flashcard.list();
                    const deckNames = [...new Set(allFlashcards.map(c => c.deck).filter(Boolean))];
                    resourceData = deckNames.map(deck => ({ id: deck, title: deck }));
                }
                setResources(resourceData);
                setResourceId(resourceData.length > 0 ? resourceData[0].id : '');
            } catch (error) {
                console.error("Failed to fetch resources:", error);
                setResources([]);
            } finally {
                setIsLoadingResources(false);
            }
        };
        fetchResources();
    }, [taskType]);

    const handleSubmit = async () => {
        if (!title.trim() || !resourceId || !dueDate) {
            alert("Bitte füllen Sie alle Felder aus.");
            return;
        }
        setIsCreatingAssignment(true);
        try {
            await Assignment.create({
                class_id: classData.id,
                title,
                task_type: taskType,
                resource_id: resourceId,
                due_date: format(dueDate, 'yyyy-MM-dd')
            });
            onAssignmentCreated();
            setTitle('');
            setDueDate(null);
        } catch (error) {
            console.error("Failed to create assignment:", error);
            alert("Fehler beim Erstellen der Aufgabe.");
        } finally {
            setIsCreatingAssignment(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
                <DialogDescription>Weisen Sie Ihrer Klasse '{classData.class_name}' eine neue Aufgabe zu.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Aufgabentitel (z.B. 'Herz-Kreislauf Fallstudie')" value={title} onChange={e => setTitle(e.target.value)} required />
                <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger><SelectValue placeholder="Aufgabentyp" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="medical_case">Medizinischer Fall</SelectItem>
                        <SelectItem value="flashcard_deck">Lernkarten-Deck</SelectItem>
                        <SelectItem value="course" disabled>Kurs (demnächst)</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={resourceId} onValueChange={setResourceId} disabled={isLoadingResources || resources.length === 0}>
                    <SelectTrigger>
                        <SelectValue placeholder={isLoadingResources ? "Lädt Ressourcen..." : (resources.length > 0 ? "Ressource auswählen" : "Keine Ressourcen verfügbar")} />
                    </SelectTrigger>
                    <SelectContent>
                        {resources.map(res => <SelectItem key={res.id} value={res.id}>{res.title}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, 'PPP', { locale: de }) : <span>Abgabedatum</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dueDate} onSelect={setDueDate} /></PopoverContent>
                </Popover>
            </div>
             <DialogFooter>
                <DialogClose asChild><Button variant="outline">Abbrechen</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={isCreatingAssignment || !title.trim() || !resourceId || !dueDate}>
                    {isCreatingAssignment ? 'Wird erstellt...' : 'Aufgabe erstellen'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};


// --- Class Detail View ---
const ClassDetail = ({ classData, onBack }) => {
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [masteryData, setMasteryData] = useState([]);
    const [allFlashcards, setAllFlashcards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedStudent, setSelectedStudent] = useState(null); // New state
    const [showStudentReport, setShowStudentReport] = useState(false); // New state

    const handleStudentClick = (student) => { // New handler
        setSelectedStudent(student);
        setShowStudentReport(true);
    };

    const loadClassDetails = async () => {
        setIsLoading(true);
        try {
            const studentEmails = classData.student_emails || [];
            if (studentEmails.length === 0) {
                setStudents([]);
                setAssignments([]);
                setSubmissions([]);
                setAssessments([]);
                setMasteryData([]);
                setAllFlashcards([]);
                setIsLoading(false);
                return;
            }

            const [
                studentData,
                assignmentData,
                submissionData,
                assessmentData,
                masteryRecords,
                flashcardData
            ] = await Promise.all([
                User.filter({ email: { $in: studentEmails } }),
                Assignment.filter({ class_id: classData.id }, '-due_date'),
                Submission.filter({ class_id: classData.id }),
                SpeechAssessment.filter({ class_id: classData.id }),
                UserFlashcardMastery.filter({ user_email: { $in: studentEmails } }),
                Flashcard.list()
            ]);
            setStudents(studentData);
            setAssignments(assignmentData);
            setSubmissions(submissionData);
            setAssessments(assessmentData);
            setMasteryData(masteryRecords);
            setAllFlashcards(flashcardData);
        } catch (error) {
            console.error("Failed to load class details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClassDetails();
    }, [classData]);

    const getStudentStats = (studentEmail) => {
        if (assignments.length === 0) {
            return { completion: 0, averageScore: 0 };
        }

        const studentSubmissions = submissions.filter(s => s.student_email === studentEmail);
        const completedAssignments = new Set(studentSubmissions.map(s => s.assignment_id));
        const completion = (completedAssignments.size / assignments.length) * 100;

        const scores = [];
        assignments.forEach(assignment => {
            if (!completedAssignments.has(assignment.id)) return; // Only consider completed assignments for scores

            if (assignment.task_type === 'medical_case') {
                const submission = studentSubmissions.find(s => s.assignment_id === assignment.id);
                if (submission) {
                    const assessment = assessments.find(a => a.id === submission.related_assessment_id);
                    if (assessment) scores.push(assessment.overall_score);
                }
            } else if (assignment.task_type === 'flashcard_deck') {
                const deckName = assignment.resource_id;
                const deckCardIds = allFlashcards.filter(c => c.deck === deckName).map(c => c.id);
                if (deckCardIds.length > 0) {
                    const studentMasteryForDeck = masteryData.filter(m =>
                        m.user_email === studentEmail && deckCardIds.includes(m.flashcard_id)
                    );
                    if (studentMasteryForDeck.length > 0) {
                        const totalMastery = studentMasteryForDeck.reduce((sum, m) => sum + m.mastery_level, 0);
                        const avgMastery = totalMastery / studentMasteryForDeck.length;
                        const masteryScore = (avgMastery / 5) * 100; // Convert 0-5 scale to 0-100
                        scores.push(masteryScore);
                    }
                }
            }
        });

        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        return {
            completion: Math.round(completion),
            averageScore: Math.round(averageScore)
        };
    };

    const handleRemoveStudent = async (studentEmail) => {
        if (!confirm("Sind Sie sicher, dass Sie diesen Studenten entfernen möchten?")) return;
        try {
            const updatedEmails = classData.student_emails.filter(email => email !== studentEmail);
            await Class.update(classData.id, { student_emails: updatedEmails });

            const student = students.find(s => s.email === studentEmail);
            if (student) {
                await User.update(student.id, { class_id: null });
            }

            loadClassDetails();
        } catch (error) {
            console.error("Failed to remove student:", error);
            alert("Student konnte nicht entfernt werden.");
        }
    };

    const getProgressColor = (value) => {
        if (value < 40) return "bg-red-600";
        if (value < 70) return "bg-yellow-500";
        return "bg-green-600";
    }

    const groupAssignmentsByDate = (assignments) => { // New function
        const grouped = assignments.reduce((acc, assignment) => {
            const date = format(new Date(assignment.due_date), 'yyyy-MM-dd');
            if (!acc[date]) acc[date] = [];
            acc[date].push(assignment);
            return acc;
        }, {});
        return Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b));
    };

    return (
        <div>
            <Button variant="outline" onClick={onBack} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zu allen Klassen
            </Button>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{classData.class_name}</h1>
                <p className="text-gray-600">{classData.student_emails?.length || 0} Studenten • {assignments.length} Aufgaben</p>
                {classData.start_date && (
                    <p className="text-sm text-gray-500 mt-1">
                        Gestartet am: {format(new Date(classData.start_date), 'dd.MM.yyyy', { locale: de })}
                        {classData.end_date && ` • Endet am: ${format(new Date(classData.end_date), 'dd.MM.yyyy', { locale: de })}`}
                    </p>
                )}
            </div>

            <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="progress">Fortschritt</TabsTrigger>
                    <TabsTrigger value="assignments">Aufgaben</TabsTrigger>
                    <TabsTrigger value="roster">Studenten</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="mt-6">
                    <Card className="shadow-lg border-0 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border-gray-700">
                        <CardHeader><CardTitle className="text-white">Studentenfortschritt</CardTitle></CardHeader>
                        <CardContent>
                           {isLoading ? <p className="text-white">Laden...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-white">Student</TableHead>
                                        <TableHead className="text-white">Abschluss</TableHead>
                                        <TableHead className="text-white">Durchschn. Leistung</TableHead>
                                        <TableHead className="text-white text-right">Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => {
                                        const stats = getStudentStats(student.email);
                                        return (
                                        <TableRow key={student.id} className="border-gray-700">
                                            <TableCell className="font-medium text-white">
                                                <button
                                                    onClick={() => handleStudentClick(student)}
                                                    className="text-left hover:underline focus:outline-none"
                                                >
                                                    {student.full_name}
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={stats.completion} className="w-32 h-2.5 bg-gray-600" indicatorClassName={getProgressColor(stats.completion)} />
                                                    <span className="text-white font-mono">{stats.completion}%</span>
                                                </div>
                                            </TableCell>
                                             <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={stats.averageScore} className="w-32 h-2.5 bg-gray-600" indicatorClassName={getProgressColor(stats.averageScore)} />
                                                    <span className="text-white font-mono">{stats.averageScore}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => handleStudentClick(student)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                    {students.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-4">Noch keine Studenten in dieser Klasse.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="mt-6">
                     <Card className="shadow-lg border-0 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-white">
                                <span>Aufgaben</span>
                                 <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                                            <Plus className="w-4 h-4 mr-2" /> Neue Aufgabe
                                        </Button>
                                    </DialogTrigger>
                                    <CreateAssignmentModal classData={classData} onAssignmentCreated={loadClassDetails} />
                                </Dialog>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {isLoading ? <p className="text-white">Laden...</p> : (
                             <div className="space-y-6">
                                {groupAssignmentsByDate(assignments).map(([date, dayAssignments]) => (
                                    <div key={date} className="bg-gray-700/50 rounded-lg p-4">
                                        <h3 className="text-white font-semibold mb-3">
                                            {format(new Date(date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                                        </h3>
                                        <div className="space-y-2">
                                            {dayAssignments.map(ass => (
                                                <div key={ass.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-white">{ass.title}</p>
                                                        <Badge variant="outline" className="border-gray-500 text-gray-300 mt-1">
                                                            {ass.task_type === 'medical_case' ? 'Medizinischer Fall' : 'Lernkarten-Deck'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {assignments.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">
                                        Noch keine Aufgaben erstellt.
                                    </div>
                                )}
                             </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roster" className="mt-6">
                    <Card className="shadow-lg border-0 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border-gray-700">
                         <CardHeader>
                            <CardTitle className="flex justify-between items-center text-white">
                                <span>Studentenliste</span>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Plus className="w-4 h-4 mr-2" /> Studenten hinzufügen
                                        </Button>
                                    </DialogTrigger>
                                    <AddStudentModal classData={classData} onStudentsAdded={loadClassDetails} />
                                </Dialog>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <p className="text-white">Laden...</p> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-700">
                                            <TableHead className="text-white">Name</TableHead>
                                            <TableHead className="text-white">Email</TableHead>
                                            <TableHead className="text-right text-white">Aktionen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id} className="border-gray-700">
                                                <TableCell className="font-medium text-white">{student.full_name}</TableCell>
                                                <TableCell className="text-gray-300">{student.email}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveStudent(student.email)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {students.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-gray-400 py-4">Noch keine Studenten in dieser Klasse.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Student Report Modal */}
            <StudentReportModal
                student={selectedStudent}
                classData={classData}
                assignments={assignments}
                submissions={submissions}
                assessments={assessments}
                masteryData={masteryData}
                allFlashcards={allFlashcards}
                getStudentStats={getStudentStats}
                isOpen={showStudentReport}
                onClose={() => setShowStudentReport(false)}
            />
        </div>
    );
};


// --- Main Professor Dashboard ---
export default function ProfessorDashboard() {
  const [professor, setProfessor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showStudentReportModal, setShowStudentReportModal] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentProfessor = await User.me();
      setProfessor(currentProfessor);
      const classData = await Class.filter({ professor_email: currentProfessor.email });
      setClasses(classData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
    setIsLoading(false);
  };

  const handleClassCreated = () => {
      loadData();
      setShowCreateClassModal(false); // Close the modal after creation
  };

  if (isLoading) return <div className="p-6 text-white">Lade Professor Dashboard...</div>;
  if (!professor) return <div className="p-6 text-white">Zugriff verweigert. Diese Seite ist nur für Professoren.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {!selectedClass ? (
            <>
            <header className="mb-8">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-10 h-10 text-green-500" />
                <div>
                  <h1 className="text-4xl font-bold text-white">Professor Dashboard</h1>
                  <p className="text-gray-300 text-lg">Verwalten Sie Ihre Klassen und Studenten.</p>
                </div>
              </div>
            </header>

            <Card className="shadow-lg border-0 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-white">
                        <span>Meine Klassen ({classes.length})</span>
                        <Dialog open={showCreateClassModal} onOpenChange={setShowCreateClassModal}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" /> Neue Klasse
                                </Button>
                            </DialogTrigger>
                            <CreateClassModal onClassCreated={handleClassCreated} />
                        </Dialog>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {classes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map(cls => (
                                <Card key={cls.id} className="bg-gray-800/60 border-gray-700 hover:shadow-lg hover:border-green-600 transition-all text-white overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/30 z-0"></div>
                                    <div className="relative z-10 p-6">
                                        <CardTitle className="text-white text-xl">{cls.class_name}</CardTitle>
                                        <p className="text-sm text-gray-300 mt-1">{cls.student_emails?.length || 0} Studenten</p>
                                        {cls.start_date && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                {format(new Date(cls.start_date), 'dd.MM.yyyy')}
                                                {cls.end_date && ` - ${format(new Date(cls.end_date), 'dd.MM.yyyy')}`}
                                            </p>
                                        )}
                                        <Button
                                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => setSelectedClass(cls)}
                                        >
                                            Klasse verwalten <ChevronsRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-lg font-semibold mb-2">Sie haben noch keine Klassen</h3>
                            <p>Klicken Sie auf "Neue Klasse", um Ihre erste Klasse zu erstellen.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            </>
        ) : (
            <ClassDetail classData={selectedClass} onBack={() => setSelectedClass(null)} />
        )}
      </div>
    </div>
  );
}
