import React, { useState, useEffect } from 'react';
import { User, AccessCode } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const isExpired = (user) => {
    if (!user?.plan_expiry) return false;
    return new Date(user.plan_expiry) < new Date();
};

export default function AdminPanel() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [codes, setCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [numCodes, setNumCodes] = useState(1);
    const [planType, setPlanType] = useState('paid_1m');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const currentUser = await User.me();
                if (currentUser.role !== 'admin') {
                    navigate(createPageUrl("Dashboard"));
                    return;
                }
                setUser(currentUser);
                loadData();
            } catch (error) {
                navigate(createPageUrl("Home"));
            }
        };
        checkAdmin();
    }, [navigate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const accessCodes = await AccessCode.list('-created_date');
            setCodes(accessCodes);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setIsLoading(false);
    };

    const generateAccessCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase() +
               Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const generateCodes = async () => {
        setIsGenerating(true);
        const codesToCreate = [];
        for (let i = 0; i < numCodes; i++) {
            codesToCreate.push({
                code: generateAccessCode(),
                plan: planType,
                createdBy: user.email,
                notes: notes,
            });
        }
        try {
            await AccessCode.bulkCreate(codesToCreate);
            loadData();
        } catch (error) {
            console.error("Error generating codes:", error);
            alert("Failed to generate codes.");
        }
        setIsGenerating(false);
    };

    const handleDeleteCode = async (codeId) => {
        if (window.confirm("Are you sure you want to delete this code? This cannot be undone.")) {
            try {
                await AccessCode.delete(codeId);
                loadData();
            } catch (error) {
                console.error("Error deleting code:", error);
                alert("Failed to delete code.");
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Code copied to clipboard!");
    };

    if (!user) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    const totalCodes = codes.length;
    const activeCodes = codes.filter(c => !c.redeemedByUserId).length;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(createPageUrl("Dashboard"))}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600">Manage access codes and view stats.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Codes Generated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{totalCodes}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Active (Unredeemed) Codes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{activeCodes}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Code Generation */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Generate New Access Codes</CardTitle>
                        <CardDescription>Create single or bulk codes for plan access.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="numCodes" className="text-sm font-medium">Number of Codes</label>
                            <Input
                                id="numCodes"
                                type="number"
                                value={numCodes}
                                onChange={(e) => setNumCodes(parseInt(e.target.value))}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="planType" className="text-sm font-medium">Plan Type</label>
                            <Select value={planType} onValueChange={setPlanType}>
                                <SelectTrigger id="planType" className="mt-1">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid_1m">1-Month Intensive</SelectItem>
                                    <SelectItem value="paid_3m">3-Month Prep</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
                             <Input
                                 id="notes"
                                 type="text"
                                 value={notes}
                                 onChange={(e) => setNotes(e.target.value)}
                                 placeholder="e.g., University Partner, Giveaway"
                                 className="mt-1"
                             />
                        </div>
                        <div className="md:col-span-4">
                            <Button onClick={generateCodes} disabled={isGenerating} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                {isGenerating ? `Generating ${numCodes} codes...` : `Generate ${numCodes} Code(s)`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Codes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Redeemed</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan="7" className="text-center">Loading codes...</TableCell></TableRow>
                                ) : codes.map((code) => (
                                    <TableRow key={code.id}>
                                        <TableCell className="font-mono">{code.code}</TableCell>
                                        <TableCell>
                                            <Badge variant={code.plan === 'paid_1m' ? 'default' : 'secondary'}>
                                                {code.plan === 'paid_1m' ? '1-Month' : '3-Month'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {code.redeemedByUserId ? (
                                                <Badge variant="destructive">Redeemed</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-400">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{code.notes}</TableCell>
                                        <TableCell>{format(new Date(code.created_date), 'dd MMM yyyy', { locale: de })}</TableCell>
                                        <TableCell>
                                            {code.redeemedAt ? format(new Date(code.redeemedAt), 'dd MMM yyyy', { locale: de }) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            {!code.redeemedByUserId && (
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteCode(code.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}