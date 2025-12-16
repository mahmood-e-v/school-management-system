"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMonthlyAttendance, getStudentAttendance } from "@/lib/actions/attendance";
import { getStudents } from "@/lib/actions/student";
import * as XLSX from "xlsx";
import { Download, Search, FileSpreadsheet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface AttendanceReportsProps {
    classes: any[];
}

export function AttendanceReports({ classes }: AttendanceReportsProps) {
    // Monthly Report State
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const [monthlyReportData, setMonthlyReportData] = useState<any[]>([]);
    const [monthlyDaysInMonth, setMonthlyDaysInMonth] = useState<number>(0);
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

    // Student Report State
    const [studentClass, setStudentClass] = useState<string>("");
    const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [studentStats, setStudentStats] = useState<any>(null);
    const [studentHistory, setStudentHistory] = useState<any[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    async function handleViewMonthlyReport() {
        if (!selectedClass) return;
        setMonthlyLoading(true);
        setMonthlyReportData([]); // Clear previous

        try {
            const res = await getMonthlyAttendance(selectedClass, parseInt(selectedMonth), parseInt(selectedYear));
            if (res.success && res.data) {
                setMonthlyReportData(res.data);
                setMonthlyDaysInMonth(res.daysInMonth);
            } else {
                setMonthlyReportData([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setMonthlyLoading(false);
        }
    }

    function handleDownloadMonthlyExcel() {
        if (!monthlyReportData.length || !selectedClass) return;

        const cls = classes.find(c => c._id === selectedClass);
        const className = cls ? `${cls.name}-${cls.division}` : "Class";
        const monthName = months[parseInt(selectedMonth)];

        // Create Excel Data
        // Headers: Sl No, Roll No, Name, 1, 2, ..., 31, Present, Absent, %
        const days = Array.from({ length: monthlyDaysInMonth }, (_, i) => i + 1);
        const headers = ["Sl No", "Roll No", "Name", ...days.map(String), "Total Present", "Total Absent", "Percentage"];

        const sheetData = monthlyReportData.map((student: any, index: number) => {
            const row: any = {
                "Sl No": index + 1,
                "Roll No": student.rollNo,
                "Name": student.name
            };
            days.forEach(day => {
                row[day] = student.dailyStatus[day] || "-";
            });
            row["Total Present"] = student.stats.present;
            row["Total Absent"] = student.stats.absent;
            row["Percentage"] = student.stats.total > 0
                ? ((student.stats.present / student.stats.total) * 100).toFixed(1) + "%"
                : "0%";
            return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sheetData, { header: headers });

        // Auto-width columns
        const wscols = [{ wch: 6 }, { wch: 10 }, { wch: 20 }, ...days.map(() => ({ wch: 3 })), { wch: 10 }, { wch: 10 }, { wch: 10 }];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${className}_${monthName}_${selectedYear}.xlsx`);
    }

    async function fetchStudentsForClass(classId: string) {
        setStudentClass(classId);
        setSelectedStudent(""); // reset
        setStudentStats(null);
        if (classId) {
            const list = await getStudents(classId);
            setStudentsInClass(list);
        } else {
            setStudentsInClass([]);
        }
    }

    async function handleStudentSelect(studentId: string) {
        setSelectedStudent(studentId);
        if (!studentId) return;

        setStudentLoading(true);
        const res = await getStudentAttendance(studentId);
        if (res.success) {
            setStudentStats(res.stats);
            setStudentHistory(res.history);
        }
        setStudentLoading(false);
    }

    function downloadStudentReport() {
        if (!selectedStudent || !studentStats) return;

        const student = studentsInClass.find(s => s._id === selectedStudent);
        const sheetData = studentHistory.map(h => ({
            "Date": format(new Date(h.date), "dd-MM-yyyy"),
            "Status": h.status,
            "Remark": h.remark
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "History");
        XLSX.writeFile(wb, `Attendance_${student.name}.xlsx`);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="monthly">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Monthly Class Report</TabsTrigger>
                        <TabsTrigger value="student">Values Individual Student Report</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly" className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select onValueChange={(val) => { setSelectedClass(val); setMonthlyReportData([]); }} value={selectedClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                {cls.name} - {cls.division}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Month</Label>
                                <Select onValueChange={(val) => { setSelectedMonth(val); setMonthlyReportData([]); }} defaultValue={selectedMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m, i) => (
                                            <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Select onValueChange={(val) => { setSelectedYear(val); setMonthlyReportData([]); }} defaultValue={selectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                variant="secondary"
                                onClick={handleViewMonthlyReport}
                                disabled={!selectedClass || monthlyLoading}
                            >
                                {monthlyLoading ? "Loading..." : <><Search className="mr-2 h-4 w-4" /> View Report</>}
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleDownloadMonthlyExcel}
                                disabled={!monthlyReportData.length}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download Excel
                            </Button>
                        </div>

                        {monthlyReportData.length > 0 && (
                            <div className="rounded-md border overflow-x-auto max-h-[500px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Sl</TableHead>
                                            <TableHead className="w-[80px]">Roll No</TableHead>
                                            <TableHead className="min-w-[150px]">Name</TableHead>
                                            {Array.from({ length: monthlyDaysInMonth }, (_, i) => i + 1).map(d => (
                                                <TableHead key={d} className="p-1 text-center w-[30px]">{d}</TableHead>
                                            ))}
                                            <TableHead className="text-center">Pres</TableHead>
                                            <TableHead className="text-center">Abs</TableHead>
                                            <TableHead className="text-center">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyReportData.map((student, index) => (
                                            <TableRow key={student.name + index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{student.rollNo}</TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{student.name}</TableCell>
                                                {Array.from({ length: monthlyDaysInMonth }, (_, i) => i + 1).map(d => (
                                                    <TableCell key={d} className="p-1 text-center text-xs">
                                                        {student.dailyStatus[d] === "P" ? (
                                                            <span className="text-green-600 font-bold">P</span>
                                                        ) : student.dailyStatus[d] === "A" ? (
                                                            <span className="text-destructive font-bold">A</span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center font-semibold text-green-700">{student.stats.present}</TableCell>
                                                <TableCell className="text-center font-semibold text-red-700">{student.stats.absent}</TableCell>
                                                <TableCell className="text-center font-bold">
                                                    {student.stats.total > 0 ? Math.round((student.stats.present / student.stats.total) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {monthlyReportData.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Daily Detailed Insights</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Label>Select Day to View Details:</Label>
                                        <Select
                                            defaultValue={String(new Date().getDate())}
                                            onValueChange={(val) => {
                                                const day = parseInt(val);
                                                // We can store state if we want to separate logic, for now render inline
                                                // Actually better to have state
                                                setSelectedDay(day);
                                            }}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue placeholder="Day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: monthlyDaysInMonth }, (_, i) => i + 1).map(d => (
                                                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="text-sm text-muted-foreground">
                                            Viewing details for {months[parseInt(selectedMonth)]} {selectedDay}, {selectedYear}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Card className="border-destructive/50 bg-destructive/10">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base text-destructive flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                                    Absentees ({(monthlyReportData.filter(s => s.dailyStatus[selectedDay] === 'A') || []).length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                {monthlyReportData.filter(s => s.dailyStatus[selectedDay] === 'A').length === 0 ? (
                                                    <p className="text-muted-foreground italic">No students marked absent.</p>
                                                ) : (
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {monthlyReportData.filter(s => s.dailyStatus[selectedDay] === 'A').map(s => (
                                                            <li key={s._id}>
                                                                <span className="font-medium">{s.name}</span> <span className="text-muted-foreground text-xs">(Roll: {s.rollNo})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base text-orange-600 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                                                    Not Marked / No Record ({(monthlyReportData.filter(s => !s.dailyStatus[selectedDay] || s.dailyStatus[selectedDay] === '-') || []).length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                {monthlyReportData.filter(s => !s.dailyStatus[selectedDay] || s.dailyStatus[selectedDay] === '-').length === 0 ? (
                                                    <p className="text-muted-foreground italic">All students marked.</p>
                                                ) : (
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {monthlyReportData.filter(s => !s.dailyStatus[selectedDay] || s.dailyStatus[selectedDay] === '-').map(s => (
                                                            <li key={s._id}>
                                                                <span className="font-medium">{s.name}</span> <span className="text-muted-foreground text-xs">(Roll: {s.rollNo})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="student" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select onValueChange={fetchStudentsForClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class First" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                {cls.name} - {cls.division}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <Select onValueChange={handleStudentSelect} disabled={!studentClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={studentClass ? "Select Student" : "Select Class First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {studentsInClass.map((s) => (
                                            <SelectItem key={s._id} value={s._id}>
                                                {s.rollNo} - {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {studentLoading && <div className="text-center py-4">Loading stats...</div>}

                        {studentStats && (
                            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-background p-3 rounded shadow-sm">
                                        <div className="text-2xl font-bold text-green-600">{studentStats.present}</div>
                                        <div className="text-xs text-muted-foreground">Present</div>
                                    </div>
                                    <div className="bg-background p-3 rounded shadow-sm">
                                        <div className="text-2xl font-bold text-destructive">{studentStats.absent}</div>
                                        <div className="text-xs text-muted-foreground">Absent</div>
                                    </div>
                                    <div className="bg-background p-3 rounded shadow-sm">
                                        <div className="text-2xl font-bold">
                                            {studentStats.total > 0 ? Math.round((studentStats.present / studentStats.total) * 100) : 0}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Attendance</div>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full" onClick={downloadStudentReport}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Download History Excel
                                </Button>

                                <div className="max-h-[200px] overflow-y-auto border rounded bg-background">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Remark</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentHistory.map((h, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-2">{format(new Date(h.date), "dd MMM yyyy")}</TableCell>
                                                    <TableCell className={`py-2 font-medium ${h.status === "Absent" ? "text-destructive" : "text-green-600"}`}>
                                                        {h.status}
                                                    </TableCell>
                                                    <TableCell className="py-2 text-muted-foreground">{h.remark}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
