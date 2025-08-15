
import React, { useState, useEffect } from 'react';
import { ExamReport } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    PieChart, 
    Pie, 
    Cell,
    LineChart,
    Line
} from 'recharts';

const COLORS = {
  Anamnese: '#4a69bd',
  'Arzt–Arzt': '#6a89cc',
  Aufklärung: '#82ccdd',
  Brief: '#f6b93b',
  Reporters: '#e55039'
};

const ReportsPage = () => {
    const [user, setUser] = useState(null);
    const [allReports, setAllReports] = useState([]);
    const [processedData, setProcessedData] = useState({});
    const [globalTotals, setGlobalTotals] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmationMessage, setConfirmationMessage] = useState(false);
    const [formData, setFormData] = useState({
        city: 'Mainz',
        date: '',
        anamnese: '',
        arzt: '',
        aufklarung: '',
        brief: '',
        anamneseOther: '',
        arztOther: '',
        aufklarungOther: '',
        briefOther: ''
    });

    useEffect(() => {
        const checkUser = async () => {
            try {
                const u = await User.me();
                setUser(u);
            } catch (e) {
                console.error("Not logged in");
            }
        };
        checkUser();
        loadAndProcessData();
    }, []);

    const loadAndProcessData = async () => {
        setIsLoading(true);
        try {
            const reports = await ExamReport.list('-exam_date');
            setAllReports(reports);
            
            const processed = processReports(reports);
            setProcessedData(processed);
            
            const global = aggregateGlobalData(reports);
            setGlobalTotals(global);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
        setIsLoading(false);
    };

    const processReports = (reports) => {
        const processed = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        reports.forEach(report => {
            const date = new Date(report.exam_date);
            const monthKey = months[date.getMonth()]; 
            
            if (monthKey && !processed[monthKey]) {
                processed[monthKey] = {
                    reporters: new Set(),
                    counts: { Anamnese: 0, 'Arzt–Arzt': 0, Aufklärung: 0, Brief: 0 },
                    // cases property removed as per outline from monthly data
                };
            }

            if (monthKey) {
                processed[monthKey].reporters.add(report.created_by);
                
                if (report.anamnese_case) {
                    processed[monthKey].counts.Anamnese++;
                }
                if (report.arzt_arzt_case) {
                    processed[monthKey].counts['Arzt–Arzt']++;
                }
                if (report.aufklarung_case) {
                    processed[monthKey].counts.Aufklärung++;
                }
                if (report.brief_case) {
                    processed[monthKey].counts.Brief++;
                }
            }
        });
        
        Object.keys(processed).forEach(monthKey => {
            processed[monthKey].reporters = processed[monthKey].reporters.size;
        });

        // Ensure months are in order for charts
        const orderedProcessedData = {};
        months.forEach(month => {
            if (processed[month]) {
                orderedProcessedData[month] = processed[month];
            }
        });

        return orderedProcessedData;
    };

    const aggregateGlobalData = (reports) => {
        const totals = {
            reporters: new Set(),
            counts: { Anamnese: 0, "Arzt–Arzt": 0, Aufklärung: 0, Brief: 0 },
            cases: { Anamnese: {}, "Arzt–Arzt": {}, Aufklärung: {}, Brief: {} }
        };

        reports.forEach(report => {
            totals.reporters.add(report.created_by);
            
            if (report.anamnese_case) {
                totals.counts.Anamnese++;
                totals.cases.Anamnese[report.anamnese_case] = (totals.cases.Anamnese[report.anamnese_case] || 0) + 1;
            }
            if (report.arzt_arzt_case) {
                totals.counts['Arzt–Arzt']++;
                totals.cases['Arzt–Arzt'][report.arzt_arzt_case] = (totals.cases['Arzt–Arzt'][report.arzt_arzt_case] || 0) + 1;
            }
            if (report.aufklarung_case) {
                totals.counts.Aufklärung++;
                totals.cases.Aufklärung[report.aufklarung_case] = (totals.cases.Aufklärung[report.aufklarung_case] || 0) + 1;
            }
            if (report.brief_case) {
                totals.counts.Brief++;
                totals.cases.Brief[report.brief_case] = (totals.cases.Brief[report.brief_case] || 0) + 1;
            }
        });
        
        totals.reporters = totals.reporters.size;
        return totals;
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const reportData = {
            city: formData.city,
            exam_date: formData.date,
            anamnese_case: formData.anamneseOther || formData.anamnese,
            arzt_arzt_case: formData.arztOther || formData.arzt,
            aufklarung_case: formData.aufklarungOther || formData.aufklarung,
            brief_case: formData.briefOther || formData.brief,
        };
        
        // Remove empty fields
        Object.keys(reportData).forEach(key => {
            if (!reportData[key]) {
                delete reportData[key];
            }
        });
        
        try {
            await ExamReport.create(reportData);
            setConfirmationMessage(true);
            setFormData({
                city: 'Mainz',
                date: '',
                anamnese: '',
                arzt: '',
                aufklarung: '',
                brief: '',
                anamneseOther: '',
                arztOther: '',
                aufklarungOther: '',
                briefOther: ''
            });
            loadAndProcessData();
            setTimeout(() => setConfirmationMessage(false), 5000);
        } catch (error) {
            console.error("Failed to submit report:", error);
            alert("Error submitting report.");
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getCaseOptions = (stationKey) => {
        if (!globalTotals?.cases[stationKey]) return [];
        return Object.keys(globalTotals.cases[stationKey]).sort();
    };

    const renderCaseList = (cases, title) => {
        const sortedCases = Object.entries(cases || {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Top 10

        return (
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg text-blue-800">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {sortedCases.map(([caseName, count]) => (
                            <div key={caseName} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium text-gray-700">{caseName}</span>
                                <Badge variant="secondary">{count}</Badge>
                            </div>
                        ))}
                        {sortedCases.length === 0 && (
                            <p className="text-gray-500 text-sm">Keine Daten verfügbar</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const pieChartData = globalTotals ? Object.entries(globalTotals.counts).map(([name, value]) => ({ name, value })) : [];
    const monthlyChartData = Object.entries(processedData).map(([month, data]) => ({ month, ...data.counts, reporters: data.reporters }));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-2xl">
                        <h1 className="text-4xl font-bold mb-4">FaMED Medical Exam Reports Analysis</h1>
                        <p className="text-xl opacity-90">Interactive Dashboard für Prüfungsberichte</p>
                    </div>
                </div>

                <Tabs defaultValue="global" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-white/20 backdrop-blur-sm">
                        <TabsTrigger value="global" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            🌍 Global Overview
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            📊 Monthly Data
                        </TabsTrigger>
                        <TabsTrigger value="add-report" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            📝 Add Report
                        </TabsTrigger>
                    </TabsList>

                    {/* Global Overview Tab */}
                    <TabsContent value="global" className="space-y-6">
                        {globalTotals && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                                    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                            <div className="text-3xl font-bold text-blue-800">{globalTotals.reporters}</div>
                                            <div className="text-sm text-gray-600">Unique Reporters</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                            <div className="text-3xl font-bold text-green-800">{globalTotals.counts.Anamnese}</div>
                                            <div className="text-sm text-gray-600">Anamnese Cases</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                            <div className="text-3xl font-bold text-red-800">{globalTotals.counts['Arzt–Arzt']}</div>
                                            <div className="text-sm text-gray-600">Arzt–Arzt Cases</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                            <div className="text-3xl font-bold text-purple-800">{globalTotals.counts.Aufklärung}</div>
                                            <div className="text-sm text-gray-600">Aufklärung Cases</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                                            <div className="text-3xl font-bold text-orange-800">{globalTotals.counts.Brief}</div>
                                            <div className="text-sm text-gray-600">Brief Cases</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Case Distribution and Top Cases */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="bg-white/90 backdrop-blur-sm">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-700"/>Case Distribution</CardTitle></CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                        {pieChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-white/90 backdrop-blur-sm">
                                        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-700"/>Top Reported Anamnese Cases</CardTitle></CardHeader>
                                        <CardContent>
                                            {renderCaseList(globalTotals.cases.Anamnese, "")} {/* Title passed in CardHeader, so empty here */}
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Removed Arzt–Arzt, Aufklärung, Brief lists as per outline */}
                            </>
                        )}
                    </TabsContent>

                    {/* Monthly Data Tab */}
                    <TabsContent value="monthly" className="space-y-6">
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-700"/>Monthly Case Volume</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={monthlyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Anamnese" stackId="a" fill={COLORS.Anamnese} />
                                        <Bar dataKey="Arzt–Arzt" stackId="a" fill={COLORS['Arzt–Arzt']} />
                                        <Bar dataKey="Aufklärung" stackId="a" fill={COLORS.Aufklärung} />
                                        <Bar dataKey="Brief" stackId="a" fill={COLORS.Brief} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-700"/>Monthly Unique Reporters</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="reporters" stroke={COLORS.Reporters} strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Add Report Tab */}
                    <TabsContent value="add-report" className="space-y-6">
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl text-blue-800">Add Your Exam Report</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Mainz">Mainz</SelectItem>
                                                    <SelectItem value="Kassel">Kassel</SelectItem>
                                                    <SelectItem value="Nürnberg">Nürnberg</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange('date', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Cases</h3>
                                        
                                        {/* Anamnese */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Anamnese</label>
                                            <Select value={formData.anamnese} onValueChange={(value) => handleInputChange('anamnese', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a case" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={null}>Select a case</SelectItem>
                                                    {getCaseOptions('Anamnese').map(caseName => (
                                                        <SelectItem key={caseName} value={caseName}>{caseName}</SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formData.anamnese === 'other' && (
                                                <Input
                                                    className="mt-2"
                                                    placeholder="Please specify other case"
                                                    value={formData.anamneseOther}
                                                    onChange={(e) => handleInputChange('anamneseOther', e.target.value)}
                                                />
                                            )}
                                        </div>

                                        {/* Similar structure for other cases */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Arzt–Arzt</label>
                                            <Select value={formData.arzt} onValueChange={(value) => handleInputChange('arzt', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a case" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={null}>Select a case</SelectItem>
                                                    {getCaseOptions('Arzt–Arzt').map(caseName => (
                                                        <SelectItem key={caseName} value={caseName}>{caseName}</SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formData.arzt === 'other' && (
                                                <Input
                                                    className="mt-2"
                                                    placeholder="Please specify other case"
                                                    value={formData.arztOther}
                                                    onChange={(e) => handleInputChange('arztOther', e.target.value)}
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Aufklärung</label>
                                            <Select value={formData.aufklarung} onValueChange={(value) => handleInputChange('aufklarung', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a case" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={null}>Select a case</SelectItem>
                                                    {getCaseOptions('Aufklärung').map(caseName => (
                                                        <SelectItem key={caseName} value={caseName}>{caseName}</SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formData.aufklarung === 'other' && (
                                                <Input
                                                    className="mt-2"
                                                    placeholder="Please specify other case"
                                                    value={formData.aufklarungOther}
                                                    onChange={(e) => handleInputChange('aufklarungOther', e.target.value)}
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Brief</label>
                                            <Select value={formData.brief} onValueChange={(value) => handleInputChange('brief', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a case" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={null}>Select a case</SelectItem>
                                                    {getCaseOptions('Brief').map(caseName => (
                                                        <SelectItem key={caseName} value={caseName}>{caseName}</SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formData.brief === 'other' && (
                                                <Input
                                                    className="mt-2"
                                                    placeholder="Please specify other case"
                                                    value={formData.briefOther}
                                                    onChange={(e) => handleInputChange('briefOther', e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                        Submit Report
                                    </Button>
                                </form>

                                {confirmationMessage && (
                                    <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
                                        Thank you! Your report has been submitted.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ReportsPage;
