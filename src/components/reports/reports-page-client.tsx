"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateClassReportSafe, getExamsForClass } from "@/lib/actions/report";
import { ReportCard } from "@/components/reports/report-card";
import { BroadsheetView } from "@/components/reports/broadsheet-view";
import { Loader2, Printer, FileSpreadsheet, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage({ classes, schoolSettings }: { classes: any[], schoolSettings: any }) {
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedExam, setSelectedExam] = useState("");
    const [exams, setExams] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'sheet'

    async function handleClassChange(classId: string) {
        setSelectedClass(classId);
        setSelectedExam("");
        setReportData(null);
        // Fetch exams for this class
        const result = await getExamsForClass(classId);
        setExams(result);
    }

    async function handleGenerate() {
        if (!selectedClass || !selectedExam) return;
        setLoading(true);
        // Use the SAFE version
        const result = await generateClassReportSafe(selectedExam, selectedClass);
        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else {
            setReportData(result);
        }
    }

    function handlePrint() {
        window.print();
    }

    // School Info from Props
    const schoolInfo = schoolSettings || {
        name: "Madrasa Wadi Rahma",
        address: "Falaj Haza' Al Ain",
        logo: "https://placehold.co/80x80?text=Logo"
    };

    // Find class name for report
    const className = classes.find(c => c._id === selectedClass)?.name + " " + classes.find(c => c._id === selectedClass)?.division;

    return (
        <div className="p-6">
            <div className="mb-8 space-y-4">
                <h1 className="text-2xl font-bold print:hidden">Exam Reports</h1>

                {/* Controls */}
                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg border shadow-sm print:hidden">
                    <div className="space-y-2 w-[200px]">
                        <label className="text-sm font-medium">Select Class</label>
                        <Select onValueChange={handleClassChange} value={selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c: any) => (
                                    <SelectItem key={c._id} value={c._id}>{c.name} - {c.division}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 w-[200px]">
                        <label className="text-sm font-medium">Select Exam</label>
                        <Select onValueChange={setSelectedExam} value={selectedExam} disabled={!selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Exam" />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map((e: any) => (
                                    <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleGenerate} disabled={loading || !selectedExam}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
                    </Button>
                </div>

                {reportData && (
                    <Tabs defaultValue="cards" className="w-full" onValueChange={setViewMode}>
                        <div className="flex justify-between items-center mb-4 print:hidden">
                            <TabsList>
                                <TabsTrigger value="cards" className="flex gap-2">
                                    <FileText className="h-4 w-4" /> Report Cards
                                </TabsTrigger>
                                <TabsTrigger value="sheet" className="flex gap-2">
                                    <FileSpreadsheet className="h-4 w-4" /> Marksheet View
                                </TabsTrigger>
                            </TabsList>

                            {viewMode === "cards" && (
                                <Button variant="outline" onClick={handlePrint} size="sm">
                                    <Printer className="mr-2 h-4 w-4" /> Print All
                                </Button>
                            )}
                        </div>

                        <TabsContent value="cards">
                            <div className="print-area">
                                {reportData.reportData.map((studentReport: any) => (
                                    <ReportCard
                                        key={studentReport.student._id}
                                        data={{
                                            ...studentReport,
                                            student: { ...studentReport.student, class: className },
                                            examName: reportData.examName,
                                            academicYear: reportData.academicYear
                                        }}
                                        schoolInfo={schoolInfo}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="sheet">
                            <BroadsheetView
                                reportData={reportData.reportData}
                                examName={reportData.examName}
                                className={className}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
